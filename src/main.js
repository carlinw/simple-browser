// Tiny - Main Entry Point

import { STEP_DELAY_MS } from './constants.js';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { OutputRenderer } from './output-renderer.js';
import { MemoryRenderer } from './memory-renderer.js';

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
  const stepBtn = document.getElementById('step-btn');
  const debugBtn = document.getElementById('debug-btn');
  const runBtn = document.getElementById('run-btn');
  const stopBtn = document.getElementById('stop-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const loadBtn = document.getElementById('load-btn');
  const output = document.getElementById('output');
  const lineCount = document.getElementById('line-count');
  const interpreterPane = document.getElementById('interpreter-pane');
  const tabMemory = document.getElementById('tab-memory');

  // Update line count display
  function updateLineCount() {
    const code = codeEditor.value;
    const lines = code ? code.split('\n').length : 0;
    const label = lines === 1 ? 'line' : 'lines';
    lineCount.textContent = `${lines} ${label} of code`;
  }

  // Renderers
  const outputRenderer = new OutputRenderer(output);
  const memoryRenderer = new MemoryRenderer(tabMemory);

  // State
  let state = 'edit';  // 'edit' | 'stepping' | 'done' | 'running'
  let currentParseResult = null;  // Store parse result for execution
  let currentLexResult = null;    // Store lex result for error display
  let currentInterpreter = null;  // Store interpreter so we can stop it
  let stepResolve = null;         // Resolve function for step-by-step execution
  let pauseResolve = null;        // Resolve function for pause() statement

  // Show/hide interpreter pane
  function showInterpreterPane() {
    interpreterPane.classList.remove('interpreter-hidden');
  }

  function hideInterpreterPane() {
    interpreterPane.classList.add('interpreter-hidden');
  }

  // Update UI based on state
  function updateUI() {
    switch (state) {
      case 'edit':
        stepBtn.disabled = false;
        debugBtn.disabled = false;
        runBtn.disabled = false;
        stopBtn.disabled = true;
        loadBtn.disabled = false;
        codeEditor.disabled = false;
        codeEditor.classList.remove('hidden');
        codeDisplay.classList.add('hidden');
        break;

      case 'stepping':
        stepBtn.disabled = false;
        debugBtn.disabled = true;
        runBtn.disabled = true;
        stopBtn.disabled = false;
        loadBtn.disabled = true;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        break;

      case 'running':
        stepBtn.disabled = true;
        debugBtn.disabled = true;
        runBtn.disabled = true;
        stopBtn.disabled = false;
        loadBtn.disabled = true;
        codeEditor.disabled = true;
        break;

      case 'done':
        stepBtn.disabled = true;
        debugBtn.disabled = false;
        runBtn.disabled = false;
        stopBtn.disabled = false;
        loadBtn.disabled = false;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        break;
    }
  }

  // Parse source code, return success boolean
  function parse(source) {
    // Handle empty input
    if (!source.trim()) {
      memoryRenderer.clear();
      outputRenderer.renderMessage('Hello, Connor!');
      currentParseResult = null;
      currentLexResult = null;
      return false;
    }

    // Tokenize the source code
    const lex = new Lexer(source);
    currentLexResult = lex.tokenize();

    // Parse the tokens
    const parser = new Parser(currentLexResult.tokens);
    currentParseResult = parser.parse();

    // Expose AST for testing (used by parser.spec.js)
    window.__TEST_AST__ = currentParseResult.ast;

    // Clear memory for new parse
    memoryRenderer.showEmpty();

    // Show errors if any
    if (currentLexResult.errors.length > 0 || currentParseResult.errors.length > 0) {
      outputRenderer.renderErrors(currentLexResult.errors, currentParseResult.errors, []);
      return false;
    }

    outputRenderer.clear();
    return true;
  }

  // Shared execution logic for debug, run, and step modes
  async function executeCode(options = {}) {
    const { animated = false, showInterpreter = true, stepping = false } = options;
    const source = codeEditor.value;

    // Check for empty program before parsing
    if (!source.trim()) {
      outputRenderer.renderErrors([], [], [{ message: 'No program to run. Write some code first!' }]);
      return;
    }

    // Parse
    const success = parse(source);
    if (!success || !currentParseResult) return;

    const printedOutput = [];

    // Set state
    state = stepping ? 'stepping' : 'running';
    updateUI();

    // Show/hide interpreter pane based on mode
    if (showInterpreter) {
      showInterpreterPane();
    } else {
      hideInterpreterPane();
    }

    // Set up code display with line elements for highlighting
    codeDisplay.innerHTML = '';
    const lines = source.split('\n');
    lines.forEach((line, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line';
      lineEl.dataset.line = index + 1;  // 1-indexed
      lineEl.textContent = line || ' ';  // Empty lines need content for height
      codeDisplay.appendChild(lineEl);
    });
    codeEditor.classList.add('hidden');
    codeDisplay.classList.remove('hidden');
    outputRenderer.clear();

    // Helper to highlight a line
    function highlightLine(lineNumber) {
      // Remove previous highlight
      const prev = codeDisplay.querySelector('.line-executing');
      if (prev) prev.classList.remove('line-executing');
      // Add new highlight
      const lineEl = codeDisplay.querySelector(`[data-line="${lineNumber}"]`);
      if (lineEl) lineEl.classList.add('line-executing');
    }

    // Set global frame before execution
    if (showInterpreter) {
      memoryRenderer.setGlobalFrame();
    }

    currentInterpreter = new Interpreter({
      stepDelay: animated ? STEP_DELAY_MS : 0,
      stepping: stepping,
      onNodeEnter: (animated || stepping) ? (node) => {
        const line = node.line || node.token?.line;
        if (line) {
          highlightLine(line);
        }
      } : undefined,
      onStep: stepping ? () => {
        // Return a promise that resolves when user clicks Step
        return new Promise(resolve => {
          stepResolve = resolve;
        });
      } : undefined,
      onVariableChange: showInterpreter ? (name, value, action) => {
        memoryRenderer.updateFrame(currentInterpreter.environment);
        if (animated || stepping) {
          memoryRenderer.highlightVariable(name);
        }
      } : undefined,
      onPrint: (value) => {
        printedOutput.push(value);
        if (animated || stepping) {
          outputRenderer.renderOutput(printedOutput);
        }
        // In graphics mode, also print to the text area
        if (outputRenderer.hasCanvas()) {
          outputRenderer.printText(value);
        }
      },
      onCallStart: showInterpreter ? (funcName, args, env) => {
        memoryRenderer.pushFrame(funcName, args, env);
      } : undefined,
      onCallEnd: showInterpreter ? (funcName, result) => {
        memoryRenderer.popFrame();
      } : undefined,
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
      onPause: async () => {
        // Render any pending output before pausing
        outputRenderer.renderOutput(printedOutput);
        // Show resume button and wait for click
        resumeBtn.classList.remove('hidden');
        await new Promise(resolve => {
          pauseResolve = resolve;
        });
        resumeBtn.classList.add('hidden');
      },
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
      await currentInterpreter.interpret(currentParseResult.ast);

      // Render final output if not canvas
      if (!outputRenderer.canvas) {
        outputRenderer.renderOutput(printedOutput);
      }
    } catch (error) {
      // Don't show error if program was intentionally stopped
      if (error.message !== 'Program stopped') {
        // Render any output that was produced before the error
        outputRenderer.renderOutput(printedOutput);
        // Append the error message
        outputRenderer.appendError(error.message);
      }
    }

    // Update state when program completes
    if (state === 'running' || state === 'stepping') {
      state = 'done';
      stepResolve = null;
      currentInterpreter = null;
      updateUI();
      // Show interpreter pane if it was shown during execution
      if (showInterpreter) {
        showInterpreterPane();
      }
    }
  }

  // Debug - parse + execute with animation delay, shows interpreter pane
  async function debug() {
    await executeCode({ animated: true, showInterpreter: true });
  }

  // Run - parse + execute immediately, hides interpreter pane during execution
  async function run() {
    await executeCode({ animated: false, showInterpreter: false });
  }

  // Step - execute one statement at a time
  function step() {
    if (state === 'edit') {
      // Start stepping execution
      executeCode({ animated: false, showInterpreter: true, stepping: true });
    } else if (state === 'stepping' && stepResolve) {
      // Continue to next step
      stepResolve();
      stepResolve = null;
    }
  }

  // Reset - clear and return to edit mode (preserves canvas output)
  function reset() {
    // Stop any running interpreter
    if (currentInterpreter) {
      currentInterpreter.stop();
      currentInterpreter = null;
    }
    // Resolve any pending step
    if (stepResolve) {
      stepResolve();
      stepResolve = null;
    }
    // Resolve any pending pause
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
    // Hide resume button
    resumeBtn.classList.add('hidden');
    state = 'edit';
    currentParseResult = null;
    currentLexResult = null;
    memoryRenderer.clear();
    // Don't clear output or hide canvas - preserve what was drawn
    hideInterpreterPane();
    updateUI();
  }

  // Resume function - called when resume button is clicked
  function resume() {
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
  }

  // Check if a URL is same-origin
  function isSameOrigin(url) {
    try {
      const targetUrl = new URL(url);
      const currentUrl = new URL(window.location.href);
      return targetUrl.origin === currentUrl.origin;
    } catch (e) {
      return false;
    }
  }

  // Load - fetch a .tpl file from URL
  async function load() {
    const url = prompt('Enter URL to a .tpl file:');

    // User cancelled
    if (url === null) {
      return;
    }

    // Empty input
    if (!url.trim()) {
      outputRenderer.renderErrors([], [], [{ message: 'No URL provided.' }]);
      return;
    }

    // Validate .tpl extension
    if (!url.toLowerCase().endsWith('.tpl')) {
      outputRenderer.renderErrors([], [], [{ message: 'URL must end with .tpl' }]);
      return;
    }

    try {
      // Use proxy for cross-origin requests to bypass CORS
      const fetchUrl = isSameOrigin(url) ? url : `/fetch?url=${encodeURIComponent(url)}`;
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      codeEditor.value = content;
      updateLineCount();
      outputRenderer.clear();
      outputRenderer.renderMessage(`Loaded: ${url}`);
    } catch (error) {
      outputRenderer.renderErrors([], [], [{ message: `Failed to load: ${error.message}` }]);
    }
  }

  // Event listeners
  stepBtn.addEventListener('click', step);
  debugBtn.addEventListener('click', debug);
  runBtn.addEventListener('click', run);
  stopBtn.addEventListener('click', reset);
  resumeBtn.addEventListener('click', resume);
  loadBtn.addEventListener('click', load);
  codeEditor.addEventListener('input', updateLineCount);

  // Handle Tab key in code editor - insert spaces instead of changing focus
  codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = codeEditor.selectionStart;
      const end = codeEditor.selectionEnd;
      const spaces = '  '; // 2 spaces for indent
      codeEditor.value = codeEditor.value.substring(0, start) + spaces + codeEditor.value.substring(end);
      codeEditor.selectionStart = codeEditor.selectionEnd = start + spaces.length;
      updateLineCount();
    }
  });

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

  // Keyboard navigation for Memory panel
  const SCROLL_AMOUNT = 50;
  tabMemory.setAttribute('tabindex', '0');
  tabMemory.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
        tabMemory.scrollTop -= SCROLL_AMOUNT;
        e.preventDefault();
        break;
      case 'ArrowDown':
        tabMemory.scrollTop += SCROLL_AMOUNT;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        tabMemory.scrollLeft -= SCROLL_AMOUNT;
        e.preventDefault();
        break;
      case 'ArrowRight':
        tabMemory.scrollLeft += SCROLL_AMOUNT;
        e.preventDefault();
        break;
    }
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
