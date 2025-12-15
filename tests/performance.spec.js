const { test, expect } = require('@playwright/test');

// Performance benchmark tests
// These measure execution time to track improvements from Release 23 optimizations

// Helper to run code and measure execution time
async function benchmark(page, code, expectedOutput) {
  await page.goto('/');
  await page.fill('#code-editor', code);

  const start = Date.now();
  await page.click('#run-btn');
  await expect(page.locator('#output')).toContainText(expectedOutput);
  const elapsed = Date.now() - start;

  return elapsed;
}

test('benchmark: tight loop 10000 iterations', async ({ page }) => {
  const code = `
let sum = 0
let i = 0
while (i < 10000) {
  sum = sum + i
  i = i + 1
}
print(sum)
`;

  const elapsed = await benchmark(page, code, '49995000');
  console.log(`[BENCHMARK] Tight loop (10k): ${elapsed}ms`);

  // Baseline expectation - adjust after optimization
  expect(elapsed).toBeLessThan(30000); // 30 seconds max
});

test('benchmark: nested loops 100x100', async ({ page }) => {
  const code = `
let sum = 0
let i = 0
while (i < 100) {
  let j = 0
  while (j < 100) {
    sum = sum + 1
    j = j + 1
  }
  i = i + 1
}
print(sum)
`;

  const elapsed = await benchmark(page, code, '10000');
  console.log(`[BENCHMARK] Nested loops (100x100): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(30000);
});

test('benchmark: fibonacci recursive fib(20)', async ({ page }) => {
  const code = `
function fib(n) {
  if (n < 2) { return n }
  return fib(n - 1) + fib(n - 2)
}
print(fib(20))
`;

  const elapsed = await benchmark(page, code, '6765');
  console.log(`[BENCHMARK] Fibonacci(20): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(60000); // Recursive is slow
});

test('benchmark: array operations 1000 elements', async ({ page }) => {
  const code = `
let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let i = 0
while (i < 1000) {
  arr[i % 10] = arr[i % 10] + 1
  i = i + 1
}
print(arr[0])
`;

  const elapsed = await benchmark(page, code, '100');
  console.log(`[BENCHMARK] Array ops (1k): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(15000);
});

test('benchmark: string concatenation 500 times', async ({ page }) => {
  const code = `
let s = ""
let i = 0
while (i < 500) {
  s = s + "x"
  i = i + 1
}
print(s.length())
`;

  const elapsed = await benchmark(page, code, '500');
  console.log(`[BENCHMARK] String concat (500): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(15000);
});

test('benchmark: function calls 1000 times', async ({ page }) => {
  const code = `
function add(a, b) {
  return a + b
}

let sum = 0
let i = 0
while (i < 1000) {
  sum = add(sum, i)
  i = i + 1
}
print(sum)
`;

  const elapsed = await benchmark(page, code, '499500');
  console.log(`[BENCHMARK] Function calls (1k): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(20000);
});

test('benchmark: variable lookups in nested scope', async ({ page }) => {
  const code = `
let outer = 0
function incrementOuter() {
  outer = outer + 1
}

let i = 0
while (i < 1000) {
  incrementOuter()
  i = i + 1
}
print(outer)
`;

  const elapsed = await benchmark(page, code, '1000');
  console.log(`[BENCHMARK] Nested scope lookups (1k): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(20000);
});

test('benchmark: class instantiation and method calls', async ({ page }) => {
  const code = `
class Counter {
  value,

  increment() {
    this.value = this.value + 1
  }

  get() {
    return this.value
  }
}

let c = new Counter(0)
let i = 0
while (i < 500) {
  c.increment()
  i = i + 1
}
print(c.get())
`;

  const elapsed = await benchmark(page, code, '500');
  console.log(`[BENCHMARK] Class methods (500): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(20000);
});

test('benchmark: arithmetic expressions', async ({ page }) => {
  const code = `
let result = 0
let i = 0
while (i < 2000) {
  result = (i * 2 + 3 - 1) / 2
  i = i + 1
}
print(result)
`;

  const elapsed = await benchmark(page, code, '2000');
  console.log(`[BENCHMARK] Arithmetic (2k): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(20000);
});

test('benchmark: conditionals in loop', async ({ page }) => {
  const code = `
let even = 0
let odd = 0
let i = 0
while (i < 2000) {
  if (i % 2 equals 0) {
    even = even + 1
  } else {
    odd = odd + 1
  }
  i = i + 1
}
print(even)
`;

  const elapsed = await benchmark(page, code, '1000');
  console.log(`[BENCHMARK] Conditionals (2k): ${elapsed}ms`);

  expect(elapsed).toBeLessThan(25000);
});
