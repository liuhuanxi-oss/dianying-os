/**
 * 店赢OS - 专业SaaS应用
 * 2026
 */

// ============================================
// MOCK DATA
// ============================================

const Stores = {
    data: {
        hotpot: {
            id: 'hotpot',
            name: '老码头火锅',
            location: '朝阳区旗舰店',
            rating: 4.8,
            reviews: 2847,
            badReviewRate: 1.2,
            replyRate: 98,
            todayRevenue: 12580,
            revenueTrend: [9800, 10200, 11500, 10800, 12100, 11900, 12580]
        },
        tea: {
            id: 'tea',
            name: '茶悦时光',
            location: '万象城店',
            rating: 4.6,
            reviews: 1523,
            badReviewRate: 2.1,
            replyRate: 95,
            todayRevenue: 4832,
            revenueTrend: [4200, 4500, 4100, 4700, 4600, 4900, 4832]
        }
    },
    current: 'hotpot',
    
    get() {
        return this.data[this.current];
    },
    
    switch(id) {
        if (this.data[id]) {
            this.current = id;
            return this.data[id];
        }
        return null;
    }
};

const Alerts = {
    data: [
        {
            id: 1,
            type: 'warning',
            text: '老码头火锅：等位超40分钟，建议增加值班人员',
            time: '10分钟前'
        },
        {
            id: 2,
            type: 'success',
            text: '茶悦时光：今日复购率提升至32%',
            time: '1小时前'
        },
        {
            id: 3,
            type: 'danger',
            text: '差评预警：老码头火锅收到1条新差评',
            time: '15分钟前'
        }
    ]
};

// 营收趋势数据（过去7天）
const RevenueData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '今天'],
    datasets: [{
        label: '营收(元)',
        data: [9800, 10200, 11500, 10800, 12100, 11900, 12580],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
    }]
};

// ============================================
// SCENARIOS - 预设对话场景
// ============================================

const Scenarios = {
    // 场景1：差评预警
    alertReview: {
        trigger: ['差评', '预警', '投诉', '负面'],
        response: '刚收到1条差评，老码头火锅，顾客说等位超40分钟。我查了一下，今天周六高峰期排班少了2人。要不要我现在回复这条差评？',
        data: {
            type: 'warning',
            icon: 'AlertTriangle',
            title: '差评预警',
            content: '顾客反馈：等位时间过长，超过40分钟，体验很差'
        }
    },
    
    // 场景2：动态定价
    dynamicPricing: {
        trigger: ['定价', '价格', '调价', '建议'],
        response: '明天降温8度，火锅品类预计客流涨25%。建议午市套餐保持原价，晚市双人套餐调到168元（原价148），加一份赠饮。预计增收1200元左右。',
        data: {
            type: 'success',
            icon: 'TrendingUp',
            title: '定价建议已生成',
            content: '晚市双人套餐：¥148 → ¥168\n预计客流+25%\n预计日增收：¥1,200'
        }
    },
    
    // 场景3：运营日报
    dailyReport: {
        trigger: ['日报', '报告', '今日', '总结'],
        response: '今日营收12,580元，比昨天涨8%。好消息是复购率到32%了，坏消息是下午茶时段空桌率60%。我建议上14:00-17:00的下午茶套餐试试。',
        data: {
            type: 'success',
            icon: 'FileText',
            title: '今日运营日报',
            content: '营收¥12,580 ↑8%\n复购率32%\n空桌率60%（下午茶时段）'
        }
    },
    
    // 场景4：排班查询
    schedule: {
        trigger: ['排班', '人手', '员工', '值班'],
        response: '今天周六，门店安排了6人值班。但客流比预期多了30%，建议临时加派2人。明天周日预计客流平稳，维持现有排班即可。',
        data: null
    },
    
    // 场景5：门店评分
    rating: {
        trigger: ['评分', '星级', '好评', '口碑'],
        response: '门店当前评分4.8分，近30天好评率97.3%，差评率仅1.2%。差评主要集中在等位时间和上菜速度，运营优化后有明显改善。',
        data: null
    },
    
    // 场景6：客流分析
    customer: {
        trigger: ['客流', '人数', '人流量', '顾客'],
        response: '今天客流1,247人次，高峰期集中在11:30-13:30和17:30-20:00。与上周六相比，午餐时段客流持平，晚餐时段上涨18%。',
        data: null
    },
    
    // 默认回复
    default: {
        response: '我理解你的问题。店赢OS可以帮你分析门店运营数据、预测客流趋势、处理差评回复等。试试点击上方的快捷按钮体验具体功能？',
        data: null
    }
};

// ============================================
// APP CONTROLLER
// ============================================

