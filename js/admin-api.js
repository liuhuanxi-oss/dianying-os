/**
 * 店赢OS - 管理后台API客户端
 * 封装所有后端API调用，统一错误处理和loading状态
 * 支持自动fallback到mock数据
 */

const API = {
  // API基础配置
  baseURL: '/api',
  timeout: 10000,
  retryTimes: 2,
  retryDelay: 1000,
  
  // 状态管理
  _loadingStates: {},
  _mockDataCache: {},
  _apiAvailable: null, // null表示未检测，true/false表示检测结果
  
  // ============================================
  // 核心请求方法
  // ============================================
  
  /**
   * 通用fetch请求
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    // 设置timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;
    
    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 统一处理响应格式
      if (result.code !== undefined) {
        if (result.code !== 0) {
          throw new Error(result.message || '请求失败');
        }
        return result.data;
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`API请求失败: ${endpoint}`, error.message);
      throw error;
    }
  },
  
  /**
   * GET请求
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  },
  
  /**
   * POST请求
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, { method: 'POST', body: data });
  },
  
  /**
   * PUT请求
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, { method: 'PUT', body: data });
  },
  
  /**
   * DELETE请求
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
  
  // ============================================
  // API健康检测
  // ============================================
  
  /**
   * 检测API是否可用
   */
  async checkHealth() {
    if (this._apiAvailable !== null) {
      return this._apiAvailable;
    }
    
    try {
      const response = await fetch(`${this.baseURL}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      this._apiAvailable = response.ok;
    } catch (e) {
      this._apiAvailable = false;
    }
    
    return this._apiAvailable;
  },
  
  // ============================================
  // 商家管理
  // ============================================
  
  merchants: {
    // 商家列表
    async list(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/merchants/', params);
        }
      } catch (e) {}
      // fallback到mock
      return this.mockList(params);
    },
    
    mockList(params = {}) {
      let items = [...App.data.merchants];
      if (params.status) {
        items = items.filter(m => m.status === params.status);
      }
      if (params.industry) {
        items = items.filter(m => m.industry === params.industry);
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        items = items.filter(m => 
          m.name.toLowerCase().includes(kw) || 
          m.contact?.toLowerCase().includes(kw)
        );
      }
      const page = params.page || 1;
      const size = params.size || 20;
      const start = (page - 1) * size;
      return {
        items: items.slice(start, start + size),
        total: items.length,
        page,
        size,
        pages: Math.ceil(items.length / size)
      };
    },
    
    // 商家详情
    async get(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/merchants/${id}`);
        }
      } catch (e) {}
      return App.data.merchants.find(m => m.id === id);
    },
    
    // 创建商家
    async create(data) {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/merchants/', data);
        }
      } catch (e) {}
      // mock创建
      const newId = Math.max(...App.data.merchants.map(m => m.id)) + 1;
      const newMerchant = { id: newId, ...data, status: 'pending' };
      App.data.merchants.unshift(newMerchant);
      return { id: newId };
    },
    
    // 更新商家
    async update(id, data) {
      try {
        if (await API.checkHealth()) {
          return await API.put(`/admin/merchants/${id}`, data);
        }
      } catch (e) {}
      const idx = App.data.merchants.findIndex(m => m.id === id);
      if (idx !== -1) {
        App.data.merchants[idx] = { ...App.data.merchants[idx], ...data };
      }
      return null;
    },
    
    // 删除商家
    async delete(id) {
      try {
        if (await API.checkHealth()) {
          return await API.delete(`/admin/merchants/${id}`);
        }
      } catch (e) {}
      App.data.merchants = App.data.merchants.filter(m => m.id !== id);
      return null;
    },
    
    // 商家统计
    async stats() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/merchants/stats');
        }
      } catch (e) {}
      return {
        total: App.data.merchants.length,
        active: App.data.merchants.filter(m => m.status === 'active').length,
        expiring: App.data.merchants.filter(m => m.status === 'expiring').length,
        inactive: App.data.merchants.filter(m => m.status === 'inactive').length
      };
    },
    
    // 商家审核
    async audit(merchantId, approve, reason = '') {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/merchants/audit', { merchant_id: merchantId, approve, reason });
        }
      } catch (e) {}
      const idx = App.data.merchants.findIndex(m => m.id === merchantId);
      if (idx !== -1) {
        App.data.merchants[idx].status = approve ? 'active' : 'rejected';
      }
      return null;
    },
    
    // 权限配置
    async getPermission(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/merchants/${id}/permission`);
        }
      } catch (e) {}
      const m = App.data.merchants.find(m => m.id === id);
      const permissions = {
        '免费版': ['basic_ai', 'basic_stats'],
        '专业版': ['basic_ai', 'basic_stats', 'marketing', 'priority_support'],
        '旗舰版': ['all']
      };
      return {
        merchant_id: id,
        version: m?.version || '免费版',
        permissions: permissions[m?.version] || ['basic_ai']
      };
    },
    
    // 版本升级
    async upgrade(id, version) {
      try {
        if (await API.checkHealth()) {
          return await API.post(`/admin/merchants/${id}/upgrade`, { version });
        }
      } catch (e) {}
      const idx = App.data.merchants.findIndex(m => m.id === id);
      if (idx !== -1) {
        App.data.merchants[idx].version = version;
      }
      return null;
    }
  },
  
  // ============================================
  // 代理商管理
  // ============================================
  
  agents: {
    // 代理商列表
    async list(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/agents/', params);
        }
      } catch (e) {}
      let items = [...App.data.agents];
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        items = items.filter(a => a.name.toLowerCase().includes(kw));
      }
      return { items, total: items.length };
    },
    
    // 代理商看板
    async dashboard() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/agents/dashboard');
        }
      } catch (e) {}
      return App.data.agentDashboard;
    },
    
    // 代理商统计
    async stats() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/agents/stats');
        }
      } catch (e) {}
      return {
        total: App.data.agents.length,
        active: App.data.agents.filter(a => a.status === 'active').length
      };
    },
    
    // 代理商详情
    async get(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/agents/${id}`);
        }
      } catch (e) {}
      return App.data.agents.find(a => a.id === id);
    },
    
    // 佣金信息
    async commission(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/agents/${id}/commission`);
        }
      } catch (e) {}
      const agent = App.data.agents.find(a => a.id === id);
      return {
        totalCommission: agent?.commission || 0,
        pendingCommission: agent?.pendingCommission || 0,
        history: App.data.commissions || []
      };
    },
    
    // 下级商家
    async merchants(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/agents/${id}/merchants`);
        }
      } catch (e) {}
      return App.data.merchants.slice(0, 5);
    }
  },
  
  // ============================================
  // 业务员管理
  // ============================================
  
  sales: {
    async list(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/sales/', params);
        }
      } catch (e) {}
      let items = [...App.data.sales];
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        items = items.filter(s => s.name.toLowerCase().includes(kw));
      }
      return { items, total: items.length };
    },
    
    async performance(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/sales/${id}/performance`);
        }
      } catch (e) {}
      return App.data.salesPerformance;
    },
    
    async customers(id) {
      try {
        if (await API.checkHealth()) {
          return await API.get(`/admin/sales/${id}/customers`);
        }
      } catch (e) {}
      return { items: App.data.merchants.slice(0, 8), total: 8 };
    },
    
    async assign(salesId, merchantIds) {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/sales/assign', { sales_id: salesId, merchant_ids: merchantIds });
        }
      } catch (e) {}
      return null;
    }
  },
  
  // ============================================
  // 财务中心
  // ============================================
  
  finance: {
    async revenue(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/finance/revenue', params);
        }
      } catch (e) {}
      return App.data.revenue;
    },
    
    async billing(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/finance/billing', params);
        }
      } catch (e) {}
      return { items: App.data.billings, total: App.data.billings.length };
    },
    
    async refund(data) {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/finance/refund', data);
        }
      } catch (e) {}
      const idx = App.data.billings.findIndex(b => b.id === data.billing_id);
      if (idx !== -1) {
        App.data.billings[idx].status = 'refunded';
      }
      return null;
    },
    
    async invoice() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/finance/invoice');
        }
      } catch (e) {}
      return { items: App.data.invoices || [], total: 0 };
    }
  },
  
  // ============================================
  // 内容运营
  // ============================================
  
  content: {
    async knowledgeBase(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/content/knowledge-base', params);
        }
      } catch (e) {}
      return { items: App.data.knowledge, total: App.data.knowledge.length };
    },
    
    async aiTemplates(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/content/ai-templates', params);
        }
      } catch (e) {}
      return { items: App.data.aiTemplates, total: App.data.aiTemplates.length };
    },
    
    async announcements(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/content/announcements', params);
        }
      } catch (e) {}
      return { items: App.data.announcements, total: App.data.announcements.length };
    },
    
    async createActivity(data) {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/content/activities', data);
        }
      } catch (e) {}
      const newId = Math.max(...(App.data.activities || []).map(a => a.id), 0) + 1;
      const newActivity = { id: newId, ...data, status: 'draft' };
      if (!App.data.activities) App.data.activities = [];
      App.data.activities.unshift(newActivity);
      return { id: newId };
    }
  },
  
  // ============================================
  // 数据洞察
  // ============================================
  
  analytics: {
    async overview() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/analytics/overview');
        }
      } catch (e) {}
      return App.data.overview;
    },
    
    async gmvTrend(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/analytics/gmv-trend', params);
        }
      } catch (e) {}
      return App.data.gmvTrend;
    },
    
    async industryReport() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/analytics/industry-report');
        }
      } catch (e) {}
      return { items: App.data.industryData, total: App.data.industryData.length };
    },
    
    async aiStats() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/analytics/ai-stats');
        }
      } catch (e) {}
      return App.data.aiStats;
    },
    
    async churnWarning() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/analytics/churn-warning');
        }
      } catch (e) {}
      return { items: App.data.churnWarnings || [], total: 0 };
    }
  },
  
  // ============================================
  // 支付交易
  // ============================================
  
  payment: {
    async channels() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/payment/channels');
        }
      } catch (e) {}
      return { items: App.data.paymentChannels, total: App.data.paymentChannels.length };
    },
    
    async transactions(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/payment/transactions', params);
        }
      } catch (e) {}
      return { items: App.data.transactions, total: App.data.transactions.length };
    },
    
    async feeConfig() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/payment/fee-config');
        }
      } catch (e) {}
      return App.data.feeConfig;
    },
    
    async splitPayment() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/payment/split-payment');
        }
      } catch (e) {}
      return { items: App.data.splitPayments || [], total: 0 };
    },
    
    async reconciliation() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/payment/reconciliation');
        }
      } catch (e) {}
      return { items: App.data.reconciliations || [], total: 0 };
    }
  },
  
  // ============================================
  // 客户成功
  // ============================================
  
  customer: {
    async onboarding() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/customer/onboarding');
        }
      } catch (e) {}
      return { items: App.data.onboardingList || [], total: 0 };
    },
    
    async healthScore() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/customer/health-score');
        }
      } catch (e) {}
      return App.data.healthScores;
    },
    
    async renewal() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/customer/renewal');
        }
      } catch (e) {}
      return { items: App.data.renewals || [], total: 0 };
    },
    
    async upgradeFunnel() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/customer/upgrade-funnel');
        }
      } catch (e) {}
      return App.data.upgradeFunnel;
    },
    
    async wakeUp(data) {
      try {
        if (await API.checkHealth()) {
          return await API.post('/admin/customer/wake-up', data);
        }
      } catch (e) {}
      return null;
    }
  },
  
  // ============================================
  // 渠道增长
  // ============================================
  
  channel: {
    async analysis() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/channel/analysis');
        }
      } catch (e) {}
      return App.data.channelAnalysis;
    },
    
    async inviteFission() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/channel/invite-fission');
        }
      } catch (e) {}
      return { items: App.data.inviteFissions || [], total: 0 };
    },
    
    async trial() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/channel/trial');
        }
      } catch (e) {}
      return { items: App.data.trialList || [], total: 0 };
    },
    
    async partners() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/channel/partners');
        }
      } catch (e) {}
      return { items: App.data.partners || [], total: 0 };
    }
  },
  
  // ============================================
  // 客服支持
  // ============================================
  
  support: {
    async tickets(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/support/tickets', params);
        }
      } catch (e) {}
      return { items: App.data.tickets, total: App.data.tickets.length };
    },
    
    async faq() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/support/faq');
        }
      } catch (e) {}
      return { items: App.data.faqList, total: App.data.faqList.length };
    },
    
    async satisfaction() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/support/satisfaction');
        }
      } catch (e) {}
      return App.data.satisfaction;
    }
  },
  
  // ============================================
  // 产品迭代
  // ============================================
  
  product: {
    async featureFlags() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/product/feature-flags');
        }
      } catch (e) {}
      return { items: App.data.featureFlags, total: App.data.featureFlags.length };
    },
    
    async abTest() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/product/ab-test');
        }
      } catch (e) {}
      return { items: App.data.abTests, total: App.data.abTests.length };
    },
    
    async requirements() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/product/requirements');
        }
      } catch (e) {}
      return { items: App.data.requirements, total: App.data.requirements.length };
    },
    
    async version() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/product/version');
        }
      } catch (e) {}
      return { items: App.data.versions, total: App.data.versions.length };
    }
  },
  
  // ============================================
  // 安全合规
  // ============================================
  
  security: {
    async login() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/security/login');
        }
      } catch (e) {}
      return { items: App.data.loginLogs, total: App.data.loginLogs.length };
    },
    
    async dataMasking() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/security/data-masking');
        }
      } catch (e) {}
      return App.data.maskingRules;
    },
    
    async compliance() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/security/compliance');
        }
      } catch (e) {}
      return { items: App.data.operationLogs, total: App.data.operationLogs.length };
    }
  },
  
  // ============================================
  // 系统设置
  // ============================================
  
  settings: {
    async roles() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/settings/roles');
        }
      } catch (e) {}
      return { items: App.data.roles, total: App.data.roles.length };
    },
    
    async operationLogs(params = {}) {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/settings/operation-logs', params);
        }
      } catch (e) {}
      return { items: App.data.operationLogs, total: App.data.operationLogs.length };
    },
    
    async pricing() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/settings/pricing');
        }
      } catch (e) {}
      return App.data.pricing;
    },
    
    async notifications() {
      try {
        if (await API.checkHealth()) {
          return await API.get('/admin/settings/notifications');
        }
      } catch (e) {}
      return App.data.notificationConfig;
    }
  }
};

// ============================================
// UI工具函数
// ============================================

const UI = {
  // 显示loading
  showLoading(container) {
    if (container) {
      container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      `;
    }
  },
  
  // Toast提示
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  success(message) { this.toast(message, 'success'); },
  error(message) { this.toast(message, 'error'); },
  info(message) { this.toast(message, 'info'); },
  
  // 确认对话框
  confirm(title, message) {
    return new Promise((resolve) => {
      const dialog = document.getElementById('confirmDialog');
      const titleEl = document.getElementById('confirmTitle');
      const messageEl = document.getElementById('confirmMessage');
      const okBtn = document.getElementById('confirmOk');
      const cancelBtn = document.getElementById('confirmCancel');
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      dialog.classList.add('show');
      
      const cleanup = () => {
        dialog.classList.remove('show');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
      };
      
      const onOk = () => { cleanup(); resolve(true); };
      const onCancel = () => { cleanup(); resolve(false); };
      
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  },
  
  // 分页组件
  renderPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';
    
    let html = '<div class="pagination">';
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">上一页</button>`;
    
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    
    range.forEach(page => {
      if (page === '...') {
        html += '<span class="pagination-ellipsis">...</span>';
      } else {
        html += `<button class="pagination-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
      }
    });
    
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">下一页</button>`;
    html += '</div>';
    
    if (container) {
      container.innerHTML = html;
      container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          if (!btn.disabled && page !== currentPage) {
            onPageChange(page);
          }
        });
      });
    }
    
    return html;
  }
};

// 导出到全局
window.API = API;
window.UI = UI;
