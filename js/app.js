/**
 * 店赢OS - 交互逻辑 v11 (重构版)
 * 将4个DCL闭包合并为1个，解决闭包作用域问题
 */

// ============================================
// 全局图表实例（用于页面切换时销毁旧图表）
// ============================================
let overviewChart = null;
let healthRadarChart = null;
let reportTrendChart = null;
let locationFlowChart = null;
let alertTypeChart = null;
let inspectionTrendChart = null;
let datalabCompareChart = null;
let compRadarChart = null;
let dsScreenRadarChart = null;
let marketShareChart = null;
let forecastChart = null;
let screenRevenueChart = null;
let badReviewPieChart = null;
let badReviewTrendChart = null;
let memberGenderChart = null;
let memberRFMChart = null;
let aiDonutChart = null;
let chinaMapChart = null;
let sentimentTrendCharts = {};
const sparklineData = {
  sparkRevenue: [8, 9, 7.5, 10, 11, 12, 12.8],
  sparkOrders: [120, 135, 128, 145, 156, 168, 180],
  sparkRating: [4.5, 4.6, 4.5, 4.7, 4.7, 4.8, 4.8],
  sparkAI: [35, 38, 40, 42, 45, 47, 47],
  sparkRepurchase: [25, 27, 28, 29, 30, 31, 32],
  sparkAOV: [155, 158, 160, 162, 165, 167, 168],
  sparkBadReview: [3, 2, 3, 2, 2, 1, 1],
  sparkPlatforms: [8, 8, 8, 8, 8, 8, 8]
};

// 8个门店数据
const storeData = {
  'beijing-flagship': { name: '老码头火锅 - 北京旗舰店', shortName: '老码头火锅', type: '旗舰', monthlyRevenue: 28.6, monthlyOrders: 1247, rating: 4.9, repurchaseRate: 38, aov: 168, aiProcessed: 180 },
  'shanghai-xuhui': { name: '老码头火锅 - 上海徐汇店', shortName: '老码头火锅', type: '直营', monthlyRevenue: 22.4, monthlyOrders: 986, rating: 4.8, repurchaseRate: 35, aov: 158, aiProcessed: 120 },
  'guangzhou-tianhe': { name: '老码头火锅 - 广州天河店', shortName: '老码头火锅', type: '直营', monthlyRevenue: 20.8, monthlyOrders: 912, rating: 4.8, repurchaseRate: 32, aov: 148, aiProcessed: 110 },
  'shenzhen-nanshan': { name: '老码头火锅 - 深圳南山店', shortName: '老码头火锅', type: '加盟', monthlyRevenue: 18.2, monthlyOrders: 824, rating: 4.7, repurchaseRate: 30, aov: 138, aiProcessed: 95 },
  'chengdu-jinjiang': { name: '老码头火锅 - 成都锦江店', shortName: '老码头火锅', type: '加盟', monthlyRevenue: 16.5, monthlyOrders: 756, rating: 4.7, repurchaseRate: 28, aov: 128, aiProcessed: 88 },
  'hangzhou-xihu': { name: '老码头火锅 - 杭州西湖店', shortName: '老码头火锅', type: '加盟', monthlyRevenue: 15.8, monthlyOrders: 698, rating: 4.6, repurchaseRate: 27, aov: 138, aiProcessed: 82 },
  'wuhan-jianghan': { name: '老码头火锅 - 武汉江汉店', shortName: '老码头火锅', type: '直营', monthlyRevenue: 14.2, monthlyOrders: 645, rating: 4.6, repurchaseRate: 28, aov: 138, aiProcessed: 80 },
  'nanjing-gulou': { name: '老码头火锅 - 南京鼓楼店', shortName: '老码头火锅', type: '加盟', monthlyRevenue: 12.6, monthlyOrders: 578, rating: 4.5, repurchaseRate: 25, aov: 128, aiProcessed: 65 }
};

let currentStoreId = 'beijing-flagship';
let realtimeInterval = null;
let lastUpdateTime = Date.now();
let selectedIndex = 0;
let currentResults = [];
let isRecording = false;
let isPlaying = false;
let mediaRecorder = null;
let audioChunks = [];

// 确保canvas有正确的尺寸
function ensureCanvasSize(canvas) {
  if (!canvas) return canvas;
  if (canvas.width === 0 || canvas.height === 0) {
    const parent = canvas.parentElement;
    let w = 0, h = 0;
    if (parent) { w = parent.offsetWidth; h = parent.offsetHeight; }
    if (w === 0 || h === 0) {
      let el = parent;
      while (el && (w === 0 || h === 0)) {
        if (el.offsetWidth > 0) w = el.offsetWidth;
        if (el.offsetHeight > 0) h = el.offsetHeight;
        el = el.parentElement;
      }
    }
    if (w === 0 || h === 0) {
      const computed = window.getComputedStyle(canvas);
      const matchW = computed.width.match(/(\d+)px/);
      const matchH = computed.height.match(/(\d+)px/);
      if (matchW) w = parseInt(matchW[1]);
      if (matchH) h = parseInt(matchH[1]);
    }
    w = w || 300; h = h || 150;
    canvas.width = w; canvas.height = h;
  }
  return canvas;
}

// ============================================
// Toast提示函数
// ============================================
function showToast(message, duration) {
  if (!duration) duration = 2000;
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:toastFadeIn 0.3s ease;';
  toast.textContent = message;
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = '@keyframes toastFadeIn{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes toastFadeOut{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(-20px)}}';
    document.head.appendChild(style);
  }
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'toastFadeOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ============================================
// 数字动画函数
// ============================================
function animateNumber(element, target, isDecimal = false, duration = 600) {
  if (!element) return;
  const start = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * easeProgress;
    element.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================
// 绘制Sparkline
// ============================================
function drawSparkline(canvasId, data, color = '#7C3AED') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, color + '40');
  gradient.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(0, height);
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const lastX = (data.length - 1) * stepX;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ============================================
// 主题切换
// ============================================
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcons();
}

function updateThemeIcons() {
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelectorAll('.moon-icon').forEach(el => el.classList.toggle('hidden', isDark));
  document.querySelectorAll('.sun-icon').forEach(el => el.classList.toggle('hidden', !isDark));
}

// ============================================
// 页面名称映射
// ============================================
const pageNames = {
  overview: '运营概览', chat: 'AI对话', data: '数据报表', platform: '平台管理',
  aipay: 'AI付', knowledge: '知识库', logs: '决策日志', marketing: '营销工具',
  security: '权限管理', ticket: '工单系统', inventory: '库存预警', competitor: '竞品监控',
  health: '门店健康', calendar: '运营日历', report: '报表中心', workflow: '工作流',
  roi: 'ROI计算', creation: 'AI内容创作', twin: '门店数字孪生', location: '智能选址分析',
  journey: '顾客旅程地图', safety: '食品安全监控', employee: '员工绩效', supply: '供应链管理',
  member: '会员运营', sentiment: '舆情监控', pricing: '智能定价', changelog: '更新日志',
  alert: '智能预警', inspection: '门店巡检', datalab: '数据实验室', aidaily: 'AI洞察日报',
  export: '数据导出'
};

// ============================================
// 页面切换核心函数 (唯一版本)
// ============================================
function switchPage(page) {
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item[data-page]');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-page]');
  const demoSections = document.querySelectorAll('.demo-section');
  const breadcrumbText = document.getElementById('breadcrumbText');

  sidebarNavItems.forEach(item => item.classList.toggle('active', item.dataset.page === page));
  mobileNavItems.forEach(item => item.classList.toggle('active', item.dataset.page === page));
  demoSections.forEach(section => section.classList.toggle('active', section.id === 'section' + page.charAt(0).toUpperCase() + page.slice(1)));
  if (breadcrumbText) breadcrumbText.textContent = pageNames[page] || '运营概览';

  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initPageCharts(page);
    lucide.createIcons();
    // 初始化页面特定功能
    initPageFeatures(page);
    initMissingButtonHandlers();
  }, 50);
}

window.switchPage = switchPage;

// ============================================
// 根据页面初始化图表
// ============================================
function initPageCharts(page) {
  try {
    switch(page) {
      case 'inventory': initInventoryCharts(); break;
      case 'competitor': initCompetitorCharts(); break;
      case 'health': initHealthRadarChart(); break;
      case 'report': initReportTrendChart(); break;
      case 'supply': initSupplyCostChart(); break;
      case 'member': initMemberRfmChart(); break;
      case 'sentiment': initSentimentCharts(); initSentimentTrendChart(); break;
      case 'pricing': initElasticityChart(); break;
      case 'alert': initAlertTypeChart(); break;
      case 'inspection': initInspectionTrendChart(); break;
      case 'datalab': initDatalabCompareChart(); break;
      case 'location': initLocationFlowChart(); break;
      case 'aidaily': if (typeof initAidaily === 'function') initAidaily(); break;
      case 'overview': initDemo(); break;
    }
  } catch(e) { console.warn('initPageCharts error for', page, e); }
}

// ============================================
// 初始化页面特定功能
// ============================================
function initPageFeatures(page) {
  try {
    switch(page) {
      case 'overview': initAIInsight(); break;
      case 'chat': initChatEnhancements(); break;
      case 'data': initFlipCards(); break;
      case 'competitor': initStrategyExecute(); break;
      case 'health': initHealthRoadmap(); break;
      case 'export': initExport(); break;
    }
  } catch(e) { console.warn('initPageFeatures error for', page, e); }
}

