// Example: FizzBuzz
// Classic programming challenge



export const example = {
  name: 'FizzBuzz',
  description: 'Classic programming challenge',
  code: `// FizzBuzz - Classic Programming Challenge
// Rules:
// - Print numbers 1 to 20
// - For multiples of 3, print "Fizz" instead
// - For multiples of 5, print "Buzz" instead
// - For multiples of both, print "FizzBuzz"

// Start counting from 1
let n = 1

// Loop through numbers 1-20
while (n <= 20) {
  // Check divisibility using modulo (%)
  // n % 3 equals 0 means n is divisible by 3
  if (n % 3 equals 0 and n % 5 equals 0) {
    // Divisible by both 3 and 5
    print("FizzBuzz")
  } else if (n % 3 equals 0) {
    // Divisible by 3 only
    print("Fizz")
  } else if (n % 5 equals 0) {
    // Divisible by 5 only
    print("Buzz")
  } else {
    // Not divisible by 3 or 5
    print(n)
  }
  n = n + 1
}`
};
