// Simple Interpreter - Expression Evaluator
// Walks the AST and computes values

// Environment class - stores variable bindings
// Variables are dynamically typed (can change type after declaration)
class Environment {
  constructor() {
    this.values = new Map();
  }

  // Define a new variable
  define(name, value) {
    this.values.set(name, value);
  }

  // Get a variable's value
  get(name) {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  // Assign a new value to an existing variable
  // Dynamic typing: any type can be assigned to any variable
  assign(name, value) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  // Check if a variable exists
  has(name) {
    return this.values.has(name);
  }

  // Get all variable names (for future visualization)
  getAll() {
    return Array.from(this.values.entries());
  }
}

class Interpreter {
  constructor(options = {}) {
    this.onNodeEnter = options.onNodeEnter || (() => {});
    this.onNodeExit = options.onNodeExit || (() => {});
    this.stepDelay = options.stepDelay || 0;
    this.environment = new Environment();
  }

  // Main entry point - evaluate a program (async for animation support)
  async interpret(ast) {
    const results = [];
    for (const statement of ast.statements) {
      const result = await this.execute(statement);
      if (result !== undefined && result !== null) {
        results.push(result);
      }
    }
    return {
      output: results,
      errors: []
    };
  }

  // Execute a statement
  async execute(node) {
    await this.enterNode(node);

    let result;
    switch (node.type) {
      case 'ExpressionStatement':
        result = await this.evaluate(node.expression);
        break;

      case 'PrintStatement':
        result = await this.evaluate(node.value);
        break;

      case 'LetStatement': {
        const value = await this.evaluate(node.value);
        this.environment.define(node.name, value);
        result = value;
        break;
      }

      case 'AssignStatement': {
        const value = await this.evaluate(node.value);
        this.environment.assign(node.name, value);
        result = value;
        break;
      }

      case 'IfStatement':
        throw new RuntimeError(`If statements not yet supported (coming in Release 9)`);

      case 'WhileStatement':
        throw new RuntimeError(`While loops not yet supported (coming in Release 11)`);

      case 'Block':
        // Execute all statements in block
        for (const stmt of node.statements) {
          result = await this.execute(stmt);
        }
        break;

      default:
        result = null;
    }

    await this.exitNode(node, result);
    return result;
  }

  // Evaluate an expression
  async evaluate(node) {
    await this.enterNode(node);

    let result;
    switch (node.type) {
      case 'NumberLiteral':
        result = node.value;
        break;

      case 'StringLiteral':
        result = node.value;
        break;

      case 'BooleanLiteral':
        result = node.value;
        break;

      case 'BinaryExpression':
        result = await this.evaluateBinary(node);
        break;

      case 'Identifier':
        result = this.environment.get(node.name);
        break;

      default:
        throw new RuntimeError(`Unknown expression type: ${node.type}`);
    }

    await this.exitNode(node, result);
    return result;
  }

  // Evaluate binary expression
  async evaluateBinary(node) {
    const left = await this.evaluate(node.left);
    const right = await this.evaluate(node.right);

    // String concatenation with +
    if (node.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
      return String(left) + String(right);
    }

    // Comparison operators work on numbers and booleans
    if (node.operator === '==' || node.operator === '!=') {
      if (node.operator === '==') return left === right;
      if (node.operator === '!=') return left !== right;
    }

    // Arithmetic and comparison require numbers
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new RuntimeError(`Cannot perform '${node.operator}' on non-numeric values`);
    }

    switch (node.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/':
        if (right === 0) throw new RuntimeError('Division by zero');
        return left / right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      default:
        throw new RuntimeError(`Unknown operator: ${node.operator}`);
    }
  }

  // Visualization hooks
  async enterNode(node) {
    this.onNodeEnter(node);
    if (this.stepDelay > 0) {
      await this.delay(this.stepDelay);
    }
  }

  async exitNode(node, result) {
    this.onNodeExit(node, result);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  module.exports = { Interpreter, RuntimeError, Environment };
}
