// Tiny - Example Programs Manager
// Manages the example selector modal
// Example definitions are in src/examples/*.js

import { Modal } from './modal.js';

// Import all example modules
import { example as arithmetic } from './examples/arithmetic.js';
import { example as arrays } from './examples/arrays.js';
import { example as bouncingBall } from './examples/bouncing-ball.js';
import { example as breakout } from './examples/breakout.js';
import { example as calculator } from './examples/calculator.js';
import { example as comparisons } from './examples/comparisons.js';
import { example as computerGuesses } from './examples/computer-guesses.js';
import { example as controlFlow } from './examples/control-flow.js';
import { example as dice } from './examples/dice.js';
import { example as drawing } from './examples/drawing.js';
import { example as fibonacci } from './examples/fibonacci.js';
import { example as fizzbuzz } from './examples/fizzbuzz.js';
import { example as flappyBird } from './examples/flappy-bird.js';
import { example as functions } from './examples/functions.js';
import { example as gameOfLife } from './examples/game-of-life.js';
import { example as guessNumber } from './examples/guess-number.js';
import { example as mazeGenerator } from './examples/maze-generator.js';
import { example as mazeSolver } from './examples/maze-solver.js';
import { example as operators } from './examples/operators.js';
import { example as pong } from './examples/pong.js';
import { example as primes } from './examples/primes.js';
import { example as rps } from './examples/rps.js';
import { example as snake } from './examples/snake.js';
import { example as starfield } from './examples/starfield.js';
import { example as strings } from './examples/strings.js';
import { example as tetris } from './examples/tetris.js';
import { example as tokenizerDemo } from './examples/tokenizer-demo.js';
import { example as towersOfHanoi } from './examples/towers-of-hanoi.js';
import { example as variables } from './examples/variables.js';
import { example as classes } from './examples/classes.js';

// Aggregate all examples into a single object
const EXAMPLES = {
  'tokenizer-demo': tokenizerDemo,
  'variables': variables,
  'classes': classes,
  'arithmetic': arithmetic,
  'comparisons': comparisons,
  'control-flow': controlFlow,
  'strings': strings,
  'functions': functions,
  'arrays': arrays,
  'operators': operators,
  'fizzbuzz': fizzbuzz,
  'fibonacci': fibonacci,
  'primes': primes,
  'guess-number': guessNumber,
  'computer-guesses': computerGuesses,
  'calculator': calculator,
  'dice': dice,
  'rps': rps,
  'bouncing-ball': bouncingBall,
  'pong': pong,
  'snake': snake,
  'drawing': drawing,
  'starfield': starfield,
  'breakout': breakout,
  'flappy-bird': flappyBird,
  'tetris': tetris,
  'maze-generator': mazeGenerator,
  'maze-solver': mazeSolver,
  'game-of-life': gameOfLife,
  'towers-of-hanoi': towersOfHanoi
};

export class ExamplesManager extends Modal {
  constructor() {
    super();
    this.examples = EXAMPLES;
    this.onSelect = null;
  }

  // Get list of available examples
  getList() {
    return Object.entries(this.examples).map(([id, example]) => ({
      id,
      name: example.name,
      description: example.description
    }));
  }

  // Get example code by ID
  getCode(id) {
    const example = this.examples[id];
    return example ? example.code : null;
  }

  // Get the default/first example
  getDefault() {
    const firstKey = Object.keys(this.examples)[0];
    return this.examples[firstKey]?.code || '';
  }

  // Show example selector modal
  showSelector(onSelect) {
    this.onSelect = onSelect;
    this.open();
  }

  // Alias for backwards compatibility
  hideSelector() {
    this.close();
  }

  getTitle() {
    return 'Example Programs';
  }

  getBodyContent() {
    const examples = this.getList();
    return `
      <div class="examples-grid">
        ${examples.map(ex => `
          <button class="example-card" data-id="${ex.id}">
            <div class="example-name">${ex.name}</div>
            <div class="example-desc">${ex.description}</div>
          </button>
        `).join('')}
      </div>
    `;
  }

  onAfterRender() {
    // Add click handlers to example cards
    this.panel.querySelectorAll('.example-card').forEach(card => {
      card.onclick = () => {
        const id = card.dataset.id;
        const code = this.getCode(id);
        if (code && this.onSelect) {
          this.onSelect(code);
        }
        this.close();
      };
    });
  }
}
