/**
 * 店赢OS - 认证与权限管理模块 v2.0
 * 统一JWT认证、角色路由、token管理
 */

// ============================================
// 角色定义
// ============================================
const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  OWNER: 'owner'
};

const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: '平台管理员',
    displayName: '超级管理员',
    icon: 'shield-check',
    color: '#8b92e3',
    description: '完整权限，可管理所有功能模块'
  },
  [ROLES.OPERATOR]: {
    id: ROLES.OPERATOR,
    name: '区域运营',
    displayName: '运营总监',
    icon: 'map-pin',
    color: '#00b8cc',
    description: '运营视角，监控区域商户与数据'
  },
  [ROLES.OWNER]: {
    id: ROLES.OWNER,
    name: '门店老板',
    displayName: '门店负责人',
    icon: 'store',
    color: '#10b981',
    description: '门店视角，管理本店经营数据'
  }
};

// 角色 → 目标页面映射
const ROLE_PAGE = {
  'admin':    'admin.html',
  'agent':    'agent.html',
  'merchant': 'merchant.html'
};

// 角色 → localStorage key前缀
const ROLE_STORAGE = {
  'admin':    'dyos_admin',
  'agent':    'dyos_agent',
  'merchant': 'dyos_merchant'
};

// ============================================
// 菜单权限配置
// ============================================

// 平台管理员 - 全部54个功能
const ADMIN_PERMISSIONS = null; // null表示全部权限

// 区域运营 - 35个功能
const OPERATOR_PERMISSIONS = [
  'overview', 'industry-report', 'ai-stats', 'churn-warning',
  'merchants', 'merchant-detail', 'merchant-upgrade', 'merchant-permission', 'merchant-audit',
  'agents', 'agent-merchants', 'agent-commission', 'service-providers', 'agent-dashboard',
  'sales', 'customer-assign', 'sales-performance', 'visit-records',
  'revenue', 'billing',
  'payment-channels', 'transactions', 'fee-config', 'split-payment', 'reconciliation',
  'onboarding', 'health-score', 'renewal', 'upgrade-funnel', 'wake-up',
  'channel-analysis', 'invite-fission', 'trial', 'partners',
  'tickets', 'faq', 'satisfaction',
  'announcements', 'activities'
];

// 门店老板 - 约15个功能
const OWNER_PERMISSIONS = [
  'overview', 'industry-report', 'ai-stats',
  'merchants', 'merchant-detail', 'merchant-upgrade', 'merchant-audit',
  'transactions', 'billing',
  'payment-channels', 'fee-config',
  'activities',
  'health-score', 'tickets'
];

