const { test, expect } = require('@playwright/test');

// Step Button Tests (statement-by-statement execution)

test('step button exists', async ({ page }) => {
  await page.goto('/');
  const stepBtn = page.locator('#step-btn');
  await expect(stepBtn).toBeVisible();
  await expect(stepBtn).toHaveText('Step');
});

test('stop button exists', async ({ page }) => {
  await page.goto('/');
  const stopBtn = page.locator('#stop-btn');
  await expect(stopBtn).toBeVisible();
  await expect(stopBtn).toHaveText('Stop');
});

test('stepping through statements shows memory updates', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2');

  // First click starts stepping
  await page.click('#step-btn');

  // Memory should show x after first statement
  await page.click('#step-btn');
  const memory1 = await page.locator('#tab-memory').textContent();
  expect(memory1).toContain('x');

  // Memory should show y after second statement
  await page.click('#step-btn');
  const memory2 = await page.locator('#tab-memory').textContent();
  expect(memory2).toContain('y');
});

test('first step shows source code in display', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 5');

  // First click initializes - code display should show the source
  await page.click('#step-btn');

  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();

  // Code display should contain the source code (not be empty)
  const displayText = await codeDisplay.textContent();
  expect(displayText).toContain('let x = 5');
});

test('stop button resets to edit mode', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await page.click('#step-btn');
  await page.click('#stop-btn');

  // Textarea should be visible and editable
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
  await expect(editor).not.toBeDisabled();
});

test('stepping completes when all statements done', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');

  // Initialize stepping
  await page.click('#step-btn');

  // Keep stepping until step button is disabled (completion)
  const stepBtn = page.locator('#step-btn');
  for (let i = 0; i < 10; i++) {
    if (await stepBtn.isDisabled()) break;
    await page.click('#step-btn');
    await page.waitForTimeout(50);
  }

  // Step button should be disabled after completion
  await expect(stepBtn).toBeDisabled();
});

test('cannot edit while stepping', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 5');
  await page.click('#step-btn');

  // Editor should be hidden
  const editor = page.locator('#code-editor');
  await expect(editor).toBeHidden();

  // Code display should be visible instead
  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();
});

test('stepping shows interpreter pane', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');

  // Before stepping, interpreter pane is hidden
  const interpreterPane = page.locator('#interpreter-pane');
  await expect(interpreterPane).toHaveClass(/interpreter-hidden/);

  // Start stepping
  await page.click('#step-btn');

  // Interpreter pane should be visible
  await expect(interpreterPane).not.toHaveClass(/interpreter-hidden/);
});

// Language Help Tests (language help shows fullscreen when tab is clicked)

test('language help tab exists in code pane', async ({ page }) => {
  await page.goto('/');
  const helpTab = page.locator('#help-tab-btn');
  await expect(helpTab).toBeVisible();
  await expect(helpTab).toHaveText('Language Help');
});

test('clicking language help tab shows help fullscreen', async ({ page }) => {
  await page.goto('/');

  // Click the help tab
  await page.click('#help-tab-btn');

  // Main content should be hidden, help should be visible
  await expect(page.locator('body')).toHaveClass(/help-active/);
  await expect(page.locator('#language-help')).toBeVisible();

  // Help iframe should contain the reference content
  const iframe = page.frameLocator('#help-iframe');
  await expect(iframe.locator('#literals')).toBeVisible();
});

test('clicking back button returns to code view', async ({ page }) => {
  await page.goto('/');

  // Open help
  await page.click('#help-tab-btn');
  await expect(page.locator('body')).toHaveClass(/help-active/);

  // Click back button in iframe
  const iframe = page.frameLocator('#help-iframe');
  await iframe.locator('#back-btn').click();

  // Should be back to normal view
  await expect(page.locator('body')).not.toHaveClass(/help-active/);
  await expect(page.locator('#code-editor')).toBeVisible();
});

test('language help shows keywords', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  expect(text).toContain('let');
  expect(text).toContain('if');
  expect(text).toContain('while');
  expect(text).toContain('print');
});

test('language help shows operators', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  expect(text).toContain('+');
  expect(text).toContain('-');
  expect(text).toContain('*');
  expect(text).toContain('/');
  expect(text).toContain('equals');
});

test('language help shows types', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  // Types are documented in the Literals section
  expect(text).toContain('integer');
  expect(text).toContain('float');
  expect(text).toContain('String');
  expect(text).toContain('Boolean');
  expect(text).toContain('Array');
  expect(text).toContain('Function');
});
