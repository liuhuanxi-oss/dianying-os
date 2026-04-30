/**
 * 店赢OS - 交互逻辑 v8 (精简版)
 * 保留核心功能，简化交互代码
 */

// 全局图表实例（用于页面切换时销毁旧图表）
let overviewChart = null;
let healthRadarChart = null;
let reportTrendChart = null;
let locationFlowChart = null;

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
  // Navbar Scroll Effect (Glass Effect on Scroll)
  // ============================================
  const landingNavbar = document.querySelector('.landing-page .navbar');
  let lastScrollY = 0;
  
  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    if (landingNavbar) {
      if (currentScrollY > 20) {
        landingNavbar.classList.add('scrolled');
      } else {
        landingNavbar.classList.remove('scrolled');
      }
    }
    lastScrollY = currentScrollY;
  }
  
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

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

  window.toggleTheme = toggleTheme;

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

  // 初始化顶栏门店选择器
  initStoreSelector();
  // 初始化数据大屏门店同步
  initDataScreenStoreSync();

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
    aipay: 'AI付',
    knowledge: '知识库',
    logs: '决策日志',
    marketing: '营销工具',
    security: '权限管理',
    ticket: '工单系统',
    inventory: '库存预警',
    competitor: '竞品监控',
    health: '门店健康',
    calendar: '运营日历',
    report: '报表中心',
    workflow: '工作流',
    roi: 'ROI计算',
    creation: 'AI内容创作',
    twin: '门店数字孪生',
    location: '智能选址分析',
    journey: '顾客旅程地图',
    safety: '食品安全监控',
    employee: '员工绩效',
    supply: '供应链管理',
    member: '会员运营',
    sentiment: '舆情监控',
    pricing: '智能定价',
    changelog: '更新日志',
    alert: '智能预警',
    inspection: '门店巡检',
    datalab: '数据实验室',
    aidaily: 'AI洞察日报',
    export: '数据导出'
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
    // 页面切换后初始化对应页面的图表
    setTimeout(() => {
      initPageCharts(page);
      lucide.createIcons();
    }, 50);
  }

  window.switchPage = switchPage;
  
  // 根据页面初始化对应的图表
  function initPageCharts(page) {
    try {
      switch(page) {
        case 'inventory':
          initInventoryCharts();
          break;
        case 'competitor':
          initCompetitorRadarChart();
          initMarketShareChart();
          // compSentimentTrendChart在review tab显示时初始化，避免display:none导致0尺寸
          if (document.getElementById('compReview')?.classList.contains('active')) {
            initSentimentTrendChart('compSentimentTrendChart');
          }
          break;
        case 'health':
          initHealthRadarChart();
          break;
        case 'report':
          initReportTrendChart();
          break;
        case 'supply':
          initSupplyCostChart();
          break;
        case 'member':
          initMemberRfmChart();
          break;
        case 'sentiment':
          initSentimentCharts();
          initSentimentTrendChart();
          break;
        case 'pricing':
          initElasticityChart();
          break;
        case 'alert':
          initAlertTypeChart();
          break;
        case 'inspection':
          initInspectionTrendChart();
          break;
        case 'datalab':
          initDatalabCompareChart();
          break;
        case 'location':
          initLocationFlowChart();
          break;
        case 'aidaily':
          if (typeof initAidaily === 'function') initAidaily();
          break;
      }
    } catch(e) {
      console.warn('Chart init error for page', page, e);
    }
  }

  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.page !== 'more') {
        switchPage(item.dataset.page);
      }
    });
  });

  // ============================================
  // Mobile Drawer Menu
  // ============================================
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
    // Re-initialize Lucide icons for drawer
    setTimeout(() => lucide.createIcons(), 50);
  }

  function closeDrawer() {
    mobileDrawerOverlay?.classList.remove('active');
    mobileDrawer?.classList.remove('active');
    document.body.style.overflow = '';
    if (mobileDrawerSearch) {
      mobileDrawerSearch.value = '';
      filterDrawerItems('');
    }
  }

  function filterDrawerItems(query) {
    const q = query.toLowerCase().trim();
    let visibleCount = 0;
    
    mobileDrawerGroups.forEach(group => {
      const items = group.querySelectorAll('.mobile-drawer-item');
      let groupVisibleCount = 0;
      
      items.forEach(item => {
        const text = item.querySelector('span')?.textContent.toLowerCase() || '';
        if (q === '' || text.includes(q)) {
          item.classList.remove('hidden');
          groupVisibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });
      
      if (groupVisibleCount > 0) {
        group.classList.remove('hidden', 'no-results');
      } else {
        group.classList.add('hidden');
      }
      visibleCount += groupVisibleCount;
    });
    
    // Show no results message if needed
    let noResultsGroup = document.querySelector('.mobile-drawer-group.no-results');
    if (visibleCount === 0 && q !== '') {
      if (!noResultsGroup) {
        noResultsGroup = document.createElement('div');
        noResultsGroup.className = 'mobile-drawer-group no-results';
        noResultsGroup.innerHTML = '<div class="mobile-drawer-group-title">搜索结果</div><div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.9rem;">未找到匹配的功能</div>';
        document.getElementById('mobileDrawerBody')?.appendChild(noResultsGroup);
      }
      noResultsGroup.classList.remove('hidden');
    } else if (noResultsGroup) {
      noResultsGroup.classList.add('hidden');
    }
  }

  mobileMoreBtn?.addEventListener('click', openDrawer);
  mobileDrawerOverlay?.addEventListener('click', closeDrawer);
  mobileDrawerClose?.addEventListener('click', closeDrawer);
  mobileDrawerSearch?.addEventListener('input', (e) => filterDrawerItems(e.target.value));

  // Drawer item click - navigate and close
  mobileDrawerItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) {
        switchPage(page);
        closeDrawer();
        // Re-initialize icons after page switch
        setTimeout(() => lucide.createIcons(), 50);
      }
    });
  });

  // Keyboard ESC to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('active')) {
      closeDrawer();
    }
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
  function initDemo() {
    try {
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
    } catch (err) {
      console.error('initDemo初始化失败:', err);
    }
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
  // NEW FEATURES - v9.1
  // ============================================

  // Marketing Tab Switching
  const marketingTabs = document.querySelectorAll('.marketing-tab');
  const marketingPanels = document.querySelectorAll('.marketing-panel');

  marketingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.mktTab;
      marketingTabs.forEach(t => t.classList.toggle('active', t.dataset.mktTab === targetTab));
      marketingPanels.forEach(p => p.classList.toggle('active', p.id === 'mkt' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
      lucide.createIcons();
    });
  });

  // Competitor Tab Switching
  const competitorTabs = document.querySelectorAll('.competitor-tab');
  const competitorPanels = document.querySelectorAll('.competitor-panel');

  competitorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.compTab;
      competitorTabs.forEach(t => t.classList.toggle('active', t.dataset.compTab === targetTab));
      competitorPanels.forEach(p => p.classList.toggle('active', p.id === 'comp' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
      lucide.createIcons();
      // 重新初始化口碑趋势图（修复display:none导致0尺寸问题）
      if (targetTab === 'review') {
        setTimeout(() => {
          initSentimentTrendChart('compSentimentTrendChart');
        }, 100);
      }
    });
  });

  // Ticket Filter Switching
  const ticketFilters = document.querySelectorAll('.ticket-filter');
  ticketFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      ticketFilters.forEach(f => f.classList.toggle('active', f === filter));
    });
  });

  // Role Card Selection
  const roleCards = document.querySelectorAll('.role-card');
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.toggle('active', c === card));
    });
  });

  // Initialize Inventory Charts
  function initInventoryCharts() {
    const costCtx = document.getElementById('costChart');
    const lossCtx = document.getElementById('lossChart');
    const turnoverCtx = document.getElementById('turnoverChart');
    
    if (costCtx && typeof Chart !== 'undefined') {
      new Chart(costCtx, {
        type: 'line',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [{
            data: [38000, 39500, 40200, 41500, 42800],
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
    
    if (lossCtx && typeof Chart !== 'undefined') {
      new Chart(lossCtx, {
        type: 'line',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [{
            data: [3.1, 2.9, 2.8, 2.5, 2.3],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
    
    if (turnoverCtx && typeof Chart !== 'undefined') {
      new Chart(turnoverCtx, {
        type: 'line',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [{
            data: [5.7, 5.4, 5.1, 4.8, 4.5],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
  }

  // Page name mapping for new pages
  const extendedPageNames = { ...pageNames };

  // Initialize Health Radar Chart
  function initHealthRadarChart() {
    const ctx = document.getElementById('healthRadarChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (healthRadarChart) healthRadarChart.destroy();

    healthRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['流量健康度', '评分健康度', '营收健康度', '运营健康度', '增长健康度'],
        datasets: [{
          label: '本店',
          data: [82, 85, 78, 72, 68],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#7C3AED'
        }, {
          label: '行业均值',
          data: [75, 78, 72, 70, 65],
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#06B6D4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, display: false },
            grid: { color: '#E2E8F0' },
            pointLabels: {
              font: { size: 11 },
              color: '#64748B'
            }
          }
        }
      }
    });
  }

  // Initialize Report Trend Chart
  function initReportTrendChart() {
    const ctx = document.getElementById('reportTrendChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (reportTrendChart) reportTrendChart.destroy();

    reportTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '本周',
          data: [16500, 17200, 15800, 18900, 20100, 22500, 19800],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: '上周',
          data: [15000, 15800, 16200, 17500, 18500, 21000, 18200],
          borderColor: '#94A3B8',
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          fill: true,
          tension: 0.4,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/1000) + 'k' } }
        }
      }
    });
  }

  // Workflow Tab Switching
  const workflowTabs = document.querySelectorAll('.workflow-tab');
  const workflowPanels = document.querySelectorAll('.workflow-panel');

  workflowTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetWorkflow = tab.dataset.workflow;
      workflowTabs.forEach(t => t.classList.toggle('active', t.dataset.workflow === targetWorkflow));
      workflowPanels.forEach(p => p.classList.toggle('active', p.id === 'workflow' + targetWorkflow.charAt(0).toUpperCase() + targetWorkflow.slice(1)));
      lucide.createIcons();
    });
  });

  // Report Template Selection
  const reportTemplates = document.querySelectorAll('.report-template-card');
  reportTemplates.forEach(template => {
    template.addEventListener('click', () => {
      reportTemplates.forEach(t => t.classList.toggle('active', t === template));
    });
  });

  // Export Format Selection
  const exportOptions = document.querySelectorAll('.export-option');
  exportOptions.forEach(option => {
    option.addEventListener('click', () => {
      exportOptions.forEach(o => o.classList.toggle('active', o === option));
    });
  });

  // Calendar Day Selection
  const calendarDays = document.querySelectorAll('.calendar-day');
  const taskDetail = document.getElementById('calendarTaskDetail');
  calendarDays.forEach(day => {
    day.addEventListener('click', () => {
      calendarDays.forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
      // Update task detail date
      const dateEl = taskDetail?.querySelector('.task-detail-date');
      if (dateEl && day.textContent.trim()) {
        dateEl.textContent = day.textContent.includes('5月') ? day.textContent : `5月${day.textContent}`;
      }
    });
  });

  // Update switchPage function to handle new pages
  const originalSwitchPage = switchPage;
  switchPage = function(page) {
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
      breadcrumbText.textContent = extendedPageNames[page] || '运营概览';
    }
    
    // Initialize charts when entering specific pages
    if (page === 'inventory') {
      setTimeout(initInventoryCharts, 100);
    }
    if (page === 'health') {
      setTimeout(initHealthRadarChart, 100);
    }
    if (page === 'report') {
      setTimeout(initReportTrendChart, 100);
    }
    if (page === 'location') {
      setTimeout(initLocationFlowChart, 100);
    }
    if (page === 'journey') {
      setTimeout(initJourneyInteractions, 100);
    }
    if (page === 'creation') {
      setTimeout(initCreationInteractions, 100);
    }
    // New pages initialization
    if (page === 'supply') {
      setTimeout(initSupplyCostChart, 100);
    }
    if (page === 'member') {
      setTimeout(initMemberRfmChart, 100);
    }
    if (page === 'sentiment') {
      setTimeout(initSentimentCharts, 100);
    }
    if (page === 'pricing') {
      setTimeout(initElasticityChart, 100);
    }
    // New system pages initialization
    if (page === 'alert') {
      setTimeout(initAlertTypeChart, 100);
    }
    if (page === 'inspection') {
      setTimeout(initInspectionTrendChart, 100);
    }
    if (page === 'datalab') {
      setTimeout(initDatalabCompareChart, 100);
    }
    // Competitor page initialization
    if (page === 'competitor') {
      setTimeout(initCompetitorCharts, 100);
    }
    // AI洞察日报初始化
    if (page === 'aidaily') {
      setTimeout(initAidaily, 100);
    }
  };

  // ============================================
  // NEW PAGES CHARTS INITIALIZATION
  // ============================================

  // Supply Chain Cost Chart
  function initSupplyCostChart() {
    const ctx = document.getElementById('supplyCostChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月'],
        datasets: [{
          label: '肉类',
          data: [18000, 18500, 19200, 19800, 20100],
          backgroundColor: '#7C3AED',
          borderRadius: 4
        }, {
          label: '蔬菜',
          data: [8500, 8200, 8800, 9200, 9500],
          backgroundColor: '#10B981',
          borderRadius: 4
        }, {
          label: '调料',
          data: [5800, 5600, 5900, 6100, 6200],
          backgroundColor: '#06B6D4',
          borderRadius: 4
        }, {
          label: '其他',
          data: [5200, 4800, 5300, 5400, 7000],
          backgroundColor: '#F59E0B',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/10000) + '万' } }
        }
      }
    });
  }

  // Member RFM Pie Chart
  function initMemberRfmChart() {
    const ctx = document.getElementById('memberRfmPieChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['高价值', '潜力', '新客', '流失'],
        datasets: [{
          data: [35, 28, 22, 15],
          backgroundColor: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } }
      }
    });
  }

  // Sentiment Charts
  function initSentimentCharts() {
    // Sentiment Trend Chart
    const trendCtx = document.getElementById('sentimentTrendChart');
    if (trendCtx && typeof Chart !== 'undefined') {
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          datasets: [{
            label: '正面',
            data: [85, 87, 88, 89, 90, 88, 89],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }, {
            label: '中性',
            data: [10, 9, 8, 8, 7, 8, 8],
            borderColor: '#94A3B8',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            fill: true,
            tension: 0.4
          }, {
            label: '负面',
            data: [5, 4, 4, 3, 3, 4, 3],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 } } },
            y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => v + '%', font: { size: 9 } } }
          }
        }
      });
    }

    // Sentiment Source Chart
    const sourceCtx = document.getElementById('sentimentSourceChart');
    if (sourceCtx && typeof Chart !== 'undefined') {
      new Chart(sourceCtx, {
        type: 'doughnut',
        data: {
          labels: ['美团', '大众点评', '抖音', '小红书'],
          datasets: [{
            data: [35, 28, 22, 15],
            backgroundColor: ['#00B7FF', '#FF6B00', '#FE2C55', '#FF6633'],
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
  }

  // Elasticity Chart
  function initElasticityChart() {
    const ctx = document.getElementById('elasticityChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['¥38', '¥48', '¥58', '¥68', '¥78', '¥88'],
        datasets: [{
          label: '销量',
          data: [120, 95, 72, 52, 38, 28],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: '营收',
          data: [4560, 4560, 4176, 3536, 2964, 2464],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { 
            grid: { color: '#E2E8F0' }, 
            ticks: { font: { size: 10 } },
            title: { display: true, text: '销量', font: { size: 10 } }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { callback: v => '¥' + v, font: { size: 10 } },
            title: { display: true, text: '营收', font: { size: 10 } }
          }
        }
      }
    });
  }

  // Alert Type Pie Chart
  let alertTypeChart = null;
  function initAlertTypeChart() {
    const ctx = document.getElementById('alertTypeChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (alertTypeChart) alertTypeChart.destroy();

    alertTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['库存不足', '差评预警', '竞品异动', '设备故障', '客流异常', '员工缺勤'],
        datasets: [{
          data: [25, 30, 15, 12, 10, 8],
          backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#10B981', '#64748B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, padding: 8, font: { size: 10 } }
          }
        }
      }
    });
  }

  // Inspection Trend Chart
  let inspectionTrendChart = null;
  function initInspectionTrendChart() {
    const ctx = document.getElementById('inspectionTrendChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (inspectionTrendChart) inspectionTrendChart.destroy();

    inspectionTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
          label: '巡检评分',
          data: [85, 87, 88, 90, 91, 92],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7C3AED'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#E2E8F0' }, min: 80, max: 100, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Datalab Compare Chart
  let datalabCompareChart = null;
  function initDatalabCompareChart() {
    const ctx = document.getElementById('datalabCompareChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (datalabCompareChart) datalabCompareChart.destroy();

    datalabCompareChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['第1周', '第2周', '第3周', '第4周'],
        datasets: [{
          label: '北京旗舰店',
          data: [48500, 51200, 53800, 56200],
          backgroundColor: '#7C3AED',
          borderRadius: 4
        }, {
          label: '上海徐汇店',
          data: [42800, 44500, 46200, 48100],
          backgroundColor: '#06B6D4',
          borderRadius: 4
        }, {
          label: '广州天河店',
          data: [38900, 40200, 41800, 43500],
          backgroundColor: '#10B981',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#E2E8F0' }, ticks: { callback: v => '¥' + (v/10000) + '万', font: { size: 10 } } }
        }
      }
    });
  }

  // ============================================
  // COMPETITOR PAGE CHARTS - 竞品监控图表
  // ============================================

  let competitorRadarChart = null;
  let marketShareChart = null;

  function initCompetitorCharts() {
    initCompetitorRadarChart();
    initMarketShareChart();
    // compSentimentTrendChart在review tab显示时初始化
    if (document.getElementById('compReview')?.classList.contains('active')) {
      initSentimentTrendChart('compSentimentTrendChart');
    }
  }

  // 竞品雷达图 - 多维度能力对比（竞品页使用）
  let compRadarChart = null;
  
  function initCompetitorRadarChart() {
    const radarData = {
      labels: ['口味', '服务', '环境', '性价比', '品牌力', '创新力'],
      datasets: [{
        label: '本店',
        data: [78, 75, 82, 88, 65, 85],
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.25)',
        borderWidth: 3,
        pointBackgroundColor: '#7C3AED',
        pointRadius: 4
      }, {
        label: '海底捞',
        data: [82, 95, 88, 60, 92, 75],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#F59E0B',
        pointRadius: 3
      }, {
        label: '小龙坎',
        data: [85, 78, 72, 80, 70, 72],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#06B6D4',
        pointRadius: 3
      }]
    };
    
    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, display: false },
          grid: { color: '#E2E8F0' },
          pointLabels: {
            font: { size: 11, weight: '500' },
            color: '#64748B'
          }
        }
      }
    };
    
    // 竞品页面雷达图使用 compRadarChart
    const dsCtx = document.getElementById('compRadarChart');
    if (dsCtx && typeof Chart !== 'undefined') {
      if (compRadarChart) compRadarChart.destroy();
      compRadarChart = new Chart(dsCtx, {
        type: 'radar',
        data: radarData,
        options: radarOptions
      });
    }
  }

  // 数据大屏竞品雷达图
  let dsScreenRadarChart = null;
  
  function initDataScreenRadarChart() {
    const radarData = {
      labels: ['口味', '服务', '环境', '性价比', '品牌力', '创新力'],
      datasets: [{
        label: '本店',
        data: [78, 75, 82, 88, 65, 85],
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.25)',
        borderWidth: 3,
        pointBackgroundColor: '#7C3AED',
        pointRadius: 4
      }, {
        label: '海底捞',
        data: [82, 95, 88, 60, 92, 75],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#F59E0B',
        pointRadius: 3
      }, {
        label: '小龙坎',
        data: [85, 78, 72, 80, 70, 72],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#06B6D4',
        pointRadius: 3
      }]
    };
    
    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, display: false },
          grid: { color: '#E2E8F0' },
          pointLabels: {
            font: { size: 11, weight: '500' },
            color: '#64748B'
          }
        }
      }
    };
    
    // 数据大屏雷达图使用 dsScreenRadarChart
    const dsCtx = document.getElementById('dsScreenRadarChart');
    if (dsCtx && typeof Chart !== 'undefined') {
      if (dsScreenRadarChart) dsScreenRadarChart.destroy();
      dsScreenRadarChart = new Chart(dsCtx, {
        type: 'radar',
        data: radarData,
        options: radarOptions
      });
    }
  }

  window.initDataScreenRadarChart = initDataScreenRadarChart;
  window.dsScreenRadarChart = dsScreenRadarChart;

  // 市场份额环形图
  function initMarketShareChart() {
    const ctx = document.getElementById('marketShareChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (marketShareChart) marketShareChart.destroy();

    marketShareChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['老码头火锅', '海底捞', '小龙坎', '巴奴毛肚', '其他'],
        datasets: [{
          data: [24, 32, 18, 14, 12],
          backgroundColor: ['#7C3AED', '#F59E0B', '#06B6D4', '#10B981', '#94A3B8'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }

  // 口碑趋势迷你折线图 - 支持指定canvas ID
  const sentimentTrendCharts = {};
  function initSentimentTrendChart(canvasId) {
    const targetId = canvasId || 'sentimentTrendChart';
    const ctx = document.getElementById(targetId);
    if (!ctx || typeof Chart === 'undefined') return;
    
    // Ensure canvas has dimensions (fix for hidden container)
    if (ctx.clientWidth === 0 || ctx.clientHeight === 0) {
      const parent = ctx.parentElement;
      if (parent) {
        ctx.width = parent.offsetWidth || 200;
        ctx.height = parent.offsetHeight || 50;
      } else {
        ctx.width = 200;
        ctx.height = 50;
      }
    }
    
    if (sentimentTrendCharts[targetId]) sentimentTrendCharts[targetId].destroy();

    sentimentTrendCharts[targetId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          data: [4.5, 4.5, 4.6, 4.6, 4.7, 4.8, 4.7],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: '#7C3AED'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false, min: 4.0, max: 5.0 }
        }
      }
    });
  }

  // ============================================
  // INIT COMMAND PALETTE
  // ============================================
  function initCommandPalette() {
    // 命令面板已经通过 DOMContentLoaded 事件初始化
    // 此函数用于确保在页面切换时重新绑定事件
    if (commandPaletteOverlay) {
      // 绑定 Ctrl+K / Cmd+K 快捷键
      document.removeEventListener('keydown', handleCommandPaletteKeydown);
      document.addEventListener('keydown', handleCommandPaletteKeydown);
    }
  }

  // 命令面板键盘事件处理
  function handleCommandPaletteKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (commandPaletteOverlay?.classList.contains('hidden')) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
    }

    // 命令面板内键盘导航
    if (commandPaletteOverlay && !commandPaletteOverlay.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        closeCommandPalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        renderCommandPalette(commandPaletteInput?.value || '');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderCommandPalette(commandPaletteInput?.value || '');
      } else if (e.key === 'Enter' && currentResults[selectedIndex]) {
        e.preventDefault();
        const item = currentResults[selectedIndex];
        executeCommand(item.type, item.id);
      }
    }
  }

  // ============================================
  // INIT AI DAILY (AI洞察日报)
  // ============================================
  function initAidaily() {
    const aiDailySection = document.getElementById('sectionAidaily');
    if (!aiDailySection) return;

    const aiDailyDate = document.getElementById('aiDailyDate');
    const aiDailyStatus = document.getElementById('aiDailyStatus');
    const aiSummaryContent = aiDailySection.querySelector('.ai-summary-content');
    const aiChangeCards = aiDailySection.querySelectorAll('.ai-change-card');
    const aiActionItems = aiDailySection.querySelectorAll('.ai-action-item');
    const aiHistoryItems = aiDailySection.querySelectorAll('.ai-history-item');
    const aiExportBtn = document.getElementById('aiExportPdfBtn');

    // 1. 日期显示（2026年当前日期）
    if (aiDailyDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      aiDailyDate.textContent = `${year}年${month}月${day}日`;
    }

    // 2. AI生成状态动画
    if (aiDailyStatus) {
      // 模拟AI生成过程
      const generatingStatus = aiDailyStatus.querySelector('.generating');
      const readyStatus = aiDailyStatus.parentElement?.querySelector('.ready');
      
      if (generatingStatus) {
        setTimeout(() => {
          generatingStatus.classList.add('hidden');
          if (readyStatus) {
            readyStatus.classList.remove('hidden');
          }
        }, 2000);
      }
    }

    // 3. 摘要内容打字机效果
    if (aiSummaryContent) {
      const originalText = aiSummaryContent.textContent || '';
      aiSummaryContent.textContent = '';
      aiSummaryContent.style.opacity = '1';
      
      let charIndex = 0;
      function typeChar() {
        if (charIndex < originalText.length) {
          aiSummaryContent.textContent += originalText[charIndex];
          charIndex++;
          setTimeout(typeChar, 30 + Math.random() * 20);
        }
      }
      
      setTimeout(typeChar, 500);
    }

    // 4. 关键变化卡片动画
    aiChangeCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 300 + index * 150);
    });

    // 5. 行动建议优先级标签交互
    aiActionItems.forEach(item => {
      const priorityTag = item.querySelector('.priority-tag');
      const actionBtn = item.querySelector('.ai-action-btn');
      
      if (priorityTag) {
        priorityTag.addEventListener('mouseenter', () => {
          priorityTag.style.transform = 'scale(1.1)';
        });
        priorityTag.addEventListener('mouseleave', () => {
          priorityTag.style.transform = 'scale(1)';
        });
      }
      
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          actionBtn.textContent = '已处理';
          actionBtn.style.background = 'var(--success)';
          actionBtn.style.color = 'white';
          item.style.opacity = '0.6';
        });
      }
    });

    // 6. 历史日报列表展开/收起
    aiHistoryItems.forEach(item => {
      const expandIcon = item.querySelector('.ai-history-expand');
      const detail = item.querySelector('.ai-history-detail');
      
      if (expandIcon && detail) {
        expandIcon.style.cursor = 'pointer';
        expandIcon.addEventListener('click', () => {
          const isExpanded = item.classList.contains('expanded');
          item.classList.toggle('expanded');
          
          if (!isExpanded) {
            // 展开
            detail.style.maxHeight = detail.scrollHeight + 'px';
            detail.style.opacity = '1';
            expandIcon.style.transform = 'rotate(180deg)';
          } else {
            // 收起
            detail.style.maxHeight = '0';
            detail.style.opacity = '0';
            expandIcon.style.transform = 'rotate(0deg)';
          }
        });
      }
    });

    // 7. 导出PDF按钮点击动画
    if (aiExportBtn) {
      aiExportBtn.addEventListener('click', () => {
        aiExportBtn.classList.add('loading');
        aiExportBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> 导出中...';
        lucide.createIcons();
        
        // 模拟导出过程
        setTimeout(() => {
          aiExportBtn.classList.remove('loading');
          aiExportBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> 导出成功';
          lucide.createIcons();
          
          setTimeout(() => {
            aiExportBtn.innerHTML = '<i data-lucide="file-down" class="w-5 h-5"></i> 导出PDF报告';
            lucide.createIcons();
          }, 2000);
        }, 1500);
      });
    }

    // 添加CSS样式（如果还没有）
    const style = document.createElement('style');
    if (!document.getElementById('aidaily-animations')) {
      style.id = 'aidaily-animations';
      style.textContent = `
        .ai-summary-content {
          min-height: 60px;
          line-height: 1.8;
        }
        .ai-history-detail {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .ai-history-item.expanded .ai-history-detail {
          max-height: 100px;
        }
        .ai-history-expand {
          transition: transform 0.3s ease;
        }
        .ai-export-btn.loading {
          pointer-events: none;
          opacity: 0.8;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  window.initAidaily = initAidaily;

  console.log('店赢OS v10.0 - 新增4项系统功能初始化完成');
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

// 全国门店分布图（ECharts中国地图）
let chinaMapChart = null;

function initChinaMap() {
  try {
    const container = document.getElementById('chinaMapChart');
    if (!container || typeof echarts === 'undefined') return;
    
    if (chinaMapChart) chinaMapChart.dispose();
    chinaMapChart = echarts.init(container, null, { renderer: 'canvas' });
    
    // 显示加载动画
    chinaMapChart.showLoading({
      text: '地图加载中...',
      color: '#7C3AED',
      textColor: '#94A3B8',
      maskColor: 'rgba(15, 23, 42, 0.8)',
      zlevel: 0
    });
    
    const storeData = [
      { name: '北京旗舰店', value: [116.46, 39.92, 28.6], rating: 4.9, orders: 1245, type: '旗舰' },
      { name: '上海直营店', value: [121.48, 31.22, 22.4], rating: 4.8, orders: 986, type: '直营' },
      { name: '广州直营店', value: [113.23, 23.16, 20.8], rating: 4.8, orders: 912, type: '直营' },
      { name: '深圳加盟店', value: [114.07, 22.62, 18.2], rating: 4.7, orders: 824, type: '加盟' },
      { name: '成都加盟店', value: [104.06, 30.67, 16.5], rating: 4.7, orders: 756, type: '加盟' },
      { name: '杭州加盟店', value: [120.19, 30.26, 15.8], rating: 4.6, orders: 698, type: '加盟' },
      { name: '武汉加盟店', value: [114.31, 30.52, 14.2], rating: 4.6, orders: 645, type: '加盟' },
      { name: '南京加盟店', value: [118.78, 32.04, 12.6], rating: 4.5, orders: 578, type: '加盟' }
    ];
    
    // 主数据源：阿里云 DataV GeoJSON
    const primarySource = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
    // 备用数据源：unpkg CDN
    const fallbackSource = 'https://unpkg.com/echarts@5.4.3/map/json/china.json';
    // 内联备用GeoJSON（简化版，只包含省份轮廓）
    const inlineChinaGeoJson = {
      "type": "FeatureCollection",
      "features": [
        {"type":"Feature","properties":{"name":"北京","cp":[116.46,39.92]},"geometry":{"type":"Polygon","coordinates":[[[116.2,39.8],[116.5,39.8],[116.5,40.1],[116.2,40.1],[116.2,39.8]]]}},
        {"type":"Feature","properties":{"name":"上海","cp":[121.48,31.22]},"geometry":{"type":"Polygon","coordinates":[[[121.1,31.0],[121.7,31.0],[121.7,31.4],[121.1,31.4],[121.1,31.0]]]}},
        {"type":"Feature","properties":{"name":"广东","cp":[113.23,23.16]},"geometry":{"type":"Polygon","coordinates":[[[109.5,20.2],[117.2,20.2],[117.2,25.5],[109.5,25.5],[109.5,20.2]]]}},
        {"type":"Feature","properties":{"name":"四川","cp":[104.06,30.67]},"geometry":{"type":"Polygon","coordinates":[[[97.5,26.0],[108.5,26.0],[108.5,34.3],[97.5,34.3],[97.5,26.0]]]}},
        {"type":"Feature","properties":{"name":"浙江","cp":[120.19,30.26]},"geometry":{"type":"Polygon","coordinates":[[[118.0,27.0],[123.0,27.0],[123.0,31.0],[118.0,31.0],[118.0,27.0]]]}},
        {"type":"Feature","properties":{"name":"江苏","cp":[118.78,32.04]},"geometry":{"type":"Polygon","coordinates":[[[116.6,31.0],[122.0,31.0],[122.0,35.0],[116.6,35.0],[116.6,31.0]]]}},
        {"type":"Feature","properties":{"name":"湖北","cp":[114.31,30.52]},"geometry":{"type":"Polygon","coordinates":[[[108.5,29.0],[116.6,29.0],[116.6,33.0],[108.5,33.0],[108.5,29.0]]]}},
        {"type":"Feature","properties":{"name":"全国","cp":[104.5,35.5]},"geometry":{"type":"Polygon","coordinates":[[[73.0,18.0],[135.0,18.0],[135.0,54.0],[73.0,54.0],[73.0,18.0]]]}}
      ]
    };
    
    // 加载地图数据（主源 + 备用源 + 内联）
    function loadMapData(url, isFallback = false) {
      return fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        });
    }
    
    // 使用内联备用地图数据初始化
    function initWithInlineMap() {
      chinaMapChart.hideLoading();
      echarts.registerMap('china', inlineChinaGeoJson);
      renderStoreMarkers(inlineChinaGeoJson);
    }
    
    // 渲染门店标记
    function renderStoreMarkers(chinaJson) {
      const flagship = storeData.filter(s => s.type === '旗舰');
      const direct = storeData.filter(s => s.type === '直营');
      const franchise = storeData.filter(s => s.type === '加盟');
      
      chinaMapChart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(15,23,42,0.95)',
          borderColor: 'rgba(124,58,237,0.5)',
          borderWidth: 1,
          textStyle: { color: '#E2E8F0', fontSize: 12 },
          formatter: function(params) {
            if (params.seriesType === 'effectScatter') {
              const d = params.data;
              return '<b>' + d.name + '</b><br/>' +
                     '类型：' + d.storeType + '<br/>' +
                     '月营收：¥' + d.value[2] + '万<br/>' +
                     '评分：★ ' + d.rating + '<br/>' +
                     '月订单：' + d.orders + '单';
            }
            return params.name;
          }
        },
        geo: {
          map: 'china',
          roam: false,
          zoom: 1.2,
          center: [104.5, 35.5],
          label: { show: false },
          itemStyle: {
            areaColor: 'rgba(30,27,75,0.6)',
            borderColor: 'rgba(6,182,212,0.3)',
            borderWidth: 0.8
          },
          emphasis: {
            itemStyle: {
              areaColor: 'rgba(124,58,237,0.3)',
              borderColor: 'rgba(124,58,237,0.6)',
              borderWidth: 1.5
            },
            label: { show: false }
          }
        },
        series: [
          {
            name: '旗舰',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: flagship.map(s => ({
              name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type
            })),
            symbolSize: 18,
            rippleEffect: { brushType: 'stroke', scale: 4, period: 3 },
            itemStyle: { color: '#7C3AED', shadowBlur: 10, shadowColor: '#7C3AED' },
            label: {
              show: true, formatter: '{b}', position: 'right',
              color: '#E2E8F0', fontSize: 9, fontWeight: 500
            }
          },
          {
            name: '直营',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: direct.map(s => ({
              name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type
            })),
            symbolSize: 12,
            rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
            itemStyle: { color: '#06B6D4', shadowBlur: 8, shadowColor: '#06B6D4' },
            label: {
              show: true, formatter: '{b}', position: 'right',
              color: '#E2E8F0', fontSize: 8
            }
          },
          {
            name: '加盟',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: franchise.map(s => ({
              name: s.name, value: s.value, rating: s.rating, orders: s.orders, storeType: s.type
            })),
            symbolSize: 10,
            rippleEffect: { brushType: 'stroke', scale: 2.5, period: 5 },
            itemStyle: { color: '#10B981', shadowBlur: 6, shadowColor: '#10B981' },
            label: {
              show: true, formatter: '{b}', position: 'right',
              color: '#E2E8F0', fontSize: 8
            }
          }
        ]
      });
    }
    
    // 先尝试主源，失败后尝试备用源，最后使用内联数据
    loadMapData(primarySource)
      .catch(() => {
        console.warn('主地图数据源加载失败，尝试备用源...');
        return loadMapData(fallbackSource, true);
      })
      .catch(() => {
        console.warn('备用地图数据源加载失败，使用内联备用数据...');
        return null;
      })
      .then(chinaJson => {
        if (chinaJson) {
          chinaMapChart.hideLoading();
          echarts.registerMap('china', chinaJson);
          renderStoreMarkers(chinaJson);
        } else {
          // 使用内联备用地图
          initWithInlineMap();
        }
      })
      .catch(err => {
        console.error('地图数据加载失败:', err);
        chinaMapChart.hideLoading();
        // 使用内联备用地图
        initWithInlineMap();
      });
    
    window.addEventListener('resize', () => { chinaMapChart && chinaMapChart.resize(); });
  } catch (err) {
    console.error('initChinaMap初始化失败:', err);
  }
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
    initDataScreenRadarChart(); // 数据大屏竞品雷达图
    initForecastChart(); // AI预测图
  }, 100);
  
  // 初始化Tab
  initDSTabs();
  
  // 初始化升级功能
  initFlipCards();
  initChatEnhancements();
  initStrategyExecute();
  initHealthRoadmap();
  
  // 初始化新闻滚动
  initNewsTicker();
  
  // 初始化全国门店分布图（ECharts）
  setTimeout(initChinaMap, 300);
  
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
  const bellBtn = document.getElementById('notificationBtn');
  const dropdown = document.getElementById('notificationDropdown');
  const markReadBtn = document.querySelector('.notification-mark-read');
  
  if (!bellBtn || !dropdown) return;
  
  const notifications = [
    { type: 'danger', title: '差评预警', content: '您有1条新差评待处理', time: '3分钟前', read: false },
    { type: 'success', title: 'AI处理完成', content: 'AI已自动回复3条差评', time: '15分钟前', read: false },
    { type: 'info', title: 'VIP到店', content: 'VIP客户王女士已到店', time: '30分钟前', read: true },
    { type: 'warning', title: '营收达标', content: '今日营收已突破¥8,000', time: '1小时前', read: true }
  ];
  
  function renderNotifications() {
    const list = dropdown.querySelector('.notification-list');
    if (!list) return;
    
    list.innerHTML = notifications.map(n => 
      '<div class="notification-item ' + (n.read ? '' : 'unread') + '" data-type="' + n.type + '">' +
        '<div class="notification-icon ' + n.type + '">' +
          '<i data-lucide="' + (n.type === 'danger' ? 'alert-circle' : n.type === 'success' ? 'check-circle' : n.type === 'warning' ? 'trending-up' : 'info') + '" class="w-4 h-4"></i>' +
        '</div>' +
        '<div class="notification-content">' +
          '<div class="notification-text">' + n.title + '：' + n.content + '</div>' +
          '<div class="notification-time">' + n.time + '</div>' +
        '</div>' +
      '</div>'
    ).join('');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = bellBtn.querySelector('.topbar-btn-badge');
    if (badge) {
      badge.textContent = unreadCount;
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
  const dropdown = document.getElementById('batchDropdown');
  
  if (!batchBtn || !dropdown) return;
  
  batchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (!batchBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  const operationBtns = document.querySelectorAll('.batch-dropdown-item');
  operationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      console.log('执行批量操作:', action);
      showToast('已执行批量操作：' + (action === 'reply' ? '批量回复差评' : action === 'price' ? '批量调价' : '批量同步'));
      dropdown.classList.add('hidden');
    });
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
    initDataScreenRadarChart();
    initForecastChart();
    initDataComparison();
    initLogFilters();
    initAlertCenter();
    initAIPayDemo();
    initKnowledgeLibrary();
    initPublishFeature();
    initHealthReport();
    
    console.log('店赢OS v9 新功能初始化完成');
  }, 500);
});

// ============================================
// 15. AI付模拟收款
// ============================================
function initAIPayDemo() {
  const simulateBtn = document.getElementById('simulateAipayBtn');
  const animation = document.getElementById('paymentAnimation');
  
  if (!simulateBtn || !animation) return;
  
  simulateBtn.addEventListener('click', () => {
    animation.classList.remove('hidden');
    animation.style.display = 'block';
    
    const steps = ['step1', 'step2', 'step3', 'step4'];
    
    steps.forEach((stepId, index) => {
      setTimeout(() => {
        steps.forEach(s => {
          document.getElementById(s)?.classList.add('hidden');
        });
        document.getElementById(stepId)?.classList.remove('hidden');
      }, index * 1200);
    });
    
    setTimeout(() => {
      simulateBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> 收款成功';
      simulateBtn.classList.add('success');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 4800);
  });
}

// ============================================
// 16. 知识库管理
// ============================================
function initKnowledgeLibrary() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const knowledgeItems = document.querySelectorAll('.knowledge-item');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      knowledgeItems.forEach(item => {
        if (category === 'all') {
          item.style.display = 'block';
        } else {
          const tag = item.querySelector('.knowledge-tag');
          item.style.display = tag?.classList.contains(category) ? 'block' : 'none';
        }
      });
    });
  });
}

// ============================================
// 17. 一键发文功能
// ============================================
function initPublishFeature() {
  const publishBtn = document.getElementById('publishBtn');
  
  if (!publishBtn) return;
  
  publishBtn.addEventListener('click', () => {
    showToast('正在生成AI文案并同步至抖音/小红书/视频号...');
    
    setTimeout(() => {
      showToast('已发布至3个平台：抖音、小红书、视频号');
    }, 2000);
  });
}

// ============================================
// 18. 门店体检报告
// ============================================
function initHealthReport() {
  const healthBtn = document.getElementById('healthReportBtn');
  
  if (!healthBtn) return;
  
  healthBtn.addEventListener('click', () => {
    const healthScore = Math.floor(Math.random() * 20) + 80;
    const scores = {
      traffic: Math.floor(Math.random() * 20) + 80,
      rating: Math.floor(Math.random() * 20) + 80,
      revenue: Math.floor(Math.random() * 20) + 80,
      operation: Math.floor(Math.random() * 20) + 80
    };
    
    const reportHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #7C3AED; margin-bottom: 30px;">门店健康度体检报告</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">生成时间：2026年5月20日</p>
        
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#7C3AED ${healthScore * 3.6}deg, #E5E7EB 0deg); margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <div style="width: 120px; height: 120px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; flex-direction: column;">
              <span style="font-size: 36px; font-weight: bold; color: #7C3AED;">${healthScore}</span>
              <span style="font-size: 12px; color: #666;">健康分</span>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
          <div style="padding: 20px; background: #F3E8FF; border-radius: 12px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #7C3AED;">${scores.traffic}</div>
            <div style="font-size: 14px; color: #666;">流量健康</div>
          </div>
          <div style="padding: 20px; background: #D1FAE5; border-radius: 12px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #10B981;">${scores.rating}</div>
            <div style="font-size: 14px; color: #666;">口碑健康</div>
          </div>
          <div style="padding: 20px; background: #E0F2FE; border-radius: 12px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #06B6D4;">${scores.revenue}</div>
            <div style="font-size: 14px; color: #666;">营收健康</div>
          </div>
          <div style="padding: 20px; background: #FEF3C7; border-radius: 12px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #F59E0B;">${scores.operation}</div>
            <div style="font-size: 14px; color: #666;">运营健康</div>
          </div>
        </div>
        
        <div style="margin-top: 30px;">
          <h2 style="color: #333; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">优化建议</h2>
          <ul style="color: #666; line-height: 2;">
            <li>午市客流有提升空间，建议优化11:30-13:00时段的推广策略</li>
            <li>复购率略低于行业均值，建议增加会员积分体系</li>
            <li>差评主要集中在服务态度，建议加强员工培训</li>
          </ul>
        </div>
      </div>
    `;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = reportHTML;
    printContent.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px; background: white;';
    document.body.appendChild(printContent);
    window.print();
    setTimeout(() => { document.body.removeChild(printContent); }, 100);
    
    showToast('体检报告已生成');
  });
}

