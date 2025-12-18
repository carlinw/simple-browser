// Tiny - Expression Evaluator
// Walks the AST and computes values

import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_LOOP_ITERATIONS, COLORS, SLOW_DELAY_MS, SLOWER_DELAY_MS } from './constants.js';
import { Environment, TinyFunction, TinyClass, TinyInstance, ReturnValue, RuntimeError } from './runtime.js';

export class Interpreter {
  constructor(options = {}) {
    this.onNodeEnter = options.onNodeEnter || null;
    this.onNodeExit = options.onNodeExit || null;
    this.onVariableChange = options.onVariableChange || null;
    this.onPrint = options.onPrint || (() => {});
    this.onCallStart = options.onCallStart || null;
    this.onCallEnd = options.onCallEnd || null;
    this.onInput = options.onInput || null;
    this.onKey = options.onKey || null;
    this.isKeyPressed = options.isKeyPressed || (() => false);
    this.onClear = options.onClear || (() => {});
    this.onColor = options.onColor || (() => {});
    this.onRect = options.onRect || (() => {});
    this.onCircle = options.onCircle || (() => {});
    this.onLine = options.onLine || (() => {});
    this.onText = options.onText || (() => {});
    this.onTriangle = options.onTriangle || (() => {});
    this.onFill = options.onFill || (() => {});
    this.onStroke = options.onStroke || (() => {});
    this.onFullscreen = options.onFullscreen || (() => {});
    this.getCanvasWidth = options.getCanvasWidth || (() => CANVAS_WIDTH);
    this.getCanvasHeight = options.getCanvasHeight || (() => CANVAS_HEIGHT);
    this.stepDelay = options.stepDelay || 0;
    this.stepping = options.stepping || false;
    this.onStep = options.onStep || null;
    this.onPause = options.onPause || null;  // Called when pause() is executed
    this.onDebugStep = options.onDebugStep || null;  // Called after each statement when debug stepping
    this.environment = new Environment();
    this.stopped = false;
    this.maxLoopIterations = MAX_LOOP_ITERATIONS;
    // Debug stepping mode
    this.debugStepping = false;  // Whether we're in single-step debug mode
    this.stepMode = 'into';  // 'into' | 'over'
    this.stepOverDepth = 0;  // Call depth when step over was triggered
    this.callDepth = 0;      // Current call stack depth
    this.currentLine = null; // Current line being executed (for debug highlighting)
    this.skipNextDebugStep = false;  // Skip the next onDebugStep (after pause() returns)
  }

  // Stop the interpreter
  stop() {
    this.stopped = true;
  }

  // Check if stopped and throw if so
  checkStopped() {
    if (this.stopped) {
      throw new RuntimeError('Program stopped');
    }
  }

