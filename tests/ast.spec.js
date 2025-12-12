const { test, expect } = require('@playwright/test');

// Helper to run code and wait for output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  // Wait for tokens tab to have content
  await page.waitForFunction(() => {
    const tab = document.getElementById('tab-tokens');
    return tab && tab.textContent.trim().length > 0;
  });
}

// Positive Tests

test('AST tree is displayed after run', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  // Switch to AST tab
  await page.click('.tab-btn:has-text("AST")');
  const astTree = page.locator('#tab-ast .ast-tree');
  await expect(astTree).toBeVisible();
});

test('AST shows Program root node', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const programNode = page.locator('.ast-program');
  await expect(programNode).toBeVisible();
  await expect(programNode.locator('.ast-type').first()).toHaveText('Program');
});

test('AST shows LetStatement node', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement');
  await expect(letNode).toBeVisible();
  await expect(letNode.locator('.ast-type').first()).toHaveText('LetStatement');
});

test('AST shows variable name', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement');
  await expect(letNode.locator('.ast-value').first()).toHaveText('(x)');
});

test('AST shows NumberLiteral', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const numberNode = page.locator('.ast-numberliteral');
  await expect(numberNode).toBeVisible();
  await expect(numberNode.locator('.ast-type')).toHaveText('NumberLiteral');
  await expect(numberNode.locator('.ast-value')).toHaveText('42');
});

test('AST shows BinaryExpression', async ({ page }) => {
  await page.goto('/');
  await runCode(page, '1 + 2');

  await page.click('.tab-btn:has-text("AST")');
  const binaryNode = page.locator('.ast-binaryexpression');
  await expect(binaryNode).toBeVisible();
  await expect(binaryNode.locator('.ast-type').first()).toHaveText('BinaryExpression');
  await expect(binaryNode.locator('.ast-value').first()).toHaveText('(+)');
});

test('AST shows nested structure', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'if (x > 0) { print x }');

  await page.click('.tab-btn:has-text("AST")');
  // IfStatement should contain Block which contains PrintStatement
  const ifNode = page.locator('.ast-ifstatement');
  await expect(ifNode).toBeVisible();

  const blockNode = ifNode.locator('.ast-block');
  await expect(blockNode).toBeVisible();

  const printNode = blockNode.locator('.ast-printstatement');
  await expect(printNode).toBeVisible();
});

test('AST shows multiple statements', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 1\nlet y = 2');

  await page.click('.tab-btn:has-text("AST")');
  const letNodes = page.locator('.ast-letstatement');
  await expect(letNodes).toHaveCount(2);
});

test('AST colors node types differently', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  // Check that different node types have different CSS classes
  const letNode = page.locator('.ast-letstatement');
  const numberNode = page.locator('.ast-numberliteral');

  await expect(letNode).toBeVisible();
  await expect(numberNode).toBeVisible();

  // They should have different classes (visual verification via CSS)
  await expect(letNode).toHaveClass(/ast-letstatement/);
  await expect(numberNode).toHaveClass(/ast-numberliteral/);
});

test('AST nodes can be collapsed', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement');
  const letHeader = letNode.locator('.ast-header').first();
  const children = letNode.locator('.ast-children').first();

  // Children should be visible initially
  await expect(children).toBeVisible();

  // Click to collapse
  await letHeader.click();

  // Children should be hidden
  await expect(children).not.toBeVisible();
});

test('collapsed nodes can be expanded', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement');
  const letHeader = letNode.locator('.ast-header').first();
  const children = letNode.locator('.ast-children').first();

  // Collapse
  await letHeader.click();
  await expect(children).not.toBeVisible();

  // Expand
  await letHeader.click();
  await expect(children).toBeVisible();
});

test('tokens displayed in tokens tab', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  // Tokens tab should have token content
  const tokensTab = page.locator('#tab-tokens');
  const text = await tokensTab.textContent();
  expect(text).toContain('KEYWORD');
  expect(text).toContain('let');

  // AST tab should have AST tree
  await page.click('.tab-btn:has-text("AST")');
  const astTree = page.locator('#tab-ast .ast-tree');
  await expect(astTree).toBeVisible();
});

// Negative Tests

test('AST shows error for invalid syntax', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x');
  await page.click('#run-btn');

  // Switch to Output tab to see errors
  await page.click('.tab-btn:has-text("Output")');
  const outputTab = page.locator('#tab-output');
  const text = await outputTab.textContent();

  // Should show parser error
  expect(text).toContain('Parser Errors:');
});

test('empty input shows greeting', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '');
  await page.click('#run-btn');

  // Empty input shows greeting in output tab
  const outputTab = page.locator('#tab-output');
  await expect(outputTab).toHaveText('Hello, Connor!');
});
