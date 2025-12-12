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

test('clicking run shows greeting', async ({ page }) => {
  await page.goto('/');
  await page.click('#run-btn');
  const outputTab = page.locator('#tab-output');
  await expect(outputTab).toContainText('Hello, Connor!');
});

test('can type in code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await editor.fill('print hello');
  await expect(editor).toHaveValue('print hello');
});

// Output Tabs Tests

test('output pane has three tabs', async ({ page }) => {
  await page.goto('/');
  const tabs = page.locator('.output-tabs .tab-btn');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveText('Tokens');
  await expect(tabs.nth(1)).toHaveText('AST');
  await expect(tabs.nth(2)).toHaveText('Output');
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

test('clicking Output tab shows output content', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Output")');

  const outputTab = page.locator('.tab-btn:has-text("Output")');
  await expect(outputTab).toHaveClass(/active/);

  const outputContent = page.locator('#tab-output');
  await expect(outputContent).toBeVisible();
});

test('tokens tab shows token list', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  // Click tokens tab to see tokens
  await page.click('.tab-btn:has-text("Tokens")');

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
  await expect(page.locator('#tab-output')).not.toBeVisible();

  // Click Tokens tab
  await page.click('.tab-btn:has-text("Tokens")');
  await expect(page.locator('#tab-tokens')).toBeVisible();
  await expect(page.locator('#tab-ast')).not.toBeVisible();
  await expect(page.locator('#tab-output')).not.toBeVisible();

  // Click Output tab
  await page.click('.tab-btn:has-text("Output")');
  await expect(page.locator('#tab-tokens')).not.toBeVisible();
  await expect(page.locator('#tab-ast')).not.toBeVisible();
  await expect(page.locator('#tab-output')).toBeVisible();
});

// Negative Tests

test('output is empty before run', async ({ page }) => {
  await page.goto('/');
  const tokensTab = page.locator('#tab-tokens');
  await expect(tokensTab).toBeEmpty();
});
