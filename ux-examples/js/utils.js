/**
 * REAN Admin Portal - JavaScript Utilities
 * ==========================================
 */

// === Toast Notifications ===
const Toast = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info', duration = 4000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="modal-close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    
    this.container.appendChild(toast);
    
    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 200);
      }, duration);
    }
    
    return toast;
  },
  
  success(message, duration) { return this.show(message, 'success', duration); },
  error(message, duration) { return this.show(message, 'error', duration); },
  warning(message, duration) { return this.show(message, 'warning', duration); },
  info(message, duration) { return this.show(message, 'info', duration); }
};

// === Modal Management ===
const Modal = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },
  
  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },
  
  confirm(options) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${options.title || 'Confirm'}</h3>
            <button class="modal-close" data-action="cancel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>${options.message || 'Are you sure?'}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel">${options.cancelText || 'Cancel'}</button>
            <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">
              ${options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      
      overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'cancel' || e.target === overlay) {
          overlay.remove();
          document.body.style.overflow = '';
          resolve(false);
        } else if (action === 'confirm') {
          overlay.remove();
          document.body.style.overflow = '';
          resolve(true);
        }
      });
    });
  }
};

// === Form Utilities ===
const FormUtils = {
  validate(form) {
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        this.showError(input, 'This field is required');
      } else {
        this.clearError(input);
      }
    });
    
    return isValid;
  },
  
  showError(input, message) {
    input.classList.add('error');
    const existing = input.parentElement.querySelector('.form-error');
    if (existing) existing.remove();
    
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    input.parentElement.appendChild(error);
  },
  
  clearError(input) {
    input.classList.remove('error');
    const error = input.parentElement.querySelector('.form-error');
    if (error) error.remove();
  },
  
  serialize(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    return data;
  }
};

// === Helpers ===
const Helpers = {
  truncate(str, maxLength = 50) {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  },
  
  formatDate(date, format = 'medium') {
    const d = new Date(date);
    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };
    return d.toLocaleDateString('en-US', options[format] || options.medium);
  },
  
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
  }
};

// === Table Utilities ===
const TableUtils = {
  sort(data, key, order = 'asc') {
    return [...data].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  filter(data, searchTerm, keys) {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return keys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  },
  
  paginate(data, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
      items: data.slice(start, end),
      totalPages: Math.ceil(data.length / perPage),
      totalItems: data.length,
      currentPage: page
    };
  }
};

// === Theme Management ===
const Theme = {
  current: localStorage.getItem('theme') || 'light',
  
  init() {
    document.documentElement.setAttribute('data-theme', this.current);
  },
  
  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.current);
    localStorage.setItem('theme', this.current);
  },
  
  set(theme) {
    this.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
};

// === Local Storage Wrapper ===
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  }
};

// === Navigation ===
const Nav = {
  navigateTo(url) {
    window.location.href = url;
  },
  
  reload() {
    window.location.reload();
  },
  
  back() {
    window.history.back();
  }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast, Modal, FormUtils, Helpers, TableUtils, Theme, Storage, Nav };
}
