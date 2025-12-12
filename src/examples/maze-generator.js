// Example: Maze Generator
// Watch a maze being generated step by step

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['maze-generator'] = {
  name: 'Maze Generator',
  description: 'Watch recursive backtracking build a maze',
  code: `// Maze Generator
// Using recursive backtracking

let cols = 20
let rows = 15
let cellW = 20
let cellH = 20

// Each cell has walls: bit 0=top, 1=right, 2=bottom, 3=left
// 15 = all walls (1111 binary)
let walls = [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15]

let visited = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

// Stack for backtracking
let stackX = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
let stackY = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
let stackTop = 0

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
  // Remove wall between two adjacent cells
  let w1 = getWall(x1, y1)
  let w2 = getWall(x2, y2)

  if (x2 > x1) {
    // Going right: remove right from 1, left from 2
    setWall(x1, y1, w1 - 2)
    setWall(x2, y2, w2 - 8)
  }
  if (x2 < x1) {
    // Going left
    setWall(x1, y1, w1 - 8)
    setWall(x2, y2, w2 - 2)
  }
  if (y2 > y1) {
    // Going down
    setWall(x1, y1, w1 - 4)
    setWall(x2, y2, w2 - 1)
  }
  if (y2 < y1) {
    // Going up
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

      // Draw visited cells
      if (isVisited(x, y)) {
        color("blue")
        rect(px + 1, py + 1, cellW - 2, cellH - 2)
      }

      // Draw walls
      color("white")
      // Top wall (bit 0)
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

  // Draw current cell
  if (stackTop > 0) {
    color("green")
    let cx = stackX[stackTop - 1]
    let cy = stackY[stackTop - 1]
    rect(cx * cellW + 3, cy * cellH + 3, cellW - 6, cellH - 6)
  }
}

// Start at top-left
let curX = 0
let curY = 0
markVisited(curX, curY)
push(curX, curY)

while (stackTop > 0) {
  drawMaze()
  sleep(30)

  // Find unvisited neighbors
  let neighbors = 0
  let nx = [0, 0, 0, 0]
  let ny = [0, 0, 0, 0]

  // Check all 4 directions
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
    // Pick random neighbor
    let pick = random(0, neighbors - 1)
    let nextX = nx[pick]
    let nextY = ny[pick]

    // Remove wall between current and next
    removeWall(curX, curY, nextX, nextY)

    // Move to next cell
    markVisited(nextX, nextY)
    push(nextX, nextY)
    curX = nextX
    curY = nextY
  } else {
    // Backtrack
    pop()
    if (stackTop > 0) {
      curX = stackX[stackTop - 1]
      curY = stackY[stackTop - 1]
    }
  }
}

drawMaze()
color("yellow")
text(140, 150, "DONE!")`
};