// ============================================
// 认证管理类
// ============================================
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentToken = null;
    this.currentRole = null;
    this.init();
  }

  init() {
    // 从当前页面类型推断角色，从对应localStorage恢复
    var page = this._detectPage();
    if (page) {
      this.currentRole = page;
      var key = ROLE_STORAGE[page];
      if (key) {
        this.currentToken = localStorage.getItem(key + '_token') || '';
        var raw = localStorage.getItem(key + '_user');
        if (raw) {
          try { this.currentUser = JSON.parse(raw); } catch(e) {}
        }
      }
    }
  }

  _detectPage() {
    var p = window.location.pathname.split('/').pop();
    if (p === 'platform.html' || p === 'admin.html' || p === 'dashboard-platform.html') return 'admin';
    if (p === 'agent.html') return 'agent';
    if (p === 'merchant.html') return 'merchant';
    return null;
  }

  // 调用真实后端API登录
  login(username, password) {
    var self = this;
    return fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    }).then(function(r) {
      return r.json().then(function(d) {
        if (d.code === 0 && d.data && d.data.token) {
          return self._setSession(d.data.token, d.data.user);
        }
        throw new Error(d.message || '登录失败');
      });
    });
  }

  _setSession(token, user) {
    this.currentToken = token;
    this.currentUser = user;
    this.currentRole = user.role;
    var key = ROLE_STORAGE[user.role] || 'dyos_admin';
    localStorage.setItem(key + '_token', token);
    localStorage.setItem(key + '_user', JSON.stringify(user));
    return user;
  }

  // 登出：清除当前角色存储
  logout() {
    var key = ROLE_STORAGE[this.currentRole] || 'dyos_admin';
    localStorage.removeItem(key + '_token');
    localStorage.removeItem(key + '_user');
    this.currentToken = '';
    this.currentUser = null;
    this.currentRole = null;
    window.location.href = 'login.html';
  }

  // 检查是否已登录（不自动登录）
  isLoggedIn() {
    return !!(this.currentToken && this.currentUser);
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 检查权限
  hasPermission(menuId) {
    if (!this.currentUser) return false;
    var role = this.currentUser.role;
    if (role === ROLES.ADMIN) return true;
    var permissions;
    switch (role) {
      case ROLES.OPERATOR: permissions = OPERATOR_PERMISSIONS; break;
      case ROLES.OWNER:    permissions = OWNER_PERMISSIONS; break;
      default: return false;
    }
    return permissions.includes(menuId);
  }

  // 获取当前角色的菜单配置
  getFilteredMenuConfig() {
    if (!this.currentUser) return [];
    var role = this.currentUser.role;
    if (role === ROLES.ADMIN) return window.menuConfig || [];
    var allowedIds;
    switch (role) {
      case ROLES.OPERATOR: allowedIds = OPERATOR_PERMISSIONS; break;
      case ROLES.OWNER:    allowedIds = OWNER_PERMISSIONS; break;
      default: return [];
    }
    var filteredConfig = [];
    var menuConfig = window.menuConfig || [];
    menuConfig.forEach(function(section) {
      var filteredItems = section.items.filter(function(item) { return allowedIds.includes(item.id); });
      if (filteredItems.length > 0) {
        filteredConfig.push({ name: section.name, icon: section.icon, items: filteredItems });
      }
    });
    return filteredConfig;
  }

  // 切换角色
  switchRole(role) {
    if (!ROLE_CONFIG[role]) return false;
    var roleNames = {};
    roleNames[ROLES.ADMIN] = '超级管理员';
    roleNames[ROLES.OPERATOR] = '张运营';
    roleNames[ROLES.OWNER] = '李老板';
    this.currentUser = Object.assign({}, this.currentUser, {
      username: role,
      name: roleNames[role],
      role: role,
      roleConfig: ROLE_CONFIG[role]
    });
    this.currentRole = role;
    var key = ROLE_STORAGE[role] || 'dyos_admin';
    localStorage.setItem(key + '_user', JSON.stringify(this.currentUser));
    return true;
  }
}

// 全局实例
var Auth = new AuthManager();

