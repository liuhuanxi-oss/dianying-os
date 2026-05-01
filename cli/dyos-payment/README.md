# 店赢OS天阙支付CLI工具

> AI-First Payment CLI for Tianque (SuixingPay) Open Platform

店赢OS天阙支付CLI工具是为AI Agent设计的支付能力封装，让AI Agent可以通过命令行直接调用天阙开放平台的支付能力。

## 特性

- 🤖 **Agent-First**: 专为AI Agent设计，支持自然语言交互和结构化JSON输出
- 🔐 **安全签名**: 基于RSA-SHA1的签名验签机制
- 🛠️ **完整能力**: 支持商户入驻、支付交易、退款、分账、结算、对账等全流程
- 📦 **模块化设计**: 清晰的代码结构，易于扩展
- 🔄 **环境切换**: 支持测试环境和生产环境快速切换
- 📊 **双模输出**: 支持JSON和表格两种输出格式

## 安装

```bash
# 从源码安装(开发模式)
cd cli/dyos-payment
pip install -e .

# 或直接安装
pip install .
```

## 快速开始

### 1. 配置密钥

首次使用需要配置支付密钥:

```bash
# 设置环境变量或编辑配置文件
export DYOS_ORG_ID="***REDACTED_ORG_ID***"
export DYOS_PRIVATE_KEY="your-private-key"
export DYOS_SUIXINGPAY_PUBLIC_KEY="suixingpay-public-key"
```

### 2. 测试签名

```bash
# 测试签名是否正确
dyos-payment sign-test
```

### 3. 环境切换

```bash
# 切换到测试环境
dyos-payment env-switch test

# 切换到生产环境
dyos-payment env-switch prod
```

## 命令参考

### 商户管理

```bash
# 商户入驻
dyos-payment merchant apply \
  --short-name "测试商户" \
  --mobile 13800138000 \
  --identity-name "张三" \
  --identity-no 110101199001011234 \
  --account-name "张三" \
  --account-no 6222021234567890 \
  --address "北京市朝阳区xxx" \
  --cs-tel-no 4008000000

# 商户查询
dyos-payment merchant query --mno ***REDACTED_MERCHANT_NO***

# 商户修改
dyos-payment merchant modify --id ***REDACTED_MERCHANT_NO*** --store-pic xxx

# 图片上传
dyos-payment merchant upload-image --file ./license.jpg --type license
```

### 支付交易

```bash
# 创建支付订单(主扫)
dyos-payment trade create --amount 100 --subject "订单支付"

# 支付结果查询
dyos-payment trade query --trade-no T123456

# 申请退款
dyos-payment trade refund --trade-no T123456 --amount 50

# 关闭订单
dyos-payment trade close --trade-no T123456
```

### 分账

```bash
# 分账申请
dyos-payment split apply --trade-no T123456 --ratio 0.7,0.3

# 分账查询
dyos-payment split query --split-no S123456
```

### 结算

```bash
# 结算查询
dyos-payment settle query --merchant-id ***REDACTED_MERCHANT_NO*** --date 2026-04
```

### 对账

```bash
# 下载对账文件
dyos-payment reconcile download --date 2026-04-30
```

### 工具

```bash
# 测试签名
dyos-payment sign-test

# 切换环境
dyos-payment env-switch test

# 显示配置
dyos-payment config show
dyos-payment config show --json
```

## JSON输出

所有命令都支持 `--json` 参数，返回结构化JSON输出，方便AI Agent处理:

```bash
dyos-payment trade create --amount 100 --json
```

## 配置说明

配置文件位于 `~/.dyos-payment/config.json`:

```json
{
  "org_id": "***REDACTED_ORG_ID***",
  "env": "test",
  "base_url": "https://openapi-test.suixingpay.com",
  "test_merchant_no": "***REDACTED_MERCHANT_NO***",
  "sign_algorithm": "SHA1withRSA",
  "timeout": 30,
  "retry_times": 3
}
```

## 开发

### 项目结构

```
cli/dyos-payment/
├── setup.py
├── pyproject.toml
├── README.md
├── dyos_payment/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py              # Click CLI主文件
│   ├── config.py           # 配置管理
│   ├── crypto.py           # RSA签名/验签
│   ├── client.py           # HTTP客户端
│   ├── core/
│   │   ├── merchant.py     # 商户API
│   │   ├── payment.py       # 支付API
│   │   ├── split.py         # 分账API
│   │   ├── settle.py        # 结算API
│   │   ├── transfer.py      # 转账API
│   │   └── reconcile.py     # 对账API
│   └── utils/
│       ├── repl_skin.py    # REPL交互
│       └── output.py        # 输出格式化
```

### 运行测试

```bash
# 安装开发依赖
pip install -e ".[dev]"

# 运行测试
pytest tests/

# 代码格式化
black dyos_payment/

# 类型检查
mypy dyos_payment/
```

## 天阙开放平台

- 官网: https://paas.tianquetech.com
- 文档: https://paas.tianquetech.com/docs
- 服务商: 广东德天商务服务有限公司

## 比赛信息

本项目为店赢OS参加以下比赛的支付能力组件:
- WAIC OPC
- 腾讯云黑客松

## License

MIT License
