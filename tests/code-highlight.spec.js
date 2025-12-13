const { test, expect } = require('@playwright/test');

// Code Highlighting Tests - verify source code highlights during animated execution

test('code highlights during animated run', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#run-btn');

  // Wait for execution to start and code-executing class to appear
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 3000 });
});

test('code highlight moves through statements', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 1\nlet y = 2');
  await page.click('#run-btn');

  // Wait for first highlight
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 3000 });

  // Get the highlighted text
  const firstHighlight = await page.locator('.code-executing').textContent();

  // Wait for it to change (next statement)
  await page.waitForFunction(
    (firstText) => {
      const el = document.querySelector('.code-executing');
      return el && el.textContent !== firstText;
    },
    firstHighlight,
    { timeout: 10000 }
  );

  // Verify we now have a different highlight
  const secondHighlight = await page.locator('.code-executing').textContent();
  expect(secondHighlight).not.toBe(firstHighlight);
});

test('code highlight cleared after execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)');
  await page.click('#run-btn');

  // Wait for execution to complete (output appears)
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('1');
  }, { timeout: 10000 });

  // Verify no code-executing class remains
  const executingElements = await page.locator('.code-executing').count();
  expect(executingElements).toBe(0);
});

test('code highlight works with if statement', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'if (true) { print(1) }');
  await page.click('#run-btn');

  // Wait for execution to start
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 3000 });

  // Eventually the inner print should be highlighted
  await page.waitForFunction(() => {
    const el = document.querySelector('.code-executing');
    return el && el.textContent.includes('print');
  }, { timeout: 15000 });
});

test('code highlight spans correct characters', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let longVariableName = 12345');
  await page.click('#run-btn');

  // Wait for highlight to appear
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 3000 });

  // Verify the entire statement is highlighted
  const highlightedText = await page.locator('.code-executing').textContent();
  expect(highlightedText).toContain('let');
  expect(highlightedText).toContain('longVariableName');
  expect(highlightedText).toContain('12345');
});

test('no code highlight during Run Fast', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42\nprint(x)');
  await page.click('#run-fast-btn');

  // Wait for output
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('42');
  }, { timeout: 5000 });

  // Verify no code-executing class (fast mode doesn't animate)
  const executingElements = await page.locator('.code-executing').count();
  expect(executingElements).toBe(0);
});

test('code display shows source during animated execution', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42');
  await page.click('#run-btn');

  // Code display should be visible during execution
  await expect(page.locator('#code-display')).toBeVisible({ timeout: 3000 });

  // Code editor should be hidden
  await expect(page.locator('#code-editor')).toBeHidden();

  // Code display should contain the source
  const displayText = await page.locator('#code-display').textContent();
  expect(displayText).toContain('let x = 42');
});

test('code highlight syncs with AST node highlight', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)');
  await page.click('#run-btn');

  // Wait for both highlights to appear
  await expect(page.locator('.code-executing')).toBeVisible({ timeout: 3000 });

  // AST node should also have highlighting (ast-executing class)
  // The AST pane may need to be visible
  await page.click('[data-tab="ast"]');
  await expect(page.locator('.ast-executing')).toBeVisible({ timeout: 3000 });
});
