# DianYing OS (店赢OS)

> AI-Powered One-Person Company Operating System for Retail Stores

[English](#english) | [中文](#中文)

---

## English

### What is DianYing OS?

**DianYing OS** is an AI-native operating system designed for small retail businesses. It empowers a single person to manage multiple stores with intelligent automation.

### Core Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Virtual Store Manager** | 24/7 AI-powered manager that handles reviews, pricing, and operations autonomously |
| 🏪 **Store Digital Twin** | Simulate strategies in digital environment before real-world execution |
| 📚 **Cross-Store Knowledge Transfer** | Replicate successful strategies from one store to many |
| 💰 **Dynamic Pricing Engine** | AI-driven pricing based on weather, holidays, and demand |
| 🎯 **Customer Lifecycle Autopilot** | Automated customer journey from acquisition to retention |
| 📋 **Store Cloning** | One-click replication of successful store operations |

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DianYing OS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      User Interface                          │   │
│   │              (Dashboard / Mobile / WeChat)                  │   │
│   └────────────────────────────┬────────────────────────────────┘   │
│                                │                                     │
│   ┌────────────────────────────▼────────────────────────────────┐   │
│   │                    AI Virtual Manager                        │   │
│   │                                                              │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐            │   │
│   │   │  Insight   │   │   Plan    │   │  Deliver  │            │   │
│   │   │   Agent    │──►│   Agent   │──►│   Agent   │            │   │
│   │   └───────────┘   └───────────┘   └───────────┘            │   │
│   │          │               │               │                  │   │
│   │          └───────────────┼───────────────┘                  │   │
│   │                          ▼                                    │   │
│   │                   ┌───────────┐                              │   │
│   │                   │  Operate  │                              │   │
│   │                   │   Agent   │                              │   │
│   │                   └───────────┘                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/dianying-os.git
cd dianying-os

# Open in browser
open src/index.html

# Or use a local server
python -m http.server 8080
# Then visit http://localhost:8080/src/index.html
```

### Project Structure

```
dianying-os/
├── src/
│   ├── index.html           # Main entry page
│   ├── css/style.css        # Styles
│   └── js/
│       ├── app.js           # Main application logic
│       ├── agents/          # AI Agent modules
│       └── modules/         # Core business modules
├── prompts/                 # Coze Bot prompt templates
├── docs/                    # Documentation
└── config/                  # Configuration templates
```

### Tech Stack

- **Frontend**: Pure HTML5 + CSS3 + JavaScript (ES6+)
- **No build tools required** - runs directly in browser
- **AI Engine**: Powered by Coze (扣子) platform

---

## 中文

### 什么是店赢OS？

**店赢OS** 是一款从零设计的AI原生门店操作系统，让一个人可以运营无限门店。

### 六大核心创新

| 功能 | 描述 |
|------|------|
| 🤖 **AI虚拟店长** | 7×24小时在线的AI店长，自主处理评价、定价、运营 |
| 🏪 **门店数字孪生** | 先在数字环境中模拟验证，再下发执行 |
| 📚 **跨店知识迁移** | 一家店的成功经验，可复制到千家门店 |
| 💰 **动态定价引擎** | 接入天气/节假日/竞品数据，实时自动调价 |
| 🎯 **客户生命周期自动驾驶** | 从获客到复购，AI全程自动推进 |
| 📋 **门店克隆** | 成功门店一键复制到新店，开店周期从3个月缩短到3天 |

### 技术架构

```
店赢OS
├── 用户交互层（Dashboard / 移动端 / 企微）
├── AI虚拟店长
│   ├── 线索Agent → 洞察分析
│   ├── 方案Agent → 策略生成
│   ├── 交付Agent → 执行追踪
│   └── 运营Agent → 持续优化
└── 数据层（评价/运营/外部数据）
```

### 快速开始

1. 下载或克隆本项目
2. 直接用浏览器打开 `src/index.html`
3. 或使用本地服务器：
   ```bash
   python -m http.server 8080
   # 访问 http://localhost:8080/src/index.html
   ```

### 项目截图

> Screenshots coming soon

![DianYing OS Dashboard](docs/screenshot-dashboard.png)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

> 🚀 **让一个人就是一支军队——用AI操作系统，一个人可以运营无限门店。**
