// Test Helpers - Shared utilities for Playwright tests

/**
 * Run code with Run Fast button and wait for text output
 */
async function runFast(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  });
}

/**
 * Run code with Run Fast button and wait for canvas to appear
 */
async function runFastGraphics(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
  await page.waitForSelector('#output canvas', { timeout: 5000 });
}

/**
 * Run code with Run Fast button and wait for mixed mode (canvas + text area)
 */
async function runFastMixed(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-fast-btn');
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
  runFastGraphics,
  runFastMixed,
  getOutput
};
