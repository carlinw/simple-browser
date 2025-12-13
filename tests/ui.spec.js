const { test, expect } = require('@playwright/test');

// Positive Tests

test('page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Simple Interpreter');
});

test('page has code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
});

test('page has output pane', async ({ page }) => {
  await page.goto('/');
  const outputPane = page.locator('#output-pane');
  await expect(outputPane).toBeVisible();
});

test('page has run button', async ({ page }) => {
  await page.goto('/');
  const runBtn = page.locator('#run-btn');
  await expect(runBtn).toBeVisible();
  await expect(runBtn).toHaveText('Run');
});

test('clicking run with empty program shows error', async ({ page }) => {
  await page.goto('/');
  await page.click('#run-btn');
  const output = page.locator('#output');
  await expect(output).toContainText('No program');
});

test('can type in code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await editor.fill('print hello');
  await expect(editor).toHaveValue('print hello');
});

// Interpreter Tabs Tests (3 tabs)

test('interpreter pane has three tabs', async ({ page }) => {
  await page.goto('/');
  const tabs = page.locator('.interpreter-tabs .tab-btn');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveText('Parser');
  await expect(tabs.nth(1)).toHaveText('AST');
  await expect(tabs.nth(2)).toHaveText('Memory');
});

test('parser tab shows character and line count', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Parser")');
  const parserContent = page.locator('#tab-tokens');
  const text = await parserContent.textContent();

  // Should show character count
  expect(text).toMatch(/Characters:\s*\d+/);
  // Should show line count
  expect(text).toMatch(/Lines:\s*\d+/);
});

test('parser tab shows token count', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Parser")');
  const parserContent = page.locator('#tab-tokens');
  const text = await parserContent.textContent();

  // Should show token count
  expect(text).toMatch(/Tokens:\s*\d+/);
});

test('parser tab shows column labels', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Parser")');
  const parserContent = page.locator('#tab-tokens');
  const text = await parserContent.textContent();

  // Should show column headers (Token is the leftmost)
  expect(text).toContain('Token');
  expect(text).toContain('Line');
  expect(text).toContain('Col');
  expect(text).toContain('Type');
  expect(text).toContain('Value');
});

test('parser tab shows token numbers starting from 1', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Parser")');
  const parserContent = page.locator('#tab-tokens');
  const text = await parserContent.textContent();

  // Token numbers should appear (1, 2, 3, 4 for let, x, =, 42)
  // Check that we see sequential token numbers
  expect(text).toMatch(/1\s+1\s+1\s+KEYWORD/);  // Token 1 at line 1, col 1
});

test('AST tab is active after parse', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  const astTab = page.locator('.tab-btn:has-text("AST")');
  await expect(astTab).toHaveClass(/active/);
});

test('clicking AST tab shows AST content', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  // Parse already shows AST tab, verify it's there
  const astTab = page.locator('.tab-btn:has-text("AST")');
  await expect(astTab).toHaveClass(/active/);

  const astContent = page.locator('#tab-ast');
  await expect(astContent).toBeVisible();
  await expect(astContent.locator('.ast-tree')).toBeVisible();
});

test('clicking Memory tab shows memory content', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryTab = page.locator('.tab-btn:has-text("Memory")');
  await expect(memoryTab).toHaveClass(/active/);

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toBeVisible();
});

test('tokens tab shows token list', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  // Click tokens tab to see tokens
  await page.click('.tab-btn:has-text("Parser")');

  const tokensContent = page.locator('#tab-tokens');
  await expect(tokensContent).toBeVisible();
  const text = await tokensContent.textContent();
  expect(text).toContain('KEYWORD');
  expect(text).toContain('let');
});

test('tabs switch content visibility', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  // AST visible by default after parse
  await expect(page.locator('#tab-tokens')).not.toBeVisible();
  await expect(page.locator('#tab-ast')).toBeVisible();
  await expect(page.locator('#tab-memory')).not.toBeVisible();

  // Click Parser tab
  await page.click('.tab-btn:has-text("Parser")');
  await expect(page.locator('#tab-tokens')).toBeVisible();
  await expect(page.locator('#tab-ast')).not.toBeVisible();
  await expect(page.locator('#tab-memory')).not.toBeVisible();

  // Click Memory tab
  await page.click('.tab-btn:has-text("Memory")');
  await expect(page.locator('#tab-tokens')).not.toBeVisible();
  await expect(page.locator('#tab-ast')).not.toBeVisible();
  await expect(page.locator('#tab-memory')).toBeVisible();
});

// Negative Tests

test('output is empty before run', async ({ page }) => {
  await page.goto('/');
  const tokensTab = page.locator('#tab-tokens');
  await expect(tokensTab).toBeEmpty();
});
