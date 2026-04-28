/**
 * 门店克隆模块
 * 店赢OS - 成功门店一键复制到新店
 */

const StoreClone = {
    // 克隆状态
    cloneStatus: {
        idle: 'idle',
        extracting: 'extracting',
        transforming: 'transforming',
        deploying: 'deploying',
        completed: 'completed',
        failed: 'failed'
    },

    // 克隆配置模板
    cloneConfig: {
        required: ['storeName', 'address', 'staff', 'hours'],
        optional: ['customPricing', 'specialServices', 'promotions']
    },

    // 执行克隆流程
    async executeClone(sourceStore, targetConfig) {
        const steps = [];
        
        // Step 1: 模式提取
        steps.push({ step: 'extract', name: '提取运营模式', status: this.cloneStatus.extracting });
        const extracted = await this.extractStoreModel(sourceStore);
        await this.delay(800);
        
        // Step 2: 模板生成
        steps.push({ step: 'transform', name: '生成运营模板', status: this.cloneStatus.transforming });
        const template = await this.generateTemplate(extracted, targetConfig);
        await this.delay(600);
        
        // Step 3: 配置部署
        steps.push({ step: 'deploy', name: '部署到新店', status: this.cloneStatus.deploying });
        const deployment = await this.deployToStore(template, targetConfig);
        await this.delay(700);

        return {
            success: true,
            steps,
            result: deployment,
            summary: this.generateCloneSummary(sourceStore, targetConfig)
        };
    },

    // 提取门店模型
    async extractStoreModel(storeId) {
        const store = DataStore.getStore(storeId);
        return {
            storeType: store.type,
            industry: store.industry,
            operatingHours: this.getTypicalHours(store.type),
            serviceConfig: this.getServiceConfig(store.type),
            pricingConfig: this.getPricingConfig(store.type),
            staffRoles: this.getStaffRoles(store.type),
            marketingTemplates: this.getMarketingTemplates(store.type),
            successPatterns: KnowledgeTransfer.extractExperience(store.type)
        };
    },

    // 获取典型营业时间
    getTypicalHours(storeType) {
        const hours = {
            hotpot: { open: '11:00', close: '23:00', peakHours: ['18:00-21:00'] },
            tea: { open: '10:00', close: '22:00', peakHours: ['12:00-14:00', '17:00-19:00'] },
            gym: { open: '06:00', close: '23:00', peakHours: ['07:00-09:00', '18:00-21:00'] }
        };
        return hours[storeType] || hours.hotpot;
    },

    // 获取服务配置
    getServiceConfig(storeType) {
        const configs = {
            hotpot: ['点餐服务', '加菜服务', '锅底推荐', '结账服务'],
            tea: ['点单服务', '制作展示', '会员积分', '拍照道具'],
            gym: ['入场登记', '体测服务', '课程预约', '私教咨询']
        };
        return configs[storeType] || configs.hotpot;
    },

    // 获取定价配置
    getPricingConfig(storeType) {
        const base = DataStore.basePrices[storeType];
        return {
            currency: 'CNY',
            rounding: 1,
            discountRules: ['会员9折', '团购85折', '学生证8折'],
            items: base
        };
    },

    // 获取员工角色
    getStaffRoles(storeType) {
        const roles = {
            hotpot: [
                { role: '前厅主管', count: 1, tasks: ['排班', '培训', '协调'] },
                { role: '服务员', count: 8, tasks: ['点餐', '上菜', '收台'] },
                { role: '后厨', count: 4, tasks: ['切配', '炒锅', '小吃'] },
                { role: '收银', count: 2, tasks: ['收银', '结账'] }
            ],
            tea: [
                { role: '店长', count: 1, tasks: ['管理', '订货'] },
                { role: '调茶师', count: 4, tasks: ['制作饮品', '物料管理'] },
                { role: '收银', count: 1, tasks: ['收银', '收银'] }
            ],
            gym: [
                { role: '店长', count: 1, tasks: ['管理', '销售'] },
                { role: '私教', count: 3, tasks: ['体测', '授课', '维护'] },
                { role: '前台', count: 2, tasks: ['登记', '咨询'] }
            ]
        };
        return roles[storeType] || roles.hotpot;
    },

    // 获取营销模板
    getMarketingTemplates(storeType) {
        return [
            { name: '开业活动', duration: '首周', discount: '8折' },
            { name: '会员日', duration: '每月18日', discount: '双倍积分' },
            { name: '节假日促销', duration: '假期', discount: '送小食' }
        ];
    },

    // 生成模板
    async generateTemplate(extracted, targetConfig) {
        return {
            templateId: `tmpl_${Date.now()}`,
            sourceStore: extracted.storeType,
            targetStore: targetConfig.name,
            adaptations: this.calculateAdaptations(extracted, targetConfig),
            timeline: {
                setup: '3天',
                staffTraining: '5天',
                softOpen: '2天',
                fullOperation: '7天'
            },
            totalDuration: '预计17天完成部署',
            checklist: this.generateChecklist(extracted)
        };
    },

    // 计算适配调整
    calculateAdaptations(extracted, targetConfig) {
        const adaptations = [];
        
        // 营业时间适配
        if (targetConfig.hours) {
            adaptations.push({
                type: '营业时间',
                original: extracted.operatingHours,
                adapted: targetConfig.hours,
                reason: '根据新店位置调整'
            });
        }

        // 人员配置适配
        const staffRatio = targetConfig.staff / (DataStore.getStore(extracted.storeType)?.staff || 10);
        if (staffRatio !== 1) {
            adaptations.push({
                type: '人员配置',
                original: extracted.staffRoles,
                adapted: this.scaleStaffRoles(extracted.staffRoles, staffRatio),
                reason: `按${(staffRatio * 100).toFixed(0)}%比例调整`
            });
        }

        return adaptations;
    },

    // 缩放员工配置
    scaleStaffRoles(roles, ratio) {
        return roles.map(role => ({
            ...role,
            count: Math.max(1, Math.round(role.count * ratio))
        }));
    },

    // 生成检查清单
    generateChecklist(extracted) {
        return [
            { item: '完成门店装修验收', status: 'pending' },
            { item: '设备采购与安装', status: 'pending' },
            { item: '系统配置与调试', status: 'pending' },
            { item: '员工招聘完成', status: 'pending' },
            { item: '培训资料准备', status: 'pending' },
            { item: '货品首批订货', status: 'pending' },
            { item: '开业活动策划', status: 'pending' },
            { item: '营销物料准备', status: 'pending' }
        ];
    },

    // 部署到新店
    async deployToStore(template, targetConfig) {
        return {
            storeId: `store_${Date.now()}`,
            storeName: targetConfig.name,
            templateApplied: template.templateId,
            configStatus: 'ready',
            estimatedLaunch: this.calculateLaunchDate(template),
            support: {
                dedicatedManager: '张经理',
                hotile: '400-xxx-xxxx',
                wechat: 'dianying_os_support'
            }
        };
    },

    // 计算开业日期
    calculateLaunchDate(template) {
        const days = 17;
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    },

    // 生成克隆摘要
    generateCloneSummary(source, target) {
        return {
            sourceName: DataStore.getStore(source)?.name || source,
            targetName: target.name || '新店',
            successRate: 95,
            timeSaved: '预计节省2.5个月调试时间',
            costSaved: '预计节省¥50,000运营试错成本'
        };
    },

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 导出
window.StoreClone = StoreClone;
