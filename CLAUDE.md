# 店赢OS - AI驱动的多门店运营SaaS平台

## 项目结构

```
dianying-os/
├── index.html          # 首页（落地页）
├── login.html          # 登录页
├── merchant.html       # 商家端后台（45个模块，9555行）
├── platform.html       # 平台端后台（21个模块，3186行）
├── agent.html          # 代理商端后台（13个模块，2542行）
├── merchant-payment.html  # 商家支付进件
├── platform-payment.html  # 平台支付管理
├── agent-payment.html     # 代理商支付
├── dashboard-bi.html   # BI分析看板
├── dashboard.html      # 总控制台
├── dashboard-merchant.html  # 商家仪表盘
├── dashboard-platform.html # 平台仪表盘
├── ai-demo.html        # AI对话演示
├── cli-demo.html       # CLI终端演示
├── architecture.html   # 架构图
├── admin.html          # 旧版兼容
├── js/
│   ├── interaction.js  # 全局交互（Toast/模态框/侧边栏/登录/表格/AI对话/CLI）
│   ├── app.js
│   ├── auth.js
│   └── admin.js
├── css/
│   ├── saas-style.css
│   ├── mobile-responsive.css
│   └── landing-mobile.css
├── backend/            # FastAPI后端
│   ├── main.py         # 入口（路由：auth/stores/reviews/stats/merchants/notify）
│   ├── models.py       # 7张表
│   ├── init_db.py      # 数据库初始化
│   ├── config.py
│   ├── database.py
│   └── routes/         # 6个路由模块
├── docker-compose.yml
├── nginx.conf
└── CLAUDE.md           # 本文件
```

## 核心交互机制

### 三端模块切换（最关键！）
- 三个主页面（merchant/platform/agent）都有侧边栏导航
- 每个nav-item用 `onclick="switchModule('模块名')"` 切换
- 每个模块内容用 `<div id="module-模块名" class="module-content">` 包裹
- CSS: `.module-content { display: none; } .module-content.active { display: block; }`
- switchModule函数在HTML中定义，被 interaction.js 的 patchSwitchModule() 覆盖增强

### switchModule修复历史
- 原始函数使用 `event.currentTarget`，隐式event对象不可靠
- interaction.js 的 patchSwitchModule() 覆盖了原始函数，改用onclick属性匹配nav-item
- 已push到GitHub（commit feb05e7），但线上仍未验证是否生效

### 商家端模块清单（45个）
dashboard/review/platform/pricing/reconcile/settings/report/inventory/bad-review-full/digital-twin/voice/alipay/ai-workflow/smart-route/tickets/permission/notify/multi-store/member/payment/onboarding/marketing/campaigns/knowledge/calendar/health/roi/competitor/insight/deploy/ai-autopilot/audit-trail/alert/changelog/cli-hub/data-export/mock-control/battle-arena/time-machine/ai-chat/kk-command/insight/supply/log

### 平台端模块清单（21个）
agent-mgmt/aml/analytics/churn/content-ops/credit/customer-success/data-insight/dispute/finance/funnel/merchant-mgmt/nps/payment/payment-entry/qrcode/rating/referral/staff-mgmt/support/sys-settings

### 代理商端模块清单（13个）
commission/crm/customermgr/honor/material/merchant/onboard/performance/profit/rank/reports/team/training

## 后端API
- FastAPI + SQLite，数据库文件：dianying-os/dianying.db
- 预置账号：首次部署运行 `python init_db.py` 后查看终端输出
- 6个路由：/api/auth, /api/stores, /api/reviews, /api/stats, /api/merchants, /api/notify
- 启动：cd backend && python -m uvicorn main:app --port 8000

## 修复铁律
1. **仅新增不替换** - 严禁覆盖现有功能
2. **不虚构** - 不知道就说不知道
3. **修完必须验证** - 用浏览器实际点击测试
4. **push前检查** - git diff确认改动范围
