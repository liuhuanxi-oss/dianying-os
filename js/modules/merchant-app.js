/**
 * 店赢OS - 商家端核心模块
 * 包含：商家端菜单配置、页面路由、Mock数据、页面渲染函数
 */

// ============================================
// 商家端菜单配置（32个PRD功能模块）
// ============================================
const merchantMenuConfig = [
  {
    section: '核心功能',
    icon: 'layout-dashboard',
    items: [
      { id: 'merchant-overview', name: '运营概览', icon: 'layout-dashboard' },
      { id: 'merchant-ai-chat', name: 'AI对话', icon: 'bot' },
      { id: 'merchant-report', name: '数据报表', icon: 'bar-chart' },
      { id: 'merchant-alipay', name: 'AI支付宝', icon: 'qr-code' },
      { id: 'merchant-knowledge', name: '知识库', icon: 'book-open' },
      { id: 'merchant-log', name: '决策日志', icon: 'history' }
    ]
  },
  {
    section: '智能分析',
    icon: 'heart-pulse',
    items: [
      { id: 'merchant-health', name: '门店健康', icon: 'heart-pulse' },
      { id: 'merchant-bi', name: 'BI分析', icon: 'bar-chart-2', link: 'dashboard-bi.html', external: true },
      { id: 'merchant-calendar', name: '运营日历', icon: 'calendar' },
      { id: 'merchant-report-center', name: '报表中心', icon: 'file-spreadsheet' },
      { id: 'merchant-roi', name: 'ROI计算', icon: 'calculator' },
      { id: 'merchant-competitor', name: '竞品监控', icon: 'radar' },
      { id: 'merchant-inventory', name: '库存预警', icon: 'package' }
    ]
  },
  {
    section: 'AI能力',
    icon: 'sparkles',
    items: [
      { id: 'merchant-marketing', name: 'AI内容创作', icon: 'sparkles' },
      { id: 'merchant-insight', name: 'AI洞察日报', icon: 'newspaper' },
      { id: 'merchant-digital', name: '门店数字孪生', icon: 'scan' },
      { id: 'merchant-voice', name: '语音交互', icon: 'mic' }
    ]
  },
  {
    section: '运营管理',
    icon: 'store',
    items: [
      { id: 'merchant-campaigns', name: '营销工具', icon: 'megaphone' },
      { id: 'merchant-tickets', name: '工单系统', icon: 'ticket' },
      { id: 'merchant-permission', name: '权限管理', icon: 'shield' },
      { id: 'merchant-notify', name: '消息通知', icon: 'bell-ring' },
      { id: 'merchant-multi-store', name: '多门店管理', icon: 'building-2' },
      { id: 'merchant-member', name: '会员体系', icon: 'users' },
      { id: 'merchant-payment', name: '支付分账', icon: 'credit-card' },
      { id: 'merchant-supply', name: '供应链管理', icon: 'truck' },
      { id: 'merchant-pricing', name: '智能定价', icon: 'tag' }
    ]
  },
  {
    section: '系统',
    icon: 'settings',
    items: [
      { id: 'merchant-changelog', name: '更新日志', icon: 'git-commit' },
      { id: 'merchant-alert', name: '智能预警', icon: 'alert-triangle' },
      { id: 'merchant-inspect', name: '门店巡检', icon: 'clipboard-check' },
      { id: 'merchant-deploy', name: '私有化部署', icon: 'server' },
      { id: 'merchant-export', name: '数据导出', icon: 'download' }
    ]
  }
];

// ============================================
// 商家端Mock数据
// ============================================
MerchantApp.data = {
  // 今日概览
  todayStats: {
    revenue: 28560,
    orders: 156,
    customers: 89,
    avgOrder: 183
  },
  // 本周趋势
  weekTrend: [
    { day: '周一', revenue: 24500, orders: 132 },
    { day: '周二', revenue: 26800, orders: 145 },
    { day: '周三', revenue: 25200, orders: 138 },
    { day: '周四', revenue: 27800, orders: 152 },
    { day: '周五', revenue: 28560, orders: 156 },
    { day: '周六', revenue: 31200, orders: 168 },
    { day: '周日', revenue: 29800, orders: 162 }
  ],
  // 门店列表
  stores: [
    { id: 1, name: '北京湘菜馆(总店)', status: 'online', todayRevenue: 18560, orders: 98 },
    { id: 2, name: '北京湘菜馆(朝阳店)', status: 'online', todayRevenue: 6800, orders: 36 },
    { id: 3, name: '北京湘菜馆(海淀店)', status: 'offline', todayRevenue: 3200, orders: 22 }
  ],
  // AI对话记录
  aiMessages: [
    { id: 1, role: 'user', content: '今天的营业情况怎么样？', time: '10:30' },
    { id: 2, role: 'assistant', content: '今日营业情况良好！截至10:30，已完成订单98单，营收18560元，较昨日同期增长12%。', time: '10:30' },
    { id: 3, role: 'user', content: '有什么需要改进的地方吗？', time: '10:31' },
    { id: 4, role: 'assistant', content: '建议关注：1）午餐高峰期(11:30-13:00)出餐速度下降23%；2）招牌菜"剁椒鱼头"库存仅剩15份，建议补货。', time: '10:31' }
  ],
  // 会员数据
  members: [
    { id: 1, name: '张先生', phone: '138****1234', level: 'gold', points: 8500, lastVisit: '2024-12-01' },
    { id: 2, name: '李女士', phone: '139****5678', level: 'silver', points: 3200, lastVisit: '2024-11-28' },
    { id: 3, name: '王先生', phone: '137****9012', level: 'bronze', points: 1200, lastVisit: '2024-11-25' }
  ],
  // 工单列表
  tickets: [
    { id: 'TK001', title: 'POS机打印故障', type: '设备', status: 'open', createTime: '2024-12-01 09:30' },
    { id: 'TK002', title: '会员积分规则咨询', type: '咨询', status: 'pending', createTime: '2024-11-30 14:20' },
    { id: 'TK003', title: '退款申请', type: '财务', status: 'resolved', createTime: '2024-11-29 16:45' }
  ],
  // 健康评分
  healthScore: {
    overall: 87,
    revenue: 92,
    service: 85,
    inventory: 78,
    customer: 93
  },
  // 库存预警
  inventoryAlerts: [
    { name: '剁椒鱼头', current: 15, min: 30, unit: '份' },
    { name: '腊肉', current: 8, min: 20, unit: '斤' },
    { name: '辣椒', current: 5, min: 15, unit: '斤' }
  ]
};

// ============================================
// 商家端路由配置
// ============================================
const merchantPageModules = {};

// ============================================
// 覆盖getActiveMenuConfig函数
// ============================================
function getActiveMenuConfig() {
  return merchantMenuConfig;
}

// ============================================
// 页面渲染函数 - 运营概览
// ============================================
function renderMerchantOverviewPage(container) {
  const stats = MerchantApp.data.todayStats;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">运营概览</h1>
        <p class="page-subtitle">今日经营数据实时监控</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="refresh-cw"></i> 刷新</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">今日营收</div>
          <div class="stat-value">¥${stats.revenue.toLocaleString()}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +12.5%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="shopping-bag"></i></div>
        <div class="stat-content">
          <div class="stat-label">订单数</div>
          <div class="stat-value">${stats.orders}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +8.3%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">顾客数</div>
          <div class="stat-value">${stats.customers}</div>
          <div class="stat-trend up"><i data-lucide="trending-up"></i> +5.2%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="receipt"></i></div>
        <div class="stat-content">
          <div class="stat-label">客单价</div>
          <div class="stat-value">¥${stats.avgOrder}</div>
          <div class="stat-trend down"><i data-lucide="trending-down"></i> -2.1%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid mt-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">本周营收趋势</h3>
        </div>
        <div id="weekRevenueChart" style="height:300px;"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">门店健康度</h3>
        </div>
        <div class="health-scores">
          <div class="health-item">
            <span class="health-label">综合评分</span>
            <div class="health-bar"><div class="health-fill" style="width:${MerchantApp.data.healthScore.overall}%"></div></div>
            <span class="health-value">${MerchantApp.data.healthScore.overall}</span>
          </div>
          <div class="health-item">
            <span class="health-label">营收能力</span>
            <div class="health-bar"><div class="health-fill" style="width:${MerchantApp.data.healthScore.revenue}%"></div></div>
            <span class="health-value">${MerchantApp.data.healthScore.revenue}</span>
          </div>
          <div class="health-item">
            <span class="health-label">服务体验</span>
            <div class="health-bar"><div class="health-fill" style="width:${MerchantApp.data.healthScore.service}%"></div></div>
            <span class="health-value">${MerchantApp.data.healthScore.service}</span>
          </div>
          <div class="health-item">
            <span class="health-label">库存管理</span>
            <div class="health-bar"><div class="health-fill" style="width:${MerchantApp.data.healthScore.inventory}%"></div></div>
            <span class="health-value">${MerchantApp.data.healthScore.inventory}</span>
          </div>
          <div class="health-item">
            <span class="health-label">客户满意度</span>
            <div class="health-bar"><div class="health-fill" style="width:${MerchantApp.data.healthScore.customer}%"></div></div>
            <span class="health-value">${MerchantApp.data.healthScore.customer}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid-2 mt-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">多门店概况</h3>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>门店名称</th>
              <th>状态</th>
              <th>今日营收</th>
              <th>订单数</th>
            </tr>
          </thead>
          <tbody>
            ${MerchantApp.data.stores.map(s => `
              <tr>
                <td>${s.name}</td>
                <td><span class="badge badge-${s.status === 'online' ? 'success' : 'danger'}">${s.status === 'online' ? '营业中' : '已打烊'}</span></td>
                <td>¥${s.todayRevenue.toLocaleString()}</td>
                <td>${s.orders}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">库存预警</h3>
        </div>
        <div class="inventory-alerts">
          ${MerchantApp.data.inventoryAlerts.map(item => `
            <div class="alert-item">
              <div class="alert-icon danger"><i data-lucide="alert-triangle"></i></div>
              <div class="alert-content">
                <div class="alert-title">${item.name}库存不足</div>
                <div class="alert-desc">当前${item.current}${item.unit}，低于最低库存${item.min}${item.unit}</div>
              </div>
              <button class="btn btn-sm btn-primary">补货</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    initMerchantCharts();
  }, 100);
}

