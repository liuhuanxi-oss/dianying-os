/**
 * 店赢OS 主应用
 * AI-Powered One-Person Company Operating System
 */

const App = {
    // 当前状态
    currentStore: 'hotpot',
    chatHistory: [],
    isProcessing: false,

    // 初始化
    init() {
        console.log('🚀 店赢OS 初始化中...');
        
        this.bindEvents();
        this.updateTime();
        this.loadStoreList();
        this.loadDashboardData();
        this.addWelcomeMessage();
        
        // 定时更新
        setInterval(() => this.updateTime(), 1000);
        
        console.log('✅ 店赢OS 初始化完成');
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
        document.getElementById('demoAlertBtn').addEventListener('click', () => this.showAlertDemo());
        document.getElementById('demoPricingBtn').addEventListener('click', () => this.showPricingDemo());

        // 模态框
        document.getElementById('closeAlertModal').addEventListener('click', () => this.closeModal('alertModal'));
        document.getElementById('cancelAlertBtn').addEventListener('click', () => this.closeModal('alertModal'));
        document.getElementById('confirmAlertBtn').addEventListener('click', () => this.handleAlertConfirm());

        document.getElementById('closePricingModal').addEventListener('click', () => this.closeModal('pricingModal'));
        document.getElementById('cancelPricingBtn').addEventListener('click', () => this.closeModal('pricingModal'));
        document.getElementById('confirmPricingBtn').addEventListener('click', () => this.handlePricingConfirm());

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
    },

    // 更新时间
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
        document.getElementById('currentTime').textContent = timeStr;
    },

    // 加载门店列表
    loadStoreList() {
        const storeList = document.getElementById('storeList');
        const stores = DataStore.getStoreList();

        storeList.innerHTML = stores.map(store => `
            <div class="store-card ${store.id === this.currentStore ? 'active' : ''}" 
                 data-store-id="${store.id}"
                 onclick="App.switchStore('${store.id}')">
                <div class="store-card-header">
                    <span class="store-card-name">${store.name}</span>
                    <span class="store-card-badge">${store.industry}</span>
                </div>
                <div class="store-card-stats">
                    <div class="store-stat">
                        评分: <span class="store-stat-value">${store.rating}⭐</span>
                    </div>
                    <div class="store-stat">
                        差评率: <span class="store-stat-value">${store.badReviewRate}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // 加载仪表盘数据
    loadDashboardData() {
        const store = DataStore.getStore(this.currentStore);
        
        // 更新关键指标
        document.getElementById('ratingValue').textContent = store.rating;
        document.getElementById('reviewCount').textContent = store.reviews;
        document.getElementById('badReviewRate').textContent = store.badReviewRate + '%';
        document.getElementById('replyRate').textContent = store.replyRate + '%';
        document.getElementById('todayRevenue').textContent = '¥' + store.todayRevenue.toLocaleString();

        // 更新营收图表
        this.updateRevenueChart();

        // 更新预警列表
        this.updateAlertList();

        // 更新评价列表
        this.updateReviewList();
    },

    // 更新营收图表
    updateRevenueChart() {
        const bars = document.querySelectorAll('.bar');
        const revenueData = DataStore.getRevenueData(this.currentStore);
        const maxValue = Math.max(...revenueData);

        bars.forEach((bar, index) => {
            const percentage = (revenueData[index] / maxValue) * 100;
            bar.style.height = percentage + '%';
            bar.setAttribute('data-value', percentage.toFixed(0));
        });
    },

    // 更新预警列表
    updateAlertList() {
        const alertList = document.getElementById('alertList');
        const alerts = DataStore.getAlerts(this.currentStore);

        alertList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <span class="alert-icon">${alert.icon}</span>
                <span class="alert-text">${alert.text}</span>
            </div>
        `).join('');
    },

    // 更新评价列表
    updateReviewList() {
        const reviewList = document.getElementById('reviewList');
        const reviews = DataStore.getReviews(this.currentStore);

        reviewList.innerHTML = reviews.slice(0, 3).map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                    <span class="review-platform">${review.platform}</span>
                </div>
                <div class="review-content">${review.content}</div>
                <div class="review-time">${review.time}</div>
            </div>
        `).join('');
    },

    // 切换门店
    switchStore(storeId) {
        this.currentStore = storeId;
        
        // 更新门店选择器
        document.getElementById('storeSelect').value = storeId;
        
        // 更新门店卡片状态
        document.querySelectorAll('.store-card').forEach(card => {
            card.classList.toggle('active', card.dataset.storeId === storeId);
        });

        // 加载新门店数据
        this.loadDashboardData();

        // 添加切换消息
        const store = DataStore.getStore(storeId);
        this.addAIMessage(`已切换到「${store.name}」，正在加载最新数据...`);

        // 模拟加载
        setTimeout(() => {
            this.addAIMessage(`✅ 数据加载完成！

📊 ${store.name} 当前状态：
• 综合评分：${store.rating}⭐
• 本月评价：${store.reviews}条
• 差评率：${store.badReviewRate}%
• 今日营收：¥${store.todayRevenue.toLocaleString()}

有什么可以帮您的吗？`);
        }, 500);
    },

    // 添加欢迎消息
    addWelcomeMessage() {
        const store = DataStore.getStore(this.currentStore);
        this.addAIMessage(`👋 欢迎使用店赢OS！

我是您的AI虚拟店长，为您提供7×24小时的智能门店管理服务。

📊 当前门店：${store.name}
• 综合评分：${store.rating}⭐
• 本月评价：${store.reviews}条
• 差评率：${store.badReviewRate}%
• 回复率：${store.replyRate}%

🎯 我可以帮您：
• 分析客户评价，自动生成回复
• 预警差评风险，提前处理
• 优化定价策略，提升营收
• 生成运营报告，洞察趋势

请告诉我您想做什么，或者点击右侧的演示按钮体验核心功能！`);
    },

    // 添加AI消息
    addAIMessage(text) {
        this.addMessage('ai', text);
    },

    // 添加用户消息
    addUserMessage(text) {
        this.addMessage('user', text);
    },

    // 添加消息
    addMessage(type, text) {
        const chatMessages = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const message = document.createElement('div');
        message.className = `chat-message ${type}`;
        message.innerHTML = `
            <div class="chat-message-avatar">${type === 'ai' ? '🤖' : '👤'}</div>
            <div class="chat-message-content">
                <div class="chat-message-text">${text.replace(/\n/g, '<br>')}</div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push({ type, text, time });
    },

    // 发送消息
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text || this.isProcessing) return;

        this.addUserMessage(text);
        input.value = '';
        this.isProcessing = true;

        // 显示思考状态
        const loadingMsg = this.addLoadingMessage();

        try {
            // 调用AI虚拟店长处理
            const response = await VirtualManager.processInput(text, {
                storeId: this.currentStore,
                storeType: DataStore.getStore(this.currentStore)?.type
            });

            // 移除加载消息
            this.removeLoadingMessage(loadingMsg);

            // 添加AI回复
            this.addAIMessage(response.response.text);

            // 更新信任指示器
            this.updateTrustIndicator(response.intent);

        } catch (error) {
            console.error('处理失败:', error);
            this.removeLoadingMessage(loadingMsg);
            this.addAIMessage('抱歉，处理您的请求时遇到问题，请稍后重试。');
        }

        this.isProcessing = false;
    },

    // 添加加载消息
    addLoadingMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const message = document.createElement('div');
        message.className = 'chat-message ai loading';
        message.innerHTML = `
            <div class="chat-message-avatar">🤖</div>
            <div class="chat-message-content">
                <div class="chat-message-text">思考中<span class="dots">...</span></div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 动画效果
        const dots = message.querySelector('.dots');
        let count = 0;
        const dotAnimation = setInterval(() => {
            count = (count + 1) % 4;
            dots.textContent = '.'.repeat(count || 3);
        }, 300);

        return { element: message, animation: dotAnimation };
    },

    // 移除加载消息
    removeLoadingMessage(loadingMsg) {
        if (loadingMsg && loadingMsg.element) {
            clearInterval(loadingMsg.animation);
            loadingMsg.element.remove();
        }
    },

    // 处理快捷操作
    async handleQuickAction(action) {
        const actionTexts = {
            review: '查看最近的客户评价分析',
            pricing: '分析当前的动态定价策略',
            schedule: '给出本周的排班优化建议',
            report: '生成今日的运营报告'
        };

        this.isProcessing = true;
        const loadingMsg = this.addLoadingMessage();

        try {
            const response = await VirtualManager.processInput(actionTexts[action], {
                storeId: this.currentStore,
                storeType: DataStore.getStore(this.currentStore)?.type
            });

            this.removeLoadingMessage(loadingMsg);
            this.addAIMessage(response.response.text);

        } catch (error) {
            console.error('处理失败:', error);
            this.removeLoadingMessage(loadingMsg);
            this.addAIMessage('抱歉，处理您的请求时遇到问题。');
        }

        this.isProcessing = false;
    },

    // 更新信任指示器
    updateTrustIndicator(intent) {
        const indicator = document.getElementById('trustIndicator');
        const levels = {
            review_management: { level: 'A', desc: '自动执行，无需确认' },
            pricing: { level: 'B', desc: 'AI执行+通知' },
            alert: { level: 'A', desc: '自动执行，无需确认' },
            general: { level: 'C', desc: 'AI生成+人工确认' }
        };

        const config = levels[intent] || levels.general;
        indicator.innerHTML = `
            <span class="trust-label">信任等级:</span>
            <span class="trust-badge ${config.level}">${config.level}级</span>
            <span class="trust-desc">${config.desc}</span>
        `;
    },

    // 显示差评预警演示
    showAlertDemo() {
        const modal = document.getElementById('alertModal');
        const body = document.getElementById('alertModalBody');
        const reviews = DataStore.getReviews(this.currentStore);
        const badReview = reviews.find(r => r.rating <= 2) || reviews[0];
        const store = DataStore.getStore(this.currentStore);

        // 分析评价
        const analysis = ReviewHandler.analyzeReview(badReview, store.type);
        const trustResult = TrustLevel.calculateTrustLevel(badReview.rating, badReview.sentiment);
        const aiResponse = ReviewHandler.generateResponse(badReview, analysis, store.type);

        body.innerHTML = `
            <div class="alert-analysis">
                <div class="alert-analysis-section">
                    <h4>📋 差评信息</h4>
                    <ul>
                        <li><strong>平台：</strong>${badReview.platform}</li>
                        <li><strong>评分：</strong>${'⭐'.repeat(badReview.rating)}</li>
                        <li><strong>内容：</strong>${badReview.content}</li>
                        <li><strong>发布时间：</strong>${badReview.time}</li>
                    </ul>
                </div>

                <div class="alert-analysis-section">
                    <h4>🔍 根因分析</h4>
                    <ul>
                        ${analysis.issues.map(issue => `
                            <li><span class="issue-tag ${issue.severity}">${issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡'}</span>
                            ${issue.name} - 关键词：${issue.keyword}</li>
                        `).join('') || '<li>暂无明确问题分类</li>'}
                    </ul>
                </div>

                <div class="trust-check">
                    <div class="trust-check-header">
                        <span>🤖 信任等级检测</span>
                        <span class="trust-score ${trustResult.level}">${trustResult.score}分</span>
                    </div>
                    <div class="trust-badge-row">
                        <span class="trust-badge ${trustResult.level}">${trustResult.level}级</span>
                        <span>${trustResult.desc}</span>
                    </div>
                </div>

                <div class="ai-response-preview">
                    <h5>💬 AI回复预览</h5>
                    <p>${aiResponse}</p>
                </div>
            </div>
        `;

        modal.classList.add('active');
    },

    // 显示动态定价演示
    showPricingDemo() {
        const modal = document.getElementById('pricingModal');
        const body = document.getElementById('pricingModalBody');
        const store = DataStore.getStore(this.currentStore);

        const context = {
            weather: 'rainy',
            timeOfDay: 'dinner',
            demand: 'normal',
            competitor: 'promotion',
            isWeekend: true
        };

        const pricingPlan = PricingEngine.generatePricingPlan(store.type, context);
        const firstItem = pricingPlan.items[0];

        body.innerHTML = `
            <div class="pricing-factors">
                <h4>📊 当前定价因子</h4>
                ${pricingPlan.items[0].adjustments.map(adj => `
                    <div class="factor-item">
                        <span class="factor-name">${adj.factor}: ${adj.detail}</span>
                        <span class="factor-impact ${adj.impact.startsWith('+') ? 'positive' : adj.impact.startsWith('-') && adj.impact !== '-0%' ? 'negative' : ''}">${adj.impact}</span>
                    </div>
                `).join('')}
            </div>

            <div class="pricing-comparison">
                <div class="pricing-card current">
                    <div class="pricing-label">原价</div>
                    <div class="pricing-value">¥${firstItem.basePrice}</div>
                </div>
                <div class="pricing-card suggested">
                    <div class="pricing-label">建议价</div>
                    <div class="pricing-value">¥${firstItem.finalPrice}</div>
                    <div class="pricing-change ${firstItem.change >= 0 ? 'up' : 'down'}">
                        ${firstItem.change >= 0 ? '+' : ''}${firstItem.changePercent}%
                    </div>
                </div>
            </div>

            <div class="pricing-summary">
                <h4>📈 定价方案摘要</h4>
                <ul>
                    <li>调价商品：${pricingPlan.summary.totalItems}种</li>
                    <li>建议上调：${pricingPlan.summary.priceUp}种</li>
                    <li>建议下调：${pricingPlan.summary.priceDown}种</li>
                    <li>预计营收变化：${pricingPlan.expectedRevenueChange}</li>
                </ul>
            </div>

            <div class="pricing-advice">
                <h4>💡 AI建议</h4>
                <p>${firstItem.recommendation.message}</p>
            </div>
        `;

        modal.classList.add('active');
    },

    // 关闭模态框
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    // 处理预警确认
    handleAlertConfirm() {
        this.closeModal('alertModal');
        this.addAIMessage(`✅ 已启动AI自动处理流程！

📋 处理进度：
1. ✅ 差评内容分析完成
2. ✅ 根因定位完成
3. 🔄 AI回复生成中...
4. ⏳ 待发送

📱 您将收到短信通知，处理完成后会自动归档。
预计处理时间：2-3分钟`);

        // 模拟处理完成
        setTimeout(() => {
            this.showToast('success', 'AI回复已发送，客户满意度预测提升');
        }, 2000);
    },

    // 处理定价确认
    handlePricingConfirm() {
        this.closeModal('pricingModal');
        this.addAIMessage(`✅ 动态定价方案已确认！

📋 执行摘要：
• 调价商品：${DataStore.getStore(this.currentStore)?.type === 'hotpot' ? '5' : '4'}种
• 执行时间：立即生效
• 预期效果：营收提升8-12%

📊 系统将持续监控调价效果，如有问题会自动回滚。
您可以随时在「定价历史」中查看调整记录。`);

        this.showToast('success', '定价方案已生效');
    },

    // 刷新数据
    refreshData() {
        this.showToast('info', '数据已刷新');
        this.loadDashboardData();
    },

    // 显示提示消息
    showToast(type, message) {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
