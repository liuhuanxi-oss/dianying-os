/**
 * 方案Agent模块
 * 店赢OS - 智能分析问题，生成方案
 */

const PlanAgent = {
    // Agent标识
    agentId: 'plan_agent',
    name: '方案Agent',
    status: 'active',

    // 问题分类
    problemCategories: {
        service: { name: '服务问题', keywords: ['服务', '态度', '等待', '冷漠'], severity: 'high' },
        product: { name: '产品问题', keywords: ['味道', '质量', '新鲜'], severity: 'high' },
        environment: { name: '环境问题', keywords: ['环境', '卫生', '噪音'], severity: 'medium' },
        price: { name: '价格问题', keywords: ['价格', '贵', '性价比'], severity: 'medium' },
        facilities: { name: '设施问题', keywords: ['设备', '设施', '坏了'], severity: 'medium' }
    },

    // 生成改善方案
    async generatePlan(clues, storeId) {
        const plans = [];
        
        for (const clue of clues) {
            const plan = this.createPlanForClue(clue, storeId);
            if (plan) {
                plans.push(plan);
            }
        }

        return {
            agentId: this.agentId,
            timestamp: new Date().toISOString(),
            plans,
            summary: this.generatePlanSummary(plans)
        };
    },

    // 为线索创建方案
    createPlanForClue(clue, storeId) {
        const storeType = DataStore.getStore(storeId)?.type || 'hotpot';
        
        // 方案模板
        const templates = {
            risk: {
                title: `处理${clue.title}`,
                objectives: [
                    '降低差评风险',
                    '提升客户满意度',
                    '改进相关环节'
                ],
                actions: this.getActionsForRisk(clue, storeType),
                timeline: '1-3天',
                expectedOutcome: '差评率下降50%',
                resources: '无需额外资源'
            },
            trend: {
                title: `优化${clue.title.replace('分析', '')}`,
                objectives: [
                    '抓住增长机会',
                    '保持正向趋势'
                ],
                actions: this.getActionsForTrend(clue, storeType),
                timeline: '1周内见效',
                expectedOutcome: clue.data?.trend > 0 ? '营收继续增长' : '扭转下降趋势',
                resources: '可能需要营销预算'
            },
            opportunity: {
                title: `把握${clue.title}`,
                objectives: [
                    '提升客流',
                    '增加营收'
                ],
                actions: this.getActionsForOpportunity(clue, storeType),
                timeline: '2周内见效',
                expectedOutcome: clue.data?.potential || '提升10%',
                resources: '营销活动预算'
            },
            review: {
                title: `优化${clue.title}`,
                objectives: [
                    '改进产品/服务',
                    '减少负面反馈'
                ],
                actions: this.getActionsForReview(clue, storeType),
                timeline: '持续改进',
                expectedOutcome: '客户满意度提升',
                resources: '培训或调整成本'
            }
        };

        const template = templates[clue.type] || templates.review;

        return {
            clueId: clue.title,
            type: clue.type,
            priority: clue.priority,
            ...template,
            status: 'draft'
        };
    },

    // 获取风险应对行动
    getActionsForRisk(clue, storeType) {
        const baseActions = [
            { action: '分析问题根因', owner: 'AI店长', deadline: '当天' },
            { action: '生成应对方案', owner: 'AI店长', deadline: '当天' },
            { action: '执行改善措施', owner: '门店员工', deadline: '1-2天' },
            { action: '跟进处理结果', owner: 'AI店长', deadline: '3天后' }
        ];

        if (clue.data?.riskFactors?.includes('服务问题突出')) {
            baseActions.splice(2, 0, { action: '组织服务培训', owner: '店长', deadline: '1天内' });
        }

        return baseActions;
    },

    // 获取趋势应对行动
    getActionsForTrend(clue, storeType) {
        return [
            { action: '分析增长/下降原因', owner: 'AI店长', deadline: '当天' },
            { action: '制定优化计划', owner: 'AI店长', deadline: '当天' },
            { action: '调整营销策略', owner: '运营', deadline: '1天' },
            { action: '执行并监控效果', owner: '全员', deadline: '持续' }
        ];
    },

    // 获取机会把握行动
    getActionsForOpportunity(clue, storeType) {
        const actions = [
            { action: '评估机会可行性', owner: 'AI店长', deadline: '当天' }
        ];

        if (clue.title.includes('时段')) {
            actions.push(
                { action: '设计时段优惠', owner: '运营', deadline: '1天' },
                { action: '准备宣传物料', owner: '市场', deadline: '2天' },
                { action: '执行促销活动', owner: '全员', deadline: '3天' }
            );
        } else if (clue.title.includes('会员')) {
            actions.push(
                { action: '设计会员权益', owner: '运营', deadline: '2天' },
                { action: '员工培训', owner: '店长', deadline: '3天' },
                { action: '启动会员活动', owner: '全员', deadline: '5天' }
            );
        }

        return actions;
    },

    // 获取评价优化行动
    getActionsForReview(clue, storeType) {
        const actions = [
            { action: '分析高频关键词', owner: 'AI店长', deadline: '当天' }
        ];

        if (clue.data && clue.data.length > 0) {
            actions.push(
                { action: '针对高频词制定改进措施', owner: '店长', deadline: '1天' },
                { action: '培训员工', owner: '店长', deadline: '2天' },
                { action: '执行改进', owner: '全员', deadline: '3天' }
            );
        }

        return actions;
    },

    // 生成方案摘要
    generatePlanSummary(plans) {
        const urgentPlans = plans.filter(p => p.priority === 'urgent');
        const highPlans = plans.filter(p => p.priority === 'high');
        const otherPlans = plans.filter(p => p.priority !== 'urgent' && p.priority !== 'high');

        return {
            total: plans.length,
            urgent: urgentPlans.length,
            high: highPlans.length,
            recommendedFirst: urgentPlans[0]?.title || highPlans[0]?.title || '暂无紧急方案',
            estimatedTime: urgentPlans.length > 0 ? '1-3天' : '1周内'
        };
    },

    // 评估方案可行性
    evaluatePlan(plan) {
        const evaluation = {
            feasibility: 85,
            cost: 'low',
            risk: 'low',
            recommendation: 'recommend'
        };

        // 根据行动数量评估
        if (plan.actions.length > 5) {
            evaluation.feasibility -= 10;
        }

        // 根据资源评估
        if (plan.resources?.includes('预算')) {
            evaluation.cost = 'medium';
            evaluation.recommendation = 'consider';
        }

        if (plan.type === 'risk' && plan.priority === 'urgent') {
            evaluation.recommendation = 'strongly_recommend';
        }

        return evaluation;
    }
};

// 导出
window.PlanAgent = PlanAgent;
