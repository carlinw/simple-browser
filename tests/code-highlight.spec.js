const { test, expect } = require('@playwright/test');
const { runFast, runUntilPause } = require('./helpers');

// Code Display Tests - verify source code display during execution

test('code display shows source during pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Code display should be visible during pause
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

test('code editor returns after stop', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'pause()\nlet x = 1');

  // Code display should be visible during pause
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
  await runUntilPause(page, 'let x = 1\nlet y = 2\npause()\nlet z = 3');

  // Wait for execution to start and a line to be highlighted
  await page.waitForSelector('.line-executing', { timeout: 10000 });

  // There should be exactly one highlighted line
  const highlightedLines = await page.locator('.line-executing').count();
  expect(highlightedLines).toBe(1);
});

test('line highlight moves during step execution', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'pause()\nlet x = 1\nlet y = 2\npause()');

  // First pause on line 1 - get initial line number
  await page.waitForSelector('.line-executing', { timeout: 5000 });
  const firstLine = await page.locator('.line-executing').getAttribute('data-line');
  expect(firstLine).toBe('1');

  // Click step into to advance one statement (to line 2)
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  // The highlight should now be on line 2 (let x = 1)
  const secondLine = await page.locator('.line-executing').getAttribute('data-line');
  expect(secondLine).toBe('2');

  // Click step into again to advance to line 3
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  const thirdLine = await page.locator('.line-executing').getAttribute('data-line');
  expect(thirdLine).toBe('3');
});
