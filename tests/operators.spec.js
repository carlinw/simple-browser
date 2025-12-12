const { test, expect } = require('@playwright/test');
const { runFast } = require('./helpers');

// Logical AND Tests

test('true and true returns true', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print true and true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('true and false returns false', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print true and false');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

test('false and true returns false', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print false and true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

test('and with comparison expressions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 5\nprint x > 0 and x < 10');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('and short-circuits on false', async ({ page }) => {
  await page.goto('/');
  // If and doesn't short-circuit, this would cause division by zero error
  await runFast(page, 'print false and (5 / 0)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

// Logical OR Tests

test('false or true returns true', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print false or true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('false or false returns false', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print false or false');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

test('or with comparison expressions', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 15\nprint x < 0 or x > 10');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('or short-circuits on true', async ({ page }) => {
  await page.goto('/');
  // If or doesn't short-circuit, this would cause division by zero error
  await runFast(page, 'print true or (5 / 0)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

// Logical NOT Tests

test('not true returns false', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print not true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('false');
});

test('not false returns true', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print not false');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('not with comparison', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 5\nprint not (x > 10)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('double negation', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print not not true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

// Modulo Tests

test('10 % 3 returns 1', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 10 % 3');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('1');
});

test('even number check', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let n = 4\nprint n % 2 == 0');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('odd number check', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let n = 7\nprint n % 2 == 1');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('modulo by zero error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 5 % 0');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Modulo by zero');
});

// Unary Minus Tests

test('negative literal', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print -5');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('-5');
});

test('negate variable', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 10\nprint -x');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('-10');
});

test('negate expression', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print -(3 + 2)');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('-5');
});

test('double negative', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'let x = 5\nprint --x');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('5');
});

test('unary minus on non-number error', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print -"hello"');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('requires a number');
});

// Precedence Tests

test('and has higher precedence than or', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print true or false and false');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('not has highest precedence', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print not false and true');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('true');
});

test('% same precedence as * /', async ({ page }) => {
  await page.goto('/');
  await runFast(page, 'print 10 + 6 % 4');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('12');
});
