// Tiny - Main Entry Point

import { STEP_DELAY_MS } from './constants.js';
import { Lexer } from './lexer.js';
import { Scanner } from './scanner.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { ASTRenderer } from './ast-renderer.js';
import { ParserRenderer } from './parser-renderer.js';
import { OutputRenderer } from './output-renderer.js';
import { MemoryRenderer } from './memory-renderer.js';
import { CodeVisualizer } from './visualizer.js';
import { ExamplesManager } from './examples.js';

// Keyboard state tracking for pressed() builtin
const keysPressed = new Set();

function normalizeKey(key) {
  // Map arrow keys and special keys to simple names
  const keyMap = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    ' ': 'space'
  };
  return keyMap[key] || key.toLowerCase();
}

document.addEventListener('keydown', (e) => {
  keysPressed.add(normalizeKey(e.key));
});

document.addEventListener('keyup', (e) => {
  keysPressed.delete(normalizeKey(e.key));
});

// ES modules are deferred by default, so DOM may already be ready
function init() {
  // DOM Elements
  const codeEditor = document.getElementById('code-editor');
  const codeDisplay = document.getElementById('code-display');
  const parseBtn = document.getElementById('parse-btn');
  const runBtn = document.getElementById('run-btn');
  const runFastBtn = document.getElementById('run-fast-btn');
  const stepBtn = document.getElementById('step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const exampleBtn = document.getElementById('example-btn');
  const output = document.getElementById('output');

  // Tab Elements - now in interpreter-pane
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabTokens = document.getElementById('tab-tokens');
  const tabAst = document.getElementById('tab-ast');
  const tabMemory = document.getElementById('tab-memory');

  // Tab switching
  function switchTab(tabName) {
    // Update buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Update panels
    tabTokens.classList.toggle('active', tabName === 'tokens');
    tabAst.classList.toggle('active', tabName === 'ast');
    tabMemory.classList.toggle('active', tabName === 'memory');
  }

  // Add click handlers to tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Renderers
  const parserRenderer = new ParserRenderer(tabTokens);
  const outputRenderer = new OutputRenderer(output);
  const astRenderer = new ASTRenderer(tabAst);
  const memoryRenderer = new MemoryRenderer(tabMemory);

  // Other Managers
  const visualizer = new CodeVisualizer(codeDisplay);
  const examplesManager = new ExamplesManager();

  // State
  let state = 'edit';  // 'edit' | 'stepping' | 'done' | 'running'
  let scanner = null;
  let lastScanResult = null;
  let currentParseResult = null;  // Store parse result for execution
  let currentLexResult = null;    // Store lex result for error display

  // Update UI based on state
  function updateUI() {
    switch (state) {
      case 'edit':
        parseBtn.disabled = false;
        runBtn.disabled = false;
        runFastBtn.disabled = false;
        stepBtn.disabled = false;
        resetBtn.disabled = true;
        codeEditor.disabled = false;
        codeEditor.classList.remove('hidden');
        codeDisplay.classList.add('hidden');
        break;

      case 'stepping':
        parseBtn.disabled = false;
        runBtn.disabled = false;
        runFastBtn.disabled = false;
        stepBtn.disabled = false;
        resetBtn.disabled = false;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        break;

      case 'running':
        parseBtn.disabled = true;
        runBtn.disabled = true;
        runFastBtn.disabled = true;
        stepBtn.disabled = true;
        resetBtn.disabled = false;
        codeEditor.disabled = true;
        break;

      case 'done':
        parseBtn.disabled = false;
        runBtn.disabled = false;
        runFastBtn.disabled = false;
        stepBtn.disabled = true;
        resetBtn.disabled = false;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        break;
    }
  }

  // Helper to get source code (handles stepping mode)
  function getSource() {
    if (state === 'stepping' || state === 'done') {
      return scanner ? scanner.source : codeEditor.value;
    }
    return codeEditor.value;
  }

  // Parse only - tokenize and parse, no execution
  function parseOnly() {
    // Reset state if needed
    if (state === 'stepping' || state === 'done') {
      state = 'edit';
      scanner = null;
      lastScanResult = null;
      visualizer.clear();
      visualizer.hide();
      codeEditor.classList.remove('hidden');
      codeDisplay.classList.add('hidden');
      codeEditor.disabled = false;
    }

    const source = getSource();

    // Handle empty input
    if (!source.trim()) {
      parserRenderer.clear();
      astRenderer.clear();
      memoryRenderer.clear();
      outputRenderer.renderMessage('Hello, Connor!');
      currentParseResult = null;
      currentLexResult = null;
      return false;
    }

    // Tokenize the source code
    const lex = new Lexer(source);
    currentLexResult = lex.tokenize();
    parserRenderer.renderTokens(currentLexResult.tokens, source);

    // Parse the tokens
    const parser = new Parser(currentLexResult.tokens);
    currentParseResult = parser.parse();
    astRenderer.render(currentParseResult.ast);

    // Clear memory for new parse
    memoryRenderer.showEmpty();

    // Show errors if any
    if (currentLexResult.errors.length > 0 || currentParseResult.errors.length > 0) {
      outputRenderer.renderErrors(currentLexResult.errors, currentParseResult.errors, []);
      switchTab('tokens');
      return false;
    }

    // No errors - switch to AST tab
    outputRenderer.clear();
    switchTab('ast');
    return true;
  }

  // Helper to get source span from an AST node's token references
  function getNodeSpan(node) {
    if (!node || !node.token) return null;
    const start = node.token.start;
    const end = node.endToken ? node.endToken.end : node.token.end;
    return { start, end };
  }

  // Shared execution logic - DRY refactor of runAnimated/runFast
  async function executeCode(options = {}) {
    const { animated = false } = options;
    const source = codeEditor.value;

    // Check for empty program before parsing
    if (!source.trim()) {
      outputRenderer.renderErrors([], [], [{ message: 'No program to run. Write some code first!' }]);
      return;
    }

    const success = parseOnly();
    if (!success || !currentParseResult) return;

    const printedOutput = [];

    if (animated) {
      state = 'running';
      updateUI();
      switchTab('ast');
      visualizer.setSource(source);
      visualizer.showInitial();
      codeEditor.classList.add('hidden');
      codeDisplay.classList.remove('hidden');
      outputRenderer.clear();
    }

    // Set global frame before execution
    memoryRenderer.setGlobalFrame();

    const interpreter = new Interpreter({
      stepDelay: animated ? STEP_DELAY_MS : 0,
      onNodeEnter: animated ? (node) => {
        astRenderer.highlightNode(node);
        const span = getNodeSpan(node);
        if (span) {
          visualizer.highlightExecuting(span);
        }
      } : undefined,
      onVariableChange: (name, value, action) => {
        memoryRenderer.updateFrame(interpreter.environment);
        if (animated) {
          memoryRenderer.highlightVariable(name);
        }
      },
      onPrint: (value) => {
        printedOutput.push(value);
        if (animated) {
          outputRenderer.renderOutput(printedOutput);
        }
        // In graphics mode, also print to the text area
        if (outputRenderer.hasCanvas()) {
          outputRenderer.printText(value);
        }
      },
      onCallStart: (funcName, args, env) => {
        memoryRenderer.pushFrame(funcName, args, env);
      },
      onCallEnd: (funcName, result) => {
        memoryRenderer.popFrame();
      },
      onInput: async () => {
        // Render current output before showing input field
        outputRenderer.renderOutput(printedOutput);
        const value = await outputRenderer.showInputField();
        // Add the input to printed output so it shows in final render
        printedOutput.push(value);
        return value;
      },
      onKey: async () => {
        // Only render text output if not in graphics mode
        if (!outputRenderer.hasCanvas()) {
          outputRenderer.renderOutput(printedOutput);
        }
        const value = await outputRenderer.waitForKeypress();
        // Add the key to printed output so it shows in final render
        printedOutput.push(value);
        return value;
      },
      isKeyPressed: (key) => keysPressed.has(key),
      onClear: () => outputRenderer.clearCanvas(),
      onColor: (hex) => outputRenderer.setColor(hex),
      onRect: (x, y, w, h) => outputRenderer.drawRect(x, y, w, h),
      onCircle: (x, y, r) => outputRenderer.drawCircle(x, y, r),
      onLine: (x1, y1, x2, y2) => outputRenderer.drawLine(x1, y1, x2, y2),
      onText: (x, y, str) => outputRenderer.drawText(x, y, str),
      onTriangle: (x1, y1, x2, y2, x3, y3) => outputRenderer.drawTriangle(x1, y1, x2, y2, x3, y3),
      onFill: () => outputRenderer.setFillMode(),
      onStroke: () => outputRenderer.setStrokeMode(),
      onFullscreen: () => outputRenderer.enterFullscreen(),
      getCanvasWidth: () => outputRenderer.getWidth(),
      getCanvasHeight: () => outputRenderer.getHeight()
    });

    try {
      await interpreter.interpret(currentParseResult.ast);
      if (animated) {
        astRenderer.clearHighlights();
        visualizer.clearExecutingHighlight();
      } else {
        // Don't overwrite canvas with text output if graphics were used
        if (!outputRenderer.canvas) {
          outputRenderer.renderOutput(printedOutput);
        }
        visualizer.setSource(source);
        visualizer.showInitial();
      }
    } catch (error) {
      if (animated) {
        astRenderer.clearHighlights();
        visualizer.clearExecutingHighlight();
      }
      outputRenderer.renderErrors([], [], [{ message: error.message }]);
    }

    state = 'done';
    updateUI();
  }

  // Run animated - parse + execute with 5 second delay per node
  async function runAnimated() {
    await executeCode({ animated: true });
  }

  // Run fast - parse + execute immediately
  async function runFast() {
    await executeCode({ animated: false });
  }

  // Step - scan one character at a time
  function stepOne() {
    if (state === 'edit') {
      // Initialize stepping
      const source = codeEditor.value;
      if (!source.trim()) {
        parserRenderer.clear();
        astRenderer.clear();
        memoryRenderer.clear();
        outputRenderer.renderMessage('Hello, Connor!');
        return;
      }

      state = 'stepping';
      scanner = new Scanner(source);
      lastScanResult = null;
      visualizer.setSource(source);
      visualizer.showInitial(); // Show source before any scanning
      updateUI();

      // Show initial state
      parserRenderer.renderScanState(null, [], switchTab);
      return;
    }

    // Step one character
    const result = scanner.stepCharacter();
    lastScanResult = result;

    // Update visualization - highlight current position and buffer
    const span = scanner.getCurrentSpan();
    visualizer.highlightChar(span.currentChar, span.start, span.end);

    // Render scan state and tokens
    parserRenderer.renderScanState(result, scanner.getTokens(), switchTab);

    // Check if done
    if (result.done) {
      state = 'done';
      updateUI();
    }
  }

  // Reset - clear and return to edit mode
  function reset() {
    state = 'edit';
    scanner = null;
    lastScanResult = null;
    currentParseResult = null;
    currentLexResult = null;
    parserRenderer.clear();
    astRenderer.clear();
    memoryRenderer.clear();
    outputRenderer.clear();
    outputRenderer.hideCanvas();
    visualizer.clear();
    visualizer.hide();
    astRenderer.clearHighlights();
    updateUI();
  }

  // Show example selector
  function showExamples() {
    examplesManager.showSelector((code) => {
      codeEditor.value = code;
      reset();
    });
  }

  // Event listeners
  parseBtn.addEventListener('click', parseOnly);
  runBtn.addEventListener('click', runAnimated);
  runFastBtn.addEventListener('click', runFast);
  stepBtn.addEventListener('click', stepOne);
  resetBtn.addEventListener('click', reset);
  exampleBtn.addEventListener('click', showExamples);

  // Language Help toggle
  const helpTabBtn = document.getElementById('help-tab-btn');
  const codeTabBtns = document.querySelectorAll('.code-tab-btn');

  function showHelp() {
    document.body.classList.add('help-active');
    codeTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.codeTab === 'help');
    });
  }

  function hideHelp() {
    document.body.classList.remove('help-active');
    codeTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.codeTab === 'code');
    });
  }

  codeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.codeTab === 'help') {
        showHelp();
      } else {
        hideHelp();
      }
    });
  });

  // Listen for messages from iframe (back button)
  window.addEventListener('message', (e) => {
    if (e.data === 'hideHelp') {
      hideHelp();
    }
  });

  // Keyboard navigation for AST/Memory panels
  const SCROLL_AMOUNT = 50;
  [tabAst, tabMemory].forEach(panel => {
    panel.setAttribute('tabindex', '0');
    panel.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          panel.scrollTop -= SCROLL_AMOUNT;
          e.preventDefault();
          break;
        case 'ArrowDown':
          panel.scrollTop += SCROLL_AMOUNT;
          e.preventDefault();
          break;
        case 'ArrowLeft':
          panel.scrollLeft -= SCROLL_AMOUNT;
          e.preventDefault();
          break;
        case 'ArrowRight':
          panel.scrollLeft += SCROLL_AMOUNT;
          e.preventDefault();
          break;
      }
    });
  });

  // Initialize UI
  updateUI();
}

// ES modules execute after DOM is parsed, but call init to be safe
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
