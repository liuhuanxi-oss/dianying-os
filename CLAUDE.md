# 店赢OS - AI透视门店运营，驱动流量·星级·营收全面增长

## 项目概述
店赢OS是面向本地生活服务商的AI运营SaaS平台，为拉卡拉服务商/代理商提供行业SaaS解决方案+支付收款+分账+税筹一站式服务。
覆盖7大行业：餐饮、零售、休娱、加油站、旅游出行、物业停车、教育培训。

## 参赛项目
- WAIC OPC独立先锋挑战赛
- 腾讯云黑客松AI智能体争霸赛

## 技术栈
- **前端**: HTML5 + CSS3 + Vanilla JavaScript + Lucide Icons + Chart.js + ECharts
- **后端**: Python FastAPI + SQLite
- **CLI**: Click (Python) - 3个CLI工具
- **AI**: 多渠道大模型（17个渠道，OpenAI兼容格式）
- **支付**: 天阙支付API（SHA1withRSA签名）
- **平台对接**: 8大本地生活平台（美团/抖音/高德/百度/快手/小红书/微信/支付宝）
- **Bot**: 5个Coze Bot（扣子平台）

## 目录结构
```
├── index.html          # 落地页（数字滚动/Logo墙/价格方案）
├── admin.html          # 管理后台（54个功能模块）
├── ai-demo.html        # AI透视演示（对话+数据联动，3角色切换，17个大模型渠道）
├── dashboard.html      # 数据大屏（全屏监控，实时交易流+地图热力+AI洞察轮播）
├── architecture.html   # 技术架构图（5层交互式）
├── login.html          # 登录页（3角色快速体验）
├── cli-demo.html       # CLI终端展示（3个CLI工具在线演示）
├── css/                # 样式文件
│   ├── admin.css       # 管理后台样式
│   ├── ai-demo.css     # AI演示页样式
│   ├── login.css       # 登录页样式
│   ├── landing-mobile.css  # 落地页手机适配
│   └── mobile-responsive.css # 管理后台手机适配
├── js/                 # JavaScript
│   ├── admin.js        # 管理后台主逻辑（176KB，已拆分为模块）
│   ├── admin-api.js    # API客户端（94端点封装，自动fallback到Mock）
│   ├── admin-api-enhance.js # API增强
│   ├── auth.js         # 认证权限（3角色：管理员54功能/运营39功能/老板14功能）
│   └── modules/        # admin.js拆分的10个模块
│       ├── admin-core.js      # 核心框架+路由+全局搜索
│       ├── admin-dashboard.js # 数据概览
│       ├── admin-merchant.js  # 商户管理
│       ├── admin-finance.js   # 财务中心
│       ├── admin-agent.js     # 代理商体系
│       ├── admin-content.js   # 内容运营
│       ├── admin-customer.js  # 客户成功
│       ├── admin-sales.js     # 业务人员
│       ├── admin-channel.js   # 渠道增长
│       └── admin-support.js   # 客服支持
├── api/                # FastAPI后端
│   ├── main.py         # 入口（Swagger深色主题，123端点）
│   └── admin/          # 路由模块
│       ├── router.py          # 路由注册
│       ├── ai_routes.py       # AI对话（17渠道大模型）
│       ├── llm_config.py      # 多渠道LLM配置
│       ├── merchants.py       # 商户管理
│       ├── analytics.py       # 数据洞察
│       ├── finance.py         # 财务中心
│       ├── payment.py         # 支付交易
│       ├── payment_routes.py  # 天阙支付路由
│       ├── agents.py          # 代理商
│       ├── sales.py           # 业务人员
│       ├── customer.py        # 客户成功
│       ├── channel.py         # 渠道增长
│       ├── content.py         # 内容运营
│       ├── support.py         # 客服支持
│       ├── product.py         # 产品迭代
│       ├── security.py        # 安全合规
│       └── settings.py        # 系统设置
├── cli/                # CLI工具
│   ├── dyos/           # 管理后台CLI（13功能+workflow+batch）
│   ├── dyos-payment/   # 天阙支付CLI（商户/交易/分账/结算/对账）
│   └── dyos-platforms/ # 8大平台CLI（跨平台聚合+config+真实API）
├── .env.example        # 环境变量模板（17个AI渠道+天阙支付）
└── requirements.txt    # Python依赖
```

