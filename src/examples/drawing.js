// Example: Drawing App
// Draw with arrow keys

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['drawing'] = {
  name: 'Drawing App',
  description: 'Draw with arrow keys, space to clear',
  code: `// Drawing App
// Arrow keys to draw, space to clear
// 1-5 to change colors

let x = 200
let y = 150
let brushSize = 5
let currentColor = "white"

// Start with black canvas
clear()

while (true) {
  // Movement
  if (pressed("up") and y > 0) {
    y = y - 3
  }
  if (pressed("down") and y < 300) {
    y = y + 3
  }
  if (pressed("left") and x > 0) {
    x = x - 3
  }
  if (pressed("right") and x < 400) {
    x = x + 3
  }

  // Color selection
  if (pressed("1")) { currentColor = "white" }
  if (pressed("2")) { currentColor = "red" }
  if (pressed("3")) { currentColor = "green" }
  if (pressed("4")) { currentColor = "blue" }
  if (pressed("5")) { currentColor = "yellow" }

  // Clear canvas
  if (pressed("space")) {
    clear()
  }

  // Draw at current position
  color(currentColor)
  circle(x, y, brushSize)

  sleep(16)
}`
};
