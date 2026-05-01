"""
店赢OS管理后台API - 种子数据
"""
from database import init_db, execute_insert, execute_query
import json


def seed_merchants():
    """种子商家数据"""
    merchants = [
        (1, "北京湘菜馆", "餐饮", "旗舰版", "active", "2024-01-15", "2025-01-15", 1285000, 8560, 4.8, 3240, "13800000001", "张总", "北京市朝阳区"),
        (2, "上海小笼包", "餐饮", "专业版", "active", "2024-02-20", "2025-02-20", 856000, 5420, 4.6, 1890, "13800000002", "李总", "上海市浦东新区"),
        (3, "广州茶餐厅", "餐饮", "免费版", "active", "2024-03-10", "2025-03-10", 320000, 2100, 4.3, 560, "13800000003", "王总", "广州市天河区"),
        (4, "深圳火锅店", "餐饮", "旗舰版", "active", "2024-01-05", "2025-01-05", 2150000, 12400, 4.9, 5680, "13800000004", "赵总", "深圳市南山区"),
        (5, "成都串串香", "餐饮", "专业版", "expiring", "2023-06-01", "2024-12-28", 680000, 4200, 4.5, 1450, "13800000005", "刘总", "成都市锦江区"),
        (6, "杭州奶茶铺", "餐饮", "免费版", "active", "2024-04-15", "2025-04-15", 180000, 980, 4.2, 280, "13800000006", "陈总", "杭州市西湖区"),
        (7, "南京大牌档", "餐饮", "旗舰版", "active", "2024-01-20", "2025-01-20", 1580000, 9200, 4.7, 4120, "13800000007", "杨总", "南京市鼓楼区"),
        (8, "武汉热干面", "餐饮", "专业版", "active", "2024-02-28", "2025-02-28", 520000, 3100, 4.4, 980, "13800000008", "周总", "武汉市武昌区"),
        (9, "重庆小面", "餐饮", "免费版", "inactive", "2024-05-01", "2025-05-01", 95000, 620, 4.1, 120, "13800000009", "吴总", "重庆市渝中区"),
        (10, "西安肉夹馍", "餐饮", "专业版", "active", "2024-03-15", "2025-03-15", 450000, 2800, 4.5, 780, "13800000010", "郑总", "西安市雁塔区"),
        (11, "苏州生煎包", "餐饮", "旗舰版", "active", "2024-01-10", "2025-01-10", 980000, 6100, 4.6, 2890, "13800000011", "孙总", "苏州市姑苏区"),
        (12, "天津包子铺", "餐饮", "免费版", "active", "2024-06-01", "2025-06-01", 120000, 750, 4.0, 180, "13800000012", "马总", "天津市和平区"),
        (13, "长沙臭豆腐", "餐饮", "专业版", "active", "2024-04-20", "2025-04-20", 380000, 2200, 4.3, 650, "13800000013", "朱总", "长沙市天心区"),
        (14, "郑州烩面馆", "餐饮", "旗舰版", "active", "2024-02-01", "2025-02-01", 1100000, 7200, 4.7, 3560, "13800000014", "胡总", "郑州市金水区"),
        (15, "青岛海鲜楼", "餐饮", "专业版", "expiring", "2023-07-15", "2024-12-25", 780000, 4800, 4.6, 1680, "13800000015", "郭总", "青岛市市南区"),
        (16, "厦门沙茶面", "餐饮", "免费版", "active", "2024-07-01", "2025-07-01", 88000, 520, 4.2, 95, "13800000016", "林总", "厦门市思明区"),
        (17, "哈尔滨饺子馆", "餐饮", "专业版", "active", "2024-05-10", "2025-05-10", 420000, 2600, 4.4, 720, "13800000017", "何总", "哈尔滨市南岗区"),
        (18, "昆明过桥米线", "餐饮", "旗舰版", "active", "2024-01-25", "2025-01-25", 1350000, 8100, 4.8, 3980, "13800000018", "高总", "昆明市五华区"),
        (19, "合肥小龙虾", "餐饮", "免费版", "active", "2024-08-01", "2025-08-01", 65000, 380, 4.1, 60, "13800000019", "罗总", "合肥市蜀山区"),
        (20, "南昌瓦罐汤", "餐饮", "专业版", "active", "2024-06-15", "2025-06-15", 310000, 1900, 4.3, 480, "13800000020", "梁总", "南昌市东湖区"),
    ]
    
    for m in merchants:
        execute_insert("""
            INSERT OR REPLACE INTO merchants 
            (id, name, industry, version, status, register_time, expire_time, gmv, orders, rating, ai_usage, phone, contact, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, m)


def seed_agents():
    """种子代理商数据"""
    agents = [
        (1, "华东区代理中心", "diamond", 156, 2850000, "active", "2023-01-15", "13800001111", "华东区"),
        (2, "华南区服务中心", "gold", 98, 1680000, "active", "2023-03-20", "13800002222", "华南区"),
        (3, "华北运营总部", "diamond", 203, 4200000, "active", "2022-11-01", "13800003333", "华北区"),
        (4, "西南代理商联盟", "silver", 45, 520000, "active", "2023-06-10", "13800004444", "西南区"),
        (5, "华中代理网络", "gold", 112, 1950000, "active", "2023-02-28", "13800005555", "华中区"),
        (6, "东北区服务中心", "silver", 38, 480000, "active", "2023-08-15", "13800006666", "东北区"),
        (7, "西北代理体系", "gold", 67, 890000, "active", "2023-04-01", "13800007777", "西北区"),
        (8, "港澳台代理中心", "silver", 28, 350000, "inactive", "2023-09-20", "13800008888", "港澳台"),
    ]
    
    for a in agents:
        execute_insert("""
            INSERT OR REPLACE INTO agents 
            (id, name, level, merchants, monthly_gmv, status, join_time, contact, region)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, a)


