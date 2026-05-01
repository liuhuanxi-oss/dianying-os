/**
 * 店赢OS - 认证与权限管理模块
 * 管理登录状态、角色权限控制
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

// ============================================
// 菜单权限配置
// ============================================

// 平台管理员 - 全部54个功能
const ADMIN_PERMISSIONS = null; // null表示全部权限

// 区域运营 - 35个功能
const OPERATOR_PERMISSIONS = [
  // 数据洞察（全部）
  'overview', 'industry-report', 'ai-stats', 'churn-warning',
  // 商家管理（全部）
  'merchants', 'merchant-detail', 'merchant-upgrade', 'merchant-permission', 'merchant-audit',
  // 代理商体系（全部）
  'agents', 'agent-merchants', 'agent-commission', 'service-providers', 'agent-dashboard',
  // 业务人员（全部）
  'sales', 'customer-assign', 'sales-performance', 'visit-records',
  // 财务中心（部分）
  'revenue', 'billing',
  // 支付交易（全部）
  'payment-channels', 'transactions', 'fee-config', 'split-payment', 'reconciliation',
  // 客户成功（全部）
  'onboarding', 'health-score', 'renewal', 'upgrade-funnel', 'wake-up',
  // 渠道增长（全部）
  'channel-analysis', 'invite-fission', 'trial', 'partners',
  // 客服支持（全部）
  'tickets', 'faq', 'satisfaction',
  // 运营报告（内容运营部分）
  'announcements', 'activities'
];

// 门店老板 - 约15个功能
const OWNER_PERMISSIONS = [
  // 数据洞察
  'overview', 'industry-report', 'ai-stats',
  // 商家管理（我的门店）
  'merchants', 'merchant-detail', 'merchant-upgrade', 'merchant-audit',
  // 交易记录
  'transactions', 'billing',
  // 支付交易
  'payment-channels', 'fee-config',
  // 运营活动
  'activities',
  // 客户成功
  'health-score', 'tickets'
];

// ============================================
// 认证管理类
// ============================================
class AuthManager {
  constructor() {
    this.STORAGE_KEY = 'dianyingos_user';
    this.currentUser = null;
    this.init();
  }

  init() {
    // 从localStorage恢复登录状态
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.logout();
      }
    }
  }

  // 模拟用户数据
  getMockUsers() {
    return {
      'admin': { password: 'admin123', role: ROLES.ADMIN, name: '系统管理员' },
      'operator': { password: 'operator123', role: ROLES.OPERATOR, name: '张运营' },
      'owner': { password: 'owner123', role: ROLES.OWNER, name: '李老板' }
    };
  }

  // 登录
  login(username, password) {
    return new Promise((resolve, reject) => {
      // 模拟异步验证
      setTimeout(() => {
        const users = this.getMockUsers();
        const user = users[username];

        // 演示环境：用户名正确即可，密码随意填写
        if (user) {
          const loginData = {
            username: username,
            name: user.name,
            role: user.role,
            roleConfig: ROLE_CONFIG[user.role],
            loginTime: new Date().toISOString()
          };

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loginData));
          this.currentUser = loginData;
          resolve(loginData);
        } else {
          reject(new Error('用户名不存在，请使用：admin / operator / owner'));
        }
      }, 800);
    });
  }

  // 快速角色登录（演示用）
  quickLogin(role) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roleNames = {
          [ROLES.ADMIN]: '超级管理员',
          [ROLES.OPERATOR]: '张运营',
          [ROLES.OWNER]: '李老板'
        };

        const loginData = {
          username: role,
          name: roleNames[role],
          role: role,
          roleConfig: ROLE_CONFIG[role],
          loginTime: new Date().toISOString(),
          quickLogin: true
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loginData));
        this.currentUser = loginData;
        resolve(loginData);
      }, 500);
    });
  }

  // 登出
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser = null;
    window.location.href = 'login.html';
  }

  // 检查是否已登录
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 检查权限
  hasPermission(menuId) {
    if (!this.currentUser) return false;
    
    const { role } = this.currentUser;
    
    // 平台管理员拥有全部权限
    if (role === ROLES.ADMIN) return true;
    
    // 根据角色获取权限列表
    let permissions;
    switch (role) {
      case ROLES.OPERATOR:
        permissions = OPERATOR_PERMISSIONS;
        break;
      case ROLES.OWNER:
        permissions = OWNER_PERMISSIONS;
        break;
      default:
        return false;
    }
    
    return permissions.includes(menuId);
  }

  // 获取当前角色的菜单配置
  getFilteredMenuConfig() {
    if (!this.currentUser) return [];
    
    const { role } = this.currentUser;
    
    // 平台管理员返回全部菜单
    if (role === ROLES.ADMIN) {
      return window.menuConfig || [];
    }
    
    // 根据角色过滤菜单
    let allowedIds;
    switch (role) {
      case ROLES.OPERATOR:
        allowedIds = OPERATOR_PERMISSIONS;
        break;
      case ROLES.OWNER:
        allowedIds = OWNER_PERMISSIONS;
        break;
      default:
        return [];
    }
    
    // 过滤菜单配置
    const filteredConfig = [];
    const menuConfig = window.menuConfig || [];
    
    menuConfig.forEach(section => {
      const filteredItems = section.items.filter(item => allowedIds.includes(item.id));
      if (filteredItems.length > 0) {
        filteredConfig.push({
          ...section,
          items: filteredItems
        });
      }
    });
    
    return filteredConfig;
  }

  // 切换角色（演示用）
  switchRole(role) {
    if (!ROLE_CONFIG[role]) return false;
    
    const roleNames = {
      [ROLES.ADMIN]: '超级管理员',
      [ROLES.OPERATOR]: '张运营',
      [ROLES.OWNER]: '李老板'
    };

    this.currentUser = {
      ...this.currentUser,
      username: role,
      name: roleNames[role],
      role: role,
      roleConfig: ROLE_CONFIG[role],
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    return true;
  }
}

// ============================================
// 创建全局实例
// ============================================
const Auth = new AuthManager();

// ============================================
// 登录页面控制器
// ============================================
const LoginController = {
  init() {
    // 检查是否已登录
    if (Auth.isLoggedIn()) {
      // 已登录则直接跳转
      window.location.href = 'admin.html';
      return;
    }
    
    this.bindEvents();
    this.initIcons();
  },

  bindEvents() {
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // 密码可见性切换
    const toggleBtn = document.getElementById('passwordToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.togglePassword());
    }

    // 快速角色登录
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        this.handleQuickLogin(role);
      });
    });

    // 回车键登录
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !Auth.isLoggedIn()) {
        this.handleLogin();
      }
    });
  },

  initIcons() {
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  togglePassword() {
    const input = document.getElementById('password');
    const icon = document.querySelector('#passwordToggle i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      icon.setAttribute('data-lucide', 'eye');
    }
    
    lucide.createIcons();
  },

  showError(message) {
    const container = document.getElementById('errorContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-message">
        <i data-lucide="alert-circle"></i>
        <span>${message}</span>
      </div>
    `;
    lucide.createIcons();
    
    // 3秒后移除
    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  },

  showLoading(isLoading) {
    const btn = document.querySelector('.btn-login');
    if (!btn) return;
    
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = '<span style="opacity:0.7">登录中...</span>';
    } else {
      btn.disabled = false;
      btn.innerHTML = '登 录';
    }
  },

  async handleLogin() {
    const username = document.getElementById('username')?.value?.trim();
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
      this.showError('请输入用户名和密码');
      return;
    }

    this.showLoading(true);

    try {
      await Auth.login(username, password);
      this.showSuccess();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  },

  async handleQuickLogin(role) {
    const btn = document.querySelector(`.role-btn[data-role="${role}"]`);
    if (btn) {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 150);
    }

    await Auth.quickLogin(role);
    this.showSuccess();
  },

  showSuccess() {
    const user = Auth.getCurrentUser();
    
    // 创建成功动画
    const overlay = document.createElement('div');
    overlay.className = 'login-success';
    overlay.innerHTML = `
      <div class="login-success-content">
        <div class="success-icon">
          <i data-lucide="check-circle"></i>
        </div>
        <div class="success-text">登录成功</div>
        <div class="success-role">欢迎回来，${user.name}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons();

    // 1.5秒后跳转
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1500);
  }
};

// ============================================
// 管理后台权限控制器
// ============================================
const AdminController = {
  init() {
    // 检查登录状态
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    this.user = Auth.getCurrentUser();
    this.renderUserInfo();
    this.renderSidebar();
    this.bindEvents();
  },

  renderUserInfo() {
    // 更新侧边栏用户信息
    const adminName = document.querySelector('.admin-name');
    const adminRole = document.querySelector('.admin-role');
    const adminAvatar = document.querySelector('.admin-avatar i');
    
    if (adminName) adminName.textContent = this.user.name;
    if (adminRole) adminRole.textContent = this.user.roleConfig.displayName;
    if (adminAvatar) {
      adminAvatar.setAttribute('data-lucide', this.user.roleConfig.icon);
    }

    // 添加用户菜单到顶部导航
    this.renderUserMenu();
  },

  renderUserMenu() {
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight) return;

    // 创建用户下拉菜单
    const userMenuHTML = `
      <div class="user-dropdown" id="userDropdown">
        <button class="user-dropdown-btn" id="userDropdownBtn">
          <div class="user-avatar-mini" style="background: ${this.user.roleConfig.color}20; color: ${this.user.roleConfig.color};">
            <i data-lucide="${this.user.roleConfig.icon}"></i>
          </div>
          <span class="user-name-mini">${this.user.name}</span>
          <span class="user-role-badge" style="background: ${this.user.roleConfig.color}20; color: ${this.user.roleConfig.color};">
            ${this.user.roleConfig.name}
          </span>
          <i data-lucide="chevron-down" style="width:14px;height:14px;margin-left:4px;"></i>
        </button>
        <div class="user-dropdown-menu" id="userDropdownMenu">
          <div class="dropdown-header">
            <div class="dropdown-user-name">${this.user.name}</div>
            <div class="dropdown-user-role" style="color: ${this.user.roleConfig.color};">
              ${this.user.roleConfig.name}
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-section-title">切换角色（演示）</div>
          <button class="dropdown-item" data-action="switch" data-role="admin">
            <i data-lucide="shield-check"></i>
            <span>平台管理员</span>
            ${this.user.role === ROLES.ADMIN ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : ''}
          </button>
          <button class="dropdown-item" data-action="switch" data-role="operator">
            <i data-lucide="map-pin"></i>
            <span>区域运营</span>
            ${this.user.role === ROLES.OPERATOR ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : ''}
          </button>
          <button class="dropdown-item" data-action="switch" data-role="owner">
            <i data-lucide="store"></i>
            <span>门店老板</span>
            ${this.user.role === ROLES.OWNER ? '<i data-lucide="check" style="margin-left:auto;color:var(--success);"></i>' : ''}
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout-item" data-action="logout">
            <i data-lucide="log-out"></i>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    `;

    // 在消息按钮前插入
    const messageBtn = topbarRight.querySelector('.topbar-btn[title="消息"]');
    if (messageBtn) {
      topbarRight.insertAdjacentHTML('beforeend', userMenuHTML);
    }

    // 添加下拉菜单样式
    this.addDropdownStyles();
    lucide.createIcons();
  },

  addDropdownStyles() {
    if (document.getElementById('userDropdownStyle')) return;

    const style = document.createElement('style');
    style.id = 'userDropdownStyle';
    style.textContent = `
      .user-dropdown {
        position: relative;
        margin-left: 8px;
      }
      
      .user-dropdown-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        color: var(--text);
        cursor: pointer;
        transition: var(--transition);
      }
      
      .user-dropdown-btn:hover {
        border-color: var(--border-light);
        background: var(--bg-card-hover);
      }
      
      .user-avatar-mini {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .user-avatar-mini i {
        width: 16px;
        height: 16px;
      }
      
      .user-name-mini {
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .user-role-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .user-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 220px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 8px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        z-index: 1000;
      }
      
      .user-dropdown.open .user-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .dropdown-header {
        padding: 12px;
      }
      
      .dropdown-user-name {
        font-weight: 600;
        color: var(--text);
      }
      
      .dropdown-user-role {
        font-size: 0.8rem;
        margin-top: 4px;
      }
      
      .dropdown-divider {
        height: 1px;
        background: var(--border);
        margin: 8px 0;
      }
      
      .dropdown-section-title {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 8px 12px 4px;
      }
      
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        background: none;
        border: none;
        border-radius: var(--radius);
        color: var(--text-secondary);
        font-size: 0.85rem;
        cursor: pointer;
        transition: var(--transition);
        text-align: left;
      }
      
      .dropdown-item:hover {
        background: var(--bg-card-hover);
        color: var(--text);
      }
      
      .dropdown-item i:first-child {
        width: 16px;
        height: 16px;
        color: var(--text-muted);
      }
      
      .dropdown-item:hover i:first-child {
        color: var(--text-secondary);
      }
      
      .logout-item:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      
      .logout-item:hover i {
        color: var(--danger);
      }
      
      @media (max-width: 768px) {
        .user-name-mini {
          display: none;
        }
        
        .user-dropdown-btn {
          padding: 6px 8px;
        }
      }
    `;
    document.head.appendChild(style);
  },

  renderSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    if (!sidebarNav) return;

    const menuConfig = Auth.getFilteredMenuConfig();
    
    if (menuConfig.length === 0) {
      sidebarNav.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">暂无菜单权限</div>';
      return;
    }

    let html = '';
    menuConfig.forEach(section => {
      html += `
        <div class="nav-section">
          <div class="nav-section-header">
            <i data-lucide="${section.icon}"></i>
            <span>${section.section}</span>
          </div>
          <div class="nav-section-items">
            ${section.items.map(item => `
              <a href="#" class="nav-item" data-page="${item.id}">
                <i data-lucide="${item.icon}"></i>
                <span>${item.name}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    });

    sidebarNav.innerHTML = html;
    lucide.createIcons();

    // 绑定菜单点击事件
    sidebarNav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (window.App && window.App.navigateTo) {
          App.navigateTo(page);
        }
      });
    });
  },

  bindEvents() {
    // 用户下拉菜单
    const dropdownBtn = document.getElementById('userDropdownBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (dropdownBtn && userDropdown) {
      dropdownBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('open');
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
          userDropdown.classList.remove('open');
        }
      });

      // 下拉菜单项点击
      userDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          const role = item.dataset.role;

          if (action === 'logout') {
            Auth.logout();
          } else if (action === 'switch' && role) {
            this.handleRoleSwitch(role);
          }
        });
      });
    }
  },

  async handleRoleSwitch(role) {
    // 关闭下拉菜单
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) userDropdown.classList.remove('open');

    // 切换角色
    Auth.switchRole(role);
    
    // 重新加载管理后台
    window.location.reload();
  }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // 根据页面类型初始化
  if (document.getElementById('loginForm')) {
    LoginController.init();
  } else if (document.getElementById('sidebarNav')) {
    AdminController.init();
  }
});
