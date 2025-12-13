// Tiny - Code Visualizer
// Handles source code highlighting for step-through mode

class CodeVisualizer {
  constructor(containerElement) {
    this.container = containerElement;
    this.source = '';
  }

  // Set the source code to visualize
  setSource(source) {
    this.source = source;
  }

  // Show initial state - all code as pending (not yet scanned)
  showInitial() {
    if (!this.source) return;

    const pending = this.escapeHtml(this.source);
    this.container.innerHTML = `<span class="code-pending">${pending}</span>`;
    this.show();
  }

  // Show source with highlight at given span (token-level)
  highlight(span) {
    if (!this.source) return;

    const before = this.escapeHtml(this.source.substring(0, span.start));
    const current = this.escapeHtml(this.source.substring(span.start, span.end));
    const after = this.escapeHtml(this.source.substring(span.end));

    this.container.innerHTML =
      `<span class="code-before">${before}</span>` +
      `<span class="code-current">${current}</span>` +
      `<span class="code-after">${after}</span>`;

    this.show();
  }

  // Highlight code span during execution (with pulse animation)
  highlightExecuting(span) {
    if (!this.source || !span) return;

    const before = this.escapeHtml(this.source.substring(0, span.start));
    const current = this.escapeHtml(this.source.substring(span.start, span.end));
    const after = this.escapeHtml(this.source.substring(span.end));

    this.container.innerHTML =
      `<span class="code-done">${before}</span>` +
      `<span class="code-executing">${current}</span>` +
      `<span class="code-pending">${after}</span>`;

    this.show();
  }

  // Clear the execution highlight - show source without highlighting
  clearExecutingHighlight() {
    this.showInitial();
  }

  // Show source with character-level highlighting for scanning
  // currentChar: position of char just processed
  // bufferStart: where the current token buffer started
  // bufferEnd: current end of buffer (same as currentChar + 1 usually)
  highlightChar(currentChar, bufferStart, bufferEnd) {
    if (!this.source) return;

    // Split into sections:
    // 1. Code before current token (already processed)
    // 2. Buffer being built (the current token in progress)
    // 3. Code after buffer (not yet processed)

    const beforeBuffer = this.escapeHtml(this.source.substring(0, bufferStart));
    const buffer = this.escapeHtml(this.source.substring(bufferStart, bufferEnd));
    const afterBuffer = this.escapeHtml(this.source.substring(bufferEnd));

    // Highlight the last character in the buffer as the "cursor"
    let bufferHtml;
    if (buffer.length > 0) {
      const bufferPart = buffer.substring(0, buffer.length - 1);
      const cursorChar = buffer.substring(buffer.length - 1);
      bufferHtml = `<span class="code-buffer">${bufferPart}</span><span class="code-cursor">${cursorChar}</span>`;
    } else {
      bufferHtml = '';
    }

    this.container.innerHTML =
      `<span class="code-done">${beforeBuffer}</span>` +
      bufferHtml +
      `<span class="code-pending">${afterBuffer}</span>`;

    this.show();
  }

  // Clear highlighting (show full source dimmed or empty)
  clear() {
    this.container.innerHTML = '';
    this.source = '';
  }

  // Show the visualizer
  show() {
    this.container.classList.remove('hidden');
  }

  // Hide the visualizer
  hide() {
    this.container.classList.add('hidden');
  }

  // Escape HTML special characters
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CodeVisualizer };
}
