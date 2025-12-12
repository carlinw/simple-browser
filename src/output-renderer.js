// Simple Interpreter - Output Tab Renderer
// Renders errors and program output to the Output tab

class OutputRenderer {
  constructor(container) {
    this.container = container;
    this.inputField = null;
    this.inputResolve = null;
    this.keyResolve = null;
    this.keyHandler = null;
    this.canvas = null;
    this.ctx = null;
    this.currentColor = '#ffffff';
    this.fillMode = true; // true = fill, false = stroke
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

  // Show canvas for graphics output
  showCanvas() {
    if (this.canvas) return; // Already showing canvas

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.className = 'output-canvas';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    // Default to black background
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.currentColor = COLORS.white;
  }

  // Clear the canvas to black
  clearCanvas() {
    this.showCanvas();
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Set the current drawing color
  setColor(hex) {
    this.showCanvas();
    this.currentColor = hex;
  }

  // Draw a rectangle (fill or stroke based on mode)
  drawRect(x, y, w, h) {
    this.showCanvas();
    if (this.fillMode) {
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fillRect(x, y, w, h);
    } else {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, w, h);
    }
  }

  // Draw a circle (fill or stroke based on mode)
  drawCircle(x, y, r) {
    this.showCanvas();
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    if (this.fillMode) {
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  // Draw a line
  drawLine(x1, y1, x2, y2) {
    this.showCanvas();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  // Draw text on canvas
  drawText(x, y, str) {
    this.showCanvas();
    this.ctx.fillStyle = this.currentColor;
    this.ctx.font = '16px monospace';
    this.ctx.fillText(str, x, y);
  }

  // Draw a triangle
  drawTriangle(x1, y1, x2, y2, x3, y3) {
    this.showCanvas();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.closePath();
    if (this.fillMode) {
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  // Set fill mode
  setFillMode() {
    this.fillMode = true;
  }

  // Set stroke mode
  setStrokeMode() {
    this.fillMode = false;
  }

  // Hide canvas and return to text mode
  hideCanvas() {
    this.canvas = null;
    this.ctx = null;
    this.currentColor = '#ffffff';
    this.fillMode = true;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutputRenderer };
}
