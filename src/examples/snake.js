// Example: Snake
// Classic snake game



export const example = {
  name: 'Snake',
  description: 'Classic snake with arrow keys',
  code: `// Snake Game
// Use arrow keys to move

class Snake {
  x,
  y,
  dx,
  dy,
  size,
  length,
  tailX,
  tailY,

  setDirection(newDX, newDY) {
    this.dx = newDX
    this.dy = newDY
  }

  move() {
    // Shift tail positions
    let i = this.length - 1
    while (i > 0) {
      this.tailX[i] = this.tailX[i - 1]
      this.tailY[i] = this.tailY[i - 1]
      i = i - 1
    }
    this.tailX[0] = this.x
    this.tailY[0] = this.y

    // Move head
    this.x = this.x + this.dx
    this.y = this.y + this.dy

    // Wrap around edges
    if (this.x < 0) { this.x = 390 }
    if (this.x > 390) { this.x = 0 }
    if (this.y < 0) { this.y = 290 }
    if (this.y > 290) { this.y = 0 }
  }

  grow() {
    if (this.length < 20) {
      this.length = this.length + 1
    }
  }

  draw() {
    // Draw head
    color("green")
    rect(this.x, this.y, this.size, this.size)

    // Draw tail
    color("white")
    let i = 0
    while (i < this.length - 1) {
      rect(this.tailX[i], this.tailY[i], this.size, this.size)
      i = i + 1
    }
  }
}

class Food {
  x,
  y,
  size,

  respawn() {
    this.x = random(0, 39) * 10
    this.y = random(0, 29) * 10
  }

  draw() {
    color("red")
    rect(this.x, this.y, this.size, this.size)
  }
}

let size = 10
let tailX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let tailY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

let snake = new Snake(200, 150, size, 0, size, 3, tailX, tailY)
let food = new Food(100, 100, size)

while (true) {
  // Handle input
  if (pressed("up") and snake.dy equals 0) {
    snake.setDirection(0, 0 - size)
  }
  if (pressed("down") and snake.dy equals 0) {
    snake.setDirection(0, size)
  }
  if (pressed("left") and snake.dx equals 0) {
    snake.setDirection(0 - size, 0)
  }
  if (pressed("right") and snake.dx equals 0) {
    snake.setDirection(size, 0)
  }

  snake.move()

  // Check food collision
  if (snake.x equals food.x and snake.y equals food.y) {
    snake.grow()
    food.respawn()
  }

  // Draw
  clear()
  food.draw()
  snake.draw()

  sleep(100)
}`
};
