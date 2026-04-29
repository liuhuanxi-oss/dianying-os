/**
 * 店赢OS - 交互逻辑
 * 包含：滚动动画、FAQ折叠、Demo体验、Mock数据
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
      // 关闭其他已打开的FAQ
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // 切换当前项
      item.classList.toggle('active');
    });
  });
  
  // ============================================
  // Demo 体验功能
  // ============================================
  const demoTriggers = document.querySelectorAll('[data-demo-trigger]');
  const landingPage = document.querySelector('.landing-page');
  const demoPage = document.querySelector('.demo-page');
  const backBtns = document.querySelectorAll('.back-btn');
  
  // 进入Demo
  demoTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showDemo();
    });
  });
  
  // 返回首页
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showLanding();
    });
  });
  
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
  // Demo 场景对话
  // ============================================
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const chatMessages = document.querySelector('.chat-messages');
  let currentScenario = null;
  
  // Mock对话数据
  const scenarios = {
    review: {
      title: '差评处理',
      messages: [
        { type: 'user', text: '刚收到一条差评，说等位40分钟，态度很差' },
        { type: 'ai', text: '已识别差评关键词：等位时间长、服务态度。正在生成个性化回复方案...' },
        { type: 'ai', text: '✅ 已自动在大众点评回复：\n\n"亲爱的顾客您好，非常抱歉给您带来了不好的体验。您说得对，昨天的等候时间确实超出预期。我们已将您的反馈转达给管理团队，并会对服务流程进行改进。您的意见对我们非常重要，期待您下次光临时能看到我们的改变。"' },
        { type: 'ai', text: '📊 影响评估：\n• 预计挽回潜在客流损失：约15%\n• 回复速度超过98%同类商家\n• 情绪安抚评分：92分' }
      ]
    },
    pricing: {
      title: '动态定价',
      messages: [
        { type: 'user', text: '明天下雨，对生意有影响吗？' },
        { type: 'ai', text: '正在分析天气数据与历史销售关联...\n\n📊 数据显示：\n• 雨天客流平均下降 23%\n• 外卖订单上涨 41%\n• 适合推"雨天特惠套餐"' },
        { type: 'ai', text: '💡 建议策略：\n\n1. 外卖渠道：\n   • 满100减15 → 满100减20\n   • 预计增收 ¥1,200/天\n\n2. 堂食渠道：\n   • 推出"雨天热汤套餐"\n   • 提升客单价 ¥18\n\n3. 已自动同步至美团/饿了么后台' }
      ]
    },
    vip: {
      title: 'VIP管理',
      messages: [
        { type: 'user', text: '王女士1个月没来了，怎么回事？' },
        { type: 'ai', text: '正在分析王女士的消费档案...\n\n👤 档案摘要：\n• 累计消费 ¥3,280\n• 平均客单价 ¥164\n• 消费频率：每月2-3次\n• 上次消费：4月8日（距今28天）' },
        { type: 'ai', text: '🔍 流失风险分析：\n\n• 流失概率：68%（中高风险）\n• 可能原因：\n  ① 竞争对手新店开业\n  ② 近期未推出新品\n  ③ 未推送专属优惠\n\n💌 建议发送：\n"王姐，好久不见！新上了您爱吃的酸菜鱼，还有您专属的8折券哦~"' }
      ]
    },
    operation: {
      title: '运营建议',
      messages: [
        { type: 'user', text: '最近翻台率有点低，怎么办？' },
        { type: 'ai', text: '正在分析近期运营数据...\n\n📊 翻台率诊断：\n\n• 当前翻台率：2.8次/天\n• 行业均值：3.5次/天\n• 目标值：4次/天\n\n⏱️ 时间分布问题：\n• 午市11:30-12:30：满座但等位\n• 晚市18:00-19:00：排队严重\n• 14:00-17:00：空桌率47%' },
        { type: 'ai', text: '💡 优化建议：\n\n1. 【午市】推出"商务套餐"\n   锁定12点前到店的办公人群\n\n2. 【晚市】限时优惠策略\n   18:30前结账享9折\n   预计提升19:00后入座率15%\n\n3. 【下午茶时段】\n   开放茶点套餐，盘活闲置时段\n   预计增收 ¥800/天\n\n📈 预计整体提升翻台率至 3.6次' }
      ]
    }
  };
  
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.dataset.scenario;
      
      // 更新按钮状态
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 清空并加载新对话
      chatMessages.innerHTML = '';
      currentScenario = scenario;
      
      // 模拟AI逐条发送消息
      loadScenarioChat(scenario);
    });
  });
  
  function loadScenarioChat(scenario) {
    const data = scenarios[scenario];
    let delay = 500;
    
    data.messages.forEach((msg, index) => {
      setTimeout(() => {
        addMessage(msg.type, msg.text);
        
        // 最后一条消息时，更新数据面板
        if (index === data.messages.length - 1) {
          updateDemoData(scenario);
        }
      }, delay);
      delay += msg.type === 'user' ? 800 : 1500;
    });
  }
  
  function addMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    // 处理换行
    const formattedText = text.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
      <div class="message-bubble">${formattedText}</div>
      <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // ============================================
  // Demo 数据面板更新
  // ============================================
  function updateDemoData(scenario) {
    const demoData = {
      review: {
        rating: 4.8,
        ratingChange: '+0.3',
        negativeRate: 1.2,
        negativeChange: '-3.8%',
        revenue: 128000,
        revenueChange: '+12%',
        trustLevel: 92
      },
      pricing: {
        rating: 4.7,
        ratingChange: '+0.1',
        negativeRate: 2.1,
        negativeChange: '-1.2%',
        revenue: 135000,
        revenueChange: '+18%',
        trustLevel: 88
      },
      vip: {
        rating: 4.9,
        ratingChange: '+0.4',
        negativeRate: 0.8,
        negativeChange: '-4.2%',
        revenue: 142000,
        revenueChange: '+15%',
        trustLevel: 95
      },
      operation: {
        rating: 4.6,
        ratingChange: '+0.2',
        negativeRate: 2.8,
        negativeChange: '-0.6%',
        revenue: 118000,
        revenueChange: '+8%',
        trustLevel: 85
      }
    };
    
    const data = demoData[scenario];
    
    // 更新数值显示
    const ratingValue = document.querySelector('[data-stat="rating"] .data-stat-value');
    const ratingChange = document.querySelector('[data-stat="rating"] .data-stat-change');
    if (ratingValue) ratingValue.textContent = data.rating;
    if (ratingChange) {
      ratingChange.querySelector('span').textContent = data.ratingChange;
    }
    
    const negativeValue = document.querySelector('[data-stat="negative"] .data-stat-value');
    const negativeChange = document.querySelector('[data-stat="negative"] .data-stat-change');
    if (negativeValue) negativeValue.textContent = data.negativeRate + '%';
    if (negativeChange) {
      const changeSpan = negativeChange.querySelector('span');
      if (changeSpan) changeSpan.textContent = data.negativeChange;
      negativeChange.classList.remove('down');
      negativeChange.classList.add('up');
    }
    
    const revenueValue = document.querySelector('[data-stat="revenue"] .data-stat-value');
    const revenueChange = document.querySelector('[data-stat="revenue"] .data-stat-change');
    if (revenueValue) revenueValue.textContent = '¥' + (data.revenue / 10000).toFixed(1) + '万';
    if (revenueChange) {
      const changeSpan = revenueChange.querySelector('span');
      if (changeSpan) changeSpan.textContent = data.revenueChange;
    }
    
    // 更新信任等级
    const trustFill = document.querySelector('.trust-bar-fill');
    const trustValue = document.querySelector('.trust-value');
    if (trustFill) {
      trustFill.style.width = data.trustLevel + '%';
    }
    if (trustValue) {
      trustValue.textContent = 'A级';
    }
    
    // 更新图表
    updateChart(scenario);
  }
  
  // ============================================
  // Chart.js 图表
  // ============================================
  let revenueChart = null;
  
  function initChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // 销毁已存在的图表
    if (revenueChart) {
      revenueChart.destroy();
    }
    
    const chartData = {
      review: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [8.2, 8.8, 9.1, 9.6, 10.5, 12.8]
      },
      pricing: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [8.5, 9.0, 9.8, 10.2, 11.5, 13.5]
      },
      vip: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [8.0, 8.5, 9.5, 10.8, 12.0, 14.2]
      },
      operation: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [8.8, 9.2, 9.5, 10.0, 10.8, 11.8]
      }
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
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748B'
            }
          },
          y: {
            grid: {
              color: '#E2E8F0'
            },
            ticks: {
              color: '#64748B',
              callback: function(value) {
                return value + '万';
              }
            }
          }
        }
      }
    });
  }
  
  function updateChart(scenario) {
    const chartData = {
      review: [8.2, 8.8, 9.1, 9.6, 10.5, 12.8],
      pricing: [8.5, 9.0, 9.8, 10.2, 11.5, 13.5],
      vip: [8.0, 8.5, 9.5, 10.8, 12.0, 14.2],
      operation: [8.8, 9.2, 9.5, 10.0, 10.8, 11.8]
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
    // 初始化图表
    if (typeof Chart !== 'undefined') {
      initChart();
    }
    
    // 默认加载第一个场景
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
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // ============================================
  // 导航栏滚动效果
  // ============================================
  const navbar = document.querySelector('.navbar');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
  
  // ============================================
  // 手机菜单切换
  // ============================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
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
  
  console.log('店赢OS - 初始化完成');
});
