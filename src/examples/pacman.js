// Example: Pacman
// Classic arcade game

export const example = {
  name: 'Pacman',
  description: 'Eat dots and avoid ghosts',
  code: `// Pacman
// Arrow keys to move, eat all dots!

// Grid settings
let cellSize = 12
let cols = 28
let rows = 31

// Map: 0=empty, 1=wall, 2=dot, 3=power, 4=ghost door
let map = []

// Classic maze layout
let layout = "1111111111111111111111111111"
layout = layout + "1300001111111111111111000031"
layout = layout + "1011110111111111111110111101"
layout = layout + "1011110111111111111110111101"
layout = layout + "1000000000000000000000000001"
layout = layout + "1011110110111111110110111101"
layout = layout + "1000000110000110000110000001"
layout = layout + "1111110111110110111110111111"
layout = layout + "0000010110000000000110100000"
layout = layout + "1111110110111001110110111111"
layout = layout + "0000000000100000010000000000"
layout = layout + "1111110110100000010110111111"
layout = layout + "0000010110100000010110100000"
layout = layout + "1111110110111111110110111111"
layout = layout + "0000000000000000000000000000"
layout = layout + "1111110110111111110110111111"
layout = layout + "0000010110000000000110100000"
layout = layout + "1111110110111111110110111111"
layout = layout + "1000000000000110000000000001"
layout = layout + "1011110111110110111110111101"
layout = layout + "1000110000000000000000110001"
layout = layout + "1110110110111111110110110111"
layout = layout + "1000000110000110000110000001"
layout = layout + "1011111111110110111111111101"
layout = layout + "1000000000000000000000000001"
layout = layout + "1011110111111111111110111101"
layout = layout + "1011110111111111111110111101"
layout = layout + "1300001111111111111111000031"
layout = layout + "1111111111111111111111111111"

// Initialize map from layout
function initMap() {
  let i = 0
  while (i < cols * rows) {
    let c = layout[i]
    if (c equals "1") {
      map[i] = 1
    } else if (c equals "3") {
      map[i] = 3
    } else {
      map[i] = 2
    }
    i = i + 1
  }
  // Clear start positions
  setCell(14, 23, 0)
  setCell(14, 11, 0)
}

// Get map cell
function getCell(x, y) {
  if (x < 0 or x >= cols or y < 0 or y >= rows) {
    return 1
  }
  return map[x + y * cols]
}

// Set map cell
function setCell(x, y, val) {
  map[x + y * cols] = val
}

// Pacman
let pacX = 14
let pacY = 23
let pacDX = 0
let pacDY = 0
let nextDX = 0
let nextDY = 0
let mouthOpen = true
let score = 0
let powerTime = 0

// Ghost - starts in open corridor
let gX = 14
let gY = 11
let gDX = 1
let gDY = 0

// Can move?
function canMove(x, y) {
  if (getCell(x, y) equals 1) {
    return false
  }
  return true
}

// Draw map
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
        rect(px, py, cellSize - 1, cellSize - 1)
      } else if (cell equals 2) {
        color("white")
        circle(px + 6, py + 6, 1)
      } else if (cell equals 3) {
        color("white")
        circle(px + 6, py + 6, 3)
      }
      x = x + 1
    }
    y = y + 1
  }
}

// Draw pacman
function drawPacman() {
  color("yellow")
  let px = pacX * cellSize + 6
  let py = pacY * cellSize + 6
  circle(px, py, 5)

  if (mouthOpen) {
    color("black")
    if (pacDX equals 1) {
      triangle(px, py, px + 6, py - 3, px + 6, py + 3)
    } else if (pacDX equals 0 - 1) {
      triangle(px, py, px - 6, py - 3, px - 6, py + 3)
    } else if (pacDY equals 1) {
      triangle(px, py, px - 3, py + 6, px + 3, py + 6)
    } else if (pacDY equals 0 - 1) {
      triangle(px, py, px - 3, py - 6, px + 3, py - 6)
    } else {
      triangle(px, py, px + 6, py - 3, px + 6, py + 3)
    }
  }
}

// Draw ghost
function drawGhost() {
  let px = gX * cellSize + 6
  let py = gY * cellSize + 6

  if (powerTime > 0) {
    color("blue")
  } else {
    color("red")
  }

  circle(px, py - 1, 5)
  rect(px - 5, py - 1, 10, 6)

  color("white")
  circle(px - 2, py - 2, 2)
  circle(px + 2, py - 2, 2)
}

// Move ghost
function moveGhost() {
  let bestDX = 0
  let bestDY = 0
  let moved = false

  // Target
  let targetX = pacX
  let targetY = pacY
  if (powerTime > 0) {
    // Run away
    if (pacX < 14) { targetX = 27 } else { targetX = 0 }
    if (pacY < 15) { targetY = 30 } else { targetY = 0 }
  }

  // Try toward target
  if (targetX > gX and canMove(gX + 1, gY)) {
    bestDX = 1
    moved = true
  } else if (targetX < gX and canMove(gX - 1, gY)) {
    bestDX = 0 - 1
    moved = true
  } else if (targetY > gY and canMove(gX, gY + 1)) {
    bestDY = 1
    moved = true
  } else if (targetY < gY and canMove(gX, gY - 1)) {
    bestDY = 0 - 1
    moved = true
  }

  // Fallback
  if (not moved) {
    if (canMove(gX + gDX, gY + gDY)) {
      bestDX = gDX
      bestDY = gDY
    } else if (canMove(gX + 1, gY)) {
      bestDX = 1
    } else if (canMove(gX - 1, gY)) {
      bestDX = 0 - 1
    } else if (canMove(gX, gY + 1)) {
      bestDY = 1
    } else if (canMove(gX, gY - 1)) {
      bestDY = 0 - 1
    }
  }

  gDX = bestDX
  gDY = bestDY
  gX = gX + gDX
  gY = gY + gDY

  // Tunnel
  if (gX < 0) { gX = cols - 1 }
  if (gX >= cols) { gX = 0 }
}

// Count dots
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

// Init
initMap()
print("PACMAN")
print("Arrow keys to move")
print("Eat all dots!")
print("")
print("Press any key...")
key()

// Game loop
let gameOver = false
let won = false

while (not gameOver) {
  // Input
  if (pressed("up")) { nextDX = 0 nextDY = 0 - 1 }
  if (pressed("down")) { nextDX = 0 nextDY = 1 }
  if (pressed("left")) { nextDX = 0 - 1 nextDY = 0 }
  if (pressed("right")) { nextDX = 1 nextDY = 0 }

  // Try direction
  if (canMove(pacX + nextDX, pacY + nextDY)) {
    pacDX = nextDX
    pacDY = nextDY
  }

  // Move
  if (canMove(pacX + pacDX, pacY + pacDY)) {
    pacX = pacX + pacDX
    pacY = pacY + pacDY
  }

  // Tunnel
  if (pacX < 0) { pacX = cols - 1 }
  if (pacX >= cols) { pacX = 0 }

  // Eat
  let cell = getCell(pacX, pacY)
  if (cell equals 2) {
    setCell(pacX, pacY, 0)
    score = score + 10
  } else if (cell equals 3) {
    setCell(pacX, pacY, 0)
    score = score + 50
    powerTime = 50
  }

  // Ghost
  moveGhost()

  // Collision
  if (pacX equals gX and pacY equals gY) {
    if (powerTime > 0) {
      score = score + 200
      gX = 14
      gY = 11
    } else {
      gameOver = true
    }
  }

  // Power
  if (powerTime > 0) {
    powerTime = powerTime - 1
  }

  // Win
  if (countDots() equals 0) {
    gameOver = true
    won = true
  }

  // Animate
  mouthOpen = not mouthOpen

  // Draw
  clear()
  drawMap()
  drawPacman()
  drawGhost()

  color("white")
  text(5, 365, "Score: " + score)

  sleep(100)
}

// End
clear()
color("yellow")
if (won) {
  text(120, 180, "YOU WIN!")
} else {
  text(110, 180, "GAME OVER")
}
text(100, 210, "Score: " + score)`
};
