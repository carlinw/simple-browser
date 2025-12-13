const { test, expect } = require('@playwright/test');

// Helper to get lexer output from the page
async function runLexer(page, input) {
  await page.goto('/');
  await page.fill('#code-editor', input);
  await page.click('#run-btn');
  const tokens = await page.locator('#tab-tokens').textContent();
  return tokens;
}

// Helper to get errors from the output pane
async function getErrors(page, input) {
  await page.goto('/');
  await page.fill('#code-editor', input);
  await page.click('#run-btn');
  // Wait for output to have content
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });
  const output = await page.locator('#output').textContent();
  return output;
}

// Positive Tests

test('lexer tokenizes numbers', async ({ page }) => {
  const output = await runLexer(page, '42');
  expect(output).toContain('NUMBER');
  expect(output).toContain('42');
});

test('lexer tokenizes operators', async ({ page }) => {
  const output = await runLexer(page, '+ - * / = < > <= >=');
  expect(output).toContain('OPERATOR');
  expect(output).toContain('+');
  expect(output).toContain('-');
  expect(output).toContain('*');
  expect(output).toContain('/');
  expect(output).toContain('<=');
  expect(output).toContain('>=');
});

test('lexer tokenizes keywords', async ({ page }) => {
  const output = await runLexer(page, 'let if else while function return true false stop');
  expect(output).toContain('KEYWORD');
  expect(output).toContain('let');
  expect(output).toContain('if');
  expect(output).toContain('else');
  expect(output).toContain('while');
  expect(output).toContain('function');
  expect(output).toContain('return');
  expect(output).toContain('true');
  expect(output).toContain('false');
  expect(output).toContain('stop');
});

test('lexer tokenizes identifiers', async ({ page }) => {
  const output = await runLexer(page, 'x foo myVar _private count123');
  expect(output).toContain('IDENTIFIER');
  expect(output).toContain('x');
  expect(output).toContain('foo');
  expect(output).toContain('myVar');
  expect(output).toContain('_private');
  expect(output).toContain('count123');
});

test('lexer tokenizes strings', async ({ page }) => {
  const output = await runLexer(page, '"hello" "Hi Connor"');
  expect(output).toContain('STRING');
  expect(output).toContain('hello');
  expect(output).toContain('Hi Connor');
});

test('lexer tokenizes punctuation', async ({ page }) => {
  const output = await runLexer(page, '( ) { } ,');
  expect(output).toContain('PUNCTUATION');
  expect(output).toContain('(');
  expect(output).toContain(')');
  expect(output).toContain('{');
  expect(output).toContain('}');
  expect(output).toContain(',');
});

test('lexer tracks line and column', async ({ page }) => {
  const output = await runLexer(page, 'let x\nlet y');
  // First line tokens should have line 1
  expect(output).toMatch(/1\s+\d+\s+KEYWORD\s+let/);
  // Second line tokens should have line 2
  expect(output).toMatch(/2\s+\d+\s+KEYWORD\s+let/);
});

test('lexer skips comments', async ({ page }) => {
  const output = await runLexer(page, 'x = 5 // this is a comment\nlet y');
  expect(output).not.toContain('comment');
  expect(output).not.toContain('this is');
  expect(output).toContain('IDENTIFIER');
  expect(output).toContain('x');
  expect(output).toContain('KEYWORD');
  expect(output).toContain('let');
});

test('lexer handles mixed input', async ({ page }) => {
  const output = await runLexer(page, 'let count = 0\nwhile (count < 10) {\n  count = count + 1\n}');
  expect(output).toContain('KEYWORD');
  expect(output).toContain('IDENTIFIER');
  expect(output).toContain('OPERATOR');
  expect(output).toContain('NUMBER');
  expect(output).toContain('PUNCTUATION');
  expect(output).toContain('let');
  expect(output).toContain('count');
  expect(output).toContain('while');
});

test('lexer tokenizes expression', async ({ page }) => {
  const output = await runLexer(page, '(2 + 3) * 4');
  expect(output).toContain('PUNCTUATION');
  expect(output).toContain('NUMBER');
  expect(output).toContain('OPERATOR');
  expect(output).toContain('(');
  expect(output).toContain(')');
  expect(output).toContain('2');
  expect(output).toContain('+');
  expect(output).toContain('3');
  expect(output).toContain('*');
  expect(output).toContain('4');
});

// Negative Tests

test('lexer reports invalid character', async ({ page }) => {
  const output = await getErrors(page, 'x @ y');
  expect(output).toContain('Error');
  expect(output).toContain("Invalid character '@'");
});

test('lexer reports unterminated string', async ({ page }) => {
  const output = await getErrors(page, '"hello');
  expect(output).toContain('Error');
  expect(output).toContain('Unterminated string');
});

test('lexer reports multiple errors', async ({ page }) => {
  const output = await getErrors(page, 'x @ y $ z');
  // Should have errors for both @ and $
  const atError = output.includes("Invalid character '@'");
  const dollarError = output.includes("Invalid character '$'");
  expect(atError).toBe(true);
  expect(dollarError).toBe(true);
});
