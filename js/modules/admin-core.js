/**
 * 店赢OS - 管理后台核心模块
 * 包含：全局配置、Mock数据、工具函数、路由、初始化
 */

// ============================================
// 全局变量和配置
// ============================================
const App = {
  currentPage: 'overview',
  sidebarCollapsed: false,
  data: {}
};

// ============================================
// 侧边栏菜单配置
// ============================================
const menuConfig = [
  {
    section: '商家管理',
    icon: 'store',
    items: [
      { id: 'merchants', name: '商家列表', icon: 'list' },
      { id: 'merchant-detail', name: '商家详情', icon: 'building-2' },
      { id: 'merchant-upgrade', name: '开通续费', icon: 'credit-card' },
      { id: 'merchant-permission', name: '权限配置', icon: 'shield' },
      { id: 'merchant-audit', name: '商家审核', icon: 'clipboard-check' }
    ]
  },
  {
    section: '代理商体系',
    icon: 'users',
    items: [
      { id: 'agents', name: '代理商管理', icon: 'user-cog' },
      { id: 'agent-merchants', name: '下级商家', icon: 'git-branch' },
      { id: 'agent-commission', name: '佣金分润', icon: 'wallet' },
      { id: 'service-providers', name: '服务商管理', icon: 'briefcase' },
      { id: 'agent-dashboard', name: '代理商看板', icon: 'bar-chart-3' }
    ]
  },
  {
    section: '业务人员',
    icon: 'user-circle',
    items: [
      { id: 'sales', name: '业务员管理', icon: 'user' },
      { id: 'customer-assign', name: '客户分配', icon: 'user-plus' },
      { id: 'sales-performance', name: '业绩看板', icon: 'trending-up' },
      { id: 'visit-records', name: '跟访记录', icon: 'map-pin' }
    ]
  },
  {
    section: '财务中心',
    icon: 'banknote',
    items: [
      { id: 'revenue', name: '收入总览', icon: 'pie-chart' },
      { id: 'billing', name: '账单管理', icon: 'file-text' },
      { id: 'refund', name: '退款处理', icon: 'rotate-ccw' },
      { id: 'invoice', name: '发票管理', icon: 'receipt' }
    ]
  },
  {
    section: '内容运营',
    icon: 'edit',
    items: [
      { id: 'knowledge-base', name: '知识库管理', icon: 'book-open' },
      { id: 'ai-templates', name: 'AI模板', icon: 'sparkles' },
      { id: 'announcements', name: '公告推送', icon: 'megaphone' },
      { id: 'activities', name: '运营活动', icon: 'gift' }
    ]
  },
  {
    section: '数据洞察',
    icon: 'bar-chart',
    items: [
      { id: 'overview', name: '平台总览', icon: 'layout-dashboard' },
      { id: 'industry-report', name: '行业报告', icon: 'file-bar-chart' },
      { id: 'ai-stats', name: 'AI统计', icon: 'cpu' },
      { id: 'churn-warning', name: '流失预警', icon: 'alert-triangle' }
    ]
  },
  {
    section: '支付交易',
    icon: 'credit-card',
    items: [
      { id: 'payment-channels', name: '通道监控', icon: 'activity' },
      { id: 'transactions', name: '交易流水', icon: 'repeat' },
      { id: 'fee-config', name: '费率配置', icon: 'settings' },
      { id: 'split-payment', name: '分账管理', icon: 'split' },
      { id: 'reconciliation', name: '对账中心', icon: 'check-square' }
    ]
  },
  {
    section: '客户成功',
    icon: 'heart',
    items: [
      { id: 'onboarding', name: 'Onboarding', icon: 'rocket' },
      { id: 'health-score', name: '健康度', icon: 'activity' },
      { id: 'renewal', name: '续费管理', icon: 'refresh-cw' },
      { id: 'upgrade-funnel', name: '升降级', icon: 'arrow-up-circle' },
      { id: 'wake-up', name: '沉默唤醒', icon: 'bell' }
    ]
  },
  {
    section: '渠道增长',
    icon: 'trending-up',
    items: [
      { id: 'channel-analysis', name: '渠道分析', icon: 'target' },
      { id: 'invite-fission', name: '邀请裂变', icon: 'share-2' },
      { id: 'trial', name: '试用管理', icon: 'clock' },
      { id: 'partners', name: '合作伙伴', icon: 'handshake' }
    ]
  },
  {
    section: '客服支持',
    icon: 'headphones',
    items: [
      { id: 'tickets', name: '工单系统', icon: 'ticket' },
      { id: 'faq', name: 'FAQ管理', icon: 'help-circle' },
      { id: 'satisfaction', name: '满意度调研', icon: 'smile' }
    ]
  },
  {
    section: '产品迭代',
    icon: 'package',
    items: [
      { id: 'feature-flags', name: '功能开关', icon: 'toggle-left' },
      { id: 'ab-test', name: 'AB测试', icon: 'flask-conical' },
      { id: 'requirements', name: '需求池', icon: 'inbox' },
      { id: 'version-management', name: '版本管理', icon: 'git-commit' }
    ]
  },
  {
    section: '安全合规',
    icon: 'shield',
    items: [
      { id: 'login-security', name: '登录安全', icon: 'lock' },
      { id: 'data-masking', name: '数据脱敏', icon: 'eye-off' },
      { id: 'compliance', name: '合规审计', icon: 'clipboard-list' }
    ]
  },
  {
    section: '系统设置',
    icon: 'settings',
    items: [
      { id: 'roles', name: '角色权限', icon: 'shield-check' },
      { id: 'operation-logs', name: '操作日志', icon: 'history' },
      { id: 'pricing', name: '定价配置', icon: 'tag' },
      { id: 'notifications', name: '消息通知', icon: 'bell-ring' }
    ]
  }
];

