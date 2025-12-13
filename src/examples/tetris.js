// Example: Tetris
// Classic falling blocks game

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['tetris'] = {
  name: 'Tetris',
  description: 'Arrow keys to move/rotate, down to drop',
  code: `// Tetris
// Left/Right to move, Up to rotate, Down to drop

let gridW = 10
let gridH = 20
let cellSize = 14
let offsetX = 120
let offsetY = 10

// Grid: 0 = empty, 1-7 = colored block
let grid = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

// Current piece: shape, x, y, rotation
let pieceX = 4
let pieceY = 0
let pieceType = 0
let rotation = 0

// Pieces: I, O, T, S, Z, J, L (each has 4 rotations of 4 cells)
// Stored as offsets from piece position
let piecesX = [0,1,2,3, 0,1,0,1, 0,1,2,1, 1,2,0,1, 0,1,1,2, 0,0,1,2, 2,0,1,2]
let piecesY = [0,0,0,0, 0,0,1,1, 0,0,0,1, 0,0,1,1, 0,0,1,1, 0,1,1,1, 0,1,1,1]

let score = 0
let dropTimer = 0
let gameOver = false

function getCell(x, y) {
  if (x < 0 or x >= gridW or y < 0 or y >= gridH) {
    return 1
  }
  return grid[y * gridW + x]
}

function setCell(x, y, val) {
  if (x >= 0 and x < gridW and y >= 0 and y < gridH) {
    grid[y * gridW + x] = val
  }
}

function canPlace(px, py) {
  let i = 0
  while (i < 4) {
    let cx = px + piecesX[pieceType * 4 + i]
    let cy = py + piecesY[pieceType * 4 + i]
    if (getCell(cx, cy) not equals 0) {
      return false
    }
    i = i + 1
  }
  return true
}

function placePiece() {
  let i = 0
  while (i < 4) {
    let cx = pieceX + piecesX[pieceType * 4 + i]
    let cy = pieceY + piecesY[pieceType * 4 + i]
    setCell(cx, cy, pieceType + 1)
    i = i + 1
  }
}

function clearLines() {
  let y = gridH - 1
  while (y >= 0) {
    let full = true
    let x = 0
    while (x < gridW) {
      if (getCell(x, y) equals 0) {
        full = false
      }
      x = x + 1
    }
    if (full) {
      // Move everything down
      let row = y
      while (row > 0) {
        x = 0
        while (x < gridW) {
          setCell(x, row, getCell(x, row - 1))
          x = x + 1
        }
        row = row - 1
      }
      score = score + 100
    } else {
      y = y - 1
    }
  }
}

function newPiece() {
  pieceX = 4
  pieceY = 0
  pieceType = random(0, 6)
  if (not canPlace(pieceX, pieceY)) {
    gameOver = true
  }
}

function drawPieceColor(t) {
  if (t equals 1) { color("cyan") }
  if (t equals 2) { color("yellow") }
  if (t equals 3) { color("purple") }
  if (t equals 4) { color("green") }
  if (t equals 5) { color("red") }
  if (t equals 6) { color("blue") }
  if (t equals 7) { color("orange") }
}

newPiece()

while (not gameOver) {
  clear()

  // Input
  if (pressed("left") and canPlace(pieceX - 1, pieceY)) {
    pieceX = pieceX - 1
  }
  if (pressed("right") and canPlace(pieceX + 1, pieceY)) {
    pieceX = pieceX + 1
  }
  if (pressed("down")) {
    dropTimer = 20
  }

  // Drop
  dropTimer = dropTimer + 1
  if (dropTimer > 15) {
    dropTimer = 0
    if (canPlace(pieceX, pieceY + 1)) {
      pieceY = pieceY + 1
    } else {
      placePiece()
      clearLines()
      newPiece()
    }
  }

  // Draw grid
  let y = 0
  while (y < gridH) {
    let x = 0
    while (x < gridW) {
      let cell = getCell(x, y)
      if (cell > 0) {
        drawPieceColor(cell)
        rect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize - 1, cellSize - 1)
      }
      x = x + 1
    }
    y = y + 1
  }

  // Draw current piece
  drawPieceColor(pieceType + 1)
  let i = 0
  while (i < 4) {
    let cx = pieceX + piecesX[pieceType * 4 + i]
    let cy = pieceY + piecesY[pieceType * 4 + i]
    rect(offsetX + cx * cellSize, offsetY + cy * cellSize, cellSize - 1, cellSize - 1)
    i = i + 1
  }

  // Draw border
  color("white")
  stroke()
  rect(offsetX - 2, offsetY - 2, gridW * cellSize + 4, gridH * cellSize + 4)
  fill()

  // Draw score
  text(10, 20, "Score: " + score)

  sleep(50)
}

// Game over
color("red")
text(140, 150, "GAME OVER")`
};
