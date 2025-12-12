// Simple Interpreter - Output Tab Renderer
// Renders errors and program output to the Output tab

class OutputRenderer {
  constructor(container) {
    this.container = container;
  }

  // Render error messages from lexer, parser, or runtime
  renderErrors(lexErrors, parseErrors, runtimeErrors) {
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

    this.container.textContent = outputText;
  }

  // Render program output values
  renderOutput(values) {
    if (values.length === 0) {
      this.container.textContent = '(no output)';
    } else {
      this.container.textContent = values.map(v => String(v)).join('\n');
    }
  }

  // Render a simple message
  renderMessage(message) {
    this.container.textContent = message;
  }

  // Clear the container
  clear() {
    this.container.textContent = '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutputRenderer };
}
