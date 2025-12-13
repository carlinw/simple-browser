// Example: Tiny Calculator
// Basic arithmetic with user input

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['calculator'] = {
  name: 'Calculator',
  description: 'Tiny arithmetic calculator',
  code: `// Tiny Calculator
// Enter two numbers and an operation

print("Enter first number:")
let a = num(input())

print("Operation (+, -, *, /):")
let op = key()

print("Enter second number:")
let b = num(input())

let result = 0
if (op == "+") {
  result = a + b
} else {
  if (op == "-") {
    result = a - b
  } else {
    if (op == "*") {
      result = a * b
    } else {
      if (op == "/") {
        result = a / b
      }
    }
  }
}

print(a + " " + op + " " + b + " = " + result)`)
};
