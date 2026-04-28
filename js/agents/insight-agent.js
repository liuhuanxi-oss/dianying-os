/**
 * 线索Agent模块
 * 店赢OS - 主动发现问题，发现机会
 */

const InsightAgent = {
    // Agent标识
    agentId: 'insight_agent',
    name: '线索Agent',
    status: 'active',

    // 线索类型
    clueTypes: {
        review: { name: '评价线索', icon: '📝' },
        trend: { name: '趋势线索', icon: '📈' },
        risk: { name: '风险线索', icon: '⚠️' },
        opportunity: { name: '机会线索', icon: '💡' }
    },

    // 采集线索
    async collectClues(storeId) {
        const clues = [];
        
        // 评价线索
        const reviewClues = this.analyzeReviewClues(storeId);
        clues.push(...reviewClues);
        
        // 趋势线索
        const trendClues = this.analyzeTrendClues(storeId);
        clues.push(...trendClues);
        
        // 风险线索
        const riskClues = this.analyzeRiskClues(storeId);
        clues.push(...riskClues);
        
        // 机会线索
        const opportunityClues = this.analyzeOpportunityClues(storeId);
        clues.push(...opportunityClues);

        return {
            agentId: this.agentId,
            timestamp: new Date().toISOString(),
            clues,
            summary: this.generateClueSummary(clues)
        };
    },

    // 分析评价线索
    analyzeReviewClues(storeId) {
        const reviews = DataStore.getReviews(storeId);
        const clues = [];

        // 关键词统计
        const keywordCount = {};
        reviews.forEach(review => {
            const words = review.content.split(/[,，.。!！?？]/);
            words.forEach(word => {
                if (word.length >= 2) {
                    keywordCount[word.trim()] = (keywordCount[word.trim()] || 0) + 1;
                }
            });
        });

        // 找出高频关键词
        const topKeywords = Object.entries(keywordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topKeywords.length > 0) {
            clues.push({
                type: 'review',
                priority: 'medium',
                title: '评价热点词汇',
                content: `近期评价中 "${topKeywords[0][0]}" 出现频率最高（${topKeywords[0][1]}次）`,
                data: topKeywords
            });
        }

        // 差评模式检测
        const badReviews = reviews.filter(r => r.rating <= 2);
        if (badReviews.length > 0) {
            clues.push({
                type: 'risk',
                priority: 'high',
                title: '差评模式检测',
                content: `发现${badReviews.length}条差评，建议优先处理`,
                data: badReviews
            });
        }

        return clues;
    },

    // 分析趋势线索
    analyzeTrendClues(storeId) {
        const clues = [];
        const store = DataStore.getStore(storeId);
        const revenueData = DataStore.getRevenueData(storeId);

        // 计算趋势
        const recentAvg = (revenueData[5] + revenueData[6]) / 2;
        const earlierAvg = (revenueData[0] + revenueData[1] + revenueData[2]) / 3;
        const trend = ((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(1);

        clues.push({
            type: 'trend',
            priority: trend > 10 ? 'high' : 'low',
            title: '营收趋势分析',
            content: `本周营收${trend > 0 ? '增长' : '下降'}${Math.abs(trend)}%，${trend > 0 ? '表现良好' : '需关注'}`,
            data: { trend, values: revenueData }
        });

        // 周末效应
        const weekendAvg = (revenueData[5] + revenueData[6]) / 2;
        const weekdayAvg = revenueData.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const weekendEffect = ((weekendAvg - weekdayAvg) / weekdayAvg * 100).toFixed(1);

        clues.push({
            type: 'trend',
            priority: 'medium',
            title: '周末效应',
            content: `周末营收比平日${weekendEffect > 0 ? '高' : '低'}${Math.abs(weekendEffect)}%`,
            data: { weekendEffect }
        });

        return clues;
    },

    // 分析风险线索
    analyzeRiskClues(storeId) {
        const clues = [];
        const reviews = DataStore.getReviews(storeId);
        const riskData = ReviewHandler.detectBadReviewRisk(storeId, reviews);

        if (riskData.riskLevel !== 'low') {
            clues.push({
                type: 'risk',
                priority: riskData.riskLevel === 'high' ? 'urgent' : 'high',
                title: '差评风险预警',
                content: riskData.alertMessage,
                data: riskData
            });
        }

        // 回复率风险
        const store = DataStore.getStore(storeId);
        if (store && store.replyRate < 95) {
            clues.push({
                type: 'risk',
                priority: 'medium',
                title: '回复率下降',
                content: `当前回复率${store.replyRate}%，低于目标值95%`,
                data: { current: store.replyRate, target: 95 }
            });
        }

        return clues;
    },

    // 分析机会线索
    analyzeOpportunityClues(storeId) {
        const clues = [];

        // 时段机会
        clues.push({
            type: 'opportunity',
            priority: 'medium',
            title: '时段优化机会',
            content: '下午茶时段客流有提升空间，建议推出相关优惠活动',
            data: { timeSlot: 'afternoon', potential: '+15%' }
        });

        // 会员机会
        clues.push({
            type: 'opportunity',
            priority: 'low',
            title: '会员转化机会',
            content: '近30%新客未转化为会员，建议加强会员引导',
            data: { conversion: '30%', potential: '+8%' }
        });

        return clues;
    },

    // 生成线索摘要
    generateClueSummary(clues) {
        const urgentClues = clues.filter(c => c.priority === 'urgent' || c.priority === 'high');
        const mediumClues = clues.filter(c => c.priority === 'medium');
        const lowClues = clues.filter(c => c.priority === 'low');

        return {
            total: clues.length,
            urgent: urgentClues.length,
            high: mediumClues.length,
            medium: mediumClues.length,
            low: lowClues.length,
            topPriority: urgentClues[0]?.title || mediumClues[0]?.title || '暂无紧急线索'
        };
    }
};

// 导出
window.InsightAgent = InsightAgent;
