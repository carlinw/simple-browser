const { test, expect } = require('@playwright/test');

// Stepping Tests

test('step button exists', async ({ page }) => {
  await page.goto('/');
  const stepBtn = page.locator('#step-btn');
  await expect(stepBtn).toBeVisible();
  await expect(stepBtn).toHaveText('Step');
});

test('reset button exists', async ({ page }) => {
  await page.goto('/');
  const resetBtn = page.locator('#reset-btn');
  await expect(resetBtn).toBeVisible();
  await expect(resetBtn).toHaveText('Reset');
});

test('stepping creates one token at a time', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // First click initializes stepping
  await page.click('#step-btn');
  let output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('Scanner State');
  expect(output).toContain('(none yet)');

  // Step through 'l', 'e', 't' (3 chars) then space triggers emit
  await page.click('#step-btn'); // l
  await page.click('#step-btn'); // e
  await page.click('#step-btn'); // t
  await page.click('#step-btn'); // space - emits KEYWORD

  output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('KEYWORD');
  expect(output).toContain('let');
  expect(output).not.toContain('IDENTIFIER');

  // Step through space (whitespace token) and then x
  await page.click('#step-btn'); // x - emits WHITESPACE, starts identifier

  output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('WHITESPACE');

  // x is now in buffer, step to EOF to emit IDENTIFIER
  await page.click('#step-btn'); // EOF - emits IDENTIFIER
  await page.click('#step-btn'); // Process EOF token

  output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('IDENTIFIER');
});

test('scanner state shows line and column on separate rows', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // Initialize and step once
  await page.click('#step-btn');
  await page.click('#step-btn');

  const output = await page.locator('#tab-tokens').textContent();

  // Line and Column should be on separate rows
  expect(output).toContain('Line:');
  expect(output).toContain('Column:');
  // Should NOT have them combined
  expect(output).not.toContain('Line 1, Column');
});

test('first step shows source code in display', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // First click initializes - code display should show the source
  await page.click('#step-btn');

  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();

  // Code display should contain the source code (not be empty)
  const displayText = await codeDisplay.textContent();
  expect(displayText).toContain('let x');
});

test('stepping highlights current character in source', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // First click initializes
  await page.click('#step-btn');

  // Code display should be visible
  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();

  // Second click processes first character
  await page.click('#step-btn');

  // Should have the cursor highlight on current character
  const cursor = page.locator('.code-cursor');
  await expect(cursor).toBeVisible();
  await expect(cursor).toHaveText('l');
});

test('run button stays enabled during stepping', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');
  await page.click('#step-btn');

  // Run should still be enabled so user can tokenize everything at once
  const runBtn = page.locator('#run-btn');
  await expect(runBtn).not.toBeDisabled();
});

test('clicking run during stepping shows all tokens', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // Start stepping
  await page.click('#step-btn');
  await page.click('#step-btn');

  // Now click Run to see all tokens at once
  await page.click('#run-btn');

  const output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('KEYWORD');
  expect(output).toContain('let');
  expect(output).toContain('IDENTIFIER');
  expect(output).toContain('x');
  expect(output).toContain('EOF');
});

test('reset clears tokens and returns to edit mode', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');
  await page.click('#step-btn');
  await page.click('#reset-btn');

  // Output should be cleared
  const output = page.locator('#tab-tokens');
  await expect(output).toBeEmpty();

  // Textarea should be visible and editable
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
  await expect(editor).not.toBeDisabled();
});

test('stepping through all tokens reaches EOF', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '42');

  // Initialize stepping
  await page.click('#step-btn');

  // Step through '4', '2', then EOF emits NUMBER and then EOF
  await page.click('#step-btn'); // 4
  await page.click('#step-btn'); // 2
  await page.click('#step-btn'); // EOF - emits NUMBER

  let output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('NUMBER');

  // Step again for EOF token
  await page.click('#step-btn');
  output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('EOF');

  // Step button should be disabled after EOF
  const stepBtn = page.locator('#step-btn');
  await expect(stepBtn).toBeDisabled();
});

test('run still works for full tokenization', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#run-btn');

  const output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('KEYWORD');
  expect(output).toContain('let');
  expect(output).toContain('IDENTIFIER');
  expect(output).toContain('x');
  expect(output).toContain('OPERATOR');
  expect(output).toContain('NUMBER');
  expect(output).toContain('42');
  expect(output).toContain('EOF');
});

