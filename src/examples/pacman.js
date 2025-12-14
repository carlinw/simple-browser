// Example: Pacman
// Classic arcade game

export const example = {
  name: 'Pacman',
  description: 'Eat dots and avoid ghosts',
  code: `// Pacman
// Arrow keys to move, eat all dots!

// Grid settings
let cellSize = 20
let cols = 20
let rows = 15

// Map: 0=empty, 1=wall, 2=dot, 3=power
let map = []

// Initialize map with walls and dots
function initMap() {
  let i = 0
  while (i < cols * rows) {
    map[i] = 2
    i = i + 1
  }

  // Border walls
  let x = 0
  while (x < cols) {
    map[x] = 1
    map[x + (rows - 1) * cols] = 1
    x = x + 1
  }
  let y = 0
  while (y < rows) {
    map[y * cols] = 1
    map[y * cols + cols - 1] = 1
    y = y + 1
  }

  // Inner walls (simple maze)
  // Horizontal bars
  x = 2
  while (x < 7) {
    map[x + 2 * cols] = 1
    map[x + 12 * cols] = 1
    x = x + 1
  }
  x = 13
  while (x < 18) {
    map[x + 2 * cols] = 1
    map[x + 12 * cols] = 1
    x = x + 1
  }

  // Center box
  x = 8
  while (x < 12) {
    map[x + 6 * cols] = 1
    map[x + 8 * cols] = 1
    x = x + 1
  }
  map[8 + 7 * cols] = 1
  map[11 + 7 * cols] = 1

  // Vertical bars
  y = 4
  while (y < 7) {
    map[3 + y * cols] = 1
    map[16 + y * cols] = 1
    x = x + 1
    y = y + 1
  }
  y = 9
  while (y < 12) {
    map[3 + y * cols] = 1
    map[16 + y * cols] = 1
    y = y + 1
  }

  // Power pellets in corners
  map[1 + 1 * cols] = 3
  map[18 + 1 * cols] = 3
  map[1 + 13 * cols] = 3
  map[18 + 13 * cols] = 3

  // Clear pacman start
  map[10 + 11 * cols] = 0
}

// Get map cell
function getCell(x, y) {
  return map[x + y * cols]
}

// Set map cell
function setCell(x, y, val) {
  map[x + y * cols] = val
}

// Pacman
let pacX = 10
let pacY = 11
let pacDX = 0
let pacDY = 0
let pacNextDX = 0
let pacNextDY = 0
let mouthOpen = true
let score = 0
let powerTime = 0

// Ghost
let ghostX = 9
let ghostY = 7
let ghostDX = 1
let ghostDY = 0

// Check if can move to cell
function canMove(x, y) {
  if (x < 0 or x >= cols) { return false }
  if (y < 0 or y >= rows) { return false }
  if (getCell(x, y) equals 1) { return false }
  return true
}

// Draw the map
function drawMap() {
  let y = 0
  while (y < rows) {
    let x = 0
    while (x < cols) {
      let cell = getCell(x, y)
      let px = x * cellSize
      let py = y * cellSize

      if (cell equals 1) {
        color("blue")
        rect(px, py, cellSize, cellSize)
      } else if (cell equals 2) {
        color("white")
        circle(px + 10, py + 10, 2)
      } else if (cell equals 3) {
        color("white")
        circle(px + 10, py + 10, 5)
      }
      x = x + 1
    }
    y = y + 1
  }
}

// Draw pacman
function drawPacman() {
  color("yellow")
  let px = pacX * cellSize + 10
  let py = pacY * cellSize + 10
  circle(px, py, 8)

  // Mouth (black wedge)
  if (mouthOpen) {
    color("black")
    if (pacDX equals 1) {
      triangle(px, py, px + 10, py - 5, px + 10, py + 5)
    } else if (pacDX equals 0 - 1) {
      triangle(px, py, px - 10, py - 5, px - 10, py + 5)
    } else if (pacDY equals 1) {
      triangle(px, py, px - 5, py + 10, px + 5, py + 10)
    } else if (pacDY equals 0 - 1) {
      triangle(px, py, px - 5, py - 10, px + 5, py - 10)
    } else {
      triangle(px, py, px + 10, py - 5, px + 10, py + 5)
    }
  }
}

// Draw ghost
function drawGhost() {
  let px = ghostX * cellSize + 10
  let py = ghostY * cellSize + 10

  if (powerTime > 0) {
    color("blue")
  } else {
    color("red")
  }

  // Body
  circle(px, py - 2, 8)
  rect(px - 8, py - 2, 16, 10)

  // Eyes
  color("white")
  circle(px - 3, py - 3, 2)
  circle(px + 3, py - 3, 2)
  color("black")
  circle(px - 3, py - 3, 1)
  circle(px + 3, py - 3, 1)
}

// Move ghost toward pacman
function moveGhost() {
  // Try to move toward pacman
  let bestDX = 0
  let bestDY = 0

  if (powerTime > 0) {
    // Run away from pacman
    if (pacX < ghostX and canMove(ghostX + 1, ghostY)) {
      bestDX = 1
    } else if (pacX > ghostX and canMove(ghostX - 1, ghostY)) {
      bestDX = 0 - 1
    } else if (pacY < ghostY and canMove(ghostX, ghostY + 1)) {
      bestDY = 1
    } else if (pacY > ghostY and canMove(ghostX, ghostY - 1)) {
      bestDY = 0 - 1
    }
  } else {
    // Chase pacman
    if (pacX > ghostX and canMove(ghostX + 1, ghostY)) {
      bestDX = 1
    } else if (pacX < ghostX and canMove(ghostX - 1, ghostY)) {
      bestDX = 0 - 1
    } else if (pacY > ghostY and canMove(ghostX, ghostY + 1)) {
      bestDY = 1
    } else if (pacY < ghostY and canMove(ghostX, ghostY - 1)) {
      bestDY = 0 - 1
    }
  }

  // If no good move, try current direction or random
  if (bestDX equals 0 and bestDY equals 0) {
    if (canMove(ghostX + ghostDX, ghostY + ghostDY)) {
      bestDX = ghostDX
      bestDY = ghostDY
    } else {
      // Try other directions
      if (canMove(ghostX + 1, ghostY)) {
        bestDX = 1
      } else if (canMove(ghostX - 1, ghostY)) {
        bestDX = 0 - 1
      } else if (canMove(ghostX, ghostY + 1)) {
        bestDY = 1
      } else if (canMove(ghostX, ghostY - 1)) {
        bestDY = 0 - 1
      }
    }
  }

  ghostDX = bestDX
  ghostDY = bestDY
  ghostX = ghostX + ghostDX
  ghostY = ghostY + ghostDY
}

// Count remaining dots
function countDots() {
  let count = 0
  let i = 0
  while (i < cols * rows) {
    if (map[i] equals 2 or map[i] equals 3) {
      count = count + 1
    }
    i = i + 1
  }
  return count
}

// Initialize
initMap()
print("PACMAN")
print("Arrow keys to move")
print("Eat all the dots!")
print("")
print("Press any key to start...")
key()

// Game loop
let gameOver = false
let won = false

while (not gameOver) {
  // Input - queue next direction
  if (pressed("up")) { pacNextDX = 0 pacNextDY = 0 - 1 }
  if (pressed("down")) { pacNextDX = 0 pacNextDY = 1 }
  if (pressed("left")) { pacNextDX = 0 - 1 pacNextDY = 0 }
  if (pressed("right")) { pacNextDX = 1 pacNextDY = 0 }

  // Try queued direction first
  if (canMove(pacX + pacNextDX, pacY + pacNextDY)) {
    pacDX = pacNextDX
    pacDY = pacNextDY
  }

  // Move if possible
  if (canMove(pacX + pacDX, pacY + pacDY)) {
    pacX = pacX + pacDX
    pacY = pacY + pacDY
  }

  // Eat dot
  let cell = getCell(pacX, pacY)
  if (cell equals 2) {
    setCell(pacX, pacY, 0)
    score = score + 10
  } else if (cell equals 3) {
    setCell(pacX, pacY, 0)
    score = score + 50
    powerTime = 30
  }

  // Move ghost
  moveGhost()

  // Check ghost collision
  if (pacX equals ghostX and pacY equals ghostY) {
    if (powerTime > 0) {
      // Eat ghost
      score = score + 200
      ghostX = 9
      ghostY = 7
    } else {
      gameOver = true
    }
  }

  // Decrease power time
  if (powerTime > 0) {
    powerTime = powerTime - 1
  }

  // Check win
  if (countDots() equals 0) {
    gameOver = true
    won = true
  }

  // Toggle mouth
  mouthOpen = not mouthOpen

  // Draw
  clear()
  drawMap()
  drawPacman()
  drawGhost()

  // Score
  color("white")
  text(5, 295, "Score: " + score)

  sleep(150)
}

// Game over
clear()
color("yellow")
if (won) {
  text(150, 140, "YOU WIN!")
} else {
  text(140, 140, "GAME OVER")
}
text(130, 170, "Score: " + score)`
};