function initMerchantCharts() {
  // 本周营收趋势图
  const chartDom = document.getElementById('weekRevenueChart');
  if (chartDom && echarts) {
    const chart = echarts.init(chartDom);
    const trend = MerchantApp.data.weekTrend;
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['营收'], textStyle: { color: '#a0a0b0' } },
      xAxis: { type: 'category', data: trend.map(t => t.day), axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
      series: [{ name: '营收', type: 'bar', data: trend.map(t => t.revenue), itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#5e6ad2' }, { offset: 1, color: '#00b8cc' }]) }, barWidth: '40%' }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
}

// ============================================
// 页面渲染函数 - AI对话
// ============================================
function renderMerchantAIChatPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI对话</h1>
        <p class="page-subtitle">智能助手24小时在线解答</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="sparkles"></i> 快捷指令</button>
      </div>
    </div>
    
    <div class="ai-chat-container">
      <div class="ai-chat-messages" id="aiChatMessages">
        ${MerchantApp.data.aiMessages.map(msg => `
          <div class="ai-message ${msg.role}">
            <div class="ai-avatar">
              <i data-lucide="${msg.role === 'user' ? 'user' : 'bot'}"></i>
            </div>
            <div class="ai-content">
              <div class="ai-bubble">${msg.content}</div>
              <div class="ai-time">${msg.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="ai-chat-input">
        <input type="text" id="aiInput" placeholder="输入您的问题..." class="form-input">
        <button class="btn btn-primary" onclick="sendAIMessage()"><i data-lucide="send"></i></button>
      </div>
    </div>
    
    <style>
      .ai-chat-container { display: flex; flex-direction: column; height: calc(100vh - 200px); background: var(--bg-card); border-radius: var(--radius-lg); }
      .ai-chat-messages { flex: 1; overflow-y: auto; padding: 20px; }
      .ai-message { display: flex; gap: 12px; margin-bottom: 20px; }
      .ai-message.user { flex-direction: row-reverse; }
      .ai-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-card-hover); }
      .ai-message.assistant .ai-avatar { background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); }
      .ai-message.user .ai-avatar { background: var(--success); }
      .ai-avatar i { width: 20px; height: 20px; }
      .ai-content { max-width: 70%; }
      .ai-bubble { padding: 12px 16px; border-radius: 12px; background: var(--bg-card-hover); line-height: 1.6; }
      .ai-message.user .ai-bubble { background: var(--primary); color: white; }
      .ai-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
      .ai-message.user .ai-time { text-align: right; }
      .ai-chat-input { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border); }
      .ai-chat-input .form-input { flex: 1; }
    </style>
  `;
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  if (!input.value.trim()) return;
  
  Toast.success('消息已发送', 'AI助手正在思考中...');
  input.value = '';
}

// ============================================
// 页面渲染函数 - 数据报表
// ============================================
function renderMerchantReportPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">数据报表</h1>
        <p class="page-subtitle">全方位经营数据分析</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="download"></i> 导出</button>
        <button class="btn btn-primary"><i data-lucide="calendar"></i> 日期选择</button>
      </div>
    </div>
    
    <div class="filter-bar mb-6">
      <div class="filter-group">
        <select class="filter-select">
          <option>今日</option>
          <option>本周</option>
          <option>本月</option>
          <option>本年</option>
        </select>
      </div>
      <div class="filter-group">
        <select class="filter-select">
          <option>全部门店</option>
          <option>总店</option>
          <option>朝阳店</option>
          <option>海淀店</option>
        </select>
      </div>
    </div>
    
    <div id="reportCharts" style="height:400px;"></div>
    
    <div class="grid-2 mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">热销菜品TOP5</h3></div>
        <table class="table">
          <thead><tr><th>排名</th><th>菜品</th><th>销量</th><th>营收</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>剁椒鱼头</td><td>156份</td><td>¥7,800</td></tr>
            <tr><td>2</td><td>农家小炒肉</td><td>132份</td><td>¥3,960</td></tr>
            <tr><td>3</td><td>酸菜鱼</td><td>98份</td><td>¥4,116</td></tr>
            <tr><td>4</td><td>毛氏红烧肉</td><td>86份</td><td>¥5,676</td></tr>
            <tr><td>5</td><td>臭豆腐</td><td>72份</td><td>¥1,440</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">营业时段分析</h3></div>
        <div id="timeAnalysisChart" style="height:280px;"></div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    initReportCharts();
  }, 100);
}

function initReportCharts() {
  const chartDom = document.getElementById('reportCharts');
  if (chartDom && echarts) {
    const chart = echarts.init(chartDom);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['营收', '订单'], textStyle: { color: '#a0a0b0' } },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' } },
      yAxis: [
        { type: 'value', name: '营收', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { lineStyle: { color: '#1e1e2e' } } },
        { type: 'value', name: '订单', axisLine: { lineStyle: { color: '#2a2a3e' } }, axisLabel: { color: '#6b6b7b' }, splitLine: { show: false } }
      ],
      series: [
        { name: '营收', type: 'line', data: [24500, 26800, 25200, 27800, 28560, 31200, 29800], smooth: true, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(94,106,210,0.3)' }, { offset: 1, color: 'rgba(94,106,210,0)' }]) } },
        { name: '订单', type: 'line', yAxisIndex: 1, data: [132, 145, 138, 152, 156, 168, 162], smooth: true }
      ],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    });
  }
}

// ============================================
// 页面渲染函数 - AI支付宝
// ============================================
function renderMerchantAlipayPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI支付宝</h1>
        <p class="page-subtitle">智能支付收款解决方案</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">今日收款</div>
          <div class="stat-value">¥28,560</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="credit-card"></i></div>
        <div class="stat-content">
          <div class="stat-label">笔数</div>
          <div class="stat-value">156</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="percent"></i></div>
        <div class="stat-content">
          <div class="stat-label">费率</div>
          <div class="stat-value">0.38%</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">收款方式</h3></div>
      <div class="payment-methods">
        <div class="payment-method">
          <div class="payment-icon"><i data-lucide="qrcode"></i></div>
          <div class="payment-info">
            <div class="payment-name">支付宝</div>
            <div class="payment-desc">扫码收款</div>
          </div>
          <span class="badge badge-success">已开通</span>
        </div>
        <div class="payment-method">
          <div class="payment-icon"><i data-lucide="smartphone"></i></div>
          <div class="payment-info">
            <div class="payment-name">微信支付</div>
            <div class="payment-desc">扫码收款</div>
          </div>
          <span class="badge badge-success">已开通</span>
        </div>
        <div class="payment-method">
          <div class="payment-icon"><i data-lucide="credit-card"></i></div>
          <div class="payment-info">
            <div class="payment-name">银行卡</div>
            <div class="payment-desc">POS刷卡</div>
          </div>
          <span class="badge badge-warning">待开通</span>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">最近交易</h3></div>
      <table class="table">
        <thead><tr><th>时间</th><th>金额</th><th>方式</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>14:32:18</td><td>¥268.00</td><td>支付宝</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>14:25:06</td><td>¥156.00</td><td>微信</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>14:18:45</td><td>¥89.00</td><td>支付宝</td><td><span class="badge badge-success">成功</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 知识库
