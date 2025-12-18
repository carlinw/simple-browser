const { test, expect } = require('@playwright/test');
const { runFast, runUntilPause } = require('./helpers');

// Positive Tests

test('page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Tiny Development Environment');
});

test('page has code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
});

test('code editor shows line numbers', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2\nlet z = 3');

  // Line numbers should be visible
  const lineNumbers = page.locator('#line-numbers');
  await expect(lineNumbers).toBeVisible();

  // Should show 3 line numbers
  await expect(lineNumbers).toContainText('1');
  await expect(lineNumbers).toContainText('2');
  await expect(lineNumbers).toContainText('3');
});

test('code display shows line numbers when running', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\npause()\nlet y = 2');
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#debug-panel')).toBeVisible({ timeout: 5000 });

  // Line numbers should be visible in code display
  const lineNumbers = page.locator('#code-display-line-numbers');
  await expect(lineNumbers).toBeVisible();
  await expect(lineNumbers).toContainText('1');
  await expect(lineNumbers).toContainText('2');
  await expect(lineNumbers).toContainText('3');
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

// Debug Panel Tests (shows during pause)

test('debug panel shows stack frames after pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Debug stack frames should be visible
  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toBeVisible();
});

test('debug panel shows variables after pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('42');
});

test('debug panel hidden initially', async ({ page }) => {
  await page.goto('/');

  // Debug panel should be hidden before any execution
  const debugPanel = page.locator('#debug-panel');
  await expect(debugPanel).toHaveClass(/hidden/);
});

// Auto-stop Tests

test('program completes and enters done state', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await page.click('#run-btn');

  // Wait for execution to complete (run button enabled means done or edit state)
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 5000 });

  // In done state, stop button should be enabled to return to edit
  const stopBtn = page.locator('#stop-btn');
  await expect(stopBtn).not.toBeDisabled();
});

test('clicking stop after completion returns to edit mode', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await page.click('#run-btn');

  // Wait for execution to complete
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 5000 });

  // Click stop to return to edit mode
  await page.click('#stop-btn');

  // Now editor should be visible and enabled
  const editor = page.locator('#code-editor');
  await expect(editor).not.toBeDisabled();
  await expect(editor).toBeVisible();
});

// Tab Key Tests

test('tab key inserts spaces in code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await editor.focus();
  await editor.fill('if (true) {');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.type('print(1)');

  const value = await editor.inputValue();
  // Should have indentation (spaces or tab character)
  expect(value).toContain('  print(1)');
});

test('tab key does not leave textarea', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await editor.focus();
  await page.keyboard.press('Tab');

  // Editor should still be focused
  const focused = await page.evaluate(() => document.activeElement.id);
  expect(focused).toBe('code-editor');
});

// Negative Tests

test('output is empty before run', async ({ page }) => {
  await page.goto('/');
  const output = page.locator('#output');
  await expect(output).toBeEmpty();
});
