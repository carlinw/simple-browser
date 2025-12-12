// AST Renderer - Graphical tree display for Abstract Syntax Trees

class ASTRenderer {
  constructor(container) {
    this.container = container;
    this.nodeElements = new Map();  // Map AST node -> DOM element
  }

  // Render the full AST
  render(ast) {
    this.container.innerHTML = '';
    this.nodeElements.clear();
    // Store AST as data attribute for testing
    this.container.dataset.ast = JSON.stringify(ast);

    // Create wrapper with ast-tree class
    const wrapper = document.createElement('div');
    wrapper.className = 'ast-tree';
    const tree = this.renderNode(ast);
    wrapper.appendChild(tree);
    this.container.appendChild(wrapper);

    // Add legend at bottom
    const legend = this.renderLegend();
    this.container.appendChild(legend);
  }

  // Render the color legend
  renderLegend() {
    const legend = document.createElement('div');
    legend.className = 'ast-legend';
    legend.innerHTML = `
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-statement"></div>
        <span class="ast-legend-label">Statement</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-control"></div>
        <span class="ast-legend-label">Control</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-print"></div>
        <span class="ast-legend-label">Print</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-expression"></div>
        <span class="ast-legend-label">Expression</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-identifier"></div>
        <span class="ast-legend-label">Identifier</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-number"></div>
        <span class="ast-legend-label">Number</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-string"></div>
        <span class="ast-legend-label">String</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-boolean"></div>
        <span class="ast-legend-label">Boolean</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-array"></div>
        <span class="ast-legend-label">Array</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-builtin"></div>
        <span class="ast-legend-label">Built-in</span>
      </div>
      <div class="ast-legend-item">
        <div class="ast-legend-color legend-unary"></div>
        <span class="ast-legend-label">Unary</span>
      </div>
    `;
    return legend;
  }

