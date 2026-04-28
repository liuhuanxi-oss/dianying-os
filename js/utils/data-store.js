/**
 * 数据存储模块
 * 店赢OS - 门店数据持久化管理
 */

const DataStore = {
    // 存储键前缀
    PREFIX: 'dianying_os_',

    // 模拟数据库 - 门店数据
    stores: {
        hotpot: {
            id: 'hotpot',
            name: '老码头火锅（旗舰店）',
            industry: '餐饮',
            type: 'hotpot',
            rating: 4.6,
            reviews: 286,
            badReviewRate: 3.2,
            replyRate: 98,
            todayRevenue: 12580,
            trend: '+12%',
            address: '浦东新区陆家嘴环路1000号',
            staff: 15,
            capacity: 80
        },
        tea: {
            id: 'tea',
            name: '茶悦时光（万象城店）',
            industry: '茶饮',
            type: 'tea',
            rating: 4.8,
            reviews: 156,
            badReviewRate: 1.2,
            replyRate: 100,
            todayRevenue: 5680,
            trend: '+8%',
            address: '南山区科技园万象城B1层',
            staff: 6,
            capacity: 30
        },
        gym: {
            id: 'gym',
            name: '力健健身房（科技园店）',
            industry: '健身',
            type: 'gym',
            rating: 4.4,
            reviews: 89,
            badReviewRate: 4.5,
            replyRate: 95,
            todayRevenue: 3200,
            trend: '+5%',
            address: '南山区科技园南路88号',
            staff: 4,
            capacity: 200
        }
    },

    // 评价数据
    reviews: {
        hotpot: [
            { id: 1, rating: 2, platform: '美团', content: '等位太久，将近2个小时，而且锅底有点咸，服务跟不上', time: '10分钟前', sentiment: 'negative' },
            { id: 2, rating: 5, platform: '大众点评', content: '菜品非常新鲜，毛肚七上八下口感绝了！下次还来', time: '1小时前', sentiment: 'positive' },
            { id: 3, rating: 4, platform: '美团', content: '味道不错，就是价格有点贵，希望能有些优惠活动', time: '2小时前', sentiment: 'neutral' },
            { id: 4, rating: 5, platform: '大众点评', content: '服务员小王态度特别好，还送了我们甜品，感动！', time: '3小时前', sentiment: 'positive' }
        ],
        tea: [
            { id: 1, rating: 5, platform: '美团', content: '茉莉奶绿超好喝，茶味浓郁又不腻，每天一杯！', time: '15分钟前', sentiment: 'positive' },
            { id: 2, rating: 4, platform: '大众点评', content: '环境不错，适合拍照，就是周末人太多有点吵', time: '1小时前', sentiment: 'neutral' },
            { id: 3, rating: 5, platform: '小红书', content: '新出的杨枝甘露绝绝子，推荐所有女生都来试试！', time: '2小时前', sentiment: 'positive' }
        ],
        gym: [
            { id: 1, rating: 3, platform: '美团', content: '器械有点旧了，希望可以更新一下设备', time: '30分钟前', sentiment: 'negative' },
            { id: 2, rating: 5, platform: '大众点评', content: '私教小李非常专业，帮我制定的训练计划效果很明显', time: '2小时前', sentiment: 'positive' },
            { id: 3, rating: 4, platform: '美团', content: '团课种类丰富，就是高峰期器械要排队', time: '4小时前', sentiment: 'neutral' }
        ]
    },

    // 营收数据（近7天）
    revenueData: {
        hotpot: [8500, 9200, 8800, 10500, 12000, 15800, 12580],
        tea: [3200, 3500, 3300, 4100, 4800, 6200, 5680],
        gym: [2100, 2300, 2200, 2400, 2800, 3500, 3200]
    },

    // 预警数据
    alerts: {
        hotpot: [
            { type: 'info', icon: 'ℹ️', text: '周末客流预计增长20%' },
            { type: 'warning', icon: '⚠️', text: '库存预警：牛肉卷库存不足' }
        ],
        tea: [
            { type: 'info', icon: 'ℹ️', text: '新饮品上架，建议主推' }
        ],
        gym: [
            { type: 'warning', icon: '⚠️', text: '差评预警：器械老旧问题需关注' }
        ]
    },

    // 动态定价因子
    pricingFactors: {
        weather: { value: 'rainy', impact: -0.15, icon: '🌧️', name: '天气（雨天）' },
        time: { value: 'lunch', impact: 0.05, icon: '🕐', name: '时段（午餐）' },
        holiday: { value: false, impact: 0, icon: '📅', name: '节假日' },
        competitor: { value: 'promotion', impact: -0.1, icon: '🏪', name: '竞品促销' },
        demand: { value: 'high', impact: 0.2, icon: '📈', name: '需求热度' }
    },

    // 获取门店信息
    getStore(storeId) {
        return this.stores[storeId] || this.stores.hotpot;
    },

    // 获取门店列表
    getStoreList() {
        return Object.values(this.stores);
    },

    // 获取评价列表
    getReviews(storeId) {
        return this.reviews[storeId] || this.reviews.hotpot;
    },

    // 获取营收数据
    getRevenueData(storeId) {
        return this.revenueData[storeId] || this.revenueData.hotpot;
    },

    // 获取预警列表
    getAlerts(storeId) {
        return this.alerts[storeId] || this.alerts.hotpot;
    },

    // 计算综合定价因子
    calculatePricingFactor() {
        let totalImpact = 0;
        let factors = [];

        for (const [key, factor] of Object.entries(this.pricingFactors)) {
            if (factor.impact !== 0) {
                totalImpact += factor.impact;
                factors.push({
                    ...factor,
                    key
                });
            }
        }

        return {
            totalImpact: Math.round(totalImpact * 100),
            factors
        };
    },

    // 保存到本地存储
    save(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    },

    // 从本地存储读取
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Load failed:', e);
            return defaultValue;
        }
    },

    // 清除所有数据
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Clear failed:', e);
            return false;
        }
    }
};

// 导出
window.DataStore = DataStore;
