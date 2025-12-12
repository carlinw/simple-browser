// Example: Fibonacci
// Generate and explore the Fibonacci sequence

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['fibonacci'] = {
  name: 'Fibonacci',
  description: 'Generate the Fibonacci sequence',
  code: `// Fibonacci Sequence
// Each number is the sum of the two before it
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...

// Iterative approach - print first 15 numbers
print "Fibonacci sequence:"
let a = 0
let b = 1
let count = 0
while (count < 15) {
  print a
  let next = a + b
  a = b
  b = next
  count = count + 1
}

// Recursive approach
function fib(n) {
  if (n <= 1) {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

// Calculate specific Fibonacci numbers
print "fib(10) = " + fib(10)
print "fib(12) = " + fib(12)

// Note: Watch the call stack in Memory tab
// during animated run to see recursion!`
};
