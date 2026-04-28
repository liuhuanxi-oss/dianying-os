# DianYing OS API接口文档

> 版本：v1.0
> 更新时间：2026年4月

---

## 一、数据存储模块 (DataStore)

### 1.1 获取门店信息

```javascript
DataStore.getStore(storeId)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |

**返回值**：
```javascript
{
    id: 'hotpot',
    name: '老码头火锅（旗舰店）',
    industry: '餐饮',
    type: 'hotpot',
    rating: 4.6,
    reviews: 286,
    badReviewRate: 3.2,
    replyRate: 98,
    todayRevenue: 12580
}
```

### 1.2 获取评价列表

```javascript
DataStore.getReviews(storeId)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | 是 | 门店ID |

**返回值**：
```javascript
[
    {
        id: 1,
        rating: 2,
        platform: '美团',
        content: '等位太久...',
        time: '10分钟前',
        sentiment: 'negative'
    },
    // ...
]
```

### 1.3 计算定价因子

```javascript
DataStore.calculatePricingFactor()
```

**返回值**：
```javascript
{
    totalImpact: 10,  // 综合影响百分比
    factors: [
        { name: '天气', impact: -0.15, icon: '🌧️' },
        { name: '时段', impact: 0.05, icon: '🕐' }
    ]
}
```

---

## 二、信任等级模块 (TrustLevel)

### 2.1 计算信任等级

```javascript
TrustLevel.calculateTrustLevel(rating, sentiment)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rating | number | 是 | 评分 (1-5) |
| sentiment | string | 是 | 情感 (positive/neutral/negative) |

**返回值**：
```javascript
{
    level: 'A',  // A/B/C/D/E
    score: 92,
    name: 'A级',
    desc: '完全信任，AI全自动执行',
    auto: true
}
```

### 2.2 判断是否自动执行

```javascript
TrustLevel.canAutoExecute(trustResult)
```

---

## 三、评价管理模块 (ReviewHandler)

### 3.1 分析评价

```javascript
ReviewHandler.analyzeReview(review, storeType)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| review | object | 是 | 评价对象 |
| storeType | string | 是 | 门店类型 |

**返回值**：
```javascript
{
    reviewId: 1,
    sentiment: 'negative',
    rating: 2,
    issues: [
        { category: 'service', name: '服务问题', severity: 'high' }
    ],
    strengths: ['味道不错'],
    needsResponse: true,
    priority: 'high'
}
```

### 3.2 生成AI回复

```javascript
ReviewHandler.generateResponse(review, analysis, storeType)
```

---

## 四、动态定价模块 (PricingEngine)

### 4.1 计算动态价格

```javascript
PricingEngine.calculateDynamicPrice(product, storeType, context)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product | string | 是 | 商品名称 |
| storeType | string | 是 | 门店类型 |
| context | object | 是 | 定价上下文 |

**context 示例**：
```javascript
{
    weather: 'rainy',
    timeOfDay: 'dinner',
    demand: 'high',
    competitor: 'promotion',
    isWeekend: true
}
```

### 4.2 生成定价方案

```javascript
PricingEngine.generatePricingPlan(storeType, context)
```

---

## 五、AI虚拟店长 (VirtualManager)

### 5.1 处理用户输入

```javascript
VirtualManager.processInput(userInput, context)
```

**参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userInput | string | 是 | 用户输入 |
| context | object | 否 | 上下文信息 |

**返回值**：
```javascript
{
    intent: 'review_management',
    response: {
        text: '评价分析报告...',
        actions: ['analyze_reviews']
    },
    timestamp: '2026-04-28T12:00:00Z'
}
```

### 5.2 意图识别

**支持的意图类型**：
| 意图 | 说明 |
|------|------|
| review_management | 评价管理 |
| pricing | 定价相关 |
| scheduling | 排班相关 |
| reporting | 报告相关 |
| alert | 预警相关 |
| consultation | 咨询 |
| general | 通用 |

---

## 六、数字孪生模块 (DigitalTwin)

### 6.1 创建数字孪生

```javascript
DigitalTwin.createTwin(storeId, options)
```

### 6.2 模拟策略效果

```javascript
DigitalTwin.simulateStrategy(twinId, strategy)
```

---

## 七、Agent协同接口

### 7.1 线索Agent

```javascript
InsightAgent.collectClues(storeId)
```

### 7.2 方案Agent

```javascript
PlanAgent.generatePlan(clues, storeId)
```

### 7.3 交付Agent

```javascript
DeliverAgent.executeTask(task, plan)
```

### 7.4 运营Agent

```javascript
OperateAgent.extractBestPractices(storeId)
```