// ============================================
// 19. 日期范围选择器
// ============================================
function initDateRangePicker() {
  const dateStart = document.getElementById('dateStart');
  const dateEnd = document.getElementById('dateEnd');
  
  if (!dateStart || !dateEnd) return;
  
  // 设置默认日期范围
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  dateEnd.value = today.toISOString().split('T')[0];
  dateStart.value = weekAgo.toISOString().split('T')[0];
  
  dateStart.addEventListener('change', () => {
    console.log('日期范围更新:', dateStart.value, '至', dateEnd.value);
    showToast('已更新数据范围');
  });
  
  dateEnd.addEventListener('change', () => {
    console.log('日期范围更新:', dateStart.value, '至', dateEnd.value);
    showToast('已更新数据范围');
  });
}


// ============================================
// NEW FEATURES - v10 (5项差异化功能)
// ============================================

// Initialize Location Flow Chart
function initLocationFlowChart() {
  const ctx = document.getElementById('locationFlowChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (locationFlowChart) locationFlowChart.destroy();

  locationFlowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['7时', '9时', '11时', '13时', '15时', '17时', '19时', '21时', '23时'],
      datasets: [{
        label: '客流指数',
        data: [20, 45, 85, 75, 40, 95, 120, 90, 35],
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#7C3AED',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: '#94A3B8', font: { size: 10 } }
        },
        y: { 
          grid: { color: '#E2E8F0' },
          ticks: { display: false },
          beginAtZero: true
        }
      }
    }
  });
}

