/**
 * 评价智能管理模块
 * 店赢OS - 从被动响应到主动预警+自动处理
 */

const ReviewHandler = {
    // 评价分析结果缓存
    analysisCache: {},

    // 根因分析规则
    rootCauseRules: {
        hotpot: {
            service: ['服务', '态度', '等待', '不耐烦', '冷漠'],
            food: ['味道', '新鲜', '口感', '菜品', '锅底'],
            environment: ['环境', '噪音', '卫生', '座位', '拥挤'],
            price: ['价格', '贵', '性价比', '收费']
        },
        tea: {
            service: ['服务', '态度', '等待', '制作'],
            product: ['味道', '口感', '甜度', '饮品', '茶'],
            environment: ['环境', '座位', '干净', '嘈杂'],
            price: ['价格', '性价比', '贵']
        },
        gym: {
            service: ['私教', '教练', '指导', '态度'],
            facility: ['器械', '设备', '器材', '老旧'],
            environment: ['环境', '卫生', '通风', '拥挤'],
            price: ['价格', '会费', '性价比']
        }
    },

    // 分析评价内容
    analyzeReview(review, storeType) {
        const content = review.content;
        const rules = this.rootCauseRules[storeType] || this.rootCauseRules.hotpot;
        const issues = [];
        const strengths = [];

        // 检测问题类型
        for (const [category, keywords] of Object.entries(rules)) {
            for (const keyword of keywords) {
                if (content.includes(keyword)) {
                    const categoryName = this.getCategoryName(category);
                    if (!issues.find(i => i.category === category)) {
                        issues.push({
                            category,
                            name: categoryName,
                            keyword,
                            severity: this.calculateSeverity(review.rating, keyword)
                        });
                    }
                }
            }
        }

        // 检测优点
        const positiveKeywords = ['好', '棒', '赞', '优秀', '满意', '推荐', '喜欢', '不错', '专业', '新鲜'];
        positiveKeywords.forEach(keyword => {
            if (content.includes(keyword) && review.sentiment === 'positive') {
                const idx = issues.findIndex(i => content.indexOf(i.keyword) < content.indexOf(keyword));
                if (idx === -1 || idx > 0) {
                    strengths.push(keyword);
                }
            }
        });

        return {
            reviewId: review.id,
            sentiment: review.sentiment,
            rating: review.rating,
            issues,
            strengths,
            needsResponse: review.sentiment !== 'positive' || review.rating < 4,
            priority: this.calculatePriority(review)
        };
    },

    // 获取分类名称
    getCategoryName(category) {
        const names = {
            service: '服务问题',
            food: '出品问题',
            product: '产品问题',
            environment: '环境问题',
            price: '价格问题',
            facility: '设施问题'
        };
        return names[category] || '其他问题';
    },

    // 计算严重程度
    calculateSeverity(rating, keyword) {
        let severity = 'low';
        const criticalKeywords = ['差', '烂', '垃圾', '失望', '再也不来'];
        const warningKeywords = ['不好', '失望', '建议', '希望'];

        if (rating <= 2) {
            severity = criticalKeywords.some(k => keyword.includes(k)) ? 'critical' : 'high';
        } else if (rating === 3) {
            severity = warningKeywords.some(k => keyword.includes(k)) ? 'medium' : 'low';
        }

        return severity;
    },

    // 计算优先级
    calculatePriority(review) {
        if (review.rating <= 1) return 'urgent';
        if (review.rating <= 2) return 'high';
        if (review.sentiment === 'negative') return 'medium';
        return 'low';
    },

    // 生成AI回复
    generateResponse(review, analysis, storeType) {
        const responses = {
            hotpot: {
                negative: (issue) => `尊敬的顾客您好，非常抱歉给您带来了不愉快的用餐体验。${this.getIssueApology(issue)}我们会立即反馈给门店进行改进，感谢您的宝贵意见，期待下次能为您带来更好的服务！`,
                neutral: () => `感谢您的评价！您的建议我们已经记录，会在后续服务中持续优化。欢迎您再次光临老码头火锅！`,
                positive: () => `感谢您的认可与支持！您的肯定是我们的最大动力。老码头火锅祝您生活愉快，欢迎下次光临！`
            },
            tea: {
                negative: (issue) => `亲爱的顾客，感谢您的反馈。对于您提到的问题，我们深表歉意。${this.getIssueApology(issue)}我们会不断提升，期待下次为您带来更棒的体验！`,
                neutral: () => `感谢您的建议！您的反馈对我们很重要，我们会持续改进，期待为您提供更好的服务！`,
                positive: () => `谢谢您的喜爱！能看到您喜欢我们的饮品真的太开心啦～期待下次光临茶悦时光！`
            },
            gym: {
                negative: (issue) => `会员您好，感谢您的反馈。${this.getIssueApology(issue)}我们会认真对待您的建议，不断提升服务质量，期待您的下次到来！`,
                neutral: () => `感谢您的评价！我们会持续改进器械和课程，欢迎您多提宝贵意见，力健健身房祝您健身愉快！`,
                positive: () => `谢谢您的认可！小李教练得知后非常开心，我们会继续努力！祝您健身效果越来越好！`
            }
        };

        const storeResponses = responses[storeType] || responses.hotpot;
        const issue = analysis.issues.length > 0 ? analysis.issues[0] : null;

        if (analysis.sentiment === 'positive' && analysis.rating >= 4) {
            return storeResponses.positive();
        } else if (analysis.sentiment === 'negative' || analysis.rating <= 2) {
            return storeResponses.negative(issue);
        }
        return storeResponses.neutral();
    },

    // 获取问题道歉话术
    getIssueApology(issue) {
        const apologies = {
            service: '关于服务方面的问题，我们已对相关员工进行培训和服务规范强化。',
            food: '关于菜品方面的问题，我们已反馈给后厨团队，确保出品质量。',
            product: '关于产品方面的问题，我们会及时改进配方和制作流程。',
            environment: '关于环境方面的问题，我们已安排加强清洁和座位管理。',
            price: '感谢您的反馈，我们会考虑提供更多优惠活动。',
            facility: '关于设施问题，我们已将您的建议提交给设备管理部门。'
        };
        return apologies[issue?.category] || '对此问题我们深表歉意。';
    },

    // 检测差评风险
    detectBadReviewRisk(storeId, reviews) {
        const recentBad = reviews.filter(r => r.rating <= 2 && r.sentiment === 'negative');
        const trend = recentBad.length > 2 ? 'rising' : recentBad.length > 0 ? 'stable' : 'good';

        const riskFactors = [];
        if (recentBad.length > 2) riskFactors.push('近期差评集中');
        if (recentBad.some(r => r.content.includes('服务'))) riskFactors.push('服务问题突出');
        if (recentBad.some(r => r.content.includes('等待'))) riskFactors.push('等位问题反馈多');

        return {
            storeId,
            trend,
            recentBadCount: recentBad.length,
            riskFactors,
            riskLevel: trend === 'rising' ? 'high' : trend === 'stable' ? 'medium' : 'low',
            alertMessage: this.generateRiskAlert(trend, riskFactors)
        };
    },

    // 生成风险预警消息
    generateRiskAlert(trend, riskFactors) {
        if (trend === 'rising') {
            return `⚠️ 差评风险预警：近期差评呈上升趋势，主要问题：${riskFactors.join('、')}。建议立即关注并调整运营策略。`;
        } else if (trend === 'stable') {
            return `📊 差评监控：当前差评率处于可控范围，建议持续关注。`;
        }
        return `✅ 评价健康：近期无差评预警，门店运营状态良好。`;
    }
};

// 导出
window.ReviewHandler = ReviewHandler;
