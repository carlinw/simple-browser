// Example: Control Flow
// if/else branches and while loops

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['control-flow'] = {
  name: 'Control Flow',
  description: 'if/else branches and while loops',
  code: `// Control Flow Demo

// Simple if statement
let temperature = 75
if (temperature > 70) {
  print "It's warm outside"
}

// if-else
let score = 85
if (score >= 90) {
  print "Grade: A"
} else {
  print "Grade: B or lower"
}

// Nested if-else (grade calculator)
let grade = 72
if (grade >= 90) {
  print "A"
} else {
  if (grade >= 80) {
    print "B"
  } else {
    if (grade >= 70) {
      print "C"
    } else {
      print "F"
    }
  }
}

// While loop - countdown
print "Countdown:"
let count = 5
while (count > 0) {
  print count
  count = count - 1
}
print "Liftoff!"

// While loop - find first power of 2 over 100
let power = 1
while (power <= 100) {
  power = power * 2
}
print "First power of 2 over 100: " + power`
};
