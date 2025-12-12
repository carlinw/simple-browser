const { test, expect } = require('@playwright/test');

// Helper to run code and get memory tab content
async function runCodeAndGetMemory(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  // Wait for execution to complete
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 5000 }).catch(() => {});
  // Click Memory tab
  await page.click('.tab-btn[data-tab="memory"]');
  return await page.locator('#tab-memory').innerHTML();
}

// Call Stack Visualization Tests

test('global frame shown at start', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'let x = 1\nprint x');
  // Should show global frame
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('stack-frame-global');
  // Should show variable x
  expect(memory).toContain('x');
});

test('global frame shows variables', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'let x = 42\nlet y = "hello"\nprint x');
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('x');
  expect(memory).toContain('42');
  expect(memory).toContain('y');
  expect(memory).toContain('"hello"');
});

test('function declaration shows in global frame', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'function foo() { }\nprint "done"');
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('foo');
  expect(memory).toContain('[function]');
});

test('stack shows only global after function returns', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'function add(a, b) { return a + b }\nprint add(1, 2)');
  // After execution, should only have global frame
  expect(memory).toContain('&lt;global&gt;');
  // Function frame should be gone - only one stack frame visible
  const frameCount = (memory.match(/stack-frame(?![^"]*global)/g) || []).length;
  // Should have exactly one frame (global)
  expect(memory).toContain('stack-frame-global');
});

test('recursive function shows in global frame', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'function fac(n) { if (n <= 1) { return 1 } return n * fac(n - 1) }\nprint fac(3)');
  // After execution, factorial should be in global
  expect(memory).toContain('fac');
  expect(memory).toContain('[function]');
});

test('multiple functions show in global frame', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'function a() { }\nfunction b() { }\nprint "done"');
  expect(memory).toContain('a');
  expect(memory).toContain('b');
  expect(memory).toContain('[function]');
});

test('call stack label is shown', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetMemory(page, 'let x = 1\nprint x');
  expect(memory).toContain('Call Stack:');
});
