/**
 * 跨店知识迁移模块
 * 店赢OS - 一家店的成功，可复制到千家
 */

const KnowledgeTransfer = {
    // 知识库 - 成功运营经验
    knowledgeBase: {
        hotpot: {
            successFactors: [
                { factor: '服务响应速度', score: 92, action: '优化点餐到上菜流程，目标5分钟内上齐' },
                { factor: '菜品新鲜度', score: 95, action: '建立每日食材溯源系统' },
                { factor: '等位体验', score: 78, action: '引入电子叫号+等位饮品' },
                { factor: '锅底口味稳定', score: 88, action: '标准化底料配比，数字化监控' }
            ],
            provenStrategies: [
                { name: '高峰分流策略', effect: '等位时间减少40%', applicable: ['dinner', 'weekend'] },
                { name: '爆品推荐法', effect: '客单价提升15%', applicable: ['lunch', 'dinner'] },
                { name: '会员积分体系', effect: '复购率提升25%', applicable: ['all'] }
            ],
            trainingPoints: ['七上八下涮毛肚', '锅底搭配建议', '特色菜品推荐话术']
        },
        tea: {
            successFactors: [
                { factor: '新品研发速度', score: 94, action: '每月至少2款新品，保持话题热度' },
                { factor: '制作效率', score: 90, action: '优化制作流程，单杯控制在90秒内' },
                { factor: '颜值与口感平衡', score: 88, action: '产品既有高颜值也有好口感' },
                { factor: '社交媒体运营', score: 92, action: '鼓励用户拍照打卡，提供拍照道具' }
            ],
            provenStrategies: [
                { name: '季节限定营销', effect: '带动销量提升30%', applicable: ['seasonal'] },
                { name: '第二杯半价', effect: '提升连带率至1.8', applicable: ['afternoon', 'weekend'] },
                { name: '集章换礼', effect: '会员活跃度提升45%', applicable: ['all'] }
            ],
            trainingPoints: ['奶茶制作标准流程', '应季推荐话术', '拍照打卡引导']
        },
        gym: {
            successFactors: [
                { factor: '私教专业度', score: 96, action: '建立教练评级+定期培训体系' },
                { factor: '课程丰富度', score: 85, action: '每周至少10种团课选择' },
                { factor: '设备维护', score: 82, action: '建立设备定期检修机制' },
                { factor: '会员跟进', score: 88, action: 'AI自动跟进未到店会员' }
            ],
            provenStrategies: [
                { name: '体验课转化', effect: '转化率提升至35%', applicable: ['new'] },
                { name: '团课会员制', effect: '团课参与率提升50%', applicable: ['monthly'] },
                { name: '赛季激励', effect: '续卡率提升20%', applicable: ['quarterly'] }
            ],
            trainingPoints: ['体测标准流程', '私教销售话术', '会员健康追踪']
        }
    },

    // 从源门店提炼经验
    extractExperience(sourceStore) {
        const experience = this.knowledgeBase[sourceStore];
        if (!experience) return null;

        return {
            sourceStore,
            extractedAt: new Date().toISOString(),
            successFactors: experience.successFactors.map(f => ({
                ...f,
                confidence: f.score >= 90 ? 'high' : f.score >= 80 ? 'medium' : 'low'
            })),
            provenStrategies: experience.provenStrategies,
            trainingPoints: experience.trainingPoints,
            maturity: this.calculateMaturity(experience)
        };
    },

    // 计算成熟度
    calculateMaturity(experience) {
        const avgScore = experience.successFactors.reduce((sum, f) => sum + f.score, 0) / experience.successFactors.length;
        const strategyCount = experience.provenStrategies.length;
        
        if (avgScore >= 90 && strategyCount >= 3) return 'expert';
        if (avgScore >= 80 && strategyCount >= 2) return 'experienced';
        return 'developing';
    },

    // 生成迁移包
    generateTransferPackage(sourceStore, targetStore) {
        const source = this.extractExperience(sourceStore);
        if (!source) return null;

        // 筛选适用于目标门店的策略
        const applicableStrategies = source.provenStrategies.filter(s => 
            s.applicable.includes('all') || 
            s.applicable.includes(targetStore.includes('tea') ? 'seasonal' : 'all')
        );

        return {
            packageId: `pkg_${Date.now()}`,
            source: sourceStore,
            target: targetStore,
            createdAt: new Date().toISOString(),
            content: {
                successFactors: source.successFactors,
                strategies: applicableStrategies,
                training: source.trainingPoints,
                recommendedActions: this.generateRecommendedActions(source, targetStore)
            },
            compatibility: this.calculateCompatibility(source, targetStore),
            estimatedEffect: this.estimateEffect(applicableStrategies)
        };
    },

    // 生成推荐行动
    generateRecommendedActions(source, targetStore) {
        const actions = [];
        
        source.successFactors.forEach(factor => {
            if (factor.score >= 90) {
                actions.push({
                    priority: 'high',
                    action: factor.action,
                    reason: `源门店${factor.factor}表现优秀（${factor.score}分），可迁移`
                });
            }
        });

        return actions;
    },

    // 计算兼容性
    calculateCompatibility(source, targetStore) {
        const sourceType = Object.keys(this.knowledgeBase).find(type => 
            source.sourceStore?.includes(type) || source.sourceStore === type
        );
        
        if (sourceType === targetStore) return 95;
        if (this.isRelatedIndustry(sourceType, targetStore)) return 75;
        return 60;
    },

    // 判断是否相关行业
    isRelatedIndustry(source, target) {
        const groups = {
            food: ['hotpot', 'tea'],
            fitness: ['gym']
        };
        return Object.values(groups).some(group => 
            group.includes(source) && group.includes(target)
        );
    },

    // 预估效果
    estimateEffect(strategies) {
        const avgEffect = strategies.reduce((sum, s) => {
            const match = s.effect.match(/(\d+)%/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / Math.max(strategies.length, 1);

        return {
            revenueIncrease: `+${(avgEffect * 0.6).toFixed(0)}%`,
            satisfactionIncrease: `+${(avgEffect * 0.3).toFixed(0)}%`,
            efficiencyIncrease: `+${(avgEffect * 0.4).toFixed(0)}%`
        };
    },

    // 获取知识建议
    getSuggestions(storeType, currentMetrics) {
        const knowledge = this.knowledgeBase[storeType];
        if (!knowledge) return [];

        return knowledge.successFactors
            .filter(f => f.score < 85)
            .map(f => ({
                area: f.factor,
                suggestion: f.action,
                priority: f.score < 70 ? 'high' : 'medium'
            }));
    }
};

// 导出
window.KnowledgeTransfer = KnowledgeTransfer;
