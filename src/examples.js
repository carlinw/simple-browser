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
  }
};

class ExamplesManager {
  constructor() {
    this.examples = EXAMPLES;
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExamplesManager, EXAMPLES };
}
