// Example: Guess the Number
// Interactive game using input() and random()

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['guess-number'] = {
  name: 'Guess the Number',
  description: 'Classic guessing game with input and random',
  code: `// Guess the Number
// Try to guess the secret number!

let secret = random(1, 100)
let guess = 0
let attempts = 0

print "I'm thinking of a number between 1 and 100"

while (guess != secret) {
  print "Your guess:"
  guess = num(input())
  attempts = attempts + 1

  if (guess < secret) {
    print "Too low!"
  } else {
    if (guess > secret) {
      print "Too high!"
    }
  }
}

print "Correct! You got it in " + attempts + " attempts"`
};
