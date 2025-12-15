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

// While Loop Tests

test('while loop executes body while condition is true', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let i = 0\nwhile (i < 3) { print(i)\ni = i + 1 }');
  expect(output).toContain('0');
  expect(output).toContain('1');
  expect(output).toContain('2');
  expect(output).not.toContain('3');
});

test('while loop with false condition never executes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'while (false) { print("never") }');
  await page.click('#run-btn');
  // Wait a moment for execution
  await page.waitForTimeout(100);
  const output = await page.locator('#output').textContent();
  expect(output).not.toContain('never');
});

test('while loop modifies variables', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let sum = 0\nlet i = 1\nwhile (i <= 5) { sum = sum + i\ni = i + 1 }\nprint(sum)');
  expect(output).toContain('15');
});

test('while loop with comparison condition', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nwhile (x > 0) { x = x - 3 }\nprint(x)');
  expect(output).toContain('-2');
});

test('nested while loops', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let i = 0\nlet count = 0\nwhile (i < 2) { let j = 0\nwhile (j < 2) { count = count + 1\nj = j + 1 }\ni = i + 1 }\nprint(count)');
  expect(output).toContain('4');
});

test('while loop with variable condition', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let running = true\nlet i = 0\nwhile (running) { i = i + 1\nif (i equals 3) { running = false } }\nprint(i)');
  expect(output).toContain('3');
});

test('infinite loop protection', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'while (true) { }');
  await page.click('#run-btn');
  // Wait for error to appear
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Infinite loop');
  }, { timeout: 10000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('Infinite loop detected');
});

test('while loop highlights during animated execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let i = 0\nwhile (i < 2) { i = i + 1 }');
  await page.click('#debug-btn');

  // Wait for code highlighting to appear
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 8000 });

  // Wait for the while loop condition to be highlighted (contains "while")
  await page.waitForFunction(() => {
    const el = document.querySelector('.code-executing');
    return el && el.textContent.includes('while');
  }, { timeout: 10000 });
});
