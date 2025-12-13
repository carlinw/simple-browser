const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// String Indexing Tests

test('string index returns character', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hello"\nprint(s[0])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('h');
});

test('string last character', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hello"\nprint(s[4])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('o');
});

test('string index out of bounds', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hi"\nprint(s[5])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('string index negative', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hi"\nprint(s[-1])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('string index with expression', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "abc"\nlet i = 1\nprint(s[i])');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('b');
});

test('string index in loop', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "ab"\nlet i = 0\nwhile (i < s.length()) {\nprint(s[i])\ni = i + 1\n}');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('a');
  expect(output).toContain('b');
});
