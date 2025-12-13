// Example: Classes
// Object-oriented programming with classes

export const example = {
  name: 'Classes',
  description: 'Create objects with fields and methods',
  code: `// Classes Demo
// Bundle data and behavior together

// Define a Player class
class Player {
  name,
  health,
  score,

  takeDamage(amount) {
    this.health = this.health - amount
    if (this.health < 0) {
      this.health = 0
    }
  }

  addScore(points) {
    this.score = this.score + points
  }

  status() {
    print(this.name + ": " + this.health + " HP, " + this.score + " pts")
  }
}

// Create two players
let p1 = new Player("Alice", 100, 0)
let p2 = new Player("Bob", 100, 0)

// Game events
p1.addScore(10)
p2.takeDamage(25)
p1.addScore(5)
p2.addScore(15)
p1.takeDamage(10)

// Show final status
print("=== Final Status ===")
p1.status()
p2.status()`
};