test('highlight moves with each step', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'ab');

  // Initialize
  await page.click('#step-btn');

  // Step 1 - 'a' highlighted
  await page.click('#step-btn');
  let cursor = await page.locator('.code-cursor').textContent();
  expect(cursor).toBe('a');

  // Step 2 - 'b' highlighted
  await page.click('#step-btn');
  cursor = await page.locator('.code-cursor').textContent();
  expect(cursor).toBe('b');
});

test('arrow indicates newly emitted token', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');

  // Initialize and step through 'let' + space to emit first token
  await page.click('#step-btn'); // init
  await page.click('#step-btn'); // l
  await page.click('#step-btn'); // e
  await page.click('#step-btn'); // t
  await page.click('#step-btn'); // space - emits KEYWORD

  const output = await page.locator('#tab-tokens').textContent();
  expect(output).toContain('→');
  expect(output).toContain('KEYWORD');
});

// Help Panel Tests

test('language syntax button exists in toolbar', async ({ page }) => {
  await page.goto('/');
  const helpBtn = page.locator('#help-btn');
  await expect(helpBtn).toBeVisible();
  await expect(helpBtn).toHaveText('Language Syntax');
});

test('clicking help opens reference panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-btn');

  const modal = page.locator('.modal-panel');
  await expect(modal).toBeVisible();

  const heading = page.locator('.modal-header h2');
  await expect(heading).toHaveText('Language Reference');
});

test('reference panel shows keywords', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-btn');

  const modal = page.locator('.modal-body');
  const text = await modal.textContent();
  expect(text).toContain('let');
  expect(text).toContain('if');
  expect(text).toContain('while');
  expect(text).toContain('print');
  expect(text).toContain('stop');
});

test('reference panel shows operators', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-btn');

  const modal = page.locator('.modal-body');
  const text = await modal.textContent();
  expect(text).toContain('+');
  expect(text).toContain('-');
  expect(text).toContain('*');
  expect(text).toContain('/');
  expect(text).toContain('==');
});

test('reference panel shows examples', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-btn');

  const examples = page.locator('.ref-examples');
  const text = await examples.textContent();
  expect(text).toContain('let x = 42');
});

test('close button closes reference panel', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-btn');

  // Modal is visible
  const modal = page.locator('.modal-panel');
  await expect(modal).toBeVisible();

  // Click close
  await page.click('.modal-close');

  // Modal should be gone
  await expect(modal).not.toBeVisible();
});

// Example Program Tests

test('examples button exists', async ({ page }) => {
  await page.goto('/');
  const exampleBtn = page.locator('#example-btn');
  await expect(exampleBtn).toBeVisible();
  await expect(exampleBtn).toHaveText('Examples');
});

test('clicking examples shows modal with options', async ({ page }) => {
  await page.goto('/');
  await page.click('#example-btn');

  // Modal should appear with example cards
  const modal = page.locator('.modal-panel');
  await expect(modal).toBeVisible();

  // Should have multiple example cards
  const cards = page.locator('.example-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // Should have Tokenizer Demo and Variables
  await expect(page.locator('.example-name:has-text("Tokenizer Demo")')).toBeVisible();
  await expect(page.locator('.example-name:has-text("Variables")')).toBeVisible();
});

test('selecting example loads code', async ({ page }) => {
  await page.goto('/');
  await page.click('#example-btn');

  // Click the Tokenizer Demo card
  await page.click('.example-card[data-id="tokenizer-demo"]');

  const editor = page.locator('#code-editor');
  const value = await editor.inputValue();
  expect(value).toContain('Tokenizer Demo');
  expect(value).toContain('let message');
  expect(value).toContain('Hello, Connor!');
});

test('can step through example program', async ({ page }) => {
  await page.goto('/');
  await page.click('#example-btn');
  await page.click('.example-card[data-id="tokenizer-demo"]');

  // Step through character by character
  // Example starts with "// Tokenizer Demo" (comment)
  // Need many steps to get through comment and see tokens
  for (let i = 0; i < 30; i++) {
    await page.click('#step-btn');
  }

  const output = await page.locator('#tab-tokens').textContent();
  // Should have processed at least the first comment
  expect(output).toContain('COMMENT');
});

// Negative Tests

test('cannot edit while stepping', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');
  await page.click('#step-btn');

  // Editor should be hidden
  const editor = page.locator('#code-editor');
  await expect(editor).toBeHidden();

  // Code display should be visible instead
  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();
});
