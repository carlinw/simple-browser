// Arrays example
window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['arrays'] = {
  name: 'Arrays',
  description: 'Array creation and manipulation',
  code: `// Create an array
let numbers = [10, 20, 30, 40, 50]

// Access elements (zero-based index)
print(numbers[0])
print(numbers[2])

// Modify elements
numbers[1] = 25
print(numbers[1])

// Get array length
print(len(numbers))

// Loop through array
let i = 0
let sum = 0
while (i < len(numbers)) {
  sum = sum + numbers[i]
  i = i + 1
}
print("Sum: " + sum)`)
};
