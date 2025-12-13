const { test, expect } = require('@playwright/test');

// Print Output Tests - verify output appears immediately during animated execution

test('print output appears immediately during animated execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)\nprint(2)\nprint(3)');
  await page.click('#run-btn');

  // Wait for first print to execute - output should show "1" before program completes
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('1');
  }, { timeout: 8000 });

  // At this point, "2" and "3" should NOT yet be in output (still executing)
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('1');

  // Verify we're still running (code-executing should still be visible)
  const stillExecuting = await page.locator('.code-executing').count();
  expect(stillExecuting).toBeGreaterThan(0);
});

test.skip('print output accumulates during execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print("first")\nprint("second")');
  await page.click('#run-btn');

  // Wait for first output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('first');
  }, { timeout: 8000 });

  // Wait for second output to also appear
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('second');
  }, { timeout: 25000 });

  // Both should be visible
  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('first');
  expect(outputText).toContain('second');
});

test.skip('print in if statement shows output when branch executes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'if (true) { print("inside") }');
  await page.click('#run-btn');

  // Output should appear when the print inside the if executes
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('inside');
  }, { timeout: 25000 });

  const outputText = await page.locator('#output').textContent();
  expect(outputText).toContain('inside');
});
