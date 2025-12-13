// Example: Prime Numbers
// Find and check prime numbers

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['primes'] = {
  name: 'Prime Numbers',
  description: 'Find and check prime numbers',
  code: `// Prime Numbers
// A prime number is only divisible by 1 and itself

// Function to check if a number is prime
function isPrime(n) {
  if (n < 2) {
    return false
  }
  let i = 2
  while (i * i <= n) {
    if (n % i == 0) {
      return false
    }
    i = i + 1
  }
  return true
}

// Test some numbers
print("Is 7 prime? " + isPrime(7))
print("Is 12 prime? " + isPrime(12))
print("Is 29 prime? " + isPrime(29))

// Find all primes up to 50
print("Primes up to 50:")
let n = 2
while (n <= 50) {
  if (isPrime(n)) {
    print(n)
  }
  n = n + 1
}

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
