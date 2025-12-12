// Simple Interpreter - Shared Constants

// Canvas dimensions
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;

// Animation timing
const STEP_DELAY_MS = 5000;

// Safety limits
const MAX_LOOP_ITERATIONS = 10000;

// Color palette for graphics
const COLORS = {
  'black': '#000000',
  'white': '#ffffff',
  'red': '#ff0000',
  'green': '#00ff00',
  'blue': '#0000ff',
  'yellow': '#ffff00',
  'orange': '#ff8800',
  'purple': '#8800ff',
  'cyan': '#00ffff',
  'pink': '#ff88ff'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    STEP_DELAY_MS,
    MAX_LOOP_ITERATIONS,
    COLORS
  };
}
