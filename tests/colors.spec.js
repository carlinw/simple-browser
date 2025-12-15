// Tests for color function with all supported colors
import { test, expect } from '@playwright/test';

test.describe('color function', () => {
  test('gray color is valid', async ({ page }) => {
    await page.goto('/');
    await page.fill('#code-editor', 'color("gray")\nrect(0, 0, 10, 10)');
    await page.click('#run-btn');

    // Should not show error
    const output = await page.locator('#output').textContent();
    expect(output).not.toContain('Unknown color');
  });

  test('lime color is valid', async ({ page }) => {
    await page.goto('/');
    await page.fill('#code-editor', 'color("lime")\nrect(0, 0, 10, 10)');
    await page.click('#run-btn');

    // Should not show error
    const output = await page.locator('#output').textContent();
    expect(output).not.toContain('Unknown color');
  });
});
