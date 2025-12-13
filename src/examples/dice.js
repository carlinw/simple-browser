// Example: Dice Roller
// Random dice simulation

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['dice'] = {
  name: 'Dice Roller',
  description: 'Roll dice with random numbers',
  code: `// Dice Roller
// Press any key to roll, 'q' to quit

print("Press any key to roll the dice...")
print("(Press 'q' to quit)")
print("")

let total = 0
let rolls = 0
let k = ""

while (k != "q") {
  k = key()
  if (k != "q") {
    let die1 = random(1, 6)
    let die2 = random(1, 6)
    rolls = rolls + 1
    total = total + die1 + die2
    print("Roll " + rolls + ": " + die1 + " + " + die2 + " = " + (die1 + die2))
  }
}

print("")
print("Total rolls: " + rolls)
print("Sum of all rolls: " + total)`)
};