def seed_sales():
    """种子业务员数据"""
    sales = [
        (1, "张伟", "13800138001", "华东区", "active", 28, 5),
        (2, "李娜", "13800138002", "华南区", "active", 35, 7),
        (3, "王强", "13800138003", "华北区", "active", 42, 9),
        (4, "赵敏", "13800138004", "西南区", "active", 18, 3),
        (5, "刘洋", "13800138005", "华中区", "active", 31, 6),
        (6, "陈静", "13800138006", "东北区", "active", 22, 4),
        (7, "杨帆", "13800138007", "西北区", "inactive", 15, 2),
        (8, "周涛", "13800138008", "华东区", "active", 38, 8),
        (9, "吴琳", "13800138009", "华南区", "active", 26, 5),
        (10, "郑鹏", "13800138010", "华北区", "active", 45, 10),
    ]
    
    for s in sales:
        execute_insert("""
            INSERT OR REPLACE INTO sales 
            (id, name, phone, region, status, customers, this_month_sign)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, s)


def seed_transactions():
    """种子交易流水数据"""
    import random
    merchants = ["北京湘菜馆", "上海小笼包", "深圳火锅店", "广州茶餐厅", "成都串串香", 
                 "杭州奶茶铺", "南京大牌档", "武汉热干面", "重庆小面", "西安肉夹馍",
                 "苏州生煎包", "天津包子铺", "长沙臭豆腐", "郑州烩面馆", "青岛海鲜楼"]
    statuses = ["success", "success", "success", "success", "pending", "failed"]
    types = ["subscription", "subscription", "subscription", "upgrade", "renewal"]
    amounts = [380, 680, 980, 1980, 2680, 5980]
    
    for i in range(1, 51):
        mid = f"TX202412{str(i).zfill(4)}"
        merchant = random.choice(merchants)
        amount = random.choice(amounts)
        tx_type = random.choice(types)
        status = random.choice(statuses)
        day = min(i, 30)
        time_str = f"2024-12-{str(day).zfill(2)} {str(random.randint(9,21)).zfill(2)}:{str(random.randint(0,59)).zfill(2)}:{str(random.randint(0,59)).zfill(2)}"
        
        execute_insert("""
            INSERT OR REPLACE INTO transactions (id, merchant, amount, type, status, time)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (mid, merchant, amount, tx_type, status, time_str))


