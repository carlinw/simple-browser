// Example: Conway's Game of Life
// Classic cellular automaton simulation

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['game-of-life'] = {
  name: "Game of Life",
  description: "Conway's cellular automaton - cells live or die based on neighbors",
  code: `// Conway's Game of Life
// A cell lives if it has 2-3 neighbors
// A dead cell becomes alive with exactly 3 neighbors
// Press any key to start with a random pattern

// Grid size and cell size
let cols = 40
let rows = 30
let cellSize = 10

// Two grids: current state and next state
// Using 1D arrays to represent 2D grids
let grid = []
let nextGrid = []

// Initialize arrays with zeros
let i = 0
while (i < cols * rows) {
  grid[i] = 0
  nextGrid[i] = 0
  i = i + 1
}

// Convert 2D coordinates to 1D index
function idx(x, y) {
  return y * cols + x
}

// Get cell value (with wrapping at edges)
function getCell(x, y) {
  // Wrap around edges (toroidal grid)
  let wx = x
  let wy = y
  if (wx < 0) { wx = cols - 1 }
  if (wx >= cols) { wx = 0 }
  if (wy < 0) { wy = rows - 1 }
  if (wy >= rows) { wy = 0 }
  return grid[idx(wx, wy)]
}

// Count living neighbors around a cell
function countNeighbors(x, y) {
  let count = 0
  // Check all 8 surrounding cells
  count = count + getCell(x - 1, y - 1)  // top-left
  count = count + getCell(x, y - 1)      // top
  count = count + getCell(x + 1, y - 1)  // top-right
  count = count + getCell(x - 1, y)      // left
  count = count + getCell(x + 1, y)      // right
  count = count + getCell(x - 1, y + 1)  // bottom-left
  count = count + getCell(x, y + 1)      // bottom
  count = count + getCell(x + 1, y + 1)  // bottom-right
  return count
}

// Randomly initialize the grid
function randomize() {
  let i = 0
  while (i < cols * rows) {
    // ~30% chance of being alive
    if (random(1, 100) < 30) {
      grid[i] = 1
    } else {
      grid[i] = 0
    }
    i = i + 1
  }
}

// Calculate the next generation
function nextGeneration() {
  let y = 0
  while (y < rows) {
    let x = 0
    while (x < cols) {
      let neighbors = countNeighbors(x, y)
      let current = grid[idx(x, y)]

      if (current equals 1) {
        // Living cell: survives with 2-3 neighbors
        if (neighbors equals 2 or neighbors equals 3) {
          nextGrid[idx(x, y)] = 1
        } else {
          nextGrid[idx(x, y)] = 0  // dies
        }
      } else {
        // Dead cell: becomes alive with exactly 3 neighbors
        if (neighbors equals 3) {
          nextGrid[idx(x, y)] = 1
        } else {
          nextGrid[idx(x, y)] = 0
        }
      }
      x = x + 1
    }
    y = y + 1
  }

  // Copy nextGrid to grid
  let i = 0
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

// Initialize with random pattern
print("Game of Life - Press any key to start")
key()
randomize()

// Main loop
let generation = 0
while (true) {
  draw()

  // Show generation count
  color("white")
  text(5, 295, "Generation: " + generation)

  nextGeneration()
  generation = generation + 1

  sleep(100)
}`
};
