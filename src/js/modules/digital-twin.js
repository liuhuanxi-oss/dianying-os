/**
 * 门店数字孪生模块
 * 店赢OS - 先模拟，后执行
 */

const DigitalTwin = {
    // 孪生状态
    states: {
        idle: 'idle',
        building: 'building',
        simulating: 'simulating',
        analyzing: 'analyzing',
        ready: 'ready'
    },

    // 创建数字孪生
    async createTwin(storeId, options = {}) {
        const store = DataStore.getStore(storeId);
        
        // 构建孪生模型
        const twinModel = {
            id: `twin_${Date.now()}`,
            storeId,
            storeName: store?.name || '门店',
            createdAt: new Date().toISOString(),
            status: this.states.building,
            metrics: this.buildMetrics(storeId),
            patterns: this.identifyPatterns(storeId),
            predictions: null,
            recommendations: null
        };

        // 模拟构建过程
        await this.simulateBuildProcess(twinModel);
        
        // 生成预测
        twinModel.predictions = this.generatePredictions(storeId);
        
        // 生成建议
        twinModel.recommendations = this.generateRecommendations(twinModel);
        
        twinModel.status = this.states.ready;

        return twinModel;
    },

    // 构建指标体系
    buildMetrics(storeId) {
        const store = DataStore.getStore(storeId);
        return {
            operational: {
                dailyRevenue: store?.todayRevenue || 0,
                avgOrderValue: (store?.todayRevenue / 50).toFixed(2),
                peakHours: ['12:00-14:00', '18:00-21:00'],
                utilizationRate: '78%'
            },
            customer: {
                totalReviews: store?.reviews || 0,
                avgRating: store?.rating || 0,
                badReviewRate: store?.badReviewRate || 0,
                replyRate: store?.replyRate || 0,
                returnRate: '65%'
            },
            staff: {
                count: store?.staff || 0,
                efficiency: '82%',
                satisfaction: '88%'
            },
            financial: {
                revenueGrowth: store?.trend || '+5%',
                costRatio: '42%',
                profitMargin: '28%'
            }
        };
    },

    // 识别运营模式
    identifyPatterns(storeId) {
        const reviews = DataStore.getReviews(storeId);
        const patterns = {
            positiveTriggers: [],
            negativeTriggers: [],
            peakPatterns: [],
            seasonalPatterns: []
        };

        // 分析正面触发因素
        const positiveKeywords = ['服务好', '味道好', '环境好', '新鲜', '推荐', '满意'];
        positiveKeywords.forEach(keyword => {
            const matches = reviews.filter(r => r.content.includes(keyword) && r.rating >= 4);
            if (matches.length > 0) {
                patterns.positiveTriggers.push({
                    factor: keyword,
                    frequency: matches.length,
                    impact: 'positive'
                });
            }
        });

        // 分析负面触发因素
        const negativeKeywords = ['等待', '服务', '味道', '环境', '价格'];
        negativeKeywords.forEach(keyword => {
            const matches = reviews.filter(r => r.content.includes(keyword) && r.rating <= 3);
            if (matches.length > 0) {
                patterns.negativeTriggers.push({
                    factor: keyword,
                    frequency: matches.length,
                    impact: 'negative'
                });
            }
        });

        // 峰值模式
        patterns.peakPatterns = [
            { time: '午餐时段', factor: '工作日', impact: '+25%' },
            { time: '晚餐时段', factor: '周末', impact: '+45%' },
            { time: '下午茶', factor: '晴天', impact: '+30%' }
        ];

        // 季节模式
        patterns.seasonalPatterns = [
            { season: '春季', trend: '上升', factor: '天气转暖' },
            { season: '夏季', trend: '高峰', factor: '旺季' },
            { season: '秋季', trend: '平稳', factor: '正常' },
            { season: '冬季', trend: '波动', factor: '火锅类上升' }
        ];

        return patterns;
    },

    // 生成预测
    generatePredictions(storeId) {
        const store = DataStore.getStore(storeId);
        return {
            nextWeekRevenue: {
                predicted: (store?.todayRevenue * 7 * 1.15).toFixed(0),
                confidence: '85%',
                trend: 'up'
            },
            customerFlow: {
                weekday: '85-95人次/天',
                weekend: '120-150人次/天'
            },
            risk预测: {
                churnRisk: '12%客户有流失风险',
                stockRisk: '3种商品可能缺货',
                reviewRisk: '下周可能新增2-3条差评'
            },
            opportunity: {
                pricing: '动态定价可提升营收+8%',
                timing: '下午茶时段有增长空间',
                promotion: '会员活动参与度可提升+15%'
            }
        };
    },

    // 生成建议
    generateRecommendations(twinModel) {
        const recommendations = [];
        const storeType = twinModel.storeId;
        const patterns = twinModel.patterns;

        // 基于负面触发因素的建议
        if (patterns.negativeTriggers.length > 0) {
            const topIssue = patterns.negativeTriggers[0];
            recommendations.push({
                category: '改善',
                priority: 'high',
                title: `优化${topIssue.factor}问题`,
                description: `近期有${topIssue.frequency}条相关反馈，建议重点改进`,
                expectedEffect: '差评率下降30%'
            });
        }

        // 基于机会的建议
        if (twinModel.predictions.opportunity) {
            recommendations.push({
                category: '增长',
                priority: 'medium',
                title: '实施动态定价',
                description: twinModel.predictions.opportunity.pricing,
                expectedEffect: '营收提升8%'
            });
        }

        // 基于季节的建议
        const currentSeason = this.getCurrentSeason();
        const seasonPattern = patterns.seasonalPatterns.find(p => p.season === currentSeason);
        if (seasonPattern) {
            recommendations.push({
                category: '策略',
                priority: 'medium',
                title: `${currentSeason}运营策略`,
                description: `${currentSeason}趋势${seasonPattern.trend}，主因：${seasonPattern.factor}`,
                expectedEffect: '把握季节红利'
            });
        }

        return recommendations;
    },

    // 获取当前季节
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return '春季';
        if (month >= 5 && month <= 7) return '夏季';
        if (month >= 8 && month <= 10) return '秋季';
        return '冬季';
    },

    // 模拟构建过程
    async simulateBuildProcess(twinModel) {
        const steps = [
            { progress: 10, message: '收集门店数据...' },
            { progress: 30, message: '分析运营模式...' },
            { progress: 50, message: '构建预测模型...' },
            { progress: 70, message: '识别关键因素...' },
            { progress: 90, message: '生成优化建议...' },
            { progress: 100, message: '数字孪生构建完成' }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 200));
            twinModel.buildProgress = step.progress;
            twinModel.buildMessage = step.message;
        }
    },

    // 模拟策略效果
    async simulateStrategy(twinId, strategy) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const simulations = {
            price_adjustment: {
                revenueChange: '+8.5%',
                customerImpact: '-2%',
                confidence: '88%'
            },
            service_improvement: {
                revenueChange: '+5.2%',
                customerImpact: '+12%',
                confidence: '82%'
            },
            marketing_campaign: {
                revenueChange: '+15.3%',
                customerImpact: '+25%',
                confidence: '75%'
            }
        };

        return {
            twinId,
            strategy,
            result: simulations[strategy] || simulations.service_improvement,
            recommendation: this.evaluateSimulationResult(simulations[strategy] || {})
        };
    },

    // 评估模拟结果
    evaluateSimulationResult(result) {
        const revenueChange = parseFloat(result.revenueChange);
        if (revenueChange > 10) {
            return '建议立即执行，预计效果显著';
        } else if (revenueChange > 5) {
            return '建议执行，需持续监控效果';
        }
        return '建议进一步优化策略后再执行';
    }
};

// 导出
window.DigitalTwin = DigitalTwin;