// ============================================
// 核心UI初始化
// ============================================
function initCoreUI() {
  // Reveal Animation
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  revealElements.forEach(el => revealObserver.observe(el));

  // Navbar Scroll Effect
  const landingNavbar = document.querySelector('.landing-page .navbar');
  let lastScrollY = 0;
  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    if (landingNavbar) landingNavbar.classList.toggle('scrolled', currentScrollY > 20);
    lastScrollY = currentScrollY;
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const demoThemeToggle = document.getElementById('topbarTheme');
  if (localStorage.getItem('theme') === 'dark') updateThemeIcons();
  themeToggle?.addEventListener('click', toggleTheme);
  demoThemeToggle?.addEventListener('click', toggleTheme);

  // Demo Navigation
  const demoTriggers = document.querySelectorAll('[data-demo-trigger]');
  const demoPage = document.getElementById('demoPage');
  const landingPage = document.querySelector('.landing-page');
  const dataScreen = document.getElementById('dataScreen');
  const demoHomeBtn = document.getElementById('demoHomeBtn');
  const closeDataScreen = document.getElementById('closeDataScreen');
  const landingDashboardBtn = document.getElementById('landingDashboardBtn');
  const topbarDashboard = document.getElementById('topbarDashboard');
  const aiFloatBtn = document.getElementById('aiFloatBtn');

  function showDemo() {
    landingPage.classList.add('hidden');
    dataScreen?.classList.add('hidden');
    demoPage.classList.remove('hidden');
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    window.scrollTo(0, 0);
    initDemo();
    lucide.createIcons();
  }

  function showLanding() {
    demoPage.classList.add('hidden');
    landingPage.classList.remove('hidden');
    document.body.classList.remove('dark-mode');
    window.scrollTo(0, 0);
  }

  function showDataScreen() {
    demoPage.classList.add('hidden');
    landingPage.classList.add('hidden');
    dataScreen?.classList.remove('hidden');
    window.scrollTo(0, 0);
    initDataScreenV2();
    lucide.createIcons();
  }

  demoTriggers.forEach(btn => btn.addEventListener('click', showDemo));
  demoHomeBtn?.addEventListener('click', showLanding);
  closeDataScreen?.addEventListener('click', showLanding);
  landingDashboardBtn?.addEventListener('click', showDataScreen);
  topbarDashboard?.addEventListener('click', showDataScreen);
  aiFloatBtn?.addEventListener('click', showDemo);

  // Sidebar Navigation
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item[data-page]');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-page]');
  sidebarNavItems.forEach(item => item.addEventListener('click', () => switchPage(item.dataset.page)));
  mobileNavItems.forEach(item => item.addEventListener('click', () => { if (item.dataset.page !== 'more') switchPage(item.dataset.page); }));

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      faqItems.forEach(other => { if (other !== item) other.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));

  // Mobile Drawer
  const mobileMoreBtn = document.getElementById('mobileMoreBtn');
  const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileDrawerSearch = document.getElementById('mobileDrawerSearch');
  const mobileDrawerItems = document.querySelectorAll('.mobile-drawer-item');
  const mobileDrawerGroups = document.querySelectorAll('.mobile-drawer-group');

  function openDrawer() {
    mobileDrawerOverlay?.classList.add('active');
    mobileDrawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => lucide.createIcons(), 50);
  }

  function closeDrawer() {
    mobileDrawerOverlay?.classList.remove('active');
    mobileDrawer?.classList.remove('active');
    document.body.style.overflow = '';
    if (mobileDrawerSearch) { mobileDrawerSearch.value = ''; filterDrawerItems(''); }
  }

  function filterDrawerItems(query) {
    const q = query.toLowerCase().trim();
    let visibleCount = 0;
    mobileDrawerGroups.forEach(group => {
      if (!group) return;
      const items = group.querySelectorAll('.mobile-drawer-item');
      let groupVisibleCount = 0;
      items.forEach(item => {
        const text = item.querySelector('span')?.textContent.toLowerCase() || '';
        const match = q === '' || text.includes(q);
        item.classList.toggle('hidden', !match);
        if (match) groupVisibleCount++;
      });
      group.classList.toggle('hidden', groupVisibleCount === 0);
      visibleCount += groupVisibleCount;
    });
    let noResultsGroup = document.querySelector('.mobile-drawer-group.no-results');
    if (visibleCount === 0 && q !== '') {
      if (!noResultsGroup) {
        noResultsGroup = document.createElement('div');
        noResultsGroup.className = 'mobile-drawer-group no-results';
        noResultsGroup.innerHTML = '<div class="mobile-drawer-group-title">搜索结果</div><div style="text-align:center;padding:20px;color:var(--text-muted);">未找到匹配的功能</div>';
        document.getElementById('mobileDrawerBody')?.appendChild(noResultsGroup);
      }
      noResultsGroup.classList.remove('hidden');
    } else if (noResultsGroup) { noResultsGroup.classList.add('hidden'); }
  }

  mobileMoreBtn?.addEventListener('click', openDrawer);
  mobileDrawerOverlay?.addEventListener('click', closeDrawer);
  mobileDrawerClose?.addEventListener('click', closeDrawer);
  mobileDrawerSearch?.addEventListener('input', (e) => filterDrawerItems(e.target.value));
  mobileDrawerItems.forEach(item => item.addEventListener('click', () => {
    const page = item.dataset.page;
    if (page) { switchPage(page); closeDrawer(); setTimeout(() => lucide.createIcons(), 50); }
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileDrawer?.classList.contains('active')) closeDrawer(); });
}

