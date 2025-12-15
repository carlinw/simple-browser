import { test, expect } from '@playwright/test';

// Helper to run code and get output
async function runFast(page, code) {
  await page.goto('/');
  await page.fill('#code-editor', code);
  await page.click('#run-btn');
  await page.waitForFunction(() => {
    const output = document.querySelector('#output');
    return output && output.textContent.trim().length > 0;
  }, { timeout: 5000 }).catch(() => {});
  return await page.locator('#output').textContent();
}

// Class Definition Tests
test('class can be defined', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y
}
print("defined")`);
  expect(output).toBe('defined');
});

test('class with method can be defined', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y,

  move(dx, dy) {
    this.x = this.x + dx
  }
}
print("defined")`);
  expect(output).toBe('defined');
});

// Instance Creation Tests
test('new creates instance with field values', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y
}
let p = new Point(10, 20)
print(p.x)
print(p.y)`);
  expect(output).toBe('10\n20');
});

test('new with wrong argument count shows error', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y
}
let p = new Point(10)`);
  expect(output).toContain('expects 2 arguments but got 1');
});

test('new with non-class shows error', async ({ page }) => {
  const output = await runFast(page, `let x = 5
let p = new x()`);
  expect(output).toContain('is not a class');
});

// Field Access Tests
test('field access returns value', async ({ page }) => {
  const output = await runFast(page, `class Player {
  name,
  health
}
let p = new Player("Connor", 100)
print(p.name)
print(p.health)`);
  expect(output).toBe('Connor\n100');
});

test('field assignment updates value', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y
}
let p = new Point(10, 20)
p.x = 50
print(p.x)`);
  expect(output).toBe('50');
});

test('field access on non-instance shows error', async ({ page }) => {
  const output = await runFast(page, `let x = 5
print(x.field)`);
  expect(output).toContain('Cannot access property on non-instance');
});

// Method Tests
test('method can access this', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y,

  getX() {
    return this.x
  }
}
let p = new Point(42, 0)
print(p.getX())`);
  expect(output).toBe('42');
});

test('method can modify this', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y,

  move(dx, dy) {
    this.x = this.x + dx
    this.y = this.y + dy
  }
}
let p = new Point(10, 20)
p.move(5, -3)
print(p.x)
print(p.y)`);
  expect(output).toBe('15\n17');
});

test('method with parameters', async ({ page }) => {
  const output = await runFast(page, `class Calculator {
  value,

  add(n) {
    this.value = this.value + n
  }
}
let c = new Calculator(10)
c.add(5)
print(c.value)`);
  expect(output).toBe('15');
});

test('method with return value', async ({ page }) => {
  const output = await runFast(page, `class Rectangle {
  width,
  height,

  area() {
    return this.width * this.height
  }
}
let r = new Rectangle(4, 5)
print(r.area())`);
  expect(output).toBe('20');
});

test('method call on non-instance shows error', async ({ page }) => {
  const output = await runFast(page, `let x = 5
x.method()`);
  expect(output).toContain('Cannot call method on non-instance');
});

test('undefined method shows error', async ({ page }) => {
  const output = await runFast(page, `class Point {
  x,
  y
}
let p = new Point(0, 0)
p.move()`);
  expect(output).toContain('Undefined method');
});

// Multiple Instances Tests
test('multiple instances are independent', async ({ page }) => {
  const output = await runFast(page, `class Counter {
  value,

  increment() {
    this.value = this.value + 1
  }
}
let a = new Counter(0)
let b = new Counter(100)
a.increment()
a.increment()
b.increment()
print(a.value)
print(b.value)`);
  expect(output).toBe('2\n101');
});

// Complex Example
test('class with multiple methods', async ({ page }) => {
  const output = await runFast(page, `class Player {
  name,
  health,

  takeDamage(amount) {
    this.health = this.health - amount
  }

  heal(amount) {
    this.health = this.health + amount
  }

  isAlive() {
    return this.health > 0
  }
}
let p = new Player("Hero", 100)
p.takeDamage(30)
print(p.health)
print(p.isAlive())
p.takeDamage(80)
print(p.isAlive())`);
  expect(output).toBe('70\ntrue\nfalse');
});
