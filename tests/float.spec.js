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

// Float Literal Tests

test('float literal prints correctly', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 3.14');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3.14');
});

test('float arithmetic', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 1.5 + 2.5');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('4');
});

test('float multiplication', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 2.5 * 2');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('float in variable', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let pi = 3.14159\nprint pi');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3.14159');
});

test('float comparison', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 1.5 < 2.5');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('zero point five', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 0.5');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('0.5');
});
