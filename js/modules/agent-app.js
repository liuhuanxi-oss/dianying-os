/**
 * 店赢OS - 代理商端核心模块
 * 包含：代理商端菜单配置、页面路由、Mock数据、页面渲染函数
 */

// ============================================
// 代理商端菜单配置
// ============================================
const agentMenuConfig = [
  {
    section: '我的商户',
    icon: 'store',
    items: [
      { id: 'agent-merchants', name: '商户列表', icon: 'list' },
      { id: 'agent-add-merchant', name: '新增商户', icon: 'plus-circle' },
      { id: 'agent-merchant-detail', name: '商户详情', icon: 'building-2' }
    ]
  },
  {
    section: '业绩统计',
    icon: 'bar-chart',
    items: [
      { id: 'agent-overview', name: '业绩看板', icon: 'layout-dashboard' },
      { id: 'agent-performance', name: '业绩明细', icon: 'trending-up' },
      { id: 'agent-growth', name: '商户增长', icon: 'users' }
    ]
  },
  {
    section: '分润查看',
    icon: 'wallet',
    items: [
      { id: 'agent-commission', name: '我的分润', icon: 'percent' },
      { id: 'agent-settlement', name: '结算记录', icon: 'file-text' },
      { id: 'agent-withdraw', name: '提现申请', icon: 'banknote' }
    ]
  },
  {
    section: '客户管理',
    icon: 'users',
    items: [
      { id: 'agent-customer-assign', name: '客户分配', icon: 'user-plus' },
      { id: 'agent-sales', name: '业务员管理', icon: 'user-cog' },
      { id: 'agent-visit', name: '跟访记录', icon: 'map-pin' }
    ]
  },
  {
    section: '基础数据',
    icon: 'database',
    items: [
      { id: 'agent-report', name: '数据报表', icon: 'bar-chart' },
      { id: 'agent-tickets', name: '工单查询', icon: 'ticket' }
    ]
  }
];

// ============================================
// 代理商端Mock数据
// ============================================
AgentApp = {
  data: {
    stats: {
      totalMerchants: 156,
      activeMerchants: 138,
      monthGmv: 2850000,
      monthCommission: 85600,
      pendingWithdraw: 25000
    },
    merchants: [
      { id: 1, name: '北京湘菜馆', version: '旗舰版', status: 'active', gmv: 1285000, commission: 3855 },
      { id: 2, name: '上海小笼包', version: '专业版', status: 'active', gmv: 856000, commission: 2568 },
      { id: 3, name: '广州茶餐厅', version: '免费版', status: 'active', gmv: 320000, commission: 960 },
      { id: 4, name: '深圳火锅店', version: '旗舰版', status: 'active', gmv: 2150000, commission: 6450 },
      { id: 5, name: '成都串串香', version: '专业版', status: 'expiring', gmv: 680000, commission: 2040 }
    ],
    commission: {
      thisMonth: 85600,
      lastMonth: 78200,
      total: 1256000,
      pending: 25000
    }
  }
};

// ============================================
// 覆盖getActiveMenuConfig
// ============================================
function getActiveMenuConfig() {
  return agentMenuConfig;
}

