const { test, expect } = require('@playwright/test');

// Helper to run code and get output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  // Wait for output to have content
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });
  return await page.locator('#output').textContent();
}

// Variable Declaration Tests

test('interpreter declares and uses variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 42\nprint x');
  expect(output).toContain('42');
});

test('interpreter declares string variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let name = "Connor"\nprint name');
  expect(output).toContain('Connor');
});

test('interpreter declares boolean variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let flag = true\nprint flag');
  expect(output).toContain('true');
});

test('interpreter uses variable in expression', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nlet y = 20\nprint x + y');
  expect(output).toContain('30');
});

test('interpreter uses variable in complex expression', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let a = 2\nlet b = 3\nlet c = 4\nprint a + b * c');
  expect(output).toContain('14');
});

// Variable Assignment Tests

test('interpreter assigns to variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 1\nx = 2\nprint x');
  expect(output).toContain('2');
});

test('interpreter assigns expression to variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nx = x + 5\nprint x');
  expect(output).toContain('15');
});

test('interpreter increments variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let count = 0\ncount = count + 1\ncount = count + 1\nprint count');
  expect(output).toContain('2');
});

test('interpreter assigns string to variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let msg = "hello"\nmsg = "world"\nprint msg');
  expect(output).toContain('world');
});

// Multiple Variables Tests

test('interpreter handles multiple variables', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let a = 1\nlet b = 2\nlet c = 3\nprint a + b + c');
  expect(output).toContain('6');
});

test('interpreter uses variables in comparison', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nlet y = 5\nprint x > y');
  expect(output).toContain('true');
});

test('interpreter concatenates string variables', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let first = "Hello"\nlet second = " World"\nprint first + second');
  expect(output).toContain('Hello World');
});

// Dynamic Typing Tests

test('variable can change from number to string', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 42\nx = "hello"\nprint x');
  expect(output).toContain('hello');
});

test('variable can change from string to number', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = "hello"\nx = 100\nprint x');
  expect(output).toContain('100');
});

test('variable can change from boolean to string', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let flag = true\nflag = "yes"\nprint flag');
  expect(output).toContain('yes');
});

// Negative Tests

test('undefined variable shows error', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'print x');
  expect(output).toContain('Undefined variable: x');
});

test('assignment to undefined variable shows error', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'x = 10');
  expect(output).toContain('Undefined variable: x');
});

test('cannot use variable before declaration', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'print x\nlet x = 5');
  expect(output).toContain('Undefined variable: x');
});
