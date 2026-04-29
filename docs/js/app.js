/**
 * 店赢OS - 交互逻辑 v7
 * 包含：滚动动画、FAQ折叠、Demo体验、多Agent协同、数字跳动动画、暗色模式、打字效果、雷达图、数字滚动
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
  // 雷达图初始化
  // ============================================
  function initRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['差评处理速度', '定价精准度', '会员留存率', '运营效率', '跨店复制能力'],
        datasets: [
          {
            label: '行业平均',
            data: [60, 50, 55, 45, 40],
            backgroundColor: 'rgba(203, 213, 225, 0.2)',
            borderColor: 'rgba(203, 213, 225, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(203, 213, 225, 1)',
            pointRadius: 4
          },
          {
            label: '店赢OS',
            data: [95, 88, 82, 92, 85],
            backgroundColor: 'rgba(124, 58, 237, 0.3)',
            borderColor: 'rgba(124, 58, 237, 1)',
            borderWidth: 2,
            pointBackgroundColor: '#7C3AED',
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              display: false
            },
            grid: {
              color: 'rgba(203, 213, 225, 0.3)'
            },
            angleLines: {
              color: 'rgba(203, 213, 225, 0.3)'
            },
            pointLabels: {
              font: {
                size: 12,
                weight: '500'
              },
              color: '#64748B'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8
          }
        }
      }
    });
  }
  
  // 等待页面加载后初始化雷达图
  setTimeout(initRadarChart, 100);
  
  // ============================================
  // 数字滚动动画 (IntersectionObserver)
  // ============================================
  function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;
      
      let displayValue;
      if (target >= 10000) {
        displayValue = Math.floor(current).toLocaleString();
      } else if (isDecimal) {
        displayValue = current.toFixed(1);
      } else {
        displayValue = Math.floor(current);
      }
      
      element.textContent = prefix + displayValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    counterObserver.observe(el);
  });
  
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
// 9. 日报功能 - 增强版三Tab
// ----------------------------------------
const dailyReportBtnNav = document.getElementById('dailyReportBtnNav');
const landingDailyReportBtn = document.getElementById('landingDailyReportBtn');
const dailyReportModal = document.getElementById('dailyReportModal');
const dailyReportClose = document.getElementById('dailyReportClose');
const dailyReportCloseBtn = document.getElementById('dailyReportCloseBtn');
const copyReportBtn = document.getElementById('copyReportBtn');
const pdfReportBtn = document.getElementById('pdfReportBtn');

// Tab 相关元素
const dailyTabBtns = document.querySelectorAll('.daily-tab-btn');
const dailyTabContents = document.querySelectorAll('.daily-tab-content');
const tabIndicator = document.querySelector('.daily-tab-indicator');

// 行业资讯数据
const industryNews = [
  {
    tag: 'dongtai',
    tagName: '餐饮动态',
    title: '美团发布2026餐饮白皮书：连锁化率突破28%',
    source: '36氪',
    time: '2小时前',
    summary: '报告指出，连锁餐饮品牌门店增速是独立门店的3.2倍，数字化运营能力成为核心分水岭。',
    analysis: '建议密切关注本品牌的连锁化进程，加速数字化升级以应对行业竞争加剧的趋势。'
  },
  {
    tag: 'dongtai',
    tagName: '餐饮动态',
    title: '抖音本地生活新增"AI智能套餐"功能',
    source: '界面新闻',
    time: '4小时前',
    summary: '商家可通过AI自动匹配菜品组合和定价策略，内测商家转化率提升15%。',
    analysis: '抖音平台的AI功能内测窗口已开启，建议尽快申请抢占流量红利。'
  },
  {
    tag: 'zhengce',
    tagName: '平台政策',
    title: '大众点评评价规则更新：商家回复时效纳入评分',
    source: '餐饮老板内参',
    time: '6小时前',
    summary: '2小时内回复差评的商家，评分权重加成0.1分，回复超24小时将扣分。',
    analysis: '新规今日生效，建议立即优化差评响应机制，AI自动回复间隔建议缩短至2分钟内。'
  },
  {
    tag: 'dongtai',
    tagName: '行业趋势',
    title: '小红书"探店笔记"算法调整，真实体验权重提升',
    source: '新榜',
    time: '3小时前',
    summary: '平台加大对模板化推广内容的降权力度，鼓励真实到店体验分享。',
    analysis: '品牌应加强真实用户口碑运营，避免过度营销化的推广内容。'
  },
  {
    tag: 'qushi',
    tagName: '行业趋势',
    title: '餐饮SaaS市场规模突破500亿，AI成最大增长点',
    source: '艾瑞咨询',
    time: '1天前',
    summary: '2026年Q1餐饮SaaS同比增长42%，AI功能模块成为商家选择系统的首要考量因素。',
    analysis: '选择具备AI能力的门店操作系统将成为行业主流，建议持续关注AI功能迭代。'
  },
  {
    tag: 'zhengce',
    tagName: '平台政策',
    title: '饿了么推出"雨天保底"计划，帮商家对冲天气风险',
    source: '饿了么商家端',
    time: '5小时前',
    summary: '参与商家雨天订单损失部分由平台补贴，首批覆盖18个城市。',
    analysis: '建议参与保底计划，降低天气因素对营收的影响。'
  }
];

// AI洞察数据
const aiInsights = {
  focus: [
    '大众点评回复时效新规今日生效，建议将AI差评自动回复间隔从3分钟缩短至2分钟，抢占评分加成。',
    '本周五将迎来"520"情侣消费高峰，建议提前备货并推出双人套餐，预计客流提升40%。',
    '竞品"老街火锅"本周开业，主打低价策略，建议强化本店特色优势，避免价格战。'
  ],
  warning: [
    '本周三有大雨预警（概率78%），历史数据显示堂食客流可能下降20-30%，需提前准备外卖策略。',
    '近7天差评率上升0.3%，主要集中在出餐速度，建议优化后厨流程。',
    '会员流失预警：张女士、李先生连续2个月未到店，建议发送专属召回券。'
  ],
  opportunity: [
    '抖音"AI智能套餐"内测资格开放中，建议立即申请，同类商家转化率提升15%。',
    '饿了么"雨天保底"计划正在招募，建议尽快报名，可降低天气风险。',
    '美团推出新商家流量扶持计划，开通首月可获得首页推荐位，建议把握窗口期。'
  ]
};

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

// 生成行业资讯HTML
function generateNewsHTML() {
  return industryNews.map((news, index) => `
    <div class="news-item">
      <div class="news-header">
        <span class="news-tag ${news.tag}">${news.tagName}</span>
        <div>
          <div class="news-title">📌 ${news.title}</div>
          <div class="news-meta">${news.source} · ${news.time}</div>
        </div>
      </div>
      <div class="news-summary">"${news.summary}"</div>
      <button class="news-expand" onclick="toggleNewsAnalysis(this)">
        <i data-lucide="chevron-down" class="w-3 h-3"></i>
        深度解读
      </button>
      <div class="news-deep-analysis">
        💡 <strong>AI分析：</strong>${news.analysis}
      </div>
    </div>
  `).join('');
}

// 切换资讯深度解读
window.toggleNewsAnalysis = function(btn) {
  const analysis = btn.nextElementSibling;
  const icon = btn.querySelector('i');
  analysis.classList.toggle('show');
  icon.style.transform = analysis.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
  btn.innerHTML = analysis.classList.contains('show') 
    ? '<i data-lucide="chevron-up" class="w-3 h-3"></i>收起解读'
    : '<i data-lucide="chevron-down" class="w-3 h-3"></i>深度解读';
  lucide.createIcons();
};

// Tab切换功能
function initTabSwitch() {
  if (!dailyTabBtns.length) return;
  
  // 初始化指示器位置
  updateTabIndicator(0);
  
  dailyTabBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // 更新按钮状态
      dailyTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 更新内容显示
      dailyTabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)) {
          content.classList.add('active');
        }
      });
      
      // 更新指示器
      updateTabIndicator(index);
    });
  });
}

function updateTabIndicator(index) {
  if (!tabIndicator || !dailyTabBtns[index]) return;
  const btn = dailyTabBtns[index];
  tabIndicator.style.left = btn.offsetLeft + 'px';
  tabIndicator.style.width = btn.offsetWidth + 'px';
}

// 显示日报弹窗
function showDailyReport() {
  const data = storeScenarios[currentStore][currentScenario || 'review'];
  
  // Tab 1: 运营概览
  document.getElementById('dailyReportDate').textContent = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) + ' 运营报告';
  document.getElementById('dailyRevenue').textContent = '¥' + Math.round(data.revenue / 30 * 100) / 100 + '万';
  document.getElementById('dailyReviews').textContent = Math.floor(Math.random() * 5 + 1) + '条';
  document.getElementById('dailyDecisions').textContent = Math.floor(Math.random() * 10 + 8) + '次';
  document.getElementById('dailyTrust').textContent = getTrustLevel(data.trustLevel);
  document.getElementById('dailySuggestion').textContent = dailySuggestions[Math.floor(Math.random() * dailySuggestions.length)];
  document.getElementById('dailyAlert').textContent = dailyAlerts[Math.floor(Math.random() * dailyAlerts.length)];
  
  // Tab 2: 行业资讯
  document.getElementById('newsList').innerHTML = generateNewsHTML();
  lucide.createIcons();
  
  // Tab 3: AI洞察 - 随机选择
  document.querySelector('#insightFocus .insight-text').textContent = aiInsights.focus[Math.floor(Math.random() * aiInsights.focus.length)];
  document.querySelector('#insightWarning .insight-text').textContent = aiInsights.warning[Math.floor(Math.random() * aiInsights.warning.length)];
  document.querySelector('#insightOpportunity .insight-text').textContent = aiInsights.opportunity[Math.floor(Math.random() * aiInsights.opportunity.length)];
  
  // 重置Tab到第一个
  dailyTabBtns.forEach(b => b.classList.remove('active'));
  dailyTabBtns[0].classList.add('active');
  dailyTabContents.forEach(c => c.classList.remove('active'));
  dailyTabContents[0].classList.add('active');
  updateTabIndicator(0);
  
  dailyReportModal.classList.add('active');
}

// Toast提示
function showToast(message) {
  let toast = document.querySelector('.daily-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'daily-toast';
    toast.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i><span></span>';
    document.body.appendChild(toast);
    lucide.createIcons();
  }
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// 绑定事件
if (dailyReportBtnNav) {
  dailyReportBtnNav.addEventListener('click', showDailyReport);
}

if (landingDailyReportBtn) {
  landingDailyReportBtn.addEventListener('click', showDailyReport);
}

if (dailyReportClose) dailyReportClose.addEventListener('click', () => dailyReportModal.classList.remove('active'));
if (dailyReportCloseBtn) dailyReportCloseBtn.addEventListener('click', () => dailyReportModal.classList.remove('active'));

// 复制全文功能
if (copyReportBtn) {
  copyReportBtn.addEventListener('click', function() {
    const reportDate = document.getElementById('dailyReportDate').textContent;
    const revenue = document.getElementById('dailyRevenue').textContent;
    const reviews = document.getElementById('dailyReviews').textContent;
    const decisions = document.getElementById('dailyDecisions').textContent;
    const trust = document.getElementById('dailyTrust').textContent;
    const suggestion = document.getElementById('dailySuggestion').textContent;
    const alert = document.getElementById('dailyAlert').textContent;
    const insightFocus = document.querySelector('#insightFocus .insight-text').textContent;
    const insightWarning = document.querySelector('#insightWarning .insight-text').textContent;
    const insightOpportunity = document.querySelector('#insightOpportunity .insight-text').textContent;
    
    let newsText = industryNews.map(news => 
      `• [${news.tagName}] ${news.title}\n  来源：${news.source} · ${news.time}\n  "${news.summary}"`
    ).join('\n\n');
    
    const fullReport = `# ${reportDate}

## 📊 运营概览

| 指标 | 数值 |
|------|------|
| 今日营收 | ${revenue} |
| 处理差评 | ${reviews} |
| AI决策 | ${decisions} |
| 信任等级 | ${trust} |

### 💡 关键建议
${suggestion}

### ⚠️ 关注事项
${alert}

## 📰 行业资讯

${newsText}

> 以上资讯由AI自动聚合自28+行业信源

## 💡 AI洞察

### 🎯 今日重点
${insightFocus}

### ⚠️ 风险提示
${insightWarning}

### 🚀 机会窗口
${insightOpportunity}

---
*由店赢OS智能生成*
`;
    
    navigator.clipboard.writeText(fullReport).then(() => {
      copyReportBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已复制';
      lucide.createIcons();
      showToast('日报已复制到剪贴板');
      setTimeout(() => {
        copyReportBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> 复制全文';
        lucide.createIcons();
      }, 2000);
    });
  });
}

// PDF生成功能
if (pdfReportBtn) {
  pdfReportBtn.addEventListener('click', function() {
    pdfReportBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> 生成中...';
    lucide.createIcons();
    
    setTimeout(() => {
      pdfReportBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已生成';
      pdfReportBtn.classList.add('generated');
      lucide.createIcons();
      showToast('PDF已生成（模拟功能）');
      
      setTimeout(() => {
        pdfReportBtn.innerHTML = '<i data-lucide="file-down" class="w-4 h-4"></i> PDF';
        pdfReportBtn.classList.remove('generated');
        lucide.createIcons();
      }, 2000);
    }, 1500);
  });
}

// 初始化Tab
initTabSwitch();

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
  gradient.addColorStop(0, '#7C3AED');
  gradient.addColorStop(1, '#A78BFA');
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


// ============================================
// v7 新功能：手机适配+5项创新功能
// ============================================

// ----------------------------------------
// 1. 多语言切换系统 (zh-CN/zh-TW/en)
// ----------------------------------------
const i18n = {
  'zh-CN': {
    back_home: '返回首页', daily_report: '日报', chat: '对话', data: '数据',
    review: '差评处理', pricing: '动态定价', vip: 'VIP管理', operation: '运营建议',
    knowledge: '跨店迁移', twin: '数字孪生',
    health_score: '门店健康评分', rating: '门店评分', negative: '差评率', revenue: '月营收',
    ai_efficiency: 'AI处理效率', excellent: '优秀', revenue_trend: '营收趋势',
    download_report: '下载报表', trust_level: '门店信任等级', platform_management: '平台管理',
    ai_manager: 'AI虚拟店长', store_service: '正在为你的门店服务',
    ai_thinking: 'AI正在思考...', chat_placeholder: '输入您的门店问题...',
    ai_running: 'AI店长运行中', tasks_processed: '已处理 {count} 条任务',
    running_days: '运行 {count} 天', trust_level_short: '信任等级',
    daily_report_title: '今日运营日报', tab_overview: '运营概览', tab_news: '行业资讯',
    tab_insight: 'AI洞察', today_revenue: '今日营收', processed_reviews: '处理差评',
    ai_decisions: 'AI决策', key_suggestions: '关键建议', attention_items: '关注事项',
    about_subtitle: 'Multi-Agent 门店操作系统', about_competition: '参赛赛事',
    about_tech: '技术栈', about_team: '团队成员', about_online: '在线体验',
    about_got_it: '知道了', share_poster: '分享海报', save_image: '保存图片', close: '关闭',
    voice_broadcast: '语音播报', rating_weight: '评分权重', negative_weight: '差评率权重',
    revenue_weight: '营收趋势权重', efficiency_weight: 'AI处理效率',
    quick_demo: '30秒体验', quick_demo_desc: '这就是AI帮你管店的效果，想试试其他场景吗？'
  },
  'zh-TW': {
    back_home: '返回首頁', daily_report: '日報', chat: '對話', data: '數據',
    review: '差評處理', pricing: '動態定價', vip: 'VIP管理', operation: '運營建議',
    knowledge: '跨店遷移', twin: '數字孿生',
    health_score: '門店健康評分', rating: '門店評分', negative: '差評率', revenue: '月營收',
    ai_efficiency: 'AI處理效率', excellent: '優秀', revenue_trend: '營收趨勢',
    download_report: '下載報表', trust_level: '門店信任等級', platform_management: '平台管理',
    ai_manager: 'AI虛擬店長', store_service: '正在為你的門店服務',
    ai_thinking: 'AI正在思考...', chat_placeholder: '輸入您的門店問題...',
    ai_running: 'AI店長運行中', tasks_processed: '已處理 {count} 條任務',
    running_days: '運行 {count} 天', trust_level_short: '信任等級',
    daily_report_title: '今日運營日報', tab_overview: '運營概覽', tab_news: '行業資訊',
    tab_insight: 'AI洞察', today_revenue: '今日營收', processed_reviews: '處理差評',
    ai_decisions: 'AI決策', key_suggestions: '關鍵建議', attention_items: '關注事項',
    about_subtitle: 'Multi-Agent 門店操作系統', about_competition: '參賽賽事',
    about_tech: '技術棧', about_team: '團隊成員', about_online: '在線體驗',
    about_got_it: '知道了', share_poster: '分享海報', save_image: '保存圖片', close: '關閉',
    voice_broadcast: '語音播報', rating_weight: '評分權重', negative_weight: '差評率權重',
    revenue_weight: '營收趨勢權重', efficiency_weight: 'AI處理效率',
    quick_demo: '30秒體驗', quick_demo_desc: '這就是AI幫你管店的效果，想試試其他場景嗎？'
  },
  'en': {
    back_home: 'Home', daily_report: 'Report', chat: 'Chat', data: 'Data',
    review: 'Review Handler', pricing: 'Dynamic Pricing', vip: 'VIP Management',
    operation: 'Operations', knowledge: 'Cross-Store', twin: 'Digital Twin',
    health_score: 'Health Score', rating: 'Store Rating', negative: 'Negative Rate',
    revenue: 'Monthly Revenue', ai_efficiency: 'AI Efficiency', excellent: 'Excellent',
    revenue_trend: 'Revenue Trend', download_report: 'Download', trust_level: 'Trust Level',
    platform_management: 'Platforms', ai_manager: 'AI Store Manager',
    store_service: 'Managing your store', ai_thinking: 'AI thinking...',
    chat_placeholder: 'Ask about your store...', ai_running: 'AI Manager Online',
    tasks_processed: '{count} tasks processed', running_days: 'Running {count} days',
    trust_level_short: 'Trust Level', daily_report_title: 'Daily Report',
    tab_overview: 'Overview', tab_news: 'Industry News', tab_insight: 'AI Insights',
    today_revenue: 'Today Revenue', processed_reviews: 'Reviews Handled',
    ai_decisions: 'AI Decisions', key_suggestions: 'Key Suggestions',
    attention_items: 'Attention Items', about_subtitle: 'Multi-Agent Store OS',
    about_competition: 'Competition', about_tech: 'Tech Stack', about_team: 'Team',
    about_online: 'Live Demo', about_got_it: 'Got it', share_poster: 'Share Poster',
    save_image: 'Save Image', close: 'Close', voice_broadcast: 'Voice Broadcast',
    rating_weight: 'Rating Score', negative_weight: 'Negative Rate',
    revenue_weight: 'Revenue Trend', efficiency_weight: 'AI Efficiency',
    quick_demo: '30s Demo', quick_demo_desc: 'This is how AI manages your store. Want to try other scenarios?'
  }
};

let currentLang = localStorage.getItem('dianying_os_lang') || 'zh-CN';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('dianying_os_lang', lang);
  const langLabels = { 'zh-CN': '简', 'zh-TW': '繁', 'en': 'EN' };
  const langCurrent = document.getElementById('langCurrent');
  if (langCurrent) langCurrent.textContent = langLabels[lang];
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang] && i18n[lang][key]) el.placeholder = i18n[lang][key];
  });
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  const langSelector = document.getElementById('langSelector');
  if (langSelector) langSelector.classList.remove('open');
}

const langSelector = document.getElementById('langSelector');
const langToggle = document.getElementById('langToggle');
if (langToggle) {
  langToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (langSelector) langSelector.classList.toggle('open');
  });
}
document.querySelectorAll('.lang-option').forEach(opt => {
  opt.addEventListener('click', function() { setLanguage(this.dataset.lang); });
});
document.addEventListener('click', function() {
  if (langSelector) langSelector.classList.remove('open');
});
setLanguage(currentLang);

// ----------------------------------------
// 2. 移动端Tab切换
// ----------------------------------------
const demoTabs = document.querySelectorAll('.demo-tab');
const demoContainer = document.getElementById('demoContainer');
if (demoTabs.length > 0 && demoContainer) {
  demoTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      demoTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      demoContainer.classList.remove('chat-active', 'data-active');
      demoContainer.classList.add(tabName + '-active');
    });
  });
  demoContainer.classList.add('chat-active');
}

// ----------------------------------------
// 4. AI门店健康评分
// ----------------------------------------
const healthScoreData = {
  review: { score: 92, rating: 90, negative: 85, revenue: 95, efficiency: 98 },
  pricing: { score: 88, rating: 85, negative: 78, revenue: 92, efficiency: 95 },
  vip: { score: 95, rating: 95, negative: 92, revenue: 90, efficiency: 98 },
  operation: { score: 82, rating: 80, negative: 72, revenue: 85, efficiency: 90 },
  knowledge: { score: 90, rating: 88, negative: 85, revenue: 94, efficiency: 92 },
  twin: { score: 94, rating: 92, negative: 90, revenue: 96, efficiency: 98 }
};

function updateHealthScore(scenario) {
  const data = healthScoreData[scenario] || healthScoreData.review;
  const scoreEl = document.getElementById('healthScoreValue');
  const progressEl = document.getElementById('healthProgress');
  if (scoreEl) scoreEl.textContent = data.score;
  if (progressEl) {
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (data.score / 100) * circumference;
    progressEl.style.strokeDashoffset = offset;
    progressEl.classList.remove('score-green', 'score-blue', 'score-yellow', 'score-red');
    if (data.score >= 90) progressEl.classList.add('score-green');
    else if (data.score >= 70) progressEl.classList.add('score-blue');
    else if (data.score >= 50) progressEl.classList.add('score-yellow');
    else progressEl.classList.add('score-red');
  }
  if (document.getElementById('ratingFill')) document.getElementById('ratingFill').style.width = data.rating + '%';
  if (document.getElementById('negativeFill')) document.getElementById('negativeFill').style.width = data.negative + '%';
  if (document.getElementById('revenueFill')) document.getElementById('revenueFill').style.width = data.revenue + '%';
  if (document.getElementById('efficiencyFill')) document.getElementById('efficiencyFill').style.width = data.efficiency + '%';
  if (document.getElementById('ratingScore')) document.getElementById('ratingScore').textContent = data.rating + '分';
  if (document.getElementById('negativeScore')) document.getElementById('negativeScore').textContent = data.negative + '分';
  if (document.getElementById('revenueScore')) document.getElementById('revenueScore').textContent = data.revenue + '分';
  if (document.getElementById('efficiencyScore')) document.getElementById('efficiencyScore').textContent = data.efficiency + '分';
}

const healthDetailBtn = document.getElementById('healthDetailBtn');
const healthScoreDetails = document.getElementById('healthScoreDetails');
if (healthDetailBtn && healthScoreDetails) {
  healthDetailBtn.addEventListener('click', () => healthScoreDetails.classList.toggle('expanded'));
}

// ----------------------------------------
// 5. 实时数据流效果
// ----------------------------------------
let streamInterval = null;
function startDataStream() {
  if (streamInterval) clearInterval(streamInterval);
  streamInterval = setInterval(() => {
    if (!document.querySelector('.demo-page.active')) return;
    const revenueEl = document.getElementById('revenueValue');
    if (revenueEl) { revenueEl.classList.add('updating'); setTimeout(() => revenueEl.classList.remove('updating'), 300); }
    const taskCountEl = document.getElementById('taskCount');
    if (taskCountEl && Math.random() > 0.7) taskCountEl.textContent = parseInt(taskCountEl.textContent) + 1;
  }, 5000);
}

// ----------------------------------------
// 6. 30秒快速体验引导
// ----------------------------------------
const quickDemoBtn = document.getElementById('quickDemoBtn');
let quickDemoActive = false;
if (quickDemoBtn) {
  quickDemoBtn.addEventListener('click', function() {
    if (quickDemoActive) return;
    quickDemoActive = true;
    showDemo();
    setTimeout(() => {
      const dataTab = document.querySelector('.demo-tab[data-tab="data"]');
      if (dataTab) dataTab.click();
      setTimeout(() => {
        const chatTab = document.querySelector('.demo-tab[data-tab="chat"]');
        if (chatTab) chatTab.click();
        const reviewBtn = document.querySelector('.scenario-btn[data-scenario="review"]');
        if (reviewBtn) reviewBtn.click();
        setTimeout(() => {
          const toast = document.getElementById('shareToast');
          if (toast) {
            toast.querySelector('span').textContent = i18n[currentLang]?.quick_demo_desc || '想试试其他场景吗？';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
          }
          quickDemoActive = false;
        }, 30000);
      }, 2000);
    }, 500);
  });
}

setTimeout(() => { updateHealthScore('review'); startDataStream(); }, 1000);

// 场景切换时更新健康评分
if (typeof loadScenarioChat === 'function') {
  const _loadScenarioChat = loadScenarioChat;
  window.loadScenarioChat = function(scenario) {
    updateHealthScore(scenario);
    return _loadScenarioChat(scenario);
  };
}

console.log('店赢OS v7 - 手机适配+5项新功能已加载');

// ============================================
// 15项新功能全家桶 JavaScript逻辑
// WAIC OPC 企服OS比赛 - 2026
// ============================================

// -----------------------------------------
// 1. ROI计算器
// -----------------------------------------
function calculateROI() {
  const revenue = parseFloat(document.getElementById('roiRevenue')?.value) || 0;
  const reviews = parseFloat(document.getElementById('roiReviews')?.value) || 0;
  const stores = parseFloat(document.getElementById('roiStores')?.value) || 0;
  const staff = parseFloat(document.getElementById('roiStaff')?.value) || 0;
  
  const reviewSaving = reviews * 100; // 每条差评节省100元
  const timeSaving = staff * 8 * 50; // 每人每天节省8小时，每小时50元
  const revenueGrowth = revenue * 0.15; // 营收增长15%
  const costSaving = stores * 2000; // 每店每月节省运营成本
  
  const total = reviewSaving + timeSaving + revenueGrowth + costSaving;
  const cost = 299; // 月费
  const roi = Math.round((total / cost) * 100);
  
  if (document.getElementById('roiReviewSaving')) {
    document.getElementById('roiReviewSaving').textContent = '¥' + reviewSaving.toLocaleString() + '/月';
  }
  if (document.getElementById('roiTotal')) {
    document.getElementById('roiTotal').textContent = '¥' + Math.round(total).toLocaleString();
  }
  if (document.getElementById('roiPercent')) {
    document.getElementById('roiPercent').textContent = roi + '%';
  }
  
  // 显示详细结果
  const resultsDiv = document.getElementById('roiResults');
  if (resultsDiv) {
    resultsDiv.style.animation = 'scaleIn 0.5s ease-out';
  }
}

const calcRoiBtn = document.getElementById('calcRoiBtn');
if (calcRoiBtn) {
  calcRoiBtn.addEventListener('click', calculateROI);
}

// -----------------------------------------
// 2. Multi-Agent通信可视化
// -----------------------------------------
const agentCommModal = document.getElementById('agentCommModal');
const agentCommClose = document.querySelector('.agent-comm-close');

function openAgentComm() {
  if (agentCommModal) {
    agentCommModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    initAgentAnimation();
  }
}

function closeAgentComm() {
  if (agentCommModal) {
    agentCommModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (agentCommClose) {
  agentCommClose.addEventListener('click', closeAgentComm);
}

if (agentCommModal) {
  agentCommModal.addEventListener('click', function(e) {
    if (e.target === agentCommModal) closeAgentComm();
  });
}

function initAgentAnimation() {
  const agentLog = document.getElementById('agentLog');
  if (!agentLog) return;
  
  const logs = [
    { agent: '线索Agent', text: '检测到客户进店，识别需求中...', time: '刚刚', color: '#06B6D4' },
    { agent: '方案Agent', text: '生成个性化推荐方案', time: '1秒前', color: '#7C3AED' },
    { agent: '交付Agent', text: 'VIP包间已预留，服务员就位', time: '2秒前', color: '#10B981' },
    { agent: '运营Agent', text: '更新客户画像，标记高价值客户', time: '3秒前', color: '#F97316' }
  ];
  
  logs.forEach((log, i) => {
    setTimeout(() => {
      const item = document.createElement('div');
      item.className = 'agent-log-item';
      item.style.animation = 'slideIn 0.3s ease-out';
      item.innerHTML = `
        <span class="agent-log-badge" style="background:${log.color}">${log.agent}</span>
        <span class="agent-log-text">${log.text}</span>
        <span class="agent-log-time">${log.time}</span>
      `;
      agentLog.appendChild(item);
      agentLog.scrollTop = agentLog.scrollHeight;
    }, i * 800);
  });
}

// -----------------------------------------
// 3. 错误恢复演示
// -----------------------------------------
const errorRecoverySteps = [
  { icon: '❌', status: 'error', title: '网络中断', desc: '检测到网络连接异常' },
  { icon: '🔄', status: 'processing', title: '自动重连', desc: '尝试恢复连接...' },
  { icon: '🔄', status: 'processing', title: '重试第1次', desc: '重新发送请求' },
  { icon: '🔄', status: 'processing', title: '重试第2次', desc: '切换备用服务器' },
  { icon: '✅', status: 'success', title: '恢复成功', desc: '数据已同步，业务正常运行' }
];

function simulateErrorRecovery() {
  const container = document.getElementById('errorRecoverySteps');
  if (!container) return;
  
  container.innerHTML = '';
  const progressFill = document.querySelector('.error-progress-fill');
  
  errorRecoverySteps.forEach((step, i) => {
    setTimeout(() => {
      const stepEl = document.createElement('div');
      stepEl.className = 'error-step';
      stepEl.style.animation = 'slideIn 0.3s ease-out';
      stepEl.innerHTML = `
        <div class="error-step-icon ${step.status}">${step.icon}</div>
        <div class="error-step-content">
          <h4>${step.title}</h4>
          <p>${step.desc}</p>
        </div>
      `;
      container.appendChild(stepEl);
      
      if (progressFill) {
        progressFill.style.width = ((i + 1) / errorRecoverySteps.length * 100) + '%';
      }
      
      container.scrollTop = container.scrollHeight;
    }, i * 1500);
  });
}

// -----------------------------------------
// 4. 客户旅程地图（滚动动画）
// -----------------------------------------
function initJourneyAnimation() {
  const journeySteps = document.querySelectorAll('.journey-step');
  if (!journeySteps.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.animation = 'slideIn 0.6s ease-out forwards';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 200);
      }
    });
  }, { threshold: 0.3 });
  
  journeySteps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    observer.observe(step);
  });
}

// -----------------------------------------
// 5. 智能排班建议
// -----------------------------------------
function initScheduleCard() {
  const scheduleData = {
    monday: 3, tuesday: 4, wednesday: 4, thursday: 5, 
    friday: 6, saturday: 7, sunday: 5
  };
  
  const scheduleGrid = document.querySelector('.schedule-grid');
  if (scheduleGrid) {
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    const keys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    scheduleGrid.innerHTML = keys.map((key, i) => `
      <div class="schedule-day">
        <div class="day-name">周${days[i]}</div>
        <div class="day-count">${scheduleData[key]}人</div>
      </div>
    `).join('');
  }
}

// -----------------------------------------
// 6. 社交媒体自动发文
// -----------------------------------------
function initSocialCard() {
  const platforms = document.querySelectorAll('.social-icon');
  platforms.forEach(p => {
    p.addEventListener('click', function() {
      platforms.forEach(pl => pl.style.opacity = '0.5');
      this.style.opacity = '1';
      showToast('已选择' + this.className.split(' ')[1] + '平台');
    });
  });
}

// -----------------------------------------
// 7. 商圈竞品监控
// -----------------------------------------
function initCompetitorCard() {
  const competitors = [
    { name: '老街火锅', score: 92, trend: 'up' },
    { name: '川味坊', score: 88, trend: 'up' },
    { name: '辣皇朝', score: 85, trend: 'down' },
    { name: '麻辣空间', score: 82, trend: 'up' }
  ];
  
  const listContainer = document.querySelector('.competitor-list');
  if (listContainer) {
    listContainer.innerHTML = competitors.map((c, i) => `
      <div class="competitor-item" style="animation: slideIn 0.3s ease-out ${i * 0.1}s both">
        <span class="competitor-rank">${i + 1}</span>
        <span class="competitor-name">${c.name}</span>
        <span class="competitor-score">${c.score}分</span>
        <span class="competitor-trend ${c.trend}">${c.trend === 'up' ? '↑ 2%' : '↓ 1%'}</span>
      </div>
    `).join('');
  }
}

// -----------------------------------------
// 8. 门店体检报告PDF
// -----------------------------------------
function generatePDFReport() {
  showToast('正在生成体检报告...');
  
  setTimeout(() => {
    // 创建打印内容
    const reportContent = `
      店赢OS - 门店体检报告
      生成时间: ${new Date().toLocaleString('zh-CN')}
      
      综合评分: 92分 (优秀)
      
      各维度评分:
      - 口碑评分: 90分
      - 风险管控: 85分
      - 营收能力: 95分
      - 运营效率: 98分
      
      改进建议:
      1. 加强晚高峰时段人手配置
      2. 优化差评回复话术
      3. 定期更新菜单定价策略
    `;
    
    // 使用window.print
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<pre>' + reportContent + '</pre>');
    printWindow.document.close();
    printWindow.print();
    
    showToast('报告已生成，请打印或保存');
  }, 1500);
}

const healthReportBtn = document.querySelector('.health-report-btn');
if (healthReportBtn) {
  healthReportBtn.addEventListener('click', generatePDFReport);
}

// -----------------------------------------
// 9. A/B策略对比面板
// -----------------------------------------
function initABPanel() {
  const abTabs = document.querySelectorAll('.ab-tab');
  const abComparison = document.querySelector('.ab-comparison');
  
  abTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      abTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const variant = this.dataset.variant;
      if (variant === 'a') {
        showToast('显示A方案详情');
      } else {
        showToast('显示B方案详情');
      }
    });
  });
}

// -----------------------------------------
// 10. RAG知识库可视化
// -----------------------------------------
function initRAGCard() {
  const chunks = document.querySelectorAll('.rag-chunk');
  chunks.forEach(chunk => {
    chunk.addEventListener('click', function() {
      chunks.forEach(c => c.classList.remove('highlight'));
      this.classList.add('highlight');
      showToast('选中知识片段: ' + this.dataset.score);
    });
  });
}

// -----------------------------------------
// 11. 门店数字孪生3D视图
// -----------------------------------------
let twinRotation = { x: 45, z: -10 };

function initTwinCard() {
  const twinFloor = document.querySelector('.twin-floor');
  const twinBtns = document.querySelectorAll('.twin-control-btn');
  
  twinBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      if (action === 'rotate-left') twinRotation.z -= 15;
      if (action === 'rotate-right') twinRotation.z += 15;
      if (action === 'rotate-up') twinRotation.x -= 10;
      if (action === 'rotate-down') twinRotation.x += 10;
      if (action === 'reset') twinRotation = { x: 45, z: -10 };
      
      if (twinFloor) {
        twinFloor.style.transform = `rotateX(${twinRotation.x}deg) rotateZ(${twinRotation.z}deg)`;
      }
    });
  });
  
  // 实时数据更新
  setInterval(() => {
    const stats = document.querySelectorAll('.twin-stat-value');
    if (stats[0]) stats[0].textContent = Math.floor(Math.random() * 10 + 20) + '人';
    if (stats[1]) stats[1].textContent = Math.floor(Math.random() * 10 + 70) + '%';
    if (stats[2]) stats[2].textContent = '¥' + (Math.random() * 5000 + 5000).toFixed(0);
  }, 3000);
}

// -----------------------------------------
// 12. 渐进式功能解锁引导
// -----------------------------------------
const guideSteps = [
  { target: '#healthScore', title: '健康评分', desc: '实时监控门店运营健康度' },
  { target: '.scenario-grid', title: '场景选择', desc: '体验AI虚拟店长的各项能力' },
  { target: '.ai-actions', title: '快捷操作', desc: '一键生成日报、获取建议' },
  { target: '#notificationPanel', title: '通知中心', desc: '查看AI智能提醒和通知' }
];

let currentGuideStep = 0;
let guideActive = false;

function startProgressiveGuide() {
  if (guideActive) return;
  guideActive = true;
  currentGuideStep = 0;
  
  const guide = document.getElementById('progressiveGuide');
  if (!guide) {
    createProgressiveGuide();
    return;
  }
  guide.classList.add('active');
  showGuideStep(0);
}

function createProgressiveGuide() {
  const guideHTML = `
    <div class="progressive-guide" id="progressiveGuide">
      <div class="progressive-overlay"></div>
      <div class="progressive-highlight" id="guideHighlight"></div>
      <div class="progressive-tooltip" id="guideTooltip">
        <div class="progressive-step-indicator" id="guideIndicator"></div>
        <div class="progressive-title" id="guideTitle"></div>
        <div class="progressive-desc" id="guideDesc"></div>
        <div class="progressive-actions">
          <button class="progressive-skip" onclick="skipGuide()">跳过</button>
          <button class="progressive-next" onclick="nextGuideStep()">下一步</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', guideHTML);
  document.getElementById('progressiveGuide').classList.add('active');
  showGuideStep(0);
}

function showGuideStep(index) {
  if (index >= guideSteps.length) {
    skipGuide();
    return;
  }
  
  const step = guideSteps[index];
  const target = document.querySelector(step.target);
  const highlight = document.getElementById('guideHighlight');
  const tooltip = document.getElementById('guideTooltip');
  const title = document.getElementById('guideTitle');
  const desc = document.getElementById('guideDesc');
  const indicator = document.getElementById('guideIndicator');
  
  if (!target || !highlight || !tooltip) return;
  
  const rect = target.getBoundingClientRect();
  highlight.style.cssText = `
    left: ${rect.left - 10}px;
    top: ${rect.top - 10}px;
    width: ${rect.width + 20}px;
    height: ${rect.height + 20}px;
  `;
  
  tooltip.style.cssText = `
    left: ${rect.left + rect.width / 2 - 160}px;
    top: ${rect.bottom + 20}px;
  `;
  
  title.textContent = step.title;
  desc.textContent = step.desc;
  
  // 更新指示器
  if (indicator) {
    indicator.innerHTML = guideSteps.map((_, i) => 
      `<div class="progressive-step-dot ${i === index ? 'active' : ''} ${i < index ? 'completed' : ''}"></div>`
    ).join('');
  }
  
  // 更新按钮文字
  const nextBtn = tooltip.querySelector('.progressive-next');
  if (nextBtn) nextBtn.textContent = index === guideSteps.length - 1 ? '完成' : '下一步';
  
  currentGuideStep = index;
}

function nextGuideStep() {
  showGuideStep(currentGuideStep + 1);
}

function skipGuide() {
  const guide = document.getElementById('progressiveGuide');
  if (guide) guide.classList.remove('active');
  guideActive = false;
  localStorage.setItem('guideCompleted', 'true');
}

// -----------------------------------------
// 13. 限时优惠倒计时
// -----------------------------------------
let countdownInterval = null;
const COUNTDOWN_KEY = 'countdownDismissed';
const COUNTDOWN_END = new Date('2026-08-15T23:59:59').getTime();

function initCountdown() {
  // 检查是否已关闭
  if (localStorage.getItem(COUNTDOWN_KEY)) return;
  
  const countdownBar = document.getElementById('countdownBar');
  const countdownClose = document.querySelector('.countdown-close');
  
  if (countdownClose) {
    countdownClose.addEventListener('click', dismissCountdown);
  }
  
  // 3秒后显示
  setTimeout(() => {
    if (countdownBar) countdownBar.classList.add('active');
    startCountdownTimer();
  }, 3000);
}

function dismissCountdown() {
  const countdownBar = document.getElementById('countdownBar');
  if (countdownBar) {
    countdownBar.classList.add('closing');
    setTimeout(() => countdownBar.classList.remove('active', 'closing'), 400);
  }
  localStorage.setItem(COUNTDOWN_KEY, 'true');
  if (countdownInterval) clearInterval(countdownInterval);
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  
  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = COUNTDOWN_END - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.querySelectorAll('.countdown-value')[0]?.setAttribute('data-value', days);
    document.querySelectorAll('.countdown-value')[1]?.setAttribute('data-value', hours);
    document.querySelectorAll('.countdown-value')[2]?.setAttribute('data-value', minutes);
    document.querySelectorAll('.countdown-value')[3]?.setAttribute('data-value', seconds);
    
    const dayEl = document.querySelector('.countdown-unit:nth-child(1) .countdown-value');
    const hourEl = document.querySelector('.countdown-unit:nth-child(2) .countdown-value');
    const minEl = document.querySelector('.countdown-unit:nth-child(3) .countdown-value');
    const secEl = document.querySelector('.countdown-unit:nth-child(4) .countdown-value');
    
    if (dayEl) dayEl.textContent = days;
    if (hourEl) hourEl.textContent = hours.toString().padStart(2, '0');
    if (minEl) minEl.textContent = minutes.toString().padStart(2, '0');
    if (secEl) secEl.textContent = seconds.toString().padStart(2, '0');
  }, 1000);
}

// -----------------------------------------
// 14. 推荐返利机制
// -----------------------------------------
function initReferralSection() {
  const copyBtn = document.querySelector('.referral-copy-btn');
  const linkField = document.querySelector('.referral-link-field');
  
  if (copyBtn && linkField) {
    copyBtn.addEventListener('click', function() {
      const link = linkField.value;
      navigator.clipboard.writeText(link).then(() => {
        this.textContent = '已复制 ✓';
        this.classList.add('copied');
        showToast('推荐链接已复制到剪贴板');
        
        setTimeout(() => {
          this.textContent = '复制链接';
          this.classList.remove('copied');
        }, 2000);
      });
    });
  }
  
  // 模拟统计数据
  const referralStats = document.querySelectorAll('.referral-stat-value');
  if (referralStats[0]) referralStats[0].textContent = '23';
  if (referralStats[1]) referralStats[1].textContent = '¥5,980';
  if (referralStats[2]) referralStats[2].textContent = '¥2,990';
}

// -----------------------------------------
// 15. 客户成功案例视频区
// -----------------------------------------
const videoModal = document.getElementById('videoModal');
const videoModalClose = document.querySelector('.video-modal-close');

function openVideoModal(caseId) {
  if (videoModal) {
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 根据caseId设置视频信息
    const videoInfo = videoModal.querySelector('.video-info');
    if (videoInfo) {
      const titles = {
        1: '湘菜馆张老板：差评转化率提升85%',
        2: '火锅店李总：节省运营成本60%',
        3: '粤菜馆王女士：营收同比增长120%'
      };
      const descs = {
        1: '通过店赢OS的差评自动处理功能，3个月内将差评转化率从35%提升到85%',
        2: 'AI智能排班和动态定价让人力成本降低40%，整体运营效率提升60%',
        3: '精准的客户画像和营销自动化让淡季营收增长120%'
      };
      if (videoInfo.querySelector('h4')) videoInfo.querySelector('h4').textContent = titles[caseId] || titles[1];
      if (videoInfo.querySelector('p')) videoInfo.querySelector('p').textContent = descs[caseId] || descs[1];
    }
  }
}

function closeVideoModal() {
  if (videoModal) {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (videoModalClose) {
  videoModalClose.addEventListener('click', closeVideoModal);
}

if (videoModal) {
  videoModal.addEventListener('click', function(e) {
    if (e.target === videoModal) closeVideoModal();
  });
}

// 绑定视频卡片点击
document.querySelectorAll('.case-card').forEach((card, i) => {
  card.addEventListener('click', () => openVideoModal(i + 1));
});

// -----------------------------------------
// Demo新增场景按钮
// -----------------------------------------
function initScenarioNewBtns() {
  const newBtns = document.querySelectorAll('.scenario-new-btn');
  newBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      newBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const scenario = this.dataset.scenario;
      if (scenario === 'agent') {
        openAgentComm();
      } else if (scenario === 'error') {
        simulateErrorRecovery();
      } else if (scenario === 'marketing') {
        showToast('社交媒体自动发文功能演示');
      }
    });
  });
}

// -----------------------------------------
// 初始化所有新功能
// -----------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  initJourneyAnimation();
  initScheduleCard();
  initSocialCard();
  initCompetitorCard();
  initABPanel();
  initRAGCard();
  initTwinCard();
  initReferralSection();
  initScenarioNewBtns();
  
  // 延迟初始化倒计时和引导
  setTimeout(() => {
    initCountdown();
    if (!localStorage.getItem('guideCompleted')) {
      // 可选：启动引导
      // startProgressiveGuide();
    }
  }, 2000);
  
  console.log('店赢OS v15 - 15项新功能全家桶已加载 ✓');
});

// ==================== 数据大屏驾驶舱功能 ====================
let dashboardChart = null;
let memberChart = null;

// 初始化数据大屏
function initDashboard() {
  const dashboard = document.getElementById('dataDashboard');
  if (!dashboard) return;
  
  dashboard.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  initDashboardClock();
  initRevenueChart();
  initMemberChart();
  initSparklines();
  initStoreMarkers();
  initAgentNodes();
  initNewsTicker();
  
  // 数字滚动效果
  animateMetrics();
}

// 退出数据大屏
function exitDashboard() {
  const dashboard = document.getElementById('dataDashboard');
  if (!dashboard) return;
  
  dashboard.classList.remove('active');
  document.body.style.overflow = '';
  
  // 停止所有动画
  if (dashboardChart) {
    dashboardChart.destroy();
    dashboardChart = null;
  }
  if (memberChart) {
    memberChart.destroy();
    memberChart = null;
  }
}

// 初始化时钟
function initDashboardClock() {
  const clockEl = document.getElementById('dashboardTime');
  if (!clockEl) return;
  
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    
    // 更新日期
    const dateEl = document.getElementById('dashboardDate');
    if (dateEl) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      dateEl.textContent = now.toLocaleDateString('zh-CN', options);
    }
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

// 初始化营收趋势图
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  const data = [12, 8, 45, 78, 65, 89, 52];
  
  if (dashboardChart) dashboardChart.destroy();
  
  dashboardChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '营收(万元)',
        data: data,
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#7C3AED'
      }, {
        label: '昨日',
        data: [10, 6, 38, 65, 58, 72, 45],
        borderColor: 'rgba(6, 182, 212, 0.5)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(20, 25, 50, 0.9)',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.7)',
          borderColor: 'rgba(124, 58, 237, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }
        }
      }
    }
  });
  
  // 模拟实时更新
  setInterval(() => {
    if (!document.getElementById('dataDashboard')?.classList.contains('active')) return;
    const newData = data.map(v => v + (Math.random() - 0.5) * 10);
    dashboardChart.data.datasets[0].data = newData;
    dashboardChart.update('none');
  }, 3000);
}

// 初始化会员环形图
function initMemberChart() {
  const ctx = document.getElementById('dashboardMemberChart');
  if (!ctx) return;
  
  if (memberChart) memberChart.destroy();
  
  memberChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['高活跃', '中等活跃', '低活跃', '沉默用户'],
      datasets: [{
        data: [35, 28, 22, 15],
        backgroundColor: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(20, 25, 50, 0.9)',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.7)'
        }
      }
    }
  });
}

// 初始化迷你折线图
function initSparklines() {
  document.querySelectorAll('.sparkline').forEach(el => {
    const values = Array.from({length: 12}, () => Math.random() * 50 + 25);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');
    
    el.innerHTML = `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:0.3"/>
            <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:0"/>
          </linearGradient>
        </defs>
        <polygon points="0,100 ${points} 100,100" fill="url(#sparkGrad)"/>
        <polyline points="${points}" fill="none" stroke="#7C3AED" stroke-width="2" vector-effect="non-scaling-stroke"/>
      </svg>
    `;
  });
}

// 初始化门店标记
function initStoreMarkers() {
  const markers = document.querySelectorAll('.store-marker');
  markers.forEach((marker, i) => {
    marker.style.left = `${15 + Math.random() * 70}%`;
    marker.style.top = `${15 + Math.random() * 70}%`;
    marker.style.background = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'][i % 4];
    
    marker.addEventListener('click', () => {
      markers.forEach(m => m.classList.remove('active'));
      marker.classList.add('active');
      
      // 显示门店信息
      if (storeInfo) {
        storeInfo.style.display = 'block';
        storeInfo.querySelector('.store-name').textContent = `门店 ${i + 1}`;
      }
    });
  });
  
  // 随机高亮
  setInterval(() => {
    if (!document.getElementById('dataDashboard')?.classList.contains('active')) return;
    const randomMarker = markers[Math.floor(Math.random() * markers.length)];
    markers.forEach(m => m.classList.remove('active'));
    randomMarker.classList.add('active');
  }, 3000);
}

// 初始化Agent节点
function initAgentNodes() {
  const nodes = document.querySelectorAll('.agent-node:not(.center)');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.style.transform = '');
      node.style.transform = 'scale(1.15)';
    });
  });
}

// 初始化滚动通知
function initNewsTicker() {
  const ticker = document.querySelector('.ticker-text');
  if (!ticker) return;
  
  // 复制内容实现无缝滚动
  ticker.innerHTML += ticker.innerHTML;
}

// 数字动画
function animateMetrics() {
  document.querySelectorAll('.metric-value[data-value]').forEach(el => {
    const target = parseFloat(el.dataset.value);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 30;
    
    const animate = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + suffix;
      if (current < target) requestAnimationFrame(animate);
    };
    
    animate();
  });
}

// 大屏按钮事件
document.addEventListener('DOMContentLoaded', () => {
  const dashboardBtn = document.getElementById('dashboardBtn');
  const landingDashboardBtn = document.getElementById('landingDashboardBtn');
  const dashboardExitBtn = document.getElementById('dashboardExitBtn');
  
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', initDashboard);
  }
  
  if (landingDashboardBtn) {
    landingDashboardBtn.addEventListener('click', initDashboard);
  }
  
  if (dashboardExitBtn) {
    dashboardExitBtn.addEventListener('click', exitDashboard);
  }
  
  // ESC退出大屏
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exitDashboard();
      closeStoreCompare();
      closeShortcutsHelp();
    }
    // 按D键打开大屏
    if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        const dash = document.getElementById('dataDashboard');
        if (!dash.classList.contains('active')) {
          initDashboard();
        }
      }
    }
    // ?键显示快捷键帮助
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      openShortcutsHelp();
    }
  });
});

// ==================== 快捷操作FAB按钮 ====================
let fabExpanded = false;

function toggleFab() {
  fabExpanded = !fabExpanded;
  const fabMain = document.querySelector('.fab-main');
  const fabItems = document.querySelector('.fab-items');
  
  if (fabExpanded) {
    fabMain.classList.add('active');
    fabItems.classList.add('expanded');
  } else {
    fabMain.classList.remove('active');
    fabItems.classList.remove('expanded');
  }
}

function fabAction(type) {
  toggleFab();
  
  switch(type) {
    case 'message':
      toggleNotificationPanel();
      break;
    case 'ai':
      toggleAIActionCards();
      break;
    case 'compare':
      openStoreCompare();
      break;
    case 'activity':
      toggleActivityBar();
      break;
    case 'shortcuts':
      openShortcutsHelp();
      break;
  }
}

// ==================== 增强消息中心 ====================
function toggleNotificationPanel() {
  const panel = document.querySelector('.enhanced-notification-panel');
  if (panel) {
    panel.classList.toggle('open');
  }
}

function switchNotificationTab(tab) {
  document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.notification-tab.${tab}`)?.classList.add('active');
  
  // 模拟筛选
  document.querySelectorAll('.notification-item').forEach(item => {
    const priority = item.dataset.priority;
    if (tab === 'all' || priority === tab) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ==================== AI建议行动卡 ====================
function toggleAIActionCards() {
  const cards = document.querySelector('.ai-action-cards');
  if (cards) {
    cards.classList.toggle('active');
  }
}

function executeAction(cardIndex) {
  const actions = [
    () => showToast('正在调整门店A库存策略...'),
    () => showToast('已推送优惠券给高价值用户'),
    () => showToast('已安排员工培训计划')
  ];
  
  actions[cardIndex]?.();
  toggleAIActionCards();
}

// ==================== 门店对比面板 ====================
function openStoreCompare() {
  const panel = document.querySelector('.store-compare-panel');
  if (panel) {
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeStoreCompare() {
  const panel = document.querySelector('.store-compare-panel');
  if (panel) {
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ==================== 实时活动流 ====================
function toggleActivityBar() {
  const bar = document.querySelector('.realtime-activity-bar');
  if (bar) {
    bar.classList.toggle('active');
  }
}

// ==================== 快捷键帮助 ====================
function openShortcutsHelp() {
  const help = document.querySelector('.shortcuts-help');
  if (help) {
    help.classList.add('open');
  }
}

function closeShortcutsHelp() {
  const help = document.querySelector('.shortcuts-help');
  if (help) {
    help.classList.remove('open');
  }
}

// Toast提示
function showToast(message) {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #7C3AED, #06B6D4);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 0.9rem;
    z-index: 3000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}


// ============================================
// 新版Demo UI v8 - 交互逻辑
// ============================================

// 页面导航
const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
const pageContents = document.querySelectorAll('.page-content');
const topbarBreadcrumb = document.getElementById('topbarBreadcrumb');
const demoSidebar = document.getElementById('demoSidebar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');

// 侧边栏折叠
if (sidebarCollapseBtn) {
  sidebarCollapseBtn.addEventListener('click', () => {
    demoSidebar.classList.toggle('expanded');
    const icon = sidebarCollapseBtn.querySelector('i');
    if (demoSidebar.classList.contains('expanded')) {
      icon.setAttribute('data-lucide', 'chevrons-left');
    } else {
      icon.setAttribute('data-lucide', 'chevrons-right');
    }
    lucide.createIcons();
  });
}

// 页面切换
function switchPage(pageName, breadcrumb) {
  // 更新侧边栏选中状态
  sidebarNavItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // 更新页面内容
  pageContents.forEach(page => {
    page.classList.toggle('active', page.id === 'page' + pageName.charAt(0).toUpperCase() + pageName.slice(1));
  });
  
  // 更新面包屑
  if (topbarBreadcrumb) {
    topbarBreadcrumb.textContent = breadcrumb;
  }
  
  // 初始化页面图表
  if (pageName === 'overview') {
    initOverviewCharts();
  } else if (pageName === 'data') {
    initDataCharts();
  }
}

sidebarNavItems.forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    const breadcrumbMap = {
      overview: '运营概览',
      chat: 'AI对话',
      data: '数据报表',
      platform: '平台管理',
      logs: '决策日志'
    };
    switchPage(page, breadcrumbMap[page] || '概览');
  });
});

// 概览页图表
function initOverviewCharts() {
  const revenueChartEl = document.getElementById('revenueChart');
  if (revenueChartEl && typeof Chart !== 'undefined') {
    // 清除旧图表
    const existingChart = Chart.getChart(revenueChartEl);
    if (existingChart) existingChart.destroy();
    
    const ctx = revenueChartEl.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '营收(万)',
          data: [11.2, 12.8, 10.9, 13.5, 12.1, 14.2, 13.8],
          borderColor: '#7C3AED',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7C3AED',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }
}

// 数据页图表
function initDataCharts() {
  // 营收趋势
  const dataRevenueEl = document.getElementById('dataRevenueChart');
  if (dataRevenueEl && typeof Chart !== 'undefined') {
    const existing = Chart.getChart(dataRevenueEl);
    if (existing) existing.destroy();
    
    new Chart(dataRevenueEl.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '营收',
          data: [11.2, 12.8, 10.9, 13.5, 12.1, 14.2, 13.8],
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: '订单',
          data: [380, 420, 365, 445, 398, 478, 461],
          borderColor: '#06B6D4',
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          x: { grid: { display: false } },
          y: { type: 'linear', position: 'left', grid: { color: '#F1F5F9' } },
          y1: { type: 'linear', position: 'right', grid: { display: false } }
        }
      }
    });
  }
  
  // 订单分布饼图
  const orderPieEl = document.getElementById('orderPieChart');
  if (orderPieEl && typeof Chart !== 'undefined') {
    const existing = Chart.getChart(orderPieEl);
    if (existing) existing.destroy();
    
    new Chart(orderPieEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['美团', '点评', '饿了么', '抖音', '其他'],
        datasets: [{
          data: [35, 25, 15, 15, 10],
          backgroundColor: ['#7C3AED', '#A78BFA', '#06B6D4', '#F59E0B', '#94A3B8'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } }
      }
    });
  }
}

// AI助手浮窗
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiFloatPanel = document.getElementById('aiFloatPanel');
const aiFloatClose = document.getElementById('aiFloatClose');

if (aiAssistantBtn) {
  aiAssistantBtn.addEventListener('click', () => {
    aiFloatPanel.classList.toggle('show');
  });
}

if (aiFloatClose) {
  aiFloatClose.addEventListener('click', () => {
    aiFloatPanel.classList.remove('show');
  });
}

// AI浮窗场景点击
const aiFloatScenes = document.querySelectorAll('.ai-float-scene');
aiFloatScenes.forEach(scene => {
  scene.addEventListener('click', () => {
    const scenario = scene.dataset.scenario;
    // 切换到对话页
    switchPage('chat', 'AI对话');
    aiFloatPanel.classList.remove('show');
    // 加载对应场景
    if (typeof loadScenarioChat === 'function' && scenario) {
      loadScenarioChat(scenario);
    }
  });
});

// 轮播词条
const carouselTexts = [
  '今日客流+15%，表现优秀',
  '3条差评已自动处理',
  '午市调价建议已生成',
  '王女士等VIP待召回',
  '雨天策略已自动执行'
];
let carouselIndex = 0;
const aiCarouselText = document.getElementById('aiCarouselText');

function updateCarousel() {
  if (aiCarouselText) {
    aiCarouselText.textContent = carouselTexts[carouselIndex];
    carouselIndex = (carouselIndex + 1) % carouselTexts.length;
  }
}
setInterval(updateCarousel, 3000);

// 通知badge更新
const topbarNotificationBadge = document.getElementById('topbarNotificationBadge');
const aiAssistantCursor = document.getElementById('aiAssistantCursor');
if (topbarNotificationBadge && aiAssistantCursor) {
  aiAssistantCursor.textContent = topbarNotificationBadge.textContent;
}

// 返回首页按钮
const topbarHome = document.getElementById('topbarHome');
const demoPage = document.getElementById('demoPage');
const landingPage = document.querySelector('.landing-page');

if (topbarHome) {
  topbarHome.addEventListener('click', () => {
    if (demoPage) demoPage.classList.remove('active');
    if (landingPage) landingPage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Demo触发按钮
const demoTriggers = document.querySelectorAll('[data-demo-trigger]');
demoTriggers.forEach(btn => {
  btn.addEventListener('click', () => {
    if (landingPage) landingPage.style.display = 'none';
    if (demoPage) {
      demoPage.classList.add('active');
      // 默认显示概览页
      switchPage('overview', '运营概览');
    }
    lucide.createIcons();
  });
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  
  // 默认显示概览页
  const defaultDemoTrigger = document.querySelector('[data-demo-trigger]');
  if (defaultDemoTrigger && demoPage) {
    // 首次加载不需要自动触发
  }
  
  // 初始化图表
  setTimeout(() => {
    initOverviewCharts();
  }, 500);
});

// 场景按钮点击（对话页）
const scenarioBtns = document.querySelectorAll('.scenario-btn');
scenarioBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const scenario = btn.dataset.scenario;
    scenarioBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 加载对应场景对话
    if (typeof loadScenarioChat === 'function' && scenario) {
      const chatMessages = document.getElementById('chatMessages');
      if (chatMessages) chatMessages.innerHTML = '';
      loadScenarioChat(scenario);
    }
  });
});

// 时间选择器
const timeBtns = document.querySelectorAll('.time-btn');
timeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    timeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // 重新加载图表数据
    initDataCharts();
  });
});

// 响应式检测 - 移动端收起侧边栏
function checkMobile() {
  if (window.innerWidth <= 768) {
    if (demoSidebar) demoSidebar.classList.remove('expanded');
  }
}
window.addEventListener('resize', checkMobile);
checkMobile();


// ============================================
// 多端适配 - Tab导航控制
// ============================================

// 检测断点并控制导航显示
function updateNavDisplay() {
  const width = window.innerWidth;
  const sidebar = document.getElementById('demoSidebar');
  const topbarTabNav = document.querySelector('.topbar-tab-nav');
  const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
  const topbar = document.getElementById('demoTopbar');
  const main = document.getElementById('demoMain');
  
  if (width >= 992) {
    // 桌面/小桌面：显示侧边栏
    if (sidebar) sidebar.style.display = 'flex';
    if (topbarTabNav) topbarTabNav.style.display = 'none';
    if (mobileBottomNav) mobileBottomNav.style.display = 'none';
    if (topbar) topbar.style.left = '64px';
    if (main) main.style.marginLeft = '64px';
  } else if (width >= 768) {
    // 平板：显示顶部Tab栏
    if (sidebar) sidebar.style.display = 'none';
    if (topbarTabNav) topbarTabNav.style.display = 'flex';
    if (mobileBottomNav) mobileBottomNav.style.display = 'none';
    if (topbar) topbar.style.left = '0';
    if (main) main.style.marginLeft = '0';
  } else {
    // 手机：显示底部Tab栏
    if (sidebar) sidebar.style.display = 'none';
    if (topbarTabNav) topbarTabNav.style.display = 'none';
    if (mobileBottomNav) mobileBottomNav.style.display = 'flex';
    if (topbar) topbar.style.left = '0';
    if (main) main.style.marginLeft = '0';
    if (main) main.style.marginBottom = '64px';
  }
}

// 页面切换 - 同步所有导航
function switchPageAllNav(pageName, breadcrumb) {
  // 更新侧边栏
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
  sidebarNavItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // 更新顶部Tab栏
  const topbarTabItems = document.querySelectorAll('.topbar-tab-item');
  topbarTabItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // 更新底部Tab栏
  const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
  bottomNavItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // 更新页面内容
  const pageContents = document.querySelectorAll('.page-content');
  const pageId = 'page' + pageName.charAt(0).toUpperCase() + pageName.slice(1);
  pageContents.forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });
  
  // 更新面包屑
  const topbarBreadcrumb = document.getElementById('topbarBreadcrumb');
  if (topbarBreadcrumb) {
    topbarBreadcrumb.textContent = breadcrumb;
  }
  
  // 初始化页面图表
  if (pageName === 'overview') {
    initOverviewCharts();
  } else if (pageName === 'data') {
    initDataCharts();
  }
  
  // 隐藏AI浮窗
  const aiFloatPanel = document.getElementById('aiFloatPanel');
  if (aiFloatPanel) aiFloatPanel.classList.remove('show');
}

// 绑定顶部Tab栏点击
document.addEventListener('DOMContentLoaded', () => {
  updateNavDisplay();
  
  const topbarTabItems = document.querySelectorAll('.topbar-tab-item');
  topbarTabItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      const breadcrumbMap = {
        overview: '运营概览',
        chat: 'AI对话',
        data: '数据报表',
        platform: '平台管理',
        logs: '决策日志'
      };
      switchPageAllNav(page, breadcrumbMap[page] || '概览');
    });
  });
  
  // 绑定底部Tab栏点击
  const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      const breadcrumbMap = {
        overview: '运营概览',
        chat: 'AI对话',
        data: '数据报表',
        platform: '平台管理',
        logs: '决策日志'
      };
      switchPageAllNav(page, breadcrumbMap[page] || '概览');
    });
  });
  
  // 窗口大小变化时更新导航显示
  window.addEventListener('resize', () => {
    updateNavDisplay();
  });
});
