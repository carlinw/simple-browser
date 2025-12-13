// Example: Rock Paper Scissors
// Classic game against the computer

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['rps'] = {
  name: 'Rock Paper Scissors',
  description: 'Play against the computer',
  code: `// Rock Paper Scissors
// Press r=rock, p=paper, s=scissors, q=quit

print("Rock Paper Scissors!")
print("r=rock, p=paper, s=scissors, q=quit")
print("")

let wins = 0
let losses = 0
let ties = 0
let playing = true

while (playing) {
  print("Your choice:")
  let player = key()

  if (player equals "q") {
    playing = false
  } else {
    // Computer picks randomly
    let pick = random(1, 3)
    let computer = "rock"
    if (pick equals 2) {
      computer = "paper"
    } else if (pick equals 3) {
      computer = "scissors"
    }
    print("Computer: " + computer)

    // Check winner
    if (player equals "r" and computer equals "scissors") {
      print("You win!")
      wins = wins + 1
    } else if (player equals "p" and computer equals "rock") {
      print("You win!")
      wins = wins + 1
    } else if (player equals "s" and computer equals "paper") {
      print("You win!")
      wins = wins + 1
    } else if (player equals "r" and computer equals "rock") {
      print("Tie!")
      ties = ties + 1
    } else if (player equals "p" and computer equals "paper") {
      print("Tie!")
      ties = ties + 1
    } else if (player equals "s" and computer equals "scissors") {
      print("Tie!")
      ties = ties + 1
    } else {
      print("You lose!")
      losses = losses + 1
    }
    print("")
  }
}

print("Final: " + wins + "W " + losses + "L " + ties + "T")`)
};
