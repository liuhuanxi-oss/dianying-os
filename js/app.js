/**
 * 店赢OS - 交互逻辑 v8 (精简版)
 * 保留核心功能，简化交互代码
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化Lucide图标
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ============================================
  // Reveal Animation
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // Theme Toggle
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  const demoThemeToggle = document.getElementById('topbarTheme');

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

  // 从localStorage恢复主题
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcons();
  }

  themeToggle?.addEventListener('click', toggleTheme);
  demoThemeToggle?.addEventListener('click', toggleTheme);

  // ============================================
  // Demo Navigation
  // ============================================
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
    window.scrollTo(0, 0);
    initDemo();
    lucide.createIcons();
  }

  function showLanding() {
    demoPage.classList.add('hidden');
    landingPage.classList.remove('hidden');
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

  // ============================================
  // Demo Sidebar Navigation
  // ============================================
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item[data-page]');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-page]');
  const demoSections = document.querySelectorAll('.demo-section');
  const breadcrumbText = document.getElementById('breadcrumbText');

  const pageNames = {
    overview: '运营概览',
    chat: 'AI对话',
    data: '数据报表',
    platform: '平台管理',
    logs: '决策日志'
  };

  function switchPage(page) {
    sidebarNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    mobileNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    demoSections.forEach(section => {
      section.classList.toggle('active', section.id === 'section' + page.charAt(0).toUpperCase() + page.slice(1));
    });
    if (breadcrumbText) {
      breadcrumbText.textContent = pageNames[page] || '运营概览';
    }
  }

  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });

  // ============================================
  // FAQ Accordion
  // ============================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });

  // ============================================
  // Filter Buttons
  // ============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ============================================
  // Demo Charts
  // ============================================
  let overviewChart = null;

  function initDemo() {
    const ctx = document.getElementById('overviewChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (overviewChart) overviewChart.destroy();

    overviewChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          data: [16500, 17200, 15800, 18900, 20100, 22500, 19800],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7C3AED',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/1000) + 'k' } }
        }
      }
    });
  }

  function initScreenChart() {
    const ctx = document.getElementById('screenChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
          data: [82000, 88000, 91000, 96000, 105000, 128000],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94A3B8', callback: v => '¥' + (v/10000) + '万' } }
        }
      }
    });
  }

  // ============================================
  // Chat Feature
  // ============================================
  const scenarioTabs = document.querySelectorAll('.scenario-tab');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');

  let currentScenario = 'review';

  const scenarios = {
    review: {
      title: '差评处理',
      messages: [
        { type: 'user', text: '刚收到一条差评，说等位40分钟' },
        { type: 'ai', agent: 'virtual', text: '收到差评预警。正在分析...'},
        { type: 'ai', agent: 'clue', text: '[线索Agent] 近7天等位差评3条，高峰期人手不足是主因。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）高峰期加2个兼职，2）等位送酸梅汤降焦虑。'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 已自动回复差评。明天兼职排班已同步。'}
      ]
    },
    pricing: {
      title: '动态定价',
      messages: [
        { type: 'user', text: '明天下雨，对生意有影响吗？' },
        { type: 'ai', agent: 'virtual', text: '正在分析天气数据对门店的影响...'},
        { type: 'ai', agent: 'clue', text: '[线索Agent] 雨天气流下降23%，但外卖订单上涨41%。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）外卖满100减20，2）推"雨天热汤套餐"。'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 已同步至美团/饿了么后台。'}
      ]
    },
    vip: {
      title: 'VIP管理',
      messages: [
        { type: 'user', text: '王女士1个月没来了，怎么回事？' },
        { type: 'ai', agent: 'virtual', text: '正在分析王女士的消费档案...'},
        { type: 'ai', agent: 'clue', text: '[线索Agent] 累计消费¥3,280，流失概率68%。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议发送个性化召回文案："王姐，好久不见！新上了您爱吃的酸菜鱼..."'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 已发送专属8折券，预计召回率78%。'}
      ]
    },
    operation: {
      title: '运营建议',
      messages: [
        { type: 'user', text: '最近翻台率有点低，怎么办？' },
        { type: 'ai', agent: 'virtual', text: '正在分析近期运营数据...'},
        { type: 'ai', agent: 'clue', text: '[线索Agent] 当前翻台率2.8次/天（目标4次）。闲置时段14:00-17:00空桌率47%。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）午市推商务套餐，2）晚市18:30前结账9折，3）下午茶开放茶点。'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 预计整体提升翻台率至3.6次/天，月增收¥2,400。'}
      ]
    },
    knowledge: {
      title: '跨店迁移',
      messages: [
        { type: 'user', text: '火锅店的促销方案能用到烧烤店吗？' },
        { type: 'ai', agent: 'virtual', text: '正在调用运营Agent分析...'},
        { type: 'ai', agent: 'clue', text: '[运营Agent] "满100减20"核心驱动力是"高客单价+社交场景"，烧烤店迁移可行度82%。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] 需调整：优惠门槛从100降至80，增加"烤串组合"替代"锅底+配菜"。'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 方案已推送至烧烤店后台。'}
      ]
    },
    twin: {
      title: '数字孪生',
      messages: [
        { type: 'user', text: '下周想推午市套餐，定多少合适？' },
        { type: 'ai', agent: 'virtual', text: '正在调用方案Agent进行数字孪生模拟...'},
        { type: 'ai', agent: 'clue', text: '[方案Agent] 模拟3种方案：¥38/¥48/¥58。¥48综合评分最高。'},
        { type: 'ai', agent: 'solution', text: '[方案Agent] ¥48方案预计午市增收¥3,200/天。建议加"免费续饭"标签提升价值感。'},
        { type: 'ai', agent: 'delivery', text: '[交付Agent] ¥48午市套餐已创建草稿，3天后自动复盘。'}
      ]
    }
  };

  function loadScenario(scenario) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    currentScenario = scenario;

    scenarioTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.scenario === scenario);
    });

    const data = scenarios[scenario];
    if (!data) return;

    let delay = 500;
    data.messages.forEach((msg, index) => {
      setTimeout(() => {
        if (msg.type === 'user') {
          addMessage(msg.type, msg.text);
        } else {
          showTyping();
          setTimeout(() => {
            hideTyping();
            addMessage(msg.type, msg.text, msg.agent);
          }, 800 + Math.random() * 400);
        }
      }, delay);
      delay += msg.type === 'user' ? 600 : 1500;
    });
  }

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
    div.innerHTML = `
      <div class="chat-message-bubble">${agentTag}${text.replace(/\n/g, '<br>')}</div>
      <div class="chat-message-time">${time}</div>
    `;
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

  function hideTyping() {
    document.getElementById('typingIndicator')?.remove();
  }

  scenarioTabs.forEach(tab => {
    tab.addEventListener('click', () => loadScenario(tab.dataset.scenario));
  });

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleChatInput);
  }
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatInput();
    });
  }

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

  // ============================================
  // Smooth Scroll
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  console.log('店赢OS v8 - 初始化完成');
});

// ============================================
// DATA SCREEN v2 - 数据大屏驾驶舱
// ============================================

// 全局图表实例
let screenRevenueChart = null;
let badReviewPieChart = null;
let badReviewTrendChart = null;
let memberGenderChart = null;
let memberRFMChart = null;
let aiDonutChart = null;

// Sparkline数据
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

// 绘制Sparkline
function drawSparkline(canvasId, data, color = '#7C3AED') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  
  ctx.clearRect(0, 0, width, height);
  
  // 绘制渐变填充
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
  
  // 绘制线条
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
  
  // 绘制端点
  const lastX = (data.length - 1) * stepX;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// 初始化营收趋势图
function initScreenRevenueChart() {
  const ctx = document.getElementById('screenRevenueChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (screenRevenueChart) screenRevenueChart.destroy();

  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月'];
  const currentData = [82000, 88000, 91000, 96000, 105000, 118000, 128000];
  const lastMonthData = [75000, 78000, 82000, 85000, 92000, 98000, null];

  screenRevenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '本月',
          data: currentData,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#7C3AED',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '上月同期',
          data: lastMonthData,
          borderColor: '#06B6D4',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#94A3B8',
            font: { size: 10 },
            boxWidth: 12,
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(124, 58, 237, 0.5)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const value = context.raw;
              if (value === null) return '';
              return context.dataset.label + ': ¥' + (value / 10000).toFixed(1) + '万';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#64748B', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { 
            color: '#64748B', 
            font: { size: 10 },
            callback: v => '¥' + (v / 10000) + '万'
          }
        }
      }
    }
  });
}

// Tab切换功能
function initDSTabs() {
  const tabs = document.querySelectorAll('.ds-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabType = tab.dataset.tab;
      updateRevenueChart(tabType);
    });
  });
}

// 更新营收图表数据
function updateRevenueChart(type) {
  if (!screenRevenueChart) return;
  
  let data, label, color;
  switch(type) {
    case 'revenue':
      data = [82000, 88000, 91000, 96000, 105000, 118000, 128000];
      label = '营收';
      color = '#7C3AED';
      break;
    case 'orders':
      data = [980, 1050, 1100, 1150, 1200, 1240, 1247];
      label = '订单';
      color = '#06B6D4';
      break;
    case 'traffic':
      data = [2800, 3200, 3500, 3800, 4200, 4800, 5200];
      label = '流量';
      color = '#10B981';
      break;
  }
  
  screenRevenueChart.data.datasets[0].data = data;
  screenRevenueChart.data.datasets[0].borderColor = color;
  screenRevenueChart.data.datasets[0].pointBackgroundColor = color;
  screenRevenueChart.options.scales.y.ticks.callback = type === 'revenue' 
    ? v => '¥' + (v / 10000) + '万'
    : v => v;
  screenRevenueChart.update();
}

// 初始化差评分析图
function initBadReviewCharts() {
  // 差评原因饼图
  const pieCtx = document.getElementById('badReviewPieChart');
  if (pieCtx && typeof Chart !== 'undefined') {
    if (badReviewPieChart) badReviewPieChart.destroy();
    badReviewPieChart = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['口味', '服务', '环境', '价格', '等待'],
        datasets: [{
          data: [35, 28, 18, 12, 7],
          backgroundColor: [
            '#EF4444',
            '#F59E0B',
            '#8B5CF6',
            '#06B6D4',
            '#64748B'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#94A3B8',
              font: { size: 9 },
              padding: 6,
              boxWidth: 10
            }
          }
        }
      }
    });
  }
  
  // 差评趋势图
  const trendCtx = document.getElementById('badReviewTrendChart');
  if (trendCtx && typeof Chart !== 'undefined') {
    if (badReviewTrendChart) badReviewTrendChart.destroy();
    badReviewTrendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          data: [3, 2, 1, 2, 1, 2, 1],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#EF4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 8 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 8 }, stepSize: 1 } }
        }
      }
    });
  }
}

// 初始化会员画像图
function initMemberCharts() {
  // 性别分布
  const genderCtx = document.getElementById('memberGenderChart');
  if (genderCtx && typeof Chart !== 'undefined') {
    if (memberGenderChart) memberGenderChart.destroy();
    memberGenderChart = new Chart(genderCtx, {
      type: 'doughnut',
      data: {
        labels: ['女性', '男性'],
        datasets: [{
          data: [58, 42],
          backgroundColor: ['#7C3AED', '#06B6D4'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
  }
  
  // RFM分层饼图
  const rfmCtx = document.getElementById('memberRFMChart');
  if (rfmCtx && typeof Chart !== 'undefined') {
    if (memberRFMChart) memberRFMChart.destroy();
    memberRFMChart = new Chart(rfmCtx, {
      type: 'bar',
      data: {
        labels: ['高价值', '潜力', '新客', '流失'],
        datasets: [{
          data: [35, 28, 22, 15],
          backgroundColor: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 8 } } },
          y: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 9 } } }
        }
      }
    });
  }
}

// 初始化AI处理统计图
function initAIStatsChart() {
  const ctx = document.getElementById('aiDonutChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (aiDonutChart) aiDonutChart.destroy();
  
  aiDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['成功', '失败'],
      datasets: [{
        data: [94, 6],
        backgroundColor: ['#10B981', 'rgba(255,255,255,0.1)'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: { legend: { display: false } }
    }
  });
}

// 实时时钟
function initClock() {
  const clockEl = document.getElementById('dsClock');
  const dateEl = document.getElementById('dsDate');
  
  function updateClock() {
    const now = new Date();
    const year = 2026; // 强制2026年
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    if (dateEl) dateEl.textContent = `${year}年${month}月${day}日`;
    if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

// 新闻滚动复制（确保无缝滚动）
function initNewsTicker() {
  const content = document.getElementById('newsContent');
  if (!content) return;
  
  // 复制内容以确保无缝滚动
  const originalHTML = content.innerHTML;
  content.innerHTML = originalHTML + originalHTML;
}

// 门店热力图Tooltip
function initHeatmapTooltip() {
  const markers = document.querySelectorAll('.ds-store-marker');
  const tooltip = document.getElementById('storeTooltip');
  const mapContainer = document.querySelector('.ds-heatmap-container');
  
  markers.forEach(marker => {
    marker.addEventListener('mouseenter', (e) => {
      const storeName = marker.dataset.store;
      const revenue = marker.dataset.revenue;
      const rating = marker.dataset.rating;
      const orders = marker.dataset.orders;
      const storeType = marker.dataset.type || '门店';
      
      if (tooltip && storeName) {
        tooltip.querySelector('.tooltip-store-name').textContent = storeName;
        
        // 设置门店类型标签
        const typeEl = tooltip.querySelector('.tooltip-type');
        if (typeEl) {
          typeEl.textContent = storeType;
          typeEl.className = 'tooltip-type';
          if (storeType === '直营') {
            typeEl.classList.add('direct');
          } else if (storeType === '加盟') {
            typeEl.classList.add('franchise');
          }
        }
        
        tooltip.querySelector('.tooltip-rating').textContent = '★ ' + rating;
        tooltip.querySelector('.tooltip-revenue').textContent = revenue;
        tooltip.querySelector('.tooltip-orders').textContent = orders + ' 单';
        tooltip.classList.add('show');
        
        const rect = marker.getBoundingClientRect();
        const containerRect = mapContainer.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top - 60;
        
        // 确保tooltip不超出容器
        let left = x - 50;
        let top = y;
        if (left < 0) left = 0;
        if (left > containerRect.width - 170) left = containerRect.width - 170;
        if (top < 0) top = y + 80;
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }
    });
    
    marker.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('show');
    });
  });
}

// 全屏切换
function initFullscreenToggle() {
  const fullscreenBtn = document.getElementById('dsFullscreenBtn');
  if (!fullscreenBtn) return;
  
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('全屏请求失败:', err);
      });
    } else {
      document.exitFullscreen();
    }
  });
  
  // 更新按钮图标
  document.addEventListener('fullscreenchange', () => {
    const icon = fullscreenBtn.querySelector('i');
    if (document.fullscreenElement) {
      icon.setAttribute('data-lucide', 'minimize');
    } else {
      icon.setAttribute('data-lucide', 'maximize');
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });
}

// 时间范围切换
function initTimeRangeToggle() {
  const timeBtns = document.querySelectorAll('.ds-time-btn');
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // 这里可以添加数据更新逻辑
      console.log('切换时间范围:', btn.dataset.range);
    });
  });
}

// 门店筛选
function initStoreFilter() {
  const storeSelect = document.getElementById('storeSelect');
  if (!storeSelect) return;
  
  storeSelect.addEventListener('change', () => {
    const store = storeSelect.value;
    console.log('筛选门店:', store);
    // 这里可以添加门店筛选逻辑
  });
}

// 刷新按钮
function initRefreshBtn() {
  const refreshBtn = document.getElementById('dsRefreshBtn');
  if (!refreshBtn) return;
  
  refreshBtn.addEventListener('click', () => {
    // 添加旋转动画
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear infinite';
    
    // 模拟刷新
    setTimeout(() => {
      icon.style.animation = '';
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      console.log('数据已刷新');
    }, 1000);
  });
}

// 数字滚动动画 (countUp效果)
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
        } else {
          el.textContent = text;
        }
      };
      
      // 延迟启动动画
      setTimeout(animate, Math.random() * 500);
    }
  });
}

// 实时数据流滚动复制
function initStreamTicker() {
  const content = document.getElementById('streamContent');
  if (!content) return;
  
  // 复制内容以确保无缝滚动
  const originalHTML = content.innerHTML;
  content.innerHTML = originalHTML + originalHTML;
}

// 增强版大屏初始化
function initDataScreenV2() {
  // 初始化时钟
  initClock();
  
  // 初始化Sparklines
  Object.keys(sparklineData).forEach(id => {
    const colors = {
      sparkRevenue: '#7C3AED',
      sparkOrders: '#06B6D4',
      sparkRating: '#10B981',
      sparkAI: '#F59E0B',
      sparkRepurchase: '#7C3AED',
      sparkAOV: '#7C3AED',
      sparkBadReview: '#10B981',
      sparkPlatforms: '#06B6D4'
    };
    drawSparkline(id, sparklineData[id], colors[id] || '#7C3AED');
  });
  
  // 初始化图表
  setTimeout(() => {
    initScreenRevenueChart();
    initBadReviewCharts();
    initMemberCharts();
    initAIStatsChart();
  }, 100);
  
  // 初始化Tab
  initDSTabs();
  
  // 初始化新闻滚动
  initNewsTicker();
  
  // 初始化热力图Tooltip
  initHeatmapTooltip();
  
  // 初始化新功能
  initFullscreenToggle();
  initTimeRangeToggle();
  initStoreFilter();
  initRefreshBtn();
  initStreamTicker();
  
  // 数字动画
  setTimeout(animateNumbers, 500);
  
  console.log('数据大屏 v2 - 初始化完成');
}

// ============================================
// v9 新增功能模块
// ============================================

// ============================================
// 1. 试用期倒计时
// ============================================
function initCountdown() {
  // 设置7天后的时间作为试用截止
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  
  function updateCountdown() {
    const now = new Date();
    const diff = trialEnd - now;
    
    if (diff <= 0) {
      document.querySelectorAll('.countdown-badge').forEach(el => {
        el.textContent = '已到期';
        el.style.background = '#EF4444';
      });
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const countdownText = days > 0 ? days + '天' + hours + '时' : hours + '时' + minutes + '分';
    
    document.querySelectorAll('.countdown-badge, #heroCountdown').forEach(el => {
      if (el) el.textContent = '限时体验：剩余 ' + countdownText;
    });
  }
  
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

// ============================================
// 2. 行业Tab切换
// ============================================
function initIndustryTabs() {
  const tabs = document.querySelectorAll('.industry-tab');
  const industryContents = document.querySelectorAll('.industry-content');
  
  if (!tabs.length) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const industry = tab.dataset.industry;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      industryContents.forEach(content => {
        content.classList.toggle('hidden', content.dataset.industry !== industry);
      });
      
      console.log('切换行业:', industry);
    });
  });
}

// ============================================
// 3. Logo墙滚动
// ============================================
function initLogoWall() {
  const track = document.getElementById('logoTrack');
  if (!track) return;
  
  const originalHTML = track.innerHTML;
  track.innerHTML = originalHTML + originalHTML;
}

// ============================================
// 4. 门店TOP10排行榜滚动
// ============================================
function initRankingScroll() {
  const scrollContainer = document.getElementById('rankingScroll');
  if (!scrollContainer) return;
  
  let scrollInterval;
  let isPaused = false;
  
  function startScroll() {
    scrollInterval = setInterval(() => {
      if (isPaused) return;
      
      const firstItem = scrollContainer.querySelector('.ranking-item');
      if (firstItem) {
        const itemHeight = firstItem.offsetHeight;
        scrollContainer.style.transition = 'transform 0.5s ease';
        scrollContainer.style.transform = 'translateY(-' + itemHeight + 'px)';
        
        setTimeout(() => {
          scrollContainer.appendChild(firstItem);
          scrollContainer.style.transition = 'none';
          scrollContainer.style.transform = 'translateY(0)';
        }, 500);
      }
    }, 3000);
  }
  
  scrollContainer.addEventListener('mouseenter', () => { isPaused = true; });
  scrollContainer.addEventListener('mouseleave', () => { isPaused = false; });
  
  startScroll();
}

// ============================================
// 5. 通知中心
// ============================================
function initNotificationCenter() {
  const bellBtn = document.getElementById('notificationBell');
  const dropdown = document.getElementById('notificationDropdown');
  const markReadBtn = document.querySelector('.notification-mark-read');
  
  if (!bellBtn || !dropdown) return;
  
  const notifications = [
    { type: 'warning', title: '差评预警', content: '望京店收到1条1星差评，请及时处理', time: '5分钟前', read: false },
    { type: 'info', title: '流量异常', content: '三里屯店今日午高峰流量下降23%，建议检查', time: '15分钟前', read: false },
    { type: 'success', title: '评分提升', content: '恭喜！您的好评率环比提升5.2%', time: '1小时前', read: true },
    { type: 'warning', title: '订单异常', content: '西单店出现3笔疑似刷单，已标记审查', time: '2小时前', read: true },
    { type: 'info', title: 'AI建议', content: '系统检测到工作日午高峰人手不足，建议调整排班', time: '3小时前', read: true }
  ];
  
  function renderNotifications() {
    const list = dropdown.querySelector('.notification-list');
    if (!list) return;
    
    list.innerHTML = notifications.map(n => 
      '<div class="notification-item ' + (n.read ? '' : 'unread') + '" data-type="' + n.type + '">' +
        '<div class="notification-icon notification-icon-' + n.type + '">' +
          '<i data-lucide="' + (n.type === 'warning' ? 'alert-triangle' : n.type === 'success' ? 'check-circle' : 'info') + '" class="w-4 h-4"></i>' +
        '</div>' +
        '<div class="notification-content">' +
          '<div class="notification-title">' + n.title + '</div>' +
          '<div class="notification-text">' + n.content + '</div>' +
          '<div class="notification-time">' + n.time + '</div>' +
        '</div>' +
      '</div>'
    ).join('');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = bellBtn.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('initialized')) {
      renderNotifications();
      dropdown.classList.add('initialized');
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!bellBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  markReadBtn?.addEventListener('click', () => {
    notifications.forEach(n => n.read = true);
    renderNotifications();
  });
}

// ============================================
// 6. 批量操作Modal
// ============================================
function initBatchOperations() {
  const batchBtn = document.getElementById('batchActionBtn');
  const modal = document.getElementById('batchModal');
  const closeBtn = modal?.querySelector('.modal-close');
  const operationBtns = document.querySelectorAll('.batch-operation-btn');
  const executeBtn = document.getElementById('batchExecuteBtn');
  
  if (!batchBtn || !modal) return;
  
  batchBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
  
  closeBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
  
  let selectedOperation = '';
  operationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      operationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOperation = btn.dataset.operation;
    });
  });
  
  executeBtn?.addEventListener('click', () => {
    if (!selectedOperation) {
      alert('请先选择操作类型');
      return;
    }
    
    const selectedItems = document.querySelectorAll('.store-checkbox:checked');
    if (selectedItems.length === 0) {
      alert('请至少选择一项');
      return;
    }
    
    executeBtn.disabled = true;
    executeBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> 执行中...';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    setTimeout(() => {
      executeBtn.disabled = false;
      executeBtn.innerHTML = '确认执行';
      modal.classList.add('hidden');
      showToast('已成功对 ' + selectedItems.length + ' 项执行「' + getOperationName(selectedOperation) + '」');
    }, 1500);
  });
}

function getOperationName(op) {
  const names = { reply: '批量回复差评', price: '批量调价', sync: '同步菜品', export: '导出数据' };
  return names[op] || op;
}

function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10B981;color:white;padding:12px 24px;border-radius:8px;font-size:14px;z-index:10000;animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ============================================
// 7. 快捷键支持
// ============================================
function initKeyboardShortcuts() {
  const shortcutBtn = document.getElementById('shortcutBtn');
  const modal = document.getElementById('shortcutModal');
  const closeBtn = modal?.querySelector('.modal-close');
  
  if (!shortcutBtn || !modal) return;
  
  shortcutBtn.addEventListener('click', () => { modal.classList.remove('hidden'); });
  closeBtn?.addEventListener('click', () => { modal.classList.add('hidden'); });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    const key = e.key.toLowerCase();
    
    switch(key) {
      case '1': switchPage('overview'); break;
      case '2': switchPage('chat'); break;
      case '3': switchPage('data'); break;
      case '4': switchPage('platform'); break;
      case '5': switchPage('logs'); break;
      case 'd': if (!e.ctrlKey && !e.metaKey) toggleTheme(); break;
      case 'f': if (!e.ctrlKey && !e.metaKey) toggleFullscreen(); break;
      case 'r': if (!e.ctrlKey && !e.metaKey) window.location.reload(); break;
      case '?': modal.classList.remove('hidden'); break;
      case 'escape': modal.classList.add('hidden'); break;
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// ============================================
// 8. 新手引导Tour (Driver.js)
// ============================================
function initTourGuide() {
  const tourBtn = document.getElementById('tourBtn');
  if (!tourBtn || typeof driver === 'undefined') return;
  
  if (localStorage.getItem('tourCompleted')) {
    tourBtn.innerHTML = '<i data-lucide="compass" class="w-4 h-4"></i> 重新引导';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  const driverObj = new driver({
    animate: true,
    opacity: 0.75,
    padding: 5,
    allowClose: true,
    overlayClickNext: false,
    doneBtnText: '完成',
    closeBtnText: '关闭',
    nextBtnText: '下一步',
    prevBtnText: '上一步',
    steps: [
      { element: '.topbar', popover: { title: '欢迎使用店赢OS', description: '这是顶部导航栏，包含主题切换、全屏、帮助等功能', position: 'bottom' } },
      { element: '.sidebar', popover: { title: '功能导航', description: '在此切换不同的功能模块：运营概览、AI对话、数据报表、平台管理、决策日志', position: 'right' } },
      { element: '#sectionOverview .demo-card:first-child', popover: { title: '实时数据概览', description: '查看今日营收、订单、评分等核心指标，点击可查看详细趋势', position: 'top' } },
      { element: '#sectionChat .chat-container', popover: { title: 'AI智能助手', description: '与店小赢对话，获取运营建议、数据分析、问题解答', position: 'left' } },
      { element: '.demo-footer-actions', popover: { title: '快捷操作', description: '导出报告、查看帮助文档、进入大屏驾驶舱', position: 'top' } }
    ]
  });
  
  tourBtn.addEventListener('click', () => {
    driverObj.drive();
    localStorage.setItem('tourCompleted', 'true');
  });
}

// ============================================
// 9. 导出运营报告PDF
// ============================================
function initExportReport() {
  const exportBtn = document.getElementById('exportReportBtn');
  if (!exportBtn) return;
  
  exportBtn.addEventListener('click', () => {
    const printContent = document.createElement('div');
    printContent.id = 'print-report-content';
    printContent.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;';
    
    const now = new Date();
    const reportDate = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
    
    printContent.innerHTML = '<div style="font-family:Arial,sans-serif;padding:40px;">' +
      '<h1 style="text-align:center;color:#7C3AED;font-size:28px;margin-bottom:10px;">店赢OS 运营周报</h1>' +
      '<p style="text-align:center;color:#666;margin-bottom:30px;">报告日期：' + reportDate + '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:30px;">' +
        '<div style="text-align:center;padding:20px;background:#F3E8FF;border-radius:8px;"><div style="font-size:24px;font-weight:bold;color:#7C3AED;">¥128,500</div><div style="color:#666;font-size:14px;">本周营收</div><div style="color:#10B981;font-size:12px;">↑ 12.5%</div></div>' +
        '<div style="text-align:center;padding:20px;background:#E0F2FE;border-radius:8px;"><div style="font-size:24px;font-weight:bold;color:#06B6D4;">3,256</div><div style="color:#666;font-size:14px;">本周订单</div><div style="color:#10B981;font-size:12px;">↑ 8.3%</div></div>' +
        '<div style="text-align:center;padding:20px;background:#D1FAE5;border-radius:8px;"><div style="font-size:24px;font-weight:bold;color:#10B981;">4.87</div><div style="color:#666;font-size:14px;">平均评分</div><div style="color:#10B981;font-size:12px;">↑ 0.12</div></div>' +
        '<div style="text-align:center;padding:20px;background:#FEF3C7;border-radius:8px;"><div style="font-size:24px;font-weight:bold;color:#F59E0B;">68.5%</div><div style="color:#666;font-size:14px;">复购率</div><div style="color:#10B981;font-size:12px;">↑ 3.2%</div></div>' +
      '</div>' +
      '<h2 style="color:#333;border-bottom:2px solid #7C3AED;padding-bottom:10px;">AI决策建议</h2>' +
      '<div style="margin:20px 0;">' +
        '<div style="background:#F9FAFB;padding:15px;border-radius:8px;margin-bottom:10px;"><strong style="color:#7C3AED;">💡 优化建议</strong><p style="margin:10px 0 0 0;color:#374151;">建议在工作日午高峰(11:30-13:00)增加2名服务员，预计可提升15%接单量</p></div>' +
        '<div style="background:#F9FAFB;padding:15px;border-radius:8px;"><strong style="color:#10B981;">✅ 已执行</strong><p style="margin:10px 0 0 0;color:#374151;">已自动将「招牌小龙虾」移出午市套餐，降低出餐压力</p></div>' +
      '</div>' +
      '<h2 style="color:#333;border-bottom:2px solid #7C3AED;padding-bottom:10px;">门店排名 TOP5</h2>' +
      '<table style="width:100%;border-collapse:collapse;margin-top:20px;">' +
        '<tr style="background:#7C3AED;color:white;"><th style="padding:12px;text-align:left;">排名</th><th style="padding:12px;text-align:left;">门店</th><th style="padding:12px;text-align:right;">营收</th><th style="padding:12px;text-align:right;">订单</th><th style="padding:12px;text-align:right;">评分</th></tr>' +
        '<tr style="background:#F9FAFB;"><td style="padding:12px;">🥇</td><td style="padding:12px;">望京SOHO店</td><td style="padding:12px;text-align:right;">¥35,200</td><td style="padding:12px;text-align:right;">892</td><td style="padding:12px;text-align:right;">4.92</td></tr>' +
        '<tr style="background:white;"><td style="padding:12px;">🥈</td><td style="padding:12px;">三里屯店</td><td style="padding:12px;text-align:right;">¥28,500</td><td style="padding:12px;text-align:right;">756</td><td style="padding:12px;text-align:right;">4.88</td></tr>' +
        '<tr style="background:#F9FAFB;"><td style="padding:12px;">🥉</td><td style="padding:12px;">国贸CBD店</td><td style="padding:12px;text-align:right;">¥25,800</td><td style="padding:12px;text-align:right;">698</td><td style="padding:12px;text-align:right;">4.85</td></tr>' +
        '<tr style="background:white;"><td style="padding:12px;">4</td><td style="padding:12px;">中关村店</td><td style="padding:12px;text-align:right;">¥21,300</td><td style="padding:12px;text-align:right;">542</td><td style="padding:12px;text-align:right;">4.83</td></tr>' +
        '<tr style="background:#F9FAFB;"><td style="padding:12px;">5</td><td style="padding:12px;">西单大悦城店</td><td style="padding:12px;text-align:right;">¥17,700</td><td style="padding:12px;text-align:right;">368</td><td style="padding:12px;text-align:right;">4.79</td></tr>' +
      '</table>' +
      '<div style="margin-top:40px;padding-top:20px;border-top:1px solid #E5E7EB;text-align:center;color:#666;font-size:12px;"><p>由 店赢OS v2.0 生成 | 更多信息请访问 dianyingos.com</p></div>' +
    '</div>';
    
    document.body.appendChild(printContent);
    window.print();
    setTimeout(() => { document.body.removeChild(printContent); }, 100);
  });
}

// ============================================
// 10. 竞品雷达图
// ============================================
let competitorRadarChart = null;

function initCompetitorRadarChart() {
  const ctx = document.getElementById('competitorRadarChart');
  if (!ctx || typeof Chart === 'undefined') return;
  
  if (competitorRadarChart) competitorRadarChart.destroy();
  
  const isDark = document.body.classList.contains('dark-mode');
  
  competitorRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['服务态度', '出餐速度', '菜品质量', '环境氛围', '性价比', '配送时效'],
      datasets: [
        { label: '本店', data: [92, 88, 95, 85, 78, 90], borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 2, pointBackgroundColor: '#7C3AED' },
        { label: '行业均值', data: [75, 72, 78, 70, 80, 68], borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 2, pointBackgroundColor: '#06B6D4' },
        { label: '竞品A', data: [85, 90, 80, 88, 72, 82], borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2, pointBackgroundColor: '#F59E0B' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#E2E8F0' : '#374151', usePointStyle: true, padding: 15 } } },
      scales: {
        r: {
          angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' },
          pointLabels: { color: isDark ? '#E2E8F0' : '#374151', font: { size: 11 } },
          ticks: { color: isDark ? '#94A3B8' : '#9CA3AF', backdropColor: 'transparent' }
        }
      }
    }
  });
}

// ============================================
// 11. AI预测图表
// ============================================
let forecastChart = null;

function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx || typeof Chart === 'undefined') return;
  
  if (forecastChart) forecastChart.destroy();
  
  const isDark = document.body.classList.contains('dark-mode');
  
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['本周', '下周', '下下周', '下月'],
      datasets: [
        { label: '预测营收', data: [32000, 35000, 38500, 42000], borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)', fill: true, tension: 0.4, borderDash: [5, 5], pointBackgroundColor: '#7C3AED' },
        { label: '置信区间', data: [28000, 30000, 33000, 36000], borderColor: 'rgba(124,58,237,0.3)', backgroundColor: 'rgba(124,58,237,0.05)', fill: '+1', tension: 0.4, pointRadius: 0 },
        { label: '置信上限', data: [36000, 40000, 44000, 48000], borderColor: 'rgba(124,58,237,0.3)', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? '#94A3B8' : '#6B7280' } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }, ticks: { color: isDark ? '#94A3B8' : '#6B7280', callback: v => '¥' + (v/1000) + 'k' } }
      }
    }
  });
}

// ============================================
// 12. 数据对比切换
// ============================================
function initDataComparison() {
  const compareBtns = document.querySelectorAll('.compare-btn');
  
  compareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      compareBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      console.log('切换对比周期:', btn.dataset.compare);
      
      const metrics = document.querySelectorAll('.comparison-metric');
      metrics.forEach(m => {
        m.style.opacity = '0.5';
        setTimeout(() => { m.style.opacity = '1'; }, 300);
      });
    });
  });
}

// ============================================
// 13. 操作日志筛选
// ============================================
function initLogFilters() {
  const filterBtns = document.querySelectorAll('.log-filter-btn');
  const logItems = document.querySelectorAll('.log-item');
  const searchInput = document.querySelector('.log-search-input');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const type = btn.dataset.filter;
      logItems.forEach(item => {
        item.style.display = (type === 'all' || item.dataset.type === type) ? 'flex' : 'none';
      });
    });
  });
  
  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    logItems.forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
    });
  });
}

// ============================================
// 14. 告警中心
// ============================================
function initAlertCenter() {
  const alertItems = document.querySelectorAll('.ds-alert-item');
  
  alertItems.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const title = item.querySelector('.alert-title')?.textContent;
      console.log('处理告警:', type, title);
      showToast('正在处理：' + title);
    });
  });
}

// ============================================
// 初始化所有新功能
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initCountdown();
    initIndustryTabs();
    initLogoWall();
    initRankingScroll();
    initNotificationCenter();
    initBatchOperations();
    initKeyboardShortcuts();
    initTourGuide();
    initExportReport();
    initCompetitorRadarChart();
    initForecastChart();
    initDataComparison();
    initLogFilters();
    initAlertCenter();
    
    console.log('店赢OS v9 新功能初始化完成');
  }, 500);
});