// ============================================
// Mock数据 - 商家
// ============================================
App.data.merchants = [
  { id: 1, name: '北京湘菜馆', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-01-15', expireTime: '2025-01-15', gmv: 1285000, orders: 8560, rating: 4.8, aiUsage: 3240 },
  { id: 2, name: '上海小笼包', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-02-20', expireTime: '2025-02-20', gmv: 856000, orders: 5420, rating: 4.6, aiUsage: 1890 },
  { id: 3, name: '广州茶餐厅', industry: '餐饮', version: '免费版', status: 'active', registerTime: '2024-03-10', expireTime: '2025-03-10', gmv: 320000, orders: 2100, rating: 4.3, aiUsage: 560 },
  { id: 4, name: '深圳火锅店', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-01-05', expireTime: '2025-01-05', gmv: 2150000, orders: 12400, rating: 4.9, aiUsage: 5680 },
  { id: 5, name: '成都串串香', industry: '餐饮', version: '专业版', status: 'expiring', registerTime: '2023-06-01', expireTime: '2024-12-28', gmv: 680000, orders: 4200, rating: 4.5, aiUsage: 1450 },
  { id: 6, name: '杭州奶茶铺', industry: '餐饮', version: '免费版', status: 'active', registerTime: '2024-04-15', expireTime: '2025-04-15', gmv: 180000, orders: 980, rating: 4.2, aiUsage: 280 },
  { id: 7, name: '南京大牌档', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-01-20', expireTime: '2025-01-20', gmv: 1580000, orders: 9200, rating: 4.7, aiUsage: 4120 },
  { id: 8, name: '武汉热干面', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-02-28', expireTime: '2025-02-28', gmv: 520000, orders: 3100, rating: 4.4, aiUsage: 980 },
  { id: 9, name: '重庆小面', industry: '餐饮', version: '免费版', status: 'inactive', registerTime: '2024-05-01', expireTime: '2025-05-01', gmv: 95000, orders: 620, rating: 4.1, aiUsage: 120 },
  { id: 10, name: '西安肉夹馍', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-03-15', expireTime: '2025-03-15', gmv: 450000, orders: 2800, rating: 4.5, aiUsage: 780 }
];

// Mock数据 - 代理商
App.data.agents = [
  { id: 1, name: '华东区代理中心', level: 'diamond', merchants: 156, monthlyGmv: 2850000, status: 'active', joinTime: '2023-01-15' },
  { id: 2, name: '华南区服务中心', level: 'gold', merchants: 98, monthlyGmv: 1680000, status: 'active', joinTime: '2023-03-20' },
  { id: 3, name: '华北运营总部', level: 'diamond', merchants: 203, monthlyGmv: 4200000, status: 'active', joinTime: '2022-11-01' },
  { id: 4, name: '西南代理商联盟', level: 'silver', merchants: 45, monthlyGmv: 520000, status: 'active', joinTime: '2023-06-10' },
  { id: 5, name: '华中代理网络', level: 'gold', merchants: 112, monthlyGmv: 1950000, status: 'active', joinTime: '2023-02-28' },
  { id: 6, name: '东北区服务中心', level: 'silver', merchants: 38, monthlyGmv: 480000, status: 'active', joinTime: '2023-08-15' },
  { id: 7, name: '西北代理体系', level: 'gold', merchants: 67, monthlyGmv: 890000, status: 'active', joinTime: '2023-04-01' },
  { id: 8, name: '港澳台代理中心', level: 'silver', merchants: 28, monthlyGmv: 350000, status: 'inactive', joinTime: '2023-09-20' }
];

// Mock数据 - 业务员
App.data.sales = [
  { id: 1, name: '张伟', phone: '13800138001', region: '华东区', status: 'active', customers: 28, thisMonthSign: 5 },
  { id: 2, name: '李娜', phone: '13800138002', region: '华南区', status: 'active', customers: 35, thisMonthSign: 7 },
  { id: 3, name: '王强', phone: '13800138003', region: '华北区', status: 'active', customers: 42, thisMonthSign: 9 },
  { id: 4, name: '赵敏', phone: '13800138004', region: '西南区', status: 'active', customers: 18, thisMonthSign: 3 },
  { id: 5, name: '刘洋', phone: '13800138005', region: '华中区', status: 'active', customers: 31, thisMonthSign: 6 }
];

// Mock数据 - 财务趋势
App.data.revenueTrend = [
  { month: '2024-01', amount: 1250000 },
  { month: '2024-02', amount: 1380000 },
  { month: '2024-03', amount: 1420000 },
  { month: '2024-04', amount: 1560000 },
  { month: '2024-05', amount: 1680000 },
  { month: '2024-06', amount: 1750000 },
  { month: '2024-07', amount: 1820000 },
  { month: '2024-08', amount: 1950000 },
  { month: '2024-09', amount: 2080000 },
  { month: '2024-10', amount: 2250000 },
  { month: '2024-11', amount: 2380000 },
  { month: '2024-12', amount: 2560000 }
];

// Mock数据 - 交易流水
App.data.transactions = [
  { id: 'TX20241201001', merchant: '北京湘菜馆', amount: 2680, type: 'subscription', status: 'success', time: '2024-12-01 10:25:36' },
  { id: 'TX20241201002', merchant: '上海小笼包', amount: 980, type: 'subscription', status: 'success', time: '2024-12-01 11:48:12' },
  { id: 'TX20241201003', merchant: '深圳火锅店', amount: 5980, type: 'upgrade', status: 'success', time: '2024-12-01 14:32:08' },
  { id: 'TX20241201004', merchant: '广州茶餐厅', amount: 680, type: 'subscription', status: 'pending', time: '2024-12-01 15:18:45' },
  { id: 'TX20241201005', merchant: '成都串串香', amount: 1980, type: 'renewal', status: 'success', time: '2024-12-01 16:05:22' },
  { id: 'TX20241201006', merchant: '杭州奶茶铺', amount: 380, type: 'subscription', status: 'failed', time: '2024-12-01 17:22:11' },
  { id: 'TX20241201007', merchant: '南京大牌档', amount: 5980, type: 'subscription', status: 'success', time: '2024-12-01 18:45:33' },
  { id: 'TX20241201008', merchant: '武汉热干面', amount: 980, type: 'upgrade', status: 'success', time: '2024-12-01 19:12:56' },
  { id: 'TX20241201009', merchant: '重庆小面', amount: 380, type: 'subscription', status: 'success', time: '2024-12-01 20:08:17' },
  { id: 'TX20241201010', merchant: '西安肉夹馍', amount: 980, type: 'renewal', status: 'success', time: '2024-12-01 21:35:42' }
];

// Mock数据 - 工单
App.data.tickets = [
  { id: 'TK202412001', merchant: '北京湘菜馆', type: '技术问题', title: 'AI助手响应缓慢', status: 'open', priority: 'high', createTime: '2024-12-01 10:30', assignee: '张工' },
  { id: 'TK202412002', merchant: '上海小笼包', type: '功能咨询', title: '如何开通数据分析功能', status: 'pending', priority: 'medium', createTime: '2024-12-01 14:15', assignee: '李工' },
  { id: 'TK202412003', merchant: '深圳火锅店', type: '账单问题', title: '发票开具申请', status: 'resolved', priority: 'low', createTime: '2024-11-30 09:20', assignee: '王工' },
  { id: 'TK202412004', merchant: '广州茶餐厅', type: '技术问题', title: '支付接口无法调起', status: 'open', priority: 'high', createTime: '2024-12-02 11:45', assignee: '待分配' },
  { id: 'TK202412005', merchant: '成都串串香', type: '功能建议', title: '希望增加会员积分功能', status: 'pending', priority: 'low', createTime: '2024-12-01 16:30', assignee: '赵工' }
];

// ============================================
// 工具函数
// ============================================
const DOM = {
  _cache: new Map(),
  get(id) {
    if (!this._cache.has(id)) {
      this._cache.set(id, document.getElementById(id));
    }
    return this._cache.get(id);
  },
  refresh(id) {
    this._cache.delete(id);
    return this.get(id);
  },
  clear() {
    this._cache.clear();
  }
};

function debounce(fn, delay = 150) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function createIconsIn(container) {
  if (container) {
    lucide.createIcons({ root: container });
  }
}

const Utils = {
  formatMoney(amount) {
    return '¥' + amount.toLocaleString('zh-CN');
  },

  formatDate(date) {
    if (!date) return '-';
    return date;
  },

  getStatusClass(status) {
    const statusMap = {
      'active': 'success', 'online': 'success', 'published': 'success', 'resolved': 'success',
      'settled': 'success', 'approved': 'success', 'released': 'success',
      'inactive': 'danger', 'offline': 'danger', 'failed': 'danger', 'rejected': 'danger',
      'expiring': 'warning', 'degraded': 'warning', 'pending': 'warning',
      'draft': 'gray', 'evaluating': 'gray', 'scheduled': 'gray'
    };
    return statusMap[status] || 'gray';
  },

  getStatusLabel(status) {
    const labelMap = {
      'active': '正常', 'inactive': '停用', 'online': '在线', 'offline': '离线',
      'degraded': '降级', 'published': '已发布', 'draft': '草稿', 'pending': '待处理',
      'resolved': '已解决', 'open': '待处理', 'approved': '已通过', 'rejected': '已拒绝',
      'expiring': '即将到期', 'settled': '已结算', 'shipped': '已发货', 'issued': '已开票',
      'evaluating': '评估中', 'scheduled': '已排期', 'developing': '开发中', 'released': '已上线',
      'deprecated': '已废弃'
    };
    return labelMap[status] || status;
  },

  getVersionClass(version) {
    const versionMap = { '旗舰版': 'primary', '专业版': 'accent', '免费版': 'gray' };
    return versionMap[version] || 'gray';
  },

  getLevelClass(level) {
    const levelMap = { 'diamond': 'primary', 'gold': 'warning', 'silver': 'gray' };
    return levelMap[level] || 'gray';
  },

  getLevelLabel(level) {
    const levelMap = { 'diamond': '钻石', 'gold': '金牌', 'silver': '银牌' };
    return levelMap[level] || level;
  },

  formatPercent(value) {
    return value.toFixed(1) + '%';
  },

  formatCount(num) {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
  }
};

// ============================================
// Toast通知
// ============================================
const Toast = {
  show(type, title, message) {
    const container = DOM.get('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${icons[type]}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button>
    `;
    container.appendChild(toast);
    createIconsIn(toast);
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  success(title, message) { this.show('success', title, message); },
  error(title, message) { this.show('error', title, message); },
  warning(title, message) { this.show('warning', title, message); },
  info(title, message) { this.show('info', title, message); }
};

// ============================================
// 确认对话框
// ============================================
const ConfirmDialog = {
  _handlers: null,

  show(title, message, onConfirm, isDanger = false) {
    const dialog = DOM.get('confirmDialog');
    if (!dialog) return;
    DOM.get('confirmTitle').textContent = title;
    DOM.get('confirmMessage').textContent = message;
    dialog.classList.add('active');

    const confirmOk = DOM.get('confirmOk');
    const confirmCancel = DOM.get('confirmCancel');

    if (this._handlers) {
      confirmOk.removeEventListener('click', this._handlers.ok);
      confirmCancel.removeEventListener('click', this._handlers.cancel);
    }

    const handlers = {
      ok: () => {
        dialog.classList.remove('active');
        confirmOk.removeEventListener('click', handlers.ok);
        confirmCancel.removeEventListener('click', handlers.cancel);
        this._handlers = null;
        if (onConfirm) onConfirm();
      },
      cancel: () => {
        dialog.classList.remove('active');
        confirmOk.removeEventListener('click', handlers.ok);
        confirmCancel.removeEventListener('click', handlers.cancel);
        this._handlers = null;
      }
    };
    this._handlers = handlers;

    confirmOk.addEventListener('click', handlers.ok, { once: true });
    confirmCancel.addEventListener('click', handlers.cancel, { once: true });
  },
  hide() {
    DOM.get('confirmDialog')?.classList.remove('active');
  }
};

// ============================================
// 模态框
// ============================================
const Modal = {
  show(content, options = {}) {
    const overlay = DOM.get('modalOverlay');
    const container = DOM.get('modalContainer');
    if (!overlay || !container) return;
    container.innerHTML = content;
    if (options.large) container.classList.add('modal-lg');
    if (options.extraLarge) container.classList.add('modal-xl');
    overlay.classList.add('active');
    createIconsIn(container);
    overlay.onclick = (e) => { if (e.target === overlay) this.hide(); };
    return container;
  },
  hide() {
    DOM.get('modalOverlay')?.classList.remove('active');
  }
};

// ============================================
// 分页组件
// ============================================
const Pagination = {
  render({ containerId, current, total, onPageChange }) {
    const container = DOM.get(containerId);
    if (!container) return;

    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    let html = `<div class="pagination-info">共 ${total} 条</div><div class="pagination-controls">`;
    html += `<button class="pagination-btn" ${current === 1 ? 'disabled' : ''} onclick="${onPageChange}(${current - 1})"><i data-lucide="chevron-left"></i></button>`;

    if (start > 1) {
      html += `<button class="pagination-btn" onclick="${onPageChange}(1)">1</button>`;
      if (start > 2) html += '<span class="pagination-btn" style="cursor:default">...</span>';
    }
    for (let i = start; i <= end; i++) {
      html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
    }
    if (end < total) {
      if (end < total - 1) html += '<span class="pagination-btn" style="cursor:default">...</span>';
      html += `<button class="pagination-btn" onclick="${onPageChange}(${total})">${total}</button>`;
    }
    html += `<button class="pagination-btn" ${current === total ? 'disabled' : ''} onclick="${onPageChange}(${current + 1})"><i data-lucide="chevron-right"></i></button></div>`;

    container.innerHTML = html;
    createIconsIn(container);
  }
};

// ============================================
// 侧边栏渲染
// ============================================
function getActiveMenuConfig() {
  if (typeof Auth !== 'undefined' && Auth?.isLoggedIn?.()) {
    return Auth.getFilteredMenuConfig();
  }
  return menuConfig;
}

function updateSidebarActiveState(pageId) {
  const nav = DOM.get('sidebarNav');
  if (!nav) return;
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
}

function renderSidebar() {
  const nav = DOM.get('sidebarNav');
  if (!nav) return;
  let html = '';
  const activeMenu = getActiveMenuConfig();
  activeMenu.forEach(section => {
    html += `<div class="nav-section"><div class="nav-section-title">${section.section}</div>`;
    section.items.forEach(item => {
      html += `<div class="nav-item ${App.currentPage === item.id ? 'active' : ''}" data-page="${item.id}" onclick="navigateTo('${item.id}')"><i data-lucide="${item.icon}"></i><span>${item.name}</span></div>`;
    });
    html += '</div>';
  });
  nav.innerHTML = html;
  createIconsIn(nav);
}

// ============================================
// 路由和导航
// ============================================
function navigateTo(pageId, params = {}) {
  if (App.currentPage === pageId) return;

  const mainContent = DOM.get('mainContent');

  // Fade out current content
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(10px)';
  }

  setTimeout(() => {
    App.currentPage = pageId;
    updateSidebarActiveState(pageId);
    updateBreadcrumb(pageId);
    renderPage(pageId, params);
    window.scrollTo(0, 0);
    DOM.get('sidebar')?.classList.remove('mobile-open');

    // Add animation class to new content
    if (mainContent) {
      mainContent.classList.add('page-content');
      mainContent.style.opacity = '';
      mainContent.style.transform = '';
    }

    // Re-render icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      setTimeout(() => lucide.createIcons(), 50);
    }
  }, 150);
}

// ============================================
// 面包屑导航
// ============================================
function updateBreadcrumb(pageId) {
  const breadcrumb = DOM.get('breadcrumb');
  if (!breadcrumb) return;
  let sectionName = '', pageName = '';
  const activeMenu = getActiveMenuConfig();
  for (const section of activeMenu) {
    const item = section.items.find(i => i.id === pageId);
    if (item) { sectionName = section.section; pageName = item.name; break; }
  }
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item"><a href="#" onclick="navigateTo('overview');return false;">首页</a></span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item">${sectionName}</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item">${pageName}</span>
  `;
}

// ============================================
// 页面加载器 - 按需加载模块
// ============================================
const pageModules = {
  // 所有页面统一使用简化模块(包含所有页面渲染函数)
  'overview': 'admin-merchant.js',
  'industry-report': 'admin-merchant.js',
  'ai-stats': 'admin-merchant.js',
  'churn-warning': 'admin-merchant.js',
  'merchants': 'admin-merchant.js',
  'merchant-detail': 'admin-merchant.js',
  'merchant-upgrade': 'admin-merchant.js',
  'merchant-permission': 'admin-merchant.js',
  'merchant-audit': 'admin-merchant.js',
  'agents': 'admin-agent.js',
  'agent-merchants': 'admin-agent.js',
  'agent-commission': 'admin-agent.js',
  'service-providers': 'admin-agent.js',
  'agent-dashboard': 'admin-agent.js',
  'sales': 'admin-sales.js',
  'customer-assign': 'admin-sales.js',
  'sales-performance': 'admin-sales.js',
  'visit-records': 'admin-sales.js',
  'revenue': 'admin-finance.js',
  'billing': 'admin-finance.js',
  'refund': 'admin-finance.js',
  'invoice': 'admin-finance.js',
  'knowledge-base': 'admin-content.js',
  'ai-templates': 'admin-content.js',
  'announcements': 'admin-content.js',
  'activities': 'admin-content.js',
  'payment-channels': 'admin-payment.js',
  'transactions': 'admin-payment.js',
  'fee-config': 'admin-payment.js',
  'split-payment': 'admin-payment.js',
  'reconciliation': 'admin-payment.js',
  'onboarding': 'admin-customer.js',
  'health-score': 'admin-customer.js',
  'renewal': 'admin-customer.js',
  'upgrade-funnel': 'admin-customer.js',
  'wake-up': 'admin-customer.js',
  'channel-analysis': 'admin-others.js',
  'invite-fission': 'admin-others.js',
  'trial': 'admin-others.js',
  'partners': 'admin-others.js',
  'tickets': 'admin-others.js',
  'faq': 'admin-others.js',
  'satisfaction': 'admin-others.js',
  'feature-flags': 'admin-others.js',
  'ab-test': 'admin-others.js',
  'requirements': 'admin-others.js',
  'version-management': 'admin-others.js',
  'login-security': 'admin-others.js',
  'data-masking': 'admin-others.js',
  'compliance': 'admin-others.js',
  'roles': 'admin-others.js',
  'operation-logs': 'admin-others.js',
  'pricing': 'admin-others.js',
  'notifications': 'admin-others.js'
};

let loadedModules = new Set();
let currentPageRequest = null;
let moduleLoadingPromises = new Map();

async function loadModule(pageId) {
  const module = pageModules[pageId];
  if (!module) return;

  if (loadedModules.has(module)) {
    return;
  }

  if (moduleLoadingPromises.has(module)) {
    await moduleLoadingPromises.get(module);
    return;
  }

  const loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `js/modules/${module}`;
    script.onload = () => {
      loadedModules.add(module);
      moduleLoadingPromises.delete(module);
      resolve();
    };
    script.onerror = () => {
      moduleLoadingPromises.delete(module);
      reject();
    };
    document.head.appendChild(script);
  });

  moduleLoadingPromises.set(module, loadPromise);
  await loadPromise;
}

// ============================================
// 页面渲染入口
// ============================================
async function renderPage(pageId, params = {}) {
  const content = DOM.get('contentArea');
  if (!content) return;

  const requestId = Date.now() + Math.random();
  currentPageRequest = requestId;

  content.innerHTML = '<div class="page-content" style="animation:fadeIn 0.3s ease"><div class="loading-spinner"><i data-lucide="loader-2" class="animate-spin"></i> 加载中...</div></div>';
  createIconsIn(content);

  try {
    await loadModule(pageId);
  } catch (e) {
    console.warn('Module load failed:', e);
  }

  if (currentPageRequest !== requestId) {
    console.log(`Page ${pageId} cancelled, newer request exists`);
    return;
  }

  const pages = {
    'merchants': renderMerchantsPage, 'merchant-detail': renderMerchantDetailPage,
    'merchant-upgrade': renderMerchantUpgradePage, 'merchant-permission': renderMerchantPermissionPage,
    'merchant-audit': renderMerchantAuditPage,
    'agents': renderAgentsPage, 'agent-merchants': renderAgentMerchantsPage,
    'agent-commission': renderAgentCommissionPage, 'service-providers': renderServiceProvidersPage,
    'agent-dashboard': renderAgentDashboardPage,
    'sales': renderSalesPage, 'customer-assign': renderCustomerAssignPage,
    'sales-performance': renderSalesPerformancePage, 'visit-records': renderVisitRecordsPage,
    'revenue': renderRevenuePage, 'billing': renderBillingPage,
    'refund': renderRefundPage, 'invoice': renderInvoicePage,
    'knowledge-base': renderKnowledgeBasePage, 'ai-templates': renderAITemplatesPage,
    'announcements': renderAnnouncementsPage, 'activities': renderActivitiesPage,
    'overview': renderOverviewPage, 'industry-report': renderIndustryReportPage,
    'ai-stats': renderAIStatsPage, 'churn-warning': renderChurnWarningPage,
    'payment-channels': renderPaymentChannelsPage, 'transactions': renderTransactionsPage,
    'fee-config': renderFeeConfigPage, 'split-payment': renderSplitPaymentPage,
    'reconciliation': renderReconciliationPage,
    'onboarding': renderOnboardingPage, 'health-score': renderHealthScorePage,
    'renewal': renderRenewalPage, 'upgrade-funnel': renderUpgradeFunnelPage,
    'wake-up': renderWakeUpPage,
    'channel-analysis': renderChannelAnalysisPage, 'invite-fission': renderInviteFissionPage,
    'trial': renderTrialPage, 'partners': renderPartnersPage,
    'tickets': renderTicketsPage, 'faq': renderFAQPage, 'satisfaction': renderSatisfactionPage,
    'feature-flags': renderFeatureFlagsPage, 'ab-test': renderABTestPage,
    'requirements': renderRequirementsPage, 'version-management': renderVersionManagementPage,
    'login-security': renderLoginSecurityPage, 'data-masking': renderDataMaskingPage,
    'compliance': renderCompliancePage,
    'roles': renderRolesPage, 'operation-logs': renderOperationLogsPage,
    'pricing': renderPricingPage, 'notifications': renderNotificationsPage
  };

  content.innerHTML = '<div class="page-content">';
  if (pages[pageId]) {
    try {
      pages[pageId](content, params);
    } catch (e) {
      console.error(`Render page ${pageId} error:`, e);
      content.innerHTML += '<div class="empty-state"><div class="empty-icon"><i data-lucide="alert-triangle"></i></div><h3 class="empty-title">页面加载失败</h3><p class="empty-desc">请刷新页面重试</p></div>';
    }
  } else {
    content.innerHTML += '<div class="empty-state"><div class="empty-icon"><i data-lucide="layout-dashboard"></i></div><h3 class="empty-title">页面开发中</h3></div>';
  }
  content.innerHTML += '</div>';
  createIconsIn(content);
}

// ============================================
// 全局搜索功能
// ============================================
let searchResults = [];
let selectedIndex = -1;

function initGlobalSearch() {
  if (initGlobalSearch.initialized) return;
  initGlobalSearch.initialized = true;

  const modal = DOM.get('globalSearchModal');
  const searchInput = DOM.get('searchInput');
  const resultsContainer = DOM.get('searchResults');

  if (!modal || !searchInput) return;
  
  // Build search index from menu config
  searchResults = [];
  const activeMenu = getActiveMenuConfig();
  activeMenu.forEach(section => {
    section.items.forEach(item => {
      searchResults.push({
        id: item.id,
        name: item.name,
        section: section.section,
        icon: item.icon
      });
    });
  });
  
  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      modal.classList.add('active');
      searchInput.focus();
      searchInput.value = '';
      renderSearchResults('');
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  resultsContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.global-search-item');
    if (item) {
      navigateTo(item.dataset.page);
      modal.classList.remove('active');
    }
  });

  DOM.get('globalSearchBtn')?.addEventListener('click', () => {
    modal.classList.add('active');
    searchInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
  
  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.global-search-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        const pageId = items[selectedIndex].dataset.page;
        navigateTo(pageId);
        modal.classList.remove('active');
      }
    }
  });
}

function renderSearchResults(query) {
  const resultsContainer = DOM.get('searchResults');
  if (!resultsContainer) return;

  selectedIndex = -1;
  const filtered = query ? searchResults.filter(r =>
    r.name.includes(query) || r.section.includes(query)
  ) : searchResults;

  if (filtered.length === 0) {
    resultsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">未找到匹配结果</div>';
    return;
  }

  let html = '<div class="global-search-section">快速跳转</div>';
  filtered.forEach(item => {
    html += `
      <div class="global-search-item" data-page="${item.id}">
        <i data-lucide="${item.icon}"></i>
        <div class="global-search-item-content">
          <div class="global-search-item-title">${item.name}</div>
          <div class="global-search-item-path">${item.section}</div>
        </div>
      </div>
    `;
  });
  resultsContainer.innerHTML = html;
  createIconsIn(resultsContainer);
}

function updateSelection(items) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === selectedIndex);
  });
  if (items[selectedIndex]) {
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

// ============================================
// 侧边栏搜索
// ============================================
function initSidebarSearch() {
  const sidebarSearch = DOM.get('sidebarSearch');
  if (!sidebarSearch) return;

  sidebarSearch.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const text = item.querySelector('span')?.textContent?.toLowerCase() || '';
      const section = item.closest('.nav-section')?.querySelector('.nav-section-title')?.textContent?.toLowerCase() || '';
      const matches = text.includes(query) || section.includes(query);
      item.style.display = matches ? '' : 'none';
    });

    document.querySelectorAll('.nav-section').forEach(section => {
      const hasVisibleItems = section.querySelectorAll('.nav-item:not([style*="display: none"])').length > 0;
      section.style.display = hasVisibleItems ? '' : 'none';
    });
  }));
}

