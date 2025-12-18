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

test('infinite loop shows output before error', async ({ page }) => {
  await page.goto('/');
  // Loop that prints before hitting the limit
  await page.fill('#code-editor', 'let i = 0\nwhile (true) {\n  print(i)\n  i = i + 1\n}');
  await page.click('#run-btn');
  // Wait for error to appear
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Infinite loop');
  }, { timeout: 15000 });
  const output = await page.locator('#output').textContent();
  // Should have both the printed output AND the error
  expect(output).toContain('0');
  expect(output).toContain('100');
  expect(output).toContain('Infinite loop detected');
});

test('while loop executes during animated debug', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let i = 0\nwhile (i < 2) { i = i + 1 }\nprint(i)');
  await page.click('#debug-btn');

  // Wait for execution to complete - output should show the final value
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('2');
  }, { timeout: 60000 });

  // Verify the final value
  const output = await page.locator('#output').textContent();
  expect(output).toContain('2');
});

// Loop Limit Tests

test('looplimit sets custom iteration limit', async ({ page }) => {
  await page.goto('/');
  // Set limit to 5, then run a loop that would hit it
  await page.fill('#code-editor', 'looplimit(5)\nlet i = 0\nwhile (true) { i = i + 1 }');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Infinite loop');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('exceeded 5 iterations');
});

test('looplimit allows more iterations than default', async ({ page }) => {
  await page.goto('/');
  // Set limit to 15000, run loop 12000 times (would fail with default 10000)
  const output = await runCode(page, 'looplimit(15000)\nlet i = 0\nwhile (i < 12000) { i = i + 1 }\nprint(i)');
  expect(output).toContain('12000');
});

test('looplimit requires integer argument', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'looplimit("hello")');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Error');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('integer');
});

test('looplimit requires positive number', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'looplimit(-5)');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Error');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('positive');
});

test('looplimit requires exactly one argument', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'looplimit()');
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Error');
  }, { timeout: 5000 });
  const output = await page.locator('#output').textContent();
  expect(output).toContain('1 argument');
});
