// Simple Interpreter - Language Reference Panel
// Shows available syntax and examples

class ReferencePanel {
  constructor() {
    this.isOpen = false;
    this.overlay = null;
    this.panel = null;
  }

  // Get current language reference content
  // This will be updated as we add language features
  getContent() {
    return {
      keywords: [
        { name: 'let', desc: 'declare a variable' },
        { name: 'if', desc: 'conditional' },
        { name: 'else', desc: 'conditional branch' },
        { name: 'while', desc: 'loop' },
        { name: 'function', desc: 'define a function' },
        { name: 'return', desc: 'return from function' },
        { name: 'print', desc: 'output to console' },
        { name: 'stop', desc: 'pause execution (debugger)' },
        { name: 'true', desc: 'boolean true' },
        { name: 'false', desc: 'boolean false' },
      ],
      operators: [
        { name: '+ - * /', desc: 'arithmetic' },
        { name: '=', desc: 'assignment' },
        { name: '== !=', desc: 'equality' },
        { name: '< > <= >=', desc: 'comparison' },
      ],
      examples: [
        'let x = 42',
        'print x + 1',
        'if (x > 0) { print "positive" }',
      ]
    };
  }

  // Show the reference modal
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
  }

  // Hide the reference modal
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.hide();
  }

  // Toggle open/close
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  render() {
    const content = this.getContent();

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    // Create panel
    this.panel = document.createElement('div');
    this.panel.className = 'modal-panel';
    this.panel.innerHTML = `
      <div class="modal-header">
        <h2>Language Reference</h2>
        <button class="modal-close" id="ref-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <section>
          <h3>Keywords</h3>
          <dl class="ref-list">
            ${content.keywords.map(k => `<dt>${k.name}</dt><dd>${k.desc}</dd>`).join('')}
          </dl>
        </section>
        <section>
          <h3>Operators</h3>
          <dl class="ref-list">
            ${content.operators.map(o => `<dt>${o.name}</dt><dd>${o.desc}</dd>`).join('')}
          </dl>
        </section>
        <section>
          <h3>Examples</h3>
          <pre class="ref-examples">${content.examples.join('\n')}</pre>
        </section>
      </div>
    `;

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    // Add close button handler
    document.getElementById('ref-close-btn').onclick = () => this.close();
  }

  hide() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
      this.panel = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReferencePanel };
}