// Initialize Journey Interactions
function initJourneyInteractions() {
  const journeyTabs = document.querySelectorAll('.journey-tab');
  const journeyPanels = document.querySelectorAll('.journey-tab-panel');

  journeyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.journeyTab;
      journeyTabs.forEach(t => t.classList.toggle('active', t.dataset.journeyTab === targetTab));
      journeyPanels.forEach(p => p.classList.toggle('active', p.id === 'journey' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)));
    });
  });
}

// Initialize Creation Interactions
function initCreationInteractions() {
  const creationToggleBtns = document.querySelectorAll('.creation-toggle-btn');
  const creationTypeBtns = document.querySelectorAll('.creation-type-btn');
  const creationGenerateBtn = document.getElementById('creationGenerateBtn');

  creationToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      creationToggleBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  creationTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      creationTypeBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  creationGenerateBtn?.addEventListener('click', () => {
    const keyword = document.getElementById('creationKeyword')?.value;
    if (keyword) {
      alert('AI正在为您生成内容，请稍候...');
    }
  });
}

// ============================================
// 门店切换功能
// ============================================

// 8个门店数据
const storeData = {
  'beijing-flagship': {
    name: '老码头火锅 - 北京旗舰店',
    shortName: '老码头火锅',
    type: '旗舰',
    monthlyRevenue: 28.6,
    monthlyOrders: 1247,
    rating: 4.9,
    repurchaseRate: 38,
    aov: 168,
    aiProcessed: 180
  },
  'shanghai-xuhui': {
    name: '老码头火锅 - 上海徐汇店',
    shortName: '老码头火锅',
    type: '直营',
    monthlyRevenue: 22.4,
    monthlyOrders: 986,
    rating: 4.8,
    repurchaseRate: 35,
    aov: 158,
    aiProcessed: 120
  },
  'guangzhou-tianhe': {
    name: '老码头火锅 - 广州天河店',
    shortName: '老码头火锅',
    type: '直营',
    monthlyRevenue: 20.8,
    monthlyOrders: 912,
    rating: 4.8,
    repurchaseRate: 32,
    aov: 148,
    aiProcessed: 110
  },
  'shenzhen-nanshan': {
    name: '老码头火锅 - 深圳南山店',
    shortName: '老码头火锅',
    type: '加盟',
    monthlyRevenue: 18.2,
    monthlyOrders: 824,
    rating: 4.7,
    repurchaseRate: 30,
    aov: 138,
    aiProcessed: 95
  },
  'chengdu-jinjiang': {
    name: '老码头火锅 - 成都锦江店',
    shortName: '老码头火锅',
    type: '加盟',
    monthlyRevenue: 16.5,
    monthlyOrders: 756,
    rating: 4.7,
    repurchaseRate: 28,
    aov: 128,
    aiProcessed: 88
  },
  'hangzhou-xihu': {
    name: '老码头火锅 - 杭州西湖店',
    shortName: '老码头火锅',
    type: '加盟',
    monthlyRevenue: 15.8,
    monthlyOrders: 698,
    rating: 4.6,
    repurchaseRate: 27,
    aov: 138,
    aiProcessed: 82
  },
  'wuhan-jianghan': {
    name: '老码头火锅 - 武汉江汉店',
    shortName: '老码头火锅',
    type: '直营',
    monthlyRevenue: 14.2,
    monthlyOrders: 645,
    rating: 4.6,
    repurchaseRate: 28,
    aov: 138,
    aiProcessed: 80
  },
  'nanjing-gulou': {
    name: '老码头火锅 - 南京鼓楼店',
    shortName: '老码头火锅',
    type: '加盟',
    monthlyRevenue: 12.6,
    monthlyOrders: 578,
    rating: 4.5,
    repurchaseRate: 25,
    aov: 128,
    aiProcessed: 65
  }
};

