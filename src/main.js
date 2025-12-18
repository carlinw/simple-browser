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
  const lineNumbers = document.getElementById('line-numbers');
  const codeDisplayLineNumbers = document.getElementById('code-display-line-numbers');
  const runBtn = document.getElementById('run-btn');
  const stopBtn = document.getElementById('stop-btn');
  const loadBtn = document.getElementById('load-btn');
  const stepIntoBtn = document.getElementById('step-into-btn');
  const stepOverBtn = document.getElementById('step-over-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const output = document.getElementById('output');
  const lineCount = document.getElementById('line-count');
  const codePaneEl = document.getElementById('code-pane');
  const debugPanel = document.getElementById('debug-panel');
  const debugStackFrames = document.getElementById('debug-stack-frames');

  // Update line count display and line numbers
  function updateLineCount() {
    const code = codeEditor.value;
    const lines = code ? code.split('\n').length : 0;
    const label = lines === 1 ? 'line' : 'lines';
    lineCount.textContent = `${lines} ${label} of code`;

    // Update line numbers gutter
    updateLineNumbers(lineNumbers, lines);
  }

  // Generate line numbers HTML
  function updateLineNumbers(container, numLines) {
    const html = [];
    for (let i = 1; i <= Math.max(1, numLines); i++) {
      html.push(`<div>${i}</div>`);
    }
    container.innerHTML = html.join('');
  }

  // Sync scroll between editor and line numbers
  function syncScroll() {
    lineNumbers.scrollTop = codeEditor.scrollTop;
  }

  // Renderers
  const outputRenderer = new OutputRenderer(output);
  const memoryRenderer = new MemoryRenderer(debugStackFrames);

  // State
  let state = 'edit';  // 'edit' | 'stepping' | 'done' | 'running'
  let currentParseResult = null;  // Store parse result for execution
  let currentLexResult = null;    // Store lex result for error display
  let currentInterpreter = null;  // Store interpreter so we can stop it
  let stepResolve = null;         // Resolve function for step-by-step execution
  let pauseResolve = null;        // Resolve function for pause() statement
  let debugStepResolve = null;    // Resolve function for debug stepping (Step Into/Over)
  let debugMode = false;          // Whether we're in debug mode (paused)

  // Enter debug mode - show stack frames and step buttons
  function enterDebugMode() {
    debugMode = true;
    codePaneEl.classList.add('debug-mode');
    debugPanel.classList.remove('hidden');
    stepIntoBtn.classList.remove('hidden');
    stepOverBtn.classList.remove('hidden');
    resumeBtn.classList.remove('hidden');
    // Render current stack frames
    memoryRenderer.render();
  }

  // Exit debug mode - hide stack frames and step buttons
  function exitDebugMode() {
    debugMode = false;
    codePaneEl.classList.remove('debug-mode');
    debugPanel.classList.add('hidden');
    stepIntoBtn.classList.add('hidden');
    stepOverBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
  }

  // Update UI based on state
  function updateUI() {
    switch (state) {
      case 'edit':
        runBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.add('hidden');
        loadBtn.disabled = false;
        codeEditor.disabled = false;
        codeEditor.classList.remove('hidden');
        lineNumbers.classList.remove('hidden');
        codeDisplay.classList.add('hidden');
        codeDisplayLineNumbers.classList.add('hidden');
        exitDebugMode();
        break;

      case 'running':
        runBtn.disabled = true;
        stopBtn.disabled = false;
        stopBtn.classList.remove('hidden');
        loadBtn.disabled = true;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        lineNumbers.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        codeDisplayLineNumbers.classList.remove('hidden');
        break;

      case 'done':
        runBtn.disabled = false;
        stopBtn.disabled = false;
        stopBtn.classList.remove('hidden');
        loadBtn.disabled = false;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        lineNumbers.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        codeDisplayLineNumbers.classList.remove('hidden');
        exitDebugMode();
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

  // Shared execution logic for run mode
  async function executeCode() {
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
    state = 'running';
    updateUI();

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

    // Update line numbers for code display
    updateLineNumbers(codeDisplayLineNumbers, lines.length);

    // Switch from editor to display
    codeEditor.classList.add('hidden');
    lineNumbers.classList.add('hidden');
    codeDisplay.classList.remove('hidden');
    codeDisplayLineNumbers.classList.remove('hidden');
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

    // Set global frame before execution (for debug mode when pause is called)
    memoryRenderer.setGlobalFrame();

    currentInterpreter = new Interpreter({
      stepDelay: 0,
      stepping: false,
      onNodeEnter: (node) => {
        // Highlight current line when in debug mode
        if (debugMode) {
          const line = node.line || node.token?.line;
          if (line) {
            highlightLine(line);
          }
        }
      },
      onVariableChange: (name, value, action) => {
        // Track variables for debug mode
        memoryRenderer.updateFrame(currentInterpreter.environment);
        if (debugMode) {
          memoryRenderer.highlightVariable(name);
        }
      },
      onPrint: (value) => {
        printedOutput.push(value);
        // In graphics mode, also print to the text area
        if (outputRenderer.hasCanvas()) {
          outputRenderer.printText(value);
        }
      },
      onCallStart: (funcName, args, env, callLine) => {
        memoryRenderer.pushFrame(funcName, args, env, callLine);
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
      onPause: async () => {
        // Render any pending output before pausing
        outputRenderer.renderOutput(printedOutput);
        // Enter debug mode - show stack frames and step buttons
        enterDebugMode();
        // Highlight current line
        const line = currentInterpreter.currentLine;
        if (line) highlightLine(line);
        // Wait for user to click Step Into, Step Over, or Resume
        await new Promise(resolve => {
          pauseResolve = resolve;
        });
      },
      onDebugStep: async () => {
        // Render any pending output
        outputRenderer.renderOutput(printedOutput);
        // Enter debug mode - show stack frames and step buttons
        enterDebugMode();
        // Highlight current line
        const line = currentInterpreter.currentLine;
        if (line) highlightLine(line);
        // Wait for user to click Step Into, Step Over, or Resume
        await new Promise(resolve => {
          debugStepResolve = resolve;
        });
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
    if (state === 'running') {
      state = 'done';
      currentInterpreter = null;
      updateUI();
    }
  }

  // Run - parse + execute immediately
  async function run() {
    await executeCode();
  }

  // Step Into - advance one statement, entering function calls
  function stepInto() {
    if (currentInterpreter) {
      currentInterpreter.debugStepping = true;
      currentInterpreter.stepMode = 'into';
    }
    // Resolve pause() or debug step promise
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
    if (debugStepResolve) {
      debugStepResolve();
      debugStepResolve = null;
    }
  }

  // Step Over - advance one statement, executing functions without entering
  function stepOver() {
    if (currentInterpreter) {
      currentInterpreter.debugStepping = true;
      currentInterpreter.stepMode = 'over';
      currentInterpreter.stepOverDepth = currentInterpreter.callDepth;
    }
    // Resolve pause() or debug step promise
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
    if (debugStepResolve) {
      debugStepResolve();
      debugStepResolve = null;
    }
  }

  // Reset - clear and return to edit mode (preserves canvas output)
  function reset() {
    // Stop any running interpreter
    if (currentInterpreter) {
      currentInterpreter.stop();
      currentInterpreter = null;
    }
    // Resolve any pending pause or debug step
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
    if (debugStepResolve) {
      debugStepResolve();
      debugStepResolve = null;
    }
    // Exit debug mode
    exitDebugMode();
    state = 'edit';
    currentParseResult = null;
    currentLexResult = null;
    memoryRenderer.clear();
    // Don't clear output or hide canvas - preserve what was drawn
    updateUI();
  }

  // Resume function - called when resume button is clicked
  function resume() {
    // Disable debug stepping - run until next pause() or end
    if (currentInterpreter) {
      currentInterpreter.debugStepping = false;
    }
    exitDebugMode();
    // Resolve pause() or debug step promise
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
    if (debugStepResolve) {
      debugStepResolve();
      debugStepResolve = null;
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
  runBtn.addEventListener('click', run);
  stopBtn.addEventListener('click', reset);
  loadBtn.addEventListener('click', load);
  stepIntoBtn.addEventListener('click', stepInto);
  stepOverBtn.addEventListener('click', stepOver);
  resumeBtn.addEventListener('click', resume);
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

  // Sync scroll between editor and line numbers
  codeEditor.addEventListener('scroll', syncScroll);

  // Initialize line numbers and UI
  updateLineCount();
  updateUI();
}

// ES modules execute after DOM is parsed, but call init to be safe
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
