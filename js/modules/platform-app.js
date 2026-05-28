/**
 * 店赢OS - 平台端核心模块
 * 包含：平台端菜单配置、页面路由、Mock数据、页面渲染函数
 */

// ============================================
// 平台端菜单配置
// ============================================
const platformMenuConfig = [
  {
    section: '商家管理',
    icon: 'store',
    items: [
      { id: 'platform-merchants', name: '商家列表', icon: 'list' },
      { id: 'platform-merchant-detail', name: '商家详情', icon: 'building-2' },
      { id: 'platform-merchant-upgrade', name: '开通续费', icon: 'credit-card' },
      { id: 'platform-merchant-permission', name: '权限配置', icon: 'shield' },
      { id: 'platform-merchant-audit', name: '商家审核', icon: 'clipboard-check' }
    ]
  },
  {
    section: '代理商体系',
    icon: 'users',
    items: [
      { id: 'platform-agents', name: '代理商管理', icon: 'user-cog' },
      { id: 'platform-agent-merchants', name: '下级商家', icon: 'git-branch' },
      { id: 'platform-agent-commission', name: '佣金分润', icon: 'wallet' },
      { id: 'platform-service-providers', name: '服务商管理', icon: 'briefcase' },
      { id: 'platform-agent-dashboard', name: '代理商看板', icon: 'bar-chart-3' }
    ]
  },
  {
    section: '业务人员',
    icon: 'user-circle',
    items: [
      { id: 'platform-sales', name: '业务员管理', icon: 'user' },
      { id: 'platform-customer-assign', name: '客户分配', icon: 'user-plus' },
      { id: 'platform-sales-performance', name: '业绩看板', icon: 'trending-up' },
      { id: 'platform-visit-records', name: '跟访记录', icon: 'map-pin' }
    ]
  },
  {
    section: '财务中心',
    icon: 'banknote',
    items: [
      { id: 'platform-revenue', name: '收入总览', icon: 'pie-chart' },
      { id: 'platform-billing', name: '账单管理', icon: 'file-text' },
      { id: 'platform-refund', name: '退款处理', icon: 'rotate-ccw' },
      { id: 'platform-invoice', name: '发票管理', icon: 'receipt' }
    ]
  },
  {
    section: '内容运营',
    icon: 'edit',
    items: [
      { id: 'platform-knowledge-base', name: '知识库管理', icon: 'book-open' },
      { id: 'platform-ai-templates', name: 'AI模板', icon: 'sparkles' },
      { id: 'platform-announcements', name: '公告推送', icon: 'megaphone' },
      { id: 'platform-activities', name: '运营活动', icon: 'gift' }
    ]
  },
  {
    section: '数据洞察',
    icon: 'bar-chart',
    items: [
      { id: 'platform-overview', name: '平台总览', icon: 'layout-dashboard' },
      { id: 'platform-industry-report', name: '行业报告', icon: 'file-bar-chart' },
      { id: 'platform-ai-stats', name: 'AI统计', icon: 'cpu' },
      { id: 'platform-churn-warning', name: '流失预警', icon: 'alert-triangle' }
    ]
  },
  {
    section: '支付交易',
    icon: 'credit-card',
    items: [
      { id: 'platform-payment-channels', name: '通道监控', icon: 'activity' },
      { id: 'platform-transactions', name: '交易流水', icon: 'repeat' },
      { id: 'platform-fee-config', name: '费率配置', icon: 'settings' },
      { id: 'platform-split-payment', name: '分账管理', icon: 'split' },
      { id: 'platform-reconciliation', name: '对账中心', icon: 'check-square' }
    ]
  },
  {
    section: '客户成功',
    icon: 'heart',
    items: [
      { id: 'platform-onboarding', name: 'Onboarding', icon: 'rocket' },
      { id: 'platform-health-score', name: '健康度', icon: 'activity' },
      { id: 'platform-renewal', name: '续费管理', icon: 'refresh-cw' },
      { id: 'platform-upgrade-funnel', name: '升降级', icon: 'arrow-up-circle' },
      { id: 'platform-wake-up', name: '沉默唤醒', icon: 'bell' }
    ]
  },
  {
    section: '客服支持',
    icon: 'headphones',
    items: [
      { id: 'platform-tickets', name: '工单系统', icon: 'ticket' },
      { id: 'platform-faq', name: 'FAQ管理', icon: 'help-circle' },
      { id: 'platform-satisfaction', name: '满意度调研', icon: 'smile' }
    ]
  },
  {
    section: '系统设置',
    icon: 'settings',
    items: [
      { id: 'platform-roles', name: '角色权限', icon: 'shield-check' },
      { id: 'platform-operation-logs', name: '操作日志', icon: 'history' },
      { id: 'platform-pricing', name: '定价配置', icon: 'tag' },
      { id: 'platform-notifications', name: '消息通知', icon: 'bell-ring' }
    ]
  }
];

