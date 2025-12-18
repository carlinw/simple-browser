const { test, expect } = require('@playwright/test');
const { runFast, runUntilPause } = require('./helpers');

// Speed Control Statements: pause, slow, slower, fast
// These control execution speed and debugging

// pause() Tests

test('pause waits for resume button before continuing', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print(1)\npause()\nprint(2)');
  await page.click('#run-btn');

  // Wait for first print
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('1');
  }, { timeout: 5000 });

  // Should not have printed 2 yet (waiting at pause)
  let output = await page.locator('#output').textContent();
  expect(output).toContain('1');
  expect(output).not.toContain('2');

  // Resume button should be visible
  const resumeBtn = page.locator('#resume-btn');
  await expect(resumeBtn).toBeVisible();

  // Click resume to continue
  await resumeBtn.click();

  // Now should have printed 2
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('2');
  }, { timeout: 5000 });

  output = await page.locator('#output').textContent();
  expect(output).toContain('2');
});

test('resume button hidden when not paused', async ({ page }) => {
  await page.goto('/');

  // Resume button should not be visible initially
  const resumeBtn = page.locator('#resume-btn');
  await expect(resumeBtn).not.toBeVisible();
});

// slow/slower/fast Tests - these modify step delay for animation

test('slow sets step delay', async ({ page }) => {
  await page.goto('/');
  // slow() should work without error
  await runFast(page, 'slow()\nprint("done")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('done');
});

test('slower sets larger step delay', async ({ page }) => {
  await page.goto('/');
  // slower() should work without error
  await runFast(page, 'slower()\nprint("done")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('done');
});

test('fast sets zero delay', async ({ page }) => {
  await page.goto('/');
  // fast() should work without error
  await runFast(page, 'slow()\nfast()\nprint("done")');

  const output = await page.locator('#output').textContent();
  expect(output).toContain('done');
});

// Combined Tests

test('speed commands work in run mode with pause', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'slow()\nprint(1)\nfast()\nprint(2)\npause()\nprint(3)');
  await page.click('#run-btn');

  // Wait for pause to be reached (resume button visible)
  await page.waitForSelector('#resume-btn:not(.hidden)', { timeout: 5000 });

  // Click resume to continue
  await page.click('#resume-btn');

  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('3');
  }, { timeout: 5000 });

  const output = await page.locator('#output').textContent();
  expect(output).toContain('1');
  expect(output).toContain('2');
  expect(output).toContain('3');
});

test('speed commands are statements not expressions', async ({ page }) => {
  await page.goto('/');
  // These should work as standalone statements
  await page.fill('#code-editor', 'slow()\nslower()\nfast()\npause()');
  await page.click('#run-btn');

  // Wait for pause to be reached
  await page.waitForSelector('#resume-btn:not(.hidden)', { timeout: 5000 });
  await page.click('#resume-btn');

  // Wait for completion - no errors expected
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 5000 });

  // Output should be empty (no print statements) and no errors
  const output = await page.locator('#output').textContent();
  expect(output).not.toContain('Error');
});
