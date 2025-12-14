const { test, expect } = require('@playwright/test');

// Test line count label in code editor

test('line count label is visible', async ({ page }) => {
  await page.goto('/');
  const label = page.locator('#line-count');
  await expect(label).toBeVisible();
});

test('line count shows 0 lines for empty editor', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '');
  const label = page.locator('#line-count');
  await expect(label).toHaveText('0 lines of code');
});

test('line count shows 1 line for single line', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print("hello")');
  const label = page.locator('#line-count');
  await expect(label).toHaveText('1 line of code');
});

test('line count shows correct count for multiple lines', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2\nprint(x + y)');
  const label = page.locator('#line-count');
  await expect(label).toHaveText('3 lines of code');
});

test('line count updates when typing', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');
  await expect(page.locator('#line-count')).toHaveText('1 line of code');

  // Add more lines
  await page.fill('#code-editor', 'let x = 1\nlet y = 2');
  await expect(page.locator('#line-count')).toHaveText('2 lines of code');
});

test('line count updates when loading example', async ({ page }) => {
  await page.goto('/');

  // Load an example
  await page.click('#example-btn');
  await page.click('.example-card[data-id="variables"]');

  // Should have more than 0 lines
  const label = page.locator('#line-count');
  const text = await label.textContent();
  expect(text).toMatch(/\d+ lines? of code/);
  expect(text).not.toBe('0 lines of code');
});

test('line count is positioned in upper right of code pane', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1');

  const label = page.locator('#line-count');
  const paneHeader = page.locator('#code-pane .pane-header');

  // Label should be within the pane header area
  const labelBox = await label.boundingBox();
  const headerBox = await paneHeader.boundingBox();

  // Label should be on the right side
  expect(labelBox.x + labelBox.width).toBeGreaterThan(headerBox.x + headerBox.width / 2);
});