// 当前选中的门店ID
let currentStoreId = 'beijing-flagship';

// 数字动画函数
function animateNumber(element, target, isDecimal = false, duration = 600) {
  if (!element) return;
  const start = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    
    const current = start + (target - start) * easeProgress;
    element.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// 更新概览页面的核心数据卡片
function updateOverviewCards(storeId) {
  const store = storeData[storeId];
  if (!store) return;
  
  // 获取概览页面的4个核心数据卡片
  const statCards = document.querySelectorAll('.stat-card-demo');
  if (statCards.length >= 4) {
    // 月营收
    const revenueEl = statCards[0].querySelector('.stat-card-demo-value');
    if (revenueEl) {
      animateNumber(revenueEl, store.monthlyRevenue, true, 600);
      setTimeout(() => { revenueEl.textContent = '¥' + store.monthlyRevenue.toFixed(1) + '万'; }, 600);
    }
    
    // 月订单
    const ordersEl = statCards[1].querySelector('.stat-card-demo-value');
    if (ordersEl) {
      animateNumber(ordersEl, store.monthlyOrders, false, 600);
      setTimeout(() => { ordersEl.textContent = store.monthlyOrders.toLocaleString(); }, 600);
    }
    
    // 评分
    const ratingEl = statCards[2].querySelector('.stat-card-demo-value');
    if (ratingEl) {
      animateNumber(ratingEl, store.rating, true, 600);
      setTimeout(() => { ratingEl.textContent = store.rating.toFixed(1); }, 600);
    }
    
    // 复购率
    const repurchaseEl = statCards[3].querySelector('.stat-card-demo-value');
    if (repurchaseEl) {
      animateNumber(repurchaseEl, store.repurchaseRate, false, 600);
      setTimeout(() => { repurchaseEl.textContent = store.repurchaseRate + '%'; }, 600);
    }
  }
}

// 切换门店
function switchStore(storeId) {
  if (!storeData[storeId]) return;
  
  currentStoreId = storeId;
  const store = storeData[storeId];
  
  // 更新顶栏门店选择器显示
  const storeSelector = document.getElementById('storeSelector');
  const storeTag = document.getElementById('currentStoreTag');
  const storeName = storeSelector?.querySelector('.store-name');
  
  if (storeTag) {
    storeTag.textContent = store.type + '店';
    // 更新tag颜色
    storeTag.className = 'store-tag';
    if (store.type === '旗舰') {
      storeTag.classList.add('tag-flagship');
    } else if (store.type === '直营') {
      storeTag.classList.add('tag-direct');
    } else {
      storeTag.classList.add('tag-franchise');
    }
  }
  
  // 更新下拉菜单选中状态
  const options = document.querySelectorAll('.store-option');
  options.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.store === storeId);
  });
  
  // 同步更新数据大屏的select
  const dsStoreSelect = document.getElementById('storeSelect');
  if (dsStoreSelect) {
    dsStoreSelect.value = storeId;
  }
  
  // 更新概览页面的数据卡片
  updateOverviewCards(storeId);
  
  console.log('切换门店:', store.name);
}