// ============================================
// 登录页面控制器
// ============================================
var LoginController = {
  init: function() {
    // 如果已登录，基于角色跳转
    if (Auth.isLoggedIn()) {
      var target = ROLE_PAGE[Auth.currentUser.role] || 'platform.html';
      window.location.href = target;
      return;
    }
    this.bindEvents();
    this.initIcons();
  },

  bindEvents: function() {
    var self = this;
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        self.handleLogin();
      });
    }

    var toggleBtn = document.getElementById('passwordToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() { self.togglePassword(); });
    }

    // 快速角色登录 → 调用真实API
    document.querySelectorAll('.role-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var role = btn.dataset.role;
        self.handleQuickLogin(role);
      });
    });

    document.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !Auth.isLoggedIn()) {
        self.handleLogin();
      }
    });
  },

  initIcons: function() {
    if (window.lucide) { lucide.createIcons(); }
  },

  togglePassword: function() {
    var input = document.getElementById('password');
    var icon = document.querySelector('#passwordToggle i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  },

  showError: function(message) {
    var container = document.getElementById('errorContainer');
    if (!container) return;
    container.innerHTML = '<div class="error-message"><i data-lucide="alert-circle"></i><span>' + message + '</span></div>';
    lucide.createIcons();
    setTimeout(function() { container.innerHTML = ''; }, 3000);
  },

  showLoading: function(isLoading) {
    var btn = document.querySelector('.btn-login');
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = '<span style="opacity:0.7">登录中...</span>';
    } else {
      btn.disabled = false;
      btn.innerHTML = '登 录';
    }
  },

  handleLogin: function() {
    var self = this;
    var username = (document.getElementById('username') || {}).value || '';
    username = username.trim();
    var password = (document.getElementById('password') || {}).value || '';

    if (!username || !password) {
      this.showError('请输入用户名和密码');
      return;
    }

    this.showLoading(true);

    Auth.login(username, password).then(function(user) {
      self.showLoading(false);
      self.redirectByRole(user.role);
    }).catch(function(error) {
      self.showLoading(false);
      self.showError(error.message || '登录失败，请检查用户名和密码');
    });
  },

  handleQuickLogin: function(role) {
    var self = this;
    var btn = document.querySelector('.role-btn[data-role="' + role + '"]');
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      setTimeout(function() { btn.style.transform = ''; }, 150);
    }
    // 快速登录：用户名=角色名，密码=123456
    Auth.login(role, '123456').then(function(user) {
      self.redirectByRole(user.role);
    }).catch(function(error) {
      self.showError(error.message || '快速登录失败，请手动输入账号密码');
    });
  },

  redirectByRole: function(role) {
    var target = ROLE_PAGE[role] || 'platform.html';
    // 短暂过渡动画
    var overlay = document.createElement('div');
    overlay.className = 'login-success';
    overlay.innerHTML = '<div class="login-success-content"><div class="success-icon"><i data-lucide="check-circle"></i></div><div class="success-text">登录成功</div><div class="success-role">正在跳转...</div></div>';
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();
    setTimeout(function() {
      window.location.href = target;
    }, 800);
  }
};

