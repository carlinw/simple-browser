// Tiny - Runtime Classes
// Environment, function values, and error types

// Environment class - stores variable bindings with scope chain
class Environment {
  constructor(parent = null) {
    this.values = new Map();
    this.parent = parent;
  }

  // Define a new variable in current scope
  define(name, value) {
    this.values.set(name, value);
  }

  // Get a variable's value (searches up scope chain)
  get(name) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  // Assign a new value to an existing variable (searches up scope chain)
  assign(name, value) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  // Check if a variable exists (in current scope only)
  has(name) {
    return this.values.has(name);
  }

  // Get all variable names (for visualization - current scope only)
  getAll() {
    return Array.from(this.values.entries());
  }
}

// Function value - stores declaration and closure environment
class TinyFunction {
  constructor(declaration, closure) {
    this.declaration = declaration;
    this.closure = closure;
  }
}

// Return value - used as exception to unwind call stack
class ReturnValue {
  constructor(value) {
    this.value = value;
  }
}

// Runtime error class
class RuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RuntimeError';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Environment, TinyFunction, ReturnValue, RuntimeError };
}
