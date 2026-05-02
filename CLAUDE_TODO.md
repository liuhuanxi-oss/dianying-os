# 📋 Claude Code 任务清单

## 🚨 重要：开工前必读

1. 先执行这4条命令，确保本地代码是最新的干净版本：
   ```
   git checkout main
   git fetch origin
   git reset --hard origin/main
   git clean -fd
   ```
   
2. 按照下面的清单**按顺序修复**，一次只修一个问题

3. 修完一个，测试没问题了，把完成情况写到 CLAUDE_RESULT.md 里，然后 commit + push

4. 等 Hermes（扣子Agent）检查确认没问题了，再继续下一个问题

---

## 📝 待修复问题清单（按优先级排序）

### ✅ 第 1 个问题：已完成 ✓
- 问题：所有 7 个页面都没有引用 mobile-responsive.css
- 修复：给每个 HTML 文件加上 <link rel="stylesheet" href="css/mobile-responsive.css">

---

### ✅ 第 2 个问题：已完成 ✓
- 问题：dashboard.html 的 ECharts 版本是 5.4.3，admin.html 用的是 5.5.0，版本不一致
- 修复：把 dashboard.html 里所有的 5.4.3 改成 5.5.0，统一版本

---

### ⏳ 第 3 个问题：待做
- 问题：admin.html 的图表没有 resize 监听，窗口大小变化时图表变形
- 修复：给 admin.html 里所有 echarts.init 创建的图表实例，加上窗口大小变化监听：
  ```javascript
  window.addEventListener('resize', () => { chartInstance.resize() })
  ```

---

### ⏳ 第 4 个问题：待做
- 问题：dashboard.html 缺少 lucide 图标库
- 修复：给 dashboard.html 加上 lucide 的 script 标签

---

### ⏳ 第 5 个问题：待做
- 问题：architecture.html 缺少 lucide 图标库
- 修复：给 architecture.html 加上 lucide 的 script 标签

---

### ⏳ 第 6 个问题：待做
- 问题：posterApiBase 硬编码 localhost:8080，部署后海报生成用不了
- 修复：把 js/app.js 第 1763 行的：
  ```javascript
  let posterApiBase = 'http://localhost:8080'
  ```
  改成：
  ```javascript
  let posterApiBase = window.location.origin
  ```

---

### ⏳ 第 7 个问题：待做
- 问题：dashboard.html 有 5 个 echarts.init，但只有 4 个图表容器，有一个找不到 DOM
- 修复：检查 dashboard.html 里所有的图表 init 调用，确认对应的 id 的 DOM 元素都存在，不存在就补充缺少的容器

---

## 🚫 绝对禁止的行为

1. ❌ 不许删除任何现有代码，只能加
2. ❌ 不许重构整个文件
3. ❌ 不许碰这个清单以外的任何文件
4. ❌ 不许提交任何图片/备份文件
5. ❌ 不许推送到 master 分支，只能推 main

---

## ✅ 提交格式

每个问题做完后，在 CLAUDE_RESULT.md 里按这个格式写：

```
### 第 X 个问题：已完成
- 做了什么：（简短描述）
- 修改了哪些文件：（列出来）
- 测试结果：（浏览器打开测试通过，控制台无报错）
```

然后提交 commit，message 格式：
```
fix: 完成第 X 个问题 - （简短描述）
```

---

**最后更新时间：2026年5月2日**

---

## 📌 新增优化任务（做完第3-7个bug修复之后再做这个）

### 🎨 第 8 个任务：落地页风格升级
- **目标**：参考 https://www.lakalasaas.com/ 的设计风格，优化 index.html 落地页
- **要求（非常重要！）**：
  1. ✅ 100% 保留店赢 OS 的所有现有内容：文案、按钮、链接、功能模块、JS 逻辑一个都不许删
  2. ✅ 只改 CSS 样式和布局结构，不删任何现有 HTML 元素
  3. ✅ 视觉风格、配色、排版、组件、动效完全对齐 lakalasaas.com
  4. ❌ 绝对不许重构整个文件，绝对不许把现有代码全删了重写
- **具体要对齐的部分**：
  - 导航栏高度、透明度、滚动时的背景变化效果
  - 首屏 Hero 区域的大标题排版、渐变文字、按钮样式
  - 功能卡片的圆角、阴影、hover 上浮动效
  - 深蓝色科技感配色方案（主色、辅助色、背景色、文字色）
  - 客户案例/合作伙伴区域的布局
  - 滚动时元素的淡入出现效果
  - CTA 区域和页脚的设计
- **做完验证**：在浏览器打开检查，确保所有原有的链接、按钮、功能都能正常工作
