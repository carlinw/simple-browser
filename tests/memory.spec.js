const { test, expect } = require('@playwright/test');
const { runUntilPause } = require('./helpers');

// Memory Display Tests - stack frames visible when paused

test('debug panel is visible after pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Debug stack frames should be visible
  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toBeVisible();
});

test('memory shows legend after pause', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Memory should show the legend with type colors
  const legend = page.locator('.memory-legend');
  await expect(legend).toBeVisible();
});

test('memory shows variables when paused', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Should show variables
  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('42');
});

// Variable Display Tests

test('variables appear after let statement', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('42');
});

test('multiple variables displayed', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let a = 1\nlet b = 2\nlet c = 3\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('a');
  await expect(stackFrames).toContainText('b');
  await expect(stackFrames).toContainText('c');
  await expect(stackFrames).toContainText('1');
  await expect(stackFrames).toContainText('2');
  await expect(stackFrames).toContainText('3');
});

test('variable values update on assignment', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 1\nx = 2\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('2');
  // Should not show old value
  const text = await stackFrames.textContent();
  // x should show 2, not 1 (there's only one x)
  const xCount = (text.match(/\bx\b/g) || []).length;
  expect(xCount).toBe(1);
});

// Type Display Tests

test('integer type displayed', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let n = 42\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('int');
});

test('float type displayed', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let f = 3.14\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('float');
});

test('string type displayed', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let s = "hello"\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('str');
  await expect(stackFrames).toContainText('"hello"');
});

test('boolean type displayed', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let b = true\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('bool');
  await expect(stackFrames).toContainText('true');
});

test('type changes when variable reassigned', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\nx = "hello"\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  // After reassignment, type should be str
  await expect(stackFrames).toContainText('str');
  await expect(stackFrames).toContainText('"hello"');
});

// Integration Tests

test('memory cleared on reset', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  await expect(page.locator('#debug-stack-frames')).toContainText('x');

  await page.click('#stop-btn');

  // Debug panel should be hidden
  const debugPanel = page.locator('#debug-panel');
  await expect(debugPanel).toHaveClass(/hidden/);
});

test('memory legend shows type colors', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Legend should have Integer, Float, String, Boolean
  const legend = page.locator('.memory-legend');
  await expect(legend).toContainText('Integer');
  await expect(legend).toContainText('Float');
  await expect(legend).toContainText('String');
  await expect(legend).toContainText('Boolean');
});

test('variables from expression are in memory', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 10\nlet y = 20\nlet sum = x + y\npause()');

  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('y');
  await expect(stackFrames).toContainText('sum');
  await expect(stackFrames).toContainText('30');
});

test('output pane shows program results', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\nprint(x + 1)\npause()');

  // Output should be in output pane
  const output = page.locator('#output');
  await expect(output).toContainText('43');

  // Memory should show x
  const stackFrames = page.locator('#debug-stack-frames');
  await expect(stackFrames).toContainText('x');
  await expect(stackFrames).toContainText('42');
});
