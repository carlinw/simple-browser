// AST Renderer - Graphical tree display for Abstract Syntax Trees

class ASTRenderer {
  constructor(container) {
    this.container = container;
  }

  // Render the full AST
  render(ast) {
    this.container.innerHTML = '';
    // Store AST as data attribute for testing
    this.container.dataset.ast = JSON.stringify(ast);
    // Create wrapper with ast-tree class
    const wrapper = document.createElement('div');
    wrapper.className = 'ast-tree';
    const tree = this.renderNode(ast);
    wrapper.appendChild(tree);
    this.container.appendChild(wrapper);
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
        return `let<br><strong>${node.name}</strong>`;
      case 'AssignStatement':
        return `assign<br><strong>${node.name}</strong>`;
      case 'PrintStatement':
        return 'print';
      case 'ExpressionStatement':
        return 'expr';
      case 'IfStatement':
        return 'if';
      case 'WhileStatement':
        return 'while';
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
        if (node.value) {
          children.push({ node: node.value });
        }
        break;

      case 'AssignStatement':
        if (node.value) {
          children.push({ node: node.value });
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

      case 'BinaryExpression':
        if (node.left) {
          children.push({ node: node.left });
        }
        if (node.right) {
          children.push({ node: node.right });
        }
        break;
    }

    return children;
  }
}
