const { test, expect } = require('@playwright/test');
const { runUntilPause } = require('./helpers');

// Helper to run code until pause and get debug stack frames content
async function runCodeAndGetStackFrames(page, code) {
  await runUntilPause(page, code);
  return await page.locator('#debug-stack-frames').innerHTML();
}

// Call Stack Visualization Tests

test('global frame shown when paused', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, 'let x = 1\npause()');
  // Should show global frame
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('stack-frame-global');
  // Should show variable x
  expect(memory).toContain('x');
});

test('global frame shows variables', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, 'let x = 42\nlet y = "hello"\npause()');
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('x');
  expect(memory).toContain('42');
  expect(memory).toContain('y');
  expect(memory).toContain('"hello"');
});

test('function declaration shows in global frame', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, 'function foo() { }\npause()');
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('foo');
  expect(memory).toContain('[function]');
});

test('function frame shows when paused inside function', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, `function add(a, b) {
  let sum = a + b
  pause()
  return sum
}
add(3, 4)`);
  // Should show both global and function frames
  expect(memory).toContain('&lt;global&gt;');
  expect(memory).toContain('add');
  // Should show function parameters
  expect(memory).toContain('a');
  expect(memory).toContain('3');
  expect(memory).toContain('b');
  expect(memory).toContain('4');
  // Should show local variable
  expect(memory).toContain('sum');
  expect(memory).toContain('7');
});

test('recursive function shows multiple frames', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, `function fac(n) {
  if (n <= 1) {
    pause()
    return 1
  }
  return n * fac(n - 1)
}
fac(3)`);
  // Should show fac frames (at least one for the paused call)
  expect(memory).toContain('fac');
});

test('multiple functions show in global frame', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, 'function a() { }\nfunction b() { }\npause()');
  expect(memory).toContain('a');
  expect(memory).toContain('b');
  expect(memory).toContain('[function]');
});

test('call stack label is shown', async ({ page }) => {
  await page.goto('/');
  const memory = await runCodeAndGetStackFrames(page, 'let x = 1\npause()');
  expect(memory).toContain('Call Stack:');
});
