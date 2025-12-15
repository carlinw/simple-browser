// Tiny - Shared Constants

// Canvas dimensions
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 300;

// Animation timing
export const STEP_DELAY_MS = 5000;

// Safety limits
export const MAX_LOOP_ITERATIONS = 10000;

// Node type IDs for fast dispatch (instead of string comparison)
export const NodeType = {
  // Statements (0-19)
  Program: 0,
  LetStatement: 1,
  AssignStatement: 2,
  IfStatement: 3,
  WhileStatement: 4,
  Block: 5,
  FunctionDeclaration: 6,
  ReturnStatement: 7,
  ExpressionStatement: 8,
  IndexAssignStatement: 9,
  ClassDeclaration: 10,
  MemberAssignStatement: 11,

  // Expressions (20+)
  NumberLiteral: 20,
  StringLiteral: 21,
  BooleanLiteral: 22,
  Identifier: 23,
  BinaryExpression: 24,
  UnaryExpression: 25,
  CallExpression: 26,
  ArrayLiteral: 27,
  IndexExpression: 28,
  ThisExpression: 29,
  NewExpression: 30,
  MemberExpression: 31,
  MethodCall: 32,
  BuiltinCall: 33,
};

// Color palette for graphics (organized by hue)
export const COLORS = {
  // Neutrals
  'white': '#ffffff',
  'lightgray': '#d3d3d3',
  'gray': '#888888',
  'darkgray': '#444444',
  'black': '#000000',

  // Reds
  'red': '#ff0000',
  'crimson': '#dc143c',
  'salmon': '#fa8072',
  'coral': '#ff7f50',

  // Oranges/Browns
  'orange': '#ff8800',
  'brown': '#8b4513',

  // Yellows
  'yellow': '#ffff00',
  'beige': '#f5f5dc',
  'ivory': '#fffff0',

  // Greens
  'lime': '#00ff00',
  'green': '#228b22',
  'forestgreen': '#228b22',
  'seagreen': '#2e8b57',

  // Cyans
  'cyan': '#00ffff',
  'turquoise': '#40e0d0',
  'skyblue': '#87ceeb',

  // Blues
  'blue': '#0000ff',
  'steelblue': '#4682b4',
  'navy': '#000080',
  'indigo': '#4b0082',

  // Purples/Pinks
  'purple': '#8800ff',
  'violet': '#ee82ee',
  'magenta': '#ff00ff',
  'pink': '#ff88ff',
  'hotpink': '#ff69b4',
  'lavender': '#e6e6fa',
  'plum': '#dda0dd',
  'orchid': '#da70d6'
};
