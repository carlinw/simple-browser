const { test, expect } = require('@playwright/test');

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

// Memory Pane Tests (no more tabs - just Memory)

test('interpreter pane shows memory after debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#debug-btn');
  // Wait for execution to complete
  await page.waitForFunction(() => {
    const stopBtn = document.getElementById('stop-btn');
    return stopBtn && !stopBtn.disabled;
  }, { timeout: 30000 });

  // Memory pane should be visible
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toBeVisible();
});

test('memory shows variables after debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#debug-btn');
  // Wait for execution to complete (done state: run button enabled)
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 30000 });

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});

test('interpreter pane hidden initially', async ({ page }) => {
  await page.goto('/');

  // Interpreter pane should be hidden before any execution
  const interpreterPane = page.locator('#interpreter-pane');
  await expect(interpreterPane).toHaveClass(/interpreter-hidden/);
});

test('interpreter pane visible during debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#debug-btn');

  // Wait a moment for execution to start
  await page.waitForTimeout(500);

  // Interpreter pane should be visible during execution
  const interpreterPane = page.locator('#interpreter-pane');
  await expect(interpreterPane).not.toHaveClass(/interpreter-hidden/);
});

test('interpreter pane hidden during run', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(42)');
  await page.click('#run-btn');

  // Wait for completion
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('42');
  }, { timeout: 5000 });

  // Interpreter pane should remain hidden
  const interpreterPane = page.locator('#interpreter-pane');
  await expect(interpreterPane).toHaveClass(/interpreter-hidden/);
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
