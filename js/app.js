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
