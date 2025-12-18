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

test('load button is disabled during running', async ({ page }) => {
  await page.goto('/');

  // Use pause to keep program running
  await page.fill('#code-editor', 'pause()');

  // Click run and check load button while paused
  await page.click('#run-btn');
  await page.waitForSelector('#resume-btn:not(.hidden)', { timeout: 5000 });

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

// === Proxy Tests (Cloudflare Pages Function) ===

test('cross-origin URL uses proxy endpoint', async ({ page }) => {
  await page.goto('/');

  let proxyWasCalled = false;
  const crossOriginUrl = 'http://example.com/program.tpl';

  // Route the proxy endpoint
  await page.route('**/fetch?url=**', route => {
    proxyWasCalled = true;
    const url = new URL(route.request().url());
    const targetUrl = url.searchParams.get('url');

    // Verify the proxy was called with the correct URL
    if (targetUrl === crossOriginUrl) {
      route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'let proxy = "works"'
      });
    } else {
      route.fulfill({ status: 400 });
    }
  });

  await page.evaluate((url) => {
    window.prompt = () => url;
  }, crossOriginUrl);

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const editor = document.getElementById('code-editor');
    return editor && editor.value.includes('proxy');
  }, { timeout: 5000 });

  const editor = page.locator('#code-editor');
  await expect(editor).toHaveValue('let proxy = "works"');
});

test('proxy error shows error message', async ({ page }) => {
  await page.goto('/');

  // Route the proxy endpoint to return an error
  await page.route('**/fetch?url=**', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to fetch remote URL' })
    });
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://example.com/broken.tpl';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('500');
  }, { timeout: 5000 });

  const output = await getOutput(page);
  expect(output).toContain('500');
});

test('same-origin URL does not use proxy', async ({ page }) => {
  await page.goto('/');

  let directFetchCalled = false;

  // Route direct fetch (same origin)
  await page.route('**/local.tpl', route => {
    // Only match if NOT going through proxy
    if (!route.request().url().includes('/fetch?url=')) {
      directFetchCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'let direct = "fetch"'
      });
    }
  });

  await page.evaluate(() => {
    window.prompt = () => 'http://localhost:8080/local.tpl';
  });

  await page.click('#load-btn');

  await page.waitForFunction(() => {
    const editor = document.getElementById('code-editor');
    return editor && editor.value.includes('direct');
  }, { timeout: 5000 });

  const editor = page.locator('#code-editor');
  await expect(editor).toHaveValue('let direct = "fetch"');
});
