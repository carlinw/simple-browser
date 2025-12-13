// Logical Operators Example
window.EXAMPLES = window.EXAMPLES || {};
window.EXAMPLES['operators'] = {
  name: 'Logical Operators',
  description: 'Boolean logic and modulo',
  code: `// Logical AND
let age = 25
let hasLicense = true
if (age >= 16 and hasLicense) {
  print("Can drive")
}

// Logical OR
let isWeekend = false
let isHoliday = true
if (isWeekend or isHoliday) {
  print("Day off!")
}

// Logical NOT
let isRaining = false
if (not isRaining) {
  print("No umbrella needed")
}

// Modulo - check even/odd
let n = 0
while (n < 6) {
  if (n % 2 equals 0) {
    print(n + " is even")
  } else {
    print(n + " is odd")
  }
  n = n + 1
}

// Unary minus
let temp = 10
print("Opposite: " + -temp)`)
};
