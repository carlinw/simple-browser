const { test, expect } = require('@playwright/test');

// Helper to run code and get output
async function runCode(page, code) {
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 5000 }).catch(() => {});
  return await page.locator('#output').textContent();
}

// ===== TOOLBAR TESTS =====

test('toolbar shows Run and Load initially, Stop hidden', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#run-btn')).toBeVisible();
  await expect(page.locator('#load-btn')).toBeVisible();
  // Stop should be hidden in edit mode
  await expect(page.locator('#stop-btn')).toHaveClass(/hidden/);
  // Old buttons should not exist
  await expect(page.locator('#step-btn')).toHaveCount(0);
  await expect(page.locator('#debug-btn')).toHaveCount(0);
});

test('stop button visible when running', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'pause()');
  await page.click('#run-btn');
  // Wait for pause (running state)
  await expect(page.locator('#step-into-btn')).toBeVisible({ timeout: 5000 });
  // Stop should now be visible
  await expect(page.locator('#stop-btn')).toBeVisible();
  await expect(page.locator('#stop-btn')).not.toHaveClass(/hidden/);
});

test('debug buttons hidden initially', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#step-into-btn')).toHaveClass(/hidden/);
  await expect(page.locator('#step-over-btn')).toHaveClass(/hidden/);
  await expect(page.locator('#resume-btn')).toHaveClass(/hidden/);
});

// ===== LAYOUT TESTS =====

test('2-column layout without memory pane', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#interpreter-pane')).toHaveCount(0);
  await expect(page.locator('#code-pane')).toBeVisible();
  await expect(page.locator('#output-pane')).toBeVisible();
});

// ===== PAUSE/DEBUG MODE TESTS =====

test('pause() shows debug buttons', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'pause()\nprint("after")');
  await page.click('#run-btn');

  // Wait for pause - debug buttons should appear
  await expect(page.locator('#step-into-btn')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#step-over-btn')).toBeVisible();
  await expect(page.locator('#resume-btn')).toBeVisible();
});

test('pause() splits code pane showing debug panel', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42\npause()\nprint(x)');
  await page.click('#run-btn');

  // Wait for debug panel
  await expect(page.locator('#debug-panel')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#code-pane')).toHaveClass(/debug-mode/);
});

test('stack frames show in debug panel', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'let x = 42\npause()\nprint(x)');
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#debug-panel')).toBeVisible({ timeout: 5000 });
  // Should show global frame with variable
  await expect(page.locator('#debug-stack-frames')).toContainText('x');
  await expect(page.locator('#debug-stack-frames')).toContainText('42');
});

test('global variables shown when paused inside block scope', async ({ page }) => {
  await page.goto('/');
  // This creates a block scope inside the while loop
  // Global variables should still be visible in the call stack
  await page.fill('#code-editor', `let count = 0
while (count < 3) {
  count = count + 1
  pause()
}`);
  await page.click('#run-btn');

  // Wait for first pause (inside while block)
  await expect(page.locator('#debug-panel')).toBeVisible({ timeout: 5000 });

  // Global variable 'count' should be visible even though we're inside a block
  await expect(page.locator('#debug-stack-frames')).toContainText('count');
  await expect(page.locator('#debug-stack-frames')).toContainText('1');
});

test('resume hides debug panel and buttons', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'pause()\nprint("done")');
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#resume-btn')).toBeVisible({ timeout: 5000 });

  // Click resume
  await page.click('#resume-btn');

  // Wait for program to complete
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('done');
  }, { timeout: 5000 });

  // Debug UI should hide
  await expect(page.locator('#step-into-btn')).toHaveClass(/hidden/);
  await expect(page.locator('#debug-panel')).toHaveClass(/hidden/);
});

// ===== STEP INTO TESTS =====

test('step into advances one statement', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `pause()
let x = 1
let y = 2`);
  await page.click('#run-btn');

  // Wait for pause - x should not exist yet
  await expect(page.locator('#step-into-btn')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#debug-stack-frames')).not.toContainText('x');

  // Click step into - should execute "let x = 1"
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  // x should now exist, y should not
  await expect(page.locator('#debug-stack-frames')).toContainText('x');
  await expect(page.locator('#debug-stack-frames')).toContainText('1');
  // Check that y is not a variable (it might appear in "Array" legend)
  const html = await page.locator('#debug-stack-frames').innerHTML();
  expect(html).not.toContain('data-name="y"');
});