// ============================================
// Chat Feature
// ============================================
function initChat() {
  const scenarioTabs = document.querySelectorAll('.scenario-tab');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatVoiceBtn = document.getElementById('chatVoiceBtn');
  const chatTtsBtn = document.getElementById('chatTtsBtn');
  const chatWaveform = document.getElementById('chatWaveform');
  const chatVoiceStatus = document.getElementById('chatVoiceStatus');

  const scenarios = {
    review: { title: '差评处理', messages: [
      { type: 'user', text: '刚收到一条差评，说等位40分钟' },
      { type: 'ai', agent: 'virtual', text: '收到差评预警。正在分析...'},
      { type: 'ai', agent: 'clue', text: '[线索Agent] 近7天等位差评3条，高峰期人手不足是主因。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）高峰期加2个兼职，2）等位送酸梅汤降焦虑。'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] 已自动回复差评。明天兼职排班已同步。'}
    ]},
    pricing: { title: '动态定价', messages: [
      { type: 'user', text: '明天下雨，对生意有影响吗？' },
      { type: 'ai', agent: 'virtual', text: '正在分析天气数据对门店的影响...'},
      { type: 'ai', agent: 'clue', text: '[线索Agent] 雨天气流下降23%，但外卖订单上涨41%。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）外卖满100减20，2）推"雨天热汤套餐"。'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] 已同步至美团/饿了么后台。'}
    ]},
    vip: { title: 'VIP管理', messages: [
      { type: 'user', text: '王女士1个月没来了，怎么回事？' },
      { type: 'ai', agent: 'virtual', text: '正在分析王女士的消费档案...'},
      { type: 'ai', agent: 'clue', text: '[线索Agent] 累计消费¥3,280，流失概率68%。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] 建议发送个性化召回文案："王姐，好久不见！新上了您爱吃的酸菜鱼..."'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] 已发送专属8折券，预计召回率78%。'}
    ]},
    operation: { title: '运营建议', messages: [
      { type: 'user', text: '最近翻台率有点低，怎么办？' },
      { type: 'ai', agent: 'virtual', text: '正在分析近期运营数据...'},
      { type: 'ai', agent: 'clue', text: '[线索Agent] 当前翻台率2.8次/天（目标4次）。闲置时段14:00-17:00空桌率47%。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）午市推商务套餐，2）晚市18:30前结账9折，3）下午茶开放茶点。'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] 预计整体提升翻台率至3.6次/天，月增收¥2,400。'}
    ]},
    knowledge: { title: '跨店迁移', messages: [
      { type: 'user', text: '火锅店的促销方案能用到烧烤店吗？' },
      { type: 'ai', agent: 'virtual', text: '正在调用运营Agent分析...'},
      { type: 'ai', agent: 'clue', text: '[运营Agent] "满100减20"核心驱动力是"高客单价+社交场景"，烧烤店迁移可行度82%。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] 需调整：优惠门槛从100降至80，增加"烤串组合"替代"锅底+配菜"。'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] 方案已推送至烧烤店后台。'}
    ]},
    twin: { title: '数字孪生', messages: [
      { type: 'user', text: '下周想推午市套餐，定多少合适？' },
      { type: 'ai', agent: 'virtual', text: '正在调用方案Agent进行数字孪生模拟...'},
      { type: 'ai', agent: 'clue', text: '[方案Agent] 模拟3种方案：¥38/¥48/¥58。¥48综合评分最高。'},
      { type: 'ai', agent: 'solution', text: '[方案Agent] ¥48方案预计午市增收¥3,200/天。建议加"免费续饭"标签提升价值感。'},
      { type: 'ai', agent: 'delivery', text: '[交付Agent] ¥48午市套餐已创建草稿，3天后自动复盘。'}
    ]}
  };

  function addMessage(type, text, agent = null) {
    if (!chatMessages) return;
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    let agentTag = '';
    if (type === 'ai' && agent && agent !== 'virtual') {
      const agentNames = { clue: '线索Agent', solution: '方案Agent', delivery: '交付Agent' };
      agentTag = `<div class="agent-tag ${agent}">${agentNames[agent] || agent}</div>`;
    }
    const div = document.createElement('div');
    div.className = `chat-message ${type}`;
    div.innerHTML = `<div class="chat-message-bubble">${agentTag}${text.replace(/\n/g, '<br>')}</div><div class="chat-message-time">${time}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    if (!chatMessages) return;
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() { document.getElementById('typingIndicator')?.remove(); }

  function loadScenario(scenario) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    scenarioTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.scenario === scenario));
    const data = scenarios[scenario];
    if (!data) return;
    let delay = 500;
    data.messages.forEach((msg, index) => {
      setTimeout(() => {
        if (msg.type === 'user') addMessage(msg.type, msg.text);
        else {
          showTyping();
          setTimeout(() => { hideTyping(); addMessage(msg.type, msg.text, msg.agent); }, 800 + Math.random() * 400);
        }
      }, delay);
      delay += msg.type === 'user' ? 600 : 1500;
    });
  }

  scenarioTabs.forEach(tab => tab.addEventListener('click', () => loadScenario(tab.dataset.scenario)));

  function handleChatInput() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage('user', text);
    chatInput.value = '';
    showTyping();
    setTimeout(() => {
      hideTyping();
      let matched = 'review';
      const lower = text.toLowerCase();
      if (lower.includes('价') || lower.includes('下雨') || lower.includes('天气')) matched = 'pricing';
      else if (lower.includes('vip') || lower.includes('会员') || lower.includes('没来')) matched = 'vip';
      else if (lower.includes('翻台') || lower.includes('运营') || lower.includes('客流')) matched = 'operation';
      else if (lower.includes('跨店') || lower.includes('迁移') || lower.includes('复制')) matched = 'knowledge';
      else if (lower.includes('孪生') || lower.includes('模拟') || lower.includes('套餐')) matched = 'twin';
      addMessage('ai', '好的，正在为您分析这个问题...', 'virtual');
      scenarioTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.scenario === matched));
    }, 1000);
  }

  chatSendBtn?.addEventListener('click', handleChatInput);
  chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatInput(); });

  // Voice Recording
  function updateVoiceStatus(status) {
    if (!chatVoiceStatus) return;
    const dot = chatVoiceStatus.querySelector('.voice-status-dot');
    const text = chatVoiceStatus.querySelector('.voice-status-text');
    const statusMap = { ready: { color: 'var(--success)', text: '就绪' }, recording: { color: 'var(--danger)', text: '录音中' }, recognizing: { color: 'var(--warning)', text: '识别中' }, playing: { color: 'var(--accent)', text: '播放中' } };
    const s = statusMap[status] || statusMap.ready;
    if (dot) dot.style.background = s.color;
    if (text) text.textContent = s.text;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        updateVoiceStatus('recognizing');
        setTimeout(() => {
          if (chatInput) chatInput.value = '今天门店的营收情况怎么样？';
          updateVoiceStatus('ready');
          chatWaveform?.classList.add('hidden');
          chatVoiceBtn?.classList.remove('recording');
        }, 1500);
      };
      mediaRecorder.start();
      isRecording = true;
      updateVoiceStatus('recording');
      chatWaveform?.classList.remove('hidden');
      chatVoiceBtn?.classList.add('recording');
    } catch (err) {
      console.log('语音功能需要麦克风权限');
      isRecording = true;
      updateVoiceStatus('recording');
      chatWaveform?.classList.remove('hidden');
      chatVoiceBtn?.classList.add('recording');
      setTimeout(() => { if (isRecording) stopRecording(); }, 3000);
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) mediaRecorder.stop();
    isRecording = false;
  }

  chatVoiceBtn?.addEventListener('click', () => { if (isRecording) stopRecording(); else startRecording(); });

  // TTS
  chatTtsBtn?.addEventListener('click', () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      isPlaying = false;
      chatTtsBtn?.classList.remove('playing');
      updateVoiceStatus('ready');
    } else {
      const text = '今日门店运营良好，营收较昨日提升12%，差评已全部处理完毕，建议重点关注晚餐时段的翻台率优化。';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1;
      utterance.onstart = () => { isPlaying = true; chatTtsBtn?.classList.add('playing'); updateVoiceStatus('playing'); };
      utterance.onend = () => { isPlaying = false; chatTtsBtn?.classList.remove('playing'); updateVoiceStatus('ready'); };
      speechSynthesis.speak(utterance);
    }
  });
}

// ============================================
// Demo Charts
// ============================================
function initDemo() {
  try {
    const ctx = document.getElementById('overviewChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (overviewChart) overviewChart.destroy();
    overviewChart = new Chart(ctx, {
      type: 'line',
      data: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], datasets: [{ data: [16500, 17200, 15800, 18900, 20100, 22500, 19800], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#7C3AED', pointRadius: 4, pointHoverRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94A3B8' } }, y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/1000) + 'k' } } } }
    });
  } catch (err) { console.error('initDemo error:', err); }
}

// ============================================
// Chart Initialization Functions
// ============================================
function initInventoryCharts() {
  try {
    const costCtx = ensureCanvasSize(document.getElementById('costChart'));
    const lossCtx = ensureCanvasSize(document.getElementById('lossChart'));
    const turnoverCtx = ensureCanvasSize(document.getElementById('turnoverChart'));
    if (costCtx && typeof Chart !== 'undefined') {
      new Chart(costCtx, { type: 'line', data: { labels: ['1月', '2月', '3月', '4月', '5月'], datasets: [{ data: [38000, 39500, 40200, 41500, 42800], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
    }
    if (lossCtx && typeof Chart !== 'undefined') {
      new Chart(lossCtx, { type: 'line', data: { labels: ['1月', '2月', '3月', '4月', '5月'], datasets: [{ data: [3.1, 2.9, 2.8, 2.5, 2.3], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
    }
    if (turnoverCtx && typeof Chart !== 'undefined') {
      new Chart(turnoverCtx, { type: 'line', data: { labels: ['1月', '2月', '3月', '4月', '5月'], datasets: [{ data: [5.7, 5.4, 5.1, 4.8, 4.5], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
    }
  } catch (e) { console.error('initInventoryCharts error:', e); }
}

function initHealthRadarChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('healthRadarChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (healthRadarChart) healthRadarChart.destroy();
    healthRadarChart = new Chart(ctx, {
      type: 'radar',
      data: { labels: ['流量健康度', '评分健康度', '营收健康度', '运营健康度', '增长健康度'], datasets: [{ label: '本店', data: [82, 85, 78, 72, 68], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.2)', borderWidth: 2, pointBackgroundColor: '#7C3AED' }, { label: '行业均值', data: [75, 78, 72, 70, 65], borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderWidth: 2, pointBackgroundColor: '#06B6D4' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#E2E8F0' }, pointLabels: { font: { size: 11 }, color: '#64748B' } } } }
    });
  } catch (e) { console.error('initHealthRadarChart error:', e); }
}

function initReportTrendChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('reportTrendChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (reportTrendChart) reportTrendChart.destroy();
    reportTrendChart = new Chart(ctx, {
      type: 'line',
      data: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], datasets: [{ label: '本周', data: [16500, 17200, 15800, 18900, 20100, 22500, 19800], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4 }, { label: '上周', data: [15000, 15800, 16200, 17500, 18500, 21000, 18200], borderColor: '#94A3B8', backgroundColor: 'rgba(148, 163, 184, 0.1)', fill: true, tension: 0.4, borderDash: [5, 5] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/1000) + 'k' } } } }
    });
  } catch (e) { console.error('initReportTrendChart error:', e); }
}

function initSupplyCostChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('supplyCostChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'bar',
      data: { labels: ['1月', '2月', '3月', '4月', '5月'], datasets: [{ label: '肉类', data: [18000, 18500, 19200, 19800, 20100], backgroundColor: '#7C3AED', borderRadius: 4 }, { label: '蔬菜', data: [8500, 8200, 8800, 9200, 9500], backgroundColor: '#10B981', borderRadius: 4 }, { label: '调料', data: [5800, 5600, 5900, 6100, 6200], backgroundColor: '#06B6D4', borderRadius: 4 }, { label: '其他', data: [5200, 4800, 5300, 5400, 7000], backgroundColor: '#F59E0B', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/10000) + '万' } } } }
    });
  } catch (e) { console.error('initSupplyCostChart error:', e); }
}

function initMemberRfmChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('memberRfmPieChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['高价值', '潜力', '新客', '流失'], datasets: [{ data: [35, 28, 22, 15], backgroundColor: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
    });
  } catch (e) { console.error('initMemberRfmChart error:', e); }
}

function initSentimentCharts() {
  try {
    const trendCtx = ensureCanvasSize(document.getElementById('sentimentTrendChart'));
    const sourceCtx = ensureCanvasSize(document.getElementById('sentimentSourceChart'));
    if (trendCtx && typeof Chart !== 'undefined') {
      new Chart(trendCtx, { type: 'line', data: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], datasets: [{ label: '正面', data: [85, 87, 88, 89, 90, 88, 89], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }, { label: '中性', data: [10, 9, 8, 8, 7, 8, 8], borderColor: '#94A3B8', backgroundColor: 'rgba(148, 163, 184, 0.1)', fill: true, tension: 0.4 }, { label: '负面', data: [5, 4, 4, 3, 3, 4, 3], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => v + '%', font: { size: 9 } } } } } });
    }
    if (sourceCtx && typeof Chart !== 'undefined') {
      new Chart(sourceCtx, { type: 'doughnut', data: { labels: ['美团', '大众点评', '抖音', '小红书'], datasets: [{ data: [35, 28, 22, 15], backgroundColor: ['#00B7FF', '#FF6B00', '#FE2C55', '#FF6633'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } } });
    }
  } catch (e) { console.error('initSentimentCharts error:', e); }
}

function initSentimentTrendChart(targetId) {
  try {
    const id = targetId || 'sentimentTrendChart';
    const ctx = ensureCanvasSize(document.getElementById(id));
    if (!ctx || typeof Chart === 'undefined') return;
    if (sentimentTrendCharts[id]) sentimentTrendCharts[id].destroy();
    sentimentTrendCharts[id] = new Chart(ctx, {
      type: 'line',
      data: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], datasets: [{ data: [4.5, 4.5, 4.6, 4.6, 4.7, 4.8, 4.7], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2, pointBackgroundColor: '#7C3AED' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: 4.0, max: 5.0 } } }
    });
  } catch (e) { console.error('initSentimentTrendChart error:', e); }
}

function initElasticityChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('elasticityChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'line',
      data: { labels: ['¥38', '¥48', '¥58', '¥68', '¥78', '¥88'], datasets: [{ label: '销量', data: [120, 95, 72, 52, 38, 28], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4 }, { label: '营收', data: [4560, 4560, 4176, 3536, 2964, 2464], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { font: { size: 10 } }, title: { display: true, text: '销量', font: { size: 10 } } }, y1: { position: 'right', grid: { display: false }, ticks: { callback: v => '¥' + v, font: { size: 10 } }, title: { display: true, text: '营收', font: { size: 10 } } } } }
    });
  } catch (e) { console.error('initElasticityChart error:', e); }
}

function initAlertTypeChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('alertTypeChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (alertTypeChart) alertTypeChart.destroy();
    alertTypeChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['库存不足', '差评预警', '竞品异动', '设备故障', '客流异常', '员工缺勤'], datasets: [{ data: [25, 30, 15, 12, 10, 8], backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#10B981', '#64748B'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } } } } });
  } catch (e) { console.error('initAlertTypeChart error:', e); }
}

function initInspectionTrendChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('inspectionTrendChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (inspectionTrendChart) inspectionTrendChart.destroy();
    inspectionTrendChart = new Chart(ctx, { type: 'line', data: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], datasets: [{ label: '巡检评分', data: [85, 87, 88, 90, 91, 92], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#7C3AED' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#E2E8F0' }, min: 80, max: 100, ticks: { font: { size: 10 } } } } } });
  } catch (e) { console.error('initInspectionTrendChart error:', e); }
}

function initDatalabCompareChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('datalabCompareChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (datalabCompareChart) datalabCompareChart.destroy();
    datalabCompareChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: ['第1周', '第2周', '第3周', '第4周'], datasets: [{ label: '北京旗舰店', data: [48500, 51200, 53800, 56200], backgroundColor: '#7C3AED', borderRadius: 4 }, { label: '上海徐汇店', data: [42800, 44500, 46200, 48100], backgroundColor: '#06B6D4', borderRadius: 4 }, { label: '广州天河店', data: [38900, 40200, 41800, 43500], backgroundColor: '#10B981', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/10000) + '万', font: { size: 10 } } } } }
    });
  } catch (e) { console.error('initDatalabCompareChart error:', e); }
}

function initLocationFlowChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('locationFlowChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (locationFlowChart) locationFlowChart.destroy();
    locationFlowChart = new Chart(ctx, { type: 'line', data: { labels: ['7时', '9时', '11时', '13时', '15时', '17时', '19时', '21时', '23时'], datasets: [{ label: '客流指数', data: [20, 45, 85, 75, 40, 95, 120, 90, 35], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointBackgroundColor: '#7C3AED', pointRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } } }, y: { grid: { color: '#E2E8F0' }, ticks: { display: false }, beginAtZero: true } } } });
  } catch (e) { console.error('initLocationFlowChart error:', e); }
}

function initCompetitorCharts() {
  try {
    initCompetitorRadarChart();
    initMarketShareChart();
    if (document.getElementById('compReview')?.classList.contains('active')) {
      initSentimentTrendChart('compSentimentTrendChart');
    }
  } catch (e) { console.error('initCompetitorCharts error:', e); }
}

function initCompetitorRadarChart() {
  try {
    const radarData = { labels: ['口味', '服务', '环境', '性价比', '品牌力', '创新力'], datasets: [{ label: '本店', data: [78, 75, 82, 88, 65, 85], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.25)', borderWidth: 3, pointBackgroundColor: '#7C3AED', pointRadius: 4 }, { label: '海底捞', data: [82, 95, 88, 60, 92, 75], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 2, pointBackgroundColor: '#F59E0B', pointRadius: 3 }, { label: '小龙坎', data: [85, 78, 72, 80, 70, 72], borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderWidth: 2, pointBackgroundColor: '#06B6D4', pointRadius: 3 }] };
    const radarOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#E2E8F0' }, pointLabels: { font: { size: 11, weight: '500' }, color: '#64748B' } } } };
    const dsCtx = ensureCanvasSize(document.getElementById('compRadarChart'));
    if (dsCtx && typeof Chart !== 'undefined') {
      if (compRadarChart) compRadarChart.destroy();
      compRadarChart = new Chart(dsCtx, { type: 'radar', data: radarData, options: radarOptions });
    }
  } catch (e) { console.error('initCompetitorRadarChart error:', e); }
}

function initMarketShareChart() {
  try {
    const ctx = ensureCanvasSize(document.getElementById('marketShareChart'));
    if (!ctx || typeof Chart === 'undefined') return;
    if (marketShareChart) marketShareChart.destroy();
    marketShareChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['老码头火锅', '海底捞', '小龙坎', '巴奴毛肚', '其他'], datasets: [{ data: [24, 32, 18, 14, 12], backgroundColor: ['#7C3AED', '#F59E0B', '#06B6D4', '#10B981', '#94A3B8'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return context.label + ': ' + context.parsed + '%'; } } } } } });
  } catch (e) { console.error('initMarketShareChart error:', e); }
}

// ============================================
// Tab Switching
// ============================================
function initTabSwitching() {
  try {
    // Marketing Tab
    document.querySelectorAll('.marketing-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.mktTab;
        document.querySelectorAll('.marketing-tab').forEach(t => t.classList.toggle('active', t.dataset.mktTab === targetTab));
        document.querySelectorAll('.marketing-panel').forEach(p => p.classList.toggle('active', p.id === 'mkt' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
        lucide.createIcons();
      });
    });

    // Competitor Tab
    document.querySelectorAll('.competitor-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.compTab;
        document.querySelectorAll('.competitor-tab').forEach(t => t.classList.toggle('active', t.dataset.compTab === targetTab));
        document.querySelectorAll('.competitor-panel').forEach(p => p.classList.toggle('active', p.id === 'comp' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
        lucide.createIcons();
        if (targetTab === 'review') setTimeout(() => initSentimentTrendChart('compSentimentTrendChart'), 100);
      });
    });

    // Workflow Tab
    document.querySelectorAll('.workflow-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetWorkflow = tab.dataset.workflow;
        document.querySelectorAll('.workflow-tab').forEach(t => t.classList.toggle('active', t.dataset.workflow === targetWorkflow));
        document.querySelectorAll('.workflow-panel').forEach(p => p.classList.toggle('active', p.id === 'workflow' + targetWorkflow.charAt(0).toUpperCase() + targetWorkflow.slice(1)));
        lucide.createIcons();
      });
    });

    // Ticket Filter
    document.querySelectorAll('.ticket-filter').forEach(filter => {
      filter.addEventListener('click', () => {
        document.querySelectorAll('.ticket-filter').forEach(f => f.classList.toggle('active', f === filter));
      });
    });

    // Role Card
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.role-card').forEach(c => c.classList.toggle('active', c === card));
      });
    });

    // Calendar Day
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        day.classList.add('selected');
      });
    });
  } catch (e) { console.error('initTabSwitching error:', e); }
}

// ============================================
// v9 Features
// ============================================
function initV9Features() {
  try {
    // Countdown
    function initCountdown() {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      function updateCountdown() {
        const now = new Date();
        const diff = trialEnd - now;
        if (diff <= 0) {
          document.querySelectorAll('.countdown-badge').forEach(el => { el.textContent = '已到期'; el.style.background = '#EF4444'; });
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const countdownText = days > 0 ? days + '天' + hours + '时' : hours + '时' + minutes + '分';
        document.querySelectorAll('.countdown-badge, #heroCountdown').forEach(el => { if (el) el.textContent = '限时体验：剩余 ' + countdownText; });
      }
      updateCountdown();
      setInterval(updateCountdown, 60000);
    }

    // Industry Tabs
    document.querySelectorAll('.industry-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const industry = tab.dataset.industry;
        document.querySelectorAll('.industry-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.industry-content').forEach(content => {
          content.classList.toggle('hidden', content.dataset.industry !== industry);
        });
      });
    });

    // Logo Wall
    const logoTrack = document.getElementById('logoTrack');
    if (logoTrack) { const originalHTML = logoTrack.innerHTML; logoTrack.innerHTML = originalHTML + originalHTML; }

    // Ranking Scroll
    const rankingScroll = document.getElementById('rankingScroll');
    if (rankingScroll) {
      let scrollInterval, isPaused = false;
      scrollInterval = setInterval(() => {
        if (isPaused) return;
        const firstItem = rankingScroll.querySelector('.ranking-item');
        if (firstItem) {
          const itemHeight = firstItem.offsetHeight;
          rankingScroll.style.transition = 'transform 0.5s ease';
          rankingScroll.style.transform = 'translateY(-' + itemHeight + 'px)';
          setTimeout(() => { rankingScroll.appendChild(firstItem); rankingScroll.style.transition = 'none'; rankingScroll.style.transform = 'translateY(0)'; }, 500);
        }
      }, 3000);
      rankingScroll.addEventListener('mouseenter', () => { isPaused = true; });
      rankingScroll.addEventListener('mouseleave', () => { isPaused = false; });
    }

    // Notification Center
    const bellBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    if (bellBtn && notificationDropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!bellBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
          notificationDropdown.classList.add('hidden');
        }
      });
    }

    // Batch Operations
    const batchBtn = document.getElementById('batchActionBtn');
    const batchDropdown = document.getElementById('batchDropdown');
    if (batchBtn && batchDropdown) {
      batchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        batchDropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!batchBtn.contains(e.target) && !batchDropdown.contains(e.target)) {
          batchDropdown.classList.add('hidden');
        }
      });
      document.querySelectorAll('.batch-dropdown-item').forEach(btn => {
        btn.addEventListener('click', () => {
          showToast('已执行批量操作');
          batchDropdown.classList.add('hidden');
        });
      });
    }

    // Keyboard Shortcuts
    function initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const key = e.key.toLowerCase();
        switch(key) {
          case '1': window.switchPage('overview'); break;
          case '2': window.switchPage('chat'); break;
          case '3': window.switchPage('data'); break;
          case '4': window.switchPage('platform'); break;
          case '5': window.switchPage('logs'); break;
          case 'd': if (!e.ctrlKey && !e.metaKey) toggleTheme(); break;
          case 'f': if (!e.ctrlKey && !e.metaKey) document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); break;
          case 'r': if (!e.ctrlKey && !e.metaKey) location.reload(); break;
        }
      });
    }

    initCountdown();
    initKeyboardShortcuts();
  } catch (e) { console.error('initV9Features error:', e); }
}

// ============================================
// Store Selector
// ============================================
function initStoreSelector() {
  try {
    const storeSelector = document.getElementById('storeSelector');
    const storeDropdown = document.getElementById('storeDropdown');
    if (!storeSelector || !storeDropdown) return;
    storeSelector.addEventListener('click', (e) => { e.stopPropagation(); storeSelector.classList.toggle('active'); });
    document.querySelectorAll('.store-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        switchStore(option.dataset.store);
        storeSelector.classList.remove('active');
      });
    });
    document.addEventListener('click', (e) => { if (!storeSelector.contains(e.target)) storeSelector.classList.remove('active'); });
  } catch (e) { console.error('initStoreSelector error:', e); }
}

function switchStore(storeId) {
  try {
    if (!storeData[storeId]) return;
    currentStoreId = storeId;
    const store = storeData[storeId];
    const storeTag = document.getElementById('currentStoreTag');
    if (storeTag) {
      storeTag.textContent = store.type + '店';
      storeTag.className = 'store-tag';
      if (store.type === '旗舰') storeTag.classList.add('tag-flagship');
      else if (store.type === '直营') storeTag.classList.add('tag-direct');
      else storeTag.classList.add('tag-franchise');
    }
    document.querySelectorAll('.store-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.store === storeId));
    const dsStoreSelect = document.getElementById('storeSelect');
    if (dsStoreSelect) dsStoreSelect.value = storeId;
    updateOverviewCards(storeId);
    console.log('切换门店:', store.name);
  } catch (e) { console.error('switchStore error:', e); }
}

function updateOverviewCards(storeId) {
  try {
    const store = storeData[storeId];
    if (!store) return;
    const statCards = document.querySelectorAll('.stat-card-demo');
    if (statCards.length >= 4) {
      const revenueEl = statCards[0].querySelector('.stat-card-demo-value');
      if (revenueEl) { animateNumber(revenueEl, store.monthlyRevenue, true, 600); setTimeout(() => { revenueEl.textContent = '¥' + store.monthlyRevenue.toFixed(1) + '万'; }, 600); }
      const ordersEl = statCards[1].querySelector('.stat-card-demo-value');
      if (ordersEl) { animateNumber(ordersEl, store.monthlyOrders, false, 600); setTimeout(() => { ordersEl.textContent = store.monthlyOrders.toLocaleString(); }, 600); }
      const ratingEl = statCards[2].querySelector('.stat-card-demo-value');
      if (ratingEl) { animateNumber(ratingEl, store.rating, true, 600); setTimeout(() => { ratingEl.textContent = store.rating.toFixed(1); }, 600); }
      const repurchaseEl = statCards[3].querySelector('.stat-card-demo-value');
      if (repurchaseEl) { animateNumber(repurchaseEl, store.repurchaseRate, false, 600); setTimeout(() => { repurchaseEl.textContent = store.repurchaseRate + '%'; }, 600); }
    }
  } catch (e) { console.error('updateOverviewCards error:', e); }
}

function initDataScreenStoreSync() {
  try {
    const dsStoreSelect = document.getElementById('storeSelect');
    if (!dsStoreSelect) return;
    dsStoreSelect.addEventListener('change', () => {
      const storeId = dsStoreSelect.value;
      const storeTag = document.getElementById('currentStoreTag');
      const store = storeData[storeId];
      if (store && storeTag) {
        storeTag.textContent = store.type + '店';
        storeTag.className = 'store-tag';
        if (store.type === '旗舰') storeTag.classList.add('tag-flagship');
        else if (store.type === '直营') storeTag.classList.add('tag-direct');
        else storeTag.classList.add('tag-franchise');
      }
      document.querySelectorAll('.store-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.store === storeId));
    });
  } catch (e) { console.error('initDataScreenStoreSync error:', e); }
}

// ============================================
// Command Palette
// ============================================
function initCommandPalette() {
  try {
    const commandPaletteOverlay = document.getElementById('commandPaletteOverlay');
    const commandPaletteInput = document.getElementById('commandPaletteInput');
    const commandPaletteBody = document.getElementById('commandPaletteBody');
    const commandData = {
      pages: [
        { id: 'overview', title: '运营概览', icon: 'layout-dashboard', desc: '查看门店整体运营数据' },
        { id: 'chat', title: 'AI对话', icon: 'message-square', desc: '与AI虚拟店长对话' },
        { id: 'data', title: '数据报表', icon: 'bar-chart-2', desc: '详细数据分析报表' },
        { id: 'aidaily', title: 'AI洞察日报', icon: 'sparkles', desc: '每日经营分析报告' },
        { id: 'export', title: '数据导出', icon: 'download-cloud', desc: '导出数据报告' },
        { id: 'platform', title: '平台管理', icon: 'layout-grid', desc: '多平台账号管理' },
        { id: 'competitor', title: '竞品监控', icon: 'radar', desc: '竞品数据分析' },
        { id: 'health', title: '门店健康', icon: 'heart-pulse', desc: '门店健康度评估' },
        { id: 'marketing', title: '营销工具', icon: 'ticket', desc: '营销活动管理' },
        { id: 'member', title: '会员运营', icon: 'heart', desc: '会员数据分析' }
      ],
      actions: [
        { id: 'export-report', title: '导出报告', icon: 'download', desc: '导出运营报告PDF' },
        { id: 'switch-store', title: '切换门店', icon: 'store', desc: '切换到其他门店' },
        { id: 'dark-mode', title: '切换深色模式', icon: 'moon', desc: '开启/关闭深色模式' }
      ]
    };

    function renderCommandPalette(filter = '') {
      const filterLower = filter.toLowerCase();
      const filteredPages = commandData.pages.filter(p => p.title.toLowerCase().includes(filterLower) || p.desc.toLowerCase().includes(filterLower));
      const filteredActions = commandData.actions.filter(a => a.title.toLowerCase().includes(filterLower) || a.desc.toLowerCase().includes(filterLower));
      currentResults = [...filteredPages.map(p => ({...p, type: 'page'})), ...filteredActions.map(a => ({...a, type: 'action'}))];
      let html = '';
      if (filteredPages.length > 0) {
        html += '<div class="command-palette-section"><div class="command-palette-section-title">页面</div>';
        filteredPages.forEach((item, index) => {
          html += `<div class="command-palette-item${index === selectedIndex ? ' selected' : ''}" data-index="${index}" data-type="page" data-id="${item.id}">
            <div class="command-palette-item-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
            <div class="command-palette-item-content"><div class="command-palette-item-title">${item.title}</div><div class="command-palette-item-desc">${item.desc}</div></div>
          </div>`;
        });
        html += '</div>';
      }
      if (filteredActions.length > 0) {
        const baseIndex = filteredPages.length;
        html += '<div class="command-palette-section"><div class="command-palette-section-title">操作</div>';
        filteredActions.forEach((item, i) => {
          const index = baseIndex + i;
          html += `<div class="command-palette-item${index === selectedIndex ? ' selected' : ''}" data-index="${index}" data-type="action" data-id="${item.id}">
            <div class="command-palette-item-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
            <div class="command-palette-item-content"><div class="command-palette-item-title">${item.title}</div><div class="command-palette-item-desc">${item.desc}</div></div>
          </div>`;
        });
        html += '</div>';
      }
      if (html === '') html = '<div style="padding:40px;text-align:center;color:var(--text-muted);">未找到匹配结果</div>';
      commandPaletteBody.innerHTML = html;
      lucide.createIcons();
      commandPaletteBody.querySelectorAll('.command-palette-item').forEach(item => {
        item.addEventListener('click', () => executeCommand(item.dataset.type, item.dataset.id));
      });
    }

    function openCommandPalette() {
      commandPaletteOverlay?.classList.remove('hidden');
      commandPaletteInput?.focus();
      renderCommandPalette();
      selectedIndex = 0;
    }

    function closeCommandPalette() {
      commandPaletteOverlay?.classList.add('hidden');
      if (commandPaletteInput) commandPaletteInput.value = '';
    }

    function executeCommand(type, id) {
      closeCommandPalette();
      if (type === 'page') window.switchPage(id);
      else if (type === 'action') {
        switch(id) {
          case 'export-report': window.switchPage('export'); break;
          case 'switch-store': document.getElementById('storeSelector')?.click(); break;
          case 'dark-mode': toggleTheme(); break;
        }
      }
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOverlay?.classList.contains('hidden')) openCommandPalette();
        else closeCommandPalette();
      }
      if (commandPaletteOverlay && !commandPaletteOverlay.classList.contains('hidden')) {
        if (e.key === 'Escape') closeCommandPalette();
        else if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1); renderCommandPalette(commandPaletteInput?.value || ''); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); renderCommandPalette(commandPaletteInput?.value || ''); }
        else if (e.key === 'Enter' && currentResults[selectedIndex]) { e.preventDefault(); const item = currentResults[selectedIndex]; executeCommand(item.type, item.id); }
      }
    });

    commandPaletteInput?.addEventListener('input', (e) => { selectedIndex = 0; renderCommandPalette(e.target.value); });
    commandPaletteOverlay?.addEventListener('click', (e) => { if (e.target === commandPaletteOverlay) closeCommandPalette(); });
  } catch (e) { console.error('initCommandPalette error:', e); }
}

// ============================================
// Data Screen V2
// ============================================
function initDataScreenV2() {
  try {
    initClock();
    Object.keys(sparklineData).forEach(id => {
      const colors = { sparkRevenue: '#7C3AED', sparkOrders: '#06B6D4', sparkRating: '#10B981', sparkAI: '#F59E0B', sparkRepurchase: '#7C3AED', sparkAOV: '#7C3AED', sparkBadReview: '#10B981', sparkPlatforms: '#06B6D4' };
      drawSparkline(id, sparklineData[id], colors[id] || '#7C3AED');
    });
    setTimeout(() => { initScreenRevenueChart(); initBadReviewCharts(); initMemberCharts(); initAIStatsChart(); initDataScreenRadarChart(); initForecastChart(); }, 100);
    initDSTabs();
    initFlipCards();
    initChatEnhancements();
    initStrategyExecute();
    initHealthRoadmap();
    initNewsTicker();
    setTimeout(initChinaMap, 300);
    initFullscreenToggle();
    initTimeRangeToggle();
    initStoreFilter();
    initRefreshBtn();
    initStreamTicker();
    setTimeout(animateNumbers, 500);
    console.log('数据大屏 v2 - 初始化完成');
  } catch (e) { console.error('initDataScreenV2 error:', e); }
}

function initClock() {
  const clockEl = document.getElementById('dsClock');
  const dateEl = document.getElementById('dsDate');
  function updateClock() {
    const now = new Date();
    if (dateEl) dateEl.textContent = `2026年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;
    if (clockEl) clockEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function initNewsTicker() {
  const content = document.getElementById('newsContent');
  if (content) { const originalHTML = content.innerHTML; content.innerHTML = originalHTML + originalHTML; }
}

function initStreamTicker() {
  const content = document.getElementById('streamContent');
  if (content) { const originalHTML = content.innerHTML; content.innerHTML = originalHTML + originalHTML; }
}

function initDSTabs() {
  document.querySelectorAll('.ds-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateRevenueChart(tab.dataset.tab);
    });
  });
}

