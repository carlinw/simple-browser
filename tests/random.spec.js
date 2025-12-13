const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// random() Tests

test('random returns integer in range', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let r = random(1, 10)\nprint(r >= 1 and r <= 10)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('random(0, 0) returns 0', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(random(0, 0))');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0');
});

test('random(5, 5) returns 5', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(random(5, 5))');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('random requires two arguments', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(random(5))');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires 2 arguments');
});

test('random requires integers', async ({ page }) => {
  await page.goto('/');
  // Use float literal to test non-integer rejection
  await runFast(page, 'print(random(1.5, 3))');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires integer');
});

test('random min must be <= max', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(random(10, 5))');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('min must be <= max');
});