// ============================================
function renderMerchantKnowledgePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">知识库</h1>
        <p class="page-subtitle">操作指南与常见问题</p>
      </div>
    </div>
    
    <div class="filter-bar mb-6">
      <div class="filter-group search-input" style="width:300px">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索知识库...">
      </div>
    </div>
    
    <div class="knowledge-grid">
      <div class="knowledge-card" onclick="navigateTo('merchant-tickets')">
        <div class="knowledge-icon"><i data-lucide="book-open"></i></div>
        <div class="knowledge-title">新手入门</div>
        <div class="knowledge-desc">快速了解系统基本操作</div>
      </div>
      <div class="knowledge-card" onclick="navigateTo('merchant-member')">
        <div class="knowledge-icon"><i data-lucide="users"></i></div>
        <div class="knowledge-title">会员管理</div>
        <div class="knowledge-desc">会员体系配置与运营</div>
      </div>
      <div class="knowledge-card" onclick="navigateTo('merchant-campaigns')">
        <div class="knowledge-icon"><i data-lucide="megaphone"></i></div>
        <div class="knowledge-title">营销活动</div>
        <div class="knowledge-desc">如何开展营销活动</div>
      </div>
      <div class="knowledge-card" onclick="navigateTo('merchant-payment')">
        <div class="knowledge-icon"><i data-lucide="credit-card"></i></div>
        <div class="knowledge-title">支付收款</div>
        <div class="knowledge-desc">支付配置与对账</div>
      </div>
      <div class="knowledge-card">
        <div class="knowledge-icon"><i data-lucide="printer"></i></div>
        <div class="knowledge-title">打印设置</div>
        <div class="knowledge-desc">小票打印机配置</div>
      </div>
      <div class="knowledge-card">
        <div class="knowledge-icon"><i data-lucide="barcode"></i></div>
        <div class="knowledge-title">商品管理</div>
        <div class="knowledge-desc">商品录入与分类</div>
      </div>
    </div>
    
    <style>
      .knowledge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
      .knowledge-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; cursor: pointer; transition: all 0.2s; }
      .knowledge-card:hover { border-color: var(--primary); transform: translateY(-2px); }
      .knowledge-icon { width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
      .knowledge-icon i { width: 24px; height: 24px; }
      .knowledge-title { font-weight: 600; margin-bottom: 8px; }
      .knowledge-desc { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 决策日志
// ============================================
function renderMerchantLogPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">决策日志</h1>
        <p class="page-subtitle">操作记录追踪与审计</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近操作记录</h3>
      </div>
      <table class="table">
        <thead>
          <tr><th>时间</th><th>操作人</th><th>操作类型</th><th>详情</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td>2024-12-01 14:32</td><td>管理员</td><td>价格调整</td><td>招牌菜"剁椒鱼头"价格调整为¥58</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>2024-12-01 13:15</td><td>收银员-张三</td><td>退款</td><td>订单#20241201012退款¥89</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>2024-12-01 11:20</td><td>管理员</td><td>库存预警</td><td>设置"辣椒"最低库存为15斤</td><td><span class="badge badge-success">成功</span></td></tr>
          <tr><td>2024-12-01 10:30</td><td>管理员</td><td>会员升级</td><td>会员张先生升级为金卡</td><td><span class="badge badge-success">成功</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 门店健康
// ============================================
function renderMerchantHealthPage(container) {
  const health = MerchantApp.data.healthScore;
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">门店健康</h1>
        <p class="page-subtitle">多维度门店健康度诊断</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i data-lucide="refresh-cw"></i> 刷新检测</button>
      </div>
    </div>
    
    <div class="health-overview">
      <div class="health-score-circle">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="8"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--success)" stroke-width="8" stroke-dasharray="${health.overall * 3.39} 339" stroke-linecap="round"/>
        </svg>
        <div class="health-score-text">
          <div class="score-value">${health.overall}</div>
          <div class="score-label">健康评分</div>
        </div>
      </div>
      <div class="health-summary">
        <h3>健康状态：良好</h3>
        <p>您的门店运营状态良好，建议继续保持</p>
        <div class="health-tips">
          <div class="health-tip"><i data-lucide="lightbulb"></i> 建议关注库存管理，优化采购流程</div>
          <div class="health-tip"><i data-lucide="trending-up"></i> 营收能力优秀，领先行业85%</div>
        </div>
      </div>
    </div>
    
    <div class="health-details mt-6">
      <div class="card">
        <div class="card-header"><h3 class="card-title">详细评分</h3></div>
        <div class="health-scores">
          <div class="health-item">
            <span class="health-label">营收能力</span>
            <div class="health-bar"><div class="health-fill success" style="width:${health.revenue}%"></div></div>
            <span class="health-value">${health.revenue}/100</span>
          </div>
          <div class="health-item">
            <span class="health-label">服务体验</span>
            <div class="health-bar"><div class="health-fill primary" style="width:${health.service}%"></div></div>
            <span class="health-value">${health.service}/100</span>
          </div>
          <div class="health-item">
            <span class="health-label">库存管理</span>
            <div class="health-bar"><div class="health-fill warning" style="width:${health.inventory}%"></div></div>
            <span class="health-value">${health.inventory}/100</span>
          </div>
          <div class="health-item">
            <span class="health-label">客户满意度</span>
            <div class="health-bar"><div class="health-fill success" style="width:${health.customer}%"></div></div>
            <span class="health-value">${health.customer}/100</span>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .health-overview { display: flex; gap: 40px; align-items: center; background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; }
      .health-score-circle { position: relative; width: 160px; height: 160px; }
      .health-score-circle svg { transform: rotate(-90deg); }
      .health-score-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .score-value { font-size: 2.5rem; font-weight: 700; color: var(--success); }
      .score-label { font-size: 0.85rem; color: var(--text-muted); }
      .health-summary h3 { font-size: 1.25rem; margin-bottom: 8px; color: var(--success); }
      .health-summary p { color: var(--text-secondary); margin-bottom: 16px; }
      .health-tips { display: flex; flex-direction: column; gap: 8px; }
      .health-tip { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-secondary); }
      .health-tip i { width: 16px; height: 16px; color: var(--accent); }
      .health-scores { display: flex; flex-direction: column; gap: 20px; }
      .health-item { display: flex; align-items: center; gap: 16px; }
      .health-label { width: 100px; font-size: 0.9rem; }
      .health-bar { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
      .health-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
      .health-fill.success { background: var(--success); }
      .health-fill.primary { background: var(--primary); }
      .health-fill.warning { background: var(--warning); }
      .health-value { width: 60px; text-align: right; font-size: 0.9rem; color: var(--text-secondary); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 运营日历
// ============================================
function renderMerchantCalendarPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">运营日历</h1>
        <p class="page-subtitle">重要日程与待办事项</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 添加日程</button>
      </div>
    </div>
    
    <div class="calendar-container">
      <div class="calendar-header">
        <button class="btn btn-ghost"><i data-lucide="chevron-left"></i></button>
        <h3>2024年12月</h3>
        <button class="btn btn-ghost"><i data-lucide="chevron-right"></i></button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day header">日</div>
        <div class="calendar-day header">一</div>
        <div class="calendar-day header">二</div>
        <div class="calendar-day header">三</div>
        <div class="calendar-day header">四</div>
        <div class="calendar-day header">五</div>
        <div class="calendar-day header">六</div>
        ${Array.from({length: 30}, (_, i) => `
          <div class="calendar-day ${i + 1 === 1 ? 'today' : ''} ${[5, 12, 19, 25].includes(i + 1) ? 'has-event' : ''}">
            <span class="day-num">${i + 1}</span>
            ${[5].includes(i + 1) ? '<div class="event-dot primary"></div>' : ''}
            ${[12].includes(i + 1) ? '<div class="event-dot warning"></div>' : ''}
            ${[19].includes(i + 1) ? '<div class="event-dot success"></div>' : ''}
            ${[25].includes(i + 1) ? '<div class="event-dot danger"></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">本月待办</h3></div>
      <div class="todo-list">
        <div class="todo-item">
          <div class="todo-checkbox checked"></div>
          <div class="todo-content">
            <div class="todo-title">完成季度盘点</div>
            <div class="todo-date">12月5日 已完成</div>
          </div>
        </div>
        <div class="todo-item">
          <div class="todo-checkbox"></div>
          <div class="todo-content">
            <div class="todo-title">年度会员活动策划</div>
            <div class="todo-date">12月12日 待处理</div>
          </div>
          <span class="badge badge-warning">重要</span>
        </div>
        <div class="todo-item">
          <div class="todo-checkbox"></div>
          <div class="todo-content">
            <div class="todo-title">设备年检</div>
            <div class="todo-date">12月19日 待处理</div>
          </div>
        </div>
        <div class="todo-item">
          <div class="todo-checkbox"></div>
          <div class="todo-content">
            <div class="todo-title">圣诞促销活动</div>
            <div class="todo-date">12月25日 待处理</div>
          </div>
          <span class="badge badge-danger">紧急</span>
        </div>
      </div>
    </div>
    
    <style>
      .calendar-container { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .calendar-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
      .calendar-header h3 { font-size: 1.1rem; }
      .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; position: relative; }
      .calendar-day.header { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
      .calendar-day:not(.header):hover { background: var(--bg-card-hover); }
      .calendar-day.today { background: var(--primary); color: white; }
      .calendar-day.has-event { background: var(--bg-card-hover); }
      .event-dot { width: 6px; height: 6px; border-radius: 50%; position: absolute; bottom: 4px; }
      .event-dot.primary { background: var(--primary); }
      .event-dot.warning { background: var(--warning); }
      .event-dot.success { background: var(--success); }
      .event-dot.danger { background: var(--danger); }
      .todo-list { display: flex; flex-direction: column; }
      .todo-item { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border); }
      .todo-item:last-child { border-bottom: none; }
      .todo-checkbox { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 4px; cursor: pointer; }
      .todo-checkbox.checked { background: var(--success); border-color: var(--success); }
      .todo-content { flex: 1; }
      .todo-title { font-weight: 500; }
      .todo-date { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 报表中心
// ============================================
function renderMerchantReportCenterPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">报表中心</h1>
        <p class="page-subtitle">多维度数据报表分析</p>
      </div>
    </div>
    
    <div class="report-templates">
      <div class="report-card">
        <div class="report-icon"><i data-lucide="file-text"></i></div>
        <div class="report-info">
          <div class="report-title">日结报表</div>
          <div class="report-desc">每日经营汇总</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
      <div class="report-card">
        <div class="report-icon"><i data-lucide="calendar-range"></i></div>
        <div class="report-info">
          <div class="report-title">月结报表</div>
          <div class="report-desc">月度经营分析</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
      <div class="report-card">
        <div class="report-icon"><i data-lucide="users"></i></div>
        <div class="report-info">
          <div class="report-title">会员报表</div>
          <div class="report-desc">会员数据分析</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
      <div class="report-card">
        <div class="report-icon"><i data-lucide="package"></i></div>
        <div class="report-info">
          <div class="report-title">库存报表</div>
          <div class="report-desc">库存变动记录</div>
        </div>
        <button class="btn btn-sm btn-primary">查看</button>
      </div>
    </div>
    
    <style>
      .report-templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
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
// 页面渲染函数 - ROI计算
// ============================================
function renderMerchantROIPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">ROI计算</h1>
        <p class="page-subtitle">营销活动效果分析</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="percent"></i></div>
        <div class="stat-content">
          <div class="stat-label">综合ROI</div>
          <div class="stat-value">285%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">投入成本</div>
          <div class="stat-value">¥8,500</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="trending-up"></i></div>
        <div class="stat-content">
          <div class="stat-label">带来收益</div>
          <div class="stat-value">¥24,225</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">营销活动ROI明细</h3></div>
      <table class="table">
        <thead><tr><th>活动名称</th><th>投入</th><th>收益</th><th>ROI</th><th>效果</th></tr></thead>
        <tbody>
          <tr><td>满100减20活动</td><td>¥3,200</td><td>¥9,800</td><td>206%</td><td><span class="badge badge-success">优秀</span></td></tr>
          <tr><td>会员日双倍积分</td><td>¥2,100</td><td>¥7,350</td><td>250%</td><td><span class="badge badge-success">优秀</span></td></tr>
          <tr><td>新品推广</td><td>¥3,200</td><td>¥7,075</td><td>121%</td><td><span class="badge badge-warning">一般</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 竞品监控
// ============================================
function renderMerchantCompetitorPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">竞品监控</h1>
        <p class="page-subtitle">竞争对手动态追踪</p>
      </div>
    </div>
    
    <div class="competitor-cards">
      <div class="competitor-card">
        <div class="competitor-header">
          <div class="competitor-avatar">湘</div>
          <div class="competitor-info">
            <div class="competitor-name">湘悦楼</div>
            <span class="badge badge-success">营业中</span>
          </div>
        </div>
        <div class="competitor-data">
          <div class="competitor-item">
            <span class="competitor-label">人均</span>
            <span class="competitor-value">¥68</span>
          </div>
          <div class="competitor-item">
            <span class="competitor-label">评分</span>
            <span class="competitor-value">4.6</span>
          </div>
          <div class="competitor-item">
            <span class="competitor-label">月销</span>
            <span class="competitor-value">2800+</span>
          </div>
        </div>
        <div class="competitor-change">
          <span class="text-danger"><i data-lucide="trending-up"></i> 价格下调5%</span>
        </div>
      </div>
      <div class="competitor-card">
        <div class="competitor-header">
          <div class="competitor-avatar">辣</div>
          <div class="competitor-info">
            <div class="competitor-name">辣妹子湘菜馆</div>
            <span class="badge badge-success">营业中</span>
          </div>
        </div>
        <div class="competitor-data">
          <div class="competitor-item">
            <span class="competitor-label">人均</span>
            <span class="competitor-value">¥58</span>
          </div>
          <div class="competitor-item">
            <span class="competitor-label">评分</span>
            <span class="competitor-value">4.4</span>
          </div>
          <div class="competitor-item">
            <span class="competitor-label">月销</span>
            <span class="competitor-value">3200+</span>
          </div>
        </div>
        <div class="competitor-change">
          <span class="text-warning"><i data-lucide="star"></i> 新增招牌菜</span>
        </div>
      </div>
    </div>
    
    <style>
      .competitor-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      .competitor-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
      .competitor-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .competitor-avatar { width: 48px; height: 48px; background: var(--primary); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 700; }
      .competitor-info { flex: 1; }
      .competitor-name { font-weight: 600; margin-bottom: 4px; }
      .competitor-data { display: flex; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 12px; }
      .competitor-item { flex: 1; text-align: center; }
      .competitor-label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; }
      .competitor-value { font-weight: 600; }
      .competitor-change { font-size: 0.85rem; }
      .competitor-change i { width: 14px; height: 14px; }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 库存预警
// ============================================
function renderMerchantInventoryPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">库存预警</h1>
        <p class="page-subtitle">库存监控与智能提醒</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 添加预警</button>
      </div>
    </div>
    
    <div class="alert-list">
      ${MerchantApp.data.inventoryAlerts.map(item => `
        <div class="alert-card">
          <div class="alert-icon danger"><i data-lucide="alert-triangle"></i></div>
          <div class="alert-info">
            <div class="alert-title">${item.name}库存不足</div>
            <div class="alert-desc">当前库存 ${item.current}${item.unit}，低于最低库存 ${item.min}${item.unit}</div>
          </div>
          <div class="alert-progress">
            <div class="progress-bar"><div class="progress-fill danger" style="width:${(item.current/item.min)*100}%"></div></div>
            <span>${Math.round((item.current/item.min)*100)}%</span>
          </div>
          <button class="btn btn-sm btn-primary">立即补货</button>
        </div>
      `).join('')}
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">库存列表</h3></div>
      <table class="table">
        <thead><tr><th>物料名称</th><th>当前库存</th><th>最低库存</th><th>单位</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>剁椒鱼头</td><td>15</td><td>30</td><td>份</td><td><span class="badge badge-danger">不足</span></td><td><button class="btn btn-sm btn-primary">补货</button></td></tr>
          <tr><td>腊肉</td><td>8</td><td>20</td><td>斤</td><td><span class="badge badge-danger">不足</span></td><td><button class="btn btn-sm btn-primary">补货</button></td></tr>
          <tr><td>辣椒</td><td>5</td><td>15</td><td>斤</td><td><span class="badge badge-danger">不足</span></td><td><button class="btn btn-sm btn-primary">补货</button></td></tr>
          <tr><td>豆腐</td><td>45</td><td>30</td><td>份</td><td><span class="badge badge-success">充足</span></td><td>-</td></tr>
        </tbody>
      </table>
    </div>
    
    <style>
      .alert-list { display: flex; flex-direction: column; gap: 12px; }
      .alert-card { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; }
      .alert-icon { width: 40px; height: 40px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .alert-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
      .alert-info { flex: 1; }
      .alert-title { font-weight: 600; margin-bottom: 4px; }
      .alert-desc { font-size: 0.85rem; color: var(--text-muted); }
      .alert-progress { display: flex; align-items: center; gap: 12px; width: 150px; }
      .progress-bar { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
      .progress-fill { height: 100%; border-radius: 3px; }
      .progress-fill.danger { background: var(--danger); }
      .alert-progress span { font-size: 0.8rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - AI内容创作
// ============================================
function renderMerchantMarketingPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI内容创作</h1>
        <p class="page-subtitle">智能生成营销文案与素材</p>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">创作类型</h3></div>
      <div class="marketing-types">
        <div class="marketing-type active">
          <i data-lucide="image"></i>
          <span>朋友圈海报</span>
        </div>
        <div class="marketing-type">
          <i data-lucide="video"></i>
          <span>短视频脚本</span>
        </div>
        <div class="marketing-type">
          <i data-lucide="message-circle"></i>
          <span>群发文案</span>
        </div>
        <div class="marketing-type">
          <i data-lucide="file-text"></i>
          <span>店内海报</span>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">创作内容</h3></div>
      <div class="form-group">
        <label class="form-label">营销主题</label>
        <input type="text" class="form-input" value="圣诞促销优惠活动" placeholder="输入营销主题">
      </div>
      <div class="form-group">
        <label class="form-label">补充说明</label>
        <textarea class="form-textarea" rows="3" placeholder="补充更多细节，如：优惠力度、活动时间等"></textarea>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="generateContent()"><i data-lucide="sparkles"></i> AI生成</button>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">生成结果</h3></div>
      <div class="generated-content">
        <div class="content-preview">
          <div class="preview-placeholder">
            <i data-lucide="image"></i>
            <span>海报预览区</span>
          </div>
        </div>
        <div class="content-text">
          <h4>推荐文案</h4>
          <p>🎄圣诞狂欢，湘菜盛宴！</p>
          <p>12月24日-25日，到店消费满200元立减50元，会员更享双倍积分！</p>
          <p>精选圣诞套餐限时特惠，让你的圣诞充满湘味！</p>
          <p>📍地址：北京朝阳区xxx路</p>
          <p>📞预订电话：010-xxxx</p>
        </div>
      </div>
      <div class="page-actions mt-4">
        <button class="btn btn-secondary"><i data-lucide="refresh-cw"></i> 重新生成</button>
        <button class="btn btn-primary"><i data-lucide="download"></i> 下载使用</button>
      </div>
    </div>
    
    <style>
      .marketing-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .marketing-type { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: var(--bg-card-hover); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
      .marketing-type:hover { background: var(--primary); }
      .marketing-type.active { background: var(--primary); }
      .marketing-type i { width: 24px; height: 24px; }
      .generated-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .preview-placeholder { aspect-ratio: 3/4; background: var(--bg); border: 2px dashed var(--border); border-radius: var(--radius); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); }
      .preview-placeholder i { width: 48px; height: 48px; }
      .content-text h4 { margin-bottom: 12px; color: var(--primary-light); }
      .content-text p { margin-bottom: 8px; line-height: 1.8; }
    </style>
  `;
}

function generateContent() {
  Toast.success('生成成功', 'AI已为您生成营销内容');
}

// ============================================
// 页面渲染函数 - AI洞察日报
// ============================================
function renderMerchantInsightPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI洞察日报</h1>
        <p class="page-subtitle">每日经营分析与建议</p>
      </div>
      <div class="page-actions">
        <select class="filter-select">
          <option>2024-12-01</option>
          <option>2024-11-30</option>
          <option>2024-11-29</option>
        </select>
      </div>
    </div>
    
    <div class="insight-card">
      <div class="insight-header">
        <div class="insight-date">2024年12月1日 · 周五</div>
        <div class="insight-score">
          <span class="score-label">今日综合指数</span>
          <span class="score-value">85</span>
        </div>
      </div>
      <div class="insight-summary">
        <p>今日营业状况良好，营收较昨日增长12.5%。午餐高峰期表现突出，但晚餐时段翻台率略有下降。</p>
      </div>
    </div>
    
    <div class="insight-sections">
      <div class="insight-section">
        <div class="insight-section-title"><i data-lucide="trending-up"></i> 亮点发现</div>
        <div class="insight-item success">
          <div class="insight-item-title">招牌菜表现优异</div>
          <div class="insight-item-desc">"剁椒鱼头"今日售出48份，环比提升25%，建议继续保持供应</div>
        </div>
        <div class="insight-item success">
          <div class="insight-item-title">会员消费增长</div>
          <div class="insight-item-desc">会员订单占比达68%，较上周提升8个百分点</div>
        </div>
      </div>
      
      <div class="insight-section">
        <div class="insight-section-title"><i data-lucide="alert-triangle"></i> 待改进项</div>
        <div class="insight-item warning">
          <div class="insight-item-title">晚餐翻台率下降</div>
          <div class="insight-item-desc">18:00-20:00时段翻台率下降15%，建议优化叫号流程</div>
        </div>
        <div class="insight-item warning">
          <div class="insight-item-title">差评预警</div>
          <div class="insight-item-desc">今日收到1条差评，反馈上菜速度慢，建议关注后厨效率</div>
        </div>
      </div>
      
      <div class="insight-section">
        <div class="insight-section-title"><i data-lucide="lightbulb"></i> AI建议</div>
        <div class="insight-item">
          <div class="insight-item-title">增加限时优惠</div>
          <div class="insight-item-desc">建议在18:00-19:00时段推出"错峰用餐"优惠，提升座位利用率</div>
        </div>
        <div class="insight-item">
          <div class="insight-item-title">优化库存配置</div>
          <div class="insight-item-desc">根据今日销售数据，建议增加"腊肉"采购量30%</div>
        </div>
      </div>
    </div>
    
    <style>
      .insight-card { background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; }
      .insight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .insight-date { font-size: 1.1rem; font-weight: 600; }
      .insight-score { text-align: right; }
      .score-label { display: block; font-size: 0.8rem; opacity: 0.8; }
      .score-value { font-size: 2rem; font-weight: 700; }
      .insight-summary p { opacity: 0.9; line-height: 1.6; }
      .insight-sections { display: flex; flex-direction: column; gap: 16px; }
      .insight-section { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .insight-section-title { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 16px; }
      .insight-section-title i { width: 18px; height: 18px; }
      .insight-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
      .insight-item:last-child { border-bottom: none; }
      .insight-item-title { font-weight: 500; margin-bottom: 4px; }
      .insight-item-desc { font-size: 0.85rem; color: var(--text-muted); }
      .insight-item.success .insight-item-title { color: var(--success); }
      .insight-item.warning .insight-item-title { color: var(--warning); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 门店数字孪生
// ============================================
function renderMerchantDigitalPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">门店数字孪生</h1>
        <p class="page-subtitle">门店数字化模拟与预测</p>
      </div>
    </div>
    
    <div class="digital-twin-container">
      <div class="digital-floor-plan">
        <div class="floor-header">
          <span>平面布局图</span>
          <button class="btn btn-sm btn-secondary"><i data-lucide="edit"></i> 编辑布局</button>
        </div>
        <div class="floor-grid">
          <div class="table-area" style="grid-area: 1/1/3/4;">
            <div class="area-label">大厅</div>
            <div class="tables">
              <div class="table occupied" style="top:20px;left:20px;"><span>1</span></div>
              <div class="table occupied" style="top:20px;left:80px;"><span>2</span></div>
              <div class="table occupied" style="top:20px;left:140px;"><span>3</span></div>
              <div class="table empty" style="top:80px;left:20px;"><span>4</span></div>
              <div class="table reserved" style="top:80px;left:80px;"><span>5</span></div>
            </div>
          </div>
          <div class="table-area" style="grid-area: 1/4/3/6;">
            <div class="area-label">包间A</div>
            <div class="tables">
              <div class="table occupied" style="top:20px;left:20px;"><span>A1</span></div>
              <div class="table empty" style="top:80px;left:20px;"><span>A2</span></div>
            </div>
          </div>
          <div class="table-area" style="grid-area: 3/1/4/3;">
            <div class="area-label">后厨</div>
            <div class="kitchen-icon"><i data-lucide="chef-hat"></i></div>
          </div>
          <div class="table-area" style="grid-area: 3/3/4/6;">
            <div class="area-label">收银台</div>
            <div class="cashier-icon"><i data-lucide="register"></i></div>
          </div>
        </div>
      </div>
      
      <div class="digital-stats">
        <div class="digital-stat">
          <div class="digital-stat-icon"><i data-lucide="users"></i></div>
          <div class="digital-stat-info">
            <div class="digital-stat-value">68/100</div>
            <div class="digital-stat-label">当前客座率</div>
          </div>
        </div>
        <div class="digital-stat">
          <div class="digital-stat-icon"><i data-lucide="clock"></i></div>
          <div class="digital-stat-info">
            <div class="digital-stat-value">预计45分钟</div>
            <div class="digital-stat-label">当前等位时间</div>
          </div>
        </div>
        <div class="digital-stat">
          <div class="digital-stat-icon"><i data-lucide="chef-hat"></i></div>
          <div class="digital-stat-info">
            <div class="digital-stat-value">12分钟</div>
            <div class="digital-stat-label">平均出餐时间</div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .digital-twin-container { display: flex; flex-direction: column; gap: 20px; }
      .digital-floor-plan { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .floor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 600; }
      .floor-grid { display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(3, 80px); gap: 12px; }
      .table-area { background: var(--bg-card-hover); border-radius: var(--radius); padding: 12px; position: relative; }
      .area-label { position: absolute; top: 8px; left: 8px; font-size: 0.75rem; color: var(--text-muted); }
      .tables { position: relative; height: 100%; }
      .table { width: 50px; height: 50px; border-radius: 50%; position: absolute; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
      .table.occupied { background: var(--success); color: white; }
      .table.empty { background: var(--bg); border: 2px dashed var(--border); color: var(--text-muted); }
      .table.reserved { background: var(--warning); color: white; }
      .kitchen-icon, .cashier-icon { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); }
      .kitchen-icon i, .cashier-icon i { width: 32px; height: 32px; }
      .digital-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .digital-stat { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .digital-stat-icon { width: 48px; height: 48px; background: var(--bg-card-hover); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .digital-stat-icon i { width: 24px; height: 24px; color: var(--primary); }
      .digital-stat-value { font-size: 1.25rem; font-weight: 700; }
      .digital-stat-label { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 语音交互
// ============================================
function renderMerchantVoicePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">语音交互</h1>
        <p class="page-subtitle">语音控制智能助手</p>
      </div>
    </div>
    
    <div class="voice-assistant">
      <div class="voice-waves" id="voiceWaves">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
      <div class="voice-status" id="voiceStatus">点击开始语音对话</div>
      <button class="voice-btn" id="voiceBtn" onclick="toggleVoice()">
        <i data-lucide="mic"></i>
      </button>
      <div class="voice-hints">
        <div class="voice-hint">"今天的营业额是多少"</div>
        <div class="voice-hint">"帮我查一下库存"</div>
        <div class="voice-hint">"给会员发条祝福短信"</div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">最近语音指令</h3></div>
      <div class="voice-history">
        <div class="voice-item">
          <div class="voice-q">"今天的营业情况"</div>
          <div class="voice-a">今日营收28,560元，较昨日增长12.5%，表现良好。</div>
        </div>
        <div class="voice-item">
          <div class="voice-q">"哪些菜需要补货"</div>
          <div class="voice-a">以下食材库存不足：剁椒鱼头(15份)、腊肉(8斤)、辣椒(5斤)。</div>
        </div>
      </div>
    </div>
    
    <style>
      .voice-assistant { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-lg); }
      .voice-waves { display: flex; align-items: center; gap: 8px; height: 60px; margin-bottom: 20px; }
      .wave { width: 4px; height: 20px; background: var(--primary); border-radius: 2px; animation: wave 1s ease-in-out infinite; }
      .wave:nth-child(2) { animation-delay: 0.1s; }
      .wave:nth-child(3) { animation-delay: 0.2s; }
      @keyframes wave { 0%, 100% { height: 20px; } 50% { height: 40px; } }
      .voice-btn { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; transition: all 0.3s; }
      .voice-btn:hover { transform: scale(1.1); }
      .voice-btn i { width: 32px; height: 32px; color: white; }
      .voice-btn.listening { animation: pulse 1.5s infinite; }
      @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(94,106,210,0.7); } 50% { box-shadow: 0 0 0 20px rgba(94,106,210,0); } }
      .voice-status { color: var(--text-muted); margin-bottom: 20px; }
      .voice-hints { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
      .voice-hint { padding: 8px 16px; background: var(--bg-card-hover); border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary); }
      .voice-history { display: flex; flex-direction: column; }
      .voice-item { padding: 16px; border-bottom: 1px solid var(--border); }
      .voice-item:last-child { border-bottom: none; }
      .voice-q { color: var(--primary-light); margin-bottom: 8px; }
      .voice-a { color: var(--text-secondary); }
    </style>
  `;
}

function toggleVoice() {
  const btn = document.getElementById('voiceBtn');
  const status = document.getElementById('voiceStatus');
  btn.classList.toggle('listening');
  if (btn.classList.contains('listening')) {
    status.textContent = '正在聆听...';
    Toast.info('语音启动', '请开始说话');
  } else {
    status.textContent = '处理中...';
    setTimeout(() => {
      status.textContent = '点击开始语音对话';
      Toast.success('识别完成', '已处理您的指令');
    }, 1500);
  }
}

// ============================================
// 页面渲染函数 - 营销工具
// ============================================
function renderMerchantCampaignsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">营销工具</h1>
        <p class="page-subtitle">多种营销活动提升营收</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 创建活动</button>
      </div>
    </div>
    
    <div class="campaign-types">
      <div class="campaign-type-card">
        <div class="campaign-icon"><i data-lucide="percent"></i></div>
        <div class="campaign-name">满减优惠</div>
        <div class="campaign-desc">消费满额立减</div>
      </div>
      <div class="campaign-type-card">
        <div class="campaign-icon"><i data-lucide="gift"></i></div>
        <div class="campaign-name">赠品活动</div>
        <div class="campaign-desc">消费赠好礼</div>
      </div>
      <div class="campaign-type-card">
        <div class="campaign-icon"><i data-lucide="users"></i></div>
        <div class="campaign-name">会员专享</div>
        <div class="campaign-desc">会员专属折扣</div>
      </div>
      <div class="campaign-type-card">
        <div class="campaign-icon"><i data-lucide="clock"></i></div>
        <div class="campaign-name">限时抢购</div>
        <div class="campaign-desc">限时特价商品</div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">进行中的活动</h3></div>
      <table class="table">
        <thead><tr><th>活动名称</th><th>类型</th><th>时间</th><th>效果</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>圣诞满减</td><td>满减优惠</td><td>12.24-12.25</td><td>参与200+</td><td><span class="badge badge-success">进行中</span></td><td><button class="btn btn-sm btn-ghost">详情</button></td></tr>
          <tr><td>会员日双倍积分</td><td>会员专享</td><td>每月15日</td><td>参与500+</td><td><span class="badge badge-gray">未开始</span></td><td><button class="btn btn-sm btn-ghost">详情</button></td></tr>
        </tbody>
      </table>
    </div>
    
    <style>
      .campaign-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .campaign-type-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
      .campaign-type-card:hover { border-color: var(--primary); transform: translateY(-2px); }
      .campaign-icon { width: 56px; height: 56px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
      .campaign-icon i { width: 28px; height: 28px; }
      .campaign-name { font-weight: 600; margin-bottom: 4px; }
      .campaign-desc { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 工单系统
// ============================================
function renderMerchantTicketsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">工单系统</h1>
        <p class="page-subtitle">问题提交与处理追踪</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 提交工单</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="inbox"></i></div>
        <div class="stat-content">
          <div class="stat-label">待处理</div>
          <div class="stat-value">2</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="loader"></i></div>
        <div class="stat-content">
          <div class="stat-label">处理中</div>
          <div class="stat-value">1</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">已解决</div>
          <div class="stat-value">12</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header">
        <h3 class="card-title">工单列表</h3>
      </div>
      <table class="table">
        <thead><tr><th>工单号</th><th>标题</th><th>类型</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          ${MerchantApp.data.tickets.map(t => `
            <tr>
              <td>${t.id}</td>
              <td>${t.title}</td>
              <td>${t.type}</td>
              <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              <td>${t.createTime}</td>
              <td><button class="btn btn-sm btn-ghost">查看</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 权限管理
// ============================================
function renderMerchantPermissionPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">权限管理</h1>
        <p class="page-subtitle">员工角色与权限配置</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 添加员工</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">员工列表</h3></div>
      <table class="table">
        <thead><tr><th>姓名</th><th>角色</th><th>手机号</th><th>入职时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>张三</td><td>店长</td><td>138****1234</td><td>2023-01-15</td><td><span class="badge badge-success">在职</span></td><td><button class="btn btn-sm btn-ghost">编辑</button></td></tr>
          <tr><td>李四</td><td>收银员</td><td>139****5678</td><td>2023-03-20</td><td><span class="badge badge-success">在职</span></td><td><button class="btn btn-sm btn-ghost">编辑</button></td></tr>
          <tr><td>王五</td><td>服务员</td><td>137****9012</td><td>2023-06-01</td><td><span class="badge badge-success">在职</span></td><td><button class="btn btn-sm btn-ghost">编辑</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 消息通知
// ============================================
function renderMerchantNotifyPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">消息通知</h1>
        <p class="page-subtitle">系统消息与提醒</p>
      </div>
    </div>
    
    <div class="notification-list">
      <div class="notification-item unread">
        <div class="notification-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="notification-content">
          <div class="notification-title">库存预警提醒</div>
          <div class="notification-desc">您的店铺有以下食材库存不足：剁椒鱼头、腊肉、辣椒</div>
          <div class="notification-time">10分钟前</div>
        </div>
      </div>
      <div class="notification-item unread">
        <div class="notification-icon primary"><i data-lucide="users"></i></div>
        <div class="notification-content">
          <div class="notification-title">新会员注册</div>
          <div class="notification-desc">恭喜！新会员"张先生"已注册成为您的会员</div>
          <div class="notification-time">30分钟前</div>
        </div>
      </div>
      <div class="notification-item">
        <div class="notification-icon success"><i data-lucide="check-circle"></i></div>
        <div class="notification-content">
          <div class="notification-title">工单已处理</div>
          <div class="notification-desc">您的工单#TK003已处理完成</div>
          <div class="notification-time">2小时前</div>
        </div>
      </div>
    </div>
    
    <style>
      .notification-list { display: flex; flex-direction: column; gap: 12px; }
      .notification-item { display: flex; gap: 16px; padding: 16px; background: var(--bg-card); border-radius: var(--radius-lg); }
      .notification-item.unread { border-left: 3px solid var(--primary); }
      .notification-icon { width: 40px; height: 40px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .notification-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
      .notification-icon.primary { background: rgba(94, 106, 210, 0.1); color: var(--primary); }
      .notification-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      .notification-content { flex: 1; }
      .notification-title { font-weight: 600; margin-bottom: 4px; }
      .notification-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
      .notification-time { font-size: 0.75rem; color: var(--text-muted); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 多门店管理
// ============================================
function renderMerchantMultiStorePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">多门店管理</h1>
        <p class="page-subtitle">统一管理多家门店</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 添加门店</button>
      </div>
    </div>
    
    <div class="store-cards">
      ${MerchantApp.data.stores.map(s => `
        <div class="store-card">
          <div class="store-header">
            <div class="store-avatar">${s.name.charAt(0)}</div>
            <div class="store-info">
              <div class="store-name">${s.name}</div>
              <span class="badge badge-${s.status === 'online' ? 'success' : 'danger'}">${s.status === 'online' ? '营业中' : '已打烊'}</span>
            </div>
          </div>
          <div class="store-stats">
            <div class="store-stat">
              <span class="stat-label">今日营收</span>
              <span class="stat-value">¥${s.todayRevenue.toLocaleString()}</span>
            </div>
            <div class="store-stat">
              <span class="stat-label">订单数</span>
              <span class="stat-value">${s.orders}</span>
            </div>
          </div>
          <div class="store-actions">
            <button class="btn btn-sm btn-secondary"><i data-lucide="settings"></i> 设置</button>
            <button class="btn btn-sm btn-ghost">数据</button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <style>
      .store-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
      .store-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
      .store-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .store-avatar { width: 48px; height: 48px; background: var(--primary); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; }
      .store-info { flex: 1; }
      .store-name { font-weight: 600; margin-bottom: 4px; }
      .store-stats { display: flex; gap: 20px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 16px; }
      .store-stat { flex: 1; }
      .store-stat .stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; }
      .store-stat .stat-value { font-size: 1.1rem; font-weight: 600; }
      .store-actions { display: flex; gap: 8px; }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 会员体系
// ============================================
function renderMerchantMemberPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">会员体系</h1>
        <p class="page-subtitle">会员管理与运营</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 添加会员</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">会员总数</div>
          <div class="stat-value">1,568</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="trending-up"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月新增</div>
          <div class="stat-value">86</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="gift"></i></div>
        <div class="stat-content">
          <div class="stat-label">会员积分</div>
          <div class="stat-value">156,800</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">会员列表</h3></div>
      <table class="table">
        <thead><tr><th>会员</th><th>等级</th><th>积分</th><th>最后消费</th><th>操作</th></tr></thead>
        <tbody>
          ${MerchantApp.data.members.map(m => `
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">${m.name.charAt(0)}</div>
                  <div>
                    <div class="font-medium">${m.name}</div>
                    <div class="text-sm text-muted">${m.phone}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-${m.level === 'gold' ? 'warning' : m.level === 'silver' ? 'gray' : 'accent'}">${m.level === 'gold' ? '金卡' : m.level === 'silver' ? '银卡' : '普卡'}</span></td>
              <td>${m.points.toLocaleString()}</td>
              <td>${m.lastVisit}</td>
              <td><button class="btn btn-sm btn-ghost">详情</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 支付分账
// ============================================
function renderMerchantPaymentPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">支付分账</h1>
        <p class="page-subtitle">支付流水与分账明细</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="banknote"></i></div>
        <div class="stat-content">
          <div class="stat-label">今日收款</div>
          <div class="stat-value">¥28,560</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="credit-card"></i></div>
        <div class="stat-content">
          <div class="stat-label">笔数</div>
          <div class="stat-value">156</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">待分账</div>
          <div class="stat-value">¥3,200</div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <div class="card-header"><h3 class="card-title">最近交易</h3></div>
      <table class="table">
        <thead><tr><th>时间</th><th>金额</th><th>方式</th><th>分账状态</th></tr></thead>
        <tbody>
          <tr><td>14:32:18</td><td>¥268.00</td><td>支付宝</td><td><span class="badge badge-success">已分账</span></td></tr>
          <tr><td>14:25:06</td><td>¥156.00</td><td>微信</td><td><span class="badge badge-warning">待分账</span></td></tr>
          <tr><td>14:18:45</td><td>¥89.00</td><td>支付宝</td><td><span class="badge badge-success">已分账</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 供应链管理
// ============================================
function renderMerchantSupplyPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">供应链管理</h1>
        <p class="page-subtitle">采购与库存管理</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增采购</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">采购记录</h3></div>
      <table class="table">
        <thead><tr><th>物料</th><th>数量</th><th>供应商</th><th>金额</th><th>时间</th><th>状态</th></tr></thead>
        <tbody>
          <tr><td>辣椒</td><td>50斤</td><td>湖南供应商</td><td>¥500</td><td>2024-12-01</td><td><span class="badge badge-success">已入库</span></td></tr>
          <tr><td>腊肉</td><td>30斤</td><td>本地供应商</td><td>¥900</td><td>2024-11-28</td><td><span class="badge badge-success">已入库</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 智能定价
// ============================================
function renderMerchantPricingPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">智能定价</h1>
        <p class="page-subtitle">AI驱动的价格优化建议</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">价格优化建议</h3></div>
      <div class="pricing-suggestions">
        <div class="pricing-item">
          <div class="pricing-dish">剁椒鱼头</div>
          <div class="pricing-info">
            <div class="pricing-current">当前价格: ¥52</div>
            <div class="pricing-suggest">建议价格: ¥58</div>
          </div>
          <div class="pricing-reason">根据供需分析，建议上调12%以提升利润</div>
          <button class="btn btn-sm btn-primary">应用</button>
        </div>
        <div class="pricing-item">
          <div class="pricing-dish">农家小炒肉</div>
          <div class="pricing-info">
            <div class="pricing-current">当前价格: ¥32</div>
            <div class="pricing-suggest">建议价格: ¥35</div>
          </div>
          <div class="pricing-reason">竞品价格上浮，建议同步调整</div>
          <button class="btn btn-sm btn-primary">应用</button>
        </div>
      </div>
    </div>
    
    <style>
      .pricing-suggestions { display: flex; flex-direction: column; }
      .pricing-item { display: flex; align-items: center; gap: 20px; padding: 16px; border-bottom: 1px solid var(--border); }
      .pricing-item:last-child { border-bottom: none; }
      .pricing-dish { width: 120px; font-weight: 600; }
      .pricing-info { width: 160px; }
      .pricing-current { font-size: 0.85rem; color: var(--text-muted); }
      .pricing-suggest { font-weight: 600; color: var(--success); }
      .pricing-reason { flex: 1; font-size: 0.85rem; color: var(--text-secondary); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 更新日志
// ============================================
function renderMerchantChangelogPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">更新日志</h1>
        <p class="page-subtitle">产品功能更新记录</p>
      </div>
    </div>
    
    <div class="changelog-list">
      <div class="changelog-item">
        <div class="changelog-version">v2.5.0</div>
        <div class="changelog-content">
          <div class="changelog-date">2024年12月1日</div>
          <div class="changelog-title">新增门店数字孪生功能</div>
          <div class="changelog-desc">支持实时查看门店座位状态，智能预测等位时间</div>
          <div class="changelog-tags">
            <span class="tag new">新增</span>
          </div>
        </div>
      </div>
      <div class="changelog-item">
        <div class="changelog-version">v2.4.2</div>
        <div class="changelog-content">
          <div class="changelog-date">2024年11月25日</div>
          <div class="changelog-title">优化库存预警算法</div>
          <div class="changelog-desc">根据历史销售数据，更精准地预测补货时机</div>
          <div class="changelog-tags">
            <span class="tag optimize">优化</span>
          </div>
        </div>
      </div>
      <div class="changelog-item">
        <div class="changelog-version">v2.4.1</div>
        <div class="changelog-content">
          <div class="changelog-date">2024年11月15日</div>
          <div class="changelog-title">修复若干问题</div>
          <div class="changelog-desc">修复了打印小票偶尔缺失的问题</div>
          <div class="changelog-tags">
            <span class="tag fix">修复</span>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .changelog-list { display: flex; flex-direction: column; gap: 20px; }
      .changelog-item { display: flex; gap: 20px; background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .changelog-version { width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
      .changelog-content { flex: 1; }
      .changelog-date { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
      .changelog-title { font-weight: 600; margin-bottom: 8px; }
      .changelog-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; }
      .changelog-tags { display: flex; gap: 8px; }
      .tag { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
      .tag.new { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      .tag.optimize { background: rgba(94, 106, 210, 0.1); color: var(--primary); }
      .tag.fix { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 智能预警
// ============================================
function renderMerchantAlertPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">智能预警</h1>
        <p class="page-subtitle">异常情况实时提醒</p>
      </div>
    </div>
    
    <div class="alert-center">
      <div class="alert-category">
        <div class="alert-category-header">
          <i data-lucide="alert-triangle" class="danger"></i>
          <span>紧急预警</span>
        </div>
        <div class="alert-category-items">
          <div class="alert-item">
            <div class="alert-item-title">库存严重不足</div>
            <div class="alert-item-desc">辣椒库存仅剩5斤，需立即采购</div>
            <div class="alert-item-time">10分钟前</div>
          </div>
        </div>
      </div>
      
      <div class="alert-category">
        <div class="alert-category-header">
          <i data-lucide="alert-circle" class="warning"></i>
          <span>一般提醒</span>
        </div>
        <div class="alert-category-items">
          <div class="alert-item">
            <div class="alert-item-title">会员生日提醒</div>
            <div class="alert-item-desc">今日有3位会员生日，可发送祝福</div>
            <div class="alert-item-time">30分钟前</div>
          </div>
          <div class="alert-item">
            <div class="alert-item-title">设备维护提醒</div>
            <div class="alert-item-desc">POS机累计使用满1000次，建议维护</div>
            <div class="alert-item-time">1小时前</div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .alert-center { display: flex; flex-direction: column; gap: 20px; }
      .alert-category { background: var(--bg-card); border-radius: var(--radius-lg); padding: 20px; }
      .alert-category-header { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 16px; }
      .alert-category-header i { width: 20px; height: 20px; }
      .alert-category-header .danger { color: var(--danger); }
      .alert-category-header .warning { color: var(--warning); }
      .alert-category-items { display: flex; flex-direction: column; gap: 12px; }
      .alert-item { padding: 12px; background: var(--bg-card-hover); border-radius: var(--radius); }
      .alert-item-title { font-weight: 500; margin-bottom: 4px; }
      .alert-item-desc { font-size: 0.85rem; color: var(--text-muted); }
      .alert-item-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 门店巡检
// ============================================
function renderMerchantInspectPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">门店巡检</h1>
        <p class="page-subtitle">门店日常巡查记录</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增巡检</button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">巡检记录</h3></div>
      <table class="table">
        <thead><tr><th>巡检时间</th><th>巡检人</th><th>门店</th><th>结果</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>2024-12-01 09:00</td><td>张三</td><td>总店</td><td><span class="badge badge-success">合格</span></td><td><button class="btn btn-sm btn-ghost">查看</button></td></tr>
          <tr><td>2024-12-01 09:15</td><td>张三</td><td>朝阳店</td><td><span class="badge badge-warning">需改进</span></td><td><button class="btn btn-sm btn-ghost">查看</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 私有化部署
// ============================================
function renderMerchantDeployPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">私有化部署</h1>
        <p class="page-subtitle">本地化部署方案</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">部署状态</h3></div>
      <div class="deploy-info">
        <div class="deploy-item">
          <span class="deploy-label">部署模式</span>
          <span class="deploy-value">SaaS云端</span>
        </div>
        <div class="deploy-item">
          <span class="deploy-label">数据存储</span>
          <span class="deploy-value">阿里云OSS</span>
        </div>
        <div class="deploy-item">
          <span class="deploy-label">服务器</span>
          <span class="deploy-value">华东区域</span>
        </div>
      </div>
      <div class="deploy-desc">
        <p>如需私有化部署，请联系客服了解详情。</p>
      </div>
    </div>
    
    <style>
      .deploy-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
      .deploy-item { text-align: center; padding: 20px; background: var(--bg-card-hover); border-radius: var(--radius); }
      .deploy-label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
      .deploy-value { font-size: 1.1rem; font-weight: 600; }
      .deploy-desc { padding: 16px; background: var(--bg-card-hover); border-radius: var(--radius); text-align: center; color: var(--text-secondary); }
    </style>
  `;
}

// ============================================
// 页面渲染函数 - 数据导出
// ============================================
function renderMerchantExportPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">数据导出</h1>
        <p class="page-subtitle">导出经营数据报表</p>
      </div>
    </div>
    
    <div class="export-types">
      <div class="export-type-card">
        <div class="export-icon"><i data-lucide="file-text"></i></div>
        <div class="export-info">
          <div class="export-name">日结报表</div>
          <div class="export-desc">导出每日经营数据</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="exportData('daily')"><i data-lucide="download"></i> 导出</button>
      </div>
      <div class="export-type-card">
        <div class="export-icon"><i data-lucide="users"></i></div>
        <div class="export-info">
          <div class="export-name">会员数据</div>
          <div class="export-desc">导出会员信息</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="exportData('member')"><i data-lucide="download"></i> 导出</button>
      </div>
      <div class="export-type-card">
        <div class="export-icon"><i data-lucide="package"></i></div>
        <div class="export-info">
          <div class="export-name">库存数据</div>
          <div class="export-desc">导出库存明细</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="exportData('inventory')"><i data-lucide="download"></i> 导出</button>
      </div>
    </div>
    
    <style>
      .export-types { display: flex; flex-direction: column; gap: 12px; }
      .export-type-card { display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
      .export-icon { width: 48px; height: 48px; background: var(--bg-card-hover); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
      .export-icon i { width: 24px; height: 24px; color: var(--primary); }
      .export-info { flex: 1; }
      .export-name { font-weight: 600; margin-bottom: 4px; }
      .export-desc { font-size: 0.85rem; color: var(--text-muted); }
    </style>
  `;
}

function exportData(type) {
  Toast.success('导出成功', '数据已准备好下载');
}

// ============================================
// 商家端页面路由
// ============================================
const merchantPages = {
  'merchant-overview': renderMerchantOverviewPage,
  'merchant-ai-chat': renderMerchantAIChatPage,
  'merchant-report': renderMerchantReportPage,
  'merchant-alipay': renderMerchantAlipayPage,
  'merchant-knowledge': renderMerchantKnowledgePage,
  'merchant-log': renderMerchantLogPage,
  'merchant-health': renderMerchantHealthPage,
  'merchant-calendar': renderMerchantCalendarPage,
  'merchant-report-center': renderMerchantReportCenterPage,
  'merchant-roi': renderMerchantROIPage,
  'merchant-competitor': renderMerchantCompetitorPage,
  'merchant-inventory': renderMerchantInventoryPage,
  'merchant-marketing': renderMerchantMarketingPage,
  'merchant-insight': renderMerchantInsightPage,
  'merchant-digital': renderMerchantDigitalPage,
  'merchant-voice': renderMerchantVoicePage,
  'merchant-campaigns': renderMerchantCampaignsPage,
  'merchant-tickets': renderMerchantTicketsPage,
  'merchant-permission': renderMerchantPermissionPage,
  'merchant-notify': renderMerchantNotifyPage,
  'merchant-multi-store': renderMerchantMultiStorePage,
  'merchant-member': renderMerchantMemberPage,
  'merchant-payment': renderMerchantPaymentPage,
  'merchant-supply': renderMerchantSupplyPage,
  'merchant-pricing': renderMerchantPricingPage,
  'merchant-changelog': renderMerchantChangelogPage,
  'merchant-alert': renderMerchantAlertPage,
  'merchant-inspect': renderMerchantInspectPage,
  'merchant-deploy': renderMerchantDeployPage,
  'merchant-export': renderMerchantExportPage
};

// 覆盖renderPage函数
async function renderPage(pageId, params = {}) {
  const content = document.getElementById('contentArea');
  if (!content) return;
  
  content.innerHTML = '<div class="page-content" style="animation:fadeIn 0.3s ease"><div class="loading-spinner"><i data-lucide="loader-2" class="animate-spin"></i> 加载中...</div></div>';
  lucide.createIcons();
  
  setTimeout(() => {
    content.innerHTML = '<div class="page-content">';
    if (merchantPages[pageId]) {
      merchantPages[pageId](content);
    } else if (pageId === 'merchant-ai') {
      merchantPages['merchant-ai-chat'](content);
    } else {
      // 默认显示运营概览
      merchantPages['merchant-overview'](content);
    }
    content.innerHTML += '</div>';
    setTimeout(() => lucide.createIcons(), 0);
  }, 100);
}

// 初始化商家端
document.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
  renderSidebar();
  
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
  });
  
  initSidebarSearch();
  initMobileAdaptation();
  
  // 加载默认页面
  navigateTo('merchant-overview');
  
  console.log('店赢OS商家端模块加载完成');
});
