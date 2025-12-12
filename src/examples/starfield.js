// Example: Starfield
// Flying through space effect

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['starfield'] = {
  name: 'Starfield',
  description: 'Flying through space',
  code: `// Starfield
// Watch stars fly past

let numStars = 20
let starX = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
let starY = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
let starZ = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

// Initialize stars
let i = 0
while (i < numStars) {
  starX[i] = random(0, 400)
  starY[i] = random(0, 300)
  starZ[i] = random(1, 10)
  i = i + 1
}

while (true) {
  clear()

  i = 0
  while (i < numStars) {
    // Calculate screen position from center
    let sx = 200 + (starX[i] - 200) / starZ[i] * 5
    let sy = 150 + (starY[i] - 150) / starZ[i] * 5

    // Size based on depth
    let size = 10 / starZ[i]
    if (size < 1) { size = 1 }

    // Brightness based on depth
    if (starZ[i] < 3) {
      color("white")
    } else {
      if (starZ[i] < 6) {
        color("cyan")
      } else {
        color("blue")
      }
    }

    circle(sx, sy, size)

    // Move star closer
    starZ[i] = starZ[i] - 0.1

    // Reset if too close
    if (starZ[i] < 1) {
      starX[i] = random(0, 400)
      starY[i] = random(0, 300)
      starZ[i] = 10
    }

    i = i + 1
  }

  sleep(50)
}`
};
