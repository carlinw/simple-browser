const { test, expect } = require('@playwright/test');
const { runDebug } = require('./helpers');

// UI Tests - Memory pane is now the only section in the interpreter pane (no tabs)

test('memory pane is visible after debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42\nprint("done")');
  await page.click('#debug-btn');

  // Wait for execution to complete
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    const debugBtn = document.getElementById('debug-btn');
    return runBtn && debugBtn && !runBtn.disabled && !debugBtn.disabled;
  }, { timeout: 60000 });

  // Memory pane (tab-memory) should be visible
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toBeVisible();
});

test('memory shows legend after debug', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint("done")');

  // Memory should show the legend with type colors
  const legend = page.locator('.memory-legend');
  await expect(legend).toBeVisible();
});

test('memory shows variables after execution', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint("done")');

  // After execution, should show variables
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});

// Variable Display Tests

test('variables appear after let statement', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});

test('multiple variables displayed', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let a = 1\nlet b = 2\nlet c = 3\nprint("done")');

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
  await runDebug(page, 'let x = 1\nx = 2\nprint("done")');

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
  await runDebug(page, 'let n = 42\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('int');
});

test('float type displayed', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let f = 3.14\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('float');
});

test('string type displayed', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let s = "hello"\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('str');
  await expect(memoryContent).toContainText('"hello"');
});

test('boolean type displayed', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let b = true\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('bool');
  await expect(memoryContent).toContainText('true');
});

test('type changes when variable reassigned', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nx = "hello"\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  // After reassignment, type should be str
  await expect(memoryContent).toContainText('str');
  await expect(memoryContent).toContainText('"hello"');
});

// Integration Tests

test('memory cleared on reset', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint("done")');

  await expect(page.locator('#tab-memory')).toContainText('x');

  await page.click('#stop-btn');

  // Memory should be cleared
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).not.toContainText('x');
});

test('memory legend shows type colors', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint("done")');

  // Legend should have Integer, Float, String, Boolean
  const legend = page.locator('.memory-legend');
  await expect(legend).toContainText('Integer');
  await expect(legend).toContainText('Float');
  await expect(legend).toContainText('String');
  await expect(legend).toContainText('Boolean');
});

test('variables from expression are in memory', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 10\nlet y = 20\nlet sum = x + y\nprint("done")');

  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('y');
  await expect(memoryContent).toContainText('sum');
  await expect(memoryContent).toContainText('30');
});

test('output pane shows program results', async ({ page }) => {
  await page.goto('/');
  await runDebug(page, 'let x = 42\nprint(x + 1)');

  // Output should be in output pane, not memory
  const output = page.locator('#output');
  await expect(output).toContainText('43');

  // Memory should show x
  const memoryContent = page.locator('#tab-memory');
  await expect(memoryContent).toContainText('x');
  await expect(memoryContent).toContainText('42');
});