const App = {
    chart: null,
    chatHistory: [],
    
    // 初始化
    init() {
        this.bindEvents();
        this.initChart();
        this.updateTime();
        this.updateStoreInfo();
        this.updateStats();
        this.updateAlerts();
        this.addWelcomeMessage();
        
        // 定时更新
        setInterval(() => this.updateTime(), 1000);
    },
    
    // 绑定事件
    bindEvents() {
        // 门店切换
        document.getElementById('storeSelect').addEventListener('change', (e) => {
            this.switchStore(e.target.value);
        });
        
        // 发送消息
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // 快捷操作
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
        });
        
        // 演示按钮
        document.getElementById('demoAlertBtn').addEventListener('click', () => this.triggerScenario('alertReview'));
        document.getElementById('demoPricingBtn').addEventListener('click', () => this.triggerScenario('dynamicPricing'));
        document.getElementById('demoReportBtn').addEventListener('click', () => this.triggerScenario('dailyReport'));
    },
    
    // 更新时钟
    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const el = document.getElementById('currentTime');
        if (el) el.textContent = timeStr;
    },
    
    // 切换门店
    switchStore(storeId) {
        const store = Stores.switch(storeId);
        if (store) {
            this.updateStoreInfo();
            this.updateStats();
            this.updateChart();
            
            // 添加切换提示
            this.addMessage('ai', `已切换到 ${store.name}（${store.location}）`);
        }
    },
    
    // 更新门店信息
    updateStoreInfo() {
        const store = Stores.get();
        if (!store) return;
        
        // 更新select显示
        const select = document.getElementById('storeSelect');
        if (select) select.value = store.id;
    },
    
    // 更新统计数据
    updateStats() {
        const store = Stores.get();
        if (!store) return;
        
        document.getElementById('ratingValue').textContent = store.rating;
        document.getElementById('reviewCount').textContent = store.reviews.toLocaleString();
        document.getElementById('badReviewRate').textContent = store.badReviewRate + '%';
        document.getElementById('replyRate').textContent = store.replyRate + '%';
        document.getElementById('todayRevenue').textContent = '¥' + store.todayRevenue.toLocaleString();
    },
    
    // 更新预警列表
    updateAlerts() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;
        
        alertsList.innerHTML = Alerts.data.map(alert => `
            <div class="alert-item ${alert.type}">
                <i data-lucide="${alert.type === 'danger' ? 'AlertCircle' : alert.type === 'success' ? 'CheckCircle' : 'AlertTriangle'}"></i>
                <div>
                    <div>${alert.text}</div>
                    <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">${alert.time}</div>
                </div>
            </div>
        `).join('');
        
        // 重新初始化lucide图标
        if (window.lucide) lucide.createIcons();
    },
    
    // 初始化图表
    initChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: RevenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '营收: ¥' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return '¥' + (value / 1000) + 'k';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },
    
    // 更新图表
    updateChart() {
        if (!this.chart) return;
        const store = Stores.get();
        if (!store) return;
        
        this.chart.data.datasets[0].data = store.revenueTrend;
        this.chart.update('none');
    },
    
    // 添加欢迎消息
    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('ai', `你好！我是店赢OS的AI店长。我可以帮你分析门店运营数据、处理差评、给出定价建议。试试点击「模拟差评预警」或「模拟定价建议」体验一下？`);
        }, 500);
    },
    
    // 添加消息
    addMessage(type, content) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <div class="message-avatar">
                <i data-lucide="${type === 'ai' ? 'Bot' : 'User'}"></i>
            </div>
            <div>
                <div class="message-content">${content}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        container.appendChild(message);
        container.scrollTop = container.scrollHeight;
        
        // 初始化新添加的图标
        if (window.lucide) lucide.createIcons();
    },
    
    // 发送消息
    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        this.addMessage('user', text);
        input.value = '';
        
        // 分析意图并回复
        setTimeout(() => {
            const response = this.analyzeIntent(text);
            this.addMessage('ai', response.text);
        }, 800);
    },
    
    // 快捷操作
    handleQuickAction(action) {
        const actions = {
            review: () => this.triggerScenario('alertReview'),
            pricing: () => this.triggerScenario('dynamicPricing'),
            report: () => this.triggerScenario('dailyReport'),
            schedule: () => this.triggerScenario('schedule')
        };
        
        if (actions[action]) {
            actions[action]();
        }
    },
    
    // 触发预设场景
    triggerScenario(scenarioKey) {
        const scenario = Scenarios[scenarioKey];
        if (!scenario) return;
        
        // 添加AI回复
        this.addMessage('ai', scenario.response);
        
        // 如果有数据更新，更新UI
        if (scenario.data) {
            setTimeout(() => this.showDataCard(scenario.data), 1000);
        }
    },
    
    // 分析用户意图
    analyzeIntent(text) {
        const lowerText = text.toLowerCase();
        
        for (const [key, scenario] of Object.entries(Scenarios)) {
            if (key === 'default') continue;
            
            for (const trigger of scenario.trigger) {
                if (lowerText.includes(trigger)) {
                    return { text: scenario.response, data: scenario.data };
                }
            }
        }
        
        return Scenarios.default;
    },
    
    // 显示数据卡片
    showDataCard(data) {
        // 可以扩展为模态框或其他UI展示
        console.log('Data card:', data);
    }
};

// ============================================
// LANDING PAGE
// ============================================

const Landing = {
    init() {
        // 绑定Landing页事件
        const startBtn = document.getElementById('startDemoBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showDemo());
        }
    },
    
    showDemo() {
        document.querySelector('.landing').classList.add('hidden');
        document.querySelector('.demo').classList.remove('hidden');
        App.init();
    }
};

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 初始化Lucide图标
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // 检查当前页面
    if (document.querySelector('.landing')) {
        Landing.init();
    } else if (document.querySelector('.demo')) {
        App.init();
    }
});
