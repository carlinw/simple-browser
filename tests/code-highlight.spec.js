const { test, expect } = require('@playwright/test');

// Code Display Tests - verify source code display during execution

test('code display shows source during debug execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#debug-btn');

  // Code display should be visible during execution
  await expect(page.locator('#code-display')).toBeVisible({ timeout: 3000 });

  // Code editor should be hidden
  await expect(page.locator('#code-editor')).toBeHidden();

  // Code display should contain the source
  const displayText = await page.locator('#code-display').textContent();
  expect(displayText).toContain('let x = 42');
});

test('code display shows source during run execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(42)');
  await page.click('#run-btn');

  // Wait for output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('42');
  }, { timeout: 5000 });

  // Code display should have shown during execution (now done, but still visible)
  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();

  // Code display should contain the source
  const displayText = await codeDisplay.textContent();
  expect(displayText).toContain('print(42)');
});

test('code display shows source during step execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await page.click('#step-btn');

  // Code display should be visible during stepping
  await expect(page.locator('#code-display')).toBeVisible({ timeout: 3000 });

  // Code editor should be hidden
  await expect(page.locator('#code-editor')).toBeHidden();

  // Code display should contain the source
  const displayText = await page.locator('#code-display').textContent();
  expect(displayText).toContain('let x = 1');
});

test('code editor returns after stop', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await page.click('#step-btn');

  // Code display should be visible during stepping
  await expect(page.locator('#code-display')).toBeVisible();

  // Click stop to reset
  await page.click('#stop-btn');

  // Code editor should be visible again
  await expect(page.locator('#code-editor')).toBeVisible();
  await expect(page.locator('#code-display')).toBeHidden();
});

test('code editor returns after execution completes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)');
  await page.click('#run-btn');

  // Wait for execution to complete
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('1');
  }, { timeout: 5000 });

  // Code display should still be visible after completion (in done state)
  await expect(page.locator('#code-display')).toBeVisible();

  // Click stop to return to edit mode
  await page.click('#stop-btn');

  // Code editor should be visible again
  await expect(page.locator('#code-editor')).toBeVisible();
});

test('current line is highlighted during debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2\nlet z = 3');
  await page.click('#debug-btn');

  // Wait for execution to start and a line to be highlighted
  await page.waitForSelector('.line-executing', { timeout: 10000 });

  // There should be exactly one highlighted line
  const highlightedLines = await page.locator('.line-executing').count();
  expect(highlightedLines).toBe(1);
});

test('line highlight moves during step execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2');
  await page.click('#step-btn');

  // First step - should highlight first line
  await page.waitForSelector('.line-executing', { timeout: 5000 });
  let highlighted = await page.locator('.line-executing').textContent();
  expect(highlighted).toContain('let x = 1');

  // Click step again
  await page.click('#step-btn');

  // Wait for the highlight to move to the second line
  await page.waitForFunction(() => {
    const line = document.querySelector('.line-executing');
    return line && line.textContent.includes('let y = 2');
  }, { timeout: 5000 });

  highlighted = await page.locator('.line-executing').textContent();
  expect(highlighted).toContain('let y = 2');
});
