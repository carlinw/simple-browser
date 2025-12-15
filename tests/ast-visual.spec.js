// Tests for AST visual structure - connectors and node layout
const { test, expect } = require('@playwright/test');

// Helper to run code in debug mode and wait for AST to be visible
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#debug-btn');
  // Wait for execution to complete (run button becomes enabled)
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    const debugBtn = document.getElementById('debug-btn');
    return runBtn && debugBtn && !runBtn.disabled && !debugBtn.disabled;
  }, { timeout: 120000 });
}

test.describe('AST visual structure', () => {
  test('Program node has connector line to children', async ({ page }) => {
    await page.goto('/');
    await runCode(page, 'let x = 42');
    await page.click('.tab-btn:has-text("AST")');

    // Program node container should have a connector line
    const programContainer = page.locator('.ast-program').locator('..');
    const connector = programContainer.locator('> .ast-connector');
    await expect(connector).toBeVisible();
  });

  test('CallExpression shows callee as child node not inline', async ({ page }) => {
    await page.goto('/');
    await runCode(page, 'print("hello")');
    await page.click('.tab-btn:has-text("AST")');

    // CallExpression node should just show "call", not "call print"
    const callNode = page.locator('.ast-callexpression');
    await expect(callNode).toBeVisible();

    // The call node text should be just "call" without the function name
    const callText = await callNode.textContent();
    expect(callText.trim()).toBe('call');

    // The function name should be a separate child identifier node
    const callContainer = callNode.locator('..');
    const childIdentifier = callContainer.locator('.ast-children .ast-identifier');
    await expect(childIdentifier).toBeVisible();
    await expect(childIdentifier).toContainText('print');
  });
});
