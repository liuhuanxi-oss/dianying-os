# 店赢OS - 8大本地生活平台统一CLI工具

<p align="center">
  <img src="https://img.shields.io/badge/Platforms-8-blue.svg" alt="Platforms">
  <img src="https://img.shields.io/badge/Python-3.8+-green.svg" alt="Python">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

## 概述

店赢OS CLI 是面向本地生活商家的**统一多平台管理工具**，一个命令管理美团、饿了么、抖音、小红书、微信视频号、高德、支付宝、百度8大平台。

## 支持的平台

| 平台 | 命令前缀 | 核心能力 |
|------|---------|---------|
| 美团/大众点评 | `meituan` | 店铺管理/商品/订单/评价/营销/经营数据 |
| 饿了么 | `eleme` | 商户/店铺/商品/订单/营销/评价 |
| 抖音本地生活 | `douyin` | 到店餐饮/到综/商品/券核销/数据 |
| 小红书 | `xiaohongshu` | 商品/订单/库存/素材中心 |
| 微信视频号 | `wechat` | 橱窗/直播/商品 |
| 高德地图 | `amap` | POI/地理编码/门店定位 |
| 支付宝/口碑 | `alipay` | 门店/商品/会员/支付对账 |
| 百度地图 | `baidu` | POI/地理编码/门店 |

## 安装

```bash
# 从源码安装
cd cli/dyos-platforms
pip install -e .

# 或使用 pip
pip install .
```

## 快速开始

### 列出所有平台

```bash
dyos-platform list
```

### 美团平台

```bash
# 查看店铺列表
dyos-platform meituan shop-list --json

# 查看店铺详情
dyos-platform meituan shop-detail --id S001 --json

# 同步商品
dyos-platform meituan product-sync --from dyos --json

# 查看订单
dyos-platform meituan order-list --status pending --json

# 查看评价
dyos-platform meituan review-list --shop S001 --json

# 回复评价
dyos-platform meituan review-reply --id R001 --content "感谢好评" --json

# 创建营销活动
dyos-platform meituan marketing-create --type coupon --json

# 查看经营数据
dyos-platform meituan analytics-overview --days 7 --json
```

### 抖音本地生活

```bash
# 发布商品
dyos-platform douyin local-life-product-publish --shop M001 --json

# 创建优惠券
dyos-platform douyin local-life-coupon-create --json

# 查看订单数据
dyos-platform douyin analytics-order --days 7 --json
```

### 高德地图

```bash
# 搜索POI
dyos-platform amap poi-search --keyword "火锅" --city 上海 --json

# 查看POI详情
dyos-platform amap poi-detail --id P001 --json

# 地理编码
dyos-platform amap geocode --address "南京路100号" --json
```

### 跨平台聚合操作（杀手锏功能）

```bash
# 一键同步8个平台店铺信息
dyos-platform all shop-sync --from dyos

# 一键发布商品到所有平台
dyos-platform all product-publish --from dyos

# 聚合所有平台评价
dyos-platform all review-list --days 7 --json

# 聚合所有平台经营数据
dyos-platform all analytics-overview --json
```

## 输出格式

所有命令支持 `--json` 参数输出结构化JSON：

```bash
dyos-platform meituan shop-list --json
```

无 `--json` 参数时，默认输出表格形式。

## 技术栈

- **CLI框架**: Click
- **HTTP客户端**: Requests
- **输出美化**: Rich, Tabulate
- **日期处理**: python-dateutil

## License

MIT License
