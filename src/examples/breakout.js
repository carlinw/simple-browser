// Example: Breakout
// Classic brick breaker game



export const example = {
  name: 'Breakout',
  description: 'Classic brick breaker game',
  code: `// Breakout
// Use left/right arrows to move paddle

// Paddle
let paddleX = 175
let paddleW = 50
let paddleH = 8

// Ball
let ballX = 200
let ballY = 250
let ballDX = 3
let ballDY = -3

// Bricks (5 rows x 8 columns = 40 bricks)
let brickW = 45
let brickH = 12
let bricks = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

let score = 0

while (true) {
  clear()

  // Move paddle
  if (pressed("left") and paddleX > 0) {
    paddleX = paddleX - 6
  }
  if (pressed("right") and paddleX < 400 - paddleW) {
    paddleX = paddleX + 6
  }

  // Move ball
  ballX = ballX + ballDX
  ballY = ballY + ballDY

  // Ball wall collision
  if (ballX < 5 or ballX > 395) {
    ballDX = 0 - ballDX
  }
  if (ballY < 5) {
    ballDY = 0 - ballDY
  }

  // Ball paddle collision
  if (ballY > 280 and ballY < 290) {
    if (ballX > paddleX and ballX < paddleX + paddleW) {
      ballDY = 0 - ballDY
    }
  }

  // Ball missed paddle
  if (ballY > 300) {
    ballX = 200
    ballY = 250
    ballDX = 3
    ballDY = -3
  }

  // Check brick collisions
  let row = 0
  while (row < 5) {
    let col = 0
    while (col < 8) {
      let idx = row * 8 + col
      if (bricks[idx] equals 1) {
        let bx = col * 50 + 5
        let by = row * 15 + 20
        // Check collision
        if (ballX > bx and ballX < bx + brickW) {
          if (ballY > by and ballY < by + brickH) {
            bricks[idx] = 0
            ballDY = 0 - ballDY
            score = score + 1
          }
        }
      }
      col = col + 1
    }
    row = row + 1
  }

  // Draw bricks
  row = 0
  while (row < 5) {
    let col = 0
    while (col < 8) {
      let idx = row * 8 + col
      if (bricks[idx] equals 1) {
        if (row equals 0) { color("red") }
        if (row equals 1) { color("orange") }
        if (row equals 2) { color("yellow") }
        if (row equals 3) { color("green") }
        if (row equals 4) { color("cyan") }
        rect(col * 50 + 5, row * 15 + 20, brickW, brickH)
      }
      col = col + 1
    }
    row = row + 1
  }

  // Draw paddle
  color("white")
  rect(paddleX, 285, paddleW, paddleH)

  // Draw ball
  circle(ballX, ballY, 5)

  sleep(16)
}`
};
