// Tiny - Lexer
// Converts source code into tokens

import { isDigit, isAlpha, isAlphaNumeric } from './utils.js';

export const TokenType = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  COMMENT: 'COMMENT',       // For visualization - shows comment being skipped
  WHITESPACE: 'WHITESPACE', // For visualization - shows whitespace being skipped
  EOF: 'EOF'
};

export const KEYWORDS = new Set([
  'let', 'if', 'else', 'while', 'function',
  'return', 'true', 'false', 'stop',
  'and', 'or', 'not', 'equals',
  'class', 'new', 'this'
]);

const OPERATORS = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '%': '%',
  '=': '=',
  '<': '<',
  '>': '>',
  '<=': '<=',
  '>=': '>=',
};

const PUNCTUATION = new Set(['(', ')', '{', '}', ',', '[', ']', '.']);

export class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];

    // For step-through mode: track current token span
    this.tokenStart = 0;
    this.tokenLine = 1;
    this.tokenColumn = 1;
    this.lastToken = null;
  }

  // Main entry point - tokenize all at once
  tokenize() {
    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
        if (token.type === TokenType.EOF) break;
      }
    }

    // Ensure EOF token
    if (this.tokens.length === 0 || this.tokens[this.tokens.length - 1].type !== TokenType.EOF) {
      this.tokens.push(this.makeToken(TokenType.EOF, null, ''));
    }

    return {
      tokens: this.tokens,
      errors: this.errors
    };
  }

  // Step-through mode: get next token (includes whitespace and comments for visualization)
  nextToken() {
    if (this.isAtEnd()) {
      this.tokenStart = this.pos;
      this.tokenLine = this.line;
      this.tokenColumn = this.column;
      this.lastToken = this.makeToken(TokenType.EOF, null, '');
      return this.lastToken;
    }

    // Mark start of token
    this.tokenStart = this.pos;
    this.tokenLine = this.line;
    this.tokenColumn = this.column;

    const char = this.peek();

    // Whitespace - return as token for visualization
    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      return this.readWhitespace();
    }

    // Comment - return as token for visualization
    if (char === '/' && this.peekNext() === '/') {
      return this.readComment();
    }
    let token = null;

    // Numbers
    if (isDigit(char)) {
      token = this.readNumber();
    }
    // Strings
    else if (char === '"') {
      token = this.readString();
    }
    // Identifiers and keywords
    else if (isAlpha(char)) {
      token = this.readIdentifierOrKeyword();
    }
    // Operators (check two-character operators first)
    else if (this.isTwoCharOperatorStart(char)) {
      const twoChar = char + this.peekNext();
      if (OPERATORS[twoChar]) {
        this.advance();
        this.advance();
        token = {
          type: TokenType.OPERATOR,
          value: twoChar,
          line: this.tokenLine,
          column: this.tokenColumn,
          raw: twoChar,
          start: this.tokenStart,
          end: this.pos
        };
      } else if (OPERATORS[char]) {
        this.advance();
        token = {
          type: TokenType.OPERATOR,
          value: char,
          line: this.tokenLine,
          column: this.tokenColumn,
          raw: char,
          start: this.tokenStart,
          end: this.pos
        };
      }
    }
    // Single-character operators
    else if (OPERATORS[char]) {
      this.advance();
      token = {
        type: TokenType.OPERATOR,
        value: char,
        line: this.tokenLine,
        column: this.tokenColumn,
        raw: char,
        start: this.tokenStart,
        end: this.pos
      };
    }
    // Punctuation
    else if (PUNCTUATION.has(char)) {
      this.advance();
      token = {
        type: TokenType.PUNCTUATION,
        value: char,
        line: this.tokenLine,
        column: this.tokenColumn,
        raw: char,
        start: this.tokenStart,
        end: this.pos
      };
    }
    // Invalid character - skip it and return null (caller will try again)
    else {
      this.errors.push({
        message: `Invalid character '${char}'`,
        line: this.line,
        column: this.column
      });
      this.advance();
      return null;
    }

    this.lastToken = token;
    return token;
  }

  // Get the source span of the last token (for highlighting)
  getTokenSpan() {
    return {
      start: this.tokenStart,
      end: this.pos,
      line: this.tokenLine,
      column: this.tokenColumn
    };
  }

  readNumber() {
    let raw = '';

    // Read integer part
    while (!this.isAtEnd() && isDigit(this.peek())) {
      raw += this.advance();
    }

    // Check for decimal part
    if (!this.isAtEnd() && this.peek() === '.' && isDigit(this.peekNext())) {
      raw += this.advance(); // consume '.'
      while (!this.isAtEnd() && isDigit(this.peek())) {
        raw += this.advance();
      }
    }

    return {
      type: TokenType.NUMBER,
      value: parseFloat(raw),
      line: this.tokenLine,
      column: this.tokenColumn,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
  }

  // Peek at the character after current (for lookahead)
  peekNext() {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source[this.pos + 1];
  }

  readString() {
    this.advance(); // consume opening quote

    let value = '';
    let raw = '"';

    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        // Strings can't span multiple lines (for now)
        this.errors.push({
          message: 'Unterminated string',
          line: this.tokenLine,
          column: this.tokenColumn
        });
        return null;
      }
      const char = this.advance();
      value += char;
      raw += char;
    }

    if (this.isAtEnd()) {
      this.errors.push({
        message: 'Unterminated string',
        line: this.tokenLine,
        column: this.tokenColumn
      });
      return null;
    }

    this.advance(); // consume closing quote
    raw += '"';

    return {
      type: TokenType.STRING,
      value: value,
      line: this.tokenLine,
      column: this.tokenColumn,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
  }

  readIdentifierOrKeyword() {
    let raw = '';

    while (!this.isAtEnd() && isAlphaNumeric(this.peek())) {
      raw += this.advance();
    }

    const type = KEYWORDS.has(raw) ? TokenType.KEYWORD : TokenType.IDENTIFIER;

    return {
      type: type,
      value: raw,
      line: this.tokenLine,
      column: this.tokenColumn,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
  }

  readWhitespace() {
    let raw = '';

    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        raw += this.advance();
      } else if (char === '\n') {
        raw += this.advance();
        this.line++;
        this.column = 1;
      } else {
        break;
      }
    }

    const token = {
      type: TokenType.WHITESPACE,
      value: '(whitespace)',
      line: this.tokenLine,
      column: this.tokenColumn,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
    this.lastToken = token;
    return token;
  }

  readComment() {
    let raw = '';

    // Read until end of line
    while (!this.isAtEnd() && this.peek() !== '\n') {
      raw += this.advance();
    }

    const token = {
      type: TokenType.COMMENT,
      value: raw,
      line: this.tokenLine,
      column: this.tokenColumn,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
    this.lastToken = token;
    return token;
  }

  // Used by tokenize() for non-step mode - skips whitespace and comments silently
  skipWhitespaceAndComments() {
    while (!this.isAtEnd()) {
      const char = this.peek();

      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else if (char === '\n') {
        this.advance();
        this.line++;
        this.column = 1;
      } else if (char === '/' && this.peekNext() === '/') {
        // Comment - skip to end of line
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance();
        }
      } else {
        break;
      }
    }
  }

  // Helper methods
  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source[this.pos];
  }

  peekNext() {
    if (this.pos + 1 >= this.source.length) return '\0';
    return this.source[this.pos + 1];
  }

  advance() {
    const char = this.source[this.pos];
    this.pos++;
    this.column++;
    return char;
  }

  isAtEnd() {
    return this.pos >= this.source.length;
  }

  isTwoCharOperatorStart(char) {
    return char === '<' || char === '>';
  }

  makeToken(type, value, raw) {
    return {
      type: type,
      value: value,
      line: this.line,
      column: this.column,
      raw: raw,
      start: this.tokenStart,
      end: this.pos
    };
  }
}

