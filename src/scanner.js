// Tiny - Character-by-Character Scanner
// Wraps the lexer to expose the scanning process step by step

const ScanState = {
  IDLE: 'IDLE',           // Not building a token yet
  IDENTIFIER: 'IDENTIFIER', // Building identifier/keyword
  NUMBER: 'NUMBER',       // Building number
  STRING: 'STRING',       // Building string (inside quotes)
  OPERATOR: 'OPERATOR',   // Building operator
  WHITESPACE: 'WHITESPACE', // Building whitespace
  COMMENT: 'COMMENT'      // Building comment
};

class Scanner {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;

    // Scanning state
    this.state = ScanState.IDLE;
    this.buffer = '';
    this.tokenStartLine = 1;
    this.tokenStartColumn = 1;
    this.tokenStartPos = 0;

    // Completed tokens
    this.tokens = [];

    // For two-char operators
    this.pendingOperator = null;
  }

  // Check if we've reached the end
  isAtEnd() {
    return this.pos >= this.source.length;
  }

  // Peek at current character
  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source[this.pos];
  }

  // Peek at next character
  peekNext() {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source[this.pos + 1];
  }

  // Character type checks
  isWhitespace(char) {
    return char === ' ' || char === '\t' || char === '\r' || char === '\n';
  }

  isOperatorChar(char) {
    return '+-*/=!<>'.includes(char);
  }

  isPunctuation(char) {
    return '(){},[]:'.includes(char);
  }

  isTwoCharOperator(first, second) {
    const combo = first + second;
    return combo === '==' || combo === '!=' || combo === '<=' || combo === '>=';
  }

  // Create a token from current buffer
  emitToken(type) {
    const token = {
      type: type,
      value: type === 'NUMBER' ? parseFloat(this.buffer) : this.buffer,
      line: this.tokenStartLine,
      column: this.tokenStartColumn,
      raw: this.buffer
    };

    // Check if identifier is actually a keyword
    if (type === 'IDENTIFIER' && KEYWORDS.has(this.buffer)) {
      token.type = 'KEYWORD';
    }

    this.tokens.push(token);
    this.buffer = '';
    this.state = ScanState.IDLE;

    return token;
  }

  // Step one character forward and return scan info
  stepCharacter() {
    const result = {
      pos: this.pos,
      line: this.line,
      column: this.column,
      char: this.peek(),
      charDisplay: this.getCharDisplay(this.peek()),
      state: this.state,
      buffer: this.buffer,
      action: '',
      tokenEmitted: null,
      done: false
    };

    // Handle end of source
    if (this.isAtEnd()) {
      // Emit any pending token
      if (this.buffer.length > 0) {
        result.tokenEmitted = this.finishCurrentToken();
        result.action = `End of input. Emit ${result.tokenEmitted.type} "${result.tokenEmitted.raw}"`;
      } else {
        // Emit EOF
        const eofToken = {
          type: 'EOF',
          value: null,
          line: this.line,
          column: this.column,
          raw: ''
        };
        this.tokens.push(eofToken);
        result.tokenEmitted = eofToken;
        result.action = 'End of input. Emit EOF';
        result.done = true;
      }
      return result;
    }

    const char = this.peek();

    // State machine
    switch (this.state) {
      case ScanState.IDLE:
        result.action = this.handleIdle(char, result);
        break;

      case ScanState.IDENTIFIER:
        result.action = this.handleIdentifier(char, result);
        break;

      case ScanState.NUMBER:
        result.action = this.handleNumber(char, result);
        break;

      case ScanState.STRING:
        result.action = this.handleString(char, result);
        break;

      case ScanState.WHITESPACE:
        result.action = this.handleWhitespace(char, result);
        break;

      case ScanState.COMMENT:
        result.action = this.handleComment(char, result);
        break;

      case ScanState.OPERATOR:
        result.action = this.handleOperator(char, result);
        break;
    }

    // Update result with new state
    result.newState = this.state;
    result.newBuffer = this.buffer;

    return result;
  }

  // Handle IDLE state - starting a new token
  handleIdle(char, result) {
    this.tokenStartLine = this.line;
    this.tokenStartColumn = this.column;
    this.tokenStartPos = this.pos;

    if (this.isWhitespace(char)) {
      this.state = ScanState.WHITESPACE;
      this.buffer = char;
      this.advanceChar(char);
      return `'${this.getCharDisplay(char)}' is whitespace. Start building WHITESPACE token.`;
    }

    if (char === '/' && this.peekNext() === '/') {
      this.state = ScanState.COMMENT;
      this.buffer = char;
      this.advanceChar(char);
      return `'/' followed by '/' starts a comment. Start building COMMENT token.`;
    }

    if (CharUtils.isDigit(char)) {
      this.state = ScanState.NUMBER;
      this.buffer = char;
      this.advanceChar(char);
      return `'${char}' is a digit. Start building NUMBER token.`;
    }

    if (char === '"') {
      this.state = ScanState.STRING;
      this.buffer = char;
      this.advanceChar(char);
      return `'"' opens a string. Start building STRING token.`;
    }

    if (CharUtils.isAlpha(char)) {
      this.state = ScanState.IDENTIFIER;
      this.buffer = char;
      this.advanceChar(char);
      return `'${char}' is a letter. Start building IDENTIFIER token.`;
    }

    if (this.isOperatorChar(char)) {
      this.state = ScanState.OPERATOR;
      this.buffer = char;
      this.advanceChar(char);
      return `'${char}' is an operator character. Start building OPERATOR token.`;
    }

    if (this.isPunctuation(char)) {
      this.buffer = char;
      this.advanceChar(char);
      result.tokenEmitted = this.emitToken('PUNCTUATION');
      return `'${char}' is punctuation. Emit PUNCTUATION "${char}" immediately.`;
    }

    // Unknown character - skip it
    this.advanceChar(char);
    return `'${char}' is unknown. Skipping.`;
  }

  // Handle IDENTIFIER state
  handleIdentifier(char, result) {
    if (CharUtils.isAlphaNumeric(char)) {
      this.buffer += char;
      this.advanceChar(char);
      return `'${char}' is alphanumeric. Add to buffer: "${this.buffer}"`;
    }

    // Token boundary - emit the identifier/keyword
    const tokenType = KEYWORDS.has(this.buffer) ? 'KEYWORD' : 'IDENTIFIER';
    result.tokenEmitted = this.emitToken('IDENTIFIER');
    return `'${this.getCharDisplay(char)}' ends the identifier. Emit ${tokenType} "${result.tokenEmitted.raw}"`;
  }

  // Handle NUMBER state
  handleNumber(char, result) {
    if (CharUtils.isDigit(char)) {
      this.buffer += char;
      this.advanceChar(char);
      return `'${char}' is a digit. Add to buffer: "${this.buffer}"`;
    }

    // Check for decimal point followed by digit
    if (char === '.' && !this.buffer.includes('.')) {
      const nextChar = this.pos + 1 < this.source.length ? this.source[this.pos + 1] : '\0';
      if (CharUtils.isDigit(nextChar)) {
        this.buffer += char;
        this.advanceChar(char);
        return `'${char}' is decimal point. Add to buffer: "${this.buffer}"`;
      }
    }

    // Token boundary - emit the number
    result.tokenEmitted = this.emitToken('NUMBER');
    return `'${this.getCharDisplay(char)}' ends the number. Emit NUMBER ${result.tokenEmitted.value}`;
  }

  // Handle STRING state
  handleString(char, result) {
    if (char === '"') {
      this.buffer += char;
      this.advanceChar(char);
      result.tokenEmitted = this.emitToken('STRING');
      // Fix the value to not include quotes
      result.tokenEmitted.value = result.tokenEmitted.raw.slice(1, -1);
      return `'"' closes the string. Emit STRING "${result.tokenEmitted.value}"`;
    }

    if (char === '\n') {
      // Unterminated string - emit error and reset
      this.advanceChar(char);
      this.buffer = '';
      this.state = ScanState.IDLE;
      return `Newline in string! Unterminated string error.`;
    }

    this.buffer += char;
    this.advanceChar(char);
    return `'${this.getCharDisplay(char)}' is string content. Add to buffer.`;
  }

  // Handle WHITESPACE state
  handleWhitespace(char, result) {
    if (this.isWhitespace(char)) {
      this.buffer += char;
      this.advanceChar(char);
      return `'${this.getCharDisplay(char)}' is whitespace. Add to buffer.`;
    }

    // Token boundary - emit whitespace
    result.tokenEmitted = this.emitToken('WHITESPACE');
    result.tokenEmitted.value = '(whitespace)';
    return `'${this.getCharDisplay(char)}' ends whitespace. Emit WHITESPACE (skipped).`;
  }

  // Handle COMMENT state
  handleComment(char, result) {
    if (char === '\n') {
      // Comment ends at newline, but don't consume the newline
      result.tokenEmitted = this.emitToken('COMMENT');
      return `Newline ends comment. Emit COMMENT "${result.tokenEmitted.raw}"`;
    }

    this.buffer += char;
    this.advanceChar(char);
    return `'${this.getCharDisplay(char)}' is comment content. Add to buffer.`;
  }

  // Handle OPERATOR state
  handleOperator(char, result) {
    // Check for two-character operators
    if (this.buffer.length === 1 && this.isTwoCharOperator(this.buffer, char)) {
      this.buffer += char;
      this.advanceChar(char);
      result.tokenEmitted = this.emitToken('OPERATOR');
      return `'${char}' completes two-char operator. Emit OPERATOR "${result.tokenEmitted.raw}"`;
    }

    // Single-character operator
    result.tokenEmitted = this.emitToken('OPERATOR');
    return `'${this.getCharDisplay(char)}' ends operator. Emit OPERATOR "${result.tokenEmitted.raw}"`;
  }

  // Advance position, tracking line/column
  advanceChar(char) {
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
  }

  // Finish whatever token is being built
  finishCurrentToken() {
    switch (this.state) {
      case ScanState.IDENTIFIER:
        return this.emitToken('IDENTIFIER');
      case ScanState.NUMBER:
        return this.emitToken('NUMBER');
      case ScanState.STRING:
        return this.emitToken('STRING');
      case ScanState.WHITESPACE:
        const wsToken = this.emitToken('WHITESPACE');
        wsToken.value = '(whitespace)';
        return wsToken;
      case ScanState.COMMENT:
        return this.emitToken('COMMENT');
      case ScanState.OPERATOR:
        return this.emitToken('OPERATOR');
      default:
        return null;
    }
  }

  // Get displayable version of character
  getCharDisplay(char) {
    if (char === ' ') return 'space';
    if (char === '\t') return 'tab';
    if (char === '\n') return 'newline';
    if (char === '\r') return 'return';
    if (char === '\0') return 'end';
    return char;
  }

  // Get current scan position for highlighting
  getCurrentSpan() {
    return {
      start: this.tokenStartPos,
      end: this.pos,
      currentChar: this.pos > 0 ? this.pos - 1 : 0
    };
  }

  // Get all completed tokens
  getTokens() {
    return this.tokens;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Scanner, ScanState };
}
