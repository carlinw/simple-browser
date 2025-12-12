const { test, expect } = require('@playwright/test');
const { runFast, runFastGraphics } = require('./helpers');

// Graphics Tests

test('clear creates canvas', async ({ page }) => {
  await page.goto('/');
  await runFastGraphics(page, 'clear()');

  // Canvas element should exist in output
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();
});

test('rect draws on canvas', async ({ page }) => {
  await page.goto('/');
  await runFastGraphics(page, 'color("red")\nrect(10, 10, 50, 50)');

  // Canvas element should exist
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();

  // Check that canvas has red pixels by sampling
  const hasRed = await page.evaluate(() => {
    const canvas = document.querySelector('#output canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(30, 30, 1, 1).data;
    // Check for red (RGB: 255, 0, 0)
    return pixel[0] === 255 && pixel[1] === 0 && pixel[2] === 0;
  });
  expect(hasRed).toBe(true);
});

test('circle draws on canvas', async ({ page }) => {
  await page.goto('/');
  await runFastGraphics(page, 'color("blue")\ncircle(100, 100, 25)');

  // Canvas element should exist
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();

  // Check that canvas has blue pixels at center
  const hasBlue = await page.evaluate(() => {
    const canvas = document.querySelector('#output canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(100, 100, 1, 1).data;
    // Check for blue (RGB: 0, 0, 255)
    return pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 255;
  });
  expect(hasBlue).toBe(true);
});

test('line draws on canvas', async ({ page }) => {
  await page.goto('/');
  await runFastGraphics(page, 'color("white")\nline(0, 0, 100, 100)');

  // Canvas element should exist
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();

  // Check that canvas has white pixels along diagonal
  const hasWhite = await page.evaluate(() => {
    const canvas = document.querySelector('#output canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    // Sample a point roughly along the diagonal
    const pixel = ctx.getImageData(50, 50, 1, 1).data;
    // Check for white (RGB: 255, 255, 255) - allow some tolerance
    return pixel[0] > 200 && pixel[1] > 200 && pixel[2] > 200;
  });
  expect(hasWhite).toBe(true);
});

test('color changes drawing color', async ({ page }) => {
  await page.goto('/');
  await runFastGraphics(page, 'color("green")\nrect(0, 0, 10, 10)\ncolor("yellow")\nrect(20, 0, 10, 10)');

  // Canvas element should exist
  const canvas = await page.locator('#output canvas');
  await expect(canvas).toBeVisible();

  // Check for both colors
  const colors = await page.evaluate(() => {
    const canvas = document.querySelector('#output canvas');
    if (!canvas) return { green: false, yellow: false };
    const ctx = canvas.getContext('2d');

    // Sample green rectangle
    const greenPixel = ctx.getImageData(5, 5, 1, 1).data;
    const hasGreen = greenPixel[0] === 0 && greenPixel[1] === 255 && greenPixel[2] === 0;

    // Sample yellow rectangle
    const yellowPixel = ctx.getImageData(25, 5, 1, 1).data;
    const hasYellow = yellowPixel[0] === 255 && yellowPixel[1] === 255 && yellowPixel[2] === 0;

    return { green: hasGreen, yellow: hasYellow };
  });

  expect(colors.green).toBe(true);
  expect(colors.yellow).toBe(true);
});

test('invalid color throws error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'color("rainbow")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Unknown color');
});
