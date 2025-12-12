const { test, expect } = require('@playwright/test');

// Helper to run code and get output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  // Wait for output to have content or be processed
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 5000 }).catch(() => {});
  return await page.locator('#output').textContent();
}

// If Statement Tests

test('if true executes then branch', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'if (true) { print "yes" }');
  expect(output).toContain('yes');
});

test('if false skips then branch', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'if (false) { print "skipped" }');
  await page.click('#run-fast-btn');
  // Wait a moment for execution
  await page.waitForTimeout(100);
  const output = await page.locator('#output').textContent();
  // Should not contain "skipped" - may show "(no output)" placeholder
  expect(output).not.toContain('skipped');
});

test('if-else executes else when false', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'if (false) { print "then" } else { print "else" }');
  expect(output).toContain('else');
  expect(output).not.toContain('then');
});

test('if with comparison', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 10\nif (x > 5) { print "big" }');
  expect(output).toContain('big');
});

test('if-else with variable condition', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let flag = true\nif (flag) { print "yes" } else { print "no" }');
  expect(output).toContain('yes');
  expect(output).not.toContain('no');
});

test('nested if statements', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'if (true) { if (true) { print "nested" } }');
  expect(output).toContain('nested');
});

test('if modifies variables', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 1\nif (true) { x = 2 }\nprint x');
  expect(output).toContain('2');
});
