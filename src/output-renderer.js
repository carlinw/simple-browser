// Simple Interpreter - Output Tab Renderer
// Renders errors and program output to the Output tab

class OutputRenderer {
  constructor(container) {
    this.container = container;
    this.inputField = null;
    this.inputResolve = null;
    this.keyResolve = null;
    this.keyHandler = null;
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
    this.cleanupInput();
  }

  // Show input field and wait for user to type a line
  async showInputField() {
    return new Promise((resolve) => {
      this.inputResolve = resolve;

      // Preserve current text content
      const currentText = this.container.textContent;

      // Clear and rebuild with proper structure
      this.container.innerHTML = '';

      // Add existing output as text node
      if (currentText && currentText !== '(no output)') {
        const textNode = document.createTextNode(currentText + '\n');
        this.container.appendChild(textNode);
      }

      // Create input container
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';

      // Create input field
      this.inputField = document.createElement('input');
      this.inputField.type = 'text';
      this.inputField.className = 'input-field';
      this.inputField.placeholder = 'Type here and press Enter...';

      // Handle Enter key
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = this.inputField.value;
          this.cleanupInput();
          resolve(value);
        }
      });

      inputContainer.appendChild(this.inputField);
      this.container.appendChild(inputContainer);
      this.inputField.focus();
    });
  }

  // Wait for a single keypress
  async waitForKeypress() {
    return new Promise((resolve) => {
      this.keyResolve = resolve;

      // Preserve current text content
      const currentText = this.container.textContent;

      // Clear and rebuild with proper structure
      this.container.innerHTML = '';

      // Add existing output as text node
      if (currentText && currentText !== '(no output)') {
        const textNode = document.createTextNode(currentText + '\n');
        this.container.appendChild(textNode);
      }

      // Show waiting message
      const keyPrompt = document.createElement('span');
      keyPrompt.className = 'key-prompt';
      keyPrompt.textContent = '[Press any key...]';
      this.container.appendChild(keyPrompt);

      // Listen for keydown on document
      this.keyHandler = (e) => {
        // Get the key string
        let key = e.key;
        // Clean up
        document.removeEventListener('keydown', this.keyHandler);
        this.keyHandler = null;
        this.keyResolve = null;
        // Remove prompt
        if (keyPrompt.parentNode) {
          keyPrompt.remove();
        }
        resolve(key);
      };

      document.addEventListener('keydown', this.keyHandler);
    });
  }

  // Clean up any pending input
  cleanupInput() {
    if (this.inputField && this.inputField.parentNode) {
      this.inputField.parentNode.remove();
    }
    this.inputField = null;
    this.inputResolve = null;

    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    this.keyResolve = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutputRenderer };
}
