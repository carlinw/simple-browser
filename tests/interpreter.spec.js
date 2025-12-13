const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// Helper to parse code
async function parseCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#parse-btn');
  // Wait for AST to render
  await page.waitForSelector('.ast-tree');
}

// UI Tests (new buttons)

test('parse button exists', async ({ page }) => {
  await page.goto('/');
  const parseBtn = page.locator('#parse-btn');
  await expect(parseBtn).toBeVisible();
  await expect(parseBtn).toHaveText('Parse');
});

test('run fast button exists', async ({ page }) => {
  await page.goto('/');
  const runFastBtn = page.locator('#run-fast-btn');
  await expect(runFastBtn).toBeVisible();
  await expect(runFastBtn).toHaveText('Run Fast');
});

test('parse button shows AST without execution', async ({ page }) => {
  await page.goto('/');
  await parseCode(page, '2 + 3');

  // AST tab should be active
  const astTab = page.locator('.tab-btn:has-text("AST")');
  await expect(astTab).toHaveClass(/active/);

  // Check output pane does NOT contain the result
  const outputContent = await page.locator('#output').textContent();
  expect(outputContent).not.toContain('5');
});

test('run fast executes immediately', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(2 + 3)');

  const outputContent = await page.locator('#output').textContent();
  expect(outputContent).toContain('5');
});

// Interpreter Tests

test('interpreter evaluates number literal', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(42)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('42');
});

test('interpreter evaluates addition', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(2 + 3)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('interpreter evaluates subtraction', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(10 - 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('6');
});

test('interpreter evaluates multiplication', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(3 * 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('12');
});

test('interpreter evaluates division', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(20 / 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('interpreter respects operator precedence', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(2 + 3 * 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('14');
});

test('interpreter respects parentheses', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print((2 + 3) * 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('20');
});

test('interpreter handles complex expressions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(1 + 2 * 3 - 4 / 2)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('interpreter evaluates comparison to boolean', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(5 > 3)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('interpreter evaluates equality to boolean', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(5 equals 5)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('print statement shows output', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(42)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('42');
});

test('multiple print statements show multiple outputs', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print(1 + 2)\nprint(3 * 4)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('3');
  expect(output).toContain('12');
});

test('string concatenation works', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print("hello" + " " + "world")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('hello world');
});

// Visualization Tests

test('run button highlights AST nodes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '2 + 3');
  await page.click('#run-btn');

  // Wait a moment for animation to start
  await page.waitForTimeout(500);

  // Check for executing class on any node
  const executingNode = page.locator('.ast-executing');
  await expect(executingNode.first()).toBeVisible({ timeout: 2000 });
});

test('AST tab is active during animated run', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '2 + 3');
  await page.click('#run-btn');

  // Wait a moment for animation to start
  await page.waitForTimeout(500);

  // AST tab should be active during run
  const astTab = page.locator('.tab-btn:has-text("AST")');
  await expect(astTab).toHaveClass(/active/);
});

// Negative Tests

test('division by zero shows error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, '10 / 0');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Division by zero');
});

test('undefined variable shows error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'x + 1');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Undefined variable');
});

test('arithmetic on non-numbers shows error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, '"hello" - 5');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('non-numeric');
});

test('running empty program shows error', async ({ page }) => {
  await page.goto('/');
  // Clear any default content and run with empty editor
  await page.fill('#code-editor', '');
  await page.click('#run-fast-btn');

  // Wait for output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 2000 });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('No program');
});
