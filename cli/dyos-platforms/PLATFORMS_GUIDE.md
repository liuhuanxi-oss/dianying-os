# 店赢OS - 8大平台开发者入驻指南

店赢OS CLI支持美团、饿了么、抖音、小红书、微信视频号、高德地图、支付宝、百度地图8大平台的统一管理。本文档详细介绍每个平台的开发者入驻流程和API Key获取步骤。

## 目录

- [美团/大众点评](#1-美团大众点评)
- [饿了么](#2-饿了么)
- [抖音本地生活](#3-抖音本地生活)
- [小红书](#4-小红书)
- [微信视频号](#5-微信视频号)
- [高德地图](#6-高德地图)
- [支付宝/口碑](#7-支付宝口碑)
- [百度地图](#8-百度地图)

---

## 1. 美团/大众点评

### 开放平台地址
https://developer.meituan.com/

### 开发者注册流程

1. **访问开放平台**
   访问 https://developer.meituan.com/ ，点击"开发者入驻"

2. **选择开发者类型**
   - 技术服务商：面向第三方开发者
   - 自研商户：商家自建系统

3. **企业资质认证**
   - 需提供营业执照、法人身份证
   - 审核周期：3-5个工作日

4. **创建应用**
   - 登录后在"应用管理"创建新应用
   - 选择API权限范围

### API Key获取步骤

1. 登录美团开放平台
2. 进入"开发者中心" → "应用管理"
3. 选择或创建应用
4. 获取 `App ID` 和 `App Secret`

### 回调地址配置

在应用设置中配置授权回调地址：
```
https://your-domain.com/callback/meituan
```

### SDK/文档链接
- 开发文档：https://open.meituan.com/docs
- Java SDK：https://github.com/meituan-dianping/sdk/tree/master/java
- Python SDK：https://github.com/meituan-dianping/sdk/tree/master/python

### 审核周期和注意事项
- **审核周期**：3-5个工作日
- **注意事项**：
  - 需具备企业资质
  - 部分API需要额外申请权限
  - 生产环境需签署合作协议

---

## 2. 饿了么

### 开放平台地址
https://open.shop.ele.me/

### 开发者注册流程

1. **访问开放平台**
   访问 https://open.shop.ele.me/ ，点击"立即入驻"

2. **选择入驻类型**
   - 商家自入驻：已有饿了么店铺
   - 技术服务商：第三方开发者

3. **资质审核**
   - 商家：店铺基本信息
   - 服务商：企业资质 + 解决方案
   - 审核周期：1-3个工作日

4. **创建应用**
   - 在控制台创建应用
   - 申请API权限

### API Key获取步骤

1. 登录饿了么开放平台
2. 进入"控制台" → "应用管理"
3. 创建应用并获取 `App Key` 和 `App Secret`

### 回调地址配置

配置授权回调URL：
```
https://your-domain.com/callback/eleme
```

### SDK/文档链接
- 开发文档：https://open.shop.ele.me/develop
- Java SDK：支持
- PHP SDK：支持

### 审核周期和注意事项
- **审核周期**：1-3个工作日
- **注意事项**：
  - 需绑定饿了么店铺
  - API调用有频率限制

---

## 3. 抖音本地生活

### 开放平台地址
https://developer.open-douyin.com/

### 开发者注册流程

1. **访问开放平台**
   访问 https://developer.open-douyin.com/

2. **申请成为技术服务商**
   - 进入"服务商入驻"
   - 准备企业资质和解决方案

3. **解决方案申请**
   - 提交解决方案文档
   - 说明接入场景和能力
   - 审核周期：7-15个工作日

4. **创建应用**
   - 在服务商后台创建应用
   - 申请本地生活相关权限

### API Key获取步骤

1. 登录抖音开放平台（服务商后台）
2. 进入"应用管理"
3. 创建应用后获取 `Client Key` 和 `Client Secret`

### 回调地址配置

```
https://your-domain.com/callback/douyin
```

### SDK/文档链接
- 开发文档：https://developer.open-douyin.com/docs
- Python SDK：支持
- Java SDK：支持

### 审核周期和注意事项
- **审核周期**：7-15个工作日
- **注意事项**：
  - 门槛较高，需要有实际解决方案
  - 本地生活API需要专项申请
  - 建议提前准备技术方案文档

---

## 4. 小红书

### 开放平台地址
https://open.xiaohongshu.com/

### 开发者注册流程

1. **访问开放平台**
   访问 https://open.xiaohongshu.com/

2. **企业认证**
   - 点击"开发者入驻"
   - 完成企业实名认证
   - 审核周期：5-10个工作日

3. **创建应用**
   - 在控制台创建应用
   - 申请API权限

### API Key获取步骤

1. 登录小红书开放平台
2. 进入"开发者控制台"
3. 创建应用后获取 `Client ID` 和 `Client Secret`

### 回调地址配置

```
https://your-domain.com/callback/xiaohongshu
```

### SDK/文档链接
- 开发文档：https://open.xiaohongshu.com/doc
- 主要支持 Java 和 PHP

### 审核周期和注意事项
- **审核周期**：5-10个工作日
- **注意事项**：
  - 需要企业资质
  - 部分API有调用量限制
  - 商业化合作需单独洽谈

---

## 5. 微信视频号

### 开放平台地址
https://developers.weixin.qq.com/

### 开发者注册流程

1. **访问微信开放平台**
   访问 https://developers.weixin.qq.com/

2. **注册账号**
   - 可使用微信扫码登录
   - 完成基本开发者认证

3. **关联视频号/小程序**
   - 在开放平台绑定已认证的视频号
   - 或创建新的小程序

4. **获取AppID和AppSecret**
   - 在"开发管理"中查看

### API Key获取步骤

1. 登录微信公众平台（https://mp.weixin.qq.com/）
2. 进入"设置与开发" → "开发设置"
3. 获取 `AppID` 和 `AppSecret`

### 回调地址配置

```
https://your-domain.com/callback/wechat
```

### SDK/文档链接
- 开发文档：https://developers.weixin.qq.com/doc/
- 视频号接口：部分开放，需申请
- 微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 审核周期和注意事项
- **审核周期**：1-7个工作日
- **注意事项**：
  - 视频号部分API需要额外权限
  - 需遵守微信平台规范
  - 商业使用需申请相关资质

---

## 6. 高德地图

### 开放平台地址
https://lbs.amap.com/

### 开发者注册流程

1. **访问高德开放平台**
   访问 https://lbs.amap.com/

2. **免费注册账号**
   - 点击"控制台"进入注册页面
   - 支持手机号/邮箱注册
   - **即时生效，无需审核**

3. **创建应用**
   - 登录后在控制台创建应用
   - 添加Key（Web服务/JS API/Android/iOS）

### API Key获取步骤

1. 登录高德开放平台控制台
2. 进入"应用管理" → "我的应用"
3. 点击"添加Key"
4. 填写应用信息并提交
5. 获取 `Key`（即API Key）

### 回调地址配置
高德地图API Key方式无需回调地址配置。

### SDK/文档链接
- 开发文档：https://lbs.amap.com/api/webservice/summary
- JavaScript API：https://lbs.amap.com/api/jsapi-v2/summary/
- Android SDK：https://lbs.amap.com/api/android-sdk/summary/
- iOS SDK：https://lbs.amap.com/api/ios-sdk/summary/
- Web服务API：https://lbs.amap.com/api/webservice/summary/

### 审核周期和注意事项
- **审核周期**：即时生效
- **免费额度**：
  - 个人开发者：5000次/日
  - 企业认证后：更高额度
- **注意事项**：
  - Key有调用平台限制
  - Web服务API需单独创建Key

---

## 7. 支付宝/口碑

### 开放平台地址
https://open.alipay.com/

### 开发者注册流程

1. **访问支付宝开放平台**
   访问 https://open.alipay.com/

2. **账号注册**
   - 使用支付宝账号登录
   - 完成实名认证

3. **创建应用**
   - 在控制台创建应用
   - 选择应用类型（网页/移动应用）

4. **配置密钥**
   - 生成应用公钥/私钥对
   - 在支付宝配置公钥

### API Key获取步骤

1. 登录支付宝开放平台
2. 进入"控制台" → "开发管理"
3. 创建应用后获取 `APPID`
4. 配置 RSA2 密钥对

### 回调地址配置

在应用设置中配置授权回调和支付回调：
```
https://your-domain.com/callback/alipay
https://your-domain.com/notify/alipay
```

### SDK/文档链接
- 开发文档：https://open.alipay.com/docs
- Python SDK：https://github.com/alipay/alipay-sdk-python-all
- Java SDK：https://github.com/alipay/alipay-sdk-java-all

### 审核周期和注意事项
- **审核周期**：1-3个工作日（实名认证后）
- **注意事项**：
  - 需要支付宝实名认证
  - 部分API需要签约
  - 涉及资金操作需谨慎

---

## 8. 百度地图

### 开放平台地址
https://lbsyun.baidu.com/

### 开发者注册流程

1. **访问百度地图开放平台**
   访问 https://lbsyun.baidu.com/

2. **免费注册账号**
   - 点击"控制台"注册/登录
   - 支持百度账号登录
   - **即时生效，无需审核**

3. **创建应用**
   - 在控制台创建应用
   - 添加Key（浏览器/服务器/Android/iOS）

### API Key获取步骤

1. 登录百度地图开放平台
2. 进入"控制台" → "我的应用"
3. 点击"创建应用"
4. 填写应用信息并提交
5. 获取 `AK`（Access Key）

### 回调地址配置
百度地图AK方式无需回调地址配置（浏览器端Key需配置Referer白名单）。

### SDK/文档链接
- 开发文档：https://lbsyun.baidu.com/index.php/Welcome
- JavaScript API：https://lbsyun.baidu.com/index.php/Welcome/webapi
- Web服务API：https://lbsyun.baidu.com/index.php/Welcome/webapi
- Android SDK：https://lbsyun.baidu.com/index.php/Welcome/Androidnavi
- iOS SDK：https://lbsyun.baidu.com/index.php/Welcome/IOSnavi

### 审核周期和注意事项
- **审核周期**：即时生效
- **免费额度**：
  - 个人开发者：6000次/日
  - 企业认证后：更高额度
- **注意事项**：
  - AK有类型区分（浏览器/服务器/Android/iOS）
  - 浏览器端需要配置Referer白名单

---

## 店赢OS CLI配置

获取API Key后，使用以下命令配置：

### 环境变量配置

```bash
# 美团
export MEITUAN_APP_ID=your_app_id
export MEITUAN_APP_SECRET=your_app_secret

# 饿了么
export ELEME_APP_KEY=your_app_key
export ELEME_APP_SECRET=your_app_secret

# 抖音
export DOUYIN_CLIENT_KEY=your_client_key
export DOUYIN_CLIENT_SECRET=your_client_secret

# 小红书
export XHS_CLIENT_ID=your_client_id
export XHS_CLIENT_SECRET=your_client_secret

# 微信
export WECHAT_APP_ID=your_app_id
export WECHAT_APP_SECRET=your_app_secret

# 高德
export AMAP_KEY=your_api_key

# 支付宝
export ALIPAY_APP_ID=your_app_id
export ALIPAY_PRIVATE_KEY=your_private_key
export ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 百度
export BAIDU_AK=your_access_key
```

### CLI命令配置

```bash
# 查看平台配置状态
dyos-platform config status

# 配置美团
dyos-platform config meituan --app-id XXX --app-secret XXX

# 配置饿了么
dyos-platform config eleme --app-key XXX --app-secret XXX

# 配置抖音
dyos-platform config douyin --client-key XXX --client-secret XXX

# 配置小红书
dyos-platform config xiaohongshu --client-id XXX --client-secret XXX

# 配置微信
dyos-platform config wechat --app-id XXX --app-secret XXX

# 配置高德
dyos-platform config amap --key XXX

# 配置支付宝
dyos-platform config alipay --app-id XXX --private-key XXX --public-key XXX

# 配置百度
dyos-platform config baidu --ak XXX

# 测试平台连通性
dyos-platform test amap
dyos-platform test baidu

# 切换到真实API模式
export DYOS_USE_MOCK=false
```

---

## 平台支持对比

| 平台 | 认证方式 | 审核周期 | 费用 | 真实API |
|------|---------|---------|------|---------|
| 美团 | OAuth2 | 3-5天 | 企业版 | ✅ |
| 饿了么 | OAuth2 | 1-3天 | 商家版 | ✅ |
| 抖音 | OAuth2 | 7-15天 | 技术服务商 | ✅ |
| 小红书 | OAuth2 | 5-10天 | 企业版 | ✅ |
| 微信 | OAuth2 | 1-7天 | 部分免费 | ✅ |
| 高德 | API Key | 即时 | 免费额度 | ✅ 已实现 |
| 支付宝 | OAuth2 | 1-3天 | 部分免费 | ✅ |
| 百度 | API Key | 即时 | 免费额度 | ✅ 已实现 |

---

## 技术支持

- 店赢OS GitHub: https://github.com/liuhuanxi-oss/dianying-os
- 问题反馈: https://github.com/liuhuanxi-oss/dianying-os/issues
