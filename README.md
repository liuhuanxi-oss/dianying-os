<div align="center">

<img src="assets/logo.svg" alt="店赢OS" width="80" />

# 店赢OS

**Multi-Agent 驱动的开源门店运营平台**

专注于餐饮 / 零售 / 休闲娱乐行业的差评处理、客诉响应、支付纠纷自动化

[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)
[![Go 1.22](https://img.shields.io/badge/Go-1.22-00ADD8?style=flat-square&logo=go)](https://go.dev)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![Multi-Agent](https://img.shields.io/badge/Architecture-Multi%20Agent-6366F1?style=flat-square)](#ai-agent架构)

[在线 Demo](https://liuhuanxi-oss.github.io/dianying-os/) · [快速开始](#快速开始) · [贡献指南](#贡献指南) · [技术架构](#技术架构)

</div>

---

## 项目简介

店赢OS 是一个 **MIT 协议开源**的门店运营平台，基于 Multi-Agent 协同架构，帮助线下门店实现差评自动处理、客诉智能分诊、支付纠纷全链路自动化。

- **开源协议**：MIT License，可自由使用、修改、分发，支持私有化部署与二次开发
- **核心理念**："一个人 + AI = 无限可能" — 用 AI Agent 替代重复性运营人力
- **适用行业**：餐饮、零售、休闲娱乐等线下实体门店

## 核心能力

### 🤖 五级 AI Agent 全流程协同

```
数据监测 → 问题分级 → 话术生成 → 自动触达 → 运营决策
```

5 个 AI Agent 各司其职，覆盖门店运营全链路，支持接入 DeepSeek 等开源大模型。

### 📡 多平台接入

美团 / 抖音 / 饿了么 / 大众点评 / 小红书 / 微信视频号 / 高德 / 口碑（支付宝）— 8 大平台数据抓取与统一处理。

### 🏠 私有化部署

支持 Docker 容器化部署，可对接本地 AI NAS 或私有算力，数据不出企业内网。

### 🛡️ 五级信任体系

AI 决策分级授权 — A 级（全自动）到 E 级（人工干预），渐进式建立对 AI 的信任，兼顾效率与安全。

## 功能模块

### 评价与客诉管理

| 功能 | 说明 |
|------|------|
| 多平台评价聚合 | 8 大平台评价统一收集、展示、回复 |
| AI 自动回复 | DeepSeek 驱动的智能话术生成与一键回复 |
| 差评预警 | 差评实时监测、分级告警、自动上报 |
| 支付投诉处理 | 微信/支付宝投诉 → AI 分诊 → 退款处理全链路自动化 |

### 运营分析

| 功能 | 说明 |
|------|------|
| 数据大屏 | 实时 GMV、订单、评价、客诉数据可视化 |
| 口碑分析 | 关键词提取、情感趋势、菜品 TOP 排行 |
| 竞品监控 | 排行榜、雷达图、市场份额对比 |
| AI 洞察日报 | 每日运营摘要 + 异常检测 + 行动建议 |

### 智能运营

| 功能 | 说明 |
|------|------|
| AI 内容创作 | 小红书笔记 / 抖音脚本一键生成 |
| 会员运营 | 会员分析、复购追踪、续费率监控 |
| 智能定价 | 天气/时段/竞品综合考量的动态调价策略 |
| 跨店知识迁移 | 一家店的成功运营策略，复制到多店 |

### 系统能力

| 功能 | 说明 |
|------|------|
| 三端分离 | 平台端 / 代理商端 / 商户端独立部署 |
| 租户隔离 | 数据隔离中间件，多商户安全共存 |
| API 接口 | RESTful API，支持第三方系统对接 |
| 数据导出 | PDF / Excel / 图片多格式导出 |

## AI Agent 架构

```
👤 用户输入（差评预警 / 客诉工单 / 运营决策）
    ↓
🤖 AI 虚拟店长 — 全局运营调度
    ↓
├── 🔍 线索 Agent — 商机识别与跟进
├── 📋 方案 Agent — 个性化方案推荐
├── ⚡ 交付 Agent — 服务交付管理
└── 🔄 运营 Agent — 持续运营优化
    ↓
📚 行业知识库（餐饮 / 零售 / 休娱）
```

## 技术架构

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端** | Go 1.22 + Gin | 371+ API 端点，万级并发仅需 200MB 内存 |
| **前端** | Vue 3 + Element Plus + ECharts | 四端独立 SPA（平台/代理/商户/小程序） |
| **AI 引擎** | Multi-Agent + DeepSeek | 5 Agent 协同，支持接入任意 OpenAI 兼容 API |
| **数据库** | MySQL 8.0 | GORM ORM，Repository 模式 |
| **部署** | Docker + Nginx + systemd | 单二进制部署，支持宝塔面板 |

```
dianying-os/
├── dyos-go/                 # Go 2.0 后端
│   ├── cmd/server/          # 入口
│   ├── internal/
│   │   ├── handler/         # HTTP 处理器（30+）
│   │   ├── service/         # 业务逻辑层
│   │   ├── repository/      # 数据访问层
│   │   ├── model/           # 数据模型
│   │   ├── middleware/       # 中间件（鉴权/租户/限流）
│   │   ├── router/          # 路由注册
│   │   ├── tianque/         # 天阙支付集成
│   │   └── screen/          # 数据大屏 WebSocket
│   └── pkg/                 # 公共库（JWT/DeepSeek/微信支付）
├── admin-spa-vue/           # Vue 3 管理后台 SPA
├── deploy/                  # 部署配置（Nginx/systemd/Docker）
└── cli/                     # CLI 工具（平台适配器/支付工具）
```

## 快速开始

### 环境要求

- Go 1.22+
- MySQL 8.0+
- Node.js 18+（前端开发）

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/liuhuanxi-oss/dianying-os.git
cd dianying-os/dyos-go

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接等信息

# 启动后端
go run cmd/server/main.go

# 前端开发（新终端）
cd admin-spa-vue
npm install
npm run dev
```

### 璇玑AI NAS 本地部署（龙虾盒子）

店赢OS 璇玑版专为[璇玑AI NAS（龙虾盒子）](https://www.openclaw.ai)优化 — 15MB 单二进制，SQLite 零依赖，插电即用。

```bash
# 1. 下载璇玑版二进制
wget https://github.com/liuhuanxi-oss/dianying-os/releases/latest/download/dyos-nas-linux-amd64

# 2. 赋予执行权限
chmod +x dyos-nas-linux-amd64

# 3. 下载 NAS 配置文件
wget https://github.com/liuhuanxi-oss/dianying-os/releases/latest/download/config-nas.yaml

# 4. 一键启动（自动创建数据库、内嵌管理后台）
./dyos-nas-linux-amd64 -config config-nas.yaml
```

启动后访问 `http://<璇玑NAS-IP>:8081` 即可使用完整管理后台。

**璇玑AI NAS 部署优势：**

| 特性 | 说明 |
|------|------|
| 🚀 15MB 单文件 | Go 编译为单二进制，内嵌 Vue 前端，无需 Nginx/Node.js |
| 💾 SQLite 本地存储 | 零配置，数据不出门店，隐私安全 |
| 🧠 千问 7B/30B 推理 | 40TOPS NPU 加速 AI 回复，零 API 费用 |
| 🔌 离线可用 | 评价处理、经营分析等核心功能无需联网 |
| 🏠 OpenClaw 集成 | 支持微信/飞书/钉钉自然语言操控门店运营 |

**从源码编译璇玑版：**

```bash
cd dyos-go
# 一键构建（需要 Go 1.22+ 和 GCC）
bash build-nas.sh
# 输出: dyos-nas (15MB 单二进制)
```

### OpenClaw 技能安装

在璇玑AI NAS 上通过 OpenClaw 自然语言操控店赢OS：

```bash
# 技能仓库已包含 5 个技能
ls skills/
# dyos-review/     — 评价管理
# dyos-pricing/    — 智能定价
# dyos-insight/    — 经营洞察
# dyos-member/     — 会员管理
# dyos-complaint/  — 支付投诉处理

# 安装到 OpenClaw
cp -r skills/dyos-* ~/.openclaw/workspace/skills/
openclaw restart
```

安装后可通过自然语言操控：
- "帮我处理今天的差评"
- "本周经营怎么样"
- "分析会员流失情况"

### Docker 部署

```bash
# 构建镜像
docker build -t dianying-os .

# 启动服务
docker run -d \
  --name dianying-os \
  -p 8081:8081 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=os_detian_xin \
  dianying-os
```

### 宝塔面板部署

```bash
# 交叉编译 Linux 二进制
GOOS=linux GOARCH=amd64 go build -o dyos-server cmd/server/main.go

# 上传至服务器，配置 Nginx 反向代理后启动
# 详见 deploy/ 目录下的配置模板
```

## 贡献指南

我们欢迎任何形式的贡献：Bug 反馈、功能建议、文档改进、代码提交。

### 贡献流程

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m "feat: 功能描述"`
4. 推送到分支：`git push origin feat/your-feature`
5. 创建 **Pull Request**

### 提交规范

项目采用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `refactor` | 重构 |
| `chore` | 构建/工具 |
| `test` | 测试 |

### 开发指南

- Go 代码遵循 [Effective Go](https://go.dev/doc/effective_go)
- Vue 组件使用 Composition API（`<script setup>`）
- API 遵循 RESTful 设计，统一 JSON 响应格式
- 提交前确保 `go build` 和 `npm run build` 无报错

## 团队

| 成员 | 角色 |
|------|------|
| **刘天龙 Taylor** | 创始人 & 产品负责人 — 6 年商户服务经验，18 万+ 门店接触 |
| **Hermes Liu** | AI 架构师 — Multi-Agent 系统设计与五级信任机制 |
| **Hermes Tan** | 数据工程师 — 行业知识库与跨店知识迁移 |

## License

本项目基于 [MIT License](LICENSE) 开源。你可以自由使用、修改、分发，包括商业用途。

---

<div align="center">

**一个人 + AI = 无限可能**

[⭐ Star](https://github.com/liuhuanxi-oss/dianying-os) · [🐛 Issue](https://github.com/liuhuanxi-oss/dianying-os/issues) · [💬 Discussion](https://github.com/liuhuanxi-oss/dianying-os/discussions)

</div>