  // Render a single node and its children
  renderNode(node) {
    const container = document.createElement('div');
    container.className = 'ast-node-container';

    // Create the node box
    const nodeBox = document.createElement('div');
    nodeBox.className = `ast-node ast-${node.type.toLowerCase()}`;

    // Node content
    const label = this.getNodeLabel(node);
    nodeBox.innerHTML = label;

    // Store mapping for highlighting during execution
    this.nodeElements.set(node, nodeBox);

    // Click to collapse/expand
    const children = this.getChildren(node);
    if (children.length > 0) {
      nodeBox.classList.add('ast-has-children');
      nodeBox.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.toggle('ast-collapsed');
      });
    }

    container.appendChild(nodeBox);

    // Render children
    if (children.length > 0) {
      // Connector line down from parent
      const connector = document.createElement('div');
      connector.className = 'ast-connector';
      container.appendChild(connector);

      // Children container
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'ast-children';

      for (const child of children) {
        const childWrapper = document.createElement('div');
        childWrapper.className = 'ast-child';

        // Edge label if present
        if (child.label) {
          const edgeLabel = document.createElement('div');
          edgeLabel.className = 'ast-edge-label';
          edgeLabel.textContent = child.label;
          childWrapper.appendChild(edgeLabel);
        }

        childWrapper.appendChild(this.renderNode(child.node));
        childrenContainer.appendChild(childWrapper);
      }

      container.appendChild(childrenContainer);
    }

    return container;
  }

  // Get display label for a node
  getNodeLabel(node) {
    switch (node.type) {
      case 'Program':
        return 'Program';
      case 'LetStatement':
        return 'let';
      case 'AssignStatement':
        return '=';
      case 'PrintStatement':
        return 'print';
      case 'ExpressionStatement':
        return 'expr';
      case 'IfStatement':
        return 'if';
      case 'WhileStatement':
        return 'while';
      case 'FunctionDeclaration':
        return `fn <em>${this.escapeHtml(node.name)}</em>`;
      case 'ReturnStatement':
        return 'return';
      case 'CallExpression':
        return `call <em>${this.escapeHtml(node.callee)}</em>`;
      case 'ParamList':
        return 'params';
      case 'Block':
        return '{ }';
      case 'BinaryExpression':
        return `<strong>${this.escapeHtml(node.operator)}</strong>`;
      case 'Identifier':
        return `<em>${this.escapeHtml(node.name)}</em>`;
      case 'NumberLiteral':
        return `<strong>${node.value}</strong>`;
      case 'StringLiteral':
        return `"${this.escapeHtml(node.value)}"`;
      case 'BooleanLiteral':
        return `<strong>${node.value}</strong>`;
      case 'ArrayLiteral':
        return '[ ]';
      case 'IndexExpression':
        return '[ ]';
      case 'IndexAssignStatement':
        return '[ ]=';
      case 'BuiltinCall':
        return `<em>${this.escapeHtml(node.name)}</em>()`;
      case 'UnaryExpression':
        return `<strong>${this.escapeHtml(node.operator)}</strong>`;
      default:
        return node.type;
    }
  }

  // Escape HTML special characters
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Get child nodes to render
  getChildren(node) {
    const children = [];

    switch (node.type) {
      case 'Program':
        for (const stmt of node.statements) {
          children.push({ node: stmt });
        }
        break;

      case 'LetStatement':
        // Show variable name as identifier child
        children.push({ label: 'name', node: { type: 'Identifier', name: node.name } });
        if (node.value) {
          children.push({ label: 'value', node: node.value });
        }
        break;

      case 'AssignStatement':
        // Show variable name as identifier child
        children.push({ label: 'name', node: { type: 'Identifier', name: node.name } });
        if (node.value) {
          children.push({ label: 'value', node: node.value });
        }
        break;

      case 'PrintStatement':
        if (node.value) {
          children.push({ node: node.value });
        }
        break;

      case 'ExpressionStatement':
        if (node.expression) {
          children.push({ node: node.expression });
        }
        break;

      case 'IfStatement':
        if (node.condition) {
          children.push({ label: 'cond', node: node.condition });
        }
        if (node.thenBranch) {
          children.push({ label: 'then', node: node.thenBranch });
        }
        if (node.elseBranch) {
          children.push({ label: 'else', node: node.elseBranch });
        }
        break;

      case 'WhileStatement':
        if (node.condition) {
          children.push({ label: 'cond', node: node.condition });
        }
        if (node.body) {
          children.push({ label: 'body', node: node.body });
        }
        break;

      case 'Block':
        for (const stmt of node.statements) {
          children.push({ node: stmt });
        }
        break;

      case 'FunctionDeclaration':
        // Show params as a list
        if (node.params && node.params.length > 0) {
          children.push({ label: 'params', node: { type: 'ParamList', params: node.params } });
        }
        if (node.body) {
          children.push({ label: 'body', node: node.body });
        }
        break;

      case 'ParamList':
        // Helper node type for displaying parameters
        for (const param of node.params) {
          children.push({ node: { type: 'Identifier', name: param } });
        }
        break;

      case 'ReturnStatement':
        if (node.value) {
          children.push({ node: node.value });
        }
        break;

      case 'CallExpression':
        for (const arg of node.arguments) {
          children.push({ label: 'arg', node: arg });
        }
        break;

      case 'BinaryExpression':
        if (node.left) {
          children.push({ node: node.left });
        }
        if (node.right) {
          children.push({ node: node.right });
        }
        break;

      case 'ArrayLiteral':
        for (const elem of node.elements) {
          children.push({ node: elem });
        }
        break;

      case 'IndexExpression':
        if (node.object) {
          children.push({ label: 'arr', node: node.object });
        }
        if (node.index) {
          children.push({ label: 'idx', node: node.index });
        }
        break;

      case 'IndexAssignStatement':
        if (node.object) {
          children.push({ label: 'arr', node: node.object });
        }
        if (node.index) {
          children.push({ label: 'idx', node: node.index });
        }
        if (node.value) {
          children.push({ label: 'val', node: node.value });
        }
        break;

      case 'BuiltinCall':
        if (node.argument) {
          children.push({ node: node.argument });
        }
        break;

      case 'UnaryExpression':
        if (node.operand) {
          children.push({ node: node.operand });
        }
        break;
    }

    return children;
  }

  // Highlight a node during execution
  highlightNode(node) {
    // Remove previous highlight
    this.container.querySelectorAll('.ast-executing').forEach(el => {
      el.classList.remove('ast-executing');
    });

    // Add highlight to current node
    const element = this.nodeElements.get(node);
    if (element) {
      element.classList.add('ast-executing');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Clear all highlights
  clearHighlights() {
    this.container.querySelectorAll('.ast-executing').forEach(el => {
      el.classList.remove('ast-executing');
    });
  }

  // Clear the container
  clear() {
    this.container.innerHTML = '';
    this.nodeElements.clear();
  }
}