// ============================================
// 平台端Mock数据
// ============================================
PlatformApp = {
  data: {
    stats: {
      totalMerchants: 1256,
      activeMerchants: 1089,
      totalRevenue: 28560000,
      aiUsage: 156000
    },
    merchants: App.data.merchants,
    agents: App.data.agents,
    transactions: App.data.transactions,
    tickets: App.data.tickets
  }
};

// ============================================
// 覆盖getActiveMenuConfig
// ============================================
function getActiveMenuConfig() {
  return platformMenuConfig;
}

// ============================================
// 页面渲染函数 - 平台总览
// ============================================
function renderPlatformOverviewPage(container) {
  const stats = PlatformApp.data.stats;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">平台总览</h1>
        <p class="page-subtitle">平台运营数据实时监控</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="refresh-cw"></i> 刷新</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商家总数</div>
          <div class="stat-value">${stats.totalMerchants.toLocaleString()}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +12.5%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商家</div>
          <div class="stat-value">${stats.activeMerchants.toLocaleString()}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +8.3%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">平台营收</div>
          <div class="stat-value">¥${(stats.totalRevenue/10000).toFixed(0)}万</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +15.2%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="cpu"></i></div>
        <div class="stat-content">
          <div class="stat-label">AI调用量</div>
          <div class="stat-value">${(stats.aiUsage/10000).toFixed(1)}万</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +22.1%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">营收趋势</h3></div>
        <div id="platformRevenueChart" style="height:300px;"></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">商家增长</h3></div>
        <div id="platformMerchantChart" style="height:300px;"></div>
      </div>
    </div>
    
    <div class="grid-2 mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">最新商家入驻</h3></div>
        <table class="table">
          <thead><tr><th>商家</th><th>版本</th><th>时间</th></tr></thead>
          <tbody>
            ${PlatformApp.data.merchants.slice(0, 5).map(m => `
              <tr>
                <td>${m.name}</td>
                <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
                <td>${m.registerTime}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">待处理工单</h3></div>
        <table class="table">
          <thead><tr><th>工单</th><th>类型</th><th>状态</th></tr></thead>
          <tbody>
            ${PlatformApp.data.tickets.slice(0, 5).map(t => `
              <tr>
                <td>${t.title}</td>
                <td>${t.type}</td>
                <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    initPlatformCharts();
  }, 100);
}

