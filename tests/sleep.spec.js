const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// sleep() Tests

test('sleep pauses execution', async ({ page }) => {
  await page.goto('/');

  // Run code that prints before and after a short sleep
  const startTime = Date.now();
  await runFast(page, 'print "start"\nsleep(100)\nprint "end"');
  const elapsed = Date.now() - startTime;

  const output = await page.locator('#output').textContent();
  expect(output).toContain('start');
  expect(output).toContain('end');
  // Should have taken at least 100ms
  expect(elapsed).toBeGreaterThanOrEqual(90);
});

test('sleep requires positive number', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'sleep(-100)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('positive number');
});

test('sleep requires number', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'sleep("fast")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires a positive number');
});