// ============================================
// 页面渲染函数 - 业绩看板
// ============================================
function renderAgentOverviewPage(container) {
  const stats = AgentApp.data.stats;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">业绩看板</h1>
        <p class="page-subtitle">代理商业绩总览</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="refresh-cw"></i> 刷新</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">我的商户</div>
          <div class="stat-value">${stats.totalMerchants}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +8</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商户</div>
          <div class="stat-value">${stats.activeMerchants}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月GMV</div>
          <div class="stat-value">¥${(stats.monthGmv/10000).toFixed(1)}万</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +12.5%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月分润</div>
          <div class="stat-value">¥${(stats.monthCommission/10000).toFixed(2)}万</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +15.2%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">分润趋势</h3></div>
        <div id="commissionTrendChart" style="height:280px;"></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">商户增长</h3></div>
        <div id="merchantGrowthChart" style="height:280px;"></div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">Top5 商户</h3>
      </div>
      <table class="table">
        <thead><tr><th>商户</th><th>版本</th><th>状态</th><th>GMV</th><th>分润</th></tr></thead>
        <tbody>
          ${AgentApp.data.merchants.slice(0, 5).map(m => `
            <tr>
              <td>${m.name}</td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
              <td>¥${m.gmv.toLocaleString()}</td>
              <td class="text-success">¥${m.commission.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  setTimeout(() => {
    initAgentCharts();
  }, 100);
}

function initAgentCharts() {
  // 分润趋势
  const commissionChart = document.getElementById('commissionTrendChart');
  if (commissionChart && echarts) {
    const chart = echarts.init(commissionChart);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['7月', '8月', '9月', '10月', '11月', '12月'], axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
      series: [{ type: 'line', data: [68000, 72000, 75000, 78200, 82000, 85600], smooth: true, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(245,158,11,0.3)' }, { offset: 1, color: 'rgba(245,158,11,0)' }]) }, lineStyle: { color: '#f59e0b' } }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
  
  // 商户增长
  const merchantChart = document.getElementById('merchantGrowthChart');
  if (merchantChart && echarts) {
    const chart = echarts.init(merchantChart);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['7月', '8月', '9月', '10月', '11月', '12月'], axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
      series: [{ type: 'bar', data: [120, 128, 135, 142, 148, 156], itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#ef4444' }]) }, barWidth: '50%' }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
}

// ============================================
// 页面渲染函数 - 商户列表
// ============================================
function renderAgentMerchantsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">商户列表</h1>
        <p class="page-subtitle">我代理的商户</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增商户</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商户总数</div>
          <div class="stat-value">${AgentApp.data.stats.totalMerchants}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商户</div>
          <div class="stat-value">${AgentApp.data.stats.activeMerchants}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">即将到期</div>
          <div class="stat-value">${AgentApp.data.merchants.filter(m => m.status === 'expiring').length}</div>
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
        <input type="text" class="form-input" placeholder="搜索商户...">
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead>
          <tr><th>商户名称</th><th>版本</th><th>状态</th><th>GMV</th><th>分润</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${AgentApp.data.merchants.map(m => `
            <tr>
              <td><div class="flex items-center gap-3"><div class="avatar">${m.name.charAt(0)}</div><span class="font-medium">${m.name}</span></div></td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
              <td>¥${m.gmv.toLocaleString()}</td>
              <td class="text-success">¥${m.commission.toLocaleString()}</td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button>
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

// ============================================
// 页面渲染函数 - 新增商户
// ============================================
function renderAgentAddMerchantPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">新增商户</h1>
        <p class="page-subtitle">快速创建新商户账号</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">商户信息</h3></div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">商户名称 <span class="text-danger">*</span></label>
          <input type="text" class="form-input" placeholder="请输入商户名称">
        </div>
        <div class="form-group">
          <label class="form-label">行业类别 <span class="text-danger">*</span></label>
          <select class="form-select">
            <option value="">请选择行业</option>
            <option value="餐饮">餐饮</option>
            <option value="零售">零售</option>
            <option value="休娱">休娱</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">联系人</label>
          <input type="text" class="form-input" placeholder="请输入联系人">
        </div>
        <div class="form-group">
          <label class="form-label">联系电话</label>
          <input type="tel" class="form-input" placeholder="请输入联系电话">
        </div>
        <div class="form-group">
          <label class="form-label">开通版本</label>
          <select class="form-select">
            <option value="免费版">免费版</option>
            <option value="专业版">专业版</option>
            <option value="旗舰版">旗舰版</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">业务员</label>
          <select class="form-select">
            <option value="">请选择业务员</option>
            <option value="张三">张三</option>
            <option value="李四">李四</option>
          </select>
        </div>
      </div>
      <div class="page-actions mt-6">
        <button class="btn btn-secondary">取消</button>
        <button class="btn btn-primary" onclick="submitAddMerchant()">确认创建</button>
      </div>
    </div>
    
    <style>
      .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    </style>
  `;
}

function submitAddMerchant() {
  Toast.success('创建成功', '商户账号已创建');
  navigateTo('agent-merchants');
}

// ============================================
// 页面渲染函数 - 我的分润
// ============================================
function renderAgentCommissionPage(container) {
  const commission = AgentApp.data.commission;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">我的分润</h1>
        <p class="page-subtitle">分润收益明细</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月分润</div>
          <div class="stat-value">¥${commission.thisMonth.toLocaleString()}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +9.5%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="calendar"></i></div>
        <div class="stat-content">
          <div class="stat-label">上月分润</div>
          <div class="stat-value">¥${commission.lastMonth.toLocaleString()}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="bank"></i></div>
        <div class="stat-content">
          <div class="stat-label">累计分润</div>
          <div class="stat-value">¥${(commission.total/10000).toFixed(1)}万</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="credit-card"></i></div>
        <div class="stat-content">
          <div class="stat-label">待提现</div>
          <div class="stat-value">¥${commission.pending.toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">分润规则</h3>
      </div>
      <div class="commission-rules">
        <div class="rule-item">
          <div class="rule-version">旗舰版</div>
          <div class="rule-rate">分润比例：0.3%</div>
        </div>
        <div class="rule-item">
          <div class="rule-version">专业版</div>
          <div class="rule-rate">分润比例：0.3%</div>
        </div>
        <div class="rule-item">
          <div class="rule-version">免费版</div>
          <div class="rule-rate">分润比例：0.3%</div>
        </div>
      </div>
    </div>
    
    <style>
      .commission-rules { display: flex; gap: 20px; }
      .rule-item { flex: 1; padding: 20px; background: var(--bg-card-hover); border-radius: var(--radius); text-align: center; }
      .rule-version { font-weight: 600; margin-bottom: 8px; }
      .rule-rate { color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 结算记录
// ============================================
function renderAgentSettlementPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">结算记录</h1>
        <p class="page-subtitle">分润结算明细</p>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-group">
        <select class="filter-select">
          <option>全部状态</option>
          <option>已结算</option>
          <option>待结算</option>
        </select>
      </div>
      <div class="filter-group">
        <select class="filter-select">
          <option>全部月份</option>
          <option>2024年12月</option>
          <option>2024年11月</option>
          <option>2024年10月</option>
        </select>
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>结算周期</th><th>商户数</th><th>分润金额</th><th>状态</th><th>结算时间</th></tr></thead>
        <tbody>
          <tr><td>2024年11月</td><td>148</td><td class="text-success">¥78,200</td><td><span class="badge badge-success">已结算</span></td><td>2024-12-05</td></tr>
          <tr><td>2024年10月</td><td>142</td><td class="text-success">¥75,000</td><td><span class="badge badge-success">已结算</span></td><td>2024-11-05</td></tr>
          <tr><td>2024年9月</td><td>135</td><td class="text-success">¥72,500</td><td><span class="badge badge-success">已结算</span></td><td>2024-10-05</td></tr>
          <tr><td>2024年12月</td><td>156</td><td>¥85,600</td><td><span class="badge badge-warning">待结算</span></td><td>-</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 提现申请
// ============================================
function renderAgentWithdrawPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">提现申请</h1>
        <p class="page-subtitle">分润提现到账</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">可提现金额</h3></div>
      <div class="withdraw-amount">
        <span class="currency">¥</span>
        <span class="amount">${AgentApp.data.commission.pending.toLocaleString()}</span>
      </div>
      <div class="withdraw-form">
        <div class="form-group">
          <label class="form-label">提现金额</label>
          <input type="number" class="form-input" value="${AgentApp.data.commission.pending}" placeholder="请输入提现金额">
        </div>
        <div class="form-group">
          <label class="form-label">收款账户</label>
          <div class="account-info">
            <div class="account-icon"><i data-lucide="building"></i></div>
            <div class="account-detail">
              <div class="account-name">中国工商银行</div>
              <div class="account-number">**** **** **** 1234</div>
            </div>
          </div>
        </div>
        <div class="page-actions mt-6">
          <button class="btn btn-primary btn-lg" onclick="submitWithdraw()">立即提现</button>
        </div>
      </div>
    </div>
    
    <style>
      .withdraw-amount { text-align: center; padding: 30px 0; }
      .withdraw-amount .currency { font-size: 1.5rem; color: var(--text-muted); margin-right: 4px; }
      .withdraw-amount .amount { font-size: 3rem; font-weight: 700; color: var(--success); }
      .account-info { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-card-hover); border-radius: var(--radius); }
      .account-icon { width: 40px; height: 40px; background: var(--primary); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .account-name { font-weight: 600; }
      .account-number { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

function submitWithdraw() {
  ConfirmDialog.show('提现确认', '确定要提现¥25,000吗？', () => {
    Toast.success('申请成功', '预计1-3个工作日到账');
  });
}

// ============================================
// 页面渲染函数 - 业绩明细
// ============================================
function renderAgentPerformancePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">业绩明细</h1>
        <p class="page-subtitle">各商户业绩详情</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="download"></i> 导出</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>商户名称</th><th>版本</th><th>本月GMV</th><th>本月分润</th><th>累计GMV</th><th>累计分润</th></tr></thead>
        <tbody>
          ${AgentApp.data.merchants.map(m => `
            <tr>
              <td>${m.name}</td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td>¥${m.gmv.toLocaleString()}</td>
              <td class="text-success">¥${m.commission.toLocaleString()}</td>
              <td>¥${(m.gmv * 1.2).toLocaleString()}</td>
              <td class="text-success">¥${(m.commission * 1.2).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 商户增长
// ============================================
function renderAgentGrowthPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">商户增长</h1>
        <p class="page-subtitle">商户增长趋势分析</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月新增</div>
          <div class="stat-value">8</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="user-plus"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月转化</div>
          <div class="stat-value">3</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="percent"></i></div>
        <div class="stat-content">
          <div class="stat-label">转化率</div>
          <div class="stat-value">37.5%</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">增长趋势</h3></div>
      <div id="growthChart" style="height:300px;"></div>
    </div>
  `;
  
  setTimeout(() => {
    const chart = document.getElementById('growthChart');
    if (chart && echarts) {
      const c = echarts.init(chart);
      c.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['商户总数', '新增商户'], textStyle: { color: '#a0a0b0' } },
        xAxis: { type: 'category', data: ['7月', '8月', '9月', '10月', '11月', '12月'], axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
        series: [
          { name: '商户总数', type: 'line', data: [120, 128, 135, 142, 148, 156], smooth: true },
          { name: '新增商户', type: 'bar', data: [8, 8, 7, 7, 6, 8], barWidth: '30%' }
        ],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
      });
    }
  }, 100);
}

// ============================================
// 页面渲染函数 - 客户分配
// ============================================
function renderAgentCustomerAssignPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">客户分配</h1>
        <p class="page-subtitle">商户分配给业务员</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增分配</button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>商户名称</th><th>负责人</th><th>分配时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>北京湘菜馆</td><td>张三</td><td>2024-01-15</td><td><span class="badge badge-success">进行中</span></td><td><button class="btn btn-sm btn-ghost">调整</button></td></tr>
          <tr><td>上海小笼包</td><td>李四</td><td>2024-02-20</td><td><span class="badge badge-success">进行中</span></td><td><button class="btn btn-sm btn-ghost">调整</button></td></tr>
          <tr><td>广州茶餐厅</td><td>王五</td><td>2024-03-10</td><td><span class="badge badge-success">进行中</span></td><td><button class="btn btn-sm btn-ghost">调整</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 业务员管理
// ============================================
function renderAgentSalesPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">业务员管理</h1>
        <p class="page-subtitle">管理我的业务团队</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增业务员</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">业务员总数</div>
          <div class="stat-value">12</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="user-check"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃业务员</div>
          <div class="stat-value">10</div>
        </div>
      </div>
    </div>
    
    <div class="table-container mt-6">
      <table class="table">
        <thead><tr><th>姓名</th><th>手机号</th><th>负责商户</th><th>本月新增</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>张三</td><td>138****1234</td><td>28</td><td>5</td><td><span class="badge badge-success">活跃</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>李四</td><td>139****5678</td><td>35</td><td>7</td><td><span class="badge badge-success">活跃</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>王五</td><td>137****9012</td><td>18</td><td>3</td><td><span class="badge badge-success">活跃</span></td><td><button class="btn btn-sm btn-ghost"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 跟访记录
// ============================================
function renderAgentVisitPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">跟访记录</h1>
        <p class="page-subtitle">商户拜访记录</p>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>商户</th><th>业务员</th><th>拜访时间</th><th>拜访类型</th><th>跟进情况</th></tr></thead>
        <tbody>
          <tr><td>北京湘菜馆</td><td>张三</td><td>2024-12-01 14:30</td><td>日常拜访</td><td>商户经营正常</td></tr>
          <tr><td>上海小笼包</td><td>李四</td><td>2024-11-30 10:00</td><td>问题跟进</td><td>处理续费事宜</td></tr>
          <tr><td>广州茶餐厅</td><td>王五</td><td>2024-11-28 16:00</td><td>日常拜访</td><td>商户运营良好</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 数据报表
// ============================================
function renderAgentReportPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">数据报表</h1>
        <p class="page-subtitle">业务数据统计</p>
      </div>
    </div>
    
    <div class="report-cards">
      <div class="report-card">
        <div class="report-icon"><i data-lucide="file-text"></i></div>
        <div class="report-info">
          <div class="report-title">业绩汇总表</div>
          <div class="report-desc">按月统计业绩</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
      <div class="report-card">
        <div class="report-icon"><i data-lucide="users"></i></div>
        <div class="report-info">
          <div class="report-title">商户明细表</div>
          <div class="report-desc">商户详细信息</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
      <div class="report-card">
        <div class="report-icon"><i data-lucide="wallet"></i></div>
        <div class="report-info">
          <div class="report-title">分润明细表</div>
          <div class="report-desc">分润计算明细</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
    </div>
    
    <style>
      .report-cards { display: flex; flex-direction: column; gap: 12px; }
      .report-card { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
      .report-icon { width: 48px; height: 48px; background: var(--bg-card-hover); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .report-icon i { width: 24px; height: 24px; color: var(--primary); }
      .report-info { flex: 1; }
      .report-title { font-weight: 600; margin-bottom: 4px; }
      .report-desc { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 工单查询
// ============================================
function renderAgentTicketsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">工单查询</h1>
        <p class="page-subtitle">商户工单状态查询</p>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead><tr><th>工单号</th><th>商户</th><th>标题</th><th>状态</th><th>更新时间</th></tr></thead>
        <tbody>
          <tr><td>TK202412001</td><td>北京湘菜馆</td><td>AI助手响应缓慢</td><td><span class="badge badge-warning">处理中</span></td><td>2024-12-01 10:30</td></tr>
          <tr><td>TK202412002</td><td>上海小笼包</td><td>如何开通数据分析功能</td><td><span class="badge badge-warning">处理中</span></td><td>2024-12-01 14:15</td></tr>
          <tr><td>TK202412003</td><td>深圳火锅店</td><td>发票开具申请</td><td><span class="badge badge-success">已解决</span></td><td>2024-11-30 09:20</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 代理商端页面路由
// ============================================
const agentPages = {
  'agent-overview': renderAgentOverviewPage,
  'agent-merchants': renderAgentMerchantsPage,
  'agent-add-merchant': renderAgentAddMerchantPage,
  'agent-commission': renderAgentCommissionPage,
  'agent-settlement': renderAgentSettlementPage,
  'agent-withdraw': renderAgentWithdrawPage,
  'agent-performance': renderAgentPerformancePage,
  'agent-growth': renderAgentGrowthPage,
  'agent-customer-assign': renderAgentCustomerAssignPage,
  'agent-sales': renderAgentSalesPage,
  'agent-visit': renderAgentVisitPage,
  'agent-report': renderAgentReportPage,
  'agent-tickets': renderAgentTicketsPage
};

// 覆盖renderPage函数
async function renderPage(pageId, params = {}) {
  const content = document.getElementById('contentArea');
  if (!content) return;
  
  content.innerHTML = '<div class="page-content" style="animation:fadeIn 0.3s ease"><div class="loading-spinner"><i data-lucide="loader-2" class="animate-spin"></i> 加载中...</div></div>';
  lucide.createIcons();
  
  setTimeout(() => {
    content.innerHTML = '<div class="page-content">';
    if (agentPages[pageId]) {
      agentPages[pageId](content);
    } else {
      agentPages['agent-overview'](content);
    }
    content.innerHTML += '</div>';
    setTimeout(() => lucide.createIcons(), 0);
  }, 100);
}

// 初始化代理商端
document.addEventListener('DOMContentLoaded', function() {
  window.APP_ROLE = 'agent';
  
  lucide.createIcons();
  renderSidebar();
  
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
  });
  
  initSidebarSearch();
  initMobileAdaptation();
  
  navigateTo('agent-overview');
  
  console.log('店赢OS代理商端模块加载完成');
});
