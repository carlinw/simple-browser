// Example: Bouncing Ball
// A ball bounces around the screen



export const example = {
  name: 'Bouncing Ball',
  description: 'Ball bounces around the canvas',
  code: `// Bouncing Ball
// Watch the ball bounce off walls

let x = 200
let y = 150
let dx = 3
let dy = 2
let radius = 10

while (true) {
  clear()

  // Draw ball
  color("white")
  circle(x, y, radius)

  // Move ball
  x = x + dx
  y = y + dy

  // Bounce off walls
  if (x < radius or x > 400 - radius) {
    dx = 0 - dx
  }
  if (y < radius or y > 300 - radius) {
    dy = 0 - dy
  }

  sleep(16)
}`
};
