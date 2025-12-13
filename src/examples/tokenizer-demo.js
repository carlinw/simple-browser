// Example: Tokenizer Demo
// Step through to see how the lexer breaks code into tokens

window.EXAMPLES = window.EXAMPLES || {};

window.EXAMPLES['tokenizer-demo'] = {
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
// - Operators: + - * / = < >

print(message)
print(count + 1)

if (count > 0) {
    print("positive")
}`
};
