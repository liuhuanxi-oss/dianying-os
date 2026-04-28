/**
 * 信任等级机制模块
 * 店赢OS - AI自主运营信任阈值
 */

const TrustLevel = {
    // 信任等级配置
    levels: {
        A: { name: 'A级', score: '95-100', color: '#10b981', desc: '完全信任，AI全自动执行', auto: true },
        B: { name: 'B级', score: '85-94', color: '#3b82f6', desc: '高度信任，AI执行+短信通知', auto: true },
        C: { name: 'C级', score: '60-84', color: '#f59e0b', desc: '常规，AI生成+人工确认', auto: false },
        D: { name: 'D级', score: '40-59', color: '#ef4444', desc: '谨慎，AI生成+优先人工', auto: false },
        E: { name: 'E级', score: '<40', color: '#dc2626', desc: '预警，触发预警+强制人工', auto: false }
    },

    // 根据评分计算信任等级
    calculateTrustLevel(rating, sentiment) {
        // 基础分数
        let baseScore = 50;

        // 评分加成
        if (rating >= 5) baseScore += 35;
        else if (rating >= 4) baseScore += 25;
        else if (rating >= 3) baseScore += 10;
        else if (rating >= 2) baseScore -= 10;
        else baseScore -= 30;

        // 情感加成
        if (sentiment === 'positive') baseScore += 15;
        else if (sentiment === 'negative') baseScore -= 20;
        else baseScore += 5;

        // 边界修正
        baseScore = Math.max(0, Math.min(100, baseScore));

        // 确定等级
        if (baseScore >= 95) return { level: 'A', score: baseScore, ...this.levels.A };
        if (baseScore >= 85) return { level: 'B', score: baseScore, ...this.levels.B };
        if (baseScore >= 60) return { level: 'C', score: baseScore, ...this.levels.C };
        if (baseScore >= 40) return { level: 'D', score: baseScore, ...this.levels.D };
        return { level: 'E', score: baseScore, ...this.levels.E };
    },

    // 判断是否需要自动执行
    canAutoExecute(trustResult) {
        return trustResult.auto && trustResult.score >= 85;
    },

    // 获取等级颜色
    getLevelColor(level) {
        return this.levels[level]?.color || '#64748b';
    },

    // 获取等级名称
    getLevelName(level) {
        return this.levels[level]?.name || '未知';
    },

    // 评估AI回复质量
    evaluateResponseQuality(response, context) {
        let qualityScore = 70;

        // 检查回复长度
        if (response.length < 20) qualityScore -= 20;
        else if (response.length > 50) qualityScore += 10;

        // 检查是否包含关键元素
        const keyElements = ['歉意', '感谢', '解决方案', '改进'];
        const hasElements = keyElements.filter(el => response.includes(el));
        qualityScore += hasElements.length * 5;

        // 检查是否个性化
        if (context.storeType === 'hotpot' && response.includes('火锅')) qualityScore += 10;
        if (context.storeType === 'tea' && (response.includes('茶') || response.includes('饮品'))) qualityScore += 10;
        if (context.storeType === 'gym' && (response.includes('健身') || response.includes('私教'))) qualityScore += 10;

        return Math.min(100, Math.max(0, qualityScore));
    },

    // 生成信任报告
    generateTrustReport(review, responseQuality) {
        const trustResult = this.calculateTrustLevel(review.rating, review.sentiment);
        const canAuto = this.canAutoExecute(trustResult);

        return {
            trustLevel: trustResult,
            canAutoExecute: canAuto,
            responseQuality,
            recommendation: canAuto 
                ? '建议自动执行，AI回复质量达标' 
                : '建议人工复核后发送',
            timestamp: new Date().toISOString()
        };
    }
};

// 导出
window.TrustLevel = TrustLevel;
