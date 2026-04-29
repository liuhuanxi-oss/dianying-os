/**
 * 店赢OS - 交互逻辑 v5
 * 包含：滚动动画、FAQ折叠、Demo体验、多Agent协同、数字跳动动画、暗色模式、打字效果
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // 滚动渐入动画 - 移动端优化
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  
  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768;
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: isMobile ? 0.05 : 0.1,
    rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
  
  // ============================================
  // FAQ 折叠功能
  // ============================================
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      item.classList.toggle('active');
    });
  });
  
  // ============================================
  // Mobile Menu Toggle
  // ============================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('show');
    });
    
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('show');
      });
    });
  }
  
  // ============================================
  // 暗色模式切换
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  
  // 从localStorage读取用户偏好
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcon(true);
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    });
  }
  
  function updateThemeIcon(isDark) {
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    if (moonIcon && sunIcon) {
      moonIcon.classList.toggle('hidden', isDark);
      sunIcon.classList.toggle('hidden', !isDark);
    }
  }
  
  // ============================================
  // 导航栏滚动阴影
  // ============================================
  const navbar = document.querySelector('.navbar');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('shadow');
      } else {
        navbar.classList.remove('shadow');
      }
    });
  }
  
  // ============================================
  // Demo 体验功能
  // ============================================
  const demoTriggers = document.querySelectorAll('[data-demo-trigger]');
  const landingPage = document.querySelector('.landing-page');
  const demoPage = document.querySelector('.demo-page');
  const backBtns = document.querySelectorAll('.back-btn, #demoHomeBtn, #backBtn');
  const openPricingBtn = document.getElementById('openPricingBtn');
  
  // 进入Demo
  demoTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showDemo();
    });
  });
  
  // 返回首页
  backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showLanding();
    });
  });
  
  // 开通正式版 - 跳转到定价区域
  if (openPricingBtn) {
    openPricingBtn.addEventListener('click', () => {
      showLanding();
      setTimeout(() => {
        document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    });
  }
  
  function showDemo() {
    landingPage.classList.add('hidden');
    demoPage.classList.add('active');
    window.scrollTo(0, 0);
    initDemo();
  }
  
  function showLanding() {
    demoPage.classList.remove('active');
    landingPage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  
  // ============================================
  // Share Button
  // ============================================
  const shareBtn = document.getElementById('shareBtn');
  const shareToast = document.getElementById('shareToast');
  
  if (shareBtn && shareToast) {
    shareBtn.addEventListener('click', () => {
      const dummy = document.createElement('input');
      dummy.value = window.location.href;
      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      
      shareToast.classList.add('show');
      setTimeout(() => {
        shareToast.classList.remove('show');
      }, 3000);
    });
  }
  
  // ============================================
  // Demo 场景对话 (多Agent协同)
  // ============================================
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  let currentScenario = null;
  
  // Mock对话数据 - 多Agent协同
  const scenarios = {
    review: {
      title: '差评处理',
      messages: [
        { type: 'user', text: '刚收到一条差评，说等位40分钟，态度很差' },
        { type: 'ai', agent: 'virtual', text: '收到差评预警。正在派发给线索Agent分析原因...' },
        { type: 'ai', agent: 'clue', text: '[线索Agent] 分析完成：近7天差评5条，比上周多3条。主要集中在等位时间长（3条）和服务态度（2条）。高峰期人手不足是主因。' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议：1）高峰期加2个兼职，2）等位时主动送酸梅汤降低焦虑。要我帮你生成回复话术吗？' },
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 已自动在大众点评回复，回复速度超过98%同类商家。明天高峰期兼职排班已同步到门店。' }
      ]
    },
    pricing: {
      title: '动态定价',
      messages: [
        { type: 'user', text: '明天下雨，对生意有影响吗？' },
        { type: 'ai', agent: 'virtual', text: '收到，正在分析天气数据对门店的影响...' },
        { type: 'ai', agent: 'clue', text: '[线索Agent] 分析完成：历史数据显示，雨天客流平均下降23%，但外卖订单上涨41%。工作日雨天影响更大。' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议调整策略：\n1. 外卖：满100减15 → 满100减20，预计增收¥1,200\n2. 堂食：推出"雨天热汤套餐"，提升客单价¥18\n3. 提前1小时在群内预热，引导预约' },
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 已自动同步至美团/饿了么后台。已发送雨天营销预热文案到门店群，等待确认后推送。' }
      ]
    },
    vip: {
      title: 'VIP管理',
      messages: [
        { type: 'user', text: '王女士1个月没来了，怎么回事？' },
        { type: 'ai', agent: 'virtual', text: '正在分析王女士的消费档案和流失风险...' },
        { type: 'ai', agent: 'clue', text: '[线索Agent] 档案摘要：\n• 累计消费 ¥3,280 | 平均客单价 ¥164\n• 消费频率：每月2-3次 | 上次消费：4月8日\n• 流失概率：68%（中高风险）\n• 可能原因：竞争对手新店开业，未推送专属优惠' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 建议发送个性化召回文案：\n"王姐，好久不见！新上了您爱吃的酸菜鱼，还有您专属的8折券哦~"' },
        { type: 'ai', agent: 'operation', text: '[运营Agent] 已记录：上次王姐对新品反馈很好，建议下次推送前先电话回访，了解真实需求。' }
      ]
    },
    operation: {
      title: '运营建议',
      messages: [
        { type: 'user', text: '最近翻台率有点低，怎么办？' },
        { type: 'ai', agent: 'virtual', text: '正在分析近期运营数据...' },
        { type: 'ai', agent: 'clue', text: '[线索Agent] 诊断结果：\n• 当前翻台率：2.8次/天（目标4次）\n• 问题时段：午市11:30-12:30满座等位，晚市18:00-19:00排队严重\n• 闲置时段：14:00-17:00空桌率47%' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 优化建议：\n1. 【午市】推出"商务套餐"锁定办公人群，缩短点餐-出餐时间\n2. 【晚市】18:30前结账享9折，提升19:00后入座率\n3. 【下午茶】开放茶点套餐，盘活14:00-17:00闲置时段' },
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 预计整体提升翻台率至3.6次/天，月增收约¥2,400。已生成优化方案PPT，是否同步给店长群？' }
      ]
    },
    knowledge: {
      title: '跨店迁移',
      messages: [
        { type: 'user', text: '火锅店的促销方案能直接用到新开的烧烤店吗？' },
        { type: 'ai', agent: 'virtual', text: '收到，正在调用运营Agent分析跨店迁移可行性...' },
        { type: 'ai', agent: 'operation', text: '[运营Agent] 火锅店"满100减20"方案分析：核心驱动力是"高客单价+社交场景"。烧烤店同样满足这两个条件，迁移可行度82%。但需要调整：1）优惠门槛从100降至80（烧烤客单价更低），2）增加"烤串组合"替代"锅底+配菜"组合' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 已生成烧烤店适配方案，差异点已标注。预计试运行期1周，期间会对比两家店的数据。' },
        { type: 'ai', agent: 'delivery', text: '[交付Agent] 方案已推送到烧烤店后台，店长确认后即可启动。同步开启了A/B测试，火锅店保持原方案作为对照组。' }
      ]
    },
    twin: {
      title: '数字孪生',
      messages: [
        { type: 'user', text: '下周想推出午市套餐，但不确定定价多少合适' },
        { type: 'ai', agent: 'virtual', text: '收到，正在调用方案Agent进行数字孪生模拟...' },
        { type: 'ai', agent: 'solution', text: '[方案Agent] 已在数字孪生环境中模拟3种定价方案：¥38/¥48/¥58。模拟条件：当前客群结构、周边竞品定价、食材成本占比。结果显示：¥48方案综合评分最高（营收+满意度+翻台率），预计午市增收¥3,200/天。' },
        { type: 'ai', agent: 'clue', text: '[线索Agent] 补充数据：隔壁商场新开快餐店定价¥35，如果定价¥48需要搭配差异化价值感。建议加一个"免费续饭"标签。' },
        { type: 'ai', agent: 'delivery', text: '[交付Agent] ¥48午市套餐已创建草稿，含"免费续饭"标签。同时设置了3天后自动复盘提醒，会对比模拟值和实际值。' }
      ]
    }
  };
  
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.dataset.scenario;
      
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      chatMessages.innerHTML = '';
      currentScenario = scenario;
      
      loadScenarioChat(scenario);
    });
  });
  
  // 显示打字效果
  function showTyping() {
    if (typingIndicator) {
      typingIndicator.classList.remove('hidden');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  
  // 隐藏打字效果
  function hideTyping() {
    if (typingIndicator) {
      typingIndicator.classList.add('hidden');
    }
  }
  
  function loadScenarioChat(scenario) {
    const data = scenarios[scenario];
    let delay = 500;
    
    data.messages.forEach((msg, index) => {
      setTimeout(() => {
        // 用户消息立即显示
        if (msg.type === 'user') {
          addMessage(msg.type, msg.text, msg.agent);
        } else {
          // AI消息显示打字效果
          showTyping();
          setTimeout(() => {
            hideTyping();
            addMessage(msg.type, msg.text, msg.agent);
            
            if (index === data.messages.length - 1) {
              updateDemoData(scenario, true);
            }
          }, 1000 + Math.random() * 500);
        }
      }, delay);
      delay += msg.type === 'user' ? 800 : 2500;
    });
  }
  
  function addMessage(type, text, agent = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    let agentTag = '';
    if (type === 'ai' && agent && agent !== 'virtual') {
      const agentNames = {
        clue: '线索Agent',
        solution: '方案Agent',
        delivery: '交付Agent',
        operation: '运营Agent'
      };
      agentTag = `<div class="agent-tag ${agent}">${agentNames[agent] || agent}</div>`;
    }
    
    const formattedText = text.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
      <div class="message-bubble">${agentTag}${formattedText}</div>
      <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // ============================================
  // Chat Input - 用户输入
  // ============================================
  function handleUserInput() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    chatInput.value = '';
    
    showTyping();
    
    setTimeout(() => {
      hideTyping();
      addMessage('ai', 'virtual', 'virtual', '我已收到您的需求，正在为您分析...');
      
      setTimeout(() => {
        let matchedScenario = 'review';
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('价') || lowerText.includes('下雨') || lowerText.includes('天气')) {
          matchedScenario = 'pricing';
        } else if (lowerText.includes('vip') || lowerText.includes('会员') || lowerText.includes('流失') || lowerText.includes('没来')) {
          matchedScenario = 'vip';
        } else if (lowerText.includes('翻台') || lowerText.includes('运营') || lowerText.includes('客流')) {
          matchedScenario = 'operation';
        } else if (lowerText.includes('跨店') || lowerText.includes('迁移') || lowerText.includes('复制') || lowerText.includes('烧烤') || lowerText.includes('火锅')) {
          matchedScenario = 'knowledge';
        } else if (lowerText.includes('孪生') || lowerText.includes('模拟') || lowerText.includes('定价') || lowerText.includes('套餐') || lowerText.includes('合适')) {
          matchedScenario = 'twin';
        }
        
        scenarioBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.scenario === matchedScenario);
        });
        
        currentScenario = matchedScenario;
        loadScenarioChat(matchedScenario);
      }, 1500);
    }, 800);
  }
  
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleUserInput);
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserInput();
      }
    });
  }
  
  // ============================================
  // Demo 数据面板更新 (数字跳动动画)
  // ============================================
  function updateDemoData(scenario, animate = false) {
    const demoData = {
      review: { rating: 4.8, ratingChange: '+0.3', negativeRate: 1.2, negativeChange: '-3.8%', revenue: 128000, revenueChange: '+12%', trustLevel: 92 },
      pricing: { rating: 4.7, ratingChange: '+0.1', negativeRate: 2.1, negativeChange: '-1.2%', revenue: 135000, revenueChange: '+18%', trustLevel: 88 },
      vip: { rating: 4.9, ratingChange: '+0.4', negativeRate: 0.8, negativeChange: '-4.2%', revenue: 142000, revenueChange: '+15%', trustLevel: 95 },
      operation: { rating: 4.6, ratingChange: '+0.2', negativeRate: 2.8, negativeChange: '-0.6%', revenue: 118000, revenueChange: '+8%', trustLevel: 85 },
      knowledge: { rating: 4.8, ratingChange: '+0.2', negativeRate: 1.5, negativeChange: '-2.1%', revenue: 138000, revenueChange: '+22%', trustLevel: 90 },
      twin: { rating: 4.9, ratingChange: '+0.3', negativeRate: 1.0, negativeChange: '-3.0%', revenue: 145000, revenueChange: '+25%', trustLevel: 94 }
    };
    
    const data = demoData[scenario];
    
    const ratingValue = document.getElementById('ratingValue');
    if (ratingValue) {
      if (animate) {
        animateNumber(ratingValue, parseFloat(ratingValue.textContent), data.rating, 1000);
      } else {
        ratingValue.textContent = data.rating;
      }
    }
    
    const ratingChange = document.querySelector('[data-stat="rating"] .data-stat-change span');
    if (ratingChange) ratingChange.textContent = data.ratingChange;
    
    const negativeValue = document.getElementById('negativeValue');
    if (negativeValue) {
      if (animate) {
        animateNumber(negativeValue, parseFloat(negativeValue.textContent.replace('%', '')), data.negativeRate, 1000, '%');
      } else {
        negativeValue.textContent = data.negativeRate + '%';
      }
    }
    
    const negativeChange = document.querySelector('[data-stat="negative"] .data-stat-change');
    if (negativeChange) {
      const changeSpan = negativeChange.querySelector('span');
      if (changeSpan) changeSpan.textContent = data.negativeChange;
    }
    
    const revenueValue = document.getElementById('revenueValue');
    const oldRevenue = revenueValue ? parseFloat(revenueValue.textContent.replace('¥', '').replace('万', '')) : 0;
    if (revenueValue) {
      if (animate) {
        animateRevenue(revenueValue, oldRevenue, data.revenue / 10000, 1000);
      } else {
        revenueValue.textContent = '¥' + (data.revenue / 10000).toFixed(1) + '万';
      }
    }
    
    const revenueChange = document.querySelector('[data-stat="revenue"] .data-stat-change span');
    if (revenueChange) revenueChange.textContent = data.revenueChange;
    
    const trustBarFill = document.getElementById('trustBarFill');
    const trustValue = document.getElementById('trustValue');
    if (trustBarFill) { trustBarFill.style.width = data.trustLevel + '%'; }
    if (trustValue) { trustValue.textContent = getTrustLevel(data.trustLevel); }
    
    updateChart(scenario);
  }
  
  function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      element.textContent = current.toFixed(1) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  function animateRevenue(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      element.textContent = '¥' + current.toFixed(1) + '万';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  function getTrustLevel(score) {
    if (score >= 90) return 'A级';
    if (score >= 80) return 'B级';
    if (score >= 70) return 'C级';
    if (score >= 60) return 'D级';
    return 'E级';
  }
  
  // ============================================
  // Chart.js 图表
  // ============================================
  let revenueChart = null;
  
  function initChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (revenueChart) { revenueChart.destroy(); }
    
    const chartData = {
      review: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.2, 8.8, 9.1, 9.6, 10.5, 12.8] },
      pricing: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.5, 9.0, 9.8, 10.2, 11.5, 13.5] },
      vip: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.0, 8.5, 9.5, 10.8, 12.0, 14.2] },
      operation: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.8, 9.2, 9.5, 10.0, 10.8, 11.8] },
      knowledge: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.0, 8.8, 10.2, 11.5, 12.8, 13.8] },
      twin: { labels: ['1月', '2月', '3月', '4月', '5月', '6月'], data: [8.5, 9.5, 10.5, 12.0, 13.5, 14.5] }
    };
    
    const currentData = chartData[currentScenario] || chartData.review;
    
    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: currentData.labels,
        datasets: [{
          label: '月营收（万元）',
          data: currentData.data,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1E293B', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8, displayColors: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B' } },
          y: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B', callback: function(value) { return value + '万'; } } }
        }
      }
    });
  }
  
  function updateChart(scenario) {
    const chartData = {
      review: [8.2, 8.8, 9.1, 9.6, 10.5, 12.8],
      pricing: [8.5, 9.0, 9.8, 10.2, 11.5, 13.5],
      vip: [8.0, 8.5, 9.5, 10.8, 12.0, 14.2],
      operation: [8.8, 9.2, 9.5, 10.0, 10.8, 11.8],
      knowledge: [8.0, 8.8, 10.2, 11.5, 12.8, 13.8],
      twin: [8.5, 9.5, 10.5, 12.0, 13.5, 14.5]
    };
    
    if (revenueChart) {
      revenueChart.data.datasets[0].data = chartData[scenario] || chartData.review;
      revenueChart.update();
    }
  }
  
  // ============================================
  // 初始化 Demo
  // ============================================
  function initDemo() {
    if (typeof Chart !== 'undefined') {
      initChart();
    }
    
    const firstScenario = document.querySelector('.scenario-btn');
    if (firstScenario) {
      firstScenario.click();
    }
  }
  
  // ============================================
  // 平滑滚动到锚点
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // ============================================
  // 定价卡片交互
  // ============================================
  const pricingBtns = document.querySelectorAll('.pricing-btn');
  
  pricingBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });
  
  // ============================================
  // Item 15: 下载报表功能
  // ============================================
  function generateReportCSV() {
    const headers = ['日期', '场景', '线索数', '转化率', '月营收(万)', '信任等级', 'AI响应(ms)'];
    const rows = [
      ['2026-01-01', '好评提升', '45', '23.5%', '8.2', 'A', '120'],
      ['2026-01-02', '好评提升', '52', '24.1%', '8.8', 'A', '118'],
      ['2026-01-03', '好评提升', '48', '22.8%', '9.1', 'A', '125'],
      ['2026-01-04', '好评提升', '61', '25.3%', '9.6', 'A', '115'],
      ['2026-01-05', '好评提升', '58', '24.5%', '10.5', 'A', '122'],
      ['2026-01-06', '好评提升', '67', '26.2%', '11.2', 'A', '110'],
      ['2026-01-07', '好评提升', '72', '27.8%', '12.8', 'A', '108']
    ];
    
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '店赢OS_运营报表_2026-01-01_2026-01-07.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', generateReportCSV);
  }
  
  // ============================================
  // Item 16: 平台连接功能
  // ============================================
  const eleConnectBtn = document.getElementById('eleConnectBtn');
  const douyinConnectBtn = document.getElementById('douyinConnectBtn');
  const connectionModal = document.getElementById('connectionModal');
  const modalContent = connectionModal ? connectionModal.querySelector('.modal-content') : null;
  const modalTitle = connectionModal ? connectionModal.querySelector('.modal-title') : null;
  const modalBody = connectionModal ? connectionModal.querySelector('.modal-body-content') : null;
  const modalConfirmBtn = connectionModal ? connectionModal.querySelector('.modal-confirm-btn') : null;
  
  function showConnectionModal(platform, status) {
    if (!connectionModal) return;
    
    if (status === 'connecting') {
      if (modalTitle) modalTitle.textContent = '连接中...';
      if (modalBody) modalBody.innerHTML = '<div class="flex flex-col items-center py-4"><div class="spinner mb-4"></div><p class="text-gray-600">正在连接' + platform + '...</p></div>';
      if (modalConfirmBtn) { modalConfirmBtn.classList.add('hidden'); }
    } else if (status === 'success') {
      if (modalTitle) modalTitle.textContent = '连接成功';
      if (modalBody) modalBody.innerHTML = '<div class="flex flex-col items-center py-4"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div><p class="text-lg font-medium text-gray-800">已成功连接' + platform + '</p><p class="text-gray-500 mt-2">数据同步已自动开启</p></div>';
      if (modalConfirmBtn) { modalConfirmBtn.textContent = '完成'; modalConfirmBtn.classList.remove('hidden'); }
    }
    
    connectionModal.classList.remove('hidden');
  }
  
  function hideConnectionModal() {
    if (connectionModal) connectionModal.classList.add('hidden');
  }
  
  if (eleConnectBtn) {
    eleConnectBtn.addEventListener('click', function() {
      showConnectionModal('饿了么开放平台', 'connecting');
      eleConnectBtn.disabled = true;
      eleConnectBtn.innerHTML = '<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 连接中...';
      
      setTimeout(function() {
        eleConnectBtn.disabled = false;
        eleConnectBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        eleConnectBtn.classList.add('bg-green-500', 'connected');
        eleConnectBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 已连接';
        showConnectionModal('饿了么开放平台', 'success');
      }, 2000);
    });
  }
  
  if (douyinConnectBtn) {
    douyinConnectBtn.addEventListener('click', function() {
      showConnectionModal('抖音开放平台', 'connecting');
      douyinConnectBtn.disabled = true;
      douyinConnectBtn.innerHTML = '<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 连接中...';
      
      setTimeout(function() {
        douyinConnectBtn.disabled = false;
        douyinConnectBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        douyinConnectBtn.classList.add('bg-green-500', 'connected');
        douyinConnectBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 已连接';
        showConnectionModal('抖音开放平台', 'success');
      }, 2000);
    });
  }
  
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', hideConnectionModal);
  }
  
  // 点击模态框背景关闭
  if (connectionModal) {
    connectionModal.addEventListener('click', function(e) {
      if (e.target === connectionModal) hideConnectionModal();
    });
  }

  console.log('店赢OS v5 - 初始化完成');
});

// ============================================
// v6 新增功能
// ============================================

// ----------------------------------------
// 1. 暗色模式跟随系统偏好
// ----------------------------------------
(function initTheme() {
  const savedTheme = localStorage.getItem('dianying_os_theme');
  if (savedTheme) {
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    }
  }
  updateThemeIcon();
})();

// 更新主题图标
function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelectorAll('.moon-icon').forEach(el => el.classList.toggle('hidden', isDark));
  document.querySelectorAll('.sun-icon').forEach(el => el.classList.toggle('hidden', !isDark));
}

// Demo主题切换
const demoThemeToggle = document.getElementById('demoThemeToggle');
if (demoThemeToggle) {
  demoThemeToggle.addEventListener('click', function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dianying_os_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
  });
}

// ----------------------------------------
// 2. 门店切换功能
// ----------------------------------------
const storeSelector = document.getElementById('storeSelector');
const storeSelectorBtn = document.getElementById('storeSelectorBtn');
const storeDropdown = document.getElementById('storeDropdown');
const storeOptions = document.querySelectorAll('.store-option');

let currentStore = localStorage.getItem('dianying_os_store') || 'hotpot';

// 门店数据
const storeData = {
  hotpot: { icon: '🔥', name: '老码头火锅', tag: '旗舰店', industry: 'restaurant' },
  tea: { icon: '🧋', name: '茶悦时光', tag: '万象城店', industry: 'retail' },
  gym: { icon: '💪', name: '力健健身房', tag: '科技园店', industry: 'fitness' }
};

// 门店场景数据
const storeScenarios = {
  hotpot: {
    review: { rating: 4.8, negativeRate: 1.2, revenue: 128000, trustLevel: 92 },
    pricing: { rating: 4.7, negativeRate: 2.1, revenue: 135000, trustLevel: 88 },
    vip: { rating: 4.9, negativeRate: 0.8, revenue: 142000, trustLevel: 95 },
    operation: { rating: 4.6, negativeRate: 2.8, revenue: 118000, trustLevel: 85 },
    knowledge: { rating: 4.8, negativeRate: 1.5, revenue: 138000, trustLevel: 90 },
    twin: { rating: 4.9, negativeRate: 1.0, revenue: 145000, trustLevel: 94 }
  },
  tea: {
    review: { rating: 4.6, negativeRate: 2.5, revenue: 68000, trustLevel: 82 },
    pricing: { rating: 4.8, negativeRate: 1.8, revenue: 82000, trustLevel: 90 },
    vip: { rating: 4.7, negativeRate: 2.0, revenue: 75000, trustLevel: 86 },
    operation: { rating: 4.5, negativeRate: 3.2, revenue: 58000, trustLevel: 78 },
    knowledge: { rating: 4.6, negativeRate: 2.2, revenue: 72000, trustLevel: 84 },
    twin: { rating: 4.8, negativeRate: 1.5, revenue: 88000, trustLevel: 92 }
  },
  gym: {
    review: { rating: 4.4, negativeRate: 3.5, revenue: 95000, trustLevel: 75 },
    pricing: { rating: 4.5, negativeRate: 2.8, revenue: 105000, trustLevel: 80 },
    vip: { rating: 4.7, negativeRate: 1.5, revenue: 120000, trustLevel: 88 },
    operation: { rating: 4.3, negativeRate: 4.0, revenue: 88000, trustLevel: 72 },
    knowledge: { rating: 4.5, negativeRate: 2.5, revenue: 98000, trustLevel: 82 },
    twin: { rating: 4.6, negativeRate: 2.0, revenue: 110000, trustLevel: 86 }
  }
};

function updateStoreDisplay() {
  const data = storeData[currentStore];
  document.getElementById('currentStoreIcon').textContent = data.icon;
  document.getElementById('currentStoreName').textContent = data.name;
  
  storeOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.store === currentStore);
  });
  
  // 更新数据面板
  updateStoreData();
}

function updateStoreData() {
  const data = storeScenarios[currentStore][currentScenario || 'review'];
  
  const ratingValue = document.getElementById('ratingValue');
  const negativeValue = document.getElementById('negativeValue');
  const revenueValue = document.getElementById('revenueValue');
  const trustBarFill = document.getElementById('trustBarFill');
  const trustValue = document.getElementById('trustValue');
  
  if (ratingValue) ratingValue.textContent = data.rating;
  if (negativeValue) negativeValue.textContent = data.negativeRate + '%';
  if (revenueValue) revenueValue.textContent = '¥' + (data.revenue / 10000).toFixed(1) + '万';
  if (trustBarFill) trustBarFill.style.width = data.trustLevel + '%';
  if (trustValue) trustValue.textContent = getTrustLevel(data.trustLevel);
  
  // 更新状态条
  const statusTrustLevel = document.getElementById('statusTrustLevel');
  if (statusTrustLevel) statusTrustLevel.textContent = getTrustLevel(data.trustLevel);
}

if (storeSelectorBtn) {
  storeSelectorBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    storeSelector.classList.toggle('open');
  });
}

storeOptions.forEach(opt => {
  opt.addEventListener('click', function() {
    currentStore = this.dataset.store;
    localStorage.setItem('dianying_os_store', currentStore);
    updateStoreDisplay();
    storeSelector.classList.remove('open');
    
    // 清除聊天并重新加载
    chatMessages.innerHTML = '';
    if (currentScenario) loadScenarioChat(currentScenario);
  });
});

document.addEventListener('click', function() {
  if (storeSelector) storeSelector.classList.remove('open');
});

// ----------------------------------------
// 3. 通知系统
// ----------------------------------------
const notificationBell = document.getElementById('notificationBell');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const notificationBadge = document.getElementById('notificationBadge');
const notificationList = document.getElementById('notificationList');
const notificationClear = document.getElementById('notificationClear');

let notifications = [];
let unreadCount = 0;
let notificationInterval = null;

const notificationTemplates = [
  { icon: '🤖', text: '已自动回复1条差评（大众点评）' },
  { icon: '📈', text: '动态定价已调整：午市套餐 ¥38→¥42' },
  { icon: '⚠️', text: '检测到1条差评预警，正在处理...' },
  { icon: '✅', text: '会员王女士已成功召回' },
  { icon: '🔄', text: '跨店方案已同步至烧烤店' },
  { icon: '💡', text: '建议：午市套餐可提价至¥45，预计增收¥800' },
  { icon: '🎉', text: '今日营收突破新高：¥4,280' },
  { icon: '📊', text: '数字孪生模拟完成，最优定价¥48' },
  { icon: '👥', text: '新增3位高价值会员' },
  { icon: '🔔', text: '差评转化成功，用户已修改评价为好评' }
];

function addNotification(notif) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  notifications.unshift({ icon: notif.icon, text: notif.text, time });
  if (notifications.length > 10) notifications.pop();
  
  unreadCount++;
  updateNotificationBadge();
  renderNotifications();
}

function updateNotificationBadge() {
  if (notificationBadge) {
    notificationBadge.textContent = unreadCount;
    notificationBadge.classList.toggle('hidden', unreadCount === 0);
  }
}

function renderNotifications() {
  if (!notificationList) return;
  notificationList.innerHTML = notifications.map(n => `
    <div class="notification-item">
      <div class="notification-item-content">
        <span class="notification-item-icon">${n.icon}</span>
        <span class="notification-item-text">${n.text}</span>
      </div>
      <div class="notification-item-time">${n.time}</div>
    </div>
  `).join('');
}

function startNotificationTimer() {
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(() => {
    if (document.querySelector('.demo-page.active')) {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      addNotification(template);
    }
  }, 15000 + Math.random() * 10000);
}

if (notificationBtn) {
  notificationBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationBell.classList.toggle('open');
    unreadCount = 0;
    updateNotificationBadge();
  });
}

if (notificationClear) {
  notificationClear.addEventListener('click', function() {
    notifications = [];
    unreadCount = 0;
    updateNotificationBadge();
    renderNotifications();
  });
}

document.addEventListener('click', function(e) {
  if (notificationBell && !notificationBell.contains(e.target)) {
    notificationBell.classList.remove('open');
  }
});

// ----------------------------------------
// 4. 状态条
// ----------------------------------------
let taskCount = 47;
let taskInterval = null;

function updateStatusBar() {
  const taskCountEl = document.getElementById('taskCount');
  const runDaysEl = document.getElementById('runDays');
  if (taskCountEl) taskCountEl.textContent = taskCount;
  if (runDaysEl) runDaysEl.textContent = Math.floor(Math.random() * 10) + 20;
}

function startStatusTimer() {
  if (taskInterval) clearInterval(taskInterval);
  taskInterval = setInterval(() => {
    if (document.querySelector('.demo-page.active')) {
      taskCount++;
      updateStatusBar();
    }
  }, 30000);
}

// ----------------------------------------
// 5. 加载动画
// ----------------------------------------
const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

// ----------------------------------------
// 6. 引导蒙层
// ----------------------------------------
const guideOverlay = document.getElementById('guideOverlay');
const guideHighlight = document.getElementById('guideHighlight');
const guideTooltip = document.getElementById('guideTooltip');
const guideSteps = document.querySelectorAll('.guide-step');
let guideStep = 1;

const guidePositions = [
  { selector: '.chat-scenarios', tooltip: { top: '50%', left: '25%' } },
  { selector: '.chat-messages', tooltip: { top: '50%', left: '25%' } },
  { selector: '.data-panel-container', tooltip: { top: '30%', left: '70%' } }
];

function showGuide() {
  if (localStorage.getItem('dianying_os_guide_seen')) return;
  if (!guideOverlay) return;
  
  guideOverlay.classList.add('active');
  updateGuideStep();
}

function updateGuideStep() {
  guideSteps.forEach((step, i) => {
    step.classList.toggle('hidden', i + 1 !== guideStep);
  });
  
  const pos = guidePositions[guideStep - 1];
  const target = document.querySelector(pos.selector);
  if (target) {
    const rect = target.getBoundingClientRect();
    guideHighlight.style.cssText = `top: ${rect.top - 8}px; left: ${rect.left - 8}px; width: ${rect.width + 16}px; height: ${rect.height + 16}px;`;
    guideTooltip.style.cssText = `top: ${rect.top + rect.height + 20}px; left: ${Math.max(20, rect.left)}px;`;
  }
}

function nextGuideStep() {
  if (guideStep < 3) {
    guideStep++;
    updateGuideStep();
  } else {
    closeGuide();
  }
}

function closeGuide() {
  if (guideOverlay) guideOverlay.classList.remove('active');
  localStorage.setItem('dianying_os_guide_seen', 'true');
}

document.addEventListener('click', function(e) {
  if (e.target.id === 'guideNextBtn' || e.target.closest('#guideNextBtn')) {
    nextGuideStep();
  }
});

// ----------------------------------------
// 7. 日期选择弹窗
// ----------------------------------------
const downloadReportBtn = document.getElementById('downloadReportBtn');
const dateModal = document.getElementById('dateModal');
const dateOptions = document.querySelectorAll('.date-option');
const dateCustom = document.getElementById('dateCustom');
const dateStart = document.getElementById('dateStart');
const dateEnd = document.getElementById('dateEnd');
const dateCancel = document.getElementById('dateCancel');
const dateConfirm = document.getElementById('dateConfirm');
let selectedDays = 7;

if (downloadReportBtn) {
  downloadReportBtn.addEventListener('click', function() {
    dateModal.classList.add('active');
  });
}

dateOptions.forEach(opt => {
  opt.addEventListener('click', function() {
    dateOptions.forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
    selectedDays = this.dataset.days;
    if (selectedDays === 'custom') {
      dateCustom.classList.remove('hidden');
    } else {
      dateCustom.classList.add('hidden');
    }
  });
});

if (dateCancel) {
  dateCancel.addEventListener('click', function() {
    dateModal.classList.remove('active');
  });
}

if (dateConfirm) {
  dateConfirm.addEventListener('click', function() {
    const endDate = new Date();
    const startDate = new Date();
    
    if (selectedDays === 'custom') {
      startDate.setTime(dateEnd.value ? new Date(dateEnd.value).getTime() : endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate.setDate(endDate.getDate() - parseInt(selectedDays));
    }
    
    const fileName = `dianying_os_report_${formatDate(startDate)}_${formatDate(endDate)}.csv`;
    generateCSV(fileName);
    dateModal.classList.remove('active');
  });
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateCSV(fileName) {
  const data = storeScenarios[currentStore][currentScenario || 'review'];
  const rows = [
    ['日期', '门店', '评分', '差评率', '月营收', '信任等级'],
    [new Date().toLocaleDateString('zh-CN'), storeData[currentStore].name, data.rating, data.negativeRate + '%', data.revenue, getTrustLevel(data.trustLevel)]
  ];
  
  let csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ----------------------------------------
// 8. AI决策日志
// ----------------------------------------
const decisionLog = document.getElementById('decisionLog');
const decisionLogHeader = document.getElementById('decisionLogHeader');
const decisionLogList = document.getElementById('decisionLogList');
let decisionLogs = [];

const decisionTemplates = [
  { time: '09:15', tag: 'price', type: '调价', text: '午市套餐价格调整为¥38（原¥42），基于工作日客流预测' },
  { time: '09:32', tag: 'review', type: '差评', text: '已自动回复大众点评1条差评，涉及等位时间问题' },
  { time: '10:05', tag: 'vip', type: 'VIP', text: '识别到3位高流失风险会员，已发送个性化召回券' },
  { time: '11:20', tag: 'marketing', type: '营销', text: '雨天外卖满减策略已生效，满100减20' },
  { time: '13:45', tag: 'ops', type: '运营', text: '午市翻台率提升至3.2次/天，环比昨日+15%' },
  { time: '14:30', tag: 'price', type: '调价', text: '根据竞品分析，晚市主推套餐建议调整至¥58' },
  { time: '15:00', tag: 'review', type: '差评', text: '差评预警：检测到含"退款"关键词的新评价' },
  { time: '16:20', tag: 'vip', type: 'VIP', text: '会员张先生消费满5次，发送专属8折券' }
];

function initDecisionLogs() {
  decisionLogs = [
    { time: '09:15', tag: 'price', type: '调价', text: '午市套餐价格调整为¥38（原¥42），基于工作日客流预测' },
    { time: '09:32', tag: 'review', type: '差评', text: '已自动回复大众点评1条差评，涉及等位时间问题' },
    { time: '10:05', tag: 'vip', type: 'VIP', text: '识别到3位高流失风险会员，已发送个性化召回券' }
  ];
  renderDecisionLogs();
}

function addDecisionLog() {
  const templates = decisionTemplates.filter(t => !decisionLogs.find(l => l.text === t.text));
  if (templates.length === 0) return;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const now = new Date();
  template.time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  decisionLogs.unshift(template);
  if (decisionLogs.length > 8) decisionLogs.pop();
  renderDecisionLogs();
}

function renderDecisionLogs() {
  if (!decisionLogList) return;
  decisionLogList.innerHTML = decisionLogs.map(log => `
    <div class="decision-item">
      <span class="decision-time">${log.time}</span>
      <span class="decision-tag ${log.tag}">${log.type}</span>
      <span class="decision-text">${log.text}</span>
    </div>
  `).join('');
}

if (decisionLogHeader) {
  decisionLogHeader.addEventListener('click', function() {
    decisionLog.classList.toggle('expanded');
    const toggleText = decisionLog.classList.contains('expanded') ? '收起' : '展开';
    this.querySelector('.decision-log-toggle span').textContent = toggleText;
  });
}

// ----------------------------------------
// 9. 日报功能
// ----------------------------------------
const dailyReportBtnNav = document.getElementById('dailyReportBtnNav');
const dailyReportModal = document.getElementById('dailyReportModal');
const dailyReportClose = document.getElementById('dailyReportClose');
const dailyReportCloseBtn = document.getElementById('dailyReportCloseBtn');
const copyReportBtn = document.getElementById('copyReportBtn');

const dailySuggestions = [
  '建议优化午市套餐定价，当前翻台率有提升空间。',
  '周末客流预计增加30%，可适当上调高峰时段定价。',
  '会员复购率呈下降趋势，建议增加老客专属活动。',
  '雨天外卖需求上涨，建议加强外卖渠道推广。'
];

const dailyAlerts = [
  '王女士等3位VIP会员流失风险较高，建议发送专属优惠召回。',
  '近7天差评率上升0.3%，需关注服务质量和等位体验。',
  '竞品新开业，建议加强差异化营销，突出本店特色。',
  '下午茶时段客流量较低，可考虑推出下午茶套餐。'
];

if (dailyReportBtnNav) {
  dailyReportBtnNav.addEventListener('click', function() {
    const data = storeScenarios[currentStore][currentScenario || 'review'];
    document.getElementById('dailyReportDate').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) + ' 运营报告';
    document.getElementById('dailyRevenue').textContent = '¥' + Math.round(data.revenue / 30 * 100) / 100 + '万';
    document.getElementById('dailyReviews').textContent = Math.floor(Math.random() * 5 + 1) + '条';
    document.getElementById('dailyDecisions').textContent = Math.floor(Math.random() * 10 + 8) + '次';
    document.getElementById('dailyTrust').textContent = getTrustLevel(data.trustLevel);
    document.getElementById('dailySuggestion').textContent = dailySuggestions[Math.floor(Math.random() * dailySuggestions.length)];
    document.getElementById('dailyAlert').textContent = dailyAlerts[Math.floor(Math.random() * dailyAlerts.length)];
    dailyReportModal.classList.add('active');
  });
}

if (dailyReportClose) dailyReportClose.addEventListener('click', () => dailyReportModal.classList.remove('active'));
if (dailyReportCloseBtn) dailyReportCloseBtn.addEventListener('click', () => dailyReportModal.classList.remove('active'));

if (copyReportBtn) {
  copyReportBtn.addEventListener('click', function() {
    const text = document.getElementById('dailyReportDate').textContent + '\n' +
      '今日营收：' + document.getElementById('dailyRevenue').textContent + '\n' +
      '处理差评：' + document.getElementById('dailyReviews').textContent + '\n' +
      'AI决策：' + document.getElementById('dailyDecisions').textContent + '\n' +
      '信任等级：' + document.getElementById('dailyTrust').textContent + '\n\n' +
      '关键建议：' + document.getElementById('dailySuggestion').textContent + '\n' +
      '关注事项：' + document.getElementById('dailyAlert').textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyReportBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已复制';
      lucide.createIcons();
      setTimeout(() => {
        copyReportBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> 复制日报';
        lucide.createIcons();
      }, 2000);
    });
  });
}

// ----------------------------------------
// 10. 关于弹窗
// ----------------------------------------
const aboutBtn = document.getElementById('aboutBtn');
const aboutModal = document.getElementById('aboutModal');
const aboutClose = document.getElementById('aboutClose');

if (aboutBtn) {
  aboutBtn.addEventListener('click', function() {
    aboutModal.classList.add('active');
  });
}

if (aboutClose) aboutClose.addEventListener('click', () => aboutModal.classList.remove('active'));
if (aboutModal) aboutModal.addEventListener('click', function(e) {
  if (e.target === aboutModal) aboutModal.classList.remove('active');
});

// ----------------------------------------
// 11. 分享海报
// ----------------------------------------
const sharePosterModal = document.getElementById('sharePosterModal');
const sharePosterClose = document.getElementById('sharePosterClose');
const sharePosterCloseBtn = document.getElementById('sharePosterCloseBtn');
const savePosterBtn = document.getElementById('savePosterBtn');
const posterCanvas = document.getElementById('posterCanvas');

// 替换原来的分享功能
if (shareBtn) {
  shareBtn.replaceWith(shareBtn.cloneNode(true));
  document.getElementById('shareBtn').addEventListener('click', function() {
    generatePoster();
    sharePosterModal.classList.add('active');
  });
}

function generatePoster() {
  if (!posterCanvas) return;
  const ctx = posterCanvas.getContext('2d');
  const data = storeScenarios[currentStore][currentScenario || 'review'];
  
  // 背景
  const gradient = ctx.createLinearGradient(0, 0, 320, 400);
  gradient.addColorStop(0, '#6366F1');
  gradient.addColorStop(1, '#8B5CF6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 320, 400);
  
  // Logo区域
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('店赢OS', 160, 60);
  
  ctx.font = '14px system-ui';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('AI透视门店运营', 160, 85);
  
  // 数据卡片
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 30, 110, 260, 220, 16);
  ctx.fill();
  
  // 门店名称
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px system-ui';
  ctx.fillText(storeData[currentStore].name, 160, 145);
  
  // 数据
  ctx.font = '14px system-ui';
  ctx.fillText('门店评分', 80, 180);
  ctx.font = 'bold 24px system-ui';
  ctx.fillText(data.rating, 80, 210);
  
  ctx.font = '14px system-ui';
  ctx.fillText('差评率', 160, 180);
  ctx.font = 'bold 24px system-ui';
  ctx.fillText(data.negativeRate + '%', 160, 210);
  
  ctx.font = '14px system-ui';
  ctx.fillText('月营收', 240, 180);
  ctx.font = 'bold 24px system-ui';
  ctx.fillText('¥' + (data.revenue / 10000).toFixed(1) + '万', 240, 210);
  
  // 信任等级
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 14px system-ui';
  ctx.fillText('信任等级: ' + getTrustLevel(data.trustLevel), 160, 260);
  
  // 场景
  const scenarioNames = { review: '差评处理', pricing: '动态定价', vip: 'VIP管理', operation: '运营建议', knowledge: '跨店迁移', twin: '数字孪生' };
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '12px system-ui';
  ctx.fillText('当前场景: ' + scenarioNames[currentScenario || 'review'], 160, 295);
  
  // 底部
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px system-ui';
  ctx.fillText('体验地址: liuhuanxi-oss.github.io/dianying-os', 160, 380);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

if (savePosterBtn) {
  savePosterBtn.addEventListener('click', function() {
    if (!posterCanvas) return;
    const link = document.createElement('a');
    link.download = 'dianying_os_share.png';
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
    sharePosterModal.classList.remove('active');
  });
}

if (sharePosterClose) sharePosterClose.addEventListener('click', () => sharePosterModal.classList.remove('active'));
if (sharePosterCloseBtn) sharePosterCloseBtn.addEventListener('click', () => sharePosterModal.classList.remove('active'));

// ----------------------------------------
// 12. 对话自动轮播
// ----------------------------------------
let autoPlayTimer = null;
let isAutoPlaying = false;
let lastActivityTime = Date.now();
const scenarios = ['review', 'pricing', 'vip', 'operation', 'knowledge', 'twin'];
let currentAutoIndex = 0;

function startAutoPlay() {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    if (!document.querySelector('.demo-page.active')) return;
    if (Date.now() - lastActivityTime < 10000) return;
    
    if (!isAutoPlaying) {
      isAutoPlaying = true;
      autoPlayNext();
    }
  }, 10000);
}

function autoPlayNext() {
  if (!isAutoPlaying) return;
  
  currentAutoIndex = (currentAutoIndex + 1) % scenarios.length;
  const nextScenario = scenarios[currentAutoIndex];
  
  scenarioBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scenario === nextScenario);
  });
  
  chatMessages.innerHTML = '';
  currentScenario = nextScenario;
  loadScenarioChat(nextScenario);
  
  setTimeout(autoPlayNext, 8000);
}

function resetAutoPlayTimer() {
  lastActivityTime = Date.now();
  isAutoPlaying = false;
}

// 监听用户操作
document.addEventListener('click', function(e) {
  if (e.target.closest('.demo-page')) {
    resetAutoPlayTimer();
  }
});

document.addEventListener('keydown', function(e) {
  resetAutoPlayTimer();
});

// ----------------------------------------
// 13. 数据呼吸动画
// ----------------------------------------
let breatheAnimation = null;
let baseData = { rating: 4.8, negativeRate: 1.2, revenue: 128000 };

function startBreatheAnimation() {
  if (breatheAnimation) cancelAnimationFrame(breatheAnimation);
  
  function animate() {
    if (!document.querySelector('.demo-page.active')) {
      breatheAnimation = requestAnimationFrame(animate);
      return;
    }
    
    const time = Date.now() / 5000;
    const ratingVariation = Math.sin(time) * 0.1;
    const negativeVariation = Math.cos(time * 1.3) * 0.1;
    const revenueVariation = Math.sin(time * 0.7) * 100;
    
    const data = storeScenarios[currentStore][currentScenario || 'review'];
    baseData.rating = data.rating + ratingVariation;
    baseData.negativeRate = data.negativeRate + negativeVariation;
    baseData.revenue = data.revenue + revenueVariation;
    
    const ratingValue = document.getElementById('ratingValue');
    const negativeValue = document.getElementById('negativeValue');
    const revenueValue = document.getElementById('revenueValue');
    
    if (ratingValue) ratingValue.textContent = baseData.rating.toFixed(1);
    if (negativeValue) negativeValue.textContent = baseData.negativeRate.toFixed(1) + '%';
    if (revenueValue) revenueValue.textContent = '¥' + (baseData.revenue / 10000).toFixed(1) + '万';
    
    breatheAnimation = requestAnimationFrame(animate);
  }
  
  breatheAnimation = requestAnimationFrame(animate);
}

// ----------------------------------------
// 14. 快捷键支持
// ----------------------------------------
document.addEventListener('keydown', function(e) {
  // 如果在输入框中，只响应Escape
  if (e.target.closest('.chat-input')) {
    if (e.key === 'Escape') {
      showLanding();
    }
    return;
  }
  
  // 数字键1-6切换场景
  if (e.key >= '1' && e.key <= '6') {
    const scenarioMap = { '1': 'review', '2': 'pricing', '3': 'vip', '4': 'operation', '5': 'knowledge', '6': 'twin' };
    const scenario = scenarioMap[e.key];
    if (scenario && document.querySelector('.demo-page.active')) {
      scenarioBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scenario === scenario);
      });
      chatMessages.innerHTML = '';
      currentScenario = scenario;
      loadScenarioChat(scenario);
      resetAutoPlayTimer();
    }
  }
  
  // Escape返回首页
  if (e.key === 'Escape') {
    if (document.querySelector('.demo-page.active')) {
      showLanding();
    }
    if (aboutModal) aboutModal.classList.remove('active');
    if (dailyReportModal) dailyReportModal.classList.remove('active');
    if (sharePosterModal) sharePosterModal.classList.remove('active');
  }
  
  // D键进入Demo
  if (e.key === 'd' || e.key === 'D') {
    if (!document.querySelector('.demo-page.active')) {
      showDemo();
    }
  }
  
  // T键切换主题
  if (e.key === 't' || e.key === 'T') {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dianying_os_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
  }
});

// ----------------------------------------
// 15. 修改showDemo和showLanding
// ----------------------------------------
const originalShowDemo = showDemo;
const originalShowLanding = showLanding;

function showDemo() {
  landingPage.classList.add('hidden');
  demoPage.classList.add('active');
  window.scrollTo(0, 0);
  
  // 显示加载动画
  showLoading();
  
  setTimeout(() => {
    initDemo();
    hideLoading();
    document.getElementById('statusBar').classList.add('active');
    
    // 初始化门店
    updateStoreDisplay();
    
    // 初始化决策日志
    initDecisionLogs();
    
    // 启动定时器
    startNotificationTimer();
    startStatusTimer();
    startAutoPlay();
    startBreatheAnimation();
    
    // 显示引导
    setTimeout(showGuide, 500);
  }, 800);
}

function showLanding() {
  demoPage.classList.remove('active');
  landingPage.classList.remove('hidden');
  window.scrollTo(0, 0);
  
  // 停止定时器
  if (notificationInterval) clearInterval(notificationInterval);
  if (taskInterval) clearInterval(taskInterval);
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  if (breatheAnimation) cancelAnimationFrame(breatheAnimation);
  
  // 隐藏状态条
  const statusBar = document.getElementById('statusBar');
  if (statusBar) statusBar.classList.remove('active');
}

// ----------------------------------------
// 16. 新增平台连接按钮
// ----------------------------------------
const platformConnectBtns = ['xiaohongshuConnectBtn', 'weishiConnectBtn', 'amapConnectBtn', 'koubeiConnectBtn'];
platformConnectBtns.forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) {
    const platformName = btnId.replace('ConnectBtn', '').replace(/([A-Z])/g, ' $1').trim();
    btn.addEventListener('click', function() {
      showConnectionModal(platformName, 'connecting');
      btn.disabled = true;
      btn.innerHTML = '<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 连接中...';
      
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.add('connected');
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 已连接';
        showConnectionModal(platformName, 'success');
      }, 2000);
    });
  }
});

console.log('店赢OS v6 - 初始化完成');
