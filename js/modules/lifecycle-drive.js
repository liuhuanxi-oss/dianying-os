/**
 * 客户生命周期自动驾驶模块
 * 店赢OS - 从获客到复购，AI全程推进
 */

const LifecycleDrive = {
    // 生命周期阶段
    stages: {
        awareness: { name: '认知', color: '#6366f1', duration: '1-7天' },
        consideration: { name: '考虑', color: '#8b5cf6', duration: '7-14天' },
        purchase: { name: '首单', color: '#10b981', duration: '14-30天' },
        retention: { name: '复购', color: '#22d3ee', duration: '30-90天' },
        advocate: { name: '推荐', color: '#f59e0b', duration: '90天+' }
    },

    // 客户示例数据
    mockCustomers: [
        { id: 'c001', name: '王先生', phone: '138****1234', stage: 'purchase', lastVisit: '2026-04-25', totalSpent: 580, visitCount: 3 },
        { id: 'c002', name: '李女士', phone: '139****5678', stage: 'retention', lastVisit: '2026-04-20', totalSpent: 1280, visitCount: 8 },
        { id: 'c003', name: '张先生', phone: '136****9012', stage: 'advocate', lastVisit: '2026-04-18', totalSpent: 3580, visitCount: 15 },
        { id: 'c004', name: '赵女士', phone: '137****3456', stage: 'awareness', lastVisit: null, totalSpent: 0, visitCount: 0 },
        { id: 'c005', name: '陈先生', phone: '135****7890', stage: 'consideration', lastVisit: '2026-04-10', totalSpent: 98, visitCount: 1 }
    ],

    // 获取客户生命周期状态
    getCustomerStage(customerId) {
        const customer = this.mockCustomers.find(c => c.id === customerId) || this.mockCustomers[0];
        return {
            customer,
            stage: this.stages[customer.stage],
            nextStage: this.getNextStage(customer.stage),
            recommendedActions: this.getStageActions(customer.stage)
        };
    },

    // 获取下一阶段
    getNextStage(currentStage) {
        const stageOrder = ['awareness', 'consideration', 'purchase', 'retention', 'advocate'];
        const currentIndex = stageOrder.indexOf(currentStage);
        if (currentIndex < stageOrder.length - 1) {
            return this.stages[stageOrder[currentIndex + 1]];
        }
        return null;
    },

    // 获取阶段推荐行动
    getStageActions(stage) {
        const actions = {
            awareness: [
                { action: '发送新人优惠券', type: 'promotion', priority: 'high' },
                { action: '推荐热门商品', type: 'recommendation', priority: 'high' },
                { action: '引导关注公众号', type: 'engagement', priority: 'medium' }
            ],
            consideration: [
                { action: '发送对比案例', type: 'content', priority: 'high' },
                { action: '提供体验套餐', type: 'promotion', priority: 'high' },
                { action: '邀请到店体验', type: 'engagement', priority: 'medium' }
            ],
            purchase: [
                { action: '感谢购买', type: 'notification', priority: 'high' },
                { action: '推荐关联商品', type: 'recommendation', priority: 'high' },
                { action: '引导加入会员', type: 'engagement', priority: 'medium' }
            ],
            retention: [
                { action: '定期回访', type: 'notification', priority: 'high' },
                { action: '发送专属优惠', type: 'promotion', priority: 'high' },
                { action: '邀请参加活动', type: 'engagement', priority: 'medium' }
            ],
            advocate: [
                { action: '邀请分享评价', type: 'review', priority: 'high' },
                { action: '推荐好友奖励', type: 'promotion', priority: 'high' },
                { action: '邀请成为会员代表', type: 'engagement', priority: 'low' }
            ]
        };
        return actions[stage] || [];
    },

    // 检测流失风险
    detectChurnRisk(customerId) {
        const customer = this.mockCustomers.find(c => c.id === customerId);
        if (!customer) return null;

        const daysSinceLastVisit = customer.lastVisit 
            ? Math.floor((new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24))
            : 999;

        let riskLevel = 'low';
        let riskFactors = [];

        if (daysSinceLastVisit > 60) {
            riskLevel = 'high';
            riskFactors.push('超过60天未到店');
        } else if (daysSinceLastVisit > 30) {
            riskLevel = 'medium';
            riskFactors.push('超过30天未到店');
        }

        if (customer.visitCount === 1) {
            riskLevel = riskLevel === 'high' ? 'high' : 'medium';
            riskFactors.push('仅有一次消费记录');
        }

        return {
            customer,
            riskLevel,
            riskFactors,
            daysSinceLastVisit,
            recommendedActions: this.getChurnPreventionActions(riskLevel)
        };
    },

    // 获取防流失行动
    getChurnPreventionActions(riskLevel) {
        const actions = {
            high: [
                { action: '发送大额挽回优惠券', discount: '50%', priority: 1 },
                { action: '电话回访', priority: 2 },
                { action: '邀请参加VIP活动', priority: 3 }
            ],
            medium: [
                { action: '发送专属优惠', discount: '20%', priority: 1 },
                { action: '推送新品信息', priority: 2 },
                { action: '邀请好评返现', priority: 3 }
            ],
            low: [
                { action: '发送积分提醒', priority: 1 },
                { action: '推送优惠活动', priority: 2 }
            ]
        };
        return actions[riskLevel] || actions.low;
    },

    // 生成生命周期报告
    generateLifecycleReport(storeId) {
        const store = DataStore.getStore(storeId);
        const customerCount = this.mockCustomers.length;
        
        const stageDistribution = {};
        Object.keys(this.stages).forEach(stage => {
            stageDistribution[stage] = this.mockCustomers.filter(c => c.stage === stage).length;
        });

        const churnRisks = this.mockCustomers
            .map(c => this.detectChurnRisk(c.id))
            .filter(r => r && r.riskLevel !== 'low');

        return {
            storeId,
            storeName: store?.name || '门店',
            generatedAt: new Date().toISOString(),
            overview: {
                totalCustomers: customerCount,
                activeCustomers: stageDistribution.retention + stageDistribution.advocate,
                newCustomers: stageDistribution.awareness + stageDistribution.consideration,
                atRisk: churnRisks.length
            },
            stageDistribution,
            churnRisks,
            recommendations: this.getStoreRecommendations(stageDistribution, churnRisks)
        };
    },

    // 获取门店推荐
    getStoreRecommendations(distribution, risks) {
        const recommendations = [];

        if (distribution.awareness > distribution.retention) {
            recommendations.push({
                type: 'awareness',
                priority: 'high',
                message: '新客获取较多，建议加强首单转化'
            });
        }

        if (risks.length > 2) {
            recommendations.push({
                type: 'retention',
                priority: 'high',
                message: `有${risks.length}位高流失风险客户，建议启动挽回机制`
            });
        }

        if (distribution.advocate < 2) {
            recommendations.push({
                type: 'advocate',
                priority: 'medium',
                message: '建议培养更多忠实客户成为推荐者'
            });
        }

        return recommendations;
    },

    // 自动化执行行动
    async executeAutomatedAction(customerId, action) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            customerId,
            action,
            executedAt: new Date().toISOString(),
            result: this.simulateActionResult(action)
        };
    },

    // 模拟行动结果
    simulateActionResult(action) {
        const results = {
            'promotion': '优惠券已发送，客户已领取',
            'notification': '消息已推送，触达成功',
            'recommendation': '推荐已生成，等待客户反馈',
            'engagement': '活动邀请已发送'
        };
        return results[action.type] || '行动已执行';
    }
};

// 导出
window.LifecycleDrive = LifecycleDrive;