  // Main entry point - evaluate a program (async for animation support)
  async interpret(ast) {
    const results = [];
    for (const statement of ast.statements) {
      this.checkStopped();
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
    this.checkStopped();

    // Highlight the current line before waiting for step
    await this.enterNode(node, true);  // true = this is a statement, apply delay

    // Old step mode (for Step button, deprecated)
    if (this.stepping && this.onStep) {
      await this.onStep();
    }

    let result;
    switch (node.type) {
      case 'ExpressionStatement':
        result = await this.evaluate(node.expression);
        break;

      case 'LetStatement': {
        const value = await this.evaluate(node.value);
        this.environment.define(node.name, value);
        if (this.onVariableChange) this.onVariableChange(node.name, value, 'define');
        result = value;
        break;
      }

      case 'AssignStatement': {
        const value = await this.evaluate(node.value);
        this.environment.assign(node.name, value);
        if (this.onVariableChange) this.onVariableChange(node.name, value, 'assign');
        result = value;
        break;
      }

      case 'IfStatement': {
        const condition = await this.evaluate(node.condition);
        if (this.isTruthy(condition)) {
          result = await this.execute(node.thenBranch);
        } else if (node.elseBranch) {
          result = await this.execute(node.elseBranch);
        }
        break;
      }

      case 'WhileStatement': {
        let iterations = 0;

        while (this.isTruthy(await this.evaluate(node.condition))) {
          this.checkStopped();
          if (++iterations > this.maxLoopIterations) {
            throw new RuntimeError(`Infinite loop detected (exceeded ${this.maxLoopIterations} iterations)`);
          }
          result = await this.execute(node.body);
        }
        break;
      }

      case 'Block': {
        // Create new scope for block (Java-style block scoping)
        const previousEnv = this.environment;
        this.environment = new Environment(previousEnv);
        try {
          // Execute all statements in block
          for (const stmt of node.statements) {
            result = await this.execute(stmt);
          }
        } finally {
          // Restore previous scope
          this.environment = previousEnv;
        }
        break;
      }

      case 'FunctionDeclaration': {
        const func = new TinyFunction(node, this.environment);
        this.environment.define(node.name, func);
        if (this.onVariableChange) this.onVariableChange(node.name, '[function]', 'define');
        break;
      }

      case 'ReturnStatement': {
        let value = null;
        if (node.value) {
          value = await this.evaluate(node.value);
        }
        throw new ReturnValue(value);
      }

      case 'IndexAssignStatement': {
        const object = await this.evaluate(node.object);
        const index = await this.evaluate(node.index);
        const value = await this.evaluate(node.value);
        this.validateArrayAssign(object, index);
        // Fill gaps with null if growing array
        while (object.length < index) {
          object.push(null);
        }
        object[index] = value;
        if (this.onVariableChange) this.onVariableChange(null, object, 'update');
        break;
      }

      case 'ClassDeclaration': {
        // Build methods map
        const methods = new Map();
        for (const method of node.methods) {
          methods.set(method.name, method);
        }
        // Create class with field names
        const fieldNames = node.fields.map(f => f.name);
        const klass = new TinyClass(node.name, fieldNames, methods);
        this.environment.define(node.name, klass);
        if (this.onVariableChange) this.onVariableChange(node.name, '[class]', 'define');
        break;
      }

      case 'MemberAssignStatement': {
        const object = await this.evaluate(node.object);
        if (!(object instanceof TinyInstance)) {
          throw new RuntimeError('Cannot set property on non-instance');
        }
        const value = await this.evaluate(node.value);
        object.set(node.property, value);
        if (this.onVariableChange) this.onVariableChange(null, object, 'update');
        break;
      }

      default:
        result = null;
    }

    await this.exitNode(node, result);

    // Debug stepping: pause AFTER each statement if stepping
    // Skip Block nodes (they're containers, not actual statements)
    if (this.debugStepping && this.onDebugStep && node.type !== 'Block') {
      // Skip if we just returned from pause() - we already paused on this statement
      if (this.skipNextDebugStep) {
        this.skipNextDebugStep = false;
      } else {
        // For step over: only pause at original depth or shallower
        if (this.stepMode === 'into' || this.callDepth <= this.stepOverDepth) {
          await this.onDebugStep();
        }
      }
    }

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

      case 'UnaryExpression': {
        const operand = await this.evaluate(node.operand);

        switch (node.operator) {
          case 'not':
            result = !this.isTruthy(operand);
            break;
          case '-':
            if (typeof operand !== 'number') {
              throw new RuntimeError('Unary minus requires a number');
            }
            result = -operand;
            break;
          default:
            throw new RuntimeError(`Unknown unary operator: ${node.operator}`);
        }
        break;
      }

      case 'Identifier':
        result = this.environment.get(node.name);
        break;

      case 'CallExpression': {
        // Check for builtin functions first
        const builtinResult = await this.tryBuiltinCall(node);
        if (builtinResult !== undefined) {
          result = builtinResult;
          break;
        }

        const callee = this.environment.get(node.callee);

        if (!(callee instanceof TinyFunction)) {
          throw new RuntimeError(`'${node.callee}' is not a function`);
        }

        // Evaluate arguments
        const args = [];
        for (const arg of node.arguments) {
          args.push(await this.evaluate(arg));
        }

        // Check argument count
        if (args.length !== callee.declaration.params.length) {
          throw new RuntimeError(
            `Expected ${callee.declaration.params.length} arguments but got ${args.length}`
          );
        }

        // Create new environment for function execution
        const funcEnv = new Environment(callee.closure);

        // Bind parameters to arguments
        for (let i = 0; i < callee.declaration.params.length; i++) {
          funcEnv.define(callee.declaration.params[i], args[i]);
        }

        // Execute function body in new environment
        const previousEnv = this.environment;
        this.environment = funcEnv;

        // Notify call start with call site line
        const callLine = node.line || node.token?.line;
        if (this.onCallStart) this.onCallStart(node.callee, args, funcEnv, callLine);

        // Track call depth for step over
        this.callDepth++;

        try {
          await this.execute(callee.declaration.body);
          result = null; // No explicit return
        } catch (e) {
          if (e instanceof ReturnValue) {
            result = e.value;
          } else {
            throw e;
          }
        } finally {
          this.callDepth--;
          this.environment = previousEnv;
          // Notify call end
          if (this.onCallEnd) this.onCallEnd(node.callee, result);
        }
        break;
      }

      case 'ArrayLiteral': {
        const elements = [];
        for (const elem of node.elements) {
          elements.push(await this.evaluate(elem));
        }
        result = elements;
        break;
      }

      case 'IndexExpression': {
        const object = await this.evaluate(node.object);
        const index = await this.evaluate(node.index);
        this.validateArrayAccess(object, index);
        result = object[index];
        break;
      }

      case 'BuiltinCall': {
        // len() has been replaced by .length() method
        throw new RuntimeError(`Unknown built-in function: ${node.name}. Did you mean .length()?`);
      }

      case 'ThisExpression': {
        // 'this' is bound in the current environment
        result = this.environment.get('this');
        break;
      }

      case 'NewExpression': {
        // Get the class
        const klass = this.environment.get(node.className);
        if (!(klass instanceof TinyClass)) {
          throw new RuntimeError(`'${node.className}' is not a class`);
        }

        // Evaluate arguments
        const args = [];
        for (const arg of node.arguments) {
          args.push(await this.evaluate(arg));
        }

        // Check argument count matches field count
        if (args.length !== klass.fields.length) {
          throw new RuntimeError(
            `Class ${node.className} expects ${klass.fields.length} arguments but got ${args.length}`
          );
        }

        // Create instance and initialize fields
        const instance = new TinyInstance(klass);
        for (let i = 0; i < klass.fields.length; i++) {
          instance.set(klass.fields[i], args[i]);
        }

        result = instance;
        break;
      }

      case 'MemberExpression': {
        const object = await this.evaluate(node.object);
        if (!(object instanceof TinyInstance)) {
          throw new RuntimeError('Cannot access property on non-instance');
        }
        result = object.get(node.property);
        break;
      }

      case 'MethodCall': {
        const object = await this.evaluate(node.object);

        // Handle built-in methods on arrays and strings
        if (Array.isArray(object) || typeof object === 'string') {
          if (node.method === 'length') {
            if (node.arguments.length !== 0) {
              throw new RuntimeError('length() takes no arguments');
            }
            result = object.length;
            break;
          }
          throw new RuntimeError(`Unknown method: ${node.method}`);
        }

        if (!(object instanceof TinyInstance)) {
          throw new RuntimeError('Cannot call method on non-instance');
        }

        // Get method from class
        const method = object.klass.methods.get(node.method);
        if (!method) {
          throw new RuntimeError(`Undefined method: ${node.method}`);
        }

        // Evaluate arguments
        const args = [];
        for (const arg of node.arguments) {
          args.push(await this.evaluate(arg));
        }

        // Check argument count
        if (args.length !== method.params.length) {
          throw new RuntimeError(
            `Method ${node.method} expects ${method.params.length} arguments but got ${args.length}`
          );
        }

        // Create new environment for method execution
        // Method has access to global scope (not closure-based for simplicity)
        const methodEnv = new Environment(this.environment);

        // Bind 'this' to the instance
        methodEnv.define('this', object);

        // Bind parameters to arguments
        for (let i = 0; i < method.params.length; i++) {
          methodEnv.define(method.params[i], args[i]);
        }

        // Execute method body in new environment
        const previousEnv = this.environment;
        this.environment = methodEnv;

        // Notify call start with call site line
        const methodCallLine = node.line || node.token?.line;
        if (this.onCallStart) this.onCallStart(node.method, args, methodEnv, methodCallLine);

        // Track call depth for step over
        this.callDepth++;

        try {
          await this.execute(method.body);
          result = null; // No explicit return
        } catch (e) {
          if (e instanceof ReturnValue) {
            result = e.value;
          } else {
            throw e;
          }
        } finally {
          this.callDepth--;
          this.environment = previousEnv;
          // Notify call end
          if (this.onCallEnd) this.onCallEnd(node.method, result);
        }
        break;
      }

      default:
        throw new RuntimeError(`Unknown expression type: ${node.type}`);
    }

    await this.exitNode(node, result);
    return result;
  }

