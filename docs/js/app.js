/**
 * 店赢OS - 交互逻辑 v5
 * 包含：滚动动画、FAQ折叠、Demo体验、多Agent协同、数字跳动动画、暗色模式、打字效果
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // 滚动渐入动画
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
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
  
  // 修复：重新定义addMessage（解决重复定义问题）
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
