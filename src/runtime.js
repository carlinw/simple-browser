// Tiny - Runtime Classes
// Environment, function values, and error types

// Environment class - stores variable bindings with scope chain
export class Environment {
  constructor(parent = null) {
    this.values = new Map();
    this.parent = parent;
  }

  // Define a new variable in current scope
  define(name, value) {
    this.values.set(name, value);
  }

  // Get a variable's value (searches up scope chain)
  // Optimized: iterative instead of recursive for performance
  get(name) {
    let env = this;
    while (env) {
      if (env.values.has(name)) {
        return env.values.get(name);
      }
      env = env.parent;
    }
    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  // Assign a new value to an existing variable (searches up scope chain)
  // Optimized: iterative instead of recursive for performance
  assign(name, value) {
    let env = this;
    while (env) {
      if (env.values.has(name)) {
        env.values.set(name, value);
        return;
      }
      env = env.parent;
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
export class TinyFunction {
  constructor(declaration, closure) {
    this.declaration = declaration;
    this.closure = closure;
  }
}

// Class value - stores class definition
export class TinyClass {
  constructor(name, fields, methods) {
    this.name = name;
    this.fields = fields;     // Array of field names
    this.methods = methods;   // Map of method name -> method declaration
  }
}

// Instance value - stores instance data
export class TinyInstance {
  constructor(klass) {
    this.klass = klass;
    this.fields = new Map();  // Field name -> value
  }

  get(name) {
    if (this.fields.has(name)) {
      return this.fields.get(name);
    }
    throw new RuntimeError(`Undefined property: ${name}`);
  }

  set(name, value) {
    this.fields.set(name, value);
  }

  has(name) {
    return this.fields.has(name);
  }
}

// Return value - used as exception to unwind call stack
export class ReturnValue {
  constructor(value) {
    this.value = value;
  }
}

// Runtime error class
export class RuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RuntimeError';
  }
}