function updateRevenueChart(type) {
  if (!screenRevenueChart) return;
  let data, color;
  switch(type) {
    case 'revenue': data = [82000, 88000, 91000, 96000, 105000, 118000, 128000]; color = '#7C3AED'; break;
    case 'orders': data = [980, 1050, 1100, 1150, 1200, 1240, 1247]; color = '#06B6D4'; break;
    case 'traffic': data = [2800, 3200, 3500, 3800, 4200, 4800, 5200]; color = '#10B981'; break;
  }
  screenRevenueChart.data.datasets[0].data = data;
  screenRevenueChart.data.datasets[0].borderColor = color;
  screenRevenueChart.data.datasets[0].pointBackgroundColor = color;
  screenRevenueChart.update();
}

function initScreenRevenueChart() {
  try {
    const ctx = document.getElementById('screenRevenueChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (screenRevenueChart) screenRevenueChart.destroy();
    screenRevenueChart = new Chart(ctx, {
      type: 'line',
      data: { labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'], datasets: [{ label: '本月', data: [82000, 88000, 91000, 96000, 105000, 118000, 128000], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.15)', fill: true, tension: 0.4, borderWidth: 2, pointBackgroundColor: '#7C3AED', pointRadius: 4, pointHoverRadius: 6 }, { label: '上月同期', data: [75000, 78000, 82000, 85000, 92000, 98000, null], borderColor: '#06B6D4', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.4, borderWidth: 2, pointRadius: 0, spanGaps: true }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', font: { size: 10 }, boxWidth: 12, padding: 10 } } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 10 }, callback: v => '¥' + (v / 10000) + '万' } } } }
    });
  } catch (e) { console.error('initScreenRevenueChart error:', e); }
}

function initBadReviewCharts() {
  try {
    const pieCtx = document.getElementById('badReviewPieChart');
    const trendCtx = document.getElementById('badReviewTrendChart');
    if (pieCtx && typeof Chart !== 'undefined') {
      if (badReviewPieChart) badReviewPieChart.destroy();
      badReviewPieChart = new Chart(pieCtx, { type: 'doughnut', data: { labels: ['口味', '服务', '环境', '价格', '等待'], datasets: [{ data: [35, 28, 18, 12, 7], backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#64748B'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: true, position: 'right', labels: { color: '#94A3B8', font: { size: 9 }, padding: 6, boxWidth: 10 } } } } });
    }
    if (trendCtx && typeof Chart !== 'undefined') {
      if (badReviewTrendChart) badReviewTrendChart.destroy();
      badReviewTrendChart = new Chart(trendCtx, { type: 'line', data: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], datasets: [{ data: [3, 2, 1, 2, 1, 2, 1], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#EF4444' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 8 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 8 }, stepSize: 1 } } } } });
    }
  } catch (e) { console.error('initBadReviewCharts error:', e); }
}

function initMemberCharts() {
  try {
    const genderCtx = document.getElementById('memberGenderChart');
    const rfmCtx = document.getElementById('memberRFMChart');
    if (genderCtx && typeof Chart !== 'undefined') {
      if (memberGenderChart) memberGenderChart.destroy();
      memberGenderChart = new Chart(genderCtx, { type: 'doughnut', data: { labels: ['女性', '男性'], datasets: [{ data: [58, 42], backgroundColor: ['#7C3AED', '#06B6D4'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } } });
    }
    if (rfmCtx && typeof Chart !== 'undefined') {
      if (memberRFMChart) memberRFMChart.destroy();
      memberRFMChart = new Chart(rfmCtx, { type: 'bar', data: { labels: ['高价值', '潜力', '新客', '流失'], datasets: [{ data: [35, 28, 22, 15], backgroundColor: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'], borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 8 } } }, y: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 9 } } } } } });
    }
  } catch (e) { console.error('initMemberCharts error:', e); }
}

function initAIStatsChart() {
  try {
    const ctx = document.getElementById('aiDonutChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (aiDonutChart) aiDonutChart.destroy();
    aiDonutChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['成功', '失败'], datasets: [{ data: [94, 6], backgroundColor: ['#10B981', 'rgba(255,255,255,0.1)'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } } });
  } catch (e) { console.error('initAIStatsChart error:', e); }
}

function initDataScreenRadarChart() {
  try {
    const radarData = { labels: ['口味', '服务', '环境', '性价比', '品牌力', '创新力'], datasets: [{ label: '本店', data: [78, 75, 82, 88, 65, 85], borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.25)', borderWidth: 3, pointBackgroundColor: '#7C3AED', pointRadius: 4 }, { label: '海底捞', data: [82, 95, 88, 60, 92, 75], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 2, pointBackgroundColor: '#F59E0B', pointRadius: 3 }, { label: '小龙坎', data: [85, 78, 72, 80, 70, 72], borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderWidth: 2, pointBackgroundColor: '#06B6D4', pointRadius: 3 }] };
    const dsCtx = document.getElementById('dsScreenRadarChart');
    if (dsCtx && typeof Chart !== 'undefined') {
      if (dsScreenRadarChart) dsScreenRadarChart.destroy();
      dsScreenRadarChart = new Chart(dsCtx, { type: 'radar', data: radarData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#E2E8F0' }, pointLabels: { font: { size: 11, weight: '500' }, color: '#64748B' } } } } });
    }
  } catch (e) { console.error('initDataScreenRadarChart error:', e); }
}

function initForecastChart() {
  try {
    const ctx = document.getElementById('forecastChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (forecastChart) forecastChart.destroy();
    const isDark = document.body.classList.contains('dark-mode');
    forecastChart = new Chart(ctx, { type: 'line', data: { labels: ['本周', '下周', '下下周', '下月'], datasets: [{ label: '预测营收', data: [32000, 35000, 38500, 42000], borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.4, borderDash: [5, 5], pointBackgroundColor: '#7C3AED' }, { label: '置信区间', data: [28000, 30000, 33000, 36000], borderColor: 'rgba(124,58,237,0.3)', backgroundColor: 'rgba(124,58,237,0.05)', fill: '+1', tension: 0.4, pointRadius: 0 }, { label: '置信上限', data: [36000, 40000, 44000, 48000], borderColor: 'rgba(124,58,237,0.3)', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { grid: { display: false }, ticks: { color: isDark ? '#94A3B8' : '#6B7280' } }, y: { grid: { color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }, ticks: { color: isDark ? '#94A3B8' : '#6B7280', callback: v => '¥' + (v/1000) + 'k' } } } } });
  } catch (e) { console.error('initForecastChart error:', e); }
}

function initChinaMap() {
  try {
    const container = document.getElementById('chinaMapChart');
    if (!container || typeof echarts === 'undefined') return;
    if (chinaMapChart) chinaMapChart.dispose();
    chinaMapChart = echarts.init(container, null, { renderer: 'canvas' });
    chinaMapChart.showLoading({ text: '地图加载中...', color: '#7C3AED', textColor: '#94A3B8', maskColor: 'rgba(15, 23, 42, 0.8)', zlevel: 0 });
    const storeDataList = [
      { name: '北京旗舰店', value: [116.46, 39.92, 28.6], rating: 4.9, orders: 1245, type: '旗舰' },
      { name: '上海直营店', value: [121.48, 31.22, 22.4], rating: 4.8, orders: 986, type: '直营' },
      { name: '广州直营店', value: [113.23, 23.16, 20.8], rating: 4.8, orders: 912, type: '直营' },
      { name: '深圳加盟店', value: [114.07, 22.62, 18.2], rating: 4.7, orders: 824, type: '加盟' },
      { name: '成都加盟店', value: [104.06, 30.67, 16.5], rating: 4.7, orders: 756, type: '加盟' },
      { name: '杭州加盟店', value: [120.19, 30.26, 15.8], rating: 4.6, orders: 698, type: '加盟' },
      { name: '武汉加盟店', value: [114.31, 30.52, 14.2], rating: 4.6, orders: 645, type: '加盟' },
      { name: '南京加盟店', value: [118.78, 32.04, 12.6], rating: 4.5, orders: 578, type: '加盟' }
    ];
    const flagship = storeDataList.filter(s => s.type === '旗舰');
    const direct = storeDataList.filter(s => s.type === '直营');
    const franchise = storeDataList.filter(s => s.type === '加盟');
    chinaMapChart.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(124,58,237,0.5)', borderWidth: 1, textStyle: { color: '#E2E8F0', fontSize: 12 }, formatter: function(params) { if (params.seriesType === 'effectScatter') { const d = params.data; return '<b>' + d.name + '</b><br/>类型：' + d.storeType + '<br/>月营收：¥' + d.value[2] + '万<br/>评分：★ ' + d.rating + '<br/>月订单：' + d.orders + '单'; } return params.name; } },
      geo: { map: 'china', roam: false, zoom: 1.2, center: [104.5, 35.5], label: { show: false }, itemStyle: { areaColor: 'rgba(30,27,75,0.6)', borderColor: 'rgba(6,182,212,0.3)', borderWidth: 0.8 }, emphasis: { itemStyle: { areaColor: 'rgba(124,58,237,0.3)', borderColor: 'rgba(124,58,237,0.6)', borderWidth: 1.5 }, label: { show: false } } },
      series: [
        { name: '旗舰', type: 'effectScatter', coordinateSystem: 'geo', data: flagship.map(s => ({ name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type })), symbolSize: 18, rippleEffect: { brushType: 'stroke', scale: 4, period: 3 }, itemStyle: { color: '#7C3AED', shadowBlur: 10, shadowColor: '#7C3AED' }, label: { show: true, formatter: '{b}', position: 'right', color: '#E2E8F0', fontSize: 9, fontWeight: 500 } },
        { name: '直营', type: 'effectScatter', coordinateSystem: 'geo', data: direct.map(s => ({ name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type })), symbolSize: 12, rippleEffect: { brushType: 'stroke', scale: 3, period: 4 }, itemStyle: { color: '#06B6D4', shadowBlur: 8, shadowColor: '#06B6D4' }, label: { show: true, formatter: '{b}', position: 'right', color: '#E2E8F0', fontSize: 8 } },
        { name: '加盟', type: 'effectScatter', coordinateSystem: 'geo', data: franchise.map(s => ({ name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type })), symbolSize: 10, rippleEffect: { brushType: 'stroke', scale: 2.5, period: 5 }, itemStyle: { color: '#10B981', shadowBlur: 6, shadowColor: '#10B981' }, label: { show: true, formatter: '{b}', position: 'right', color: '#E2E8F0', fontSize: 8 } }
      ]
    });
    chinaMapChart.hideLoading();
    window.addEventListener('resize', () => { if (chinaMapChart) chinaMapChart.resize(); });
  } catch (e) { console.error('initChinaMap error:', e); }
}

function initFullscreenToggle() {
  const fullscreenBtn = document.getElementById('dsFullscreenBtn');
  if (!fullscreenBtn) return;
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.log('全屏请求失败:', err));
    else document.exitFullscreen();
  });
}

function initTimeRangeToggle() {
  document.querySelectorAll('.ds-time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ds-time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function initStoreFilter() {
  const storeSelect = document.getElementById('storeSelect');
  if (!storeSelect) return;
  storeSelect.addEventListener('change', () => console.log('筛选门店:', storeSelect.value));
}

function initRefreshBtn() {
  const refreshBtn = document.getElementById('dsRefreshBtn');
  if (!refreshBtn) return;
  refreshBtn.addEventListener('click', () => {
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear infinite';
    setTimeout(() => { icon.style.animation = ''; lucide.createIcons(); console.log('数据已刷新'); }, 1000);
  });
}

function animateNumbers() {
  const statElements = document.querySelectorAll('.ds-metric-value, .ds-agent-stat-value, .ds-overview-value');
  statElements.forEach(el => {
    const text = el.textContent;
    const match = text.match(/[\d.]+/);
    if (match) {
      const target = parseFloat(match[0]);
      const prefix = text.substring(0, text.indexOf(match[0]));
      const suffix = text.substring(text.indexOf(match[0]) + match[0].length);
      let current = 0;
      const duration = 1500;
      const step = target / (duration / 16);
      const animate = () => {
        current += step;
        if (current < target) {
          el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
          requestAnimationFrame(animate);
        } else el.textContent = text;
      };
      setTimeout(animate, Math.random() * 500);
    }
  });
}

// ============================================
// v10 Features
// ============================================
function initV10Features() {
  try {
    // AI Insight
    initAIInsight();
    // Chat Enhancements
    initChatEnhancements();
    // Flip Cards
    initFlipCards();
    // Strategy Execute
    initStrategyExecute();
    // Health Roadmap
    initHealthRoadmap();
    // Journey Interactions
    document.querySelectorAll('.journey-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.journeyTab;
        document.querySelectorAll('.journey-tab').forEach(t => t.classList.toggle('active', t.dataset.journeyTab === targetTab));
        document.querySelectorAll('.journey-tab-panel').forEach(p => p.classList.toggle('active', p.id === 'journey' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
      });
    });
    // Creation Interactions
    document.querySelectorAll('.creation-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.creation-toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    document.querySelectorAll('.creation-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.creation-type-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    document.getElementById('creationGenerateBtn')?.addEventListener('click', () => {
      const keyword = document.getElementById('creationKeyword')?.value;
      if (keyword) showToast('AI正在为您生成内容，请稍候...');
    });
  } catch (e) { console.error('initV10Features error:', e); }
}

function initAIInsight() {
  try {
    const insightContent = document.getElementById('aiInsightContent');
    const insightRefresh = document.getElementById('aiInsightRefresh');
    if (!insightContent) return;
    const insights = [
      "今日营收¥12.8万，较昨日+12%。主要驱动：外卖订单增长18%，午市表现突出。建议：加大午市推广投入，晚市可考虑推出套餐提升客单价。",
      "本周复购率提升5%，老客贡献占比达68%。VIP用户王女士已连续3周未到店，建议发送专属召回优惠。",
      "差评处理及时率98%，平均响应时间2.8分钟。但「等位时间长」仍是主要差评原因，建议优化排队系统。",
      "午市上座率较晚市低35%，存在提升空间。建议推出午市特惠套餐，预计增收¥3,200/天。",
      "本周新客增长12%，主要来源抖音引流。建议加大短视频内容投放，保持流量增长势头。"
    ];
    let currentInsight = 0;
    function typeText(text) {
      const textEl = insightContent.querySelector('.ai-insight-text') || document.createElement('span');
      textEl.className = 'ai-insight-text';
      insightContent.innerHTML = '';
      insightContent.appendChild(textEl);
      let index = 0;
      function doType() {
        if (index < text.length) {
          textEl.textContent += text[index];
          index++;
          setTimeout(doType, 30 + Math.random() * 20);
        }
      }
      doType();
    }
    if (insightRefresh) {
      insightRefresh.addEventListener('click', () => {
        insightRefresh.classList.add('loading');
        setTimeout(() => {
          currentInsight = (currentInsight + 1) % insights.length;
          typeText(insights[currentInsight]);
          insightRefresh.classList.remove('loading');
        }, 800);
      });
    }
    setTimeout(() => typeText(insights[currentInsight]), 500);
  } catch (e) { console.error('initAIInsight error:', e); }
}

function initChatEnhancements() {
  try {
    document.querySelectorAll('.chat-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        const chatInput = document.getElementById('chatInput');
        if (chatInput && template) {
          chatInput.value = template;
          chatInput.focus();
        }
      });
    });
    document.querySelectorAll('.chat-history-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.chat-history-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
    document.getElementById('chatNewBtn')?.addEventListener('click', () => {
      const chatInput = document.getElementById('chatInput');
      if (chatInput) { chatInput.value = ''; chatInput.focus(); }
      document.querySelectorAll('.chat-history-item').forEach(i => i.classList.remove('active'));
    });
  } catch (e) { console.error('initChatEnhancements error:', e); }
}

function initFlipCards() {
  try {
    const flipCards = document.querySelectorAll('.flip-card');
    if (flipCards.length === 0) return;
    flipCards.forEach((card, index) => { setTimeout(() => animateFlip(card), index * 200); });
    if (realtimeInterval) clearInterval(realtimeInterval);
    realtimeInterval = setInterval(() => updateRealtimeData(), 30000);
    updateRealtimeTime();
    setInterval(updateRealtimeTime, 1000);
  } catch (e) { console.error('initFlipCards error:', e); }
}

function animateFlip(card) {
  const valueEl = card.querySelector('.flip-card-value');
  if (!valueEl) return;
  valueEl.classList.add('flipping');
  setTimeout(() => valueEl.classList.remove('flipping'), 600);
}

function updateRealtimeData() {
  const flipRevenue = document.getElementById('flipRevenue');
  const flipOrders = document.getElementById('flipOrders');
  const flipRating = document.getElementById('flipRating');
  if (flipRevenue) {
    const currentVal = parseFloat(flipRevenue.textContent.replace(/[^0-9.]/g, ''));
    const newVal = currentVal + (Math.random() - 0.5) * 0.5;
    flipRevenue.textContent = '¥' + newVal.toFixed(1) + '万';
    animateFlip(flipRevenue.parentElement);
  }
  if (flipOrders) {
    const currentVal = parseInt(flipOrders.textContent.replace(/,/g, ''));
    const newVal = currentVal + Math.floor(Math.random() * 5);
    flipOrders.textContent = newVal.toLocaleString();
    animateFlip(flipOrders.parentElement);
  }
  if (flipRating) {
    const currentVal = parseFloat(flipRating.textContent);
    const newVal = (currentVal + (Math.random() - 0.3) * 0.01).toFixed(1);
    flipRating.textContent = Math.min(5, Math.max(3, parseFloat(newVal))).toFixed(1);
    animateFlip(flipRating.parentElement);
  }
  lastUpdateTime = Date.now();
}

function updateRealtimeTime() {
  const timeEl = document.getElementById('realtimeTime');
  if (timeEl) {
    const seconds = Math.floor((Date.now() - lastUpdateTime) / 1000);
    timeEl.textContent = seconds < 60 ? seconds + '秒前更新' : Math.floor(seconds / 60) + '分钟前更新';
  }
}

function initStrategyExecute() {
  try {
    document.querySelectorAll('.ai-strategy-execute').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('executing')) return;
        btn.classList.add('executing');
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4"></i> 执行中...';
        lucide.createIcons();
        setTimeout(() => {
          btn.classList.remove('executing');
          btn.classList.add('executed');
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已执行';
          lucide.createIcons();
          showToast('策略已加入执行队列，AI将在30分钟内逐步生效');
        }, 2000);
      });
    });
  } catch (e) { console.error('initStrategyExecute error:', e); }
}

function initHealthRoadmap() {
  try {
    document.querySelectorAll('.health-roadmap-execute').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('executed')) return;
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 loading"></i> 执行中...';
        lucide.createIcons();
        setTimeout(() => {
          btn.classList.add('executed');
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已添加计划';
          lucide.createIcons();
          showToast('改善计划已添加，将在指定时间自动执行');
        }, 1500);
      });
    });
  } catch (e) { console.error('initHealthRoadmap error:', e); }
}

// ============================================
// Export Page
// ============================================
function initExport() {
  try {
    const exportSection = document.getElementById('sectionExport');
    if (!exportSection) return;
    exportSection.querySelectorAll('.export-type-option').forEach(option => {
      option.addEventListener('click', () => {
        exportSection.querySelectorAll('.export-type-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
    exportSection.querySelectorAll('.export-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        exportSection.querySelectorAll('.export-range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    exportSection.querySelectorAll('.export-module-item').forEach(item => {
      item.addEventListener('click', () => { item.classList.toggle('checked'); });
    });
    document.getElementById('exportMainBtn')?.addEventListener('click', () => {
      const progressCard = document.getElementById('exportProgressCard');
      const progressBar = document.getElementById('exportProgressBar');
      const progressPercent = document.getElementById('exportProgressPercent');
      if (progressCard) progressCard.classList.remove('hidden');
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            if (progressCard) progressCard.classList.add('hidden');
            showToast('导出完成，文件已开始下载');
          }, 500);
        }
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
      }, 150);
    });
  } catch (e) { console.error('initExport error:', e); }
}

// ============================================
// AI Daily (AI洞察日报)
// ============================================
function initAidaily() {
  try {
    const aiDailySection = document.getElementById('sectionAidaily');
    if (!aiDailySection) return;
    const aiDailyDate = document.getElementById('aiDailyDate');
    const aiDailyStatus = document.getElementById('aiDailyStatus');
    const aiExportPdfBtn = document.getElementById('aiExportPdfBtn');
    if (aiDailyDate) {
      const now = new Date();
      aiDailyDate.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    }
    setTimeout(() => {
      if (aiDailyStatus) {
        aiDailyStatus.classList.remove('generating');
        aiDailyStatus.classList.add('hidden');
        const readyIndicator = aiDailyStatus.parentElement?.querySelector('.ready');
        if (readyIndicator) readyIndicator.classList.remove('hidden');
      }
    }, 2000);
    document.querySelectorAll('.ai-history-item').forEach(item => {
      item.addEventListener('click', () => { item.classList.toggle('expanded'); });
    });
    aiExportPdfBtn?.addEventListener('click', () => showToast('正在生成PDF报告，请稍候...'));
  } catch (e) { console.error('initAidaily error:', e); }
}

// ============================================
// Onboarding (新手引导) - 修复空指针
// ============================================
function initOnboarding() {
  try {
    const onboardingOverlay = document.getElementById('onboardingOverlay');
    const onboardingContent = document.getElementById('onboardingContent');
    const onboardingProgressBar = document.getElementById('onboardingProgressBar');
    const onboardingNextBtn = document.getElementById('onboardingNextBtn');
    const onboardingSkipBtn = document.getElementById('onboardingSkipBtn');
    const onboardingStartBtn = document.getElementById('onboardingStartBtn');
    const onboardingIndustryBtns = document.querySelectorAll('.onboarding-industry-btn');
    let currentStep = 1;
    const totalSteps = 5;

    function updateOnboardingStep() {
      // 修复：先检查onboardingContent是否存在
      if (!onboardingContent) return;
      const steps = onboardingContent.querySelectorAll('.onboarding-step');
      steps.forEach(step => {
        step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
      });
      if (onboardingProgressBar) {
        onboardingProgressBar.style.width = (currentStep / totalSteps * 100) + '%';
      }
      if (onboardingNextBtn) {
        onboardingNextBtn.innerHTML = currentStep === totalSteps - 1 ? '完成 <i data-lucide="check" class="w-4 h-4"></i>' : '下一步 <i data-lucide="arrow-right" class="w-4 h-4"></i>';
        lucide.createIcons();
      }
    }

    function nextStep() {
      if (currentStep < totalSteps) { currentStep++; updateOnboardingStep(); }
    }

    function closeOnboarding() {
      onboardingOverlay?.classList.add('hidden');
      localStorage.setItem('onboardingCompleted', 'true');
    }

    onboardingIndustryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        onboardingIndustryBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    onboardingNextBtn?.addEventListener('click', nextStep);
    onboardingSkipBtn?.addEventListener('click', closeOnboarding);
    onboardingStartBtn?.addEventListener('click', closeOnboarding);

    if (!localStorage.getItem('onboardingCompleted')) {
      setTimeout(() => {
        onboardingOverlay?.classList.remove('hidden');
        updateOnboardingStep();
      }, 500);
    }
  } catch (e) { console.error('initOnboarding error:', e); }
}

// ============================================
// Missing Button Handlers
// ============================================
function initMissingButtonHandlers() {
  try {
    const bindBtn = (id, msg) => {
      const btn = document.getElementById(id);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => showToast(msg));
      }
    };
    bindBtn('createCouponBtn', '优惠券创建功能开发中');
    bindBtn('calPrevBtn', '切换到上个月');
    bindBtn('calNextBtn', '切换到下个月');
    bindBtn('generateReportBtn', '正在生成数据报告...');
    bindBtn('calculateRoiBtn', 'ROI计算中...');
    bindBtn('locationSearchBtn', '选址分析中...');
    bindBtn('datalabAnalyzeBtn', '数据分析中...');
    document.querySelectorAll('.knowledge-action-btn, .coupon-btn, .ticket-btn, .category-btn').forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => showToast('功能开发中'));
      }
    });
    document.querySelectorAll('.viewDetailBtn, .view-detail-btn, [data-action="viewDetail"]').forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => showToast('查看详情'));
      }
    });
    document.querySelectorAll('.ai-suggestion-action, .ai-action-btn, [data-action="ai"]').forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => showToast('AI建议功能开发中'));
      }
    });
    document.querySelectorAll('.metric-card, .stat-card, .kpi-card').forEach(card => {
      if (!card.dataset.bound) {
        card.dataset.bound = 'true';
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showToast('查看详细数据'));
      }
    });
    document.querySelectorAll('.trend-card, .chart-card').forEach(card => {
      if (!card.dataset.bound) {
        card.dataset.bound = 'true';
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showToast('查看趋势分析'));
      }
    });
  } catch (e) { console.error('initMissingButtonHandlers error:', e); }
}

