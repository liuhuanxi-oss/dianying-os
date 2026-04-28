/**
 * 动态定价引擎模块
 * 店赢OS - 让价格会思考
 */

const PricingEngine = {
    // 基础价格配置（示例商品）
    basePrices: {
        hotpot: {
            '肥牛': 48,
            '毛肚': 58,
            '虾滑': 38,
            '蔬菜拼盘': 28,
            '锅底': 38
        },
        tea: {
            '茉莉奶绿': 18,
            '杨枝甘露': 22,
            '芋泥波波': 20,
            '柠檬水': 12
        },
        gym: {
            '月卡': 299,
            '季卡': 799,
            '私教课': 280
        }
    },

    // 定价策略规则
    pricingRules: {
        weather: {
            'sunny': { multiplier: 1.1, desc: '晴天溢价' },
            'cloudy': { multiplier: 1.0, desc: '阴天原价' },
            'rainy': { multiplier: 0.9, desc: '雨天折扣' },
            'holiday': { multiplier: 1.2, desc: '节假日溢价' }
        },
        time: {
            'breakfast': { multiplier: 0.85, desc: '早餐时段折扣' },
            'lunch': { multiplier: 1.0, desc: '午餐时段原价' },
            'afternoon': { multiplier: 0.9, desc: '下午茶时段折扣' },
            'dinner': { multiplier: 1.15, desc: '晚餐时段溢价' },
            'lateNight': { multiplier: 0.95, desc: '深夜时段微调' }
        },
        demand: {
            'high': { multiplier: 1.15, desc: '高需求溢价' },
            'normal': { multiplier: 1.0, desc: '正常需求' },
            'low': { multiplier: 0.85, desc: '低需求折扣' }
        },
        competitor: {
            'promotion': { adjustment: -0.1, desc: '竞品促销应对' },
            'normal': { adjustment: 0, desc: '正常定价' },
            'premium': { adjustment: 0.05, desc: '竞品高价时提价' }
        }
    },

    // 计算动态价格
    calculateDynamicPrice(product, storeType, context) {
        const basePrice = this.basePrices[storeType]?.[product] || 30;
        
        let finalPrice = basePrice;
        const adjustments = [];
        let totalMultiplier = 1;

        // 天气影响
        if (context.weather) {
            const weatherRule = this.pricingRules.weather[context.weather];
            if (weatherRule) {
                totalMultiplier *= weatherRule.multiplier;
                adjustments.push({
                    factor: '天气',
                    detail: weatherRule.desc,
                    impact: `×${weatherRule.multiplier.toFixed(2)}`
                });
            }
        }

        // 时段影响
        if (context.timeOfDay) {
            const timeRule = this.pricingRules.time[context.timeOfDay];
            if (timeRule) {
                totalMultiplier *= timeRule.multiplier;
                adjustments.push({
                    factor: '时段',
                    detail: timeRule.desc,
                    impact: `×${timeRule.multiplier.toFixed(2)}`
                });
            }
        }

        // 需求热度
        if (context.demand) {
            const demandRule = this.pricingRules.demand[context.demand];
            if (demandRule) {
                totalMultiplier *= demandRule.multiplier;
                adjustments.push({
                    factor: '需求',
                    detail: demandRule.desc,
                    impact: `×${demandRule.multiplier.toFixed(2)}`
                });
            }
        }

        // 竞品影响
        if (context.competitor) {
            const competitorRule = this.pricingRules.competitor[context.competitor];
            if (competitorRule) {
                totalMultiplier += competitorRule.adjustment;
                adjustments.push({
                    factor: '竞品',
                    detail: competitorRule.desc,
                    impact: competitorRule.adjustment >= 0 ? `+${(competitorRule.adjustment * 100).toFixed(0)}%` : `${(competitorRule.adjustment * 100).toFixed(0)}%`
                });
            }
        }

        // 周末加成
        if (context.isWeekend) {
            totalMultiplier *= 1.08;
            adjustments.push({
                factor: '周末',
                detail: '周末客流高峰',
                impact: '×1.08'
            });
        }

        // 计算最终价格
        finalPrice = Math.round(basePrice * totalMultiplier * 100) / 100;

        return {
            product,
            storeType,
            basePrice,
            finalPrice,
            change: finalPrice - basePrice,
            changePercent: ((finalPrice - basePrice) / basePrice * 100).toFixed(1),
            adjustments,
            recommendation: this.getPricingRecommendation(finalPrice, basePrice)
        };
    },

    // 获取定价建议
    getPricingRecommendation(finalPrice, basePrice) {
        const changePercent = (finalPrice - basePrice) / basePrice * 100;
        
        if (changePercent > 15) {
            return { level: 'warning', message: '价格上调幅度较大，建议评估市场接受度' };
        } else if (changePercent < -15) {
            return { level: 'info', message: '折扣力度较大，可吸引价格敏感型客户' };
        }
        return { level: 'normal', message: '价格调整合理，建议执行' };
    },

    // 生成完整定价方案
    generatePricingPlan(storeType, context) {
        const products = Object.keys(this.basePrices[storeType] || this.basePrices.hotpot);
        const items = products.map(product => this.calculateDynamicPrice(product, storeType, context));
        
        const totalChange = items.reduce((sum, item) => sum + item.change, 0);
        const avgChange = (totalChange / items.length / this.basePrices[storeType][products[0]] * 100).toFixed(1);

        return {
            storeType,
            context,
            items,
            summary: {
                totalItems: items.length,
                priceUp: items.filter(i => i.change > 0).length,
                priceDown: items.filter(i => i.change < 0).length,
                unchanged: items.filter(i => i.change === 0).length,
                avgChange: avgChange
            },
            expectedRevenueChange: `${avgChange > 0 ? '+' : ''}${avgChange}%`,
            generatedAt: new Date().toISOString()
        };
    },

    // 模拟价格调整
    simulateAdjustment(currentPrice, factor, direction) {
        const adjustment = direction === 'up' ? 0.1 : -0.1;
        const newPrice = Math.round(currentPrice * (1 + adjustment) * 100) / 100;
        return {
            currentPrice,
            newPrice,
            adjustment: direction === 'up' ? '+10%' : '-10%',
            roi: direction === 'up' ? '预计营收+' : '预计客流+'
        };
    }
};

// 导出
window.PricingEngine = PricingEngine;