// 初始化顶栏门店选择器
function initStoreSelector() {
  try {
    const storeSelector = document.getElementById('storeSelector');
    const storeDropdown = document.getElementById('storeDropdown');
    
    if (!storeSelector || !storeDropdown) return;
    
    // 点击切换器展开/收起下拉菜单
    storeSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      storeSelector.classList.toggle('active');
    });
    
    // 点击门店选项
    const options = document.querySelectorAll('.store-option');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const storeId = option.dataset.store;
        switchStore(storeId);
        storeSelector.classList.remove('active');
      });
    });
    
    // 点击其他区域关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!storeSelector.contains(e.target)) {
        storeSelector.classList.remove('active');
      }
    });
  } catch (err) {
    console.error('initStoreSelector初始化失败:', err);
  }
}

// 初始化数据大屏门店选择同步
function initDataScreenStoreSync() {
  try {
    const dsStoreSelect = document.getElementById('storeSelect');
    if (!dsStoreSelect) return;
    
    dsStoreSelect.addEventListener('change', () => {
      const storeId = dsStoreSelect.value;
      
      // 同步更新顶栏选择器
      const storeSelector = document.getElementById('storeSelector');
      const storeTag = document.getElementById('currentStoreTag');
      const store = storeData[storeId];
      
      if (store && storeTag) {
        storeTag.textContent = store.type + '店';
        storeTag.className = 'store-tag';
        if (store.type === '旗舰') {
          storeTag.classList.add('tag-flagship');
        } else if (store.type === '直营') {
          storeTag.classList.add('tag-direct');
        } else {
          storeTag.classList.add('tag-franchise');
        }
      }
      
      // 更新下拉菜单选中状态
      const options = document.querySelectorAll('.store-option');
      options.forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.store === storeId);
      });
      
      console.log('数据大屏切换门店:', storeId);
    });
  } catch (err) {
    console.error('initDataScreenStoreSync初始化失败:', err);
  }
}

