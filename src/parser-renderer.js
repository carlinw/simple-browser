// Tiny - Parser Tab Renderer
// Renders token lists and scanner state to the Parser tab

class ParserRenderer {
  constructor(container) {
    this.container = container;
  }

  // Render scanning state and tokens during step-through mode
  renderScanState(scanResult, tokens, switchTab) {
    let html = '';

    // Show current scanning info
    html += '<div class="scan-section">\n';
    html += '<div class="scan-header">Scanner State:</div>\n';

    if (scanResult) {
      // Current position
      html += `<div class="scan-line"><span class="scan-label">Line:</span> ${scanResult.line}</div>\n`;
      html += `<div class="scan-line"><span class="scan-label">Column:</span> ${scanResult.column}</div>\n`;
      html += `<div class="scan-line"><span class="scan-label">Character:</span> '${scanResult.charDisplay}'</div>\n`;

      // Current state
      const stateDisplay = scanResult.newState || scanResult.state;
      if (stateDisplay && stateDisplay !== 'IDLE') {
        html += `<div class="scan-line"><span class="scan-label">Building:</span> ${stateDisplay}</div>\n`;
      }

      // Buffer
      if (scanResult.newBuffer || scanResult.buffer) {
        const buf = scanResult.newBuffer || scanResult.buffer;
        if (buf) {
          const displayBuf = buf.replace(/\n/g, '\\n').replace(/ /g, '·');
          html += `<div class="scan-line"><span class="scan-label">Buffer:</span> "${displayBuf}"</div>\n`;
        }
      }

      // Action taken
      html += `<div class="scan-action">${scanResult.action}</div>\n`;
    }

    html += '</div>\n';

    // Show tokens
    html += '<div class="tokens-section">\n';
    html += '<div class="tokens-header">Tokens:</div>\n';

    if (tokens.length === 0) {
      html += '<div class="token-line token-empty">(none yet)</div>\n';
    } else {
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isNew = scanResult && scanResult.tokenEmitted === token;
        const arrow = isNew ? '→ ' : '  ';

        // Determine CSS class based on token type
        let tokenClass = '';
        if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
          tokenClass = 'token-skipped';
        } else if (token.type === 'EOF') {
          tokenClass = 'token-eof';
        }
        if (isNew) {
          tokenClass += ' token-new';
        }

        const pos = `${token.line}:${token.column}`.padEnd(6);
        const type = token.type.padEnd(12);

        let displayValue;
        if (token.type === 'EOF') {
          displayValue = '';
        } else if (token.type === 'WHITESPACE') {
          displayValue = '(skipped)';
        } else if (token.type === 'COMMENT') {
          displayValue = token.raw;
        } else {
          displayValue = typeof token.value === 'string' ? token.value : String(token.value);
        }

        html += `<div class="token-line ${tokenClass}">${arrow}${pos} ${type} ${displayValue}</div>`;
      }
    }

    html += '</div>\n';

    this.container.innerHTML = html;
    if (switchTab) {
      switchTab('tokens');
    }
  }

  // Render static token list with stats and column labels
  renderTokens(tokens, source) {
    let tokensText = '';

    // Count displayable tokens (exclude whitespace and comments)
    const displayableTokens = tokens.filter(t =>
      t.type !== 'WHITESPACE' && t.type !== 'COMMENT'
    );
    const tokenCount = displayableTokens.length;

    // Show character, line, and token counts at top
    const charCount = source.length;
    const lineCount = source.split('\n').length;
    tokensText += `Characters: ${charCount}\n`;
    tokensText += `Lines: ${lineCount}\n`;
    tokensText += `Tokens: ${tokenCount}\n\n`;

    // Column labels (Token is leftmost)
    tokensText += 'Token Line  Col   Type         Value\n';
    tokensText += '───── ────  ────  ───────────  ─────────────────\n';

    let tokenNum = 0;
    for (const token of tokens) {
      if (token.type === 'WHITESPACE' || token.type === 'COMMENT') {
        continue;
      }
      tokenNum++;
      const num = String(tokenNum).padEnd(6);
      if (token.type === 'EOF') {
        const line = String(token.line).padEnd(6);
        const col = String(token.column).padEnd(6);
        tokensText += `${num}${line}${col}EOF\n`;
      } else {
        const line = String(token.line).padEnd(6);
        const col = String(token.column).padEnd(6);
        const type = token.type.padEnd(13);
        const value = typeof token.value === 'string' ? token.value : String(token.value);
        tokensText += `${num}${line}${col}${type}${value}\n`;
      }
    }
    this.container.textContent = tokensText;
  }

  // Clear the container
  clear() {
    this.container.textContent = '';
    this.container.innerHTML = '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParserRenderer };
}
