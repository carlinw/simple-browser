const { test, expect } = require('@playwright/test');

// Print Output Tests - verify output appears during execution

test('print output appears during debug execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)\nprint(2)\nprint(3)');
  await page.click('#debug-btn');

  // Wait for first print to execute - output should show "1" before program completes
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('1');
  }, { timeout: 30000 });

  // At this point, "1" should be in output
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('1');
});

test('print output accumulates during execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print("first")\nprint("second")');
  await page.click('#debug-btn');

  // Wait for second output to also appear
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('second');
  }, { timeout: 60000 });

  // Both should be visible
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('first');
  expect(outputText).toContain('second');
});

test('print in if statement shows output when branch executes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'if (true) { print("inside") }');
  await page.click('#debug-btn');

  // Output should appear when the print inside the if executes
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('inside');
  }, { timeout: 60000 });

  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('inside');
});

test('print output appears with run mode', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print("fast")');
  await page.click('#run-btn');

  // Wait for output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('fast');
  }, { timeout: 5000 });

  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('fast');
});