def seed_tickets():
    """种子工单数据"""
    tickets = [
        ("TK202412001", "北京湘菜馆", "技术问题", "AI助手响应缓慢", "open", "high", "2024-12-01 10:30", "张工"),
        ("TK202412002", "上海小笼包", "功能咨询", "如何开通数据分析功能", "pending", "medium", "2024-12-01 14:15", "李工"),
        ("TK202412003", "深圳火锅店", "账单问题", "发票开具申请", "resolved", "low", "2024-11-30 09:20", "王工"),
        ("TK202412004", "广州茶餐厅", "技术问题", "支付接口无法调起", "open", "high", "2024-12-02 11:45", "待分配"),
        ("TK202412005", "成都串串香", "功能建议", "希望增加会员积分功能", "pending", "low", "2024-12-01 16:30", "赵工"),
        ("TK202412006", "杭州奶茶铺", "账号问题", "子账号权限配置", "resolved", "medium", "2024-11-29 13:10", "刘工"),
        ("TK202412007", "南京大牌档", "技术问题", "小程序无法正常打开", "open", "high", "2024-12-02 15:20", "陈工"),
        ("TK202412008", "武汉热干面", "账单问题", "退款申请", "pending", "medium", "2024-12-02 10:05", "杨工"),
        ("TK202412009", "重庆小面", "功能咨询", "海报模板使用方法", "resolved", "low", "2024-11-28 14:50", "周工"),
        ("TK202412010", "西安肉夹馍", "技术问题", "数据同步异常", "open", "medium", "2024-12-03 09:30", "吴工"),
    ]
    
    for t in tickets:
        execute_insert("""
            INSERT OR REPLACE INTO tickets 
            (id, merchant, type, title, status, priority, create_time, assignee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, t)


def seed_announcements():
    """种子公告数据"""
    announcements = [
        (1, "平台功能更新通知", "新增AI智能客服2.0版本，支持多轮对话和意图识别...", "all", "published", "2024-12-01", 1256),
        (2, "元旦假期服务安排", "2025年元旦假期期间，技术支持团队照常提供服务...", "all", "published", "2024-12-15", 892),
        (3, "新商家入驻优惠活动", "即日起至12月31日，新入驻商家享受首月专业版免费...", "all", "published", "2024-12-10", 1567),
        (4, "系统维护通知", "12月20日凌晨2:00-6:00进行系统维护...", "all", "published", "2024-12-18", 234),
    ]
    
    for a in announcements:
        execute_insert("""
            INSERT OR REPLACE INTO announcements 
            (id, title, content, scope, status, create_time, views)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, a)


def seed_knowledge():
    """种子知识库数据"""
    knowledge = [
        (1, "餐饮行业运营指南", "catering", "published", "2024-11-20", 3456),
        (2, "好评回复话术大全", "marketing", "published", "2024-11-18", 2890),
        (3, "差评处理标准流程", "operations", "published", "2024-11-15", 4567),
        (4, "新店开业营销方案", "marketing", "published", "2024-11-12", 1234),
        (5, "会员体系搭建指南", "membership", "published", "2024-11-10", 987),
        (6, "数据分析报告模板", "analytics", "published", "2024-11-08", 654),
        (7, "节日营销策略合集", "marketing", "published", "2024-11-15", 2345),
        (8, "外卖平台对接指南", "catering", "published", "2024-11-10", 1567),
        (9, "AI助手最佳实践", "ai", "published", "2024-11-08", 1234),
    ]
    
    for k in knowledge:
        execute_insert("""
            INSERT OR REPLACE INTO knowledge 
            (id, title, category, status, update_time, views)
            VALUES (?, ?, ?, ?, ?, ?)
        """, k)


def seed_ai_templates():
    """种子AI模板数据"""
    templates = [
        (1, "智能好评回复", "review", "ai", "published"),
        (2, "差评危机公关", "review", "ai", "published"),
        (3, "新品推广文案", "marketing", "content", "published"),
        (4, "节日营销海报", "marketing", "design", "published"),
        (5, "门店介绍长图", "intro", "content", "published"),
        (6, "活动预告文案", "activity", "content", "published"),
        (7, "顾客关怀短信", "crm", "message", "published"),
        (8, "竞品对比分析", "analysis", "report", "draft"),
    ]
    
    for t in templates:
        execute_insert("""
            INSERT OR REPLACE INTO ai_templates 
            (id, name, type, category, status)
            VALUES (?, ?, ?, ?, ?)
        """, t)


