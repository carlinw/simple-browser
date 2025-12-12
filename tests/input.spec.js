const { test, expect } = require('@playwright/test');

// Input Tests - these require UI interaction

test('input returns entered value', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print "Name:"\nlet name = input()\nprint "Hello, " + name');
  await page.click('#run-fast-btn');

  // Wait for input field to appear
  await page.waitForSelector('.input-field');

  // Type in the input field
  await page.fill('.input-field', 'Alice');

  // Press Enter to submit
  await page.press('.input-field', 'Enter');

  // Wait for output to have the result
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Hello, Alice');
  });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Hello, Alice');
});

test('input in expression', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print "Say something: " + input()');
  await page.click('#run-fast-btn');

  // Wait for input field to appear
  await page.waitForSelector('.input-field');

  // Type in the input field
  await page.fill('.input-field', 'hello');

  // Press Enter to submit
  await page.press('.input-field', 'Enter');

  // Wait for output to have the result
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Say something: hello');
  });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('Say something: hello');
});

test('key returns single character', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print "Press a key:"\nlet k = key()\nprint "You pressed: " + k');
  await page.click('#run-fast-btn');

  // Wait for key prompt to appear
  await page.waitForSelector('.key-prompt');

  // Press a key (on the document, not an input field)
  await page.keyboard.press('a');

  // Wait for output to have the result
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('You pressed: a');
  });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('You pressed: a');
});
