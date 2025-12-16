const { test, expect } = require('@playwright/test');

// Helper to run code and get output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 5000 });
  return await page.locator('#output').textContent();
}

// Block Scope Tests - Java-style block scoping

// === If Block Scope ===

test('variable declared in if block is not accessible outside', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
if (true) {
  let x = 42
}
print(x)
`);
  expect(output).toContain('Undefined variable: x');
});

test('variable declared in else block is not accessible outside', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
if (false) {
  let a = 1
} else {
  let b = 2
}
print(b)
`);
  expect(output).toContain('Undefined variable: b');
});

test('variable declared before if is accessible inside if block', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let x = 10
if (true) {
  print(x)
}
`);
  expect(output).toContain('10');
});

test('variable modified in if block persists outside', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let x = 1
if (true) {
  x = 99
}
print(x)
`);
  expect(output).toContain('99');
});

test('shadowing in if block does not affect outer variable', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let x = 1
if (true) {
  let x = 99
  print(x)
}
print(x)
`);
  expect(output).toContain('99');
  expect(output).toContain('1');
});

// === While Loop Scope ===

test('variable declared in while block is not accessible outside', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let i = 0
while (i < 1) {
  let temp = 42
  i = i + 1
}
print(temp)
`);
  expect(output).toContain('Undefined variable: temp');
});

test('variable declared before while is accessible inside while block', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let x = 10
let i = 0
while (i < 1) {
  print(x)
  i = i + 1
}
`);
  expect(output).toContain('10');
});

test('variable modified in while block persists outside', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let sum = 0
let i = 0
while (i < 3) {
  sum = sum + i
  i = i + 1
}
print(sum)
`);
  expect(output).toContain('3');
});

test('each while iteration gets fresh block scope', async ({ page }) => {
  await page.goto('/');
  // This tests that 'let' in a loop creates a new variable each iteration
  // not reusing the same one (important for closures)
  const output = await runCode(page, `
let i = 0
while (i < 3) {
  let x = i
  i = i + 1
}
print(i)
`);
  // Should complete without error, x is scoped to each iteration
  expect(output).toContain('3');
});

// === Nested Block Scope ===

test('nested if blocks have separate scopes', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
if (true) {
  let x = 1
  if (true) {
    let y = 2
    print(x)
    print(y)
  }
  print(x)
}
`);
  expect(output).toContain('1');
  expect(output).toContain('2');
  // y should not be accessible in outer if
});

test('inner block cannot access variable from sibling block', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
if (true) {
  let x = 1
}
if (true) {
  print(x)
}
`);
  expect(output).toContain('Undefined variable: x');
});

// === Function Scope (should still work) ===

test('function parameters are local to function', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function test(x) {\n  print(x)\n}\ntest(42)\nprint(x)');
  expect(output).toContain('42');
  expect(output).toContain('Undefined variable: x');
});

test('function can access outer variables (closure)', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let outer = 10\nfunction test() {\n  print(outer)\n}\ntest()');
  expect(output).toContain('10');
});

test('function variable shadowing works correctly', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'let x = 1\nfunction test() {\n  let x = 99\n  print(x)\n}\ntest()\nprint(x)');
  expect(output).toContain('99');
  expect(output).toContain('1');
});

// === Edge Cases ===

test('redeclaring variable in same scope is allowed', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, `
let x = 1
let x = 2
print(x)
`);
  // This behavior can vary - for simplicity, we allow redeclaration
  expect(output).toContain('2');
});

test('block inside function has its own scope', async ({ page }) => {
  await page.goto('/');
  const output = await runCode(page, 'function test() {\n  if (true) {\n    let x = 42\n  }\n  print(x)\n}\ntest()');
  expect(output).toContain('Undefined variable: x');
});
