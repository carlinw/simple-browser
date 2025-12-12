// Simple Interpreter - Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const codeEditor = document.getElementById('code-editor');
  const codeDisplay = document.getElementById('code-display');
  const output = document.getElementById('output');
  const runBtn = document.getElementById('run-btn');
  const stepBtn = document.getElementById('step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const helpBtn = document.getElementById('help-btn');
  const exampleBtn = document.getElementById('example-btn');

  // Managers
  const visualizer = new CodeVisualizer(codeDisplay);
  const referencePanel = new ReferencePanel();
  const examplesManager = new ExamplesManager();

  // State
  let state = 'edit';  // 'edit' | 'stepping' | 'done'
  let scanner = null;
  let lastScanResult = null;

  // Update UI based on state
  function updateUI() {
    switch (state) {
      case 'edit':
        runBtn.disabled = false;
        stepBtn.disabled = false;
        resetBtn.disabled = true;
        codeEditor.disabled = false;
        codeEditor.classList.remove('hidden');
        codeDisplay.classList.add('hidden');
        break;

      case 'stepping':
        runBtn.disabled = false;  // Keep Run enabled to allow full tokenization
        stepBtn.disabled = false;
        resetBtn.disabled = false;
        codeEditor.disabled = true;
        codeEditor.classList.add('hidden');
        codeDisplay.classList.remove('hidden');
        break;

      case 'done':
        runBtn.disabled = false;  // Keep Run enabled to allow re-running
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

    output.innerHTML = html;
  }

  // Run all - tokenize everything at once
  function runAll() {
    // If we're in stepping mode, get source from scanner, reset to edit, then run
    let source;
    if (state === 'stepping' || state === 'done') {
      source = scanner ? scanner.source : codeEditor.value;
      // Reset UI back to edit mode
      state = 'edit';
      scanner = null;
      lastScanResult = null;
      visualizer.clear();
      visualizer.hide();
      codeEditor.classList.remove('hidden');
      codeDisplay.classList.add('hidden');
      codeEditor.disabled = false;
    } else {
      source = codeEditor.value;
    }

    // Handle empty input
    if (!source.trim()) {
      output.textContent = 'Hello, Connor!';
      return;
    }

    // Tokenize the source code
    const lex = new Lexer(source);
    const lexResult = lex.tokenize();

    // Format output
    let outputText = '';

    // Show lexer errors first
    if (lexResult.errors.length > 0) {
      outputText += 'Lexer Errors:\n';
      for (const error of lexResult.errors) {
        outputText += `  Line ${error.line}, Column ${error.column}: ${error.message}\n`;
      }
      outputText += '\n';
    }

    // Parse the tokens
    const parser = new Parser(lexResult.tokens);
    const parseResult = parser.parse();

    // Show parser errors
    if (parseResult.errors.length > 0) {
      outputText += 'Parser Errors:\n';
      for (const error of parseResult.errors) {
        outputText += `  Line ${error.line}, Column ${error.column}: ${error.message}\n`;
      }
      outputText += '\n';
    }

    // Show tokens (filter out whitespace and comments for clean output)
    outputText += 'Tokens:\n';
    for (const token of lexResult.tokens) {
      // Skip whitespace and comments in run mode
      if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
        continue;
      }
      if (token.type === 'EOF') {
        outputText += `  ${token.line}:${token.column}   EOF\n`;
      } else {
        const pos = `${token.line}:${token.column}`.padEnd(6);
        const type = token.type.padEnd(12);
        const value = typeof token.value === 'string' ? token.value : String(token.value);
        outputText += `  ${pos} ${type} ${value}\n`;
      }
    }

    // Show tokens as text
    const tokensDiv = document.createElement('pre');
    tokensDiv.textContent = outputText;

    // Show AST as visual tree
    const astLabel = document.createElement('div');
    astLabel.className = 'ast-label';
    astLabel.textContent = 'AST:';

    const astContainer = document.createElement('div');
    const astRenderer = new ASTRenderer(astContainer);
    astRenderer.render(parseResult.ast);

    // Combine in output
    output.innerHTML = '';
    output.appendChild(tokensDiv);
    output.appendChild(astContainer);
  }

  // Step - scan one character at a time
  function stepOne() {
    if (state === 'edit') {
      // Initialize stepping
      const source = codeEditor.value;
      if (!source.trim()) {
        output.textContent = 'Hello, Connor!';
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
    output.textContent = '';
    visualizer.clear();
    visualizer.hide();
    updateUI();
  }

  // Load example program
  function loadExample() {
    const code = examplesManager.getDefault();
    codeEditor.value = code;
    reset();
  }

  // Event listeners
  runBtn.addEventListener('click', runAll);
  stepBtn.addEventListener('click', stepOne);
  resetBtn.addEventListener('click', reset);
  helpBtn.addEventListener('click', () => referencePanel.toggle());
  exampleBtn.addEventListener('click', loadExample);

  // Initialize UI
  updateUI();
});
