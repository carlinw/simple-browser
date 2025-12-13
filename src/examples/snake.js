// Example: Snake
// Classic snake game



export const example = {
  name: 'Snake',
  description: 'Classic snake with arrow keys',
  code: `// Snake Game
// Use arrow keys to move

let size = 10
let x = 200
let y = 150
let dx = size
let dy = 0
let foodX = 100
let foodY = 100
let length = 3
let tailX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let tailY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

while (true) {
  // Handle input
  if (pressed("up") and dy equals 0) {
    dx = 0
    dy = 0 - size
  }
  if (pressed("down") and dy equals 0) {
    dx = 0
    dy = size
  }
  if (pressed("left") and dx equals 0) {
    dx = 0 - size
    dy = 0
  }
  if (pressed("right") and dx equals 0) {
    dx = size
    dy = 0
  }

  // Update tail positions
  let i = length - 1
  while (i > 0) {
    tailX[i] = tailX[i - 1]
    tailY[i] = tailY[i - 1]
    i = i - 1
  }
  tailX[0] = x
  tailY[0] = y

  // Move head
  x = x + dx
  y = y + dy

  // Wrap around edges
  if (x < 0) { x = 390 }
  if (x > 390) { x = 0 }
  if (y < 0) { y = 290 }
  if (y > 290) { y = 0 }

  // Check food collision
  if (x equals foodX and y equals foodY) {
    if (length < 20) {
      length = length + 1
    }
    foodX = random(0, 39) * 10
    foodY = random(0, 29) * 10
  }

  // Draw
  clear()

  // Draw food
  color("red")
  rect(foodX, foodY, size, size)

  // Draw snake
  color("green")
  rect(x, y, size, size)

  color("white")
  i = 0
  while (i < length - 1) {
    rect(tailX[i], tailY[i], size, size)
    i = i + 1
  }

  sleep(100)
}`
};
