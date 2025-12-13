// Example: Flappy Bird
// Tap space to fly through pipes



export const example = {
  name: 'Flappy Bird',
  description: 'Press space to fly',
  code: `// Flappy Bird
// Press SPACE to flap

let birdY = 150
let birdVel = 0
let gravity = 0.5
let flapStrength = -8

// Pipe
let pipeX = 400
let gapY = 150
let gapSize = 80
let pipeW = 40

let score = 0
let gameOver = false

while (not gameOver) {
  clear()

  // Flap
  if (pressed("space")) {
    birdVel = flapStrength
  }

  // Physics
  birdVel = birdVel + gravity
  birdY = birdY + birdVel

  // Move pipe
  pipeX = pipeX - 4

  // Reset pipe when off screen
  if (pipeX < -50) {
    pipeX = 400
    gapY = random(60, 220)
    score = score + 1
  }

  // Check collision with ground/ceiling
  if (birdY < 10 or birdY > 290) {
    gameOver = true
  }

  // Check collision with pipe
  if (pipeX < 70 and pipeX > 20) {
    if (birdY < gapY or birdY > gapY + gapSize) {
      gameOver = true
    }
  }

  // Draw pipes
  color("green")
  rect(pipeX, 0, pipeW, gapY)
  rect(pipeX, gapY + gapSize, pipeW, 300 - gapY - gapSize)

  // Draw bird
  color("yellow")
  circle(50, birdY, 12)

  // Draw score
  color("white")
  text(10, 20, "Score: " + score)

  sleep(16)
}

// Game over
clear()
color("red")
text(150, 140, "GAME OVER")
color("white")
text(150, 170, "Score: " + score)`
};