  // Check if a value is truthy
  isTruthy(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    return true;  // numbers (including 0) and strings are truthy
  }

  // DRY helper for array/string access validation (reading)
  validateArrayAccess(object, index) {
    if (!Array.isArray(object) && typeof object !== 'string') {
      throw new RuntimeError('Cannot index non-array/string value');
    }
    if (typeof index !== 'number' || !Number.isInteger(index)) {
      throw new RuntimeError('Index must be an integer');
    }
    if (index < 0 || index >= object.length) {
      throw new RuntimeError(`Index ${index} out of bounds (length: ${object.length})`);
    }
  }

  // Validation for array assignment (allows growth)
  validateArrayAssign(object, index) {
    if (!Array.isArray(object)) {
      throw new RuntimeError('Cannot assign to index of non-array value');
    }
    if (typeof index !== 'number' || !Number.isInteger(index)) {
      throw new RuntimeError('Index must be an integer');
    }
    if (index < 0) {
      throw new RuntimeError(`Index ${index} out of bounds (cannot be negative)`);
    }
  }

  // Evaluate binary expression
  async evaluateBinary(node) {
    // Short-circuit evaluation for 'and' and 'or'
    if (node.operator === 'and') {
      const left = await this.evaluate(node.left);
      if (!this.isTruthy(left)) {
        return left; // Short-circuit: return falsy value
      }
      return await this.evaluate(node.right);
    }

    if (node.operator === 'or') {
      const left = await this.evaluate(node.left);
      if (this.isTruthy(left)) {
        return left; // Short-circuit: return truthy value
      }
      return await this.evaluate(node.right);
    }

    // Evaluate both operands for other operators
    const left = await this.evaluate(node.left);
    const right = await this.evaluate(node.right);

    // String concatenation with +
    if (node.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
      return String(left) + String(right);
    }

    // Comparison operators work on numbers and booleans
    if (node.operator === 'equals' || node.operator === 'not equals') {
      if (node.operator === 'equals') return left === right;
      if (node.operator === 'not equals') return left !== right;
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
      case '%':
        if (right === 0) throw new RuntimeError('Modulo by zero');
        return left % right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      default:
        throw new RuntimeError(`Unknown operator: ${node.operator}`);
    }
  }

