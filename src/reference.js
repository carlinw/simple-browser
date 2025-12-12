// Simple Interpreter - Language Reference Panel
// Shows available syntax and examples

class ReferencePanel extends Modal {
  constructor() {
    super();
  }

  // Get current language reference content
  // This will be updated as we add language features
  getContent() {
    return {
      keywords: [
        { name: 'let', desc: 'declare a variable' },
        { name: 'if', desc: 'conditional (coming soon)' },
        { name: 'else', desc: 'conditional branch (coming soon)' },
        { name: 'while', desc: 'loop (coming soon)' },
        { name: 'function', desc: 'define a function (coming soon)' },
        { name: 'return', desc: 'return from function (coming soon)' },
        { name: 'print', desc: 'output to console' },
        { name: 'stop', desc: 'pause execution (coming soon)' },
        { name: 'true', desc: 'boolean true' },
        { name: 'false', desc: 'boolean false' },
      ],
      operators: [
        { name: '+ - * /', desc: 'arithmetic' },
        { name: '=', desc: 'assignment' },
        { name: '== !=', desc: 'equality' },
        { name: '< > <= >=', desc: 'comparison' },
      ],
      variables: [
        { name: 'Declaration', desc: 'let name = value' },
        { name: 'Assignment', desc: 'name = newValue' },
        { name: 'Dynamic typing', desc: 'Variables can change type' },
      ]
    };
  }

  getTitle() {
    return 'Language Reference';
  }

  getBodyContent() {
    const content = this.getContent();
    return `
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
        <h3>Variables</h3>
        <dl class="ref-list">
          ${content.variables.map(v => `<dt>${v.name}</dt><dd>${v.desc}</dd>`).join('')}
        </dl>
      </section>
    `;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReferencePanel };
}
