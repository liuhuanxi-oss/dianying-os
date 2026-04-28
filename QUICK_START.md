# 快速上手指南

> 店赢OS GitHub项目推送说明

## 项目概述

**店赢OS** 是一个纯前端的AI原生门店操作系统，无需后端，可直接在浏览器运行。

## 项目结构

```
dianying-os/
├── README.md                    # 项目介绍（中英文）
├── LICENSE                     # MIT开源协议
├── .gitignore                  # Git忽略配置
├── docs/                       # 技术文档
│   ├── architecture.md          # 技术架构文档
│   ├── api.md                  # API接口文档
│   └── demo-script.md          # Demo演示脚本
├── src/                        # 源代码
│   ├── index.html              # 主入口页面
│   ├── css/style.css           # 样式文件
│   ├── js/
│   │   ├── app.js              # 主应用逻辑
│   │   ├── agents/             # AI Agent模块
│   │   ├── modules/             # 核心业务模块
│   │   └── utils/              # 工具函数
│   └── assets/logo.svg          # Logo
├── prompts/                    # Coze Bot提示词模板
│   ├── virtual-manager.md       # AI虚拟店长
│   ├── insight-agent.md         # 线索Agent
│   ├── plan-agent.md            # 方案Agent
│   └── operate-agent.md        # 运营Agent
└── config/                     # 配置文件
    └── store-config.json       # 门店配置模板
```

## 运行方式

### 方式一：直接打开
双击 `src/index.html` 文件即可在浏览器中打开运行。

### 方式二：本地服务器
```bash
cd dianying-os
python -m http.server 8080
# 然后访问 http://localhost:8080/src/index.html
```

## GitHub推送步骤

### 1. 初始化Git仓库
```bash
cd dianying-os
git init
```

### 2. 添加所有文件
```bash
git add .
```

### 3. 提交
```bash
git commit -m "feat: 店赢OS MVP - AI原生门店操作系统

- AI虚拟店长，支持7×24小时自主运营
- 多Agent协同架构
- 差评智能预警与自动处理
- 动态定价引擎
- 门店数字孪生
- 跨店知识迁移
- 全行业覆盖（餐饮/茶饮/健身）
"
```

### 4. 添加远程仓库
```bash
git remote add origin https://github.com/你的用户名/dianying-os.git
```

### 5. 推送到GitHub
```bash
git branch -M main
git push -u origin main
```

## 功能演示

### 核心功能

1. **差评预警演示**
   - 点击右侧「🎯 演示差评预警」按钮
   - 查看AI自动分析、根因诊断、信任等级判定
   - 一键AI自动处理

2. **动态定价演示**
   - 点击右侧「💰 演示动态定价」按钮
   - 查看天气、时段、竞品等因素对价格的影响
   - 智能定价建议

3. **门店切换**
   - 点击左侧不同门店卡片
   - 体验跨行业（火锅/茶饮/健身）适配能力

4. **自然语言交互**
   - 在底部输入框输入问题
   - AI虚拟店长智能回答

## 技术亮点

- 🎯 **纯前端实现**：无需后端，浏览器直接运行
- 🤖 **多Agent协同**：线索→方案→交付→运营四大Agent
- ⚡ **信任等级机制**：A-E五级，自动/人工决策
- 📊 **实时数据面板**：营收、评价、趋势一目了然
- 🎨 **深色科技风格**：专业Dashboard设计
- 📱 **响应式布局**：支持移动端访问

## 参赛说明

本项目为 **WAIC OPC 独立先锋挑战赛** 参赛作品。

### 项目亮点
1. 从零设计的AI原生产品，非现有工具的简单集成
2. 真正解决小微门店老板的运营痛点
3. 多Agent协同架构设计清晰
4. Demo可运行、可演示、可解释

### 演示地址
可直接用浏览器打开 `src/index.html` 演示

## 联系方式

如有问题，欢迎提交Issue或联系开发者。

---

**让一个人就是一支军队——用AI操作系统，一个人可以运营无限门店。** 🚀
