/**
 * REAN Admin Portal - Sidebar Component
 * =======================================
 */

// SVG Icons
const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M9 3v6l-5 8.5a2 2 0 001.7 3h12.6a2 2 0 001.7-3L15 9V3"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 117 -7l7 7a4.95 4.95 0 11-7 7z"/><path d="M8.5 8.5l7 7"/></svg>',
  layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  'check-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  'message-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
};

// Sidebar component
class Sidebar {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('sidebar');
    this.currentPage = options.currentPage || '';
    this.user = options.user || { name: 'User', role: 'Admin', initials: 'U' };
    this.isCollapsed = false;
    this.openMenus = new Set();
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-logo">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #3359ff, #ff6b3d); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span>REAN Admin</span>
        </a>
        <button class="sidebar-toggle" id="sidebarToggle">
          ${icons.menu}
        </button>
      </div>
      
      <nav class="sidebar-nav">
        ${this.renderNavigation()}
      </nav>
      
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${this.user.initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${this.user.name}</div>
          <div class="sidebar-user-role">${this.user.role}</div>
        </div>
      </div>
    `;
  }
  
  renderNavigation() {
    const menu = [
      {
        section: 'Main',
        items: [
          { name: 'Home', icon: 'home', href: 'dashboard.html' },
          { name: 'Analytics', icon: 'chart', href: 'analytics.html' }
        ]
      },
      {
        section: 'Administration',
        items: [
          { name: 'Tenants', icon: 'building', href: 'tenants.html' },
          { name: 'Users', icon: 'users', href: 'users.html', badge: '5' },
          { name: 'User Roles', icon: 'shield', href: '#' },
          { name: 'Settings', icon: 'settings', href: 'tenant-settings.html' }
        ]
      },
      {
        section: 'Clinical',
        items: [
          { 
            name: 'Assessments', 
            icon: 'clipboard', 
            href: 'assessment-templates.html',
            children: [
              { name: 'Templates', icon: 'file-text', href: 'assessment-templates.html' },
              { name: 'Nodes', icon: 'layout', href: 'assessment-nodes.html' }
            ]
          },
          { name: 'Lab Records', icon: 'flask', href: 'lab-records.html' },
          { name: 'Symptoms', icon: 'activity', href: 'symptoms.html' },
          { name: 'Drugs', icon: 'pill', href: 'drugs.html' }
        ]
      },
      {
        section: 'Careplan',
        items: [
          { 
            name: 'Careplan', 
            icon: 'heart', 
            href: 'careplan-dashboard.html',
            children: [
              { name: 'Dashboard', icon: 'layout', href: 'careplan-dashboard.html' },
              { name: 'All Plans', icon: 'heart', href: 'careplans.html' },
              { name: 'Assets', icon: 'folder', href: 'careplan-assets.html' },
              { name: 'Schedules', icon: 'tag', href: 'careplan-schedules.html' },
              { name: 'Enrollments', icon: 'check-square', href: 'careplan-enrollments.html' }
            ]
          }
        ]
      },
      {
        section: 'Content',
        items: [
          { name: 'Prompt Templates', icon: 'message-square', href: 'prompt-templates.html' },
          { name: 'Q&A Documents', icon: 'file-text', href: 'qna-documents.html' },
          { name: 'Knowledge Nuggets', icon: 'lightbulb', href: 'knowledge-nuggets.html' }
        ]
      }
    ];
    
    return menu.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.section}</div>
        ${section.items.map(item => this.renderNavItem(item)).join('')}
      </div>
    `).join('');
  }
  
  renderNavItem(item) {
    const isActive = this.currentPage === item.href || 
                    (this.currentPage && item.href && this.currentPage.includes(item.href.replace('.html', '')));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = this.openMenus.has(item.name);
    
    let html = `
      <a href="${item.href}" 
         class="nav-item ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}"
         data-name="${item.name}">
        <span class="nav-item-icon">${icons[item.icon] || ''}</span>
        <span class="nav-item-text">${item.name}</span>
        ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ''}
        ${hasChildren ? `<span class="nav-item-arrow">${icons.chevronRight}</span>` : ''}
      </a>
    `;
    
    if (hasChildren) {
      html += `
        <div class="nav-submenu ${isExpanded ? 'open' : ''}">
          ${item.children.map(child => this.renderNavItem(child)).join('')}
        </div>
      `;
    }
    
    return html;
  }
  
  bindEvents() {
    // Toggle sidebar collapse
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleCollapse());
    }
    
    // Handle expandable menu items
    this.container.querySelectorAll('.nav-item.has-children').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const name = item.dataset.name;
        if (this.openMenus.has(name)) {
          this.openMenus.delete(name);
          item.classList.remove('expanded');
          item.nextElementSibling?.classList.remove('open');
        } else {
          this.openMenus.add(name);
          item.classList.add('expanded');
          item.nextElementSibling?.classList.add('open');
        }
      });
    });
  }
  
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
  }
}

// Navbar component
class Navbar {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('navbar');
    this.breadcrumbs = options.breadcrumbs || [];
    this.user = options.user || { name: 'User', initials: 'U' };
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="navbar-left">
        <button class="btn btn-icon btn-ghost mobile-menu-toggle" id="mobileMenuToggle" style="display: none;">
          ${icons.menu}
        </button>
        <nav class="navbar-breadcrumb">
          ${this.renderBreadcrumbs()}
        </nav>
      </div>
      
      <div class="navbar-right">
        <div class="navbar-search">
          <span class="navbar-search-icon">${icons.search}</span>
          <input type="text" placeholder="Search..." />
        </div>
        
        <button class="navbar-icon-btn" id="themeToggle" title="Toggle theme">
          ${icons.sun}
        </button>
        
        <button class="navbar-icon-btn" title="Notifications">
          ${icons.bell}
          <span class="badge"></span>
        </button>
        
        <div class="navbar-user" id="userMenu">
          <div class="navbar-user-avatar">${this.user.initials}</div>
          <span class="navbar-user-name">${this.user.name}</span>
          <span>${icons.chevronDown}</span>
        </div>
      </div>
    `;
  }
  
  renderBreadcrumbs() {
    if (this.breadcrumbs.length === 0) {
      return '<span class="navbar-breadcrumb-current">Dashboard</span>';
    }
    
    return this.breadcrumbs.map((crumb, index) => {
      const isLast = index === this.breadcrumbs.length - 1;
      if (isLast) {
        return `<span class="navbar-breadcrumb-current">${crumb.name}</span>`;
      }
      return `
        <a href="${crumb.href}">${crumb.name}</a>
        <span class="navbar-breadcrumb-separator">/</span>
      `;
    }).join('');
  }
  
  bindEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'light' ? icons.sun : icons.moon;
      });
      
      // Set initial icon based on theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeToggle.innerHTML = savedTheme === 'light' ? icons.sun : icons.moon;
    }
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('mobile-open');
      });
    }
    
    // User menu (placeholder for dropdown)
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
      userMenu.addEventListener('click', () => {
        // Could open a dropdown here
        console.log('User menu clicked');
      });
    }
  }
}

// Initialize sidebar and navbar when DOM is ready
function initializeLayout(options = {}) {
  const sidebar = new Sidebar({
    container: document.getElementById('sidebar'),
    currentPage: options.currentPage || window.location.pathname.split('/').pop(),
    user: options.user || currentUser
  });
  
  const navbar = new Navbar({
    container: document.getElementById('navbar'),
    breadcrumbs: options.breadcrumbs || [],
    user: options.user || currentUser
  });
  
  return { sidebar, navbar };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Sidebar, Navbar, initializeLayout, icons };
}
