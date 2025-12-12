// Simple Interpreter - Main Entry Point

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const codeEditor = document.getElementById('code-editor');
  const codeDisplay = document.getElementById('code-display');
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

  // Renderers
  const parserRenderer = new ParserRenderer(tabTokens);
  const outputRenderer = new OutputRenderer(tabOutput);
  const astRenderer = new ASTRenderer(tabAst);

  // Other Managers
  const visualizer = new CodeVisualizer(codeDisplay);
  const referencePanel = new ReferencePanel();
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
      outputRenderer.renderMessage('Hello, Connor!');
      switchTab('output');
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

    // Show errors if any
    if (currentLexResult.errors.length > 0 || currentParseResult.errors.length > 0) {
      outputRenderer.renderErrors(currentLexResult.errors, currentParseResult.errors, []);
      switchTab('output');
      return false;
    }

    // No errors - switch to AST tab
    outputRenderer.clear();
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
      outputRenderer.renderOutput(result.output);
      switchTab('output');
    } catch (error) {
      astRenderer.clearHighlights();
      outputRenderer.renderErrors([], [], [{ message: error.message }]);
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
      outputRenderer.renderOutput(result.output);
      switchTab('output');
    } catch (error) {
      outputRenderer.renderErrors([], [], [{ message: error.message }]);
      switchTab('output');
    }
  }

  // Step - scan one character at a time
  function stepOne() {
    if (state === 'edit') {
      // Initialize stepping
      const source = codeEditor.value;
      if (!source.trim()) {
        parserRenderer.clear();
        astRenderer.clear();
        outputRenderer.renderMessage('Hello, Connor!');
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
    outputRenderer.clear();
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
  helpBtn.addEventListener('click', () => referencePanel.toggle());
  exampleBtn.addEventListener('click', showExamples);

  // Initialize UI
  updateUI();
});