// ============================================
// Main Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Lucide图标
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // 核心UI
  initCoreUI();
  initStoreSelector();
  initDataScreenStoreSync();

  // Chat
  initChat();

  // Tab切换
  initTabSwitching();

  // v9功能
  initV9Features();

  // v10功能
  initV10Features();

  // 命令面板
  initCommandPalette();

  // 新手引导
  initOnboarding();

  // 缺失按钮
  initMissingButtonHandlers();

  // 初始化当前页面功能
  setTimeout(() => {
    const activeSection = document.querySelector('.demo-section.active');
    if (activeSection) {
      const pageId = activeSection.id.replace('section', '').toLowerCase();
      initPageCharts(pageId);
      initPageFeatures(pageId);
    }
    initDemo();
  }, 600);

  console.log('店赢OS v11 - 初始化完成 (单DCL闭包版本)');
});

// MutationObserver监听动态添加的按钮
document.addEventListener('DOMContentLoaded', function() {
  const observer = new MutationObserver(function(mutations) {
    let shouldInit = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) shouldInit = true;
    });
    if (shouldInit) setTimeout(initMissingButtonHandlers, 200);
  });
  const mainContent = document.querySelector('.demo-container') || document.querySelector('main') || document.body;
  observer.observe(mainContent, { childList: true, subtree: true });
});

console.log('店赢OS v11 - 脚本加载完成');