def seed_churn_warning():
    """种子流失预警数据"""
    warnings = [
        (1, "重庆小面", "high", 78, "2024-11-15", "连续30天未登录", "立即电话回访"),
        (2, "合肥小龙虾", "high", 72, "2024-11-18", "功能使用率下降80%", "发送专属优惠券"),
        (3, "厦门沙茶面", "medium", 55, "2024-11-25", "近期差评增加", "关注评价回复"),
        (4, "天津包子铺", "medium", 48, "2024-11-28", "订单量持续下滑", "推送营销方案"),
        (5, "哈尔滨饺子馆", "low", 25, "2024-12-01", "版本即将到期", "发送续费提醒"),
    ]
    
    for w in warnings:
        execute_insert("""
            INSERT OR REPLACE INTO churn_warning 
            (id, merchant, risk_level, probability, last_active, reason, suggestion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, w)


def seed_roles():
    """种子角色数据"""
    roles = [
        (1, "超级管理员", "super", json.dumps(["all"]), 2),
        (2, "运营主管", "operator", json.dumps(["merchants", "content", "marketing", "analytics"]), 5),
        (3, "财务专员", "finance", json.dumps(["billing", "refund", "invoice", "reports"]), 3),
        (4, "客服经理", "support", json.dumps(["tickets", "faq", "customers"]), 4),
    ]
    
    for r in roles:
        execute_insert("""
            INSERT OR REPLACE INTO roles 
            (id, name, level, permissions, users)
            VALUES (?, ?, ?, ?, ?)
        """, r)


def seed_operation_logs():
    """种子操作日志数据"""
    logs = [
        (1, "张管理员", "商家管理", "北京湘菜馆", "开通旗舰版", "2024-12-01 10:30:25", "192.168.1.100"),
        (2, "李运营", "内容发布", "运营公告#12", "发布", "2024-12-01 11:45:18", "192.168.1.102"),
        (3, "王财务", "账单处理", "深圳火锅店", "确认收款", "2024-12-01 14:22:36", "192.168.1.105"),
        (4, "张管理员", "权限配置", "代理商#3", "升级为钻石代理", "2024-12-01 16:08:42", "192.168.1.100"),
        (5, "赵客服", "工单处理", "TK202412001", "分配给张工", "2024-12-01 17:35:15", "192.168.1.108"),
    ]
    
    for l in logs:
        execute_insert("""
            INSERT OR REPLACE INTO operation_logs 
            (id, operator, type, object, action, time, ip)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, l)


def seed_refunds():
    """种子退款数据"""
    refunds = [
        (1, "杭州奶茶铺", 380, "误购买", "2024-12-01", "pending"),
        (2, "天津包子铺", 980, "功能不符合预期", "2024-11-28", "approved"),
        (3, "哈尔滨饺子馆", 380, "重复扣费", "2024-11-25", "rejected"),
        (4, "厦门沙茶面", 680, "其他原因", "2024-11-20", "approved"),
    ]
    
    for r in refunds:
        execute_insert("""
            INSERT OR REPLACE INTO refunds 
            (id, merchant, amount, reason, time, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, r)


def seed_invoices():
    """种子发票数据"""
    invoices = [
        (1, "北京湘菜馆", "专票", 5980, "pending", "2024-12-01"),
        (2, "深圳火锅店", "普票", 5980, "issued", "2024-11-25"),
        (3, "南京大牌档", "专票", 5980, "shipped", "2024-11-20"),
        (4, "郑州烩面馆", "普票", 5980, "issued", "2024-11-15"),
    ]
    
    for i in invoices:
        execute_insert("""
            INSERT OR REPLACE INTO invoices 
            (id, merchant, type, amount, status, apply_time)
            VALUES (?, ?, ?, ?, ?, ?)
        """, i)


def seed_visit_records():
    """种子跟访记录数据"""
    records = [
        (1, "北京湘菜馆", "张伟", "电话回访", "了解商家对新功能的体验反馈", "2024-12-01 10:30", "2024-12-08"),
        (2, "上海小笼包", "李娜", "上门拜访", "演示AI营销工具的使用方法", "2024-12-01 14:15", "2024-12-15"),
        (3, "深圳火锅店", "王强", "线上会议", "讨论年度合作续约方案", "2024-12-02 09:00", None),
        (4, "广州茶餐厅", "赵敏", "电话回访", "收集商家遇到的问题", "2024-12-02 11:30", "2024-12-09"),
        (5, "成都串串香", "刘洋", "上门拜访", "现场解决支付问题", "2024-12-02 15:45", "2024-12-16"),
    ]
    
    for r in records:
        execute_insert("""
            INSERT OR REPLACE INTO visit_records 
            (id, merchant, salesman, type, content, time, next_visit)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, r)


