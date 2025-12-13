// Example: Breakout
// Classic brick breaker game



export const example = {
  name: 'Breakout',
  description: 'Classic brick breaker game',
  code: `// Breakout
// Use left/right arrows to move paddle

class Ball {
  x,
  y,
  dx,
  dy,

  move() {
    this.x = this.x + this.dx
    this.y = this.y + this.dy
  }

  bounceX() {
    this.dx = 0 - this.dx
  }

  bounceY() {
    this.dy = 0 - this.dy
  }

  reset() {
    this.x = 200
    this.y = 250
    this.dx = 3
    this.dy = -3
  }

  draw() {
    color("white")
    circle(this.x, this.y, 5)
  }
}

class Paddle {
  x,
  y,
  width,
  height,
  speed,

  moveLeft() {
    if (this.x > 0) {
      this.x = this.x - this.speed
    }
  }

  moveRight() {
    if (this.x < 400 - this.width) {
      this.x = this.x + this.speed
    }
  }

  hits(ballX, ballY) {
    if (ballY > this.y and ballY < this.y + 10) {
      if (ballX > this.x and ballX < this.x + this.width) {
        return true
      }
    }
    return false
  }

  draw() {
    color("white")
    rect(this.x, this.y, this.width, this.height)
  }
}

let ball = new Ball(200, 250, 3, -3)
let paddle = new Paddle(175, 285, 50, 8, 6)

// Bricks (5 rows x 8 columns = 40 bricks)
let brickW = 45
let brickH = 12
let bricks = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

let score = 0

while (true) {
  clear()

  // Handle input
  if (pressed("left")) {
    paddle.moveLeft()
  }
  if (pressed("right")) {
    paddle.moveRight()
  }

  // Move ball
  ball.move()

  // Ball wall collision
  if (ball.x < 5 or ball.x > 395) {
    ball.bounceX()
  }
  if (ball.y < 5) {
    ball.bounceY()
  }

  // Ball paddle collision
  if (paddle.hits(ball.x, ball.y)) {
    ball.bounceY()
  }

  // Ball missed paddle
  if (ball.y > 300) {
    ball.reset()
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
        if (ball.x > bx and ball.x < bx + brickW) {
          if (ball.y > by and ball.y < by + brickH) {
            bricks[idx] = 0
            ball.bounceY()
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

  // Draw game objects
  paddle.draw()
  ball.draw()

  sleep(16)
}`
};
