const { test, expect } = require('@playwright/test');

// Test that loading a new example stops any running interpreter

test('loading example stops running infinite loop', async ({ page }) => {
  await page.goto('/');

  // Enter a program with an infinite loop that would print continuously
  const code = `
let counter = 0
while (true) {
  counter = counter + 1
  print(counter)
  sleep(10)
}
`;
  await page.fill('#code-editor', code);

  // Start running the program (don't await - it will run forever)
  await page.click('#run-fast-btn');

  // Wait for some output to appear
  await page.waitForTimeout(150);

  // Click the example button to open selector
  await page.click('#example-btn');

  // Wait for the example modal to appear
  await expect(page.locator('.modal-panel')).toBeVisible();

  // Click on an example (e.g., Variables)
  await page.click('.example-card[data-id="variables"]');

  // The modal should close and the code editor should have new content
  await expect(page.locator('.modal-panel')).not.toBeVisible();

  // The code editor should now contain the Variables example code
  const editorValue = await page.locator('#code-editor').inputValue();
  expect(editorValue).toContain('let');
  expect(editorValue).not.toContain('while (true)');

  // Get the output content after loading example (should be cleared)
  const outputAfterLoad = await page.locator('#output').textContent();

  // Wait and check that no more output appears (the old loop should be stopped)
  await page.waitForTimeout(200);
  const outputAfterWait = await page.locator('#output').textContent();

  // If the old interpreter was still running, output would have grown
  // After reset, output should be empty
  expect(outputAfterLoad).toBe('');
  expect(outputAfterWait).toBe('');

  // The UI should be in a clean state, not stuck
  // Run button should be enabled (not disabled due to running state)
  await expect(page.locator('#run-btn')).not.toBeDisabled();
});

test('reset button stops running interpreter', async ({ page }) => {
  await page.goto('/');

  // Enter a program with an infinite loop that prints
  const code = `
let counter = 0
while (true) {
  counter = counter + 1
  print(counter)
  sleep(10)
}
`;
  await page.fill('#code-editor', code);

  // Start running the program
  await page.click('#run-fast-btn');

  // Wait for some output to appear
  await page.waitForTimeout(150);

  // Click reset button
  await page.click('#reset-btn');

  // Output should be cleared
  const outputAfterReset = await page.locator('#output').textContent();
  expect(outputAfterReset).toBe('');

  // Wait and verify no more output (interpreter stopped)
  await page.waitForTimeout(200);
  const outputAfterWait = await page.locator('#output').textContent();
  expect(outputAfterWait).toBe('');

  // Run button should be enabled
  await expect(page.locator('#run-btn')).not.toBeDisabled();
});
