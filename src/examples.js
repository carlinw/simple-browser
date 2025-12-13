// Tiny - Example Programs Manager
// Manages the example selector modal
// Example definitions are in src/examples/*.js

class ExamplesManager extends Modal {
  constructor() {
    super();
    this.examples = window.EXAMPLES || {};
    this.onSelect = null;
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

  // Show example selector modal
  showSelector(onSelect) {
    this.onSelect = onSelect;
    this.open();
  }

  // Alias for backwards compatibility
  hideSelector() {
    this.close();
  }

  getTitle() {
    return 'Example Programs';
  }

  getBodyContent() {
    const examples = this.getList();
    return `
      <div class="examples-grid">
        ${examples.map(ex => `
          <button class="example-card" data-id="${ex.id}">
            <div class="example-name">${ex.name}</div>
            <div class="example-desc">${ex.description}</div>
          </button>
        `).join('')}
      </div>
    `;
  }

  onAfterRender() {
    // Add click handlers to example cards
    this.panel.querySelectorAll('.example-card').forEach(card => {
      card.onclick = () => {
        const id = card.dataset.id;
        const code = this.getCode(id);
        if (code && this.onSelect) {
          this.onSelect(code);
        }
        this.close();
      };
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExamplesManager };
}
