/**
 * 店赢OS - 平台管理后台 JavaScript
 * 包含所有54个功能模块的路由、页面渲染和Mock数据
 */

// ============================================
// 全局变量和配置
// ============================================
const App = {
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  charts: {},
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
  { id: 10, name: '西安肉夹馍', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-03-15', expireTime: '2025-03-15', gmv: 450000, orders: 2800, rating: 4.5, aiUsage: 780 },
  { id: 11, name: '苏州生煎包', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-01-10', expireTime: '2025-01-10', gmv: 980000, orders: 6100, rating: 4.6, aiUsage: 2890 },
  { id: 12, name: '天津包子铺', industry: '餐饮', version: '免费版', status: 'active', registerTime: '2024-06-01', expireTime: '2025-06-01', gmv: 120000, orders: 750, rating: 4.0, aiUsage: 180 },
  { id: 13, name: '长沙臭豆腐', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-04-20', expireTime: '2025-04-20', gmv: 380000, orders: 2200, rating: 4.3, aiUsage: 650 },
  { id: 14, name: '郑州烩面馆', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-02-01', expireTime: '2025-02-01', gmv: 1100000, orders: 7200, rating: 4.7, aiUsage: 3560 },
  { id: 15, name: '青岛海鲜楼', industry: '餐饮', version: '专业版', status: 'expiring', registerTime: '2023-07-15', expireTime: '2024-12-25', gmv: 780000, orders: 4800, rating: 4.6, aiUsage: 1680 },
  { id: 16, name: '厦门沙茶面', industry: '餐饮', version: '免费版', status: 'active', registerTime: '2024-07-01', expireTime: '2025-07-01', gmv: 88000, orders: 520, rating: 4.2, aiUsage: 95 },
  { id: 17, name: '哈尔滨饺子馆', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-05-10', expireTime: '2025-05-10', gmv: 420000, orders: 2600, rating: 4.4, aiUsage: 720 },
  { id: 18, name: '昆明过桥米线', industry: '餐饮', version: '旗舰版', status: 'active', registerTime: '2024-01-25', expireTime: '2025-01-25', gmv: 1350000, orders: 8100, rating: 4.8, aiUsage: 3980 },
  { id: 19, name: '合肥小龙虾', industry: '餐饮', version: '免费版', status: 'active', registerTime: '2024-08-01', expireTime: '2025-08-01', gmv: 65000, orders: 380, rating: 4.1, aiUsage: 60 },
  { id: 20, name: '南昌瓦罐汤', industry: '餐饮', version: '专业版', status: 'active', registerTime: '2024-06-15', expireTime: '2025-06-15', gmv: 310000, orders: 1900, rating: 4.3, aiUsage: 480 }
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
  { id: 5, name: '刘洋', phone: '13800138005', region: '华中区', status: 'active', customers: 31, thisMonthSign: 6 },
  { id: 6, name: '陈静', phone: '13800138006', region: '东北区', status: 'active', customers: 22, thisMonthSign: 4 },
  { id: 7, name: '杨帆', phone: '13800138007', region: '西北区', status: 'inactive', customers: 15, thisMonthSign: 2 },
  { id: 8, name: '周涛', phone: '13800138008', region: '华东区', status: 'active', customers: 38, thisMonthSign: 8 },
  { id: 9, name: '吴琳', phone: '13800138009', region: '华南区', status: 'active', customers: 26, thisMonthSign: 5 },
  { id: 10, name: '郑鹏', phone: '13800138010', region: '华北区', status: 'active', customers: 45, thisMonthSign: 10 }
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

// Mock数据 - AI使用统计
App.data.aiUsage = {
  agents: ['智能客服', '营销助手', '数据分析', '海报设计', '运营建议'],
  monthly: [
    { month: '2024-01', calls: [12500, 8200, 6800, 4500, 3200] },
    { month: '2024-02', calls: [14200, 9500, 7800, 5200, 3800] },
    { month: '2024-03', calls: [15800, 10800, 8600, 5800, 4200] },
    { month: '2024-04', calls: [17200, 12200, 9400, 6500, 4800] },
    { month: '2024-05', calls: [18500, 13500, 10200, 7200, 5200] },
    { month: '2024-06', calls: [19800, 14800, 11500, 7800, 5600] },
    { month: '2024-07', calls: [21200, 16200, 12800, 8500, 6200] },
    { month: '2024-08', calls: [22800, 17800, 14200, 9200, 6800] },
    { month: '2024-09', calls: [24500, 19200, 15600, 9800, 7400] },
    { month: '2024-10', calls: [26200, 20800, 17200, 10500, 8200] },
    { month: '2024-11', calls: [27800, 22500, 18800, 11200, 8800] },
    { month: '2024-12', calls: [29500, 24200, 20500, 12000, 9500] }
  ],
  tokens: [1250000, 1380000, 1520000, 1680000, 1850000, 2020000, 2200000, 2380000, 2580000, 2800000, 3020000, 3250000]
};

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
  { id: 'TX20241201010', merchant: '西安肉夹馍', amount: 980, type: 'renewal', status: 'success', time: '2024-12-01 21:35:42' },
  { id: 'TX20241201011', merchant: '苏州生煎包', amount: 5980, type: 'subscription', status: 'success', time: '2024-12-02 09:15:28' },
  { id: 'TX20241201012', merchant: '天津包子铺', amount: 380, type: 'subscription', status: 'pending', time: '2024-12-02 10:22:51' },
  { id: 'TX20241201013', merchant: '长沙臭豆腐', amount: 980, type: 'subscription', status: 'success', time: '2024-12-02 11:48:09' },
  { id: 'TX20241201014', merchant: '郑州烩面馆', amount: 5980, type: 'upgrade', status: 'success', time: '2024-12-02 14:05:33' },
  { id: 'TX20241201015', merchant: '青岛海鲜楼', amount: 1980, type: 'renewal', status: 'success', time: '2024-12-02 15:32:17' },
  { id: 'TX20241201016', merchant: '厦门沙茶面', amount: 380, type: 'subscription', status: 'success', time: '2024-12-02 16:48:44' },
  { id: 'TX20241201017', merchant: '哈尔滨饺子馆', amount: 980, type: 'subscription', status: 'success', time: '2024-12-02 17:25:08' },
  { id: 'TX20241201018', merchant: '昆明过桥米线', amount: 5980, type: 'subscription', status: 'success', time: '2024-12-02 18:52:31' },
  { id: 'TX20241201019', merchant: '合肥小龙虾', amount: 380, type: 'subscription', status: 'pending', time: '2024-12-02 19:18:55' },
  { id: 'TX20241201020', merchant: '南昌瓦罐汤', amount: 980, type: 'subscription', status: 'success', time: '2024-12-02 20:45:22' },
  { id: 'TX20241201021', merchant: '北京湘菜馆', amount: 2680, type: 'subscription', status: 'success', time: '2024-12-03 09:32:18' },
  { id: 'TX20241201022', merchant: '上海小笼包', amount: 980, type: 'renewal', status: 'success', time: '2024-12-03 10:58:42' },
  { id: 'TX20241201023', merchant: '深圳火锅店', amount: 5980, type: 'subscription', status: 'success', time: '2024-12-03 12:15:06' },
  { id: 'TX20241201024', merchant: '广州茶餐厅', amount: 380, type: 'subscription', status: 'failed', time: '2024-12-03 13:42:29' },
  { id: 'TX20241201025', merchant: '成都串串香', amount: 1980, type: 'renewal', status: 'success', time: '2024-12-03 14:28:51' },
  { id: 'TX20241201026', merchant: '杭州奶茶铺', amount: 380, type: 'subscription', status: 'success', time: '2024-12-03 15:55:14' },
  { id: 'TX20241201027', merchant: '南京大牌档', amount: 5980, type: 'upgrade', status: 'success', time: '2024-12-03 17:12:38' },
  { id: 'TX20241201028', merchant: '武汉热干面', amount: 980, type: 'subscription', status: 'pending', time: '2024-12-03 18:48:02' },
  { id: 'TX20241201029', merchant: '重庆小面', amount: 680, type: 'subscription', status: 'success', time: '2024-12-03 19:25:25' },
  { id: 'TX20241201030', merchant: '西安肉夹馍', amount: 1980, type: 'upgrade', status: 'success', time: '2024-12-03 20:52:48' }
];

// Mock数据 - 工单
App.data.tickets = [
  { id: 'TK202412001', merchant: '北京湘菜馆', type: '技术问题', title: 'AI助手响应缓慢', status: 'open', priority: 'high', createTime: '2024-12-01 10:30', assignee: '张工' },
  { id: 'TK202412002', merchant: '上海小笼包', type: '功能咨询', title: '如何开通数据分析功能', status: 'pending', priority: 'medium', createTime: '2024-12-01 14:15', assignee: '李工' },
  { id: 'TK202412003', merchant: '深圳火锅店', type: '账单问题', title: '发票开具申请', status: 'resolved', priority: 'low', createTime: '2024-11-30 09:20', assignee: '王工' },
  { id: 'TK202412004', merchant: '广州茶餐厅', type: '技术问题', title: '支付接口无法调起', status: 'open', priority: 'high', createTime: '2024-12-02 11:45', assignee: '待分配' },
  { id: 'TK202412005', merchant: '成都串串香', type: '功能建议', title: '希望增加会员积分功能', status: 'pending', priority: 'low', createTime: '2024-12-01 16:30', assignee: '赵工' },
  { id: 'TK202412006', merchant: '杭州奶茶铺', type: '账号问题', title: '子账号权限配置', status: 'resolved', priority: 'medium', createTime: '2024-11-29 13:10', assignee: '刘工' },
  { id: 'TK202412007', merchant: '南京大牌档', type: '技术问题', title: '小程序无法正常打开', status: 'open', priority: 'high', createTime: '2024-12-02 15:20', assignee: '陈工' },
  { id: 'TK202412008', merchant: '武汉热干面', type: '账单问题', title: '退款申请', status: 'pending', priority: 'medium', createTime: '2024-12-02 10:05', assignee: '杨工' },
  { id: 'TK202412009', merchant: '重庆小面', type: '功能咨询', title: '海报模板使用方法', status: 'resolved', priority: 'low', createTime: '2024-11-28 14:50', assignee: '周工' },
  { id: 'TK202412010', merchant: '西安肉夹馍', type: '技术问题', title: '数据同步异常', status: 'open', priority: 'medium', createTime: '2024-12-03 09:30', assignee: '吴工' }
];

// Mock数据 - 公告
App.data.announcements = [
  { id: 1, title: '平台功能更新通知', content: '新增AI智能客服2.0版本，支持多轮对话和意图识别...', scope: 'all', status: 'published', createTime: '2024-12-01', views: 1256 },
  { id: 2, title: '元旦假期服务安排', content: '2025年元旦假期期间，技术支持团队照常提供服务...', scope: 'all', status: 'published', createTime: '2024-12-15', views: 892 },
  { id: 3, title: '餐饮行业报告发布', content: '2024年第四季度餐饮行业数字化转型报告正式发布...', scope: 'premium', status: 'published', createTime: '2024-11-20', views: 456 },
  { id: 4, title: '新版本升级公告', content: '店赢OS V3.0版本即将发布，敬请期待...', scope: 'all', status: 'draft', createTime: '2024-12-20', views: 0 }
];

// Mock数据 - 知识库
App.data.knowledgeBase = [
  { id: 1, title: '餐饮行业运营指南', category: 'catering', status: 'published', updateTime: '2024-12-01', views: 3256 },
  { id: 2, title: '智能客服配置手册', category: 'ai', status: 'published', updateTime: '2024-11-28', views: 2180 },
  { id: 3, title: '营销活动策划模板', category: 'marketing', status: 'published', updateTime: '2024-11-25', views: 1856 },
  { id: 4, title: '数据分析功能教程', category: 'analytics', status: 'published', updateTime: '2024-11-20', views: 1423 },
  { id: 5, title: '海报设计进阶指南', category: 'design', status: 'published', updateTime: '2024-11-18', views: 986 },
  { id: 6, title: '会员体系搭建方案', category: 'catering', status: 'draft', updateTime: '2024-12-10', views: 0 },
  { id: 7, title: '节日营销策略合集', category: 'marketing', status: 'published', updateTime: '2024-11-15', views: 2345 },
  { id: 8, title: '外卖平台对接指南', category: 'catering', status: 'published', updateTime: '2024-11-10', views: 1567 },
  { id: 9, title: 'AI助手最佳实践', category: 'ai', status: 'published', updateTime: '2024-11-08', views: 1234 }
];

// Mock数据 - 流失预警
App.data.churnWarning = [
  { id: 1, merchant: '重庆小面', riskLevel: 'high', probability: 78, lastActive: '2024-11-15', reason: '连续30天未登录', suggestion: '立即电话回访' },
  { id: 2, merchant: '合肥小龙虾', riskLevel: 'high', probability: 72, lastActive: '2024-11-18', reason: '功能使用率下降80%', suggestion: '发送专属优惠券' },
  { id: 3, merchant: '厦门沙茶面', riskLevel: 'medium', probability: 55, lastActive: '2024-11-25', reason: '近期差评增加', suggestion: '关注评价回复' },
  { id: 4, merchant: '天津包子铺', riskLevel: 'medium', probability: 48, lastActive: '2024-11-28', reason: '订单量持续下滑', suggestion: '推送营销方案' },
  { id: 5, merchant: '哈尔滨饺子馆', riskLevel: 'low', probability: 25, lastActive: '2024-12-01', reason: '版本即将到期', suggestion: '发送续费提醒' }
];

// Mock数据 - 定价
App.data.pricing = [
  { version: '免费版', price: 0, originalPrice: 0, period: '永久', features: ['基础AI客服', '100次/月', '3个员工账号', '基础数据统计'] },
  { version: '专业版', price: 980, originalPrice: 1280, period: '年付', features: ['完整AI套件', '5000次/月', '10个员工账号', '营销工具', '数据看板', '优先客服'] },
  { version: '旗舰版', price: 5980, originalPrice: 7980, period: '年付', features: ['全部AI能力', '无限次调用', '无限账号', '定制开发', '专属客服', 'API接口', '数据导出'] }
];

// Mock数据 - 角色
App.data.roles = [
  { id: 1, name: '超级管理员', level: 'super', permissions: ['all'], users: 2 },
  { id: 2, name: '运营主管', level: 'operator', permissions: ['merchants', 'content', 'marketing', 'analytics'], users: 5 },
  { id: 3, name: '财务专员', level: 'finance', permissions: ['billing', 'refund', 'invoice', 'reports'], users: 3 },
  { id: 4, name: '客服经理', level: 'support', permissions: ['tickets', 'faq', 'customers'], users: 4 }
];

// Mock数据 - 操作日志
App.data.operationLogs = [
  { id: 1, operator: '张管理员', type: '商家管理', object: '北京湘菜馆', action: '开通旗舰版', time: '2024-12-01 10:30:25', ip: '192.168.1.100' },
  { id: 2, operator: '李运营', type: '内容发布', object: '运营公告#12', action: '发布', time: '2024-12-01 11:45:18', ip: '192.168.1.102' },
  { id: 3, operator: '王财务', type: '账单处理', object: '深圳火锅店', action: '确认收款', time: '2024-12-01 14:22:36', ip: '192.168.1.105' },
  { id: 4, operator: '张管理员', type: '权限配置', object: '代理商#3', action: '升级为钻石代理', time: '2024-12-01 16:08:42', ip: '192.168.1.100' },
  { id: 5, operator: '赵客服', type: '工单处理', object: 'TK202412001', action: '分配给张工', time: '2024-12-01 17:35:15', ip: '192.168.1.108' }
];

// Mock数据 - 跟访记录
App.data.visitRecords = [
  { id: 1, merchant: '北京湘菜馆', salesman: '张伟', type: '电话回访', content: '了解商家对新功能的体验反馈', time: '2024-12-01 10:30', nextVisit: '2024-12-08' },
  { id: 2, merchant: '上海小笼包', salesman: '李娜', type: '上门拜访', content: '演示AI营销工具的使用方法', time: '2024-12-01 14:15', nextVisit: '2024-12-15' },
  { id: 3, merchant: '深圳火锅店', salesman: '王强', type: '线上会议', content: '讨论年度合作续约方案', time: '2024-12-02 09:00', nextVisit: null },
  { id: 4, merchant: '广州茶餐厅', salesman: '赵敏', type: '电话回访', content: '收集商家遇到的问题', time: '2024-12-02 11:30', nextVisit: '2024-12-09' },
  { id: 5, merchant: '成都串串香', salesman: '刘洋', type: '上门拜访', content: '现场解决支付问题', time: '2024-12-02 15:45', nextVisit: '2024-12-16' }
];

// Mock数据 - 退款
App.data.refunds = [
  { id: 1, merchant: '杭州奶茶铺', amount: 380, reason: '误购买', time: '2024-12-01', status: 'pending' },
  { id: 2, merchant: '天津包子铺', amount: 980, reason: '功能不符合预期', time: '2024-11-28', status: 'approved' },
  { id: 3, merchant: '哈尔滨饺子馆', amount: 380, reason: '重复扣费', time: '2024-11-25', status: 'rejected' },
  { id: 4, merchant: '厦门沙茶面', amount: 680, reason: '其他原因', time: '2024-11-20', status: 'approved' }
];

// Mock数据 - 发票
App.data.invoices = [
  { id: 1, merchant: '北京湘菜馆', type: '专票', amount: 5980, status: 'pending', applyTime: '2024-12-01' },
  { id: 2, merchant: '深圳火锅店', type: '普票', amount: 5980, status: 'issued', applyTime: '2024-11-25' },
  { id: 3, merchant: '南京大牌档', type: '专票', amount: 5980, status: 'shipped', applyTime: '2024-11-20' },
  { id: 4, merchant: '郑州烩面馆', type: '普票', amount: 5980, status: 'issued', applyTime: '2024-11-15' }
];

// Mock数据 - 服务商
App.data.serviceProviders = [
  { id: 1, name: '杭州技术服务公司', scope: '技术支持', region: '华东区', qualification: '已认证', merchants: 45 },
  { id: 2, name: '深圳支付解决方案', scope: '支付接入', region: '华南区', qualification: '已认证', merchants: 32 },
  { id: 3, name: '北京小程序开发', scope: '定制开发', region: '华北区', qualification: '审核中', merchants: 18 },
  { id: 4, name: '上海数据分析服务', scope: '数据服务', region: '华东区', qualification: '已认证', merchants: 28 }
];

// Mock数据 - 渠道分析
App.data.channelAnalysis = [
  { channel: '线下沙龙', leads: 320, converted: 86, rate: 26.9, cost: 45000 },
  { channel: '转介绍', leads: 180, converted: 72, rate: 40.0, cost: 28000 },
  { channel: '线上投放', leads: 580, converted: 98, rate: 16.9, cost: 85000 },
  { channel: '代理商推荐', leads: 420, converted: 145, rate: 34.5, cost: 62000 },
  { channel: '内容营销', leads: 250, converted: 45, rate: 18.0, cost: 18000 }
];

// Mock数据 - 合作伙伴
App.data.partners = [
  { id: 1, name: '招商银行', type: '银行', status: 'active', cooperationTime: '2024-01', merchants: 156 },
  { id: 2, name: '有赞科技', type: 'SaaS厂商', status: 'active', cooperationTime: '2024-03', merchants: 89 },
  { id: 3, name: '美团餐饮', type: '平台合作', status: 'active', cooperationTime: '2024-02', merchants: 234 },
  { id: 4, name: '支付宝', type: '支付合作', status: 'active', cooperationTime: '2023-11', merchants: 520 }
];

// Mock数据 - FAQ
App.data.faq = [
  { id: 1, category: '产品功能', question: '如何开通AI客服功能？', answer: '进入商家后台 > AI助手 > 开启智能客服即可...', status: 'published' },
  { id: 2, category: '产品功能', question: '数据报表在哪里查看？', answer: '在数据 > 数据分析中可以查看各类经营数据...', status: 'published' },
  { id: 3, category: '账单支付', question: '如何申请发票？', answer: '在财务 > 发票管理中提交开票申请...', status: 'published' },
  { id: 4, category: '技术支持', question: '系统响应缓慢怎么办？', answer: '建议清理浏览器缓存或更换网络环境...', status: 'draft' }
];

// Mock数据 - 功能开关
App.data.featureFlags = [
  { id: 1, name: 'AI对话2.0', status: 'enabled', scope: 'all', updateTime: '2024-12-01' },
  { id: 2, name: '智能推荐系统', status: 'enabled', scope: 'premium', updateTime: '2024-11-25' },
  { id: 3, name: '多语言支持', status: 'beta', scope: 'selective', updateTime: '2024-12-10' },
  { id: 4, name: 'AR预览功能', status: 'disabled', scope: 'none', updateTime: '2024-10-15' }
];

// Mock数据 - 需求池
App.data.requirements = [
  { id: 1, title: '增加批量导入功能', merchant: '北京湘菜馆', votes: 45, status: 'developing' },
  { id: 2, title: '支持多门店管理', merchant: '深圳火锅店', votes: 38, status: 'scheduled' },
  { id: 3, title: '对接抖音小程序', merchant: '成都串串香', votes: 32, status: 'evaluating' },
  { id: 4, title: '增加积分商城', merchant: '杭州奶茶铺', votes: 28, status: 'released' },
  { id: 5, title: '优化报表导出', merchant: '南京大牌档', votes: 25, status: 'evaluating' }
];

// Mock数据 - 版本管理
App.data.versions = [
  { version: 'V3.0.0', status: 'released', releaseTime: '2024-12-01', changes: '全新UI设计，AI能力升级' },
  { version: 'V2.8.0', status: 'released', releaseTime: '2024-11-01', changes: '增加营销工具模块' },
  { version: 'V2.7.0', status: 'deprecated', releaseTime: '2024-10-01', changes: '优化数据分析功能' },
  { version: 'V2.6.0', status: 'deprecated', releaseTime: '2024-09-01', changes: '修复若干Bug' }
];

// Mock数据 - 登录日志
App.data.loginLogs = [
  { id: 1, user: '张管理员', type: '正常登录', location: '北京市', device: 'Chrome/Win10', time: '2024-12-03 09:15:32', status: 'success' },
  { id: 2, user: '李运营', type: '正常登录', location: '上海市', device: 'Chrome/MacOS', time: '2024-12-03 09:22:18', status: 'success' },
  { id: 3, user: '王财务', type: '异地登录', location: '广州市', device: 'Safari/MacOS', time: '2024-12-03 10:35:45', status: 'warning' },
  { id: 4, user: '赵客服', type: '正常登录', location: '深圳市', device: 'Edge/Win11', time: '2024-12-03 11:08:22', status: 'success' },
  { id: 5, user: '张管理员', type: '密码错误', location: '未知', device: 'Firefox/Win7', time: '2024-12-03 14:22:16', status: 'failed' }
];

// Mock数据 - 行业报告
App.data.industryReports = {
  catering: { merchants: 158, avgGmv: 568000, avgRating: 4.5, aiUsageRate: 72 },
  retail: { merchants: 86, avgGmv: 890000, avgRating: 4.3, aiUsageRate: 68 },
  entertainment: { merchants: 42, avgGmv: 420000, avgRating: 4.6, aiUsageRate: 65 }
};

// Mock数据 - 支付通道
App.data.paymentChannels = [
  { name: '微信支付', status: 'online', successRate: 99.2, avgTime: 120, todayVolume: 856000 },
  { name: '支付宝', status: 'online', successRate: 98.8, avgTime: 135, todayVolume: 728000 },
  { name: '银联支付', status: 'online', successRate: 97.5, avgTime: 180, todayVolume: 245000 },
  { name: '信用卡', status: 'degraded', successRate: 92.3, avgTime: 280, todayVolume: 126000 }
];

// Mock数据 - 结算记录
App.data.settlementRecords = [
  { agent: '华东区代理中心', month: '2024-11', payable: 285000, actual: 285000, status: 'settled', time: '2024-12-01' },
  { agent: '华南区服务中心', month: '2024-11', payable: 168000, actual: 168000, status: 'settled', time: '2024-12-01' },
  { agent: '华北运营总部', month: '2024-11', payable: 420000, actual: 420000, status: 'settled', time: '2024-12-01' },
  { agent: '西南代理商联盟', month: '2024-11', payable: 52000, actual: 52000, status: 'pending', time: null }
];

// Mock数据 - 试用管理
App.data.trialManagement = {
  total: 128,
  active: 45,
  converted: 62,
  expired: 21,
  conversionRate: 48.4
};

// Mock数据 - 邀请裂变
App.data.inviteFission = {
  totalInvites: 856,
  successfulInvites: 324,
  rewardGiven: 48600
};

// Mock数据 - NPS评分
App.data.npsData = {
  promoters: 156,
  passives: 42,
  detractors: 12,
  score: 72
};


// ============================================
// 工具函数
// ============================================
const Utils = {
  // 格式化金额
  formatMoney(amount) {
    return '¥' + amount.toLocaleString('zh-CN');
  },
  
  // 格式化日期
  formatDate(date) {
    if (!date) return '-';
    return date;
  },
  
  // 获取状态样式
  getStatusClass(status) {
    const statusMap = {
      'active': 'success',
      'online': 'success',
      'published': 'success',
      'resolved': 'success',
      'settled': 'success',
      'approved': 'success',
      'released': 'success',
      'inactive': 'danger',
      'offline': 'danger',
      'failed': 'danger',
      'rejected': 'danger',
      'expiring': 'warning',
      'degraded': 'warning',
      'pending': 'warning',
      'draft': 'gray',
      'evaluating': 'gray',
      'scheduled': 'gray'
    };
    return statusMap[status] || 'gray';
  },
  
  // 获取状态标签
  getStatusLabel(status) {
    const labelMap = {
      'active': '正常',
      'inactive': '停用',
      'online': '在线',
      'offline': '离线',
      'degraded': '降级',
      'published': '已发布',
      'draft': '草稿',
      'pending': '待处理',
      'resolved': '已解决',
      'open': '待处理',
      'approved': '已通过',
      'rejected': '已拒绝',
      'expiring': '即将到期',
      'settled': '已结算',
      'shipping': '配送中',
      'shipped': '已发货',
      'issued': '已开票',
      'evaluating': '评估中',
      'scheduled': '已排期',
      'developing': '开发中',
      'released': '已上线',
      'deprecated': '已废弃'
    };
    return labelMap[status] || status;
  },
  
  // 获取版本样式
  getVersionClass(version) {
    const versionMap = {
      '旗舰版': 'primary',
      '专业版': 'accent',
      '免费版': 'gray'
    };
    return versionMap[version] || 'gray';
  },
  
  // 获取等级样式
  getLevelClass(level) {
    const levelMap = {
      'diamond': 'primary',
      'gold': 'warning',
      'silver': 'gray'
    };
    return levelMap[level] || 'gray';
  },
  
  // 获取等级标签
  getLevelLabel(level) {
    const levelMap = {
      'diamond': '钻石',
      'gold': '金牌',
      'silver': '银牌'
    };
    return levelMap[level] || level;
  },
  
  // 百分比
  formatPercent(value) {
    return value.toFixed(1) + '%';
  },
  
  // 数量格式化
  formatCount(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  }
};

// ============================================
// Toast通知
// ============================================
const Toast = {
  show(type, title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i data-lucide="x"></i>
      </button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
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
  show(title, message, onConfirm, isDanger = false) {
    const dialog = document.getElementById('confirmDialog');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const iconEl = dialog.querySelector('.confirm-icon');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    if (isDanger) {
      iconEl.classList.add('danger');
      iconEl.innerHTML = '<i data-lucide="alert-triangle"></i>';
    } else {
      iconEl.classList.remove('danger');
      iconEl.innerHTML = '<i data-lucide="help-circle"></i>';
    }
    
    dialog.classList.add('active');
    lucide.createIcons();
    
    const confirmOk = document.getElementById('confirmOk');
    const confirmCancel = document.getElementById('confirmCancel');
    
    const handleConfirm = () => {
      dialog.classList.remove('active');
      confirmOk.removeEventListener('click', handleConfirm);
      confirmCancel.removeEventListener('click', handleCancel);
      if (onConfirm) onConfirm();
    };
    
    const handleCancel = () => {
      dialog.classList.remove('active');
      confirmOk.removeEventListener('click', handleConfirm);
      confirmCancel.removeEventListener('click', handleCancel);
    };
    
    confirmOk.addEventListener('click', handleConfirm);
    confirmCancel.addEventListener('click', handleCancel);
  },
  
  hide() {
    document.getElementById('confirmDialog').classList.remove('active');
  }
};

// ============================================
// 模态框
// ============================================
const Modal = {
  show(content, options = {}) {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    
    container.innerHTML = content;
    container.className = 'modal-container';
    if (options.large) container.classList.add('modal-lg');
    if (options.extraLarge) container.classList.add('modal-xl');
    
    overlay.classList.add('active');
    lucide.createIcons();
    
    // 点击遮罩关闭
    overlay.onclick = (e) => {
      if (e.target === overlay) this.hide();
    };
    
    return container;
  },
  
  hide() {
    document.getElementById('modalOverlay').classList.remove('active');
  }
};

// ============================================
// 分页组件
// ============================================
const Pagination = {
  render(containerId, current, total, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
      <div class="pagination-info">
        共 ${total} 条
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" ${current === 1 ? 'disabled' : ''} onclick="${onPageChange}(${current - 1})">
          <i data-lucide="chevron-left"></i>
        </button>
    `;
    
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
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
    
    html += `
        <button class="pagination-btn" ${current === total ? 'disabled' : ''} onclick="${onPageChange}(${current + 1})">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    `;
    
    container.innerHTML = html;
    lucide.createIcons();
  }
};

// ============================================
// 侧边栏渲染
// ============================================
function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  let html = '';
  
  menuConfig.forEach(section => {
    html += `<div class="nav-section">
      <div class="nav-section-title">${section.section}</div>
    `;
    
    section.items.forEach(item => {
      html += `
        <div class="nav-item ${App.currentPage === item.id ? 'active' : ''}" 
             data-page="${item.id}"
             onclick="navigateTo('${item.id}')">
          <i data-lucide="${item.icon}"></i>
          <span>${item.name}</span>
        </div>
      `;
    });
    
    html += '</div>';
  });
  
  nav.innerHTML = html;
  lucide.createIcons();
}

// ============================================
// 路由和导航
// ============================================
function navigateTo(pageId, params = {}) {
  App.currentPage = pageId;
  renderSidebar();
  updateBreadcrumb(pageId);
  renderPage(pageId, params);
  window.scrollTo(0, 0);
}

// ============================================
// 面包屑导航
// ============================================
function updateBreadcrumb(pageId) {
  const breadcrumb = document.getElementById('breadcrumb');
  let sectionName = '';
  let pageName = '';
  
  for (const section of menuConfig) {
    const item = section.items.find(i => i.id === pageId);
    if (item) {
      sectionName = section.section;
      pageName = item.name;
      break;
    }
  }
  
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item"><a href="#" onclick="navigateTo('overview')">首页</a></span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item">${sectionName}</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item">${pageName}</span>
  `;
}

// ============================================
// 页面渲染入口
// ============================================
function renderPage(pageId, params = {}) {
  const content = document.getElementById('contentArea');
  
  const pages = {
    // 商家管理
    'merchants': renderMerchantsPage,
    'merchant-detail': renderMerchantDetailPage,
    'merchant-upgrade': renderMerchantUpgradePage,
    'merchant-permission': renderMerchantPermissionPage,
    'merchant-audit': renderMerchantAuditPage,
    
    // 代理商体系
    'agents': renderAgentsPage,
    'agent-merchants': renderAgentMerchantsPage,
    'agent-commission': renderAgentCommissionPage,
    'service-providers': renderServiceProvidersPage,
    'agent-dashboard': renderAgentDashboardPage,
    
    // 业务人员
    'sales': renderSalesPage,
    'customer-assign': renderCustomerAssignPage,
    'sales-performance': renderSalesPerformancePage,
    'visit-records': renderVisitRecordsPage,
    
    // 财务中心
    'revenue': renderRevenuePage,
    'billing': renderBillingPage,
    'refund': renderRefundPage,
    'invoice': renderInvoicePage,
    
    // 内容运营
    'knowledge-base': renderKnowledgeBasePage,
    'ai-templates': renderAITemplatesPage,
    'announcements': renderAnnouncementsPage,
    'activities': renderActivitiesPage,
    
    // 数据洞察
    'overview': renderOverviewPage,
    'industry-report': renderIndustryReportPage,
    'ai-stats': renderAIStatsPage,
    'churn-warning': renderChurnWarningPage,
    
    // 支付交易
    'payment-channels': renderPaymentChannelsPage,
    'transactions': renderTransactionsPage,
    'fee-config': renderFeeConfigPage,
    'split-payment': renderSplitPaymentPage,
    'reconciliation': renderReconciliationPage,
    
    // 客户成功
    'onboarding': renderOnboardingPage,
    'health-score': renderHealthScorePage,
    'renewal': renderRenewalPage,
    'upgrade-funnel': renderUpgradeFunnelPage,
    'wake-up': renderWakeUpPage,
    
    // 渠道增长
    'channel-analysis': renderChannelAnalysisPage,
    'invite-fission': renderInviteFissionPage,
    'trial': renderTrialPage,
    'partners': renderPartnersPage,
    
    // 客服支持
    'tickets': renderTicketsPage,
    'faq': renderFAQPage,
    'satisfaction': renderSatisfactionPage,
    
    // 产品迭代
    'feature-flags': renderFeatureFlagsPage,
    'ab-test': renderABTestPage,
    'requirements': renderRequirementsPage,
    'version-management': renderVersionManagementPage,
    
    // 安全合规
    'login-security': renderLoginSecurityPage,
    'data-masking': renderDataMaskingPage,
    'compliance': renderCompliancePage,
    
    // 系统设置
    'roles': renderRolesPage,
    'operation-logs': renderOperationLogsPage,
    'pricing': renderPricingPage,
    'notifications': renderNotificationsPage
  };
  
  if (pages[pageId]) {
    content.innerHTML = '<div class="animate-fadeIn">';
    pages[pageId](content, params);
    content.innerHTML += '</div>';
    lucide.createIcons();
  } else {
    content.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="layout-dashboard"></i></div><h3 class="empty-title">页面开发中</h3></div>';
    lucide.createIcons();
  }
}


// ============================================
// 页面渲染函数 - 商家管理
// ============================================

// 1. 商家列表
function renderMerchantsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家列表</h1>
        <p class="page-subtitle">管理所有入驻商家信息</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showAddMerchantModal()">
          <i data-lucide="plus"></i> 新增商家
        </button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">商家总数</div>
          <div class="stat-value">${App.data.merchants.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃商家</div>
          <div class="stat-value">${App.data.merchants.filter(m => m.status === 'active').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">即将到期</div>
          <div class="stat-value">${App.data.merchants.filter(m => m.status === 'expiring').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger"><i data-lucide="user-x"></i></div>
        <div class="stat-content">
          <div class="stat-label">停用商家</div>
          <div class="stat-value">${App.data.merchants.filter(m => m.status === 'inactive').length}</div>
        </div>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">行业</span>
        <select class="filter-select" id="filterIndustry">
          <option value="">全部行业</option>
          <option value="餐饮">餐饮</option>
        </select>
      </div>
      <div class="filter-group">
        <span class="filter-label">版本</span>
        <select class="filter-select" id="filterVersion">
          <option value="">全部版本</option>
          <option value="旗舰版">旗舰版</option>
          <option value="专业版">专业版</option>
          <option value="免费版">免费版</option>
        </select>
      </div>
      <div class="filter-group">
        <span class="filter-label">状态</span>
        <select class="filter-select" id="filterStatus">
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="expiring">即将到期</option>
          <option value="inactive">停用</option>
        </select>
      </div>
      <div class="filter-group search-input">
        <i data-lucide="search"></i>
        <input type="text" class="form-input" placeholder="搜索商家名称..." id="searchMerchant" style="width:200px">
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">商家列表</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>商家名称</th>
              <th>行业</th>
              <th>版本</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>到期时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="merchantsTableBody">
            ${renderMerchantsTable(App.data.merchants)}
          </tbody>
        </table>
      </div>
      <div class="table-pagination" id="merchantsPagination"></div>
    </div>
  `;
  
  // 绑定筛选事件
  setTimeout(() => {
    document.getElementById('filterVersion')?.addEventListener('change', filterMerchants);
    document.getElementById('filterStatus')?.addEventListener('change', filterMerchants);
    document.getElementById('searchMerchant')?.addEventListener('input', filterMerchants);
  }, 100);
}

function renderMerchantsTable(merchants) {
  return merchants.map(m => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar">${m.name.charAt(0)}</div>
          <span class="font-medium">${m.name}</span>
        </div>
      </td>
      <td>${m.industry}</td>
      <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
      <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
      <td>${m.registerTime}</td>
      <td class="${m.status === 'expiring' ? 'text-warning' : ''}">${m.expireTime}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick="viewMerchantDetail(${m.id})" title="查看">
            <i data-lucide="eye"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="openUpgradeModal(${m.id})" title="开通/续费">
            <i data-lucide="credit-card"></i>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="toggleMerchantStatus(${m.id})" title="${m.status === 'active' ? '停用' : '启用'}">
            <i data-lucide="${m.status === 'active' ? 'user-x' : 'user-check'}"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterMerchants() {
  const version = document.getElementById('filterVersion').value;
  const status = document.getElementById('filterStatus').value;
  const search = document.getElementById('searchMerchant').value.toLowerCase();
  
  let filtered = App.data.merchants.filter(m => {
    if (version && m.version !== version) return false;
    if (status && m.status !== status) return false;
    if (search && !m.name.toLowerCase().includes(search)) return false;
    return true;
  });
  
  document.getElementById('merchantsTableBody').innerHTML = renderMerchantsTable(filtered);
  lucide.createIcons();
}

function viewMerchantDetail(id) {
  navigateTo('merchant-detail', { id });
}

function openUpgradeModal(id) {
  const merchant = App.data.merchants.find(m => m.id === id);
  const content = `
    <div class="modal-header">
      <h3 class="modal-title">开通/续费 - ${merchant.name}</h3>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">当前版本</label>
        <div class="badge badge-${Utils.getVersionClass(merchant.version)}" style="font-size:1rem;padding:8px 16px">${merchant.version}</div>
      </div>
      <div class="form-group">
        <label class="form-label">选择版本</label>
        <select class="form-input" id="upgradeVersion">
          <option value="free" ${merchant.version === '免费版' ? 'selected' : ''}>免费版 - ¥0/年</option>
          <option value="pro" ${merchant.version === '专业版' ? 'selected' : ''}>专业版 - ¥980/年</option>
          <option value="旗舰版" ${merchant.version === '旗舰版' ? 'selected' : ''}>旗舰版 - ¥5980/年</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">购买时长</label>
        <select class="form-input" id="upgradePeriod">
          <option value="1">1年</option>
          <option value="2">2年 (9折)</option>
          <option value="3">3年 (8折)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">应付金额</label>
        <div class="text-2xl font-bold text-primary" id="upgradeAmount">¥980</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">取消</button>
      <button class="btn btn-primary" onclick="confirmUpgrade(${id})">确认开通</button>
    </div>
  `;
  Modal.show(content);
  
  // 绑定金额计算
  document.getElementById('upgradeVersion')?.addEventListener('change', calculateUpgradeAmount);
  document.getElementById('upgradePeriod')?.addEventListener('change', calculateUpgradeAmount);
}

function calculateUpgradeAmount() {
  const version = document.getElementById('upgradeVersion').value;
  const period = parseInt(document.getElementById('upgradePeriod').value);
  const prices = { 'free': 0, 'pro': 980, '旗舰版': 5980 };
  const discounts = { 1: 1, 2: 0.9, 3: 0.8 };
  const amount = (prices[version] || 0) * (discounts[period] || 1) * period;
  document.getElementById('upgradeAmount').textContent = '¥' + amount.toLocaleString();
}

function confirmUpgrade(id) {
  Modal.hide();
  Toast.success('开通成功', '商家版本已成功升级');
}

function toggleMerchantStatus(id) {
  const merchant = App.data.merchants.find(m => m.id === id);
  const action = merchant.status === 'active' ? '停用' : '启用';
  ConfirmDialog.show(
    `${action}商家`,
    `确定要${action}商家"${merchant.name}"吗？`,
    () => {
      merchant.status = merchant.status === 'active' ? 'inactive' : 'active';
      Toast.success('操作成功', `商家已${action}`);
      filterMerchants();
    },
    merchant.status === 'active'
  );
}

function showAddMerchantModal() {
  const content = `
    <div class="modal-header">
      <h3 class="modal-title">新增商家</h3>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">商家名称 *</label>
          <input type="text" class="form-input" id="newMerchantName" placeholder="请输入商家名称">
        </div>
        <div class="form-group">
          <label class="form-label">行业分类 *</label>
          <select class="form-input" id="newMerchantIndustry">
            <option value="餐饮">餐饮</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">联系人</label>
          <input type="text" class="form-input" id="newMerchantContact" placeholder="请输入联系人">
        </div>
        <div class="form-group">
          <label class="form-label">联系电话</label>
          <input type="tel" class="form-input" id="newMerchantPhone" placeholder="请输入联系电话">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">初始版本</label>
        <select class="form-input" id="newMerchantVersion">
          <option value="免费版">免费版</option>
          <option value="专业版">专业版</option>
          <option value="旗舰版">旗舰版</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">取消</button>
      <button class="btn btn-primary" onclick="addMerchant()">确认添加</button>
    </div>
  `;
  Modal.show(content);
}

function addMerchant() {
  const name = document.getElementById('newMerchantName').value;
  if (!name) {
    Toast.error('错误', '请输入商家名称');
    return;
  }
  
  const newMerchant = {
    id: App.data.merchants.length + 1,
    name: name,
    industry: document.getElementById('newMerchantIndustry').value,
    version: document.getElementById('newMerchantVersion').value,
    status: 'active',
    registerTime: new Date().toISOString().split('T')[0],
    expireTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gmv: 0,
    orders: 0,
    rating: 0,
    aiUsage: 0
  };
  
  App.data.merchants.push(newMerchant);
  Modal.hide();
  Toast.success('添加成功', '商家已成功添加');
  navigateTo('merchants');
}

// 2. 商家详情
function renderMerchantDetailPage(container, params) {
  const id = params.id || 1;
  const merchant = App.data.merchants.find(m => m.id === id) || App.data.merchants[0];
  
  container.innerHTML += `
    <div class="page-header">
      <div class="flex items-center gap-4">
        <button class="btn btn-ghost" onclick="navigateTo('merchants')">
          <i data-lucide="arrow-left"></i> 返回
        </button>
        <div>
          <h1 class="page-title">${merchant.name}</h1>
          <p class="page-subtitle">商家ID: ${merchant.id}</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="openUpgradeModal(${merchant.id})">
          <i data-lucide="credit-card"></i> 开通/续费
        </button>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="building-2"></i> 基本信息</h3>
        <button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i> 编辑</button>
      </div>
      <div class="grid-4">
        <div><span class="text-muted">商家名称</span><div class="font-medium">${merchant.name}</div></div>
        <div><span class="text-muted">行业分类</span><div class="font-medium">${merchant.industry}</div></div>
        <div><span class="text-muted">当前版本</span><div><span class="badge badge-${Utils.getVersionClass(merchant.version)}">${merchant.version}</span></div></div>
        <div><span class="text-muted">账户状态</span><div><span class="badge badge-${Utils.getStatusClass(merchant.status)}">${Utils.getStatusLabel(merchant.status)}</span></div></div>
        <div><span class="text-muted">注册时间</span><div class="font-medium">${merchant.registerTime}</div></div>
        <div><span class="text-muted">到期时间</span><div class="font-medium ${merchant.status === 'expiring' ? 'text-warning' : ''}">${merchant.expireTime}</div></div>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">累计GMV</div>
          <div class="stat-value">${Utils.formatMoney(merchant.gmv)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="shopping-cart"></i></div>
        <div class="stat-content">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">${merchant.orders.toLocaleString()}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="star"></i></div>
        <div class="stat-content">
          <div class="stat-label">评分</div>
          <div class="stat-value">${merchant.rating}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="cpu"></i></div>
        <div class="stat-content">
          <div class="stat-label">AI使用量</div>
          <div class="stat-value">${merchant.aiUsage.toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="toggle-right"></i> 版本权限</h3>
      </div>
      <div class="flex flex-wrap gap-3">
        ${renderPermissionTags(merchant.version)}
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="history"></i> 操作日志</h3>
      </div>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot success"></div>
          <div class="timeline-content">
            <div class="timeline-time">2024-12-01 10:30</div>
            <div class="timeline-title">开通旗舰版</div>
            <div class="timeline-description">操作人: 张管理员</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-time">2024-11-15 14:22</div>
            <div class="timeline-title">首次使用AI功能</div>
            <div class="timeline-description">使用智能客服进行客户咨询回复</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-time">2024-11-01 09:00</div>
            <div class="timeline-title">商家注册成功</div>
            <div class="timeline-description">完成企业认证，正式入驻平台</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPermissionTags(version) {
  const permissions = {
    '免费版': ['基础AI客服', '100次/月', '3个账号', '基础统计'],
    '专业版': ['完整AI套件', '5000次/月', '10个账号', '营销工具', '数据看板', '优先客服'],
    '旗舰版': ['全部AI能力', '无限调用', '无限账号', '定制开发', '专属客服', 'API接口', '数据导出']
  };
  
  return (permissions[version] || []).map(p => `<span class="permission-tag allowed"><i data-lucide="check"></i> ${p}</span>`).join('');
}

// 3. 开通续费
function renderMerchantUpgradePage(container) {
  const expiringMerchants = App.data.merchants.filter(m => m.status === 'expiring');
  const upcomingExpire = App.data.merchants.filter(m => {
    const expireDate = new Date(m.expireTime);
    const daysUntil = (expireDate - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30 && daysUntil > 0 && m.status !== 'expiring';
  });
  
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">开通/续费管理</h1>
        <p class="page-subtitle">管理商家版本升级和续费</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-content">
          <div class="stat-label">即将到期(7天内)</div>
          <div class="stat-value">${expiringMerchants.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="arrow-up-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月升级</div>
          <div class="stat-value">12</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="refresh-cw"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月续费</div>
          <div class="stat-value">28</div>
        </div>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="alert-circle"></i> 到期预警</h3>
      </div>
      ${expiringMerchants.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>商家名称</th>
              <th>当前版本</th>
              <th>到期时间</th>
              <th>剩余天数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${expiringMerchants.map(m => {
              const daysLeft = Math.ceil((new Date(m.expireTime) - new Date()) / (1000 * 60 * 60 * 24));
              return `
                <tr class="${daysLeft <= 7 ? 'text-danger' : ''}">
                  <td>${m.name}</td>
                  <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
                  <td>${m.expireTime}</td>
                  <td><span class="badge badge-danger">${daysLeft}天</span></td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="openUpgradeModal(${m.id})">
                      立即续费
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<div class="empty-state"><p class="text-muted">暂无即将到期的商家</p></div>'}
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="list"></i> 续费记录</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>商家</th>
            <th>操作类型</th>
            <th>版本</th>
            <th>金额</th>
            <th>时间</th>
            <th>操作人</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>北京湘菜馆</td>
            <td><span class="badge badge-primary">升级</span></td>
            <td>专业版 → 旗舰版</td>
            <td>¥5,000</td>
            <td>2024-12-01</td>
            <td>张管理员</td>
          </tr>
          <tr>
            <td>成都串串香</td>
            <td><span class="badge badge-success">续费</span></td>
            <td>专业版</td>
            <td>¥980</td>
            <td>2024-11-28</td>
            <td>系统自动</td>
          </tr>
          <tr>
            <td>深圳火锅店</td>
            <td><span class="badge badge-primary">升级</span></td>
            <td>专业版 → 旗舰版</td>
            <td>¥5,000</td>
            <td>2024-11-20</td>
            <td>李运营</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// 4. 权限配置
function renderMerchantPermissionPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">权限配置</h1>
        <p class="page-subtitle">配置各版本功能权限矩阵</p>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="shield"></i> 版本功能权限矩阵</h3>
        <button class="btn btn-primary btn-sm"><i data-lucide="save"></i> 保存配置</button>
      </div>
      <div class="table-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>功能模块</th>
              <th>免费版</th>
              <th>专业版</th>
              <th>旗舰版</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AI智能客服</td>
              <td><i data-lucide="check" class="text-success"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
            </tr>
            <tr>
              <td>AI对话次数</td>
              <td>100次/月</td>
              <td>5000次/月</td>
              <td>无限</td>
            </tr>
            <tr>
              <td>营销助手</td>
              <td><i data-lucide="x" class="text-danger"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
            </tr>
            <tr>
              <td>数据分析</td>
              <td>基础</td>
              <td>完整</td>
              <td>完整+自定义</td>
            </tr>
            <tr>
              <td>海报设计</td>
              <td>5个模板</td>
              <td>50个模板</td>
              <td>全部+定制</td>
            </tr>
            <tr>
              <td>员工账号</td>
              <td>3个</td>
              <td>10个</td>
              <td>不限</td>
            </tr>
            <tr>
              <td>API接口</td>
              <td><i data-lucide="x" class="text-danger"></i></td>
              <td><i data-lucide="x" class="text-danger"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
            </tr>
            <tr>
              <td>专属客服</td>
              <td><i data-lucide="x" class="text-danger"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
              <td><i data-lucide="check" class="text-success"></i></td>
            </tr>
            <tr>
              <td>数据导出</td>
              <td><i data-lucide="x" class="text-danger"></i></td>
              <td>月报</td>
              <td>全部+实时</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="settings"></i> 自定义权限覆盖</h3>
      </div>
      <div class="filter-bar">
        <div class="filter-group search-input">
          <i data-lucide="search"></i>
          <input type="text" class="form-input" placeholder="搜索商家..." style="width:250px">
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>商家</th>
            <th>基础版本</th>
            <th>附加权限</th>
            <th>到期时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>北京湘菜馆</td>
            <td><span class="badge badge-primary">旗舰版</span></td>
            <td><span class="permission-tag custom">API白名单</span></td>
            <td>2025-01-15</td>
            <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td>
          </tr>
          <tr>
            <td>深圳火锅店</td>
            <td><span class="badge badge-primary">旗舰版</span></td>
            <td><span class="permission-tag allowed">全功能</span></td>
            <td>2025-01-05</td>
            <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// 5. 商家审核
function renderMerchantAuditPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">商家审核</h1>
        <p class="page-subtitle">审核商家入驻申请和资质</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="clock"></i></div>
        <div class="stat-content">
          <div class="stat-label">待审核</div>
          <div class="stat-value">5</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月通过</div>
          <div class="stat-value">28</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger"><i data-lucide="x-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月驳回</div>
          <div class="stat-value">3</div>
        </div>
      </div>
    </div>
    
    <div class="tabs mb-4">
      <div class="tab active">待审核 (5)</div>
      <div class="tab">已通过</div>
      <div class="tab">已驳回</div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">待审核商家</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>企业名称</th>
            <th>联系人</th>
            <th>行业</th>
            <th>申请版本</th>
            <th>资质状态</th>
            <th>申请时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>上海新派餐厅</td>
            <td>王经理 13800138020</td>
            <td>餐饮</td>
            <td><span class="badge badge-primary">旗舰版</span></td>
            <td><span class="badge badge-success">已上传</span></td>
            <td>2024-12-01</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="approveMerchant(this)">通过</button>
              <button class="btn btn-danger btn-sm" onclick="rejectMerchant(this)">驳回</button>
              <button class="btn btn-ghost btn-sm" onclick="viewMerchantCert()">查看</button>
            </td>
          </tr>
          <tr>
            <td>广州粤式茶楼</td>
            <td>李总 13800138021</td>
            <td>餐饮</td>
            <td><span class="badge badge-accent">专业版</span></td>
            <td><span class="badge badge-warning">待补充</span></td>
            <td>2024-11-30</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="approveMerchant(this)">通过</button>
              <button class="btn btn-danger btn-sm" onclick="rejectMerchant(this)">驳回</button>
              <button class="btn btn-ghost btn-sm" onclick="viewMerchantCert()">查看</button>
            </td>
          </tr>
          <tr>
            <td>深圳创意料理</td>
            <td>张总监 13800138022</td>
            <td>餐饮</td>
            <td><span class="badge badge-gray">免费版</span></td>
            <td><span class="badge badge-success">已上传</span></td>
            <td>2024-11-29</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="approveMerchant(this)">通过</button>
              <button class="btn btn-danger btn-sm" onclick="rejectMerchant(this)">驳回</button>
              <button class="btn btn-ghost btn-sm" onclick="viewMerchantCert()">查看</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function approveMerchant(btn) {
  const row = btn.closest('tr');
  ConfirmDialog.show('审核通过', '确定要通过该商家入驻申请吗？', () => {
    row.remove();
    Toast.success('审核成功', '商家已通过审核');
  });
}

function rejectMerchant(btn) {
  const content = `
    <div class="modal-header">
      <h3 class="modal-title">驳回原因</h3>
      <button class="modal-close" onclick="Modal.hide()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">选择驳回原因</label>
        <select class="form-input" id="rejectReason">
          <option value="资质不全">资质材料不全</option>
          <option value="信息不符">企业信息与营业执照不符</option>
          <option value="行业限制">行业不在服务范围内</option>
          <option value="其他">其他原因</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">补充说明</label>
        <textarea class="form-input" id="rejectDetail" placeholder="请输入详细说明..."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="Modal.hide()">取消</button>
      <button class="btn btn-danger" onclick="confirmReject()">确认驳回</button>
    </div>
  `;
  Modal.show(content);
}

function confirmReject() {
  Modal.hide();
  Toast.success('已驳回', '商家申请已驳回');
}

function viewMerchantCert() {
  Toast.info('查看资质', '资质文件详情页面');
}


// ============================================
// 页面渲染函数 - 代理商体系
// ============================================

// 6. 代理商管理
function renderAgentsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">代理商管理</h1>
        <p class="page-subtitle">管理平台代理商体系</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showAddAgentModal()">
          <i data-lucide="plus"></i> 新增代理商
        </button>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">代理商总数</div>
          <div class="stat-value">${App.data.agents.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="diamond"></i></div>
        <div class="stat-content">
          <div class="stat-label">钻石代理</div>
          <div class="stat-value">${App.data.agents.filter(a => a.level === 'diamond').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="trending-up"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月GMV</div>
          <div class="stat-value">¥${(App.data.agents.reduce((sum, a) => sum + a.monthlyGmv, 0) / 10000).toFixed(0)}万</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">代理商列表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>代理商名称</th>
            <th>等级</th>
            <th>下级商家数</th>
            <th>本月GMV</th>
            <th>状态</th>
            <th>入驻时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.agents.map(a => `
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar" style="background: ${a.level === 'diamond' ? 'linear-gradient(135deg, #b9f2ff, #7dd3fc)' : a.level === 'gold' ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'linear-gradient(135deg, #c0c0c0, #a8a8a8)'}">
                    ${a.name.charAt(0)}
                  </div>
                  <span class="font-medium">${a.name}</span>
                </div>
              </td>
              <td><span class="level-badge ${a.level}">${Utils.getLevelLabel(a.level)}</span></td>
              <td>${a.merchants}</td>
              <td>${Utils.formatMoney(a.monthlyGmv)}</td>
              <td><span class="badge badge-${Utils.getStatusClass(a.status)}">${Utils.getStatusLabel(a.status)}</span></td>
              <td>${a.joinTime}</td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="viewAgentMerchants(${a.id})" title="查看下级">
                  <i data-lucide="git-branch"></i>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="editAgent(${a.id})" title="编辑">
                  <i data-lucide="edit-2"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddAgentModal() {
  Toast.info('新增代理商', '代理商添加表单');
}

function viewAgentMerchants(id) {
  navigateTo('agent-merchants', { agentId: id });
}

function editAgent(id) {
  Toast.info('编辑代理商', '代理商编辑表单');
}

// 7. 下级商家
function renderAgentMerchantsPage(container, params) {
  const agentId = params.agentId || 1;
  const agent = App.data.agents.find(a => a.id === agentId) || App.data.agents[0];
  
  container.innerHTML += `
    <div class="page-header">
      <div class="flex items-center gap-4">
        <button class="btn btn-ghost" onclick="navigateTo('agents')">
          <i data-lucide="arrow-left"></i> 返回
        </button>
        <div>
          <h1 class="page-title">${agent.name}</h1>
          <p class="page-subtitle">下级商家列表 - 共${agent.merchants}家</p>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">商家列表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>商家名称</th>
            <th>版本</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>本月GMV</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.merchants.slice(0, 8).map(m => `
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">${m.name.charAt(0)}</div>
                  <span>${m.name}</span>
                </div>
              </td>
              <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${Utils.getStatusLabel(m.status)}</span></td>
              <td>${m.registerTime}</td>
              <td>¥${(m.gmv * 0.1).toLocaleString()}</td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="viewMerchantDetail(${m.id})">详情</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 8. 佣金分润
function renderAgentCommissionPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">佣金分润</h1>
        <p class="page-subtitle">管理代理商佣金比例和结算</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月应付佣金</div>
          <div class="stat-value">¥285,600</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">已结算</div>
          <div class="stat-value">¥256,000</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="clock"></i></div>
        <div class="stat-content">
          <div class="stat-label">待结算</div>
          <div class="stat-value">¥29,600</div>
        </div>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="percent"></i> 分润比例表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>代理商等级</th>
            <th>佣金比例</th>
            <th>说明</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="level-badge diamond">钻石</span></td>
            <td>25%</td>
            <td>商家付费金额的25%作为佣金</td>
            <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td>
          </tr>
          <tr>
            <td><span class="level-badge gold">金牌</span></td>
            <td>20%</td>
            <td>商家付费金额的20%作为佣金</td>
            <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td>
          </tr>
          <tr>
            <td><span class="level-badge silver">银牌</span></td>
            <td>15%</td>
            <td>商家付费金额的15%作为佣金</td>
            <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="file-text"></i> 结算记录</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>代理商</th>
            <th>结算月份</th>
            <th>应结金额</th>
            <th>实结金额</th>
            <th>状态</th>
            <th>结算时间</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.settlementRecords.map(s => `
            <tr>
              <td>${s.agent}</td>
              <td>${s.month}</td>
              <td>¥${s.payable.toLocaleString()}</td>
              <td>¥${s.actual.toLocaleString()}</td>
              <td><span class="badge badge-${Utils.getStatusClass(s.status)}">${Utils.getStatusLabel(s.status)}</span></td>
              <td>${s.time || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 9. 服务商管理
function renderServiceProvidersPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">服务商管理</h1>
        <p class="page-subtitle">管理平台第三方服务商</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary">
          <i data-lucide="plus"></i> 新增服务商
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">服务商列表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>服务商名称</th>
            <th>服务范围</th>
            <th>覆盖区域</th>
            <th>资质状态</th>
            <th>服务商家数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.serviceProviders.map(s => `
            <tr>
              <td class="font-medium">${s.name}</td>
              <td>${s.scope}</td>
              <td>${s.region}</td>
              <td><span class="badge badge-${Utils.getStatusClass(s.qualification === '已认证' ? 'active' : 'pending')}">${s.qualification}</span></td>
              <td>${s.merchants}</td>
              <td>
                <button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button>
                <button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 10. 代理商看板
function renderAgentDashboardPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">代理商看板</h1>
        <p class="page-subtitle">代理商整体运营数据概览</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">代理商总数</div>
          <div class="stat-value">${App.data.agents.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="store"></i></div>
        <div class="stat-content">
          <div class="stat-label">覆盖商家</div>
          <div class="stat-value">${App.data.agents.reduce((sum, a) => sum + a.merchants, 0)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">总GMV</div>
          <div class="stat-value">¥${(App.data.agents.reduce((sum, a) => sum + a.monthlyGmv, 0) / 10000).toFixed(0)}万</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">拓店趋势</h3>
        </div>
        <div class="chart-wrapper">
          <canvas id="agentTrendChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">活跃度排名</h3>
        </div>
        <div class="chart-wrapper">
          <canvas id="agentActivityChart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="trophy"></i> TOP5 代理商</h3>
      </div>
      <div class="grid-5" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px">
        ${App.data.agents.sort((a, b) => b.monthlyGmv - a.monthlyGmv).slice(0, 5).map((a, i) => `
          <div class="card" style="padding:16px;text-align:center">
            <div class="avatar" style="margin:0 auto 12px;width:48px;height:48px;background:${i === 0 ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'linear-gradient(135deg, var(--primary), var(--accent))'}">
              ${i + 1}
            </div>
            <div class="font-semibold">${a.name}</div>
            <div class="text-sm text-muted">${Utils.formatMoney(a.monthlyGmv)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  setTimeout(() => {
    renderAgentCharts();
  }, 100);
}

function renderAgentCharts() {
  // 拓店趋势图
  const trendCtx = document.getElementById('agentTrendChart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [{
          label: '新增商家数',
          data: [45, 52, 48, 65, 72, 85],
          borderColor: '#5e6ad2',
          backgroundColor: 'rgba(94,106,210,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }
        }
      }
    });
  }
  
  // 活跃度排名图
  const activityCtx = document.getElementById('agentActivityChart');
  if (activityCtx) {
    new Chart(activityCtx, {
      type: 'bar',
      data: {
        labels: App.data.agents.slice(0, 5).map(a => a.name.substring(0, 4)),
        datasets: [{
          label: '活跃度',
          data: [95, 88, 82, 76, 71],
          backgroundColor: ['#5e6ad2', '#00b8cc', '#10b981', '#f59e0b', '#8b92e3']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }
        }
      }
    });
  }
}

// ============================================
// 页面渲染函数 - 业务人员
// ============================================

// 11. 业务员管理
function renderSalesPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">业务员管理</h1>
        <p class="page-subtitle">管理销售团队和业绩</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showAddSalesModal()">
          <i data-lucide="plus"></i> 新增业务员
        </button>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="users"></i></div>
        <div class="stat-content">
          <div class="stat-label">业务员总数</div>
          <div class="stat-value">${App.data.sales.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="user-check"></i></div>
        <div class="stat-content">
          <div class="stat-label">活跃业务员</div>
          <div class="stat-value">${App.data.sales.filter(s => s.status === 'active').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="target"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月签约</div>
          <div class="stat-value">${App.data.sales.reduce((sum, s) => sum + s.thisMonthSign, 0)}</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">业务员列表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>负责区域</th>
            <th>状态</th>
            <th>客户数</th>
            <th>本月签约</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.sales.map(s => `
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar sm">${s.name.charAt(0)}</div>
                  <span class="font-medium">${s.name}</span>
                </div>
              </td>
              <td>${s.phone}</td>
              <td>${s.region}</td>
              <td><span class="badge badge-${Utils.getStatusClass(s.status)}">${Utils.getStatusLabel(s.status)}</span></td>
              <td>${s.customers}</td>
              <td><span class="text-success font-semibold">${s.thisMonthSign}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="viewSalesPerformance(${s.id})">详情</button>
                <button class="btn btn-ghost btn-sm" onclick="editSales(${s.id})"><i data-lucide="edit-2"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddSalesModal() { Toast.info('新增业务员', '表单弹窗'); }
function viewSalesPerformance(id) { navigateTo('sales-performance'); }
function editSales(id) { Toast.info('编辑业务员', '表单弹窗'); }

// 12. 客户分配
function renderCustomerAssignPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">客户分配</h1>
        <p class="page-subtitle">将未分配商家分配给业务员</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="user-plus"></i></div>
        <div class="stat-content">
          <div class="stat-label">待分配商家</div>
          <div class="stat-value">12</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月已分配</div>
          <div class="stat-value">28</div>
        </div>
      </div>
    </div>
    
    <div class="grid-2 mb-6">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="inbox"></i> 待分配商家</h3>
        </div>
        <div style="max-height:400px;overflow-y:auto">
          ${App.data.merchants.slice(0, 6).map(m => `
            <div class="flex items-center justify-between p-3" style="border-bottom:1px solid var(--border)">
              <div>
                <div class="font-medium">${m.name}</div>
                <div class="text-xs text-muted">${m.industry} · ${m.version}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="assignCustomer(${m.id})">分配</button>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="users"></i> 业务员列表</h3>
        </div>
        <div style="max-height:400px;overflow-y:auto">
          ${App.data.sales.filter(s => s.status === 'active').map(s => `
            <div class="flex items-center justify-between p-3" style="border-bottom:1px solid var(--border)">
              <div class="flex items-center gap-3">
                <div class="avatar sm">${s.name.charAt(0)}</div>
                <div>
                  <div class="font-medium">${s.name}</div>
                  <div class="text-xs text-muted">${s.region} · ${s.customers}个客户</div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm">查看</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function assignCustomer(id) {
  Toast.success('分配成功', '商家已分配给业务员');
}

// 13. 业绩看板
function renderSalesPerformancePage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">业绩看板</h1>
        <p class="page-subtitle">销售团队整体业绩数据</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="target"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月签约数</div>
          <div class="stat-value">${App.data.sales.reduce((sum, s) => sum + s.thisMonthSign, 0)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="trending-up"></i></div>
        <div class="stat-content">
          <div class="stat-label">环比增长</div>
          <div class="stat-value text-success">+15.8%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="percent"></i></div>
        <div class="stat-content">
          <div class="stat-label">续费率</div>
          <div class="stat-value">89.5%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">签约排名</h3>
        </div>
        <div class="chart-wrapper">
          <canvas id="signRankingChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">月度趋势</h3>
        </div>
        <div class="chart-wrapper">
          <canvas id="monthlyTrendChart"></canvas>
        </div>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('signRankingChart'), {
      type: 'bar',
      data: {
        labels: App.data.sales.slice(0, 6).map(s => s.name),
        datasets: [{
          label: '签约数',
          data: App.data.sales.slice(0, 6).map(s => s.thisMonthSign),
          backgroundColor: '#5e6ad2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }
        }
      }
    });
    
    new Chart(document.getElementById('monthlyTrendChart'), {
      type: 'line',
      data: {
        labels: ['7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [{
          label: '签约数',
          data: [35, 42, 38, 52, 48, 59],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }
        }
      }
    });
  }, 100);
}

// 14. 跟访记录
function renderVisitRecordsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">跟访记录</h1>
        <p class="page-subtitle">记录业务员拜访客户情况</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="map-pin"></i> 跟访时间线</h3>
      </div>
      <div class="timeline">
        ${App.data.visitRecords.map(v => `
          <div class="timeline-item">
            <div class="timeline-dot success"></div>
            <div class="timeline-content">
              <div class="flex justify-between items-start">
                <div>
                  <div class="timeline-title">${v.merchant} - ${v.type}</div>
                  <div class="timeline-description">${v.content}</div>
                  <div class="mt-2">
                    <span class="tag">${v.salesman}</span>
                    <span class="tag">${v.time}</span>
                  </div>
                </div>
                ${v.nextVisit ? `<span class="badge badge-warning">下次: ${v.nextVisit}</span>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 财务中心
// ============================================

// 15. 收入总览
function renderRevenuePage(container) {
  const totalRevenue = App.data.revenueTrend.reduce((sum, r) => sum + r.amount, 0);
  const currentMonth = App.data.revenueTrend[App.data.revenueTrend.length - 1];
  const lastMonth = App.data.revenueTrend[App.data.revenueTrend.length - 2];
  const growth = ((currentMonth.amount - lastMonth.amount) / lastMonth.amount * 100).toFixed(1);
  
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">收入总览</h1>
        <p class="page-subtitle">平台整体财务数据</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon primary"><i data-lucide="wallet"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">${Utils.formatMoney(currentMonth.amount)}</div>
          <div class="stat-change up"><i data-lucide="trending-up"></i> +${growth}%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="calendar"></i></div>
        <div class="stat-content">
          <div class="stat-label">上月收入</div>
          <div class="stat-value">${Utils.formatMoney(lastMonth.amount)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="bar-chart"></i></div>
        <div class="stat-content">
          <div class="stat-label">年度累计</div>
          <div class="stat-value">${Utils.formatMoney(totalRevenue)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accent"><i data-lucide="pie-chart"></i></div>
        <div class="stat-content">
          <div class="stat-label">月均收入</div>
          <div class="stat-value">${Utils.formatMoney(Math.round(totalRevenue / 12))}</div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container" style="grid-column: span 2">
        <div class="chart-header">
          <h3 class="chart-title">月度收入趋势</h3>
        </div>
        <div class="chart-wrapper" style="height:350px">
          <canvas id="revenueTrendChart"></canvas>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="pie-chart"></i> 收入构成</h3>
      </div>
      <div class="chart-wrapper" style="height:300px">
        <canvas id="revenue构成Chart"></canvas>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('revenueTrendChart'), {
      type: 'line',
      data: {
        labels: App.data.revenueTrend.map(r => r.month),
        datasets: [{
          label: '收入',
          data: App.data.revenueTrend.map(r => r.amount),
          borderColor: '#5e6ad2',
          backgroundColor: 'rgba(94,106,210,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b', callback: v => '¥' + (v/10000) + '万' } }
        }
      }
    });
    
    new Chart(document.getElementById('revenue构成Chart'), {
      type: 'doughnut',
      data: {
        labels: ['订阅收入', '升级收入', '增值服务'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#5e6ad2', '#00b8cc', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#a0a0b0' } } }
      }
    });
  }, 100);
}

// 16. 账单管理
function renderBillingPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">账单管理</h1>
        <p class="page-subtitle">商家账单和代理商结算</p>
      </div>
    </div>
    
    <div class="tabs mb-4">
      <div class="tab active" onclick="switchBillingTab(this, 'merchant')">商家账单</div>
      <div class="tab" onclick="switchBillingTab(this, 'agent')">代理商结算</div>
    </div>
    
    <div id="merchantBilling">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">商家账单</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>商家名称</th>
              <th>账单金额</th>
              <th>版本</th>
              <th>账期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${App.data.merchants.slice(0, 8).map(m => `
              <tr>
                <td class="font-medium">${m.name}</td>
                <td>${Utils.formatMoney(m.version === '旗舰版' ? 5980 : m.version === '专业版' ? 980 : 0)}</td>
                <td><span class="badge badge-${Utils.getVersionClass(m.version)}">${m.version}</span></td>
                <td>2024-12</td>
                <td><span class="badge badge-${Utils.getStatusClass(m.status)}">${m.status === 'active' ? '已支付' : '待支付'}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div id="agentBilling" class="hidden">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">代理商结算</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>代理商</th>
              <th>应结金额</th>
              <th>实结金额</th>
              <th>状态</th>
              <th>结算时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${App.data.settlementRecords.map(s => `
              <tr>
                <td class="font-medium">${s.agent}</td>
                <td>${Utils.formatMoney(s.payable)}</td>
                <td>${Utils.formatMoney(s.actual)}</td>
                <td><span class="badge badge-${Utils.getStatusClass(s.status)}">${Utils.getStatusLabel(s.status)}</span></td>
                <td>${s.time || '-'}</td>
                <td>
                  <button class="btn btn-ghost btn-sm">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function switchBillingTab(tab, type) {
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById('merchantBilling').classList.toggle('hidden', type !== 'merchant');
  document.getElementById('agentBilling').classList.toggle('hidden', type !== 'agent');
}

// 17. 退款处理
function renderRefundPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">退款处理</h1>
        <p class="page-subtitle">处理商家退款申请</p>
      </div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="clock"></i></div>
        <div class="stat-content">
          <div class="stat-label">待处理</div>
          <div class="stat-value">${App.data.refunds.filter(r => r.status === 'pending').length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
        <div class="stat-content">
          <div class="stat-label">本月已退款</div>
          <div class="stat-value">¥${App.data.refunds.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">退款列表</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>商家名称</th>
            <th>退款金额</th>
            <th>退款原因</th>
            <th>申请时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.refunds.map(r => `
            <tr>
              <td class="font-medium">${r.merchant}</td>
              <td class="text-danger">-${Utils.formatMoney(r.amount)}</td>
              <td>${r.reason}</td>
              <td>${r.time}</td>
              <td><span class="badge badge-${Utils.getStatusClass(r.status)}">${Utils.getStatusLabel(r.status)}</span></td>
              <td>
                ${r.status === 'pending' ? `
                  <button class="btn btn-success btn-sm" onclick="approveRefund(${r.id})">同意</button>
                  <button class="btn btn-danger btn-sm" onclick="rejectRefund(${r.id})">拒绝</button>
                ` : '<button class="btn btn-ghost btn-sm">详情</button>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function approveRefund(id) {
  Toast.success('退款已同意', '退款申请已通过');
}

function rejectRefund(id) {
  Toast.warning('退款已拒绝', '退款申请已驳回');
}

// 18. 发票管理
function renderInvoicePage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">发票管理</h1>
        <p class="page-subtitle">管理商家发票申请</p>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">开票申请</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>商家名称</th>
            <th>发票类型</th>
            <th>金额</th>
            <th>状态</th>
            <th>申请时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${App.data.invoices.map(i => `
            <tr>
              <td class="font-medium">${i.merchant}</td>
              <td><span class="tag">${i.type}</span></td>
              <td>${Utils.formatMoney(i.amount)}</td>
              <td><span class="badge badge-${Utils.getStatusClass(i.status)}">${Utils.getStatusLabel(i.status)}</span></td>
              <td>${i.applyTime}</td>
              <td>
                <button class="btn btn-ghost btn-sm">详情</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
// ============================================
// 页面渲染函数 - 内容运营
// ============================================

// 19. 知识库管理
function renderKnowledgeBasePage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div>
        <h1 class="page-title">行业知识库</h1>
        <p class="page-subtitle">管理商家运营知识文档</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i data-lucide="plus"></i> 新增文档</button>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">文档列表</h3>
      </div>
      <table>
        <thead>
          <tr><th>文档标题</th><th>分类</th><th>状态</th><th>更新时间</th><th>浏览量</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${App.data.knowledgeBase.map(k => `
            <tr>
              <td class="font-medium">${k.title}</td>
              <td><span class="tag">${k.category}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(k.status)}">${Utils.getStatusLabel(k.status)}</span></td>
              <td>${k.updateTime}</td>
              <td>${k.views.toLocaleString()}</td>
              <td>
                <button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button>
                <button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i></button>
                <button class="btn btn-ghost btn-sm"><i data-lucide="trash-2"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 20. AI模板管理
function renderAITemplatesPage(container) {
  const templates = [
    { id: 1, name: '智能客服话术库', type: '对话', uses: 12580, status: 'enabled' },
    { id: 2, name: '节假日营销文案', type: '营销', uses: 8560, status: 'enabled' },
    { id: 3, name: '新品上市海报', type: '海报', uses: 5620, status: 'enabled' },
    { id: 4, name: '会员关怀模板', type: '营销', uses: 4280, status: 'disabled' },
    { id: 5, name: '差评回复话术', type: '对话', uses: 3850, status: 'enabled' },
    { id: 6, name: '618促销海报', type: '海报', uses: 3200, status: 'enabled' }
  ];
  
  container.innerHTML += `
    <div class="page-header">
      <div><h1 class="page-title">AI模板管理</h1><p class="page-subtitle">管理AI对话和营销模板</p></div>
      <div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新增模板</button></div>
    </div>
    
    <div class="tabs mb-4">
      <div class="tab active">对话模板</div>
      <div class="tab">营销模板</div>
      <div class="tab">海报模板</div>
    </div>
    
    <div class="grid-3">
      ${templates.map(t => `
        <div class="card">
          <div class="flex justify-between items-start mb-3">
            <span class="tag">${t.type}</span>
            <label class="switch">
              <input type="checkbox" ${t.status === 'enabled' ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
          <h4 class="font-semibold mb-2">${t.name}</h4>
          <div class="text-sm text-muted">使用次数: ${t.uses.toLocaleString()}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// 21. 公告推送
function renderAnnouncementsPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div><h1 class="page-title">公告推送</h1><p class="page-subtitle">向商家推送平台公告</p></div>
      <div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新建公告</button></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">公告列表</h3></div>
      <table>
        <thead><tr><th>标题</th><th>推送范围</th><th>状态</th><th>创建时间</th><th>浏览量</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.announcements.map(a => `
            <tr>
              <td class="font-medium">${a.title}</td>
              <td><span class="tag">${a.scope === 'all' ? '全部商家' : '付费商家'}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(a.status)}">${Utils.getStatusLabel(a.status)}</span></td>
              <td>${a.createTime}</td>
              <td>${a.views}</td>
              <td>
                <button class="btn btn-ghost btn-sm"><i data-lucide="eye"></i></button>
                <button class="btn btn-ghost btn-sm"><i data-lucide="send"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 22. 运营活动
function renderActivitiesPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div><h1 class="page-title">运营活动</h1><p class="page-subtitle">创建和管理营销活动</p></div>
      <div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 创建活动</button></div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="gift"></i></div><div class="stat-content"><div class="stat-label">进行中</div><div class="stat-value">3</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="users"></i></div><div class="stat-content"><div class="stat-label">参与人数</div><div class="stat-value">1,285</div></div></div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">活动列表</h3></div>
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-semibold">年末大促活动</div><div class="text-sm text-muted">2024-12-01 ~ 2024-12-31 · 参与: 586商家</div></div>
          <div class="flex items-center gap-3"><span class="badge badge-success">进行中</span><button class="btn btn-ghost btn-sm">详情</button></div>
        </div>
        <div class="flex justify-between items-center p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-semibold">新商家入驻礼包</div><div class="text-sm text-muted">2024-11-01 ~ 2024-12-31 · 参与: 128商家</div></div>
          <div class="flex items-center gap-3"><span class="badge badge-success">进行中</span><button class="btn btn-ghost btn-sm">详情</button></div>
        </div>
        <div class="flex justify-between items-center p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-semibold">老客户回馈计划</div><div class="text-sm text-muted">2024-10-15 ~ 2024-11-30 · 参与: 342商家</div></div>
          <div class="flex items-center gap-3"><span class="badge badge-gray">已结束</span><button class="btn btn-ghost btn-sm">详情</button></div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 数据洞察
// ============================================

// 23. 平台总览
function renderOverviewPage(container) {
  container.innerHTML += `
    <div class="page-header">
      <div><h1 class="page-title">平台总览</h1><p class="page-subtitle">平台整体运营数据大屏</p></div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="store"></i></div><div class="stat-content"><div class="stat-label">商家总数</div><div class="stat-value">${App.data.merchants.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="wallet"></i></div><div class="stat-content"><div class="stat-label">本月GMV</div><div class="stat-value">¥${(App.data.merchants.reduce((s,m)=>s+m.gmv,0)/10000).toFixed(0)}万</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="trending-up"></i></div><div class="stat-content"><div class="stat-label">月环比</div><div class="stat-value text-success">+12.5%</div></div></div>
      <div class="stat-card"><div class="stat-icon accent"><i data-lucide="cpu"></i></div><div class="stat-content"><div class="stat-label">AI调用量</div><div class="stat-value">${(App.data.merchants.reduce((s,m)=>s+m.aiUsage,0)).toLocaleString()}</div></div></div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container"><div class="chart-header"><h3 class="chart-title">月度GMV趋势</h3></div><div class="chart-wrapper"><canvas id="overviewGmvChart"></canvas></div></div>
      <div class="chart-container"><div class="chart-header"><h3 class="chart-title">行业分布</h3></div><div class="chart-wrapper"><canvas id="overviewIndustryChart"></canvas></div></div>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('overviewGmvChart'), {
      type: 'line',
      data: { labels: App.data.revenueTrend.map(r=>r.month), datasets: [{ label: 'GMV', data: App.data.revenueTrend.map(r=>r.amount), borderColor: '#5e6ad2', fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
    new Chart(document.getElementById('overviewIndustryChart'), {
      type: 'pie',
      data: { labels: ['餐饮'], datasets: [{ data: [100], backgroundColor: ['#5e6ad2', '#00b8cc', '#10b981'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0' } } } }
    });
  }, 100);
}

// 24. 行业报告
function renderIndustryReportPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">行业报告</h1><p class="page-subtitle">各行业商家数据分析</p></div></div>
    
    <div class="tabs mb-4">
      <div class="tab active">餐饮行业</div>
      <div class="tab">零售行业</div>
      <div class="tab">休娱行业</div>
    </div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-content"><div class="stat-label">商家数</div><div class="stat-value">${App.data.industryReports.catering.merchants}</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">平均GMV</div><div class="stat-value">¥${(App.data.industryReports.catering.avgGmv/10000).toFixed(0)}万</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">平均评分</div><div class="stat-value">${App.data.industryReports.catering.avgRating}</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">AI使用率</div><div class="stat-value">${App.data.industryReports.catering.aiUsageRate}%</div></div></div>
    </div>
    
    <div class="chart-container"><div class="chart-header"><h3 class="chart-title">行业雷达图</h3></div><div class="chart-wrapper" style="height:350px"><canvas id="radarChart"></canvas></div></div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('radarChart'), {
      type: 'radar',
      data: { labels: ['商家数', 'GMV', '评分', 'AI使用率', '续费率'], datasets: [{ label: '餐饮', data: [85, 72, 88, 72, 85], borderColor: '#5e6ad2', backgroundColor: 'rgba(94,106,210,0.2)' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#6b6b7b' } } } }
    });
  }, 100);
}

// 25. AI使用统计
function renderAIStatsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">AI使用统计</h1><p class="page-subtitle">各Agent调用量分析</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="cpu"></i></div><div class="stat-content"><div class="stat-label">总调用量</div><div class="stat-value">${App.data.aiUsage.monthly[11].calls.reduce((a,b)=>a+b,0).toLocaleString()}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="zap"></i></div><div class="stat-content"><div class="stat-label">Token消耗</div><div class="stat-value">${(App.data.aiUsage.tokens[11]/10000).toFixed(0)}亿</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="wallet"></i></div><div class="stat-content"><div class="stat-label">成本</div><div class="stat-value">¥12,580</div></div></div>
    </div>
    
    <div class="chart-container mb-6"><div class="chart-header"><h3 class="chart-title">各Agent调用量</h3></div><div class="chart-wrapper" style="height:350px"><canvas id="aiCallsChart"></canvas></div></div>
    <div class="chart-container"><div class="chart-header"><h3 class="chart-title">Token消耗趋势</h3></div><div class="chart-wrapper"><canvas id="tokenTrendChart"></canvas></div></div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('aiCallsChart'), {
      type: 'bar',
      data: { labels: App.data.aiUsage.agents, datasets: [{ label: '调用量', data: App.data.aiUsage.monthly[11].calls, backgroundColor: ['#5e6ad2', '#00b8cc', '#10b981', '#f59e0b', '#ef4444'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
    new Chart(document.getElementById('tokenTrendChart'), {
      type: 'line',
      data: { labels: App.data.revenueTrend.map(r=>r.month), datasets: [{ label: 'Token', data: App.data.aiUsage.tokens, borderColor: '#00b8cc', fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
  }, 100);
}

// 26. 流失预警
function renderChurnWarningPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">流失预警</h1><p class="page-subtitle">高风险商家预警和干预</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-content"><div class="stat-label">高风险</div><div class="stat-value">${App.data.churnWarning.filter(c=>c.riskLevel==='high').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="alert-circle"></i></div><div class="stat-content"><div class="stat-label">中风险</div><div class="stat-value">${App.data.churnWarning.filter(c=>c.riskLevel==='medium').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">低风险</div><div class="stat-value">${App.data.churnWarning.filter(c=>c.riskLevel==='low').length}</div></div></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">预警列表</h3></div>
      <table>
        <thead><tr><th>商家</th><th>风险等级</th><th>流失概率</th><th>最后活跃</th><th>原因</th><th>建议操作</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.churnWarning.map(c => `
            <tr class="${c.riskLevel==='high'?'text-danger':''}">
              <td class="font-medium">${c.merchant}</td>
              <td><span class="badge badge-${c.riskLevel==='high'?'danger':c.riskLevel==='medium'?'warning':'success'}">${c.riskLevel==='high'?'高':c.riskLevel==='medium'?'中':'低'}</span></td>
              <td>${c.probability}%</td>
              <td>${c.lastActive}</td>
              <td>${c.reason}</td>
              <td>${c.suggestion}</td>
              <td><button class="btn btn-primary btn-sm">干预</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 支付交易
// ============================================

// 31. 支付通道监控
function renderPaymentChannelsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">支付通道监控</h1><p class="page-subtitle">各通道状态和成功率</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">总体成功率</div><div class="stat-value">98.5%</div></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="activity"></i></div><div class="stat-content"><div class="stat-label">今日交易量</div><div class="stat-value">¥195.5万</div></div></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">通道状态</h3></div>
      <table>
        <thead><tr><th>通道</th><th>状态</th><th>成功率</th><th>平均耗时</th><th>今日交易额</th></tr></thead>
        <tbody>
          ${App.data.paymentChannels.map(p => `
            <tr>
              <td class="font-medium">${p.name}</td>
              <td><span class="status-indicator"><span class="status-dot ${p.status==='online'?'online':p.status==='degraded'?'busy':'offline'}"></span><span class="badge badge-${Utils.getStatusClass(p.status)}">${Utils.getStatusLabel(p.status)}</span></span></td>
              <td class="${p.successRate<95?'text-danger':'text-success'}">${p.successRate}%</td>
              <td>${p.avgTime}ms</td>
              <td>¥${(p.todayVolume/10000).toFixed(1)}万</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 32. 交易流水
function renderTransactionsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">交易流水</h1><p class="page-subtitle">全平台交易明细</p></div></div>
    
    <div class="filter-bar mb-4">
      <div class="filter-group"><span class="filter-label">交易类型</span><select class="filter-select"><option value="">全部</option><option value="subscription">订阅</option><option value="upgrade">升级</option><option value="renewal">续费</option></select></div>
      <div class="filter-group"><span class="filter-label">状态</span><select class="filter-select"><option value="">全部</option><option value="success">成功</option><option value="pending">处理中</option><option value="failed">失败</option></select></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">交易记录</h3></div>
      <table>
        <thead><tr><th>流水号</th><th>商家</th><th>金额</th><th>类型</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>
          ${App.data.transactions.slice(0, 15).map(t => `
            <tr>
              <td class="font-mono text-sm">${t.id}</td>
              <td>${t.merchant}</td>
              <td class="${t.status==='success'?'text-success':'text-muted'}">¥${t.amount}</td>
              <td><span class="tag">${t.type}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              <td>${t.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 33. 费率配置
function renderFeeConfigPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">费率配置</h1><p class="page-subtitle">配置各类型交易费率</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="save"></i> 保存</button></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">按行业费率</h3></div>
      <table>
        <thead><tr><th>行业</th><th>费率</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>餐饮</td><td>0.6%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>零售</td><td>0.5%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>休娱</td><td>0.7%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">按版本费率</h3></div>
      <table>
        <thead><tr><th>版本</th><th>平台抽成</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td><span class="badge badge-gray">免费版</span></td><td>0%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td><span class="badge badge-accent">专业版</span></td><td>15%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td><span class="badge badge-primary">旗舰版</span></td><td>10%</td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// 34. 分账管理
function renderSplitPaymentPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">分账管理</h1><p class="page-subtitle">平台与代理商分账规则</p></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">分账规则</h3></div>
      <div class="flex gap-6 p-4" style="background:var(--bg);border-radius:8px">
        <div class="text-center"><div class="text-2xl font-bold text-primary">70%</div><div class="text-sm text-muted">商家所得</div></div>
        <div class="text-center"><div class="text-2xl font-bold text-accent">20%</div><div class="text-sm text-muted">平台所得</div></div>
        <div class="text-center"><div class="text-2xl font-bold text-warning">10%</div><div class="text-sm text-muted">代理商</div></div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">最近分账记录</h3></div>
      <table>
        <thead><tr><th>商家</th><th>交易额</th><th>平台</th><th>代理商</th><th>时间</th></tr></thead>
        <tbody>
          <tr><td>北京湘菜馆</td><td>¥2,680</td><td>¥536</td><td>¥268</td><td>2024-12-01</td></tr>
          <tr><td>深圳火锅店</td><td>¥5,980</td><td>¥598</td><td>¥598</td><td>2024-12-01</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// 35. 对账中心
function renderReconciliationPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">对账中心</h1><p class="page-subtitle">自动对账和差异处理</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">已对账</div><div class="stat-value">1,856</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="alert-circle"></i></div><div class="stat-content"><div class="stat-label">差异</div><div class="stat-value">3</div></div></div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">差异预警</h3></div>
      <table>
        <thead><tr><th>日期</th><th>商家</th><th>订单金额</th><th>实际金额</th><th>差异</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>2024-11-30</td><td>杭州奶茶铺</td><td>¥380</td><td>¥0</td><td class="text-danger">-¥380</td><td><span class="badge badge-warning">待处理</span></td><td><button class="btn btn-primary btn-sm">调账</button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 客户成功
// ============================================

// 36. Onboarding跟踪
function renderOnboardingPage(container) {
  const progress = [
    { step: '注册完成', complete: true, time: '2024-11-01' },
    { step: '资质认证', complete: true, time: '2024-11-02' },
    { step: '基础配置', complete: true, time: '2024-11-03' },
    { step: '首次使用AI', complete: false, time: null },
    { step: '深度使用', complete: false, time: null }
  ];
  
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">Onboarding跟踪</h1><p class="page-subtitle">新商家激活进度追踪</p></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">激活漏斗</h3></div>
      <div class="flex gap-6 p-4">
        <div class="text-center flex-1"><div class="text-3xl font-bold text-success">100%</div><div class="text-sm text-muted">注册</div></div>
        <div class="text-center flex-1"><div class="text-3xl font-bold text-success">85%</div><div class="text-sm text-muted">认证</div></div>
        <div class="text-center flex-1"><div class="text-3xl font-bold text-warning">62%</div><div class="text-sm text-muted">配置</div></div>
        <div class="text-center flex-1"><div class="text-3xl font-bold">45%</div><div class="text-sm text-muted">首次使用</div></div>
        <div class="text-center flex-1"><div class="text-3xl font-bold text-muted">28%</div><div class="text-sm text-muted">深度使用</div></div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">新商家激活进度</h3></div>
      ${progress.map((p, i) => `
        <div class="flex items-center gap-4 p-4" style="border-bottom:1px solid var(--border)">
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${p.complete?'bg-success text-white':'bg-gray text-muted'}">
            <i data-lucide="${p.complete?'check':'circle'}"></i>
          </div>
          <div class="flex-1"><div class="font-medium">${p.step}</div><div class="text-sm text-muted">${p.time || '进行中'}</div></div>
        </div>
      `).join('')}
    </div>
  `;
}

// 37. 健康度评分
function renderHealthScorePage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">健康度评分</h1><p class="page-subtitle">商家综合健康度分析</p></div></div>
    
    <div class="chart-container mb-6"><div class="chart-header"><h3 class="chart-title">评分分布</h3></div><div class="chart-wrapper"><canvas id="healthDistChart"></canvas></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">商家健康度</h3></div>
      <table>
        <thead><tr><th>商家</th><th>评分</th><th>使用深度</th><th>数据趋势</th><th>续费意向</th><th>建议</th></tr></thead>
        <tbody>
          <tr><td>北京湘菜馆</td><td><span class="badge badge-success">92</span></td><td>深度使用</td><td>上升</td><td>强烈</td><td>保持</td></tr>
          <tr><td>深圳火锅店</td><td><span class="badge badge-success">88</span></td><td>深度使用</td><td>稳定</td><td>强烈</td><td>保持</td></tr>
          <tr><td>重庆小面</td><td><span class="badge badge-danger">35</span></td><td>未使用</td><td>下降</td><td>弱</td><td>重点关注</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('healthDistChart'), {
      type: 'bar',
      data: { labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], datasets: [{ label: '商家数', data: [2, 5, 8, 25, 35], backgroundColor: '#ef4444,#f59e0b,#6b6b7b,#10b981,#10b981'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }, 100);
}

// 38. 续费管理
function renderRenewalPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">续费管理</h1><p class="page-subtitle">自动续费配置和提醒</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">本月续费率</div><div class="stat-value">89.5%</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-content"><div class="stat-label">待续费</div><div class="stat-value">12</div></div></div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">自动续费配置</h3></div>
      <div class="flex items-center justify-between p-4">
        <div><div class="font-medium">自动扣款</div><div class="text-sm text-muted">到期前7天自动扣款续费</div></div>
        <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
      </div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">续费记录</h3></div>
      <table>
        <thead><tr><th>商家</th><th>版本</th><th>续费金额</th><th>续费时间</th><th>方式</th></tr></thead>
        <tbody>
          <tr><td>成都串串香</td><td>专业版</td><td>¥980</td><td>2024-11-28</td><td>自动</td></tr>
          <tr><td>深圳火锅店</td><td>旗舰版</td><td>¥5980</td><td>2024-11-15</td><td>手动</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// 39. 升降级路径
function renderUpgradeFunnelPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">升降级路径</h1><p class="page-subtitle">版本转化漏斗分析</p></div></div>
    
    <div class="chart-container mb-6"><div class="chart-header"><h3 class="chart-title">版本转化漏斗</h3></div><div class="chart-wrapper" style="height:300px"><canvas id="funnelChart"></canvas></div></div>
    
    <div class="grid-3 mb-6">
      <div class="stat-card"><div class="stat-content"><div class="stat-label">免费版</div><div class="stat-value">${App.data.merchants.filter(m=>m.version==='免费版').length}</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">专业版</div><div class="stat-value">${App.data.merchants.filter(m=>m.version==='专业版').length}</div></div></div>
      <div class="stat-card"><div class="stat-content"><div class="stat-label">旗舰版</div><div class="stat-value">${App.data.merchants.filter(m=>m.version==='旗舰版').length}</div></div></div>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('funnelChart'), {
      type: 'bar',
      data: { labels: ['免费版', '专业版', '旗舰版'], datasets: [{ data: [App.data.merchants.filter(m=>m.version==='免费版').length, App.data.merchants.filter(m=>m.version==='专业版').length, App.data.merchants.filter(m=>m.version==='旗舰版').length], backgroundColor: ['#6b6b7b', '#00b8cc', '#5e6ad2'] }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
    });
  }, 100);
}

// 40. 沉默商家唤醒
function renderWakeUpPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">沉默商家唤醒</h1><p class="page-subtitle">分层触达沉默用户</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-content"><div class="stat-label">7天未登录</div><div class="stat-value">8</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div><div class="stat-content"><div class="stat-label">15天未登录</div><div class="stat-value">5</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-octagon"></i></div><div class="stat-content"><div class="stat-label">30天未登录</div><div class="stat-value">2</div></div></div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">触达策略配置</h3></div>
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-medium">7天未登录 - 推送提醒</div><div class="text-sm text-muted">自动发送App推送</div></div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="flex items-center justify-between p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-medium">15天未登录 - 短信触达</div><div class="text-sm text-muted">发送提醒短信</div></div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="flex items-center justify-between p-4" style="background:var(--bg);border-radius:8px">
          <div><div class="font-medium">30天未登录 - 人工回访</div><div class="text-sm text-muted">分配给客服跟进</div></div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 渠道增长
// ============================================

// 41. 渠道分析
function renderChannelAnalysisPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">渠道分析</h1><p class="page-subtitle">各获客渠道效果分析</p></div></div>
    
    <div class="chart-container mb-6"><div class="chart-header"><h3 class="chart-title">渠道转化对比</h3></div><div class="chart-wrapper"><canvas id="channelChart"></canvas></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">渠道详情</h3></div>
      <table>
        <thead><tr><th>渠道</th><th>线索数</th><th>转化数</th><th>转化率</th><th>成本</th><th>单线索成本</th></tr></thead>
        <tbody>
          ${App.data.channelAnalysis.map(c => `
            <tr>
              <td class="font-medium">${c.channel}</td>
              <td>${c.leads}</td>
              <td>${c.converted}</td>
              <td class="text-success">${c.rate}%</td>
              <td>¥${c.cost.toLocaleString()}</td>
              <td>¥${Math.round(c.cost/c.leads)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('channelChart'), {
      type: 'bar',
      data: { labels: App.data.channelAnalysis.map(c=>c.channel), datasets: [{ label: '转化率', data: App.data.channelAnalysis.map(c=>c.rate), backgroundColor: '#5e6ad2' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6b6b7b' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b6b7b' } } } }
    });
  }, 100);
}

// 42. 邀请裂变
function renderInviteFissionPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">邀请裂变</h1><p class="page-subtitle">老带新邀请活动</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="share-2"></i></div><div class="stat-content"><div class="stat-label">总邀请数</div><div class="stat-value">${App.data.inviteFission.totalInvites}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="user-check"></i></div><div class="stat-content"><div class="stat-label">成功邀请</div><div class="stat-value">${App.data.inviteFission.successfulInvites}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="gift"></i></div><div class="stat-content"><div class="stat-label">已发奖励</div><div class="stat-value">¥${(App.data.inviteFission.rewardGiven/100).toFixed(0)}</div></div></div>
    </div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">邀请规则配置</h3></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">邀请奖励</label><input type="text" class="form-input" value="邀请成功送100元代金券"></div>
        <div class="form-group"><label class="form-label">被邀请奖励</label><input type="text" class="form-input" value="新商家首月5折"></div>
      </div>
    </div>
  `;
}

// 43. 试用管理
function renderTrialPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">试用管理</h1><p class="page-subtitle">试用商家转化追踪</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="users"></i></div><div class="stat-content"><div class="stat-label">试用总数</div><div class="stat-value">${App.data.trialManagement.total}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-content"><div class="stat-label">进行中</div><div class="stat-value">${App.data.trialManagement.active}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">已转化</div><div class="stat-value">${App.data.trialManagement.converted}</div></div></div>
      <div class="stat-card"><div class="stat-icon accent"><i data-lucide="percent"></i></div><div class="stat-content"><div class="stat-label">转化率</div><div class="stat-value">${App.data.trialManagement.conversionRate}%</div></div></div>
    </div>
  `;
}

// 44. 合作伙伴
function renderPartnersPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">合作伙伴</h1><p class="page-subtitle">第三方合作伙伴管理</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新增合作</button></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">合作伙伴</h3></div>
      <table>
        <thead><tr><th>名称</th><th>类型</th><th>状态</th><th>合作时间</th><th>服务商家数</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.partners.map(p => `
            <tr>
              <td class="font-medium">${p.name}</td>
              <td><span class="tag">${p.type}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(p.status)}">${Utils.getStatusLabel(p.status)}</span></td>
              <td>${p.cooperationTime}</td>
              <td>${p.merchants}</td>
              <td><button class="btn btn-ghost btn-sm">详情</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 客服支持
// ============================================

// 45. 工单系统
function renderTicketsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">工单系统</h1><p class="page-subtitle">商家工单处理</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="clock"></i></div><div class="stat-content"><div class="stat-label">待处理</div><div class="stat-value">${App.data.tickets.filter(t=>t.status==='open'||t.status==='pending').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="check-circle"></i></div><div class="stat-content"><div class="stat-label">已解决</div><div class="stat-value">${App.data.tickets.filter(t=>t.status==='resolved').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="alert-circle"></i></div><div class="stat-content"><div class="stat-label">紧急</div><div class="stat-value">${App.data.tickets.filter(t=>t.priority==='high'&&t.status==='open').length}</div></div></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">工单列表</h3></div>
      <table>
        <thead><tr><th>工单号</th><th>商家</th><th>类型</th><th>标题</th><th>优先级</th><th>状态</th><th>处理人</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.tickets.map(t => `
            <tr class="${t.priority==='high'?'text-danger':''}">
              <td class="font-mono text-sm">${t.id}</td>
              <td>${t.merchant}</td>
              <td><span class="tag">${t.type}</span></td>
              <td>${t.title}</td>
              <td><span class="badge badge-${t.priority==='high'?'danger':t.priority==='medium'?'warning':'gray'}">${t.priority==='high'?'高':t.priority==='medium'?'中':'低'}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(t.status)}">${Utils.getStatusLabel(t.status)}</span></td>
              <td>${t.assignee}</td>
              <td><button class="btn btn-ghost btn-sm">处理</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 46. FAQ管理
function renderFAQPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">FAQ管理</h1><p class="page-subtitle">常见问题自动回复</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新增</button></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">FAQ列表</h3></div>
      <table>
        <thead><tr><th>分类</th><th>问题</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.faq.map(f => `
            <tr>
              <td><span class="tag">${f.category}</span></td>
              <td>${f.question}</td>
              <td><span class="badge badge-${Utils.getStatusClass(f.status)}">${Utils.getStatusLabel(f.status)}</span></td>
              <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 47. 满意度调研
function renderSatisfactionPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">满意度调研</h1><p class="page-subtitle">NPS评分追踪</p></div></div>
    
    <div class="stats-grid mb-6">
      <div class="stat-card"><div class="stat-icon success"><i data-lucide="smile"></i></div><div class="stat-content"><div class="stat-label">推荐者</div><div class="stat-value">${App.data.npsData.promoters}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i data-lucide="meh"></i></div><div class="stat-content"><div class="stat-label">被动者</div><div class="stat-value">${App.data.npsData.passives}</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i data-lucide="frown"></i></div><div class="stat-content"><div class="stat-label">贬损者</div><div class="stat-value">${App.data.npsData.detractors}</div></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i data-lucide="star"></i></div><div class="stat-content"><div class="stat-label">NPS评分</div><div class="stat-value">${App.data.npsData.score}</div></div></div>
    </div>
    
    <div class="chart-container"><div class="chart-header"><h3 class="chart-title">NPS分布</h3></div><div class="chart-wrapper"><canvas id="npsChart"></canvas></div></div>
  `;
  
  setTimeout(() => {
    new Chart(document.getElementById('npsChart'), {
      type: 'doughnut',
      data: { labels: ['推荐者', '被动者', '贬损者'], datasets: [{ data: [App.data.npsData.promoters, App.data.npsData.passives, App.data.npsData.detractors], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0' } } } }
    });
  }, 100);
}

// ============================================
// 页面渲染函数 - 产品迭代
// ============================================

// 48. 功能开关
function renderFeatureFlagsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">功能开关</h1><p class="page-subtitle">灰度发布控制</p></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">功能列表</h3></div>
      <table>
        <thead><tr><th>功能名称</th><th>状态</th><th>范围</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.featureFlags.map(f => `
            <tr>
              <td class="font-medium">${f.name}</td>
              <td><span class="badge badge-${Utils.getStatusClass(f.status)}">${Utils.getStatusLabel(f.status)}</span></td>
              <td><span class="tag">${f.scope}</span></td>
              <td>${f.updateTime}</td>
              <td>
                <label class="switch"><input type="checkbox" ${f.status==='enabled'||f.status==='beta'?'checked':''}><span class="switch-slider"></span></label>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 49. AB测试
function renderABTestPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">AB测试</h1><p class="page-subtitle">实验管理</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新建实验</button></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">实验列表</h3></div>
      <table>
        <thead><tr><th>实验名称</th><th>流量分配</th><th>状态</th><th>转化率对比</th><th>结论</th></tr></thead>
        <tbody>
          <tr><td>新注册流程优化</td><td>A 50% / B 50%</td><td><span class="badge badge-success">运行中</span></td><td>A: 12.5% vs B: 15.8%</td><td>B方案领先</td></tr>
          <tr><td>定价页面改版</td><td>A 30% / B 70%</td><td><span class="badge badge-gray">已结束</span></td><td>A: 8.2% vs B: 9.5%</td><td>B方案胜出</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// 50. 需求池
function renderRequirementsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">需求池</h1><p class="page-subtitle">商家需求收集和优先级</p></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">需求列表</h3></div>
      <table>
        <thead><tr><th>需求</th><th>提出商家</th><th>投票数</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.requirements.map(r => `
            <tr>
              <td class="font-medium">${r.title}</td>
              <td>${r.merchant}</td>
              <td><span class="badge badge-warning">${r.votes}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(r.status)}">${Utils.getStatusLabel(r.status)}</span></td>
              <td><button class="btn btn-ghost btn-sm"><i data-lucide="thumbs-up"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 51. 版本管理
function renderVersionManagementPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">版本管理</h1><p class="page-subtitle">系统版本和变更日志</p></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">版本列表</h3></div>
      <table>
        <thead><tr><th>版本号</th><th>状态</th><th>发布时间</th><th>变更说明</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.versions.map(v => `
            <tr>
              <td><span class="badge badge-primary">${v.version}</span></td>
              <td><span class="badge badge-${Utils.getStatusClass(v.status)}">${Utils.getStatusLabel(v.status)}</span></td>
              <td>${v.releaseTime}</td>
              <td class="text-muted">${v.changes}</td>
              <td><button class="btn btn-ghost btn-sm">${v.status==='released'?'回滚':'查看'}</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 安全合规
// ============================================

// 52. 登录安全
function renderLoginSecurityPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">登录安全</h1><p class="page-subtitle">账户安全监控</p></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">安全策略</h3></div>
      <div class="flex items-center justify-between p-4"><div><div class="font-medium">异地登录提醒</div><div class="text-sm text-muted">检测到异地登录时发送通知</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>
      <div class="flex items-center justify-between p-4"><div><div class="font-medium">强制修改密码</div><div class="text-sm text-muted">90天未修改密码需重置</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">登录日志</h3></div>
      <table>
        <thead><tr><th>用户</th><th>类型</th><th>地点</th><th>设备</th><th>时间</th><th>状态</th></tr></thead>
        <tbody>
          ${App.data.loginLogs.map(l => `
            <tr class="${l.status==='warning'?'text-warning':l.status==='failed'?'text-danger':''}">
              <td>${l.user}</td>
              <td>${l.type}</td>
              <td>${l.location}</td>
              <td class="text-muted">${l.device}</td>
              <td>${l.time}</td>
              <td><span class="badge badge-${Utils.getStatusClass(l.status)}">${Utils.getStatusLabel(l.status)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 53. 数据脱敏
function renderDataMaskingPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">数据脱敏</h1><p class="page-subtitle">敏感数据保护配置</p></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">脱敏规则</h3></div>
      <table>
        <thead><tr><th>数据类型</th><th>规则</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr><td>手机号</td><td>138****8001</td><td><span class="badge badge-success">已启用</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>身份证号</td><td>310***********1234</td><td><span class="badge badge-success">已启用</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>银行卡号</td><td>**** **** **** 1234</td><td><span class="badge badge-success">已启用</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
          <tr><td>商家金额</td><td>不脱敏</td><td><span class="badge badge-gray">已禁用</span></td><td><button class="btn btn-ghost btn-sm"><i data-lucide="edit"></i></button></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// 54. 合规审计
function renderCompliancePage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">合规审计</h1><p class="page-subtitle">支付和操作审计</p></div><div class="page-actions"><button class="btn btn-secondary"><i data-lucide="download"></i> 导出</button></div></div>
    
    <div class="card">
      <div class="card-header"><h3 class="card-title">审计日志</h3></div>
      <table>
        <thead><tr><th>时间</th><th>操作人</th><th>类型</th><th>对象</th><th>操作</th><th>IP</th></tr></thead>
        <tbody>
          ${App.data.operationLogs.map(l => `
            <tr>
              <td>${l.time}</td>
              <td>${l.operator}</td>
              <td><span class="tag">${l.type}</span></td>
              <td>${l.object}</td>
              <td>${l.action}</td>
              <td class="text-muted">${l.ip}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// 页面渲染函数 - 系统设置
// ============================================

// 角色权限
function renderRolesPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">角色权限</h1><p class="page-subtitle">管理员角色配置</p></div><div class="page-actions"><button class="btn btn-primary"><i data-lucide="plus"></i> 新增角色</button></div></div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">角色列表</h3></div>
      <table>
        <thead><tr><th>角色名称</th><th>权限数</th><th>用户数</th><th>操作</th></tr></thead>
        <tbody>
          ${App.data.roles.map(r => `
            <tr>
              <td class="font-medium">${r.name}</td>
              <td>${r.permissions.length === 1 && r.permissions[0] === 'all' ? '全部' : r.permissions.length}</td>
              <td>${r.users}</td>
              <td><button class="btn btn-ghost btn-sm"><i data-lucide="edit-2"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 操作日志
function renderOperationLogsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">操作日志</h1><p class="page-subtitle">管理员操作记录</p></div><div class="page-actions"><button class="btn btn-secondary"><i data-lucide="download"></i> 导出</button></div></div>
    
    <div class="filter-bar mb-4">
      <div class="filter-group"><span class="filter-label">操作类型</span><select class="filter-select"><option value="">全部</option><option>商家管理</option><option>内容发布</option><option>账单处理</option></select></div>
      <div class="filter-group"><span class="filter-label">时间范围</span><select class="filter-select"><option value="">全部</option><option>今天</option><option>近7天</option><option>近30天</option></select></div>
    </div>
    
    <div class="table-container">
      <div class="table-header"><h3 class="table-title">日志列表</h3></div>
      <table>
        <thead><tr><th>操作人</th><th>类型</th><th>对象</th><th>操作</th><th>时间</th><th>IP</th></tr></thead>
        <tbody>
          ${App.data.operationLogs.map(l => `
            <tr>
              <td>${l.operator}</td>
              <td><span class="tag">${l.type}</span></td>
              <td>${l.object}</td>
              <td>${l.action}</td>
              <td>${l.time}</td>
              <td class="text-muted">${l.ip}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 定价配置
function renderPricingPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">定价配置</h1><p class="page-subtitle">版本价格管理</p></div></div>
    
    <div class="grid-3">
      ${App.data.pricing.map(p => `
        <div class="price-card ${p.version === '旗舰版' ? 'featured' : ''}">
          ${p.version === '旗舰版' ? '<span class="price-badge">推荐</span>' : ''}
          <h3 class="font-bold text-xl mb-2">${p.version}</h3>
          <div class="price-amount">¥${p.price.toLocaleString()}</div>
          <div class="text-muted text-sm">${p.originalPrice > 0 ? '原价 ¥' + p.originalPrice.toLocaleString() : ''} / ${p.period}</div>
          <ul class="price-features">
            ${p.features.map(f => `<li><i data-lucide="check"></i> ${f}</li>`).join('')}
          </ul>
          <button class="btn ${p.version === '旗舰版' ? 'btn-primary' : 'btn-secondary'} w-full">编辑</button>
        </div>
      `).join('')}
    </div>
  `;
}

// 消息通知
function renderNotificationsPage(container) {
  container.innerHTML += `
    <div class="page-header"><div><h1 class="page-title">消息通知</h1><p class="page-subtitle">通知渠道配置</p></div></div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">企业微信Webhook</h3></div>
      <div class="form-group"><label class="form-label">Webhook地址</label><input type="text" class="form-input" value="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"></div>
      <button class="btn btn-primary">保存</button>
    </div>
    
    <div class="card mb-6">
      <div class="card-header"><h3 class="card-title">通知开关</h3></div>
      <div class="flex items-center justify-between p-4"><div><div class="font-medium">邮件通知</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>
      <div class="flex items-center justify-between p-4"><div><div class="font-medium">短信通知</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>
      <div class="flex items-center justify-between p-4"><div><div class="font-medium">站内信通知</div></div><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div>
    </div>
  `;
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Lucide图标
  lucide.createIcons();
  
  // 渲染侧边栏
  renderSidebar();
  
  // 绑定侧边栏折叠
  document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    App.sidebarCollapsed = sidebar.classList.contains('collapsed');
  });
  
  // 移动端菜单
  document.getElementById('mobileMenuToggle')?.addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });
  
  // 加载默认页面
  navigateTo('overview');
  
  console.log('店赢OS管理后台初始化完成');
});
