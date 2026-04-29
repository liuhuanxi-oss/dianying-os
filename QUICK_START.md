# 快速上手指南

> 店赢OS GitHub项目 - 快速入门

## 项目概述

**店赢OS** 是新一代AI驱动的智能门店运营系统，基于Multi-Agent架构（Gemini 3.1 Pro），让实体门店实现"一人公司"的运营模式。

**核心能力**：AI虚拟店长自主决策、差评自动处理、动态定价、跨店知识迁移、数字孪生模拟。

## 项目结构

```
dianying-os/
├── README.md              # 项目介绍
├── LICENSE                # MIT开源协议
├── index.html             # Landing Page + Demo体验（直接双击打开）
├── css/style.css          # 样式文件
├── js/app.js              # 交互逻辑
├── assets/logo.svg        # Logo
├── docs/                  # GitHub Pages镜像目录
│   ├── index.html         # 同根目录
│   ├── css/style.css      # 同根目录
│   ├── js/app.js          # 同根目录
│   ├── assets/logo.svg    # 同根目录
│   └── README.md          # 同根目录
├── knowledge/             # Coze知识库文件（10个行业）
├── prompts/              # Coze Bot提示词模板（5个Agent）
├── config/               # 门店配置模板
├── QUICK_START.md        # 本文件
├── CONTRIBUTING.md        # 贡献指南
└── LICENSE               # MIT协议
```

## 快速体验

### 方式一：直接打开（推荐）

直接双击 `index.html` 文件，在浏览器中打开即可体验完整功能。

### 方式二：本地服务器

```bash
cd dianying-os
python -m http.server 8080
# 访问 http://localhost:8080/index.html
```

### 方式三：在线体验

访问 GitHub Pages：[https://liuhuanxi-oss.github.io/dianying-os/](https://liuhuanxi-oss.github.io/dianying-os/)

## 功能演示

### 1. 差评处理演示

- 点击"立即体验"进入Demo
- 选择"差评处理"场景
- 观看AI多Agent协同自动处理差评

### 2. 动态定价演示

- 选择"动态定价"场景
- 查看天气、时段对定价的影响
- 智能调价建议

### 3. VIP管理演示

- 选择"VIP管理"场景
- 查看会员生命周期分析
- AI个性化召回策略

### 4. 跨店迁移演示

- 选择"跨店迁移"场景
- 查看行业知识复用
- 一家成功经验复制N家

### 5. 数字孪生演示

- 选择"数字孪生"场景
- 模拟不同定价方案
- 预估收益效果

## 技术架构

- **前端**：纯前端架构，无需后端
- **AI引擎**：Gemini 3.1 Pro
- **Multi-Agent**：线索Agent、方案Agent、交付Agent、运营Agent
- **知识库**：10+行业运营知识
- **部署**：GitHub Pages 零成本托管

## 开发指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)
