// Example: Bouncing Ball
// A ball bounces around the screen



export const example = {
  name: 'Bouncing Ball',
  description: 'Ball bounces around the canvas',
  code: `// Bouncing Ball
// Using a Ball class to encapsulate state and behavior

class Ball {
  x,
  y,
  dx,
  dy,
  radius,

  move() {
    this.x = this.x + this.dx
    this.y = this.y + this.dy
  }

  bounce() {
    if (this.x < this.radius or this.x > 400 - this.radius) {
      this.dx = 0 - this.dx
    }
    if (this.y < this.radius or this.y > 300 - this.radius) {
      this.dy = 0 - this.dy
    }
  }

  draw() {
    color("white")
    circle(this.x, this.y, this.radius)
  }
}

let ball = new Ball(200, 150, 3, 2, 10)

while (true) {
  clear()
  ball.draw()
  ball.move()
  ball.bounce()
  sleep(16)
}`
};
