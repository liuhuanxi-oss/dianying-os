# 店赢OS 贡献指南

> 感谢您对店赢OS项目的关注！我们欢迎各种形式的贡献，包括但不限于代码、文档、Bug报告、功能建议等。

---

## 📋 目录

- [行为准则](#行为准则)
- [开始贡献](#开始贡献)
- [开发环境](#开发环境)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [报告问题](#报告问题)
- [功能建议](#功能建议)
- [文档贡献](#文档贡献)

---

## 行为准则

我们承诺为项目社区提供一个对所有人友好的环境。无论您是长期贡献者还是首次参与者，我们都欢迎您加入我们的社区。

请注意：

- 使用欢迎和包容性的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注什么对社区最有利
- 与社区其他成员互动时表现出同理心

不可接受的行为包括：

- 使用带有性别歧视、种族歧视、性暗示的语言或图像
- 人身攻击或贬低性评论
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他可被合理认为不专业的行为

---

## 开始贡献

### 贡献方式

您可以通过以下方式为项目做出贡献：

| 贡献类型 | 说明 | 难度 |
|---------|------|------|
| 🐛 Bug修复 | 修复代码中的错误 | ⭐-⭐⭐ |
| 📝 文档改进 | 完善README、API文档等 | ⭐ |
| ✨ 新功能 | 开发新的功能模块 | ⭐⭐-⭐⭐⭐ |
| 🎨 UI/UX改进 | 改进界面设计和用户体验 | ⭐⭐ |
| 🧪 测试 | 编写单元测试和集成测试 | ⭐⭐ |
| 💡 想法建议 | 提出新功能或改进建议 | ⭐ |

---

## 开发环境

### 环境要求

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Git | ≥ 2.30 | 版本控制 |
| Node.js | ≥ 16.0 | 前端开发 |
| Python | ≥ 3.9 | 后端/脚本 |
| Docker | ≥ 20.0 | 容器化（可选） |

### 本地开发设置

```bash
# 1. Fork 仓库
# 点击 GitHub 页面右上角的 "Fork" 按钮

# 2. 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/dianying-os.git
cd dianying-os

# 3. 添加上游仓库
git remote add upstream https://github.com/liuhuanxi-oss/dianying-os.git

# 4. 创建开发分支
git checkout -b feature/your-feature-name
```

### 运行项目

```bash
# 方式1: 直接运行
python -m http.server 8080
# 访问 http://localhost:8080/src/index.html

# 方式2: Docker 运行
docker-compose up -d
# 访问 http://localhost:8080
```

---

## 开发流程

### 分支命名规范

| 分支类型 | 命名格式 | 示例 |
|---------|---------|------|
| 功能分支 | `feature/功能名称` | `feature/dynamic-pricing` |
| Bug修复 | `fix/问题描述` | `fix/review-not-loading` |
| 文档改进 | `docs/文档类型` | `docs/api-improvement` |
| 重构 | `refactor/模块名称` | `refactor/agent-module` |
| 实验 | `experiment/实验名称` | `experiment/new-algorithm` |

### 开发步骤

```bash
# 1. 确保主分支最新
git checkout main
git pull upstream main

# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 进行开发...
# 编写代码、编写测试、编写文档

# 4. 保持分支同步
git fetch upstream
git rebase upstream/main

# 5. 提交代码
git add .
git commit -m "feat: add amazing feature"

# 6. 推送分支
git push origin feature/amazing-feature

# 7. 创建 Pull Request
```

---

## 代码规范

### JavaScript 规范

```javascript
// ✅ 好的示例
class StoreManager {
  constructor(storeId) {
    this.storeId = storeId;
    this.agents = [];
  }

  async initialize() {
    await this.loadAgents();
    await this.connectEventBus();
  }

  async addAgent(agent) {
    if (!agent || !agent.type) {
      throw new Error('Invalid agent');
    }
    this.agents.push(agent);
  }
}

// ❌ 避免
class Store {
  constructor(id) {
    this.id = id // 缺少分号
    this.ags = [] // 不清晰的命名
  }
}
```

### 命名规范

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 变量 | camelCase | `storeId`, `reviewList` |
| 常量 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 类名 | PascalCase | `StoreManager`, `AgentBase` |
| 函数 | camelCase | `getStoreInfo()`, `analyzeReview()` |
| 文件 | kebab-case | `store-manager.js`, `review-analysis.js` |
| CSS类 | kebab-case | `.store-card`, `.agent-panel` |

### HTML/CSS 规范

```html
<!-- ✅ 使用语义化标签 -->
<section class="store-list">
  <h2>门店列表</h2>
  <ul class="store-list__items">
    <li class="store-item">门店A</li>
  </ul>
</section>

<!-- ❌ 避免无意义的div -->
<div class="wrapper">
  <div class="content">
    <div>门店列表</div>
  </div>
</div>
```

### 注释规范

```javascript
/**
 * 获取门店的评价列表
 * @param {string} storeId - 门店ID
 * @param {Object} options - 查询选项
 * @param {number} options.page - 页码
 * @param {number} options.limit - 每页数量
 * @param {string} options.sentiment - 情感筛选
 * @returns {Promise<Object>} 评价列表数据
 */
async function getReviews(storeId, options = {}) {
  // TODO: 实现缓存逻辑
  // FIXME: 修复分页问题
  // HACK: 临时解决方案，后续需要重构
}
```

---

## 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(agent): add insight agent` |
| `fix` | Bug修复 | `fix(review): fix loading issue` |
| `docs` | 文档更新 | `docs: update README` |
| `style` | 格式调整 | `style: format code` |
| `refactor` | 重构 | `refactor(store): extract manager` |
| `perf` | 性能优化 | `perf: improve rendering speed` |
| `test` | 测试相关 | `test: add agent tests` |
| `chore` | 构建/工具 | `chore: update dependencies` |

### 示例

```bash
# 好的提交信息
git commit -m "feat(agent): add digital twin simulation

- implement simulation engine
- add scenario builder
- integrate with plan agent

Closes #123"

git commit -m "fix(review): resolve review not loading on mobile

The review list failed to load when viewport width < 768px.
Added responsive CSS and tested on multiple devices.

Fixes #456"

# 避免这样的提交
git commit -m "fix stuff"
git commit -m "update"
git commit -m "WIP"
```

---

## Pull Request 流程

### 创建 PR

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 模板：

```markdown
## 描述
<!-- 简要描述这个PR做了什么 -->

## 更改类型
- [ ] 🐛 Bug修复
- [ ] ✨ 新功能
- [ ] 📝 文档更新
- [ ] 🎨 UI改进
- [ ] 🧹 代码重构
- [ ] ⚡ 性能优化
- [ ] 🧪 测试

## 截图/录屏
<!-- 如果有UI更改，添加截图 -->

## 测试步骤
<!-- 描述如何测试这些更改 -->

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自测通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
```

### PR 审查

审查者会检查：

| 检查项 | 说明 |
|-------|------|
| 代码质量 | 是否清晰、可维护、无明显错误 |
| 功能完整性 | 是否实现了预期功能 |
| 测试覆盖 | 是否添加了必要的测试 |
| 文档更新 | 是否更新了相关文档 |
| 无冲突 | 是否与主分支有冲突 |

### 合并标准

PR 合并需要满足：

- ✅ 所有检查通过
- ✅ 至少1人审查通过
- ✅ 无冲突
- ✅ 提交历史清晰

---

## 报告问题

### Bug 报告模板

```markdown
## Bug 描述
<!-- 简洁清晰地描述问题 -->

## 复现步骤
1. 进入 '...'
2. 点击 '...'
3. 执行 '...'
4. 出现错误

## 预期行为
<!-- 描述应该发生什么 -->

## 实际行为
<!-- 描述实际发生了什么 -->

## 环境信息
- 操作系统: [如 macOS 14.0]
- 浏览器: [如 Chrome 120.0]
- Node版本: [如 v18.0.0]

## 截图/日志
<!-- 添加相关截图或日志 -->

## 其他信息
<!-- 任何其他有帮助的信息 -->
```

### 复现环境准备

```bash
# 1. 确认问题可复现
# 2. 提供浏览器控制台错误信息
# 3. 提供网络请求信息（F12 -> Network）
```

---

## 功能建议

### 功能请求模板

```markdown
## 功能描述
<!-- 简要描述你希望的功能 -->

## 使用场景
<!-- 这个功能在什么场景下有用 -->

## 解决方案
<!-- 你认为如何实现这个功能 -->

## 替代方案
<!-- 你考虑过其他解决方案吗 -->

## 其他信息
<!-- 任何其他信息，如示例、参考项目等 -->
```

---

## 文档贡献

### 文档类型

| 文档类型 | 存放位置 | 说明 |
|---------|---------|------|
| README | 项目根目录 | 项目介绍和快速开始 |
| API文档 | `docs/api.md` | API接口说明 |
| 架构文档 | `docs/architecture.md` | 技术架构说明 |
| 演示脚本 | `docs/demo-script.md` | Demo演示指南 |
| 路线图 | `docs/ROADMAP.md` | 项目发展规划 |
| 贡献指南 | `CONTRIBUTING.md` | 贡献说明 |

### 文档规范

```markdown
# 文档标题

> 文档简介/目的说明

---

## 目录

- [标题1](#标题1)
- [标题2](#标题2)

## 标题1

内容...

## 标题2

内容...
```

---

## 致谢

感谢所有为店赢OS做出贡献的贡献者！

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- 可以使用 GitHub 的 All Contributors bot 自动生成 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 联系方式

- 💬 [GitHub Discussions](https://github.com/liuhuanxi-oss/dianying-os/discussions)
- 🐛 [Issue Tracker](https://github.com/liuhuanxi-oss/dianying-os/issues)
- 📧 邮箱: contact@dianying-os.com

---

**贡献者协议**: 通过提交代码、文档或其他贡献，您同意您的贡献将遵循 MIT 开源许可证。
