// Example: Maze Solver
// Generate a maze then watch a mouse find the exit

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['maze-solver'] = {
  name: 'Maze Solver',
  description: 'Watch a mouse find its way through a maze',
  code: `// Maze Solver
// Select size, then watch the mouse find the exit

print "Select maze size:"
print "1 = Small (10x8)"
print "2 = Medium (15x12)"
print "3 = Large (20x15)"
let choice = key()

let cols = 10
let rows = 8
if (choice == "2") {
  cols = 15
  rows = 12
}
if (choice == "3") {
  cols = 20
  rows = 15
}

// Calculate cell size based on canvas
let cellW = 400 / cols
let cellH = 300 / rows

// Walls: bit 0=top, 1=right, 2=bottom, 3=left (15 = all walls)
// Using a flat array for the grid
let size = cols * rows
let walls = []
let visited = []
let solution = []

// Initialize arrays
let i = 0
while (i < size) {
  walls[i] = 15
  visited[i] = 0
  solution[i] = 0
  i = i + 1
}

// Stack for maze generation
let stackX = []
let stackY = []
let stackTop = 0
i = 0
while (i < size) {
  stackX[i] = 0
  stackY[i] = 0
  i = i + 1
}

function idx(x, y) {
  return y * cols + x
}

function getWall(x, y) {
  return walls[idx(x, y)]
}

function setWall(x, y, val) {
  walls[idx(x, y)] = val
}

function isVisited(x, y) {
  return visited[idx(x, y)] == 1
}

function markVisited(x, y) {
  visited[idx(x, y)] = 1
}

function push(x, y) {
  stackX[stackTop] = x
  stackY[stackTop] = y
  stackTop = stackTop + 1
}

function pop() {
  stackTop = stackTop - 1
}

function removeWall(x1, y1, x2, y2) {
  let w1 = getWall(x1, y1)
  let w2 = getWall(x2, y2)

  if (x2 > x1) {
    setWall(x1, y1, w1 - 2)
    setWall(x2, y2, w2 - 8)
  }
  if (x2 < x1) {
    setWall(x1, y1, w1 - 8)
    setWall(x2, y2, w2 - 2)
  }
  if (y2 > y1) {
    setWall(x1, y1, w1 - 4)
    setWall(x2, y2, w2 - 1)
  }
  if (y2 < y1) {
    setWall(x1, y1, w1 - 1)
    setWall(x2, y2, w2 - 4)
  }
}

function drawMaze() {
  clear()

  let y = 0
  while (y < rows) {
    let x = 0
    while (x < cols) {
      let px = x * cellW
      let py = y * cellH
      let w = getWall(x, y)

      // Draw solution path
      if (solution[idx(x, y)] == 1) {
        color("blue")
        rect(px + 2, py + 2, cellW - 4, cellH - 4)
      }

      // Draw walls
      color("white")
      if (w >= 8) {
        line(px, py, px, py + cellH)
        w = w - 8
      }
      if (w >= 4) {
        line(px, py + cellH, px + cellW, py + cellH)
        w = w - 4
      }
      if (w >= 2) {
        line(px + cellW, py, px + cellW, py + cellH)
        w = w - 2
      }
      if (w >= 1) {
        line(px, py, px + cellW, py)
      }

      x = x + 1
    }
    y = y + 1
  }

  // Draw start (green) and end (red)
  color("green")
  rect(2, 2, cellW - 4, cellH - 4)
  color("red")
  rect((cols - 1) * cellW + 2, (rows - 1) * cellH + 2, cellW - 4, cellH - 4)
}

function drawMouse(mx, my) {
  color("yellow")
  let px = mx * cellW + cellW / 2
  let py = my * cellH + cellH / 2
  circle(px, py, cellW / 3)
}

// Generate maze using recursive backtracking
print "Generating maze..."

let curX = 0
let curY = 0
markVisited(curX, curY)
push(curX, curY)

while (stackTop > 0) {
  // Find unvisited neighbors
  let neighbors = 0
  let nx = [0, 0, 0, 0]
  let ny = [0, 0, 0, 0]

  if (curX > 0 and not isVisited(curX - 1, curY)) {
    nx[neighbors] = curX - 1
    ny[neighbors] = curY
    neighbors = neighbors + 1
  }
  if (curX < cols - 1 and not isVisited(curX + 1, curY)) {
    nx[neighbors] = curX + 1
    ny[neighbors] = curY
    neighbors = neighbors + 1
  }
  if (curY > 0 and not isVisited(curX, curY - 1)) {
    nx[neighbors] = curX
    ny[neighbors] = curY - 1
    neighbors = neighbors + 1
  }
  if (curY < rows - 1 and not isVisited(curX, curY + 1)) {
    nx[neighbors] = curX
    ny[neighbors] = curY + 1
    neighbors = neighbors + 1
  }

  if (neighbors > 0) {
    let pick = random(0, neighbors - 1)
    let nextX = nx[pick]
    let nextY = ny[pick]

    removeWall(curX, curY, nextX, nextY)
    markVisited(nextX, nextY)
    push(nextX, nextY)
    curX = nextX
    curY = nextY
  } else {
    pop()
    if (stackTop > 0) {
      curX = stackX[stackTop - 1]
      curY = stackY[stackTop - 1]
    }
  }
}

// Reset visited for solving
i = 0
while (i < size) {
  visited[i] = 0
  i = i + 1
}

// Draw initial maze
drawMaze()
sleep(500)

// Solve maze using recursive backtracking (depth-first search)
print "Mouse is searching..."

// Reset stack
stackTop = 0

// Mouse position
let mouseX = 0
let mouseY = 0
markVisited(mouseX, mouseY)
solution[idx(mouseX, mouseY)] = 1
push(mouseX, mouseY)

let found = false

while (stackTop > 0 and not found) {
  drawMaze()
  drawMouse(mouseX, mouseY)
  sleep(50)

  // Check if we reached the goal
  if (mouseX == cols - 1 and mouseY == rows - 1) {
    found = true
  } else {
    // Find unvisited neighbor we can move to (no wall between)
    let canMove = false
    let nextMX = mouseX
    let nextMY = mouseY

    let w = getWall(mouseX, mouseY)
    let hasTop = w >= 8
    if (hasTop) { w = w - 8 }
    let hasBottom = w >= 4
    if (hasBottom) { w = w - 4 }
    let hasRight = w >= 2
    if (hasRight) { w = w - 2 }
    let hasLeft = w >= 1

    // Try each direction (no wall and not visited)
    if (not canMove and not hasLeft and mouseX > 0 and not isVisited(mouseX - 1, mouseY)) {
      nextMX = mouseX - 1
      nextMY = mouseY
      canMove = true
    }
    if (not canMove and not hasRight and mouseX < cols - 1 and not isVisited(mouseX + 1, mouseY)) {
      nextMX = mouseX + 1
      nextMY = mouseY
      canMove = true
    }
    if (not canMove and not hasTop and mouseY > 0 and not isVisited(mouseX, mouseY - 1)) {
      nextMX = mouseX
      nextMY = mouseY - 1
      canMove = true
    }
    if (not canMove and not hasBottom and mouseY < rows - 1 and not isVisited(mouseX, mouseY + 1)) {
      nextMX = mouseX
      nextMY = mouseY + 1
      canMove = true
    }

    if (canMove) {
      mouseX = nextMX
      mouseY = nextMY
      markVisited(mouseX, mouseY)
      solution[idx(mouseX, mouseY)] = 1
      push(mouseX, mouseY)
    } else {
      // Backtrack
      solution[idx(mouseX, mouseY)] = 0
      pop()
      if (stackTop > 0) {
        mouseX = stackX[stackTop - 1]
        mouseY = stackY[stackTop - 1]
      }
    }
  }
}

// Final display
drawMaze()
drawMouse(mouseX, mouseY)

if (found) {
  color("yellow")
  text(10, 20, "Mouse found the exit!")
} else {
  color("red")
  text(10, 20, "No path found!")
}`
};