  // Try to execute a builtin function call
  // Returns undefined if not a builtin, otherwise returns the result
  async tryBuiltinCall(node) {
    const funcName = node.callee;

    // Evaluate arguments for all builtins
    const args = [];
    for (const arg of node.arguments) {
      args.push(await this.evaluate(arg));
    }

    switch (funcName) {
      case 'print': {
        if (args.length !== 1) {
          throw new RuntimeError('print() requires 1 argument');
        }
        this.onPrint(args[0]);
        return null;
      }

      case 'num': {
        if (args.length !== 1) {
          throw new RuntimeError('num() requires 1 argument');
        }
        const arg = args[0];
        if (typeof arg === 'number') {
          return arg;  // Already a number
        }
        if (typeof arg !== 'string') {
          throw new RuntimeError('num() requires a string argument');
        }
        const parsed = Number(arg);
        if (isNaN(parsed)) {
          throw new RuntimeError(`Cannot convert "${arg}" to number`);
        }
        return parsed;
      }

      case 'random': {
        if (args.length !== 2) {
          throw new RuntimeError('random() requires 2 arguments (min, max)');
        }
        const [min, max] = args;
        if (typeof min !== 'number' || typeof max !== 'number') {
          throw new RuntimeError('random() requires number arguments');
        }
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
          throw new RuntimeError('random() requires integer arguments');
        }
        if (min > max) {
          throw new RuntimeError('random() min must be <= max');
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      case 'input': {
        if (args.length !== 0) {
          throw new RuntimeError('input() takes no arguments');
        }
        return await this.requestInput();
      }

      case 'key': {
        if (args.length !== 0) {
          throw new RuntimeError('key() takes no arguments');
        }
        return await this.requestKey();
      }

      case 'sleep': {
        if (args.length !== 1) {
          throw new RuntimeError('sleep() requires 1 argument');
        }
        const ms = args[0];
        if (typeof ms !== 'number' || ms < 0) {
          throw new RuntimeError('sleep() requires a positive number');
        }
        await this.delay(ms);
        return null;
      }

      case 'pressed': {
        if (args.length !== 1) {
          throw new RuntimeError('pressed() requires 1 argument');
        }
        const key = args[0];
        if (typeof key !== 'string') {
          throw new RuntimeError('pressed() requires a string argument');
        }
        return this.isKeyPressed(key);
      }

      case 'clear': {
        if (args.length !== 0) {
          throw new RuntimeError('clear() takes no arguments');
        }
        this.onClear();
        return null;
      }

      case 'color': {
        if (args.length !== 1) {
          throw new RuntimeError('color() requires 1 argument');
        }
        const name = args[0];
        if (typeof name !== 'string') {
          throw new RuntimeError('color() requires a string argument');
        }
        if (!COLORS[name]) {
          throw new RuntimeError(`Unknown color: ${name}`);
        }
        this.onColor(COLORS[name]);
        return null;
      }

      case 'rect': {
        if (args.length !== 4) {
          throw new RuntimeError('rect() requires 4 arguments (x, y, width, height)');
        }
        const [x, y, w, h] = args;
        if (typeof x !== 'number' || typeof y !== 'number' ||
            typeof w !== 'number' || typeof h !== 'number') {
          throw new RuntimeError('rect() requires number arguments');
        }
        this.onRect(x, y, w, h);
        return null;
      }

      case 'circle': {
        if (args.length !== 3) {
          throw new RuntimeError('circle() requires 3 arguments (x, y, radius)');
        }
        const [cx, cy, r] = args;
        if (typeof cx !== 'number' || typeof cy !== 'number' || typeof r !== 'number') {
          throw new RuntimeError('circle() requires number arguments');
        }
        this.onCircle(cx, cy, r);
        return null;
      }

      case 'line': {
        if (args.length !== 4) {
          throw new RuntimeError('line() requires 4 arguments (x1, y1, x2, y2)');
        }
        const [x1, y1, x2, y2] = args;
        if (typeof x1 !== 'number' || typeof y1 !== 'number' ||
            typeof x2 !== 'number' || typeof y2 !== 'number') {
          throw new RuntimeError('line() requires number arguments');
        }
        this.onLine(x1, y1, x2, y2);
        return null;
      }

      case 'text': {
        if (args.length !== 3) {
          throw new RuntimeError('text() requires 3 arguments (x, y, string)');
        }
        const [tx, ty, str] = args;
        if (typeof tx !== 'number' || typeof ty !== 'number') {
          throw new RuntimeError('text() x and y must be numbers');
        }
        this.onText(tx, ty, String(str));
        return null;
      }

      case 'triangle': {
        if (args.length !== 6) {
          throw new RuntimeError('triangle() requires 6 arguments (x1, y1, x2, y2, x3, y3)');
        }
        const [tx1, ty1, tx2, ty2, tx3, ty3] = args;
        if (typeof tx1 !== 'number' || typeof ty1 !== 'number' ||
            typeof tx2 !== 'number' || typeof ty2 !== 'number' ||
            typeof tx3 !== 'number' || typeof ty3 !== 'number') {
          throw new RuntimeError('triangle() requires number arguments');
        }
        this.onTriangle(tx1, ty1, tx2, ty2, tx3, ty3);
        return null;
      }

      case 'fill': {
        if (args.length !== 0) {
          throw new RuntimeError('fill() takes no arguments');
        }
        this.onFill();
        return null;
      }

      case 'stroke': {
        if (args.length !== 0) {
          throw new RuntimeError('stroke() takes no arguments');
        }
        this.onStroke();
        return null;
      }

      case 'fullscreen': {
        if (args.length !== 0) {
          throw new RuntimeError('fullscreen() takes no arguments');
        }
        this.onFullscreen();
        return null;
      }

      case 'width': {
        if (args.length !== 0) {
          throw new RuntimeError('width() takes no arguments');
        }
        return this.getCanvasWidth();
      }

      case 'height': {
        if (args.length !== 0) {
          throw new RuntimeError('height() takes no arguments');
        }
        return this.getCanvasHeight();
      }

      case 'pause': {
        if (args.length !== 0) {
          throw new RuntimeError('pause() takes no arguments');
        }
        // Skip pause if stepping over and we're deeper than the step over depth
        if (this.stepMode === 'over' && this.callDepth > this.stepOverDepth) {
          return null;
        }
        // Reset step mode after pausing (user must click step again)
        this.stepMode = 'into';
        // Wait for user interaction before continuing (if callback provided)
        if (this.onPause) {
          await this.onPause();
          // Skip the next onDebugStep since we just paused on this statement
          // User wants to step to the NEXT statement, not pause on this one again
          this.skipNextDebugStep = true;
        }
        return null;
      }

      case 'slow': {
        if (args.length !== 0) {
          throw new RuntimeError('slow() takes no arguments');
        }
        this.stepDelay = SLOW_DELAY_MS;
        return null;
      }

      case 'slower': {
        if (args.length !== 0) {
          throw new RuntimeError('slower() takes no arguments');
        }
        this.stepDelay = SLOWER_DELAY_MS;
        return null;
      }

      case 'fast': {
        if (args.length !== 0) {
          throw new RuntimeError('fast() takes no arguments');
        }
        this.stepDelay = 0;  // No delay, same as run mode
        return null;
      }

      case 'looplimit': {
        if (args.length !== 1) {
          throw new RuntimeError('looplimit() takes 1 argument');
        }
        const limit = args[0];
        if (typeof limit !== 'number' || !Number.isInteger(limit)) {
          throw new RuntimeError('looplimit() requires an integer');
        }
        if (limit <= 0) {
          throw new RuntimeError('looplimit() requires a positive number');
        }
        this.maxLoopIterations = limit;
        return null;
      }

      default:
        return undefined;  // Not a builtin
    }
  }

  // Request line input from user
  async requestInput() {
    if (this.onInput) {
      return await this.onInput();
    }
    throw new RuntimeError('Input not supported in this environment');
  }

  // Request single keypress from user
  async requestKey() {
    if (this.onKey) {
      return await this.onKey();
    }
    throw new RuntimeError('Key input not supported in this environment');
  }

  // Visualization hooks - called in debug mode (stepDelay > 0) or stepping mode
  async enterNode(node, isStatement = false) {
    // Track current line for debug highlighting
    const line = node.line || node.token?.line;
    if (line) {
      this.currentLine = line;
    }
    if (this.onNodeEnter && (this.stepDelay > 0 || this.stepping)) {
      this.onNodeEnter(node);
    }
    // Only delay for statements, not expressions
    if (isStatement && this.stepDelay > 0) {
      await this.delay(this.stepDelay);
    }
  }

  async exitNode(node, result) {
    if (this.stepDelay > 0 && this.onNodeExit) {
      this.onNodeExit(node, result);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

