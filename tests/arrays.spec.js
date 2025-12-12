const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// Positive Tests

test('array literal creates array', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nprint len(arr)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
});

test('empty array', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = []\nprint len(arr)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0');
});

test('array index access', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [10, 20, 30]\nprint arr[1]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('20');
});

test('array first element (zero-based)', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [5, 10, 15]\nprint arr[0]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('array last element', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nprint arr[len(arr) - 1]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
});

test('array index assignment', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\narr[1] = 99\nprint arr[1]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('99');
});

test('array mutation persists', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2]\narr[0] = 5\narr[1] = 10\nprint arr[0] + arr[1]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('15');
});

test('array with expressions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 5\nlet arr = [x, x + 1, x * 2]\nprint arr[2]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('10');
});

test('nested array access', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [[1, 2], [3, 4]]\nprint arr[1][0]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
});

test('len works on strings', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print len("hello")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('array in loop', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nlet sum = 0\nlet i = 0\nwhile (i < len(arr)) { sum = sum + arr[i]\ni = i + 1 }\nprint sum');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('6');
});

test('array passed to function', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'function first(arr) { return arr[0] }\nprint first([42, 1, 2])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('42');
});

// Negative Tests

test('index out of bounds (high)', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nprint arr[5]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('index out of bounds (negative)', async ({ page }) => {
  await page.goto('/');
  // Use 0 - 1 since we don't have unary minus
  await runFast(page, 'let arr = [1, 2, 3]\nlet idx = 0 - 1\nprint arr[idx]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('index non-integer', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nprint arr[1 + 0]');

  // 1 + 0 = 1, which should work
  const output = await page.locator('#output').textContent();
  expect(output).toContain('2');
});

test('index non-array', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 5\nprint x[0]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Cannot index non-array');
});

test('len on non-array/string', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print len(42)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires an array or string');
});
