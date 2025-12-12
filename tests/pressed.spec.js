const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// pressed() Tests

test('pressed returns false when key not pressed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print pressed("left")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

test('pressed returns true when key is held', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print pressed("a")');

  // Blur the editor so key presses don't type into it
  await page.evaluate(() => {
    document.getElementById('code-editor').blur();
  });

  // Hold the 'a' key down before running
  await page.keyboard.down('a');

  await page.click('#run-fast-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });

  await page.keyboard.up('a');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('pressed requires string argument', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print pressed(123)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires a string');
});
