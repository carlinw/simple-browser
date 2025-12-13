// Test that arrays can grow by assignment
const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

test('array can grow by assigning to new index', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let arr = []
arr[0] = 10
arr[1] = 20
arr[2] = 30
print(arr.length())
print(arr[0])
print(arr[1])
print(arr[2])`);

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
  expect(output).toContain('10');
  expect(output).toContain('20');
  expect(output).toContain('30');
});

test('array growth fills gaps with null', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let arr = []
arr[2] = 99
print(arr.length())
print(arr[0])
print(arr[1])
print(arr[2])`);

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
  expect(output).toContain('null');
  expect(output).toContain('99');
});

test('existing array can grow', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let arr = [1, 2, 3]
arr[3] = 4
arr[4] = 5
print(arr.length())`);

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});
