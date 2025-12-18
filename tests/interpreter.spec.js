const { test, expect } = require('@playwright/test');
const { runFast, runUntilPause } = require('./helpers');

// UI Tests (buttons)

test('run button exists', async ({ page }) => {
  await page.goto('/');
  const runBtn = page.locator('#run-btn');
  await expect(runBtn).toBeVisible();
  await expect(runBtn).toHaveText('Run');
});

test('run button executes immediately', async ({ page }) => {
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

// Debug mode Tests

test('pause() shows debug panel with variables', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 42\npause()');

  // Debug panel should be visible with variable
  const debugPanel = page.locator('#debug-stack-frames');
  await expect(debugPanel).toBeVisible();
  await expect(debugPanel).toContainText('x');
  await expect(debugPanel).toContainText('42');
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
  await page.click('#run-btn');

  // Wait for output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 2000 });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('No program');
});

// else if Tests

test('else if executes first matching branch', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let x = 1
if (x equals 1) {
  print("one")
} else if (x equals 2) {
  print("two")
} else {
  print("other")
}`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('one');
});

test('else if executes second branch', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let x = 2
if (x equals 1) {
  print("one")
} else if (x equals 2) {
  print("two")
} else {
  print("other")
}`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('two');
});

test('else if executes else branch when no conditions match', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let x = 99
if (x equals 1) {
  print("one")
} else if (x equals 2) {
  print("two")
} else {
  print("other")
}`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('other');
});

test('else if skips remaining branches after match', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let x = 1
let count = 0
if (x equals 1) {
  count = count + 1
} else if (x equals 1) {
  count = count + 10
} else {
  count = count + 100
}
print(count)`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('1');
});

test('else if chain with multiple conditions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let grade = 85
if (grade >= 90) {
  print("A")
} else if (grade >= 80) {
  print("B")
} else if (grade >= 70) {
  print("C")
} else if (grade >= 60) {
  print("D")
} else {
  print("F")
}`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('B');
});

test('else if without final else', async ({ page }) => {
  await page.goto('/');
  await runFast(page, `let x = 3
if (x equals 1) {
  print("one")
} else if (x equals 2) {
  print("two")
}
print("done")`);

  const output = await page.locator('#output').textContent();
  expect(output).toBe('done');
});
