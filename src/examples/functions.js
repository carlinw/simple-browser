// Example: Functions & Call Stack
// Watch the call stack grow and shrink as functions call each other

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['functions'] = {
  name: 'Functions & Call Stack',
  description: 'Watch the call stack grow and shrink as functions call each other',
  code: `// Functions & Call Stack Demo
// Run animated to watch the Memory tab!

let result = 0

function add(a, b) {
  let sum = a + b
  return sum
}

function multiply(x, y) {
  let product = 0
  let i = 0
  while (i < y) {
    product = add(product, x)
    i = i + 1
  }
  return product
}

function factorial(n) {
  if (n <= 1) {
    return 1
  }
  return n * factorial(n - 1)
}

// Simple call
result = add(3, 4)
print "3 + 4 = " + result

// Nested calls
result = multiply(3, 4)
print "3 * 4 = " + result

// Recursive calls - watch the stack grow!
result = factorial(4)
print "4! = " + result`
};
