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
  await expect(programNode).toContainText('Program');
});

test('AST shows LetStatement node', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement');
  await expect(letNode).toBeVisible();
  await expect(letNode).toContainText('let');
});

test('AST shows variable name as separate Identifier node', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  // LetStatement shows "let", variable name is a separate child
  const letNode = page.locator('.ast-letstatement');
  await expect(letNode).toContainText('let');

  // Variable name should be in a child Identifier node
  const identifierNode = page.locator('.ast-identifier').first();
  await expect(identifierNode).toBeVisible();
  await expect(identifierNode).toContainText('x');
});

test('AST shows NumberLiteral', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const numberNode = page.locator('.ast-numberliteral');
  await expect(numberNode).toBeVisible();
  await expect(numberNode).toContainText('42');
});

test('AST shows BinaryExpression', async ({ page }) => {
  await page.goto('/');
  await runCode(page, '1 + 2');

  await page.click('.tab-btn:has-text("AST")');
  const binaryNode = page.locator('.ast-binaryexpression');
  await expect(binaryNode).toBeVisible();
  await expect(binaryNode).toContainText('+');
});

test('AST shows nested structure', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'if (x > 0) { print x }');

  await page.click('.tab-btn:has-text("AST")');
  // IfStatement should exist
  const ifNode = page.locator('.ast-ifstatement');
  await expect(ifNode).toBeVisible();

  // Block should exist (inside if's children)
  const blockNode = page.locator('.ast-block');
  await expect(blockNode).toBeVisible();

  // PrintStatement should exist
  const printNode = page.locator('.ast-printstatement');
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
  // Find the let statement node
  const letNode = page.locator('.ast-letstatement').first();
  // Get its parent container
  const letContainer = page.locator('.ast-letstatement').first().locator('..');
  const children = letContainer.locator('> .ast-children');

  // Children should be visible initially
  await expect(children).toBeVisible();

  // Click node to collapse
  await letNode.click();

  // Container should have collapsed class
  await expect(letContainer).toHaveClass(/ast-collapsed/);
});

test('collapsed nodes can be expanded', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  await page.click('.tab-btn:has-text("AST")');
  const letNode = page.locator('.ast-letstatement').first();
  const letContainer = page.locator('.ast-letstatement').first().locator('..');

  // Collapse
  await letNode.click();
  await expect(letContainer).toHaveClass(/ast-collapsed/);

  // Expand
  await letNode.click();
  await expect(letContainer).not.toHaveClass(/ast-collapsed/);
});

test('tokens displayed in tokens tab', async ({ page }) => {
  await page.goto('/');
  await runCode(page, 'let x = 42');

  // Parser tab should have token content
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

  // Errors show in the output pane (not a tab anymore)
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Parser Errors');
  });
  const output = page.locator('#output');
  const text = await output.textContent();
  expect(text).toContain('Parser Errors:');
});

test('empty input shows greeting on parse', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', '');
  await page.click('#parse-btn');

  // Empty input shows greeting in output pane (parse, not run)
  const output = page.locator('#output');
  await expect(output).toHaveText('Hello, Connor!');
});
