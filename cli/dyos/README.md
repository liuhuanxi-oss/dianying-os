# 店赢OS CLI

店赢OS命令行管理工具，让Agent可以通过命令行高效管理AI门店运营SaaS平台。

## 安装

```bash
# 从源码安装
cd cli/dyos
pip install -e .

# 或者
pip install .
```

## 快速开始

```bash
# 查看帮助
dyos --help

# 商家管理
dyos merchant list --json
dyos merchant stats
dyos merchant onboard --name "张三火锅" --industry 餐饮

# 代理商管理
dyos agent list --level gold --json
dyos agent commission --month 2024-12

# 数据洞察
dyos analytics overview --json
dyos analytics gmv-trend --months 6
dyos analytics churn-warning --threshold 60

# 业务员管理
dyos sales list
dyos sales performance

# 财务管理
dyos finance revenue --months 12
dyos finance transactions --status success

# 工作流编排
dyos workflow onboard --merchant "李四烧烤" --industry 餐饮 --assign-agent "华东代理"
```

## 功能模块

| 模块 | 命令 | 描述 |
|------|------|------|
| 商家管理 | `dyos merchant` | 商家列表、详情、审核、升级 |
| 代理商 | `dyos agent` | 代理商管理、佣金分润 |
| 业务员 | `dyos sales` | 业务员管理、业绩、跟访 |
| 财务中心 | `dyos finance` | 收入、交易、退款、发票 |
| 数据洞察 | `dyos analytics` | 平台总览、趋势、预警 |
| 支付交易 | `dyos payment` | 通道、费率、分账 |
| 客户成功 | `dyos customer` | Onboarding、健康度、续费 |
| 渠道增长 | `dyos channel` | 渠道分析、裂变、试用 |
| 客服支持 | `dyos support` | 工单、FAQ、满意度 |
| 产品迭代 | `dyos product` | 功能开关、AB测试、需求池 |
| 安全合规 | `dyos security` | 登录日志、数据脱敏 |
| 系统设置 | `dyos settings` | 角色、日志、定价 |

## 配置

```bash
# 查看当前配置
dyos config --get

# 设置API地址
dyos config --set-url http://localhost:8000

# 设置API Key
dyos config --set-key your-api-key
```

## API服务

FastAPI后端需要先启动：

```bash
# 启动FastAPI服务
cd api
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

## 批量操作

```bash
# 批量审核
dyos batch audit --file merchants.csv --approve-all

# 批量更新费率
dyos payment fee-update --config fee-rules.yaml
```

## 输出格式

所有命令支持 `--json` 参数输出JSON格式：

```bash
dyos merchant list --json
```

## 许可证

MIT License
