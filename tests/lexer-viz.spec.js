const { test, expect } = require('@playwright/test');
const { runUntilPause } = require('./helpers');

// Basic UI Tests

test('stop button exists but hidden initially', async ({ page }) => {
  await page.goto('/');
  const stopBtn = page.locator('#stop-btn');
  await expect(stopBtn).toHaveCount(1);  // Exists in DOM
  await expect(stopBtn).toHaveClass(/hidden/);  // But hidden in edit mode
  await expect(stopBtn).toHaveText('Stop');
});

test('code display shows source when paused', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'let x = 5\npause()');

  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();

  // Code display should contain the source code
  const displayText = await codeDisplay.textContent();
  expect(displayText).toContain('let x = 5');
});

test('stop button resets to edit mode from debug mode', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'pause()\nlet x = 1');
  await page.click('#stop-btn');

  // Textarea should be visible and editable
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
  await expect(editor).not.toBeDisabled();
});

test('cannot edit while running/paused', async ({ page }) => {
  await page.goto('/');
  await runUntilPause(page, 'pause()\nlet x = 5');

  // Editor should be hidden
  const editor = page.locator('#code-editor');
  await expect(editor).toBeHidden();

  // Code display should be visible instead
  const codeDisplay = page.locator('#code-display');
  await expect(codeDisplay).toBeVisible();
});

// Language Help Tests (language help shows fullscreen when tab is clicked)

test('language help tab exists in code pane', async ({ page }) => {
  await page.goto('/');
  const helpTab = page.locator('#help-tab-btn');
  await expect(helpTab).toBeVisible();
  await expect(helpTab).toHaveText('Language Help');
});

test('clicking language help tab shows help fullscreen', async ({ page }) => {
  await page.goto('/');

  // Click the help tab
  await page.click('#help-tab-btn');

  // Main content should be hidden, help should be visible
  await expect(page.locator('body')).toHaveClass(/help-active/);
  await expect(page.locator('#language-help')).toBeVisible();

  // Help iframe should contain the reference content
  const iframe = page.frameLocator('#help-iframe');
  await expect(iframe.locator('#literals')).toBeVisible();
});

test('clicking back button returns to code view', async ({ page }) => {
  await page.goto('/');

  // Open help
  await page.click('#help-tab-btn');
  await expect(page.locator('body')).toHaveClass(/help-active/);

  // Click back button in iframe
  const iframe = page.frameLocator('#help-iframe');
  await iframe.locator('#back-btn').click();

  // Should be back to normal view
  await expect(page.locator('body')).not.toHaveClass(/help-active/);
  await expect(page.locator('#code-editor')).toBeVisible();
});

test('language help shows keywords', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  expect(text).toContain('let');
  expect(text).toContain('if');
  expect(text).toContain('while');
  expect(text).toContain('print');
});

test('language help shows operators', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  expect(text).toContain('+');
  expect(text).toContain('-');
  expect(text).toContain('*');
  expect(text).toContain('/');
  expect(text).toContain('equals');
});

test('language help shows types', async ({ page }) => {
  await page.goto('/');
  await page.click('#help-tab-btn');

  const iframe = page.frameLocator('#help-iframe');
  const content = iframe.locator('#content');
  const text = await content.textContent();
  // Types are documented in the Literals section
  expect(text).toContain('integer');
  expect(text).toContain('float');
  expect(text).toContain('String');
  expect(text).toContain('Boolean');
  expect(text).toContain('Array');
  expect(text).toContain('Function');
});