test('step into enters function call', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function foo() {
  let inner = 10
  return inner
}
pause()
let result = foo()`);
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#step-into-btn')).toBeVisible({ timeout: 5000 });

  // Click step into - should enter foo() and pause at first statement
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  // Should now be inside foo - stack should show foo frame
  await expect(page.locator('#debug-stack-frames')).toContainText('foo');
});

test('step into on built-in function acts as step over', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `pause()
print("hello")
let x = 42`);
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#step-into-btn')).toBeVisible({ timeout: 5000 });

  // Click step into on print() - should execute print and move to next line
  // NOT try to step into the print function internals
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  // Output should show "hello" (print executed)
  await expect(page.locator('#output')).toContainText('hello');

  // Should be paused on line 3 now (let x = 42), not stuck
  // Step again to execute it
  await page.click('#step-into-btn');
  await page.waitForTimeout(100);

  // x should now exist
  await expect(page.locator('#debug-stack-frames')).toContainText('x');
  await expect(page.locator('#debug-stack-frames')).toContainText('42');
});

// ===== STEP OVER TESTS =====

test('step over advances one statement', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `pause()
let x = 1
let y = 2`);
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#step-over-btn')).toBeVisible({ timeout: 5000 });

  // Click step over - should execute "let x = 1"
  await page.click('#step-over-btn');
  await page.waitForTimeout(100);

  // x should now exist
  await expect(page.locator('#debug-stack-frames')).toContainText('x');
  await expect(page.locator('#debug-stack-frames')).toContainText('1');
});

test('step over executes function without entering', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function foo() {
  let inner = 10
  return inner
}
pause()
let result = foo()
let after = 99`);
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#step-over-btn')).toBeVisible({ timeout: 5000 });

  // Click step over - should execute foo() entirely without stopping inside
  await page.click('#step-over-btn');
  await page.waitForTimeout(100);

  // Should have result = 10, should NOT be inside foo (no foo frame)
  await expect(page.locator('#debug-stack-frames')).toContainText('result');
  await expect(page.locator('#debug-stack-frames')).toContainText('10');
  // Stack should only show global frame, not foo frame
  // (foo will appear as a variable since it's a function declaration)
  const frameHeaders = await page.locator('.frame-header').allTextContents();
  expect(frameHeaders).toEqual(['<global>']);  // Only global frame, not foo()
});

// ===== STACK FRAME INFO TESTS =====

test('stack frame shows function name', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function myFunc() {
  pause()
}
myFunc()`);
  await page.click('#run-btn');

  await expect(page.locator('#debug-stack-frames')).toContainText('myFunc', { timeout: 5000 });
});

test('stack frame shows local variables', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function test(a, b) {
  let sum = a + b
  pause()
  return sum
}
test(3, 4)`);
  await page.click('#run-btn');

  // Should show parameters and local var
  await expect(page.locator('#debug-stack-frames')).toContainText('a', { timeout: 5000 });
  await expect(page.locator('#debug-stack-frames')).toContainText('3');
  await expect(page.locator('#debug-stack-frames')).toContainText('b');
  await expect(page.locator('#debug-stack-frames')).toContainText('4');
  await expect(page.locator('#debug-stack-frames')).toContainText('sum');
  await expect(page.locator('#debug-stack-frames')).toContainText('7');
});

test('stack frame shows call site line number', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function foo() {
  pause()
}
foo()`);
  await page.click('#run-btn');

  // Should show where foo was called from (line 4)
  await expect(page.locator('#debug-stack-frames')).toContainText('line 4', { timeout: 5000 });
});

test('nested function calls show multiple stack frames', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', `function inner() {
  pause()
}
function outer() {
  inner()
}
outer()`);
  await page.click('#run-btn');

  // Should show both inner and outer frames
  await expect(page.locator('#debug-stack-frames')).toContainText('inner', { timeout: 5000 });
  await expect(page.locator('#debug-stack-frames')).toContainText('outer');
});

// ===== NEGATIVE TESTS =====

test('debug buttons do not appear without pause()', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'print("hello")');
  await page.click('#run-btn');

  // Wait for completion
  await page.waitForFunction(() => {
    const output = document.getElementById('output');
    return output && output.textContent.includes('hello');
  }, { timeout: 5000 });

  // Debug buttons should remain hidden
  await expect(page.locator('#step-into-btn')).toHaveClass(/hidden/);
  await expect(page.locator('#step-over-btn')).toHaveClass(/hidden/);
});

test('stop button works during debug mode', async ({ page }) => {
  await page.goto('/');
  await page.fill('#code-editor', 'pause()\nprint("never")');
  await page.click('#run-btn');

  // Wait for pause
  await expect(page.locator('#resume-btn')).toBeVisible({ timeout: 5000 });

  // Click stop
  await page.click('#stop-btn');

  // Should return to edit mode
  await expect(page.locator('#code-editor')).toBeVisible();
  await expect(page.locator('#debug-panel')).toHaveClass(/hidden/);
  await expect(page.locator('#step-into-btn')).toHaveClass(/hidden/);
});

test('debug panel hidden in edit mode', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#debug-panel')).toHaveClass(/hidden/);
});