def seed_service_providers():
    """种子服务商数据"""
    providers = [
        (1, "杭州技术服务公司", "技术支持", "华东区", "已认证", 45),
        (2, "深圳支付解决方案", "支付接入", "华南区", "已认证", 32),
        (3, "北京小程序开发", "定制开发", "华北区", "审核中", 18),
        (4, "上海数据分析服务", "数据服务", "华东区", "已认证", 28),
    ]
    
    for p in providers:
        execute_insert("""
            INSERT OR REPLACE INTO service_providers 
            (id, name, scope, region, qualification, merchants)
            VALUES (?, ?, ?, ?, ?, ?)
        """, p)


def seed_channel_analysis():
    """种子渠道分析数据"""
    channels = [
        ("线下沙龙", 320, 86, 26.9, 45000),
        ("转介绍", 180, 72, 40.0, 28000),
        ("线上投放", 580, 98, 16.9, 85000),
        ("代理商推荐", 420, 145, 34.5, 62000),
        ("内容营销", 250, 45, 18.0, 18000),
    ]
    
    for c in channels:
        execute_insert("""
            INSERT OR REPLACE INTO channel_analysis 
            (channel, leads, converted, rate, cost)
            VALUES (?, ?, ?, ?, ?)
        """, c)


def seed_partners():
    """种子合作伙伴数据"""
    partners = [
        (1, "招商银行", "银行", "active", "2024-01", 156),
        (2, "有赞科技", "SaaS厂商", "active", "2024-03", 89),
        (3, "美团餐饮", "平台合作", "active", "2024-02", 234),
        (4, "支付宝", "支付合作", "active", "2023-11", 520),
    ]
    
    for p in partners:
        execute_insert("""
            INSERT OR REPLACE INTO partners 
            (id, name, type, status, cooperation_time, merchants)
            VALUES (?, ?, ?, ?, ?, ?)
        """, p)


def seed_faq():
    """种子FAQ数据"""
    faqs = [
        (1, "产品功能", "如何开通AI客服功能？", "进入商家后台 > AI助手 > 开启智能客服即可...", "published"),
        (2, "产品功能", "数据报表在哪里查看？", "在数据 > 数据分析中可以查看各类经营数据...", "published"),
        (3, "账单支付", "如何申请发票？", "在财务 > 发票管理中提交开票申请...", "published"),
        (4, "技术支持", "系统响应缓慢怎么办？", "建议清理浏览器缓存或更换网络环境...", "draft"),
    ]
    
    for f in faqs:
        execute_insert("""
            INSERT OR REPLACE INTO faq 
            (id, category, question, answer, status)
            VALUES (?, ?, ?, ?, ?)
        """, f)


def seed_feature_flags():
    """种子功能开关数据"""
    flags = [
        (1, "AI对话2.0", "enabled", "all", "2024-12-01"),
        (2, "智能推荐系统", "enabled", "premium", "2024-11-25"),
        (3, "多语言支持", "beta", "selective", "2024-12-10"),
        (4, "AR预览功能", "disabled", "none", "2024-10-15"),
    ]
    
    for f in flags:
        execute_insert("""
            INSERT OR REPLACE INTO feature_flags 
            (id, name, status, scope, update_time)
            VALUES (?, ?, ?, ?, ?)
        """, f)


def seed_requirements():
    """种子需求池数据"""
    reqs = [
        (1, "增加批量导入功能", "北京湘菜馆", 45, "developing"),
        (2, "支持多门店管理", "深圳火锅店", 38, "scheduled"),
        (3, "对接抖音小程序", "成都串串香", 32, "evaluating"),
        (4, "增加积分商城", "杭州奶茶铺", 28, "released"),
        (5, "优化报表导出", "南京大牌档", 25, "evaluating"),
    ]
    
    for r in reqs:
        execute_insert("""
            INSERT OR REPLACE INTO requirements 
            (id, title, merchant, votes, status)
            VALUES (?, ?, ?, ?, ?)
        """, r)


def seed_versions():
    """种子版本数据"""
    versions = [
        ("V3.0.0", "released", "2024-12-01", "全新UI设计，AI能力升级"),
        ("V2.8.0", "released", "2024-11-01", "增加营销工具模块"),
        ("V2.7.0", "deprecated", "2024-10-01", "优化数据分析功能"),
        ("V2.6.0", "deprecated", "2024-09-01", "修复若干Bug"),
    ]
    
    for v in versions:
        execute_insert("""
            INSERT OR REPLACE INTO versions 
            (version, status, release_time, changes)
            VALUES (?, ?, ?, ?)
        """, v)


