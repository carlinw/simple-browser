// Example: Prime Numbers
// Find and check prime numbers

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['primes'] = {
  name: 'Prime Numbers',
  description: 'Find and check prime numbers',
  code: `// Prime Numbers
// A prime number is only divisible by 1 and itself
// Examples: 2, 3, 5, 7, 11, 13...

// Function to check if a number is prime
// Uses trial division up to sqrt(n)
function isPrime(n) {
  // Numbers less than 2 are not prime
  if (n < 2) {
    return false
  }

  // Check divisibility from 2 up to sqrt(n)
  // We only need to check up to sqrt because
  // if n = a * b, one factor must be <= sqrt(n)
  let i = 2
  while (i * i <= n) {
    // If divisible by i, not prime
    if (n % i equals 0) {
      return false
    }
    i = i + 1
  }
  // No divisors found - it's prime!
  return true
}

// Test the function
print("Testing isPrime:")
print("Is 7 prime? " + isPrime(7))
print("Is 12 prime? " + isPrime(12))
print("Is 29 prime? " + isPrime(29))
print("")

// Find all primes up to 50
print("Primes up to 50:")
let n = 2
while (n <= 50) {
  if (isPrime(n)) {
    print(n)
  }
  n = n + 1
}
print("")

// Count primes up to 100
let count = 0
let num = 2
while (num <= 100) {
  if (isPrime(num)) {
    count = count + 1
  }
  num = num + 1
}
print("There are " + count + " primes up to 100")`)
};
