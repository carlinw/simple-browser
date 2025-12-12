# Simple Browser Interpreter

A browser-based interpreter with visual debugging tools to teach how programming languages, interpreters, and memory management work.

## Project Vision

Build an educational tool that visualizes:
- **Lexer**: Watch tokens being created from source code
- **Parser**: See the AST being constructed step-by-step
- **Interpreter**: Execute code and observe the stack and heap
- **Memory**: Visual representation of stack frames and heap allocations

Target audience: Connor (and anyone learning how computers execute programs)

## Development Process

### Release Planning

**IMPORTANT: Do not implement until the user approves the complete release plan.**

1. Draft the release document with all design details
2. Wait for user approval
3. Only after approval, begin implementation
4. Complete code quality review after implementation

Release documents are in `releases/` folder.

### Testing Requirements

- **End-to-end Playwright tests** are required for every release
- Write both **positive tests** (happy path) and **negative tests** (error cases)
- All tests must pass before a release is considered complete
- Test the UI interactions and visual output

### Test-Driven Development (TDD)

**IMPORTANT:** When fixing bugs, always use TDD:

1. **Write a failing test first** - Create a test that reproduces the bug
2. **Verify the test fails** - Run it to confirm it catches the issue
3. **Fix the bug** - Implement the fix
4. **Verify the test passes** - Run the test again to confirm the fix works

This ensures:
- The bug is properly understood before fixing
- The fix actually solves the problem
- Regression protection for the future

Example workflow:
```bash
# 1. Write test that reproduces the bug
# 2. Run test - should FAIL
npx playwright test -g "my new test"
# 3. Fix the code
# 4. Run test - should PASS
npx playwright test -g "my new test"
```

### Code Standards

- **DRY** - Extract common logic into reusable functions
- **Reasonable file length** - Split large files into focused modules
- **Reasonable function length** - Functions should do one thing well
- **Separation of concerns** - Keep lexer, parser, interpreter, and UI separate
- **Clear naming** - Code should be readable (it's educational!)

### Language Syntax Documentation

**IMPORTANT:** Each release that adds language features MUST include a "Language Syntax" section in the release document. This builds the language reference incrementally. By the final release, we'll have complete documentation of the language.

Format for syntax sections:
```markdown
## Language Syntax (this release)

### New Keywords
- `keyword` - description

### New Operators
- `op` - description

### Grammar (if applicable)
statement = ...
```

### Step-Level Debugging

The interpreter will support step-by-step execution for educational purposes:
- **[Step]** button - execute one statement, then pause
- **[Resume]** button - continue running until next `stop` or end
- **`stop`** keyword - a language keyword that pauses execution (like a breakpoint in code)

This allows Connor to watch the interpreter execute line by line and observe memory changes.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks - keep it simple and learnable)
- **Testing**: Playwright for E2E tests
- **Build**: build.sh

## Build

Use `build.sh` for building the project.

## Project Structure (Target)

```
/
  index.html           # Main page
  src/
    lexer.js           # Tokenizer
    parser.js          # AST builder
    interpreter.js     # Evaluator with stack/heap
    visualizer.js      # Rendering visualizations
    editor.js          # Code editor handling
    ui.js              # UI interactions
  styles/
    main.css           # Styling
  tests/
    *.spec.js          # Playwright tests
  releases/
    1.md, 2.md, ...    # Release documents
```
