// Test Helpers - Shared utilities for Playwright tests

/**
 * Run code with Run button (fast mode, no animation) and wait for text output
 */
async function runFast(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });
}

/**
 * Run code that contains pause() and wait for debug mode to be entered
 */
async function runUntilPause(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  // Wait for debug panel to appear (pause() was hit)
  await page.waitForSelector('#debug-panel:not(.hidden)', { timeout: 5000 });
}

/**
 * Run code with Run Fast button and wait for canvas to appear
 */
async function runFastGraphics(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForSelector('#output canvas', { timeout: 5000 });
}

/**
 * Run code with Run Fast button and wait for mixed mode (canvas + text area)
 */
async function runFastMixed(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForSelector('#output canvas', { timeout: 5000 });
  await page.waitForSelector('#output .output-text', { timeout: 5000 });
}

/**
 * Get the text content of the output pane
 */
async function getOutput(page) {
  return await page.locator('#output').textContent();
}

module.exports = {
  runFast,
  runUntilPause,
  runFastGraphics,
  runFastMixed,
  getOutput
};
