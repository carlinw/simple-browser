// Simple Interpreter - Modal Base Class
// Reusable modal dialog component

class Modal {
  constructor() {
    this.isOpen = false;
    this.overlay = null;
    this.panel = null;
  }

  // Get the modal title - subclasses override this
  getTitle() {
    return 'Modal';
  }

  // Get the body HTML content - subclasses override this
  getBodyContent() {
    return '';
  }

  // Called after modal is rendered - subclasses can add event handlers
  onAfterRender() {}

  // Open the modal
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
  }

  // Close the modal
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.hide();
  }

  // Toggle open/close
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  // Render the modal
  render() {
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
        <h2>${this.getTitle()}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${this.getBodyContent()}
      </div>
    `;

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    // Add close button handler
    this.panel.querySelector('.modal-close').onclick = () => this.close();

    // Allow subclasses to add their own event handlers
    this.onAfterRender();
  }

  // Remove modal from DOM
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
  module.exports = { Modal };
}