console.log('店赢OS v10 - 5项差异化功能初始化完成');
console.log('店赢OS - 多门店切换功能已加载');


  // ============================================
  // COMMAND PALETTE (⌘K)
  // ============================================
  const commandPaletteOverlay = document.getElementById('commandPaletteOverlay');
  const commandPalette = document.getElementById('commandPalette');
  const commandPaletteInput = document.getElementById('commandPaletteInput');
  const commandPaletteBody = document.getElementById('commandPaletteBody');
  
  // 命令面板数据
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
      { id: 'member', title: '会员运营', icon: 'heart', desc: '会员数据分析' },
    ],
    actions: [
      { id: 'export-report', title: '导出报告', icon: 'download', desc: '导出运营报告PDF', shortcut: '' },
      { id: 'switch-store', title: '切换门店', icon: 'store', desc: '切换到其他门店', shortcut: '' },
      { id: 'dark-mode', title: '切换深色模式', icon: 'moon', desc: '开启/关闭深色模式', shortcut: 'D' },
      { id: 'refresh', title: '刷新数据', icon: 'refresh-cw', desc: '刷新当前页面数据', shortcut: 'R' },
      { id: 'fullscreen', title: '全屏模式', icon: 'maximize', desc: '进入全屏显示', shortcut: 'F' },
      { id: 'shortcuts', title: '快捷键帮助', icon: 'keyboard', desc: '查看所有快捷键', shortcut: '?' },
    ],
    metrics: [
      { id: 'revenue', title: '月营收', icon: 'wallet', desc: '当前¥12.8万，较上月+12%' },
      { id: 'orders', title: '月订单', icon: 'shopping-cart', desc: '当前1,247单，较上月+8%' },
      { id: 'rating', title: '门店评分', icon: 'star', desc: '当前4.8分，较上月+0.3' },
      { id: 'review', title: '差评数', icon: 'message-circle', desc: '当前0条待处理' },
    ]
  };

  let selectedIndex = 0;
  let currentResults = [];

  function renderCommandPalette(filter = '') {
    const filterLower = filter.toLowerCase();
    
    // 过滤数据
    const filteredPages = commandData.pages.filter(p => 
      p.title.toLowerCase().includes(filterLower) || 
      p.desc.toLowerCase().includes(filterLower)
    );
    const filteredActions = commandData.actions.filter(a => 
      a.title.toLowerCase().includes(filterLower) || 
      a.desc.toLowerCase().includes(filterLower)
    );
    const filteredMetrics = commandData.metrics.filter(m => 
      m.title.toLowerCase().includes(filterLower) || 
      m.desc.toLowerCase().includes(filterLower)
    );

    currentResults = [...filteredPages.map(p => ({...p, type: 'page'})),
                     ...filteredActions.map(a => ({...a, type: 'action'})),
                     ...filteredMetrics.map(m => ({...m, type: 'metric'}))];

    let html = '';

    if (filteredPages.length > 0) {
      html += '<div class="command-palette-section"><div class="command-palette-section-title">页面</div>';
      filteredPages.forEach((item, index) => {
        const iconIndex = index;
        html += `<div class="command-palette-item${index === selectedIndex ? ' selected' : ''}" data-index="${index}" data-type="page" data-id="${item.id}">
          <div class="command-palette-item-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
          <div class="command-palette-item-content">
            <div class="command-palette-item-title">${item.title}</div>
            <div class="command-palette-item-desc">${item.desc}</div>
          </div>
        </div>`;
      });
      html += '</div>';
    }

    if (filteredActions.length > 0) {
      html += '<div class="command-palette-section"><div class="command-palette-section-title">操作</div>';
      const baseIndex = filteredPages.length;
      filteredActions.forEach((item, i) => {
        const index = baseIndex + i;
        const shortcutHtml = item.shortcut ? `<div class="command-palette-item-shortcut"><kbd>${item.shortcut}</kbd></div>` : '';
        html += `<div class="command-palette-item${index === selectedIndex ? ' selected' : ''}" data-index="${index}" data-type="action" data-id="${item.id}">
          <div class="command-palette-item-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
          <div class="command-palette-item-content">
            <div class="command-palette-item-title">${item.title}</div>
            <div class="command-palette-item-desc">${item.desc}</div>
          </div>
          ${shortcutHtml}
        </div>`;
      });
      html += '</div>';
    }

    if (filteredMetrics.length > 0) {
      html += '<div class="command-palette-section"><div class="command-palette-section-title">数据指标</div>';
      const baseIndex = filteredPages.length + filteredActions.length;
      filteredMetrics.forEach((item, i) => {
        const index = baseIndex + i;
        html += `<div class="command-palette-item${index === selectedIndex ? ' selected' : ''}" data-index="${index}" data-type="metric" data-id="${item.id}">
          <div class="command-palette-item-icon"><i data-lucide="${item.icon}" class="w-5 h-5"></i></div>
          <div class="command-palette-item-content">
            <div class="command-palette-item-title">${item.title}</div>
            <div class="command-palette-item-desc">${item.desc}</div>
          </div>
        </div>`;
      });
      html += '</div>';
    }

    if (html === '') {
      html = '<div style="padding: 40px; text-align: center; color: var(--text-muted);">未找到匹配结果</div>';
    }

    commandPaletteBody.innerHTML = html;
    lucide.createIcons();
    
    // 绑定点击事件
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
    
    if (type === 'page') {
      switchPage(id);
    } else if (type === 'action') {
      switch(id) {
        case 'export-report':
          switchPage('export');
          break;
        case 'switch-store':
          document.getElementById('storeSelector')?.click();
          break;
        case 'dark-mode':
          toggleTheme();
          break;
        case 'refresh':
          location.reload();
          break;
        case 'fullscreen':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        case 'shortcuts':
          document.getElementById('shortcutsModal')?.classList.remove('hidden');
          break;
      }
    }
  }

  // 监听Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (commandPaletteOverlay?.classList.contains('hidden')) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
    }
    
    // 命令面板内键盘导航
    if (commandPaletteOverlay && !commandPaletteOverlay.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        closeCommandPalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
        renderCommandPalette(commandPaletteInput?.value || '');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderCommandPalette(commandPaletteInput?.value || '');
      } else if (e.key === 'Enter' && currentResults[selectedIndex]) {
        e.preventDefault();
        const item = currentResults[selectedIndex];
        executeCommand(item.type, item.id);
      }
    }
  });

  commandPaletteInput?.addEventListener('input', (e) => {
    selectedIndex = 0;
    renderCommandPalette(e.target.value);
  });

  commandPaletteOverlay?.addEventListener('click', (e) => {
    if (e.target === commandPaletteOverlay) {
      closeCommandPalette();
    }
  });

  // ============================================
  // VOICE INTERACTION (语音交互)
  // ============================================
  const chatVoiceBtn = document.getElementById('chatVoiceBtn');
  const chatTtsBtn = document.getElementById('chatTtsBtn');
  const chatWaveform = document.getElementById('chatWaveform');
  const chatVoiceStatus = document.getElementById('chatVoiceStatus');
  const chatInput = document.getElementById('chatInput');
  
  let isRecording = false;
  let isPlaying = false;
  let mediaRecorder = null;
  let audioChunks = [];

  function updateVoiceStatus(status) {
    if (!chatVoiceStatus) return;
    const dot = chatVoiceStatus.querySelector('.voice-status-dot');
    const text = chatVoiceStatus.querySelector('.voice-status-text');
    
    const statusMap = {
      ready: { color: 'var(--success)', text: '就绪' },
      recording: { color: 'var(--danger)', text: '录音中' },
      recognizing: { color: 'var(--warning)', text: '识别中' },
      playing: { color: 'var(--accent)', text: '播放中' }
    };
    
    const s = statusMap[status] || statusMap.ready;
    if (dot) dot.style.background = s.color;
    if (text) text.textContent = s.text;
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        // 模拟语音识别
        updateVoiceStatus('recognizing');
        setTimeout(() => {
          if (chatInput) {
            chatInput.value = '今天门店的营收情况怎么样？';
          }
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
      // 模拟录音效果
      isRecording = true;
      updateVoiceStatus('recording');
      chatWaveform?.classList.remove('hidden');
      chatVoiceBtn?.classList.add('recording');
      
      setTimeout(() => {
        stopRecording();
      }, 3000);
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    isRecording = false;
  }

  chatVoiceBtn?.addEventListener('click', toggleRecording);

  // TTS功能
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
      
      utterance.onstart = () => {
        isPlaying = true;
        chatTtsBtn?.classList.add('playing');
        updateVoiceStatus('playing');
      };
      
      utterance.onend = () => {
        isPlaying = false;
        chatTtsBtn?.classList.remove('playing');
        updateVoiceStatus('ready');
      };
      
      speechSynthesis.speak(utterance);
    }
  });

  // 显示TTS按钮当有AI回复时
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    const observer = new MutationObserver(() => {
      const aiMessages = chatMessages.querySelectorAll('.ai-message');
      if (aiMessages.length > 0) {
        chatTtsBtn?.classList.remove('hidden');
      }
    });
    observer.observe(chatMessages, { childList: true });
  }

  // ============================================
  // AI DAILY (AI洞察日报)
  // ============================================
  const aiDailyDate = document.getElementById('aiDailyDate');
  const aiDailyStatus = document.getElementById('aiDailyStatus');
  const aiExportPdfBtn = document.getElementById('aiExportPdfBtn');
  
  // 设置今日日期
  if (aiDailyDate) {
    const today = new Date();
    aiDailyDate.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  }
  
  // 模拟AI生成完成
  setTimeout(() => {
    if (aiDailyStatus) {
      aiDailyStatus.classList.remove('generating');
      aiDailyStatus.classList.add('hidden');
      const readyIndicator = aiDailyStatus.parentElement?.querySelector('.ready');
      if (readyIndicator) readyIndicator.classList.remove('hidden');
    }
  }, 2000);

  // 历史日报展开/收起
  document.querySelectorAll('.ai-history-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('expanded');
    });
  });

  // 导出PDF
  aiExportPdfBtn?.addEventListener('click', () => {
    alert('正在生成PDF报告，请稍候...');
    // 实际项目中这里会调用PDF生成库
  });

  // ============================================
  // DATA EXPORT CENTER (数据导出中心)
  // ============================================
  const exportTypeOptions = document.querySelectorAll('.export-type-option');
  const exportRangeBtns = document.querySelectorAll('.export-range-btn');
  const exportModuleItems = document.querySelectorAll('.export-module-item');
  const exportCustomRange = document.getElementById('exportCustomRange');
  const exportMainBtn = document.getElementById('exportMainBtn');
  const exportProgressCard = document.getElementById('exportProgressCard');
  const exportProgressBar = document.getElementById('exportProgressBar');
  const exportProgressPercent = document.getElementById('exportProgressPercent');
  
  // 导出类型选择
  exportTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
      exportTypeOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
  
  // 数据范围选择
  exportRangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      exportRangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.range === 'custom') {
        exportCustomRange?.classList.remove('hidden');
      } else {
        exportCustomRange?.classList.add('hidden');
      }
    });
  });
  
  // 内容模块选择
  exportModuleItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
    });
  });
  
  // 开始导出
  exportMainBtn?.addEventListener('click', () => {
    exportProgressCard?.classList.remove('hidden');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          exportProgressCard?.classList.add('hidden');
          alert('导出完成！文件已保存到下载目录。');
        }, 500);
      }
      if (exportProgressBar) exportProgressBar.style.width = progress + '%';
      if (exportProgressPercent) exportProgressPercent.textContent = Math.round(progress) + '%';
    }, 300);
  });

  // ============================================
  // ONBOARDING WIZARD (新手引导)
  // ============================================
  const onboardingOverlay = document.getElementById('onboardingOverlay');
  const onboardingContainer = document.getElementById('onboardingContainer');
  const onboardingContent = document.getElementById('onboardingContent');
  const onboardingProgressBar = document.getElementById('onboardingProgressBar');
  const onboardingNextBtn = document.getElementById('onboardingNextBtn');
  const onboardingSkipBtn = document.getElementById('onboardingSkipBtn');
  const onboardingStartBtn = document.getElementById('onboardingStartBtn');
  const onboardingIndustryBtns = document.querySelectorAll('.onboarding-industry-btn');
  
  let currentStep = 1;
  const totalSteps = 5;
  let selectedIndustry = null;
  
  function updateOnboardingStep() {
    const steps = onboardingContent.querySelectorAll('.onboarding-step');
    steps.forEach(step => {
      step.classList.toggle('active', parseInt(step.dataset.step) === currentStep);
    });
    
    if (onboardingProgressBar) {
      onboardingProgressBar.style.width = (currentStep / totalSteps * 100) + '%';
    }
    
    if (onboardingNextBtn) {
      onboardingNextBtn.innerHTML = currentStep === totalSteps - 1 
        ? '完成 <i data-lucide="check" class="w-4 h-4"></i>' 
        : '下一步 <i data-lucide="arrow-right" class="w-4 h-4"></i>';
      lucide.createIcons();
    }
  }
  
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
      updateOnboardingStep();
    }
  }
  
  function closeOnboarding() {
    onboardingOverlay?.classList.add('hidden');
    localStorage.setItem('onboardingCompleted', 'true');
  }
  
  // 行业选择
  onboardingIndustryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      onboardingIndustryBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedIndustry = btn.dataset.industry;
    });
  });
  
  onboardingNextBtn?.addEventListener('click', nextStep);
  onboardingSkipBtn?.addEventListener('click', closeOnboarding);
  onboardingStartBtn?.addEventListener('click', closeOnboarding);
  
  // 检查是否需要显示引导
  if (!localStorage.getItem('onboardingCompleted')) {
    setTimeout(() => {
      onboardingOverlay?.classList.remove('hidden');
      updateOnboardingStep();
    }, 500);
  }
  
  // 从设置中重新触发引导
  const settingsBtn = document.querySelector('[data-page="changelog"]');
  // 可以通过添加一个"重新开始引导"的按钮来触发
  
  // ============================================
  // PAGE NAMES UPDATE
  // ============================================
  // 更新pageNames对象添加新页面
  if (window.pageNames) Object.assign(window.pageNames, {
    'aidaily': 'AI洞察日报',
    'export': '数据导出'
  });



