// Simple Interpreter - Language Reference Renderer
// Shows available syntax and examples in a tab panel

class ReferenceRenderer {
  constructor(container) {
    this.container = container;
    this.render();
  }

  // Get current language reference content
  // This will be updated as we add language features
  getContent() {
    return {
      types: [
        { name: 'Integer', desc: '42, 0, -5' },
        { name: 'Float', desc: '3.14, 0.5, -2.7' },
        { name: 'String', desc: '"hello", "world"' },
        { name: 'Boolean', desc: 'true, false' },
        { name: 'Array', desc: '[1, 2, 3]' },
        { name: 'Function', desc: 'function name() { }' },
      ],
      keywords: [
        { name: 'let', desc: 'declare a variable' },
        { name: 'if', desc: 'conditional branch' },
        { name: 'else', desc: 'alternative branch' },
        { name: 'while', desc: 'loop while condition is true' },
        { name: 'function', desc: 'define a function' },
        { name: 'return', desc: 'return a value from function' },
        { name: 'and', desc: 'logical and' },
        { name: 'or', desc: 'logical or' },
        { name: 'not', desc: 'logical not' },
        { name: 'true', desc: 'boolean true' },
        { name: 'false', desc: 'boolean false' },
      ],
      operators: [
        { name: '+ - * / %', desc: 'arithmetic' },
        { name: '=', desc: 'assignment' },
        { name: '== !=', desc: 'equality' },
        { name: '< > <= >=', desc: 'comparison' },
        { name: '-x', desc: 'negation' },
      ],
      variables: [
        { name: 'Declaration', desc: 'let name = value' },
        { name: 'Assignment', desc: 'name = newValue' },
        { name: 'Dynamic typing', desc: 'variables can change type' },
      ],
      arrays: [
        { name: 'Literal', desc: '[1, 2, 3]' },
        { name: 'Access', desc: 'arr[0]' },
        { name: 'Assignment', desc: 'arr[0] = value' },
        { name: 'Nested', desc: 'arr[0][1]' },
        { name: 'String index', desc: '"hello"[0] → "h"' },
      ],
      builtins: [
        { name: 'print x', desc: 'output a value' },
        { name: 'len(x)', desc: 'length of array or string' },
        { name: 'num(x)', desc: 'convert string to number' },
        { name: 'input()', desc: 'read line of input' },
        { name: 'key()', desc: 'read single keypress' },
        { name: 'random(min, max)', desc: 'random integer in range' },
      ]
    };
  }

  render() {
    const content = this.getContent();
    this.container.innerHTML = `
      <div class="reference-content">
        <section>
          <h3>Types</h3>
          <dl class="ref-list">
            ${content.types.map(t => `<dt>${t.name}</dt><dd>${t.desc}</dd>`).join('')}
          </dl>
        </section>
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
        <section>
          <h3>Arrays</h3>
          <dl class="ref-list">
            ${content.arrays.map(a => `<dt>${a.name}</dt><dd>${a.desc}</dd>`).join('')}
          </dl>
        </section>
        <section>
          <h3>Built-in Functions</h3>
          <dl class="ref-list">
            ${content.builtins.map(b => `<dt>${b.name}</dt><dd>${b.desc}</dd>`).join('')}
          </dl>
        </section>
      </div>
    `;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReferenceRenderer };
}
