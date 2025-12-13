// Test that key() preserves canvas
const { test, expect } = require('@playwright/test');

test('key() preserves canvas that was created before it', async ({ page }) => {
  await page.goto('/');

  // Program that draws, then waits for key
  await page.fill('#code-editor', 'clear()\nrect(10, 10, 50, 50)\nkey()');
  await page.click('button:has-text("Run Fast")');

  // Wait a moment for execution to start
  await page.waitForTimeout(200);

  // Canvas should exist while waiting for key
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();
});
