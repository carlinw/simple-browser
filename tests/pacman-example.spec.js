const { test, expect } = require('@playwright/test');

// Test that Pacman example appears in the examples list

test('Pacman appears in examples list', async ({ page }) => {
  await page.goto('/');

  // Open examples modal
  await page.click('#example-btn');

  // Wait for modal to appear
  await expect(page.locator('.modal-panel')).toBeVisible();

  // Look for Pacman in the examples
  const pacmanCard = page.locator('.example-card[data-id="pacman"]');
  await expect(pacmanCard).toBeVisible();

  // Verify it has correct name
  await expect(pacmanCard.locator('.example-name')).toHaveText('Pacman');
});

test('Pacman example can be loaded', async ({ page }) => {
  await page.goto('/');

  // Open examples modal
  await page.click('#example-btn');
  await expect(page.locator('.modal-panel')).toBeVisible();

  // Click on Pacman
  await page.click('.example-card[data-id="pacman"]');

  // Modal should close
  await expect(page.locator('.modal-panel')).not.toBeVisible();

  // Code editor should contain Pacman code
  const editorValue = await page.locator('#code-editor').inputValue();
  expect(editorValue).toContain('Pacman');
  expect(editorValue).toContain('ghost');
});