def seed_login_logs():
    """种子登录日志数据"""
    logs = [
        (1, "张管理员", "正常登录", "北京市", "Chrome/Win10", "2024-12-03 09:15:32", "success"),
        (2, "李运营", "正常登录", "上海市", "Chrome/MacOS", "2024-12-03 09:22:18", "success"),
        (3, "王财务", "异地登录", "广州市", "Safari/MacOS", "2024-12-03 10:35:45", "warning"),
        (4, "赵客服", "正常登录", "深圳市", "Edge/Win11", "2024-12-03 11:08:22", "success"),
        (5, "张管理员", "密码错误", "未知", "Firefox/Win7", "2024-12-03 14:22:16", "failed"),
    ]
    
    for l in logs:
        execute_insert("""
            INSERT OR REPLACE INTO login_logs 
            (id, user, type, location, device, time, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, l)


def seed_pricing():
    """种子定价数据"""
    pricing = [
        ("免费版", 0, 0, "永久", json.dumps(["基础AI客服", "100次/月", "3个员工账号", "基础数据统计"])),
        ("专业版", 980, 1280, "年付", json.dumps(["完整AI套件", "5000次/月", "10个员工账号", "营销工具", "数据看板", "优先客服"])),
        ("旗舰版", 5980, 7980, "年付", json.dumps(["全部AI能力", "无限次调用", "无限账号", "定制开发", "专属客服", "API接口", "数据导出"])),
    ]
    
    for p in pricing:
        execute_insert("""
            INSERT OR REPLACE INTO pricing 
            (version, price, original_price, period, features)
            VALUES (?, ?, ?, ?, ?)
        """, p)


def seed_payment_channels():
    """种子支付通道数据"""
    channels = [
        ("微信支付", "online", 99.2, 120, 856000),
        ("支付宝", "online", 98.8, 135, 728000),
        ("银联支付", "online", 97.5, 180, 245000),
        ("信用卡", "degraded", 92.3, 280, 126000),
    ]
    
    for c in channels:
        execute_insert("""
            INSERT OR REPLACE INTO payment_channels 
            (name, status, success_rate, avg_time, today_volume)
            VALUES (?, ?, ?, ?, ?)
        """, c)


def seed_settlement_records():
    """种子结算记录数据"""
    records = [
        ("华东区代理中心", "2024-11", 285000, 285000, "settled", "2024-12-01"),
        ("华南区服务中心", "2024-11", 168000, 168000, "settled", "2024-12-01"),
        ("华北运营总部", "2024-11", 420000, 420000, "settled", "2024-12-01"),
        ("西南代理商联盟", "2024-11", 52000, 52000, "pending", None),
    ]
    
    for r in records:
        execute_insert("""
            INSERT OR REPLACE INTO settlement_records 
            (agent, month, payable, actual, status, settle_time)
            VALUES (?, ?, ?, ?, ?, ?)
        """, r)


def seed_activities():
    """种子运营活动数据"""
    activities = [
        (1, "新商家入驻优惠", "promotion", "2024-12-01", "2024-12-31", "published"),
        (2, "年度最佳商家评选", "event", "2024-12-15", "2024-12-31", "draft"),
        (3, "AI功能体验月", "campaign", "2024-12-01", "2024-12-31", "published"),
    ]
    
    for a in activities:
        execute_insert("""
            INSERT OR REPLACE INTO activities 
            (id, title, type, start_time, end_time, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, a)


def seed_all():
    """种子所有数据"""
    init_db()
    seed_merchants()
    seed_agents()
    seed_sales()
    seed_transactions()
    seed_tickets()
    seed_announcements()
    seed_knowledge()
    seed_ai_templates()
    seed_churn_warning()
    seed_roles()
    seed_operation_logs()
    seed_refunds()
    seed_invoices()
    seed_visit_records()
    seed_service_providers()
    seed_channel_analysis()
    seed_partners()
    seed_faq()
    seed_feature_flags()
    seed_requirements()
    seed_versions()
    seed_login_logs()
    seed_pricing()
    seed_payment_channels()
    seed_settlement_records()
    seed_activities()
    print("All seed data loaded successfully!")


if __name__ == "__main__":
    seed_all()
