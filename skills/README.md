# 店赢OS OpenClaw 技能包

店赢OS × 璇玑AI NAS — AI门店运营智能体技能集合。

## 技能列表

| 技能 | 触发场景 | 能力 |
|------|---------|------|
| `dyos-review` | "帮我处理差评" | 多平台评价拉取 → AI情感分析 → 生成回复 → 一键同步 |
| `dyos-pricing` | "分析定价合不合理" | 竞品对比 → 天气/节假日因子 → AI调价建议 → 同步平台 |
| `dyos-insight` | "本周经营怎么样" | 核心指标汇总 → AI趋势诊断 → 异常检测 → 改进建议 |
| `dyos-member` | "看看会员情况" | 会员分层 → 流失预警 → 精准营销推送 |
| `dyos-complaint` | "处理支付投诉" | 微信/支付宝投诉 → AI分诊 → 退款执行 → 风险检测 |

## 安装

### 前提

1. 璇玑AI NAS（龙虾盒子）已开机
2. 店赢OS 璇玑版已运行（`./dyos-nas -config config-nas.yaml`）
3. OpenClaw 网关已配置

### 安装技能

将此目录下的技能文件夹复制到 OpenClaw 工作空间：

```bash
cp -r dyos-* ~/.openclaw/workspace/skills/
```

重启 OpenClaw 网关即可生效。

### ClawHub 安装（正式发布后）

```bash
clawhub install dyos-review
clawhub install dyos-pricing
clawhub install dyos-insight
clawhub install dyos-member
clawhub install dyos-complaint
```

## 技术架构

```
商家（微信/飞书/钉钉）
  ↓ 自然语言
OpenClaw 网关
  ↓ SKILL.md 触发
店赢OS 本地 API（localhost:8081）
  ↓
SQLite + 千问7B/30B（本地推理）
  ↓
美团/饿了么/抖音/微信支付/支付宝 API
```

## 开源

店赢OS GitHub: https://github.com/liuhuanxi-oss/dianying-os
MIT License
