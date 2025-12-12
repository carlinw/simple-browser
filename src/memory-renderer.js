// Simple Interpreter - Memory Tab Renderer
// Displays variables and their values with type indicators

class MemoryRenderer {
  constructor(container) {
    this.container = container;
  }

  // Build legend HTML (used at bottom of tab)
  getLegendHtml() {
    return `
      <div class="memory-legend">
        <div class="memory-legend-item">
          <div class="memory-legend-color legend-num"></div>
          <span class="memory-legend-label">Number</span>
        </div>
        <div class="memory-legend-item">
          <div class="memory-legend-color legend-str"></div>
          <span class="memory-legend-label">String</span>
        </div>
        <div class="memory-legend-item">
          <div class="memory-legend-color legend-bool"></div>
          <span class="memory-legend-label">Boolean</span>
        </div>
      </div>
    `;
  }

  // Render current variable state with legend at bottom
  render(environment) {
    const variables = environment.getAll();

    if (variables.length === 0) {
      this.container.innerHTML = '<div class="memory-empty">(no variables)</div>' + this.getLegendHtml();
      return;
    }

    let html = '<div class="memory-list">';
    for (const [name, value] of variables) {
      const type = this.getType(value);
      const displayValue = this.formatValue(value);
      html += `
        <div class="memory-var" data-name="${name}">
          <span class="var-name">${name}</span>
          <span class="var-type var-type-${type}">${type}</span>
          <span class="var-value var-value-${type}">${displayValue}</span>
        </div>
      `;
    }
    html += '</div>';
    html += this.getLegendHtml();
    this.container.innerHTML = html;
  }

  // Get type abbreviation
  getType(value) {
    if (typeof value === 'number') return 'num';
    if (typeof value === 'string') return 'str';
    if (typeof value === 'boolean') return 'bool';
    return 'unknown';
  }

  // Format value for display
  formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  }

  // Highlight a variable that just changed
  highlightVariable(name) {
    const varEl = this.container.querySelector(`[data-name="${name}"]`);
    if (varEl) {
      varEl.classList.add('var-changed');
      setTimeout(() => varEl.classList.remove('var-changed'), 500);
    }
  }

  // Show empty state with legend at bottom
  showEmpty() {
    this.container.innerHTML = '<div class="memory-empty">(no variables)</div>' + this.getLegendHtml();
  }

  // Clear the container
  clear() {
    this.container.innerHTML = '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryRenderer };
}
