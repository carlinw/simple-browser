// Test .length() method on arrays and strings
const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// Array .length() tests
test('array.length() returns array length', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [1, 2, 3]\nprint(arr.length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
});

test('empty array.length() returns 0', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = []\nprint(arr.length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0');
});

test('array.length() works in expressions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let arr = [10, 20, 30]\nprint(arr[arr.length() - 1])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('30');
});

// String .length() tests
test('string.length() returns string length', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print("hello".length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('string variable.length() works', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "world"\nprint(s.length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('empty string.length() returns 0', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print("".length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0');
});

// Loop usage
test('array.length() in while loop condition', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let arr = [1, 2, 3]
let sum = 0
let i = 0
while (i < arr.length()) {
  sum = sum + arr[i]
  i = i + 1
}
print(sum)`);

  const output = await page.locator('#output').textContent();
  expect(output).toContain('6');
});

test('string.length() in while loop condition', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let s = "ab"
let i = 0
while (i < s.length()) {
  print(s[i])
  i = i + 1
}`);

  const output = await page.locator('#output').textContent();
  expect(output).toContain('a');
  expect(output).toContain('b');
});

// Error case
test('.length() on non-array/string shows error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42\nprint(x.length())');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Error');
});
