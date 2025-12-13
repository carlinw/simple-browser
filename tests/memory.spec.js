const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// UI Tests

test('memory tab exists', async ({ page }) => {
  await page.goto('/');
  const memoryTab = page.locator('.tab-btn:has-text("Memory")');
  await expect(memoryTab).toBeVisible();
});

test('memory tab shows legend after parse', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');
  await page.click('.tab-btn:has-text("Memory")');

  // Memory tab should show the legend with type colors
  const legend = page.locator('.memory-legend');
  await expect(legend).toBeVisible();
});

test('memory shows empty state after parse', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#parse-btn');

  await page.click('.tab-btn:has-text("Memory")');

  // Should show "(no variables)" before execution
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('(no variables)');
});

// Variable Display Tests

test('variables appear after let statement', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});

test('multiple variables displayed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let a = 1\nlet b = 2\nlet c = 3');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('a');
  await expect(memoryContent).toContainText('b');
  await expect(memoryContent).toContainText('c');
  await expect(memoryContent).toContainText('1');
  await expect(memoryContent).toContainText('2');
  await expect(memoryContent).toContainText('3');
});

test('variable values update on assignment', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 1\nx = 2');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('2');
  // Should not show old value
  const text = await memoryContent.textContent();
  // x should show 2, not 1 (there's only one x)
  const xCount = (text.match(/\bx\b/g) || []).length;
  expect(xCount).toBe(1);
});

// Type Display Tests

test('integer type displayed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let n = 42');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('int');
});

test('float type displayed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let f = 3.14');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('float');
});

test('string type displayed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let s = "hello"');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('str');
  await expect(memoryContent).toContainText('"hello"');
});

test('boolean type displayed', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let b = true');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('bool');
  await expect(memoryContent).toContainText('true');
});

test('type changes when variable reassigned', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42\nx = "hello"');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  // After reassignment, type should be str
  await expect(memoryContent).toContainText('str');
  await expect(memoryContent).toContainText('"hello"');
});

// Integration Tests

test('memory cleared on reset', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42');

  await page.click('.tab-btn:has-text("Memory")');
  await expect(page.locator('#tab-memory')).toContainText('x');

  await page.click('#reset-btn');

  // Memory should be cleared
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).not.toContainText('x');
});

test('memory legend shows type colors', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42');

  await page.click('.tab-btn:has-text("Memory")');

  // Legend should have Integer, Float, String, Boolean
  const legend = page.locator('.memory-legend');
  await expect(legend).toContainText('Integer');
  await expect(legend).toContainText('Float');
  await expect(legend).toContainText('String');
  await expect(legend).toContainText('Boolean');
});

test('variables from expression are in memory', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 10\nlet y = 20\nlet sum = x + y');

  await page.click('.tab-btn:has-text("Memory")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('y');
  await expect(memoryContent).toContainText('sum');
  await expect(memoryContent).toContainText('30');
});

test('output pane shows program results', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 42\nprint(x + 1)');

  // Output should be in output pane, not memory tab
  const output = page.locator('#output');
  await expect(output).toContainText('43');

  // Memory should show x
  await page.click('.tab-btn:has-text("Memory")');
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});
