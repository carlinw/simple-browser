const { test, expect } = require('@playwright/test');

// Helper to get output
async function getOutput(page) {
  return await page.locator('#output').textContent();
}

// === UI Tests ===

test('load button exists and is visible', async ({ page }) => {
  await page.goto('/');
  const loadBtn = page.locator('#load-btn');
  await expect(loadBtn).toBeVisible();
  await expect(loadBtn).toHaveText('Load');
});

test('load button is enabled in edit mode', async ({ page }) => {
  await page.goto('/');
  const loadBtn = page.locator('#load-btn');
  await expect(loadBtn).not.toBeDisabled();
});

test('load button is disabled during debug', async ({ page }) => {
  await page.goto('/');

  // Use debug mode which runs slower
  await page.fill('#code-editor', `
    let i = 0
    while (i < 5) {
      i = i + 1
    }
  `);

  // Click debug and check load button
  await page.click('#debug-btn');
  const loadBtn = page.locator('#load-btn');
  await expect(loadBtn).toBeDisabled();
});

// === Validation Tests ===

test('empty URL shows error', async ({ page }) => {
  await page.goto('/');

  // Mock prompt to return empty string
  await page.evaluate(() => {
    window.prompt = () => '';
  });

  await page.click('#load-btn');
  const output = await getOutput(page);
  expect(output).toContain('No URL provided');
});

test('URL without .tpl extension shows error', async ({ page }) => {
  await page.goto('/');

  // Mock prompt to return invalid URL
  await page.evaluate(() => {
    window.prompt = () => 'https://example.com/file.txt';
  });

  await page.click('#load-btn');
  const output = await getOutput(page);
  expect(output).toContain('must end with .tpl');
});

test('cancelled prompt does nothing', async ({ page }) => {
  await page.goto('/');

  // Mock prompt to return null (cancelled)
  await page.evaluate(() => {
    window.prompt = () => null;
  });

  // Pre-fill editor with some content
  await page.fill('#code-editor', 'let x = 1');

  await page.click('#load-btn');

  // Editor should remain unchanged
  const editor = page.locator('#code-editor');
  await expect(editor).toHaveValue('let x = 1');
});

// === Network Tests ===

test('404 response shows error', async ({ page }) => {
  await page.goto('/');

  // Route to simulate 404
  await page.route('**/nonexistent.tpl', route => {
    route.fulfill({
      status: 404,
      statusText: 'Not Found'
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/nonexistent.tpl';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('404');
  }, { timeout: 5000 });

  const output = await getOutput(page);
  expect(output).toContain('404');
});

// === Success Tests ===

test('successful load populates editor', async ({ page }) => {
  await page.goto('/');

  // Route to simulate successful fetch
  await page.route('**/test.tpl', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'let x = 42\nprint(x)'
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/test.tpl';
  });

  await page.click('#load-btn');

  // Wait for editor to be populated
  await page.waitForFunction(() => {
    const editor = document.getElementById('code-editor');
    return editor && editor.value.includes('let x = 42');
  }, { timeout: 5000 });

  const editor = page.locator('#code-editor');
  await expect(editor).toHaveValue('let x = 42\nprint(x)');
});

test('successful load shows success message', async ({ page }) => {
  await page.goto('/');

  await page.route('**/example.tpl', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'print("hello")'
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/example.tpl';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('Loaded:');
  }, { timeout: 5000 });

  const output = await getOutput(page);
  expect(output).toContain('Loaded:');
  expect(output).toContain('example.tpl');
});

test('successful load updates line count', async ({ page }) => {
  await page.goto('/');

  await page.route('**/multiline.tpl', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'let x = 1\nlet y = 2\nlet z = 3\nprint(x + y + z)'
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/multiline.tpl';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const lineCount = document.getElementById('line-count');
    return lineCount && lineCount.textContent.includes('4');
  }, { timeout: 5000 });

  const lineCount = page.locator('#line-count');
  await expect(lineCount).toContainText('4 lines');
});

// === Case Sensitivity Test ===

test('.TPL extension is accepted (case insensitive)', async ({ page }) => {
  await page.goto('/');

  await page.route('**/EXAMPLE.TPL', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'print("uppercase")'
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/EXAMPLE.TPL';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const editor = document.getElementById('code-editor');
    return editor && editor.value.includes('uppercase');
  }, { timeout: 5000 });

  const editor = page.locator('#code-editor');
  await expect(editor).toHaveValue('print("uppercase")');
});
