// Example: Tiny Pong
// Classic pong game with one paddle

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['pong'] = {
  name: 'Tiny Pong',
  description: 'Classic pong with arrow keys',
  code: `// Tiny Pong
// Use up/down arrow keys to move paddle

let paddleY = 130
let paddleH = 40
let ballX = 200
let ballY = 150
let ballDX = 4
let ballDY = 3
let score = 0

while (true) {
  clear()

  // Draw paddle
  color("white")
  rect(10, paddleY, 10, paddleH)

  // Draw ball
  circle(ballX, ballY, 5)

  // Draw score
  rect(395, 10, 2, score * 5)

  // Move paddle
  if (pressed("up") and paddleY > 0) {
    paddleY = paddleY - 6
  }
  if (pressed("down") and paddleY < 300 - paddleH) {
    paddleY = paddleY + 6
  }

  // Move ball
  ballX = ballX + ballDX
  ballY = ballY + ballDY

  // Bounce off top/bottom
  if (ballY < 5 or ballY > 295) {
    ballDY = 0 - ballDY
  }

  // Bounce off right wall
  if (ballX > 395) {
    ballDX = 0 - ballDX
  }

  // Bounce off paddle
  if (ballX < 25 and ballX > 15) {
    if (ballY > paddleY and ballY < paddleY + paddleH) {
      ballDX = 0 - ballDX
      score = score + 1
    }
  }

  // Reset if ball goes off left
  if (ballX < 0) {
    ballX = 200
    ballY = 150
    score = 0
  }

  sleep(16)
}`
};
