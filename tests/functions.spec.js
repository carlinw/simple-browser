const { test, expect } = require('@playwright/test');

// Helper to run code and get output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  // Wait for output to have content or be processed
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 5000 }).catch(() => {});
  return await page.locator('#output').textContent();
}

// Function Tests

test('function declaration creates function', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function greet() { }\nprint("done")');
  expect(output).toContain('done');
});

test('function call executes body', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function sayHi() { print("hi") }\nsayHi()');
  expect(output).toContain('hi');
});

test('function with parameters', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function greet(name) { print("Hello " + name) }\ngreet("Connor")');
  expect(output).toContain('Hello Connor');
});

test('function with return value', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function add(a, b) { return a + b }\nprint(add(2, 3))');
  expect(output).toContain('5');
});

test('function with multiple parameters', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function sum3(a, b, c) { return a + b + c }\nprint(sum3(1, 2, 3))');
  expect(output).toContain('6');
});

test('function return exits early', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function test() { return 1\nprint("never") }\nprint(test())');
  expect(output).toContain('1');
  expect(output).not.toContain('never');
});

test('function without return returns null', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function noReturn() { let x = 1 }\nprint(noReturn())');
  expect(output).toContain('null');
});

test('recursive function works', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function fib(n) { if (n <= 1) { return n } return fib(n - 1) + fib(n - 2) }\nprint(fib(6))');
  expect(output).toContain('8');
});

test('function parameters are local', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 1\nfunction setX(x) { x = 99 }\nsetX(5)\nprint(x)');
  expect(output).toContain('1');
});

test('function can access outer variables', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nfunction getX() { return x }\nprint(getX())');
  expect(output).toContain('10');
});

test('calling non-function shows error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 5\nx()');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('not a function');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('not a function');
});

test('wrong argument count shows error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'function f(a) { }\nf(1, 2)');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Expected');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('Expected 1 arguments but got 2');
});