// ============================================
// 移动端适配
// ============================================
function initMobileAdaptation() {
  const mobileOverlay = DOM.get('mobileOverlay');
  const mobileMenuToggle = DOM.get('mobileMenuToggle');
  const mobileBottomNav = DOM.get('mobileBottomNav');

  mobileMenuToggle?.addEventListener('click', () => {
    DOM.get('sidebar')?.classList.toggle('mobile-open');
    mobileOverlay?.classList.toggle('active');
  });

  mobileOverlay?.addEventListener('click', () => {
    DOM.get('sidebar')?.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
  });

  mobileBottomNav?.querySelectorAll('.mobile-bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);

      mobileBottomNav.querySelectorAll('.mobile-bottom-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;

    if (diff > 80) {
      DOM.get('sidebar')?.classList.add('mobile-open');
      mobileOverlay?.classList.add('active');
    } else if (diff < -80) {
      DOM.get('sidebar')?.classList.remove('mobile-open');
      mobileOverlay?.classList.remove('active');
    }
  }, { passive: true });
}

// ============================================
// 数字动画效果
// ============================================
function animateStatValue(element, targetValue, duration = 1500) {
  if (!element || !targetValue) return;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (targetValue - start) * easeProgress);
    element.textContent = current.toLocaleString();
    
    if (progress < 1) requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
  renderSidebar();

  DOM.get('sidebarToggle')?.addEventListener('click', () => {
    DOM.get('sidebar')?.classList.toggle('collapsed');
  });

  initGlobalSearch();
  initSidebarSearch();
  initMobileAdaptation();

  navigateTo('overview');

  console.log('店赢OS管理后台初始化完成');
});
