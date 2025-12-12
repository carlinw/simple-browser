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

### Code Quality Review Process

Run this analysis at the start of each release planning. Only document issues that need to be addressed.

**1. Line Count Analysis**
```bash
wc -l src/*.js styles/*.css tests/*.js index.html | sort -n
```

**2. Check for Issues**

| Category | Threshold | Action |
|----------|-----------|--------|
| File > 400 lines | Monitor | Consider splitting if grows |
| Duplicated code | Fix | Extract shared logic |
| Missing tests | Fix | Add coverage |
| Complex functions | Monitor | Consider refactoring |

**3. Document in Release**

Only add a "Code Quality Issues" section if there are items to address. Include:
- Issue description
- Priority (MUST FIX / SHOULD FIX / MONITOR)
- Proposed solution

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

## Roadmap

Based on original plan in releases/1.md, adjusted for actual progress.

### Completed Releases
| Release | Planned | Actual |
|---------|---------|--------|
| 1 | Project setup, UI shell | ✓ Same |
| 2 | Lexer (tokenization) | ✓ Same |
| 3 | Lexer visualization | Parser + basic lexer viz |
| 4 | Parser (AST construction) | AST visualization |
| 5 | AST visualization | Interpreter (expressions, variables, control flow) |
| 6 | Interpreter: arithmetic | Scanner character-by-character visualization |
| 7 | Interpreter: variables | Animated execution with AST node highlighting |
| 8 | Stack visualization | Memory tab, 3-section layout |

**Note:** We have variables and arithmetic. Control flow (if/else, while) is parsed but not yet interpreted.

### Upcoming Releases
| Release | Feature |
|---------|---------|
| **9** | If/else conditionals + code highlighting during execution |
| **10** | While loops |
| **11** | Functions (definition, calls, return) |
| **12** | Call stack visualization (stack frames) |
| **13** | Arrays |
| **14** | Objects/structs |
| **15** | Heap visualization |
| **16+** | I/O, graphics, sample programs (see releases/1.md)

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