// ============================================
// 升级功能: 运营概览AI洞察卡
// ============================================
function initAIInsight() {
  try {
    const insightCard = document.getElementById('aiInsightCard');
    const insightContent = document.getElementById('aiInsightContent');
    const insightRefresh = document.getElementById('aiInsightRefresh');
    
    if (!insightCard || !insightContent) return;
    
    // AI洞察内容模板
    const insights = [
      "今日营收¥12.8万，较昨日+12%。主要驱动：外卖订单增长18%，午市表现突出。建议：加大午市推广投入，晚市可考虑推出套餐提升客单价。",
      "本周复购率提升5%，老客贡献占比达68%。VIP用户王女士已连续3周未到店，建议发送专属召回优惠。",
      "差评处理及时率98%，平均响应时间2.8分钟。但「等位时间长」仍是主要差评原因，建议优化排队系统。",
      "午市上座率较晚市低35%，存在提升空间。建议推出午市特惠套餐，预计增收¥3,200/天。",
      "本周新客增长12%，主要来源抖音引流。建议加大短视频内容投放，保持流量增长势头。"
    ];
    
    let currentInsight = 0;
    let isTyping = false;
    
    // 打字机效果
    function typeText(text, callback) {
      const textEl = insightContent.querySelector('.ai-insight-text') || document.createElement('span');
      textEl.className = 'ai-insight-text';
      const cursor = insightContent.querySelector('.ai-insight-cursor');
      
      insightContent.innerHTML = '';
      insightContent.appendChild(textEl);
      insightContent.appendChild(cursor || createCursor());
      
      let index = 0;
      isTyping = true;
      
      // 使用外部typeChar实现打字机效果
      function doType() {
        if (index < text.length) {
          textEl.textContent += text[index];
          index++;
          setTimeout(doType, 30 + Math.random() * 20);
        } else {
          isTyping = false;
          if (callback) callback();
        }
      }
      
      doType();
    }
    
    function createCursor() {
      const cursor = document.createElement('span');
      cursor.className = 'ai-insight-cursor';
      return cursor;
    }
    
    // 刷新按钮
    if (insightRefresh) {
      insightRefresh.addEventListener('click', () => {
        if (isTyping) return;
        
        insightRefresh.classList.add('loading');
        
        // 模拟加载
        setTimeout(() => {
          currentInsight = (currentInsight + 1) % insights.length;
          typeText(insights[currentInsight]);
          insightRefresh.classList.remove('loading');
        }, 800);
      });
    }
    
    // 初始化显示
    setTimeout(() => {
      typeText(insights[currentInsight]);
    }, 500);
    
    // 标签点击事件
    const tags = insightCard.querySelectorAll('.ai-insight-tag');
    tags.forEach((tag, index) => {
      tag.addEventListener('click', () => {
        const tagTypes = ['revenue', 'risk', 'suggest'];
        const tagTexts = [
          insights[currentInsight].match(/建议[^。]+/)?.[0] || insights[currentInsight],
          "风险提示：" + (currentInsight === 2 ? "等位时间长是主要差评原因" : "暂无明显风险"),
          "优化建议：" + insights[(currentInsight + 1) % insights.length].match(/建议[^。]+/)?.[0]
        ];
        typeText(tagTexts[index] || insights[currentInsight]);
      });
    });
  } catch (err) {
    console.error('initAIInsight初始化失败:', err);
  }
}

// ============================================
// 升级功能: AI对话模板和历史会话
// ============================================
function initChatEnhancements() {
  try {
    // 模板按钮
    const templateBtns = document.querySelectorAll('.chat-template-btn');
    const chatInput = document.getElementById('chatInput');
    
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        if (chatInput && template) {
          chatInput.value = template;
          chatInput.focus();
          
          // 添加视觉反馈
          btn.style.background = 'var(--primary)';
          btn.style.color = 'white';
          setTimeout(() => {
            btn.style.background = '';
            btn.style.color = '';
          }, 200);
        }
      });
    });
    
    // 历史会话点击
    const historyItems = document.querySelectorAll('.chat-history-item');
    historyItems.forEach(item => {
      item.addEventListener('click', () => {
        historyItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // 模拟切换会话
        const sessionId = item.dataset.session;
        console.log('切换到会话:', sessionId);
      });
    });
    
    // 新对话按钮
    const newBtn = document.getElementById('chatNewBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        if (chatInput) {
          chatInput.value = '';
          chatInput.focus();
        }
        historyItems.forEach(i => i.classList.remove('active'));
        lucide.createIcons();
      });
    }
  } catch (err) {
    console.error('initChatEnhancements初始化失败:', err);
  }
}

// ============================================
// 升级功能: 数据翻牌动画
// ============================================
let realtimeInterval = null;
let lastUpdateTime = Date.now();

function initFlipCards() {
  try {
    const flipCards = document.querySelectorAll('.flip-card');
    if (flipCards.length === 0) return;
    
    // 初始动画
    flipCards.forEach((card, index) => {
      setTimeout(() => {
        animateFlip(card);
      }, index * 200);
    });
    
    // 实时数据更新
    if (realtimeInterval) clearInterval(realtimeInterval);
    
    realtimeInterval = setInterval(() => {
      updateRealtimeData();
    }, 30000);
    
    // 更新时间显示
    updateRealtimeTime();
    setInterval(updateRealtimeTime, 1000);
  } catch (err) {
    console.error('initFlipCards初始化失败:', err);
  }
}

function animateFlip(card) {
  const valueEl = card.querySelector('.flip-card-value');
  if (!valueEl) return;
  
  // 添加翻转动画
  valueEl.classList.add('flipping');
  setTimeout(() => {
    valueEl.classList.remove('flipping');
  }, 600);
}

function updateRealtimeData() {
  const flipRevenue = document.getElementById('flipRevenue');
  const flipOrders = document.getElementById('flipOrders');
  const flipRating = document.getElementById('flipRating');
  
  // 模拟数据微调
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
    if (seconds < 60) {
      timeEl.textContent = seconds + '秒前更新';
    } else {
      timeEl.textContent = Math.floor(seconds / 60) + '分钟前更新';
    }
  }
}

// ============================================
// 升级功能: 竞品AI策略一键执行
// ============================================
function initStrategyExecute() {
  const executeBtns = document.querySelectorAll('.ai-strategy-execute');
  
  executeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('executing')) return;
      
      btn.classList.add('executing');
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4"></i> 执行中...';
      lucide.createIcons();
      
      // 模拟执行动画
      setTimeout(() => {
        btn.classList.remove('executing');
        btn.classList.add('executed');
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已执行';
        lucide.createIcons();
        
        // 显示执行结果提示
        showToast('策略已加入执行队列，AI将在30分钟内逐步生效');
      }, 2000);
    });
  });
}

// ============================================
// 升级功能: 门店健康改善路线图
// ============================================
function initHealthRoadmap() {
  try {
    const executeBtns = document.querySelectorAll('.health-roadmap-execute');
    let completedTasks = 0;
    const totalTasks = 3;
    
    executeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('executed')) return;
        
        btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 loading"></i> 执行中...';
        lucide.createIcons();
        
        setTimeout(() => {
          btn.classList.add('executed');
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已添加计划';
          lucide.createIcons();
          
          completedTasks++;
          updateRoadmapProgress(completedTasks, totalTasks);
          
          showToast('改善计划已添加，将在指定时间自动执行');
        }, 1500);
      });
    });
  } catch (err) {
    console.error('initHealthRoadmap初始化失败:', err);
  }
}

function updateRoadmapProgress(completed, total) {
  const progressFill = document.querySelector('.health-roadmap-progress-fill');
  const progressText = document.querySelector('.health-roadmap-progress-text');
  
  if (progressFill) {
    const percentage = (completed / total) * 100;
    progressFill.style.width = percentage + '%';
  }
  
  if (progressText) {
    progressText.textContent = completed + '/' + total + ' 已完成';
  }
}

// ============================================
// 数据导出中心初始化
// ============================================
function initExport() {
  const exportSection = document.getElementById('sectionExport');
  if (!exportSection) return;
  
  // 导出类型选择
  const exportTypeOptions = exportSection.querySelectorAll('.export-type-option');
  exportTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
      exportTypeOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      updateExportPreview();
    });
  });
  
  // 数据范围选择
  const rangeBtns = exportSection.querySelectorAll('.export-range-btn');
  const customRange = exportSection.querySelector('.export-custom-range');
  
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (btn.dataset.range === 'custom') {
        customRange?.classList.remove('hidden');
      } else {
        customRange?.classList.add('hidden');
      }
      updateExportPreview();
    });
  });
  
  // 内容模块多选
  const moduleItems = exportSection.querySelectorAll('.export-module-item');
  moduleItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      item.querySelector('input').checked = item.classList.contains('checked');
      updateExportPreview();
    });
  });
  
  // 导出按钮
  const exportBtn = document.getElementById('exportMainBtn');
  const progressCard = document.getElementById('exportProgressCard');
  const progressBar = document.getElementById('exportProgressBar');
  const progressPercent = document.getElementById('exportProgressPercent');
  
  exportBtn?.addEventListener('click', () => {
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
          
          // 添加到历史记录
          addExportHistory();
        }, 500);
      }
      
      if (progressBar) progressBar.style.width = progress + '%';
      if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
    }, 150);
  });
  
  // 导出历史下载按钮
  const historyDownloads = exportSection.querySelectorAll('.export-history-download');
  historyDownloads.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const historyItem = btn.closest('.export-history-item');
      const fileName = historyItem?.querySelector('.export-history-name')?.textContent || '文件';
      showToast('开始下载: ' + fileName);
    });
  });
  
  // 初始预览更新
  updateExportPreview();
  
  function updateExportPreview() {
    const typeValue = exportSection.querySelector('input[name="exportType"]:checked')?.value || 'pdf';
    const rangeValue = exportSection.querySelector('.export-range-btn.active')?.dataset.range || 'today';
    const modules = exportSection.querySelectorAll('.export-module-item.checked');
    
    const typeNames = { pdf: 'PDF报告', excel: 'Excel表格', image: '图片' };
    const rangeNames = { today: '今日', week: '本周', month: '本月', custom: '自定义' };
    
    const moduleNames = Array.from(modules).map(m => {
      const labels = { overview: '概览数据', revenue: '营收分析', competitor: '竞品对比', suggestions: '运营建议' };
      return labels[m.querySelector('input')?.value] || '';
    }).filter(Boolean);
    
    const previewValues = exportSection.querySelectorAll('.export-preview-item .preview-value');
    if (previewValues[0]) previewValues[0].textContent = typeNames[typeValue] || 'PDF报告';
    if (previewValues[1]) {
      const now = new Date();
      previewValues[1].textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
    }
    if (previewValues[2]) previewValues[2].textContent = moduleNames.join('、') || '无';
    if (previewValues[3]) previewValues[3].textContent = '约' + Math.max(1, Math.ceil(moduleNames.length * 0.8)) + '页';
  }
  
  function addExportHistory() {
    const historyList = exportSection.querySelector('.export-history-list');
    if (!historyList) return;
    
    const typeValue = exportSection.querySelector('input[name="exportType"]:checked')?.value || 'pdf';
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const iconClass = typeValue === 'pdf' ? 'pdf' : (typeValue === 'excel' ? 'excel' : 'image');
    const iconType = typeValue === 'pdf' ? 'file-text' : (typeValue === 'excel' ? 'table' : 'image');
    const typeName = typeValue === 'pdf' ? 'PDF报告' : (typeValue === 'excel' ? 'Excel表格' : '图片');
    const fileName = typeValue === 'excel' ? `营收数据_${now.getMonth()+1}月.xlsx` : `运营日报_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.${typeValue === 'pdf' ? 'pdf' : 'png'}`;
    
    const newItem = document.createElement('div');
    newItem.className = 'export-history-item';
    newItem.innerHTML = `
      <div class="export-history-icon ${iconClass}"><i data-lucide="${iconType}" class="w-5 h-5"></i></div>
      <div class="export-history-info">
        <div class="export-history-name">${fileName}</div>
        <div class="export-history-meta"><span>${typeName}</span><span>•</span><span>${dateStr}</span></div>
      </div>
      <button class="export-history-download"><i data-lucide="download" class="w-4 h-4"></i></button>
    `;
    
    historyList.insertBefore(newItem, historyList.firstChild);
    lucide.createIcons();
    
    // 新添加的下载按钮事件
    newItem.querySelector('.export-history-download')?.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('开始下载: ' + fileName);
    });
  }
}

