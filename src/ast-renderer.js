// AST Renderer - Visual tree display for Abstract Syntax Trees

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
    const tree = this.renderNode(ast, 0);
    wrapper.appendChild(tree);
    this.container.appendChild(wrapper);
  }

  // Render a single node and its children
  renderNode(node, depth) {
    const div = document.createElement('div');
    div.className = `ast-node ast-${node.type.toLowerCase()}`;

    // Node header (type + key info)
    const header = this.renderHeader(node);
    div.appendChild(header);

    // Children
    const children = this.getChildren(node);
    if (children.length > 0) {
      const childContainer = document.createElement('div');
      childContainer.className = 'ast-children';

      // Add click handler for collapse/expand
      header.addEventListener('click', () => {
        div.classList.toggle('ast-collapsed');
      });
      header.style.cursor = 'pointer';

      // Add toggle indicator
      const toggle = document.createElement('span');
      toggle.className = 'ast-toggle';
      toggle.textContent = '\u25BC'; // Down arrow
      header.insertBefore(toggle, header.firstChild);

      for (const child of children) {
        const childWrapper = document.createElement('div');
        childWrapper.className = 'ast-child-wrapper';

        // Add label if present
        if (child.label) {
          const label = document.createElement('span');
          label.className = 'ast-child-label';
          label.textContent = child.label + ': ';
          childWrapper.appendChild(label);
        }

        childWrapper.appendChild(this.renderNode(child.node, depth + 1));
        childContainer.appendChild(childWrapper);
      }
      div.appendChild(childContainer);
    }

    return div;
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
          children.push({ label: 'value', node: node.value });
        }
        break;

      case 'AssignStatement':
        if (node.value) {
          children.push({ label: 'value', node: node.value });
        }
        break;

      case 'PrintStatement':
        if (node.value) {
          children.push({ label: 'value', node: node.value });
        }
        break;

      case 'ExpressionStatement':
        if (node.expression) {
          children.push({ node: node.expression });
        }
        break;

      case 'IfStatement':
        if (node.condition) {
          children.push({ label: 'condition', node: node.condition });
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
          children.push({ label: 'condition', node: node.condition });
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
          children.push({ label: 'left', node: node.left });
        }
        if (node.right) {
          children.push({ label: 'right', node: node.right });
        }
        break;

      // Leaf nodes: Identifier, NumberLiteral, StringLiteral, BooleanLiteral
      // These have no children
    }

    return children;
  }

  // Render node header with type and summary
  renderHeader(node) {
    const header = document.createElement('div');
    header.className = 'ast-header';

    const typeSpan = document.createElement('span');
    typeSpan.className = 'ast-type';
    typeSpan.textContent = node.type;
    header.appendChild(typeSpan);

    // Add value/summary info
    const valueSpan = document.createElement('span');
    valueSpan.className = 'ast-value';

    switch (node.type) {
      case 'LetStatement':
        valueSpan.textContent = `(${node.name})`;
        break;
      case 'AssignStatement':
        valueSpan.textContent = `(${node.name})`;
        break;
      case 'Identifier':
        valueSpan.textContent = `"${node.name}"`;
        break;
      case 'NumberLiteral':
        valueSpan.textContent = node.value;
        break;
      case 'StringLiteral':
        valueSpan.textContent = `"${node.value}"`;
        break;
      case 'BooleanLiteral':
        valueSpan.textContent = node.value;
        break;
      case 'BinaryExpression':
        valueSpan.textContent = `(${node.operator})`;
        break;
    }

    if (valueSpan.textContent) {
      header.appendChild(valueSpan);
    }

    return header;
  }
}
