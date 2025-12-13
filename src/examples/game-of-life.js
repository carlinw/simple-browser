// Example: Conway's Game of Life
// Classic cellular automaton simulation



export const example = {
  name: "Game of Life",
  description: "Conway's cellular automaton - cells live or die based on neighbors",
  code: `// Conway's Game of Life
// Cells live or die based on their neighbors:
// - A live cell with 2-3 neighbors survives
// - A dead cell with exactly 3 neighbors is born
// - All other cells die or stay dead

// Grid settings
let cols = 40
let rows = 30
let cellSize = 10

// Two grids: current and next state
let grid = []
let nextGrid = []

// Initialize arrays
let i = 0
while (i < cols * rows) {
  grid[i] = 0
  nextGrid[i] = 0
  i = i + 1
}

// Convert 2D coords to 1D index
function idx(x, y) {
  return y * cols + x
}

// Set a cell alive
function setCell(x, y) {
  grid[idx(x, y)] = 1
}

// Get cell (wraps at edges)
function getCell(x, y) {
  let wx = x
  let wy = y
  if (wx < 0) { wx = cols - 1 }
  if (wx >= cols) { wx = 0 }
  if (wy < 0) { wy = rows - 1 }
  if (wy >= rows) { wy = 0 }
  return grid[idx(wx, wy)]
}

// Count neighbors
function countNeighbors(x, y) {
  let n = 0
  n = n + getCell(x-1, y-1) + getCell(x, y-1) + getCell(x+1, y-1)
  n = n + getCell(x-1, y)                     + getCell(x+1, y)
  n = n + getCell(x-1, y+1) + getCell(x, y+1) + getCell(x+1, y+1)
  return n
}

// Calculate next generation
function nextGeneration() {
  let y = 0
  while (y < rows) {
    let x = 0
    while (x < cols) {
      let n = countNeighbors(x, y)
      let alive = grid[idx(x, y)] equals 1
      if (alive and (n equals 2 or n equals 3)) {
        nextGrid[idx(x, y)] = 1
      } else if (not alive and n equals 3) {
        nextGrid[idx(x, y)] = 1
      } else {
        nextGrid[idx(x, y)] = 0
      }
      x = x + 1
    }
    y = y + 1
  }
  // Swap grids
  i = 0
  while (i < cols * rows) {
    grid[i] = nextGrid[i]
    i = i + 1
  }
}

// Draw the grid
function draw() {
  clear()
  let y = 0
  while (y < rows) {
    let x = 0
    while (x < cols) {
      if (grid[idx(x, y)] equals 1) {
        color("lime")
        rect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1)
      }
      x = x + 1
    }
    y = y + 1
  }
}

// --- Explain and set up initial pattern ---
print("CONWAY'S GAME OF LIFE")
print("")
print("Watch cells live and die!")
print("Starting with a 'Glider Gun'")
print("that shoots gliders forever.")
print("")
print("Press any key to begin...")
key()

// Gosper Glider Gun - a famous pattern
// Left square
setCell(1, 5)
setCell(1, 6)
setCell(2, 5)
setCell(2, 6)

// Left part
setCell(11, 5)
setCell(11, 6)
setCell(11, 7)
setCell(12, 4)
setCell(12, 8)
setCell(13, 3)
setCell(13, 9)
setCell(14, 3)
setCell(14, 9)
setCell(15, 6)
setCell(16, 4)
setCell(16, 8)
setCell(17, 5)
setCell(17, 6)
setCell(17, 7)
setCell(18, 6)

// Right part
setCell(21, 3)
setCell(21, 4)
setCell(21, 5)
setCell(22, 3)
setCell(22, 4)
setCell(22, 5)
setCell(23, 2)
setCell(23, 6)
setCell(25, 1)
setCell(25, 2)
setCell(25, 6)
setCell(25, 7)

// Right square
setCell(35, 3)
setCell(35, 4)
setCell(36, 3)
setCell(36, 4)

// Main loop
let gen = 0
while (true) {
  draw()
  color("white")
  text(5, 295, "Generation: " + gen)
  nextGeneration()
  gen = gen + 1
  sleep(50)
}`
};
