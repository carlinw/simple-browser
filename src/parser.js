// Simple Interpreter - Parser
// Converts tokens into an Abstract Syntax Tree (AST)

class Parser {
  constructor(tokens) {
    // Filter out whitespace and comments - parser doesn't need them
    this.tokens = tokens.filter(t =>
      t.type !== 'WHITESPACE' && t.type !== 'COMMENT'
    );
    this.pos = 0;
    this.errors = [];
  }

  // Main entry point
  parse() {
    const statements = [];

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (e) {
        // Error already recorded, try to recover
        this.synchronize();
      }
    }

    return {
      ast: { type: 'Program', statements },
      errors: this.errors
    };
  }

  // Token navigation helpers
  peek() {
    return this.tokens[this.pos];
  }

  peekNext() {
    if (this.pos + 1 >= this.tokens.length) return null;
    return this.tokens[this.pos + 1];
  }

  advance() {
    if (!this.isAtEnd()) {
      this.pos++;
    }
    return this.tokens[this.pos - 1];
  }

  isAtEnd() {
    return this.pos >= this.tokens.length || this.peek().type === 'EOF';
  }

  check(type, value = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== null && token.value !== value) return false;
    return true;
  }

  match(type, value = null) {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  consume(type, value, message) {
    if (this.check(type, value)) {
      return this.advance();
    }
    this.error(message);
  }

  error(message) {
    const token = this.peek();
    const line = token ? token.line : 0;
    const column = token ? token.column : 0;
    this.errors.push({ message, line, column });
    throw new Error(message);
  }

  // Error recovery - skip to next statement
  synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      // Statement boundaries
      if (this.check('KEYWORD', 'let')) return;
      if (this.check('KEYWORD', 'if')) return;
      if (this.check('KEYWORD', 'while')) return;
      if (this.check('KEYWORD', 'print')) return;
      if (this.check('KEYWORD', 'function')) return;
      if (this.check('KEYWORD', 'return')) return;
      this.advance();
    }
  }

  // Statement parsing
  parseStatement() {
    if (this.match('KEYWORD', 'let')) {
      return this.parseLetStatement();
    }
    if (this.match('KEYWORD', 'print')) {
      return this.parsePrintStatement();
    }
    if (this.match('KEYWORD', 'if')) {
      return this.parseIfStatement();
    }
    if (this.match('KEYWORD', 'while')) {
      return this.parseWhileStatement();
    }
    if (this.check('PUNCTUATION', '{')) {
      return this.parseBlock();
    }

    // Check for assignment (identifier followed by =)
    if (this.check('IDENTIFIER') && this.peekNext() &&
        this.peekNext().type === 'OPERATOR' && this.peekNext().value === '=') {
      return this.parseAssignStatement();
    }

    // Expression statement (for future use)
    const expr = this.parseExpression();
    return { type: 'ExpressionStatement', expression: expr };
  }

  parseLetStatement() {
    const nameToken = this.consume('IDENTIFIER', null, "Expected variable name after 'let'");
    this.consume('OPERATOR', '=', "Expected '=' after variable name");
    const value = this.parseExpression();

    return {
      type: 'LetStatement',
      name: nameToken.value,
      value: value
    };
  }

  parseAssignStatement() {
    const nameToken = this.advance(); // consume identifier
    this.advance(); // consume '='
    const value = this.parseExpression();

    return {
      type: 'AssignStatement',
      name: nameToken.value,
      value: value
    };
  }

  parsePrintStatement() {
    const value = this.parseExpression();
    return {
      type: 'PrintStatement',
      value: value
    };
  }

  parseIfStatement() {
    this.consume('PUNCTUATION', '(', "Expected '(' after 'if'");
    const condition = this.parseExpression();
    this.consume('PUNCTUATION', ')', "Expected ')' after condition");

    const thenBranch = this.parseBlock();

    let elseBranch = null;
    if (this.match('KEYWORD', 'else')) {
      elseBranch = this.parseBlock();
    }

    return {
      type: 'IfStatement',
      condition: condition,
      thenBranch: thenBranch,
      elseBranch: elseBranch
    };
  }

  parseWhileStatement() {
    this.consume('PUNCTUATION', '(', "Expected '(' after 'while'");
    const condition = this.parseExpression();
    this.consume('PUNCTUATION', ')', "Expected ')' after condition");

    const body = this.parseBlock();

    return {
      type: 'WhileStatement',
      condition: condition,
      body: body
    };
  }

  parseBlock() {
    this.consume('PUNCTUATION', '{', "Expected '{'");

    const statements = [];
    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.consume('PUNCTUATION', '}', "Expected '}'");

    return {
      type: 'Block',
      statements: statements
    };
  }

  // Expression parsing (recursive descent with precedence)
  parseExpression() {
    return this.parseEquality();
  }

  parseEquality() {
    let left = this.parseComparison();

    while (this.check('OPERATOR', '==') || this.check('OPERATOR', '!=')) {
      const operator = this.advance().value;
      const right = this.parseComparison();
      left = {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
      };
    }

    return left;
  }

  parseComparison() {
    let left = this.parseTerm();

    while (this.check('OPERATOR', '<') || this.check('OPERATOR', '>') ||
           this.check('OPERATOR', '<=') || this.check('OPERATOR', '>=')) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      left = {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
      };
    }

    return left;
  }

  parseTerm() {
    let left = this.parseFactor();

    while (this.check('OPERATOR', '+') || this.check('OPERATOR', '-')) {
      const operator = this.advance().value;
      const right = this.parseFactor();
      left = {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
      };
    }

    return left;
  }

  parseFactor() {
    let left = this.parsePrimary();

    while (this.check('OPERATOR', '*') || this.check('OPERATOR', '/')) {
      const operator = this.advance().value;
      const right = this.parsePrimary();
      left = {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
      };
    }

    return left;
  }

  parsePrimary() {
    // Number
    if (this.check('NUMBER')) {
      const token = this.advance();
      return { type: 'NumberLiteral', value: token.value };
    }

    // String
    if (this.check('STRING')) {
      const token = this.advance();
      return { type: 'StringLiteral', value: token.value };
    }

    // Boolean
    if (this.check('KEYWORD', 'true')) {
      this.advance();
      return { type: 'BooleanLiteral', value: true };
    }
    if (this.check('KEYWORD', 'false')) {
      this.advance();
      return { type: 'BooleanLiteral', value: false };
    }

    // Identifier
    if (this.check('IDENTIFIER')) {
      const token = this.advance();
      return { type: 'Identifier', name: token.value };
    }

    // Grouped expression
    if (this.match('PUNCTUATION', '(')) {
      const expr = this.parseExpression();
      this.consume('PUNCTUATION', ')', "Expected ')' after expression");
      return expr;
    }

    this.error(`Unexpected token: ${this.peek()?.type} '${this.peek()?.value}'`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Parser };
}
