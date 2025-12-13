// Example: Towers of Hanoi
// Classic recursive puzzle visualization

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['towers-of-hanoi'] = {
  name: "Towers of Hanoi",
  description: "Watch the classic recursive puzzle solve itself",
  code: `// Towers of Hanoi
// Move all disks from tower A to tower C
// Rule: Can only move one disk at a time
// Rule: Cannot place larger disk on smaller disk

// Number of disks (3-5 works well visually)
let numDisks = 4

// Tower arrays store disk sizes (larger number = bigger disk)
// Index 0 is bottom of tower
let towerA = [0, 0, 0, 0, 0]
let towerB = [0, 0, 0, 0, 0]
let towerC = [0, 0, 0, 0, 0]

// Track how many disks on each tower
let heightA = numDisks
let heightB = 0
let heightC = 0

// Initialize tower A with all disks (largest at bottom)
let i = 0
while (i < numDisks) {
  towerA[i] = numDisks - i
  i = i + 1
}

// Move counter
let moves = 0

// Get the top disk from a tower
function getTop(tower, height) {
  if (height equals 0) {
    return 0
  }
  if (tower equals 1) { return towerA[height - 1] }
  if (tower equals 2) { return towerB[height - 1] }
  if (tower equals 3) { return towerC[height - 1] }
  return 0
}

// Set a disk at position in tower
function setDisk(tower, pos, value) {
  if (tower equals 1) { towerA[pos] = value }
  if (tower equals 2) { towerB[pos] = value }
  if (tower equals 3) { towerC[pos] = value }
}

// Get height of a tower
function getHeight(tower) {
  if (tower equals 1) { return heightA }
  if (tower equals 2) { return heightB }
  if (tower equals 3) { return heightC }
  return 0
}

// Set height of a tower
function setHeight(tower, h) {
  if (tower equals 1) { heightA = h }
  if (tower equals 2) { heightB = h }
  if (tower equals 3) { heightC = h }
}

// Move one disk from source to destination
function moveDisk(from, to) {
  let fromH = getHeight(from)
  let toH = getHeight(to)

  // Get disk from source
  let disk = getTop(from, fromH)

  // Remove from source
  setDisk(from, fromH - 1, 0)
  setHeight(from, fromH - 1)

  // Add to destination
  setDisk(to, toH, disk)
  setHeight(to, toH + 1)

  moves = moves + 1

  // Draw and pause to show animation
  draw()
  sleep(500)
}

// Draw the current state
function draw() {
  clear()

  // Tower positions
  let t1x = 70
  let t2x = 200
  let t3x = 330
  let baseY = 250

  // Draw tower poles
  color("gray")
  rect(t1x - 3, 100, 6, 150)
  rect(t2x - 3, 100, 6, 150)
  rect(t3x - 3, 100, 6, 150)

  // Draw base
  rect(20, baseY, 360, 10)

  // Draw labels
  color("white")
  text(t1x - 5, baseY + 20, "A")
  text(t2x - 5, baseY + 20, "B")
  text(t3x - 5, baseY + 20, "C")

  // Draw disks on tower A
  let j = 0
  while (j < heightA) {
    drawDisk(t1x, baseY - (j + 1) * 25, towerA[j])
    j = j + 1
  }

  // Draw disks on tower B
  j = 0
  while (j < heightB) {
    drawDisk(t2x, baseY - (j + 1) * 25, towerB[j])
    j = j + 1
  }

  // Draw disks on tower C
  j = 0
  while (j < heightC) {
    drawDisk(t3x, baseY - (j + 1) * 25, towerC[j])
    j = j + 1
  }

  // Show move count
  color("yellow")
  text(10, 20, "Moves: " + moves)
}

// Draw a single disk centered at x, y
function drawDisk(x, y, size) {
  let w = size * 20 + 10
  // Color based on size
  if (size equals 1) { color("red") }
  if (size equals 2) { color("orange") }
  if (size equals 3) { color("yellow") }
  if (size equals 4) { color("green") }
  if (size equals 5) { color("cyan") }
  rect(x - w / 2, y, w, 20)
}

// Recursive solution to Towers of Hanoi
// Move n disks from source to dest using aux as helper
function hanoi(n, source, dest, aux) {
  if (n equals 0) {
    return 0
  }
  // Move n-1 disks from source to aux
  hanoi(n - 1, source, aux, dest)
  // Move the largest disk from source to dest
  moveDisk(source, dest)
  // Move n-1 disks from aux to dest
  hanoi(n - 1, aux, dest, source)
  return 0
}

// Initial draw
print("Towers of Hanoi - " + numDisks + " disks")
print("Press any key to start")
draw()
key()

// Solve! Move all from tower 1 (A) to tower 3 (C)
hanoi(numDisks, 1, 3, 2)

// Done!
color("lime")
text(140, 60, "SOLVED!")
print("Solved in " + moves + " moves")`
};