## 设计规范
- 深色主题：背景#0a0a0f，卡片#141420，主色#5e6ad2，辅色#00b8cc
- 手机端必须375px正常显示
- 图标用Lucide Icons
- 图表用Chart.js或ECharts
- 禁止使用框架（React/Vue等），纯Vanilla JS

## 关键约束
1. **安全**：所有密钥通过环境变量读取，绝不硬编码。天阙支付凭证从TIANQUE_*环境变量读取
2. **GitHub安全**：git历史已用filter-repo清除泄露的私钥，commit不可再包含敏感信息
3. **双模输出**：所有CLI支持--json参数，人类用表格、Agent用JSON
4. **Mock优先**：比赛Demo阶段用Mock数据，代码结构支持配Key切换真实API
5. **API Fallback**：前端调用API失败时自动fallback到本地Mock数据

## 环境变量
```bash
# AI大模型（选一个配置即可）
AI_PROVIDER=ark  # ark|openai|deepseek|qwen|zhipu|moonshot|wenxin|spark|yi|minimax|baichuan|hunyuan|siliconflow|groq|xiaomi|tencent|aliyun
ARK_API_KEY=xxx
ARK_ENDPOINT_ID=ep-xxx

# 天阙支付（生产环境）
TIANQUE_ORG_ID=xxx
TIANQUE_PRIVATE_KEY=xxx
TIANQUE_PUBLIC_KEY=xxx
TIANQUE_SP_PUBLIC_KEY=xxx
TIANQUE_MERCHANT_NO=xxx
```

## 开发命令
```bash
# 启动后端
cd api && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 安装CLI
cd cli/dyos && pip install -e .
cd cli/dyos-payment && pip install -e .
cd cli/dyos-platforms && pip install -e .

# CLI使用
dyos --help
dyos-payment --help
dyos-platform --help
```

## 当前状态
- ✅ 前端7个页面全部完成（落地页/管理后台/AI演示/数据大屏/架构图/登录页/CLI终端）
- ✅ 后端123个API端点+Swagger文档
- ✅ 3个CLI工具
- ✅ 8大平台API对接框架
- ✅ 17个大模型渠道配置
- ✅ 3角色权限体系
- ✅ 手机端适配
- ✅ Git历史敏感信息清除
- 🔜 宝塔面板+腾讯云部署上线
- 🔜 天阙支付生产环境真实联调

## 编程准则（Karpathy Principles）

严格遵循以下4条编码原则（来源：andrej-karpathy-skills, GitHub ⭐100k+）：

### 1. Think Before Coding — 先想清楚再动手
- 不要默认假设，明确陈述你的假设
- 当有多种解读时，把所有解读都呈现出来，让用户选择
- 在写代码之前，先描述你要做什么、为什么这么做
- 如果需求不明确，先提问而不是猜测

### 2. Simplicity First — 极简主义
- 只写解决问题所需的最少代码
- 200行能搞定绝不写1000行
- 不做过度设计，不为"可能的未来需求"预先编码
- 优先使用已有代码和标准库，不引入不必要的依赖
- 代码应该是"显然没有bug"而不是"没有明显bug"

### 3. Surgical Changes — 精准修改
- 只改必须改的，不"顺手"改相邻代码
- 每次改动要有明确的目的和范围
- 匹配现有代码风格，不自创风格
- 不重构不相关的代码
- 如果发现其他问题，记录下来单独处理，不要混在当前改动中

### 4. Goal-Driven Execution — 目标驱动
- 把每个任务转化为可验证的目标
- 先定义成功标准，再开始执行
- 每完成一步都要验证结果
- 如果方案行不通，及时切换而不是死磕

## UI参考（ai-website-cloner-template）

当需要设计新页面或优化现有页面UI时，遵循以下原则：
- **完整性优先**：页面必须功能完整，不能有空壳占位
- **像素级精确**：间距、字号、颜色严格遵循设计规范
- **交互模式先行**：先识别页面的交互模式（列表/表单/详情/仪表盘），再选择组件
- **参考标杆**：优先参考Linear/Stripe/Vercel等顶级SaaS的UI模式
- **深色主题一致性**：背景#0a0a0f，卡片#141420，主色#5e6ad2，辅色#00b8cc

## 已知问题
- admin.js模块动态加载竞态问题：快速切换页面时可能抛renderXxxPage is not defined（功能正常但有JS error）