function initPlatformCharts() {
  // 营收趋势
  const revenueChart = document.getElementById('platformRevenueChart');
  if (revenueChart && echarts) {
    const chart = echarts.init(revenueChart);
    const data = App.data.revenueTrend;
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map(d => d.month), axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
      series: [{ type: 'line', data: data.map(d => d.amount), smooth: true, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(94,106,210,0.3)' }, { offset: 1, color: 'rgba(94,106,210,0)' }]) }, lineStyle: { color: '#5e6ad2' } }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
  
  // 商家增长
  const merchantChart = document.getElementById('platformMerchantChart');
  if (merchantChart && echarts) {
    const chart = echarts.init(merchantChart);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
      series: [{ type: 'bar', data: [980, 1020, 1056, 1100, 1180, 1256], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#00b8cc' }, { offset: 1, color: '#5e6ad2' }]) }, barWidth: '50%' }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
}

// ============================================
// 页面渲染函数 - 商家管理
// ============================================
function renderPlatformMerchantsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家管理</h1>
        <p class="page-subtitle">管理所有入驻商家</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增商家</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商家总数</div>
          <div class="stat-value">${PlatformApp.data.merchants.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商家</div>
          <div class="stat-value">${PlatformApp.data.merchants.filter(m => m.status === 'active').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">即将到期</div>
          <div class="stat-value">${PlatformApp.data.merchants.filter(m => m.status === 'expiring').length}</div>
        </div>
      </div>
    </div>
    
    <div class="filter-bar mt-6">
      <div class="filter-group">
        <select class="filter-select">
          <option value="">全部版本</option>
          <option value="旗舰版">旗舰版</option>
          <option value="专业版">专业版</option>
          <option value="免费版">免费版</option>
        </select>
      </div>
      <div class="filter-group">
        <select class="filter-select">
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="expiring">即将到期</option>
          <option value="inactive">停用</option>
        </select>
      </div>
      <div class="filter-group search-input">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索商家...">
      </div>
    </div>
    
    <div class="table-container mt-6">
      <div class="table-header"><h3 class="table-title">商家列表</h3></div>
      <table class="table">
        <thead>
          <tr><th>商家名称</th><th>行业</th><th>版本</th><th>状态</th><th>注册时间</th><th>到期时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${PlatformApp.data.merchants.map(m => `
            <tr>
              <td><div class="flex items-center gap-3"><div class="avatar">${m.name.charAt(0)}</div><span class="font-medium">${m.name}</span></div></td>
              <td>${m.industry}</td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
              <td>${m.registerTime}</td>
              <td>${m.expireTime}</td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm" onclick="viewPlatformMerchantDetail(${m.id})"><i data-lucide="eye"></i></button>
                  <button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewPlatformMerchantDetail(id) {
  const merchant = PlatformApp.data.merchants.find(m => m.id === id);
  if (!merchant) return;
  
  Modal.show(`
    <div class="modal-header"><h2 class="modal-title">商家详情</h2><button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button></div>
    <div class="modal-body">
      <div class="detail-section">
        <h4 class="detail-title">基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">商家名称</span><span class="detail-value">${merchant.name}</span></div>
          <div class="detail-item"><span class="detail-label">行业</span><span class="detail-value">${merchant.industry}</span></div>
          <div class="detail-item"><span class="detail-label">版本</span><span class="badge badge-${Utils.getVersionClass(merchant.version)}">${merchant.version}</span></div>
          <div class="detail-item"><span class="detail-label">状态</span><span class="badge badge-${Utils.getStatusClass(merchant.status)}">${Utils.getStatusLabel(merchant.status)}</span></div>
        </div>
      </div>
      <div class="detail-section">
        <h4 class="detail-title">经营数据</h4>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">累计GMV</span><span class="detail-value text-success">¥${merchant.gmv.toLocaleString()}</span></div>
          <div class="detail-item"><span class="detail-label">订单数</span><span class="detail-value">${merchant.orders.toLocaleString()}</span></div>
          <div class="detail-item"><span class="detail-label">评分</span><span class="detail-value">⭐ ${merchant.rating}</span></div>
          <div class="detail-item"><span class="detail-label">AI使用量</span><span class="detail-value">${merchant.aiUsage.toLocaleString()}次</span></div>
        </div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="Modal.hide()">关闭</button></div>
  `, { large: true });
}

// ============================================
// 页面渲染函数 - 代理商管理
// ============================================
function renderPlatformAgentsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">代理商管理</h1>
        <p class="page-subtitle">管理所有代理商</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增代理商</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">代理商总数</div>
          <div class="stat-value">${PlatformApp.data.agents.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="building"></i></div>
        <div class="stat-content">
          <div class="stat-label">下级商家</div>
          <div class="stat-value">${PlatformApp.data.agents.reduce((sum, a) => sum + a.merchants, 0)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">月流水</div>
          <div class="stat-value">¥${(PlatformApp.data.agents.reduce((sum, a) => sum + a.monthlyGmv, 0)/10000).toFixed(0)}万</div>
        </div>
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead>
          <tr><th>代理商</th><th>等级</th><th>下级商家</th><th>月流水</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${PlatformApp.data.agents.map(a => `
            <tr>
              <td>${a.name}</td>
              <td><span class="badge badge-${Utils.getLevelClass(a.level)}">${Utils.getLevelLabel(a.level)}</span></td>
              <td>${a.merchants}</td>
              <td>¥${a.monthlyGmv.toLocaleString()}</td>
              <td><span class="badge badge-${Utils.getStatusClass(a.status)}">${Utils.getStatusLabel(a.status)}</span></td>
              <td><button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 财务总览
// ============================================
function renderPlatformRevenuePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">财务总览</h1>
        <p class="page-subtitle">平台财务数据统计</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">¥256万</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +15.2%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">待结算</div>
          <div class="stat-value">¥38.5万</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="credit-card"></i></div>
        <div class="stat-content">
          <div class="stat-label">已分润</div>
          <div class="stat-value">¥127万</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="receipt"></i></div>
        <div class="stat-content">
          <div class="stat-label">退款总额</div>
          <div class="stat-value">¥2.8万</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">收入趋势</h3></div>
      <div id="revenueTrendChart" style="height:300px;"></div>
    </div>
  `;
  
  setTimeout(() => {
    const chart = document.getElementById('revenueTrendChart');
    if (chart && echarts) {
      const c = echarts.init(chart);
      const data = App.data.revenueTrend;
      c.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(d => d.month), axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
        series: [{ type: 'bar', data: data.map(d => d.amount), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#5e6ad2' }, { offset: 1, color: '#00b8cc' }]) }, barWidth: '50%' }],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
      });
    }
  }, 100);
}

// ============================================
// 页面渲染函数 - 交易流水
// ============================================
function renderPlatformTransactionsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">交易流水</h1>
        <p class="page-subtitle">平台所有交易记录</p>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-group">
        <select class="filter-select">
          <option value="">全部类型</option>
          <option value="subscription">订阅</option>
          <option value="upgrade">升级</option>
          <option value="renewal">续费</option>
        </select>
      </div>
      <div class="filter-group">
        <select class="filter-select">
          <option value="">全部状态</option>
          <option value="success">成功</option>
          <option value="pending">待处理</option>
          <option value="failed">失败</option>
        </select>
      </div>
      <div class="filter-group search-input">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索订单号...">
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>订单号</th><th>商家</th><th>金额</th><th>类型</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>
          ${PlatformApp.data.transactions.map(t => `
            <tr>
              <td><span class="font-mono">${t.id}</span></td>
              <td>${t.merchant}</td>
              <td>¥${t.amount.toLocaleString()}</td>
              <td>${t.type === 'subscription' ? '订阅' : t.type === 'upgrade' ? '升级' : '续费'}</td>
              <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              <td>${t.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 工单系统
// ============================================
function renderPlatformTicketsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">工单系统</h1>
        <p class="page-subtitle">处理商家提交的工单</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="inbox"></i></div>
        <div class="stat-content">
          <div class="stat-label">待处理</div>
          <div class="stat-value">${PlatformApp.data.tickets.filter(t => t.status === 'open').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="loader"></i></div>
        <div class="stat-content">
          <div class="stat-label">处理中</div>
          <div class="stat-value">${PlatformApp.data.tickets.filter(t => t.status === 'pending').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">已解决</div>
          <div class="stat-value">${PlatformApp.data.tickets.filter(t => t.status === 'resolved').length}</div>
        </div>
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>工单号</th><th>商家</th><th>类型</th><th>标题</th><th>状态</th><th>优先级</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          ${PlatformApp.data.tickets.map(t => `
            <tr>
              <td><span class="font-mono">${t.id}</span></td>
              <td>${t.merchant}</td>
              <td>${t.type}</td>
              <td>${t.title}</td>
              <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              <td><span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'gray'}">${t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}</span></td>
              <td>${t.createTime}</td>
              <td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 角色权限
// ============================================
function renderPlatformRolesPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">角色权限</h1>
        <p class="page-subtitle">平台角色与权限配置</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增角色</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>角色名称</th><th>描述</th><th>用户数</th><th>权限数</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>超级管理员</td><td>平台最高权限</td><td>2</td><td>全部</td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
          <tr><td>运营主管</td><td>日常运营管理</td><td>5</td><td>45</td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
          <tr><td>客服专员</td><td>客户服务支持</td><td>8</td><td>20</td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
          <tr><td>财务专员</td><td>财务数据管理</td><td>3</td><td>15</td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 知识库管理
// ============================================
function renderPlatformKnowledgeBasePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">知识库管理</h1>
        <p class="page-subtitle">运营知识库内容管理</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增文档</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>文档标题</th><th>分类</th><th>更新时间</th><th>浏览量</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>商家入驻指南</td><td>入门教程</td><td>2024-12-01</td><td>1,256</td><td><span class="badge badge-success">已发布</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>支付配置教程</td><td>功能教程</td><td>2024-11-28</td><td>890</td><td><span class="badge badge-success">已发布</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>AI功能使用手册</td><td>功能教程</td><td>2024-11-25</td><td>567</td><td><span class="badge badge-gray">草稿</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - AI统计
// ============================================
function renderPlatformAIStatsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI统计</h1>
        <p class="page-subtitle">AI功能使用数据分析</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="cpu"></i></div>
        <div class="stat-content">
          <div class="stat-label">总调用量</div>
          <div class="stat-value">${(PlatformApp.data.stats.aiUsage/10000).toFixed(1)}万</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">使用商家</div>
          <div class="stat-value">892</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="clock"></i></div>
        <div class="stat-content">
          <div class="stat-label">日均调用</div>
          <div class="stat-value">5,200</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">功能使用分布</h3></div>
      <div id="aiUsageChart" style="height:300px;"></div>
    </div>
  `;
  
  setTimeout(() => {
    const chart = document.getElementById('aiUsageChart');
    if (chart && echarts) {
      const c = echarts.init(chart);
      c.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left', textStyle: { color: '#a0a0b0' } },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 45000, name: 'AI对话', itemStyle: { color: '#5e6ad2' } },
            { value: 32000, name: '内容创作', itemStyle: { color: '#00b8cc' } },
            { value: 28000, name: '数据分析', itemStyle: { color: '#10b981' } },
            { value: 18000, name: '智能推荐', itemStyle: { color: '#f59e0b' } },
            { value: 12000, name: '其他', itemStyle: { color: '#6b6b7b' } }
          ]
        }],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
      });
    }
  }, 100);
}

// ============================================
// 页面渲染函数 - 流失预警
// ============================================
function renderPlatformChurnWarningPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">流失预警</h1>
        <p class="page-subtitle">高流失风险商家预警</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">高风险</div>
          <div class="stat-value">12</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">中风险</div>
          <div class="stat-value">35</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="shield"></i></div>
        <div class="stat-content">
          <div class="stat-label">低风险</div>
          <div class="stat-value">89</div>
        </div>
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>商家</th><th>风险等级</th><th>流失原因</th><th>最近活跃</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>重庆小面</td><td><span class="badge badge-danger">高风险</span></td><td>长期不活跃</td><td>15天前</td><td><button class="btn btn-sm btn-primary">联系</button></td></tr>
          <tr><td>成都串串香</td><td><span class="badge badge-danger">高风险</span></td><td>即将到期</td><td>3天前</td><td><button class="btn btn-sm btn-primary">联系</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 公告推送
// ============================================
function renderPlatformAnnouncementsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">公告推送</h1>
        <p class="page-subtitle">向商家推送系统公告</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增公告</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>标题</th><th>类型</th><th>发送范围</th><th>发送时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>系统升级通知</td><td>系统</td><td>全部商家</td><td>2024-12-01 10:00</td><td><span class="badge badge-success">已发送</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
          <tr><td>新功能上线</td><td>功能</td><td>旗舰版商家</td><td>2024-11-28 09:00</td><td><span class="badge badge-success">已发送</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="eye"></i></button></td></tr>
        <tr><td>圣诞活动通知</td><td>活动</td><td>全部商家</td><td>-</td><td><span class="badge badge-gray">草稿</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 操作日志
// ============================================
function renderPlatformOperationLogsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">操作日志</h1>
        <p class="page-subtitle">平台操作审计追踪</p>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-group search-input">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索操作人...">
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>时间</th><th>操作人</th><th>操作类型</th><th>操作内容</th><th>IP地址</th></tr></thead>
        <tbody>
          <tr><td>2024-12-01 14:32:18</td><td>管理员</td><td>商家管理</td><td>修改商家"北京湘菜馆"状态</td><td>192.168.1.100</td></tr>
          <tr><td>2024-12-01 13:25:06</td><td>客服-张三</td><td>工单处理</td><td>处理工单#TK202412001</td><td>192.168.1.105</td></tr>
          <tr><td>2024-12-01 11:18:45</td><td>财务-李四</td><td>财务操作</td><td>审核退款申请</td><td>192.168.1.110</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 消息通知
// ============================================
function renderPlatformNotificationsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">消息通知</h1>
        <p class="page-subtitle">系统消息与提醒设置</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">通知渠道配置</h3></div>
      <div class="setting-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">邮件通知</div>
            <div class="setting-desc">接收重要通知邮件</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">短信通知</div>
            <div class="setting-desc">接收关键告警短信</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">站内信</div>
            <div class="setting-desc">系统内部消息通知</div>
          </div>
          <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
        </div>
      </div>
    </div>
    
    <style>
      .setting-list { display: flex; flex-direction: column; }
      .setting-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border); }
      .setting-item:last-child { border-bottom: none; }
      .setting-title { font-weight: 500; margin-bottom: 4px; }
      .setting-desc { font-size: 0.85rem; color: var(--text-muted); }
      .switch { position: relative; width: 48px; height: 24px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; inset: 0; background: var(--border); border-radius: 24px; transition: 0.3s; }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
      input:checked + .slider { background: var(--primary); }
      input:checked + .slider:before { transform: translateX(24px); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 通道监控
// ============================================
function renderPlatformPaymentChannelsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">通道监控</h1>
        <p class="page-subtitle">支付通道状态监控</p>
      </div>
    </div>
    
    <div class="channel-list">
      <div class="channel-item">
        <div class="channel-icon success"><i data-lucide="check-circle"></i></div>
        <div class="channel-info">
          <div class="channel-name">支付宝通道</div>
          <div class="channel-status">正常运行中</div>
        </div>
        <div class="channel-metrics">
          <div class="metric"><span class="metric-label">成功率</span><span class="metric-value success">99.8%</span></div>
          <div class="metric"><span class="metric-label">TPS</span><span class="metric-value">2,580</span></div>
        </div>
      </div>
      <div class="channel-item">
        <div class="channel-icon success"><i data-lucide="check-circle"></i></div>
        <div class="channel-info">
          <div class="channel-name">微信支付通道</div>
          <div class="channel-status">正常运行中</div>
        </div>
        <div class="channel-metrics">
          <div class="metric"><span class="metric-label">成功率</span><span class="metric-value success">99.6%</span></div>
          <div class="metric"><span class="metric-label">TPS</span><span class="metric-value">2,120</span></div>
        </div>
      </div>
      <div class="channel-item">
        <div class="channel-icon warning"><i data-lucide="alert-circle"></i></div>
        <div class="channel-info">
          <div class="channel-name">银行卡通道</div>
          <div class="channel-status warning">响应延迟</div>
        </div>
        <div class="channel-metrics">
          <div class="metric"><span class="metric-label">成功率</span><span class="metric-value warning">98.2%</span></div>
          <div class="metric"><span class="metric-label">TPS</span><span class="metric-value">380</span></div>
        </div>
      </div>
    </div>
    
    <style>
      .channel-list { display: flex; flex-direction: column; gap: 12px; }
      .channel-item { display: flex; align-items: center; gap: 20px; background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .channel-icon { width: 48px; height: 48px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .channel-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      .channel-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
      .channel-info { flex: 1; }
      .channel-name { font-weight: 600; margin-bottom: 4px; }
      .channel-status { font-size: 0.85rem; color: var(--text-muted); }
      .channel-status.warning { color: var(--warning); }
      .channel-metrics { display: flex; gap: 24px; }
      .metric { text-align: center; }
      .metric-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
      .metric-value { font-weight: 600; }
      .metric-value.success { color: var(--success); }
      .metric-value.warning { color: var(--warning); }
    </style>
  `;
}

// ============================================
// 平台端页面路由
// ============================================
const platformPages = {
  'platform-overview': renderPlatformOverviewPage,
  'platform-merchants': renderPlatformMerchantsPage,
  'platform-merchant-detail': renderMerchantDetailPage,
  'platform-agents': renderPlatformAgentsPage,
  'platform-revenue': renderPlatformRevenuePage,
  'platform-transactions': renderPlatformTransactionsPage,
  'platform-tickets': renderPlatformTicketsPage,
  'platform-roles': renderPlatformRolesPage,
  'platform-knowledge-base': renderPlatformKnowledgeBasePage,
  'platform-ai-stats': renderPlatformAIStatsPage,
  'platform-churn-warning': renderPlatformChurnWarningPage,
  'platform-announcements': renderPlatformAnnouncementsPage,
  'platform-operation-logs': renderPlatformOperationLogsPage,
  'platform-notifications': renderPlatformNotificationsPage,
  'platform-payment-channels': renderPlatformPaymentChannelsPage
};

// 覆盖renderPage函数
async function renderPage(pageId, params = {}) {
  const content = document.getElementById('contentArea');
  if (!content) return;
  
  content.innerHTML = '<div class="page-content" style="animation:fadeIn 0.3s ease"><div class="loading-spinner"><i data-lucide="loader-2" class="animate-spin"></i> 加载中...</div></div>';
  lucide.createIcons();
  
  setTimeout(() => {
    content.innerHTML = '<div class="page-content">';
    if (platformPages[pageId]) {
      platformPages[pageId](content);
    } else {
      platformPages['platform-overview'](content);
    }
    content.innerHTML += '</div>';
    setTimeout(() => lucide.createIcons(), 0);
  }, 100);
}

// 初始化平台端
document.addEventListener('DOMContentLoaded', function() {
  window.APP_ROLE = 'platform';
  
  lucide.createIcons();
  renderSidebar();
  
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
  });
  
  initSidebarSearch();
  initMobileAdaptation();
  initGlobalSearch();
  
  navigateTo('platform-overview');
  
  console.log('店赢OS平台端模块加载完成');
});
