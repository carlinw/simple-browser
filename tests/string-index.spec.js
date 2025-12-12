const { test, expect } = require('@playwright/test');

// Helper to run code with Run Fast and get output
async function runFast(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  // Wait for output to have content
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });
}

// String Indexing Tests

test('string index returns character', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hello"\nprint s[0]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('h');
});

test('string last character', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hello"\nprint s[4]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('o');
});

test('string index out of bounds', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hi"\nprint s[5]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('string index negative', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hi"\nprint s[-1]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('out of bounds');
});

test('string index with expression', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "abc"\nlet i = 1\nprint s[i]');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('b');
});

test('string index in loop', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "ab"\nlet i = 0\nwhile (i < len(s)) {\nprint s[i]\ni = i + 1\n}');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('a');
  expect(output).toContain('b');
});