// ============================================
// 页面切换时初始化功能
// ============================================
const originalSwitchPage = switchPage;
switchPage = function(page) {
  // 调用原始函数
  if (originalSwitchPage) {
    originalSwitchPage(page);
  }
  
  // 根据页面初始化对应功能
  setTimeout(() => {
    switch (page) {
      case 'overview':
        initAIInsight();
        break;
      case 'chat':
        initChatEnhancements();
        break;
      case 'data':
        initFlipCards();
        break;
      case 'competitor':
        initStrategyExecute();
        break;
      case 'health':
        initHealthRoadmap();
        break;
      case 'export':
        initExport();
        break;
    }
  }, 100);
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // 检测当前页面并初始化
    const activeSection = document.querySelector('.demo-section.active');
    if (activeSection) {
      const pageId = activeSection.id.replace('section', '').toLowerCase();
      
      switch (pageId) {
        case 'overview':
          initAIInsight();
          break;
        case 'aidaily':
          initAidaily();
          break;
        case 'export':
          initExport();
          break;
        case 'chat':
          initChatEnhancements();
          break;
        case 'data':
          initFlipCards();
          break;
        case 'competitor':
          initStrategyExecute();
          break;
        case 'health':
          initHealthRoadmap();
          break;
      }
    }
  }, 600);
});

console.log('店赢OS v10 - 全面修复完成');


// ============================================
// 店赢OS v10.1 - 修复缺失的按钮事件绑定
// ============================================

// Toast提示函数
function showToast(message, duration) {
  if (!duration) duration = 2000;
  
  // 移除已存在的toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: toastFadeIn 0.3s ease;
  `;
  toast.textContent = message;
  
  // 添加动画样式
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes toastFadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes toastFadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastFadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 初始化缺失的按钮事件处理
function initMissingButtonHandlers() {
  console.log('初始化缺失按钮事件绑定...');
  
  // ============================================
  // 营销工具页面 - createCouponBtn
  // ============================================
  const createCouponBtn = document.getElementById('createCouponBtn');
  if (createCouponBtn && !createCouponBtn.dataset.bound) {
    createCouponBtn.dataset.bound = 'true';
    createCouponBtn.addEventListener('click', function() {
      showToast('优惠券创建功能开发中');
    });
  }
  
  // ============================================
  // 任务日历 - calPrevBtn, calNextBtn
  // ============================================
  const calPrevBtn = document.getElementById('calPrevBtn');
  if (calPrevBtn && !calPrevBtn.dataset.bound) {
    calPrevBtn.dataset.bound = 'true';
    calPrevBtn.addEventListener('click', function() {
      showToast('切换到上个月');
    });
  }
  
  const calNextBtn = document.getElementById('calNextBtn');
  if (calNextBtn && !calNextBtn.dataset.bound) {
    calNextBtn.dataset.bound = 'true';
    calNextBtn.addEventListener('click', function() {
      showToast('切换到下个月');
    });
  }
  
  // ============================================
  // 数据导出 - generateReportBtn
  // ============================================
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn && !generateReportBtn.dataset.bound) {
    generateReportBtn.dataset.bound = 'true';
    generateReportBtn.addEventListener('click', function() {
      showToast('正在生成数据报告...');
    });
  }
  
  // ============================================
  // ROI计算器 - calculateRoiBtn
  // ============================================
  const calculateRoiBtn = document.getElementById('calculateRoiBtn');
  if (calculateRoiBtn && !calculateRoiBtn.dataset.bound) {
    calculateRoiBtn.dataset.bound = 'true';
    calculateRoiBtn.addEventListener('click', function() {
      showToast('ROI计算中...');
    });
  }
  
  // ============================================
  // 选址分析 - locationSearchBtn
  // ============================================
  const locationSearchBtn = document.getElementById('locationSearchBtn');
  if (locationSearchBtn && !locationSearchBtn.dataset.bound) {
    locationSearchBtn.dataset.bound = 'true';
    locationSearchBtn.addEventListener('click', function() {
      showToast('选址分析中...');
    });
  }
  
  // ============================================
  // 数据分析 - datalabAnalyzeBtn
  // ============================================
  const datalabAnalyzeBtn = document.getElementById('datalabAnalyzeBtn');
  if (datalabAnalyzeBtn && !datalabAnalyzeBtn.dataset.bound) {
    datalabAnalyzeBtn.dataset.bound = 'true';
    datalabAnalyzeBtn.addEventListener('click', function() {
      showToast('数据分析中...');
    });
  }
  
  // ============================================
  // 知识库 - knowledge-action-btn
  // ============================================
  document.querySelectorAll('.knowledge-action-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('知识库功能开发中');
      });
    }
  });
  
  // ============================================
  // 优惠券列表 - coupon-btn
  // ============================================
  document.querySelectorAll('.coupon-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('优惠券功能开发中');
      });
    }
  });
  
  // ============================================
  // 票据管理 - ticket-btn
  // ============================================
  document.querySelectorAll('.ticket-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('票据功能开发中');
      });
    }
  });
  
  // ============================================
  // 分类管理 - category-btn
  // ============================================
  document.querySelectorAll('.category-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('分类管理功能开发中');
      });
    }
  });
  
  // ============================================
  // 详情按钮 - viewDetailBtns
  // ============================================
  document.querySelectorAll('.viewDetailBtn, .view-detail-btn, [data-action="viewDetail"]').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('查看详情');
      });
    }
  });
  
  // ============================================
  // AI建议操作 - aiSuggestionActions
  // ============================================
  document.querySelectorAll('.ai-suggestion-action, .ai-action-btn, [data-action="ai"]').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('AI建议功能开发中');
      });
    }
  });
  
  // ============================================
  // 报告模板 - reportTemplates
  // ============================================
  document.querySelectorAll('.report-template, .template-btn, [data-action="template"]').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('报告模板功能开发中');
      });
    }
  });
  
  // ============================================
  // 导出选项 - exportOptions
  // ============================================
  document.querySelectorAll('.export-option, .export-btn, [data-action="export"]').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('导出功能开发中');
      });
    }
  });
  
  // ============================================
  // 日历日期 - calendarDays
  // ============================================
  document.querySelectorAll('.calendar-day, .cal-day').forEach(function(day) {
    if (!day.dataset.bound) {
      day.dataset.bound = 'true';
      day.addEventListener('click', function() {
        if (this.classList.contains('has-task')) {
          showToast('查看当天任务');
        }
      });
    }
  });
  
  // ============================================
  // 工作流Tab - workflowTabs
  // ============================================
  document.querySelectorAll('.workflow-tab, .wf-tab').forEach(function(tab) {
    if (!tab.dataset.bound) {
      tab.dataset.bound = 'true';
      tab.addEventListener('click', function() {
        showToast('切换工作流');
      });
    }
  });
  
  // ============================================
  // 角色卡片 - roleCards
  // ============================================
  document.querySelectorAll('.role-card, .user-role-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.addEventListener('click', function() {
        showToast('切换角色视图');
      });
    }
  });
  
  // ============================================
  // 聊天历史 - chatHistoryItems
  // ============================================
  document.querySelectorAll('.chat-history-item, .history-item').forEach(function(item) {
    if (!item.dataset.bound) {
      item.dataset.bound = 'true';
      item.addEventListener('click', function() {
        showToast('加载聊天记录');
      });
    }
  });
  
  // ============================================
  // 聊天模板按钮 - chatTemplateBtns
  // ============================================
  document.querySelectorAll('.chat-template-btn, .template-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('使用聊天模板');
      });
    }
  });
  
  // ============================================
  // 门店选项 - storeOptions
  // ============================================
  document.querySelectorAll('.store-option, .store-item').forEach(function(item) {
    if (!item.dataset.bound) {
      item.dataset.bound = 'true';
      item.addEventListener('click', function() {
        showToast('切换门店');
      });
    }
  });
  
  // ============================================
  // 日志操作 - logActionBtns
  // ============================================
  document.querySelectorAll('.log-action-btn, .log-btn').forEach(function(btn) {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', function() {
        showToast('日志操作');
      });
    }
  });
  
  // ============================================
  // 指标卡片点击
  // ============================================
  document.querySelectorAll('.metric-card, .stat-card, .kpi-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        showToast('查看详细数据');
      });
    }
  });
  
  // ============================================
  // 健康检查项
  // ============================================
  document.querySelectorAll('.health-item, .check-item').forEach(function(item) {
    if (!item.dataset.bound) {
      item.dataset.bound = 'true';
      item.addEventListener('click', function() {
        showToast('查看健康详情');
      });
    }
  });
  
  // ============================================
  // 策略卡片
  // ============================================
  document.querySelectorAll('.strategy-card, .tactic-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        showToast('查看策略详情');
      });
    }
  });
  
  // ============================================
  // 数据趋势卡片
  // ============================================
  document.querySelectorAll('.trend-card, .chart-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        showToast('查看趋势分析');
      });
    }
  });
  
  // ============================================
  // 预警卡片
  // ============================================
  document.querySelectorAll('.alert-card, .warning-card, .notification-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        showToast('查看预警详情');
      });
    }
  });
  
  // ============================================
  // 任务卡片
  // ============================================
  document.querySelectorAll('.task-card, .todo-card').forEach(function(card) {
    if (!card.dataset.bound) {
      card.dataset.bound = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        showToast('查看任务详情');
      });
    }
  });
  
  // ============================================
  // 设置项
  // ============================================
  document.querySelectorAll('.setting-item, .settings-row').forEach(function(item) {
    if (!item.dataset.bound) {
      item.dataset.bound = 'true';
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        showToast('打开设置');
      });
    }
  });
  
  console.log('缺失按钮事件绑定初始化完成');
}

// 在页面切换后重新初始化
const originalSwitchPageV2 = switchPage;
switchPage = function(page) {
  if (typeof originalSwitchPageV2 === 'function') {
    originalSwitchPageV2(page);
  }
  setTimeout(initMissingButtonHandlers, 300);
};

// DOM加载完成后初始化缺失按钮
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initMissingButtonHandlers, 800);
  
  // MutationObserver监听动态添加的按钮
  const observer = new MutationObserver(function(mutations) {
    let shouldInit = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        shouldInit = true;
      }
    });
    if (shouldInit) {
      setTimeout(initMissingButtonHandlers, 200);
    }
  });
  
  // 监听主内容区域
  const mainContent = document.querySelector('.demo-container') || document.querySelector('main') || document.body;
  observer.observe(mainContent, { childList: true, subtree: true });
});

console.log('店赢OS v10.1 - 按钮事件绑定修复已加载');
