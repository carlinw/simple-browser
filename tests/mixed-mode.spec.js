// Test mixed text + graphics mode
const { test, expect } = require('@playwright/test');
const { runFastMixed } = require('./helpers');

test('print works alongside canvas', async ({ page }) => {
  await page.goto('/');
  await runFastMixed(page, `clear()
color("red")
rect(10, 10, 50, 50)
print("Hello from graphics mode!")`);

  // Canvas should exist
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();

  // Text area should show the printed message
  const textArea = await page.locator('#output .output-text');
  await expect(textArea).toBeVisible();
  const text = await textArea.textContent();
  expect(text).toContain('Hello from graphics mode!');
});

test('multiple prints accumulate in text area', async ({ page }) => {
  await page.goto('/');
  await runFastMixed(page, `clear()
print("Line 1")
print("Line 2")
print("Line 3")`);

  const textArea = await page.locator('#output .output-text');
  await expect(textArea).toBeVisible();
  const text = await textArea.textContent();
  expect(text).toContain('Line 1');
  expect(text).toContain('Line 2');
  expect(text).toContain('Line 3');
});

test('canvas has red pixels after print', async ({ page }) => {
  await page.goto('/');
  await runFastMixed(page, `clear()
color("red")
rect(10, 10, 50, 50)
print("test")`);

  // Canvas should still have the red rect
  const hasRed = await page.evaluate(() => {
    const canvas = document.querySelector('#output canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(30, 30, 1, 1).data;
    return pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0;
  });
  expect(hasRed).toBe(true);
});
