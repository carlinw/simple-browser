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

// num() Tests

test('num converts string to integer', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print num("42")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('42');
});

test('num converts string to decimal', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print num("3.14")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3.14');
});

test('num passes through numbers', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print num(99)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('99');
});

test('num with invalid string errors', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print num("hello")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Cannot convert');
});

test('num used in arithmetic', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = num("5")\nprint x + 10');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('15');
});
