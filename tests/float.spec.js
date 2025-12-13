const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// Float Literal Tests

test('float literal prints correctly', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(3.14)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3.14');
});

test('float arithmetic', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(1.5 + 2.5)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('4');
});

test('float multiplication', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(2.5 * 2)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('float in variable', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let pi = 3.14159\nprint(pi)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3.14159');
});

test('float comparison', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(1.5 < 2.5)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('zero point five', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(0.5)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0.5');
});
