const { test, expect } = require('@playwright/test');
const { runFast, runUntilPause } = require('./helpers');

// Print Output Tests - verify output appears during execution

test('print output appears during pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'print(1)\nprint(2)\npause()\nprint(3)');

  // Output should show prints before pause
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('1');
  expect(outputText).toContain('2');
});

test('print output accumulates before pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'print("first")\nprint("second")\npause()');

  // Both should be visible
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('first');
  expect(outputText).toContain('second');
});

test('print in if statement shows output when branch executes', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'if (true) { print("inside") }');

  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('inside');
});

test('print output appears with run mode', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print("fast")');

  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('fast');
});
