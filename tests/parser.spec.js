const { test, expect } = require('@playwright/test');

// Helper to run code and get the AST from output
async function getAST(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');

  // Get AST from data attribute on the AST tab
  const astTab = page.locator('#tab-ast');
  const astJson = await astTab.getAttribute('data-ast');
  if (!astJson) {
    throw new Error('No AST found in output');
  }
  return JSON.parse(astJson);
}

// Helper to check for parser errors
async function getParserErrors(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  const output = await page.locator('#output').textContent();
  return output.includes('Parser Errors:');
}

// Positive Tests

test('parser parses number literal', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, '42');

  expect(ast.type).toBe('Program');
  expect(ast.statements).toHaveLength(1);
  expect(ast.statements[0].type).toBe('ExpressionStatement');
  expect(ast.statements[0].expression.type).toBe('NumberLiteral');
  expect(ast.statements[0].expression.value).toBe(42);
});

test('parser parses string literal', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, '"hello"');

  expect(ast.statements[0].expression.type).toBe('StringLiteral');
  expect(ast.statements[0].expression.value).toBe('hello');
});

test('parser parses boolean literals', async ({ page }) => {
  await page.goto('/');

  let ast = await getAST(page, 'true');
  expect(ast.statements[0].expression.type).toBe('BooleanLiteral');
  expect(ast.statements[0].expression.value).toBe(true);

  ast = await getAST(page, 'false');
  expect(ast.statements[0].expression.type).toBe('BooleanLiteral');
  expect(ast.statements[0].expression.value).toBe(false);
});

test('parser parses variable declaration', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'let x = 42');

  expect(ast.statements[0].type).toBe('LetStatement');
  expect(ast.statements[0].name).toBe('x');
  expect(ast.statements[0].value.type).toBe('NumberLiteral');
  expect(ast.statements[0].value.value).toBe(42);
});

test('parser parses assignment', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'x = 10');

  expect(ast.statements[0].type).toBe('AssignStatement');
  expect(ast.statements[0].name).toBe('x');
  expect(ast.statements[0].value.type).toBe('NumberLiteral');
  expect(ast.statements[0].value.value).toBe(10);
});

test('parser parses print statement', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'print x');

  expect(ast.statements[0].type).toBe('PrintStatement');
  expect(ast.statements[0].value.type).toBe('Identifier');
  expect(ast.statements[0].value.name).toBe('x');
});

test('parser parses arithmetic expressions', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, '1 + 2 * 3');

  // Should be: 1 + (2 * 3) due to precedence
  const expr = ast.statements[0].expression;
  expect(expr.type).toBe('BinaryExpression');
  expect(expr.operator).toBe('+');
  expect(expr.left.value).toBe(1);
  expect(expr.right.type).toBe('BinaryExpression');
  expect(expr.right.operator).toBe('*');
  expect(expr.right.left.value).toBe(2);
  expect(expr.right.right.value).toBe(3);
});

test('parser parses comparison expressions', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'x > 0');

  const expr = ast.statements[0].expression;
  expect(expr.type).toBe('BinaryExpression');
  expect(expr.operator).toBe('>');
  expect(expr.left.name).toBe('x');
  expect(expr.right.value).toBe(0);
});

test('parser parses equality expressions', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'x == 1');

  const expr = ast.statements[0].expression;
  expect(expr.type).toBe('BinaryExpression');
  expect(expr.operator).toBe('==');
});

test('parser parses grouped expressions', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, '(1 + 2) * 3');

  // Should be: (1 + 2) * 3, multiplication at top
  const expr = ast.statements[0].expression;
  expect(expr.type).toBe('BinaryExpression');
  expect(expr.operator).toBe('*');
  expect(expr.left.operator).toBe('+');
  expect(expr.right.value).toBe(3);
});

test('parser parses if statement', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'if (x > 0) { print x }');

  expect(ast.statements[0].type).toBe('IfStatement');
  expect(ast.statements[0].condition.operator).toBe('>');
  expect(ast.statements[0].thenBranch.type).toBe('Block');
  expect(ast.statements[0].thenBranch.statements).toHaveLength(1);
  expect(ast.statements[0].elseBranch).toBeNull();
});

test('parser parses if-else statement', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'if (x > 0) { print "yes" } else { print "no" }');

  expect(ast.statements[0].type).toBe('IfStatement');
  expect(ast.statements[0].thenBranch.statements).toHaveLength(1);
  expect(ast.statements[0].elseBranch).not.toBeNull();
  expect(ast.statements[0].elseBranch.statements).toHaveLength(1);
});

test('parser parses while loop', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'while (x > 0) { x = x - 1 }');

  expect(ast.statements[0].type).toBe('WhileStatement');
  expect(ast.statements[0].condition.operator).toBe('>');
  expect(ast.statements[0].body.type).toBe('Block');
  expect(ast.statements[0].body.statements).toHaveLength(1);
});

test('parser parses multiple statements', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, 'let x = 1\nlet y = 2\nprint x + y');

  expect(ast.statements).toHaveLength(3);
  expect(ast.statements[0].type).toBe('LetStatement');
  expect(ast.statements[1].type).toBe('LetStatement');
  expect(ast.statements[2].type).toBe('PrintStatement');
});

test('parser handles operator precedence', async ({ page }) => {
  await page.goto('/');
  const ast = await getAST(page, '1 + 2 * 3 - 4 / 2');

  // Should be: ((1 + (2 * 3)) - (4 / 2))
  const expr = ast.statements[0].expression;
  expect(expr.operator).toBe('-');
  expect(expr.left.operator).toBe('+');
  expect(expr.left.left.value).toBe(1);
  expect(expr.left.right.operator).toBe('*');
  expect(expr.right.operator).toBe('/');
});

// Negative Tests

test('parser reports missing equals in let', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x 42');
  await page.click('#run-btn');

  await page.click('.tab-btn:has-text("Output")');
  const output = await page.locator('#tab-output').textContent();
  expect(output).toContain('Parser Errors:');
  expect(output).toContain("Expected '='");
});

test('parser reports missing expression after operator', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'x +');
  await page.click('#run-btn');

  await page.click('.tab-btn:has-text("Output")');
  const output = await page.locator('#tab-output').textContent();
  expect(output).toContain('Parser Errors:');
});

test('parser reports missing closing paren', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '(1 + 2');
  await page.click('#run-btn');

  await page.click('.tab-btn:has-text("Output")');
  const output = await page.locator('#tab-output').textContent();
  expect(output).toContain('Parser Errors:');
  expect(output).toContain("Expected ')'");
});

test('parser reports missing block braces', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'if (x > 0) print x');
  await page.click('#run-btn');

  await page.click('.tab-btn:has-text("Output")');
  const output = await page.locator('#tab-output').textContent();
  expect(output).toContain('Parser Errors:');
  expect(output).toContain("Expected '{'");
});

test('parser reports unexpected token', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let = 42');
  await page.click('#run-btn');

  await page.click('.tab-btn:has-text("Output")');
  const output = await page.locator('#tab-output').textContent();
  expect(output).toContain('Parser Errors:');
  expect(output).toContain('Expected variable name');
});
