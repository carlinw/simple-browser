// Example: Computer Guesses
// Binary search algorithm demonstration



export const example = {
  name: 'Computer Guesses',
  description: 'Computer guesses your number using binary search',
  code: `// Computer Guesses Your Number
// Think of a number, computer finds it!

print("Think of a number between 1 and 100")
print("Press 'h' if too high")
print("Press 'l' if too low")
print("Press 'c' if correct")
print("")
print("Press any key when ready...")
key()

let low = 1
let high = 100
let found = false

while (found equals false) {
  let mid = (low + high) / 2
  // Round down to integer
  mid = mid - (mid % 1)

  print("Is it " + mid + "? (h/l/c)")
  let response = key()

  if (response equals "c") {
    print("I got it!")
    found = true
  } else if (response equals "h") {
    high = mid - 1
  } else {
    low = mid + 1
  }
}`
};
