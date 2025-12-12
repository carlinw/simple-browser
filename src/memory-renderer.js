// Simple Interpreter - Memory Tab Renderer
// Displays call stack with variables in each frame

class MemoryRenderer {
  constructor(container) {
    this.container = container;
    this.callStack = [];  // Stack of { name, args, environment } frames
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
        <div class="memory-legend-item">
          <div class="memory-legend-color legend-func"></div>
          <span class="memory-legend-label">Function</span>
        </div>
      </div>
    `;
  }

  // Set the global frame at start of execution
  setGlobalFrame() {
    this.callStack = [{ name: '<global>', args: [], environment: null }];
    this.render();
  }

  // Push a new stack frame (called on function call)
  pushFrame(funcName, args, environment) {
    this.callStack.push({ name: funcName, args, environment });
    this.render();
  }

  // Pop the top stack frame (called on function return)
  popFrame() {
    if (this.callStack.length > 1) {  // Keep global frame
      this.callStack.pop();
      this.render();
    }
  }

  // Update the current frame's environment (for variable changes)
  updateFrame(environment) {
    if (this.callStack.length > 0) {
      this.callStack[this.callStack.length - 1].environment = environment;
      this.render();
    }
  }

  // Render the full call stack
  render() {
    if (this.callStack.length === 0) {
      this.showEmpty();
      return;
    }

    let html = '<div class="call-stack">';
    html += '<div class="call-stack-label">Call Stack:</div>';

    // Render frames from top to bottom (most recent first)
    for (let i = this.callStack.length - 1; i >= 0; i--) {
      const frame = this.callStack[i];
      const isGlobal = frame.name === '<global>';
      const isTop = i === this.callStack.length - 1;

      html += `<div class="stack-frame ${isTop ? 'stack-frame-active' : ''} ${isGlobal ? 'stack-frame-global' : ''}">`;

      // Frame header
      if (isGlobal) {
        html += `<div class="frame-header">&lt;global&gt;</div>`;
      } else {
        const argsStr = frame.args.map(a => this.formatValue(a)).join(', ');
        html += `<div class="frame-header">${frame.name}(${argsStr})</div>`;
      }

      // Frame variables
      html += '<div class="frame-variables">';
      if (frame.environment) {
        const variables = frame.environment.getAll();
        if (variables.length === 0) {
          html += '<div class="memory-empty-frame">(no variables)</div>';
        } else {
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
        }
      } else {
        html += '<div class="memory-empty-frame">(no variables)</div>';
      }
      html += '</div>';

      html += '</div>';
    }

    html += '</div>';
    html += this.getLegendHtml();
    this.container.innerHTML = html;
  }

  // Legacy render method for backward compatibility with old tests
  renderLegacy(environment) {
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
    if (value && typeof value === 'object' && value.declaration) return 'func';
    return 'unknown';
  }

  // Format value for display
  formatValue(value) {
    if (typeof value === 'string') return `"${value}"`;
    if (value && typeof value === 'object' && value.declaration) return '[function]';
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
    this.callStack = [];
    this.container.innerHTML = '<div class="memory-empty">(no variables)</div>' + this.getLegendHtml();
  }

  // Clear the container
  clear() {
    this.callStack = [];
    this.container.innerHTML = '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemoryRenderer };
}
