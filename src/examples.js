// Simple Interpreter - Example Programs
// Preloaded examples to demonstrate features

const EXAMPLES = {
  'tokenizer-demo': {
    name: 'Tokenizer Demo',
    description: 'Step through to see how the lexer breaks code into tokens',
    code: `// Tokenizer Demo
// Step through to see how the lexer breaks code into tokens

let message = "Hello, Connor!"
let count = 42

// Try different token types:
// - Keywords: let, if, while, print
// - Numbers: 42, 0, 100
// - Strings: "hello"
// - Operators: + - * / = == < >

print message
print count + 1

if (count > 0) {
    print "positive"
}`
  },

  'variables': {
    name: 'Variables',
    description: 'Learn how to declare, use, and reassign variables',
    code: `// Variables Demo
// Declare and use variables

let x = 42
print x + 1

// Reassign variables
let count = 0
count = count + 1
print count

// Dynamic typing - types can change
let value = 10
value = "hello"
print value`
  },

  'arithmetic': {
    name: 'Arithmetic',
    description: 'Basic math operations and operator precedence',
    code: `// Arithmetic Demo
// Basic operations
print 2 + 3
print 10 - 4
print 3 * 4
print 20 / 5

// Operator precedence (* and / before + and -)
print 2 + 3 * 4

// Use parentheses to change order
print (2 + 3) * 4

// Complex expression
print 1 + 2 * 3 - 4 / 2`
  },

  'comparisons': {
    name: 'Comparisons',
    description: 'Compare values and see boolean results',
    code: `// Comparisons Demo
// Greater than / less than
print 5 > 3
print 2 < 1

// Greater/less than or equal
print 5 >= 5
print 3 <= 2

// Equality
print 10 == 10
print 5 != 3

// Compare variables
let x = 10
let y = 20
print x < y`
  }
};

class ExamplesManager extends Modal {
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExamplesManager, EXAMPLES };
}
