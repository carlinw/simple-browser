// Simple Interpreter - Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const codeEditor = document.getElementById('code-editor');
  const codeDisplay = document.getElementById('code-display');
  const output = document.getElementById('output');
  const parseBtn = document.getElementById('parse-btn');
  const runBtn = document.getElementById('run-btn');
  const runFastBtn = document.getElementById('run-fast-btn');
  const stepBtn = document.getElementById('step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const helpBtn = document.getElementById('help-btn');
  const exampleBtn = document.getElementById('example-btn');

  // Tab Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabTokens = document.getElementById('tab-tokens');
  const tabAst = document.getElementById('tab-ast');
  const tabOutput = document.getElementById('tab-output');

  // Tab switching
  function switchTab(tabName) {
    // Update buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    // Update panels
    tabTokens.classList.toggle('active', tabName === 'tokens');
    tabAst.classList.toggle('active', tabName === 'ast');
    tabOutput.classList.toggle('active', tabName === 'output');
  }

  // Add click handlers to tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Managers
  const visualizer = new CodeVisualizer(codeDisplay);
  const referencePanel = new ReferencePanel();
  const examplesManager = new ExamplesManager();
  const astRenderer = new ASTRenderer(tabAst);

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

  // Render scanning state and tokens to output
  function renderScanState(scanResult, tokens) {
    let html = '';

    // Show current scanning info
    html += '<div class="scan-section">\n';
    html += '<div class="scan-header">Scanner State:</div>\n';

    if (scanResult) {
      // Current position
      html += `<div class="scan-line"><span class="scan-label">Line:</span> ${scanResult.line}</div>\n`;
      html += `<div class="scan-line"><span class="scan-label">Column:</span> ${scanResult.column}</div>\n`;
      html += `<div class="scan-line"><span class="scan-label">Character:</span> '${scanResult.charDisplay}'</div>\n`;

      // Current state
      const stateDisplay = scanResult.newState || scanResult.state;
      if (stateDisplay && stateDisplay !== 'IDLE') {
        html += `<div class="scan-line"><span class="scan-label">Building:</span> ${stateDisplay}</div>\n`;
      }

      // Buffer
      if (scanResult.newBuffer || scanResult.buffer) {
        const buf = scanResult.newBuffer || scanResult.buffer;
        if (buf) {
          const displayBuf = buf.replace(/\n/g, '\\n').replace(/ /g, '·');
          html += `<div class="scan-line"><span class="scan-label">Buffer:</span> "${displayBuf}"</div>\n`;
        }
      }

      // Action taken
      html += `<div class="scan-action">${scanResult.action}</div>\n`;
    }

    html += '</div>\n';

    // Show tokens
    html += '<div class="tokens-section">\n';
    html += '<div class="tokens-header">Tokens:</div>\n';

    if (tokens.length === 0) {
      html += '<div class="token-line token-empty">(none yet)</div>\n';
    } else {
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isNew = scanResult && scanResult.tokenEmitted === token;
        const arrow = isNew ? '→ ' : '  ';

        // Determine CSS class based on token type
        let tokenClass = '';
        if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
          tokenClass = 'token-skipped';
        } else if (token.type === 'EOF') {
          tokenClass = 'token-eof';
        }
        if (isNew) {
          tokenClass += ' token-new';
        }

        const pos = `${token.line}:${token.column}`.padEnd(6);
        const type = token.type.padEnd(12);

        let displayValue;
        if (token.type === 'EOF') {
          displayValue = '';
        } else if (token.type === 'WHITESPACE') {
          displayValue = '(skipped)';
        } else if (token.type === 'COMMENT') {
          displayValue = token.raw;
        } else {
          displayValue = typeof token.value === 'string' ? token.value : String(token.value);
        }

        html += `<div class="token-line ${tokenClass}">${arrow}${pos} ${type} ${displayValue}</div>`;
      }
    }

    html += '</div>\n';

    tabTokens.innerHTML = html;
    switchTab('tokens');
  }

  // Helper to get source code (handles stepping mode)
  function getSource() {
    if (state === 'stepping' || state === 'done') {
      return scanner ? scanner.source : codeEditor.value;
    }
    return codeEditor.value;
  }

  // Helper to render tokens
  function renderTokens(tokens) {
    let tokensText = '';
    for (const token of tokens) {
      if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
        continue;
      }
      if (token.type === 'EOF') {
        tokensText += `${token.line}:${token.column}   EOF\n`;
      } else {
        const pos = `${token.line}:${token.column}`.padEnd(6);
        const type = token.type.padEnd(12);
        const value = typeof token.value === 'string' ? token.value : String(token.value);
        tokensText += `${pos} ${type} ${value}\n`;
      }
    }
    tabTokens.textContent = tokensText;
  }

  // Helper to render errors
  function renderErrors(lexErrors, parseErrors, runtimeErrors) {
    let outputText = '';
    if (lexErrors.length > 0) {
      outputText += 'Lexer Errors:\n';
      for (const error of lexErrors) {
        outputText += `  Line ${error.line}, Column ${error.column}: ${error.message}\n`;
      }
      outputText += '\n';
    }
    if (parseErrors.length > 0) {
      outputText += 'Parser Errors:\n';
      for (const error of parseErrors) {
        outputText += `  Line ${error.line}, Column ${error.column}: ${error.message}\n`;
      }
      outputText += '\n';
    }
    if (runtimeErrors.length > 0) {
      outputText += 'Runtime Errors:\n';
      for (const error of runtimeErrors) {
        outputText += `  ${error.message}\n`;
      }
      outputText += '\n';
    }
    tabOutput.textContent = outputText;
  }

  // Helper to render output values
  function renderOutput(values) {
    if (values.length === 0) {
      tabOutput.textContent = '(no output)';
    } else {
      tabOutput.textContent = values.map(v => String(v)).join('\n');
    }
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
      tabTokens.textContent = '';
      tabAst.innerHTML = '';
      tabOutput.textContent = 'Hello, Connor!';
      switchTab('output');
      currentParseResult = null;
      currentLexResult = null;
      return false;
    }

    // Tokenize the source code
    const lex = new Lexer(source);
    currentLexResult = lex.tokenize();
    renderTokens(currentLexResult.tokens);

    // Parse the tokens
    const parser = new Parser(currentLexResult.tokens);
    currentParseResult = parser.parse();
    astRenderer.render(currentParseResult.ast);

    // Show errors if any
    if (currentLexResult.errors.length > 0 || currentParseResult.errors.length > 0) {
      renderErrors(currentLexResult.errors, currentParseResult.errors, []);
      switchTab('output');
      return false;
    }

    // No errors - switch to AST tab
    tabOutput.textContent = '';
    switchTab('ast');
    return true;
  }

  // Run animated - parse + execute with 5 second delay per node
  async function runAnimated() {
    const success = parseOnly();
    if (!success || !currentParseResult) return;

    state = 'running';
    updateUI();
    switchTab('ast');

    const interpreter = new Interpreter({
      stepDelay: 5000,  // 5 seconds per node
      onNodeEnter: (node) => astRenderer.highlightNode(node),
      onNodeExit: (node, result) => { /* Could show result on node */ }
    });

    try {
      const result = await interpreter.interpret(currentParseResult.ast);
      astRenderer.clearHighlights();
      renderOutput(result.output);
      switchTab('output');
    } catch (error) {
      astRenderer.clearHighlights();
      renderErrors([], [], [{ message: error.message }]);
      switchTab('output');
    }

    state = 'edit';
    updateUI();
  }

  // Run fast - parse + execute immediately
  async function runFast() {
    const success = parseOnly();
    if (!success || !currentParseResult) return;

    const interpreter = new Interpreter({ stepDelay: 0 });

    try {
      const result = await interpreter.interpret(currentParseResult.ast);
      renderOutput(result.output);
      switchTab('output');
    } catch (error) {
      renderErrors([], [], [{ message: error.message }]);
      switchTab('output');
    }
  }

  // Step - scan one character at a time
  function stepOne() {
    if (state === 'edit') {
      // Initialize stepping
      const source = codeEditor.value;
      if (!source.trim()) {
        tabTokens.textContent = '';
        tabAst.innerHTML = '';
        tabOutput.textContent = 'Hello, Connor!';
        switchTab('output');
        return;
      }

      state = 'stepping';
      scanner = new Scanner(source);
      lastScanResult = null;
      visualizer.setSource(source);
      visualizer.showInitial(); // Show source before any scanning
      updateUI();

      // Show initial state
      renderScanState(null, []);
      return;
    }

    // Step one character
    const result = scanner.stepCharacter();
    lastScanResult = result;

    // Update visualization - highlight current position and buffer
    const span = scanner.getCurrentSpan();
    visualizer.highlightChar(span.currentChar, span.start, span.end);

    // Render scan state and tokens
    renderScanState(result, scanner.getTokens());

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
    tabTokens.textContent = '';
    tabAst.innerHTML = '';
    tabOutput.textContent = '';
    visualizer.clear();
    visualizer.hide();
    astRenderer.clearHighlights();
    updateUI();
  }

  // Load example program
  function loadExample() {
    const code = examplesManager.getDefault();
    codeEditor.value = code;
    reset();
  }

  // Event listeners
  parseBtn.addEventListener('click', parseOnly);
  runBtn.addEventListener('click', runAnimated);
  runFastBtn.addEventListener('click', runFast);
  stepBtn.addEventListener('click', stepOne);
  resetBtn.addEventListener('click', reset);
  helpBtn.addEventListener('click', () => referencePanel.toggle());
  exampleBtn.addEventListener('click', loadExample);

  // Initialize UI
  updateUI();
});
