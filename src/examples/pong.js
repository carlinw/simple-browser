// Example: Tiny Pong
// Classic pong game with one paddle



export const example = {
  name: 'Tiny Pong',
  description: 'Classic pong with arrow keys',
  code: `// Tiny Pong
// Use up/down arrow keys to move paddle

class Ball {
  x,
  y,
  dx,
  dy,

  move() {
    this.x = this.x + this.dx
    this.y = this.y + this.dy
  }

  bounceY() {
    this.dy = 0 - this.dy
  }

  bounceX() {
    this.dx = 0 - this.dx
  }

  reset() {
    this.x = 200
    this.y = 150
  }

  draw() {
    circle(this.x, this.y, 5)
  }
}

class Paddle {
  x,
  y,
  width,
  height,
  speed,

  moveUp() {
    if (this.y > 0) {
      this.y = this.y - this.speed
    }
  }

  moveDown() {
    if (this.y < 300 - this.height) {
      this.y = this.y + this.speed
    }
  }

  draw() {
    rect(this.x, this.y, this.width, this.height)
  }

  hits(ballX, ballY) {
    if (ballX < this.x + this.width + 5 and ballX > this.x + 5) {
      if (ballY > this.y and ballY < this.y + this.height) {
        return true
      }
    }
    return false
  }
}

let ball = new Ball(200, 150, 4, 3)
let paddle = new Paddle(10, 130, 10, 40, 6)
let score = 0

while (true) {
  clear()
  color("white")

  // Draw game objects
  paddle.draw()
  ball.draw()

  // Draw score bar
  rect(395, 10, 2, score * 5)

  // Handle input
  if (pressed("up")) {
    paddle.moveUp()
  }
  if (pressed("down")) {
    paddle.moveDown()
  }

  // Move ball
  ball.move()

  // Bounce off top/bottom
  if (ball.y < 5 or ball.y > 295) {
    ball.bounceY()
  }

  // Bounce off right wall
  if (ball.x > 395) {
    ball.bounceX()
  }

  // Bounce off paddle
  if (paddle.hits(ball.x, ball.y)) {
    ball.bounceX()
    score = score + 1
  }

  // Reset if ball goes off left
  if (ball.x < 0) {
    ball.reset()
    score = 0
  }

  sleep(16)
}`
};
