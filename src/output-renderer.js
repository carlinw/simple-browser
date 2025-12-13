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
    this.isFullscreen = false;
    this.fullscreenOverlay = null;
    this.canvasWidth = CANVAS_WIDTH;
    this.canvasHeight = CANVAS_HEIGHT;
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

    // Blur code editor to ensure keyboard events work for games
    const codeEditor = document.getElementById('code-editor');
    if (codeEditor) {
      codeEditor.blur();
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.className = 'output-canvas';
    // Make canvas focusable so it can receive keyboard events
    this.canvas.tabIndex = 0;
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    // Focus canvas for keyboard input
    this.canvas.focus();
    this.ctx = this.canvas.getContext('2d');
    // Default to black background
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.currentColor = COLORS.white;
  }

  // Clear the canvas to black
  clearCanvas() {
    this.showCanvas();
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
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

  // Enter fullscreen mode
  enterFullscreen() {
    if (this.isFullscreen) return;

    this.showCanvas();
    this.isFullscreen = true;

    // Create fullscreen overlay
    this.fullscreenOverlay = document.createElement('div');
    this.fullscreenOverlay.className = 'fullscreen-overlay';

    // Move canvas to overlay
    this.fullscreenOverlay.appendChild(this.canvas);
    document.body.appendChild(this.fullscreenOverlay);

    // Calculate new canvas size to fit screen with some padding
    const padding = 40;
    const maxWidth = window.innerWidth - padding * 2;
    const maxHeight = window.innerHeight - padding * 2;

    // Maintain aspect ratio
    const aspectRatio = this.canvasWidth / this.canvasHeight;
    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }

    // Update canvas dimensions
    const oldWidth = this.canvasWidth;
    const oldHeight = this.canvasHeight;
    this.canvasWidth = Math.floor(newWidth);
    this.canvasHeight = Math.floor(newHeight);

    // Save current canvas content
    const imageData = this.ctx.getImageData(0, 0, oldWidth, oldHeight);

    // Resize canvas
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.canvas.classList.add('fullscreen-canvas');

    // Clear and restore scaled content
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Create temp canvas for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = oldWidth;
    tempCanvas.height = oldHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Scale to new size
    this.ctx.drawImage(tempCanvas, 0, 0, this.canvasWidth, this.canvasHeight);

    // Add ESC hint
    const hint = document.createElement('div');
    hint.className = 'fullscreen-hint';
    hint.textContent = 'Press ESC to exit fullscreen';
    this.fullscreenOverlay.appendChild(hint);

    // Fade out hint after 2 seconds
    setTimeout(() => hint.classList.add('fade-out'), 2000);

    // Listen for ESC key
    this.escHandler = (e) => {
      if (e.key === 'Escape') {
        this.exitFullscreen();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }

  // Exit fullscreen mode
  exitFullscreen() {
    if (!this.isFullscreen) return;

    this.isFullscreen = false;

    // Remove ESC listener
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }

    // Save current canvas content
    const imageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

    // Restore original dimensions
    this.canvasWidth = CANVAS_WIDTH;
    this.canvasHeight = CANVAS_HEIGHT;

    // Move canvas back to container
    this.canvas.classList.remove('fullscreen-canvas');
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);

    // Resize canvas
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    // Clear and restore scaled content
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Create temp canvas for scaling back
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Scale back to original size
    this.ctx.drawImage(tempCanvas, 0, 0, this.canvasWidth, this.canvasHeight);

    // Remove overlay
    if (this.fullscreenOverlay) {
      this.fullscreenOverlay.remove();
      this.fullscreenOverlay = null;
    }
  }

  // Get canvas width
  getWidth() {
    return this.canvasWidth;
  }

  // Get canvas height
  getHeight() {
    return this.canvasHeight;
  }

  // Hide canvas and return to text mode
  hideCanvas() {
    this.exitFullscreen();
    this.canvas = null;
    this.ctx = null;
    this.currentColor = '#ffffff';
    this.fillMode = true;
    this.canvasWidth = CANVAS_WIDTH;
    this.canvasHeight = CANVAS_HEIGHT;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutputRenderer };
}
