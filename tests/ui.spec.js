const { test, expect } = require('@playwright/test');

// Positive Tests

test('page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Simple Interpreter');
});

test('page has code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
});

test('page has output pane', async ({ page }) => {
  await page.goto('/');
  const output = page.locator('#output');
  await expect(output).toBeVisible();
});

test('page has run button', async ({ page }) => {
  await page.goto('/');
  const runBtn = page.locator('#run-btn');
  await expect(runBtn).toBeVisible();
  await expect(runBtn).toHaveText('Run');
});

test('clicking run shows greeting', async ({ page }) => {
  await page.goto('/');
  await page.click('#run-btn');
  const output = page.locator('#output');
  await expect(output).toContainText('Hello, Connor!');
});

test('can type in code editor', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('#code-editor');
  await editor.fill('print hello');
  await expect(editor).toHaveValue('print hello');
});

// Negative Tests

test('output is empty before run', async ({ page }) => {
  await page.goto('/');
  const output = page.locator('#output');
  await expect(output).toBeEmpty();
});
