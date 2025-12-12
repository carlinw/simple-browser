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

  // Get the previously consumed token
  previous() {
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
    if (this.match('KEYWORD', 'function')) {
      return this.parseFunctionDeclaration();
    }
    if (this.match('KEYWORD', 'return')) {
      return this.parseReturnStatement();
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
    return {
      type: 'ExpressionStatement',
      expression: expr,
      token: expr.token,
      endToken: expr.endToken || expr.token
    };
  }

  parseLetStatement() {
    const letToken = this.previous(); // 'let' keyword we just matched
    const nameToken = this.consume('IDENTIFIER', null, "Expected variable name after 'let'");
    this.consume('OPERATOR', '=', "Expected '=' after variable name");
    const value = this.parseExpression();
    const endToken = this.previous(); // Last token of expression

    return {
      type: 'LetStatement',
      name: nameToken.value,
      value: value,
      token: letToken,
      endToken: endToken
    };
  }

  parseAssignStatement() {
    const nameToken = this.advance(); // consume identifier
    this.advance(); // consume '='
    const value = this.parseExpression();
    const endToken = this.previous(); // Last token of expression

    return {
      type: 'AssignStatement',
      name: nameToken.value,
      value: value,
      token: nameToken,
      endToken: endToken
    };
  }

  parsePrintStatement() {
    const printToken = this.previous(); // 'print' keyword we just matched
    const value = this.parseExpression();
    const endToken = this.previous(); // Last token of expression

    return {
      type: 'PrintStatement',
      value: value,
      token: printToken,
      endToken: endToken
    };
  }

  parseIfStatement() {
    const ifToken = this.previous(); // 'if' keyword we just matched
    this.consume('PUNCTUATION', '(', "Expected '(' after 'if'");
    const condition = this.parseExpression();
    this.consume('PUNCTUATION', ')', "Expected ')' after condition");

    const thenBranch = this.parseBlock();

    let elseBranch = null;
    if (this.match('KEYWORD', 'else')) {
      elseBranch = this.parseBlock();
    }

    const endToken = this.previous(); // closing '}'

    return {
      type: 'IfStatement',
      condition: condition,
      thenBranch: thenBranch,
      elseBranch: elseBranch,
      token: ifToken,
      endToken: endToken
    };
  }

  parseWhileStatement() {
    const whileToken = this.previous(); // 'while' keyword we just matched
    this.consume('PUNCTUATION', '(', "Expected '(' after 'while'");
    const condition = this.parseExpression();
    this.consume('PUNCTUATION', ')', "Expected ')' after condition");

    const body = this.parseBlock();
    const endToken = this.previous(); // closing '}'

    return {
      type: 'WhileStatement',
      condition: condition,
      body: body,
      token: whileToken,
      endToken: endToken
    };
  }

  parseFunctionDeclaration() {
    const funcToken = this.previous(); // 'function' keyword we just matched
    const nameToken = this.consume('IDENTIFIER', null, "Expected function name");

    this.consume('PUNCTUATION', '(', "Expected '(' after function name");

    const params = [];
    if (!this.check('PUNCTUATION', ')')) {
      do {
        const param = this.consume('IDENTIFIER', null, "Expected parameter name");
        params.push(param.value);
      } while (this.match('PUNCTUATION', ','));
    }

    this.consume('PUNCTUATION', ')', "Expected ')' after parameters");

    const body = this.parseBlock();

    return {
      type: 'FunctionDeclaration',
      name: nameToken.value,
      params: params,
      body: body,
      token: funcToken,
      endToken: this.previous()
    };
  }

  parseReturnStatement() {
    const returnToken = this.previous(); // 'return' keyword we just matched
    let value = null;

    // Check if there's an expression to return (not at end of block or file)
    if (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      value = this.parseExpression();
    }

    return {
      type: 'ReturnStatement',
      value: value,
      token: returnToken,
      endToken: value ? this.previous() : returnToken
    };
  }

  parseBlock() {
    const openBrace = this.consume('PUNCTUATION', '{', "Expected '{'");

    const statements = [];
    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    const closeBrace = this.consume('PUNCTUATION', '}', "Expected '}'");

    return {
      type: 'Block',
      statements: statements,
      token: openBrace,
      endToken: closeBrace
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
        right: right,
        token: left.token,
        endToken: right.endToken || right.token
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
        right: right,
        token: left.token,
        endToken: right.endToken || right.token
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
        right: right,
        token: left.token,
        endToken: right.endToken || right.token
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
        right: right,
        token: left.token,
        endToken: right.endToken || right.token
      };
    }

    return left;
  }

  parsePrimary() {
    // Number
    if (this.check('NUMBER')) {
      const token = this.advance();
      return { type: 'NumberLiteral', value: token.value, token: token };
    }

    // String
    if (this.check('STRING')) {
      const token = this.advance();
      return { type: 'StringLiteral', value: token.value, token: token };
    }

    // Boolean
    if (this.check('KEYWORD', 'true')) {
      const token = this.advance();
      return { type: 'BooleanLiteral', value: true, token: token };
    }
    if (this.check('KEYWORD', 'false')) {
      const token = this.advance();
      return { type: 'BooleanLiteral', value: false, token: token };
    }

    // Identifier or function call
    if (this.check('IDENTIFIER')) {
      const token = this.advance();

      // Check if this is a function call
      if (this.check('PUNCTUATION', '(')) {
        return this.parseCallExpression(token);
      }

      return { type: 'Identifier', name: token.value, token: token };
    }

    // Grouped expression
    if (this.match('PUNCTUATION', '(')) {
      const openParen = this.previous();
      const expr = this.parseExpression();
      const closeParen = this.consume('PUNCTUATION', ')', "Expected ')' after expression");
      // Return expression with parens as the span boundaries
      return {
        ...expr,
        token: openParen,
        endToken: closeParen
      };
    }

    this.error(`Unexpected token: ${this.peek()?.type} '${this.peek()?.value}'`);
  }

  parseCallExpression(nameToken) {
    this.consume('PUNCTUATION', '(', "Expected '('");

    const args = [];
    if (!this.check('PUNCTUATION', ')')) {
      do {
        args.push(this.parseExpression());
      } while (this.match('PUNCTUATION', ','));
    }

    const closeParen = this.consume('PUNCTUATION', ')', "Expected ')' after arguments");

    return {
      type: 'CallExpression',
      callee: nameToken.value,
      arguments: args,
      token: nameToken,
      endToken: closeParen
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Parser };
}