// ============================================
// 管理后台权限控制器
// ============================================
var AdminController = {
  init: function() {
    // 检查登录状态 — 未登录跳到登录页
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    this.user = Auth.getCurrentUser();
    this.renderUserInfo();
    this.bindEvents();
  },

  renderUserInfo: function() {
    var adminName = document.querySelector('.admin-name');
    var adminRole = document.querySelector('.admin-role');
    var adminAvatar = document.querySelector('.admin-avatar i');

    if (adminName) adminName.textContent = this.user.name;
    if (adminRole) adminRole.textContent = (this.user.roleConfig || ROLE_CONFIG[this.user.role] || {}).displayName || this.user.role;
    if (adminAvatar && this.user.roleConfig) {
      adminAvatar.setAttribute('data-lucide', this.user.roleConfig.icon);
    }

    this.renderUserMenu();
  },

  renderUserMenu: function() {
    var topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight) return;

    var roleCfg = ROLE_CONFIG[this.user.role] || {};
    var color = roleCfg.color || '#8b92e3';
    var icon = roleCfg.icon || 'user';
    var name = roleCfg.name || this.user.role;

    var userMenuHTML = '<div class="user-dropdown" id="userDropdown">' +
      '<button class="user-dropdown-btn" id="userDropdownBtn">' +
      '<div class="user-avatar-mini" style="background: ' + color + '20; color: ' + color + ';">' +
      '<i data-lucide="' + icon + '"></i></div>' +
      '<span class="user-name-mini">' + this.user.name + '</span>' +
      '<span class="user-role-badge" style="background: ' + color + '20; color: ' + color + ';">' + name + '</span>' +
      '<i data-lucide="chevron-down" style="width:14px;height:14px;margin-left:4px;"></i></button>' +
      '<div class="user-dropdown-menu" id="userDropdownMenu">' +
      '<div class="dropdown-header"><div class="dropdown-user-name">' + this.user.name + '</div>' +
      '<div class="dropdown-user-role" style="color: ' + color + ';">' + name + '</div></div>' +
      '<div class="dropdown-divider"></div>' +
      '<div class="dropdown-section-title">切换角色（演示）</div>' +
      '<button class="dropdown-item" data-action="switch" data-role="admin">' +
      '<i data-lucide="shield-check"></i><span>平台管理员</span>' +
      (this.user.role === ROLES.ADMIN ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : '') + '</button>' +
      '<button class="dropdown-item" data-action="switch" data-role="operator">' +
      '<i data-lucide="map-pin"></i><span>区域运营</span>' +
      (this.user.role === ROLES.OPERATOR ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : '') + '</button>' +
      '<button class="dropdown-item" data-action="switch" data-role="owner">' +
      '<i data-lucide="store"></i><span>门店老板</span>' +
      (this.user.role === ROLES.OWNER ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : '') + '</button>' +
      '<div class="dropdown-divider"></div>' +
      '<button class="dropdown-item logout-item" data-action="logout">' +
      '<i data-lucide="log-out"></i><span>退出登录</span></button></div></div>';

    var messageBtn = topbarRight.querySelector('.topbar-btn[title="消息"]');
    if (messageBtn) {
      topbarRight.insertAdjacentHTML('beforeend', userMenuHTML);
    }
    this.addDropdownStyles();
    if (window.lucide) lucide.createIcons();
  },

  addDropdownStyles: function() {
    if (document.getElementById('userDropdownStyle')) return;
    var style = document.createElement('style');
    style.id = 'userDropdownStyle';
    style.textContent = '.user-dropdown{position:relative;margin-left:8px}' +
      '.user-dropdown-btn{display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);cursor:pointer;transition:var(--transition)}' +
      '.user-dropdown-btn:hover{border-color:var(--border-light);background:var(--bg-card-hover)}' +
      '.user-avatar-mini{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center}' +
      '.user-avatar-mini i{width:16px;height:16px}' +
      '.user-name-mini{font-size:0.85rem;font-weight:500}' +
      '.user-role-badge{font-size:0.7rem;padding:2px 8px;border-radius:4px;font-weight:500}' +
      '.user-dropdown-menu{position:absolute;top:calc(100% + 8px);right:0;width:220px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);padding:8px;opacity:0;visibility:hidden;transform:translateY(-10px);transition:all 0.2s ease;z-index:1000}' +
      '.user-dropdown.open .user-dropdown-menu{opacity:1;visibility:visible;transform:translateY(0)}' +
      '.dropdown-header{padding:12px}' +
      '.dropdown-user-name{font-weight:600;color:var(--text)}' +
      '.dropdown-user-role{font-size:0.8rem;margin-top:4px}' +
      '.dropdown-divider{height:1px;background:var(--border);margin:8px 0}' +
      '.dropdown-section-title{font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:8px 12px 4px}' +
      '.dropdown-item{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:none;border:none;border-radius:var(--radius);color:var(--text-secondary);font-size:0.85rem;cursor:pointer;transition:var(--transition);text-align:left}' +
      '.dropdown-item:hover{background:var(--bg-card-hover);color:var(--text)}' +
      '.dropdown-item i:first-child{width:16px;height:16px;color:var(--text-muted)}' +
      '.dropdown-item:hover i:first-child{color:var(--text-secondary)}' +
      '.logout-item:hover{background:rgba(239,68,68,0.1);color:var(--danger)}' +
      '.logout-item:hover i{color:var(--danger)}' +
      '@media (max-width:768px){.user-name-mini{display:none}.user-dropdown-btn{padding:6px 8px}}';
    document.head.appendChild(style);
  },

  bindEvents: function() {
    var self = this;
    var dropdownBtn = document.getElementById('userDropdownBtn');
    var userDropdown = document.getElementById('userDropdown');

    if (dropdownBtn && userDropdown) {
      dropdownBtn.addEventListener('click', function() {
        userDropdown.classList.toggle('open');
      });
      document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target)) {
          userDropdown.classList.remove('open');
        }
      });
      userDropdown.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var action = item.dataset.action;
          var role = item.dataset.role;
          if (action === 'logout') {
            Auth.logout();
          } else if (action === 'switch' && role) {
            self.handleRoleSwitch(role);
          }
        });
      });
    }
  },

  handleRoleSwitch: function(role) {
    var userDropdown = document.getElementById('userDropdown');
    if (userDropdown) userDropdown.classList.remove('open');
    Auth.switchRole(role);
    var target = ROLE_PAGE[role] || 'platform.html';
    window.location.href = target;
  }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('loginForm')) {
    LoginController.init();
  } else if (document.getElementById('sidebarNav')) {
    AdminController.init();
  }
});
