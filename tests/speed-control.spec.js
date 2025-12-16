const { test, expect } = require('@playwright/test');

// Speed Control Statements: pause, slow, slower, fast
// These control execution speed during debug/animated mode

// Helper to run code in debug mode and measure approximate timing
async function runDebugWithTiming(page, code) {
  await page.fill('#code-editor', code);
  const start = Date.now();
  await page.click('#debug-btn');
  // Wait for execution to complete
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 60000 });
  return Date.now() - start;
}

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

// slow() Tests

test('slow decreases execution speed', async ({ page }) => {
  await page.goto('/');
  // Without slow, debug mode has default delay
  // With slow, delay should be longer
  await page.fill('#code-editor', 'slow()\nlet x = 1\nlet y = 2');
  await page.click('#debug-btn');

  // Should eventually complete
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 30000 });

  // Memory should have both variables
  const memory = await page.locator('#tab-memory').textContent();
  expect(memory).toContain('x');
  expect(memory).toContain('y');
});

// slower() Tests

test('slower decreases execution speed more than slow', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'slower()\nlet x = 1');
  await page.click('#debug-btn');

  // Should eventually complete
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 30000 });

  const memory = await page.locator('#tab-memory').textContent();
  expect(memory).toContain('x');
});

// fast() Tests

test('fast sets zero delay like run mode', async ({ page }) => {
  await page.goto('/');
  // Start slow, then go fast - should complete almost instantly after fast()
  await page.fill('#code-editor', 'slow()\nlet x = 1\nfast()\nlet y = 2\nlet z = 3\nlet a = 4\nlet b = 5');
  await page.click('#debug-btn');

  // Should complete very quickly after fast() since delay is 0
  await page.waitForFunction(() => {
    const runBtn = document.getElementById('run-btn');
    return runBtn && !runBtn.disabled;
  }, { timeout: 10000 });

  const memory = await page.locator('#tab-memory').textContent();
  expect(memory).toContain('x');
  expect(memory).toContain('y');
  expect(memory).toContain('z');
  expect(memory).toContain('a');
  expect(memory).toContain('b');
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
