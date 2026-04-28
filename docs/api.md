# 店赢OS API 接口文档

> 本文档详细描述店赢OS的API接口定义、事件总线协议及插件开发接口。

**API版本**: v2.0
**Base URL**: `https://api.dianying-os.com/v2`
**认证方式**: Bearer Token (JWT)

---

## 📋 目录

- [认证](#认证)
- [门店管理](#门店管理)
- [评价管理](#评价管理)
- [Agent接口](#agent接口)
- [知识库](#知识库)
- [事件总线](#事件总线)
- [插件接口](#插件接口)

---

## 认证

### 获取访问令牌

```
POST /auth/token
```

**请求体**:

```json
{
  "grant_type": "password",
  "username": "user@example.com",
  "password": "your_password"
}
```

**响应**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2..."
}
```

---

## 门店管理

### 获取门店列表

```
GET /stores
```

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |
| industry | string | 否 | 行业筛选 |

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "store_id": "store_001",
        "store_name": "老码头火锅旗舰店",
        "industry": "restaurant",
        "address": "上海市浦东新区陆家嘴环路1000号",
        "status": "active",
        "agent_count": 4,
        "created_at": "2026-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 创建门店

```
POST /stores
```

**请求体**:

```json
{
  "store_name": "新店名称",
  "industry": "restaurant",
  "address": "门店地址",
  "business_hours": {
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"}
  },
  "capacity": {
    "total_seats": 50,
    "tables": 15
  },
  "staff": [
    {"role": "店长", "count": 1},
    {"role": "服务员", "count": 5}
  ]
}
```

---

## 评价管理

### 获取评价列表

```
GET /stores/{store_id}/reviews
```

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台筛选 (meituan/dianping/ele) |
| rating | int | 否 | 评分筛选 (1-5) |
| sentiment | string | 否 | 情感筛选 (positive/neutral/negative) |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| page | int | 否 | 页码 |
| limit | int | 否 | 每页数量 |

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 500,
    "items": [
      {
        "review_id": "review_001",
        "platform": "dianping",
        "rating": 4,
        "content": "环境不错，服务态度很好",
        "sentiment": "positive",
        "entities": ["环境", "服务"],
        "response_status": "completed",
        "created_at": "2026-04-28T10:00:00Z"
      }
    ]
  }
}
```

### 获取AI回复建议

```
POST /reviews/{review_id}/suggestions
```

**请求体**:

```json
{
  "context": {
    "store_id": "store_001",
    "recent_reviews": 5,
    "customer_history": true
  },
  "options": {
    "tone": "friendly",
    "max_length": 200,
    "include_coupon": true
  }
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "suggestions": [
      {
        "id": "sug_001",
        "content": "感谢您的好评！您的支持是我们最大的动力~",
        "confidence": 0.95,
        "actions": ["send_coupon", "add_points"],
        "auto_execute": true
      },
      {
        "id": "sug_002",
        "content": "很高兴您认可我们的环境和服务！",
        "confidence": 0.88,
        "actions": ["add_points"],
        "auto_execute": false
      }
    ]
  }
}
```

### 提交回复

```
POST /reviews/{review_id}/responses
```

**请求体**:

```json
{
  "content": "感谢您的好评，我们会继续努力！",
  "response_id": "sug_001",
  "execute_actions": true
}
```

---

## Agent接口

### 触发Agent任务

```
POST /agents/{agent_type}/tasks
```

**Agent类型**:

| agent_type | 说明 |
|------------|------|
| `insight` | 线索Agent |
| `plan` | 方案Agent |
| `deliver` | 交付Agent |
| `operate` | 运营Agent |

**请求体**:

```json
{
  "task_type": "analyze_review",
  "store_id": "store_001",
  "input": {
    "review_id": "review_001",
    "content": "等了1小时还没上菜..."
  },
  "options": {
    "confidence_threshold": 0.8,
    "include_reasoning": true
  }
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "task_20260428001",
    "status": "processing",
    "result": null
  }
}
```

### 查询任务状态

```
GET /agents/tasks/{task_id}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "task_20260428001",
    "status": "completed",
    "result": {
      "sentiment": "negative",
      "confidence": 0.92,
      "entities": ["等位", "上菜慢"],
      "suggested_action": "urgent_response",
      "reasoning": "用户等了1小时未上菜，属于严重服务问题"
    },
    "completed_at": "2026-04-28T10:01:00Z"
  }
}
```

### 获取Agent配置

```
GET /stores/{store_id}/agents/config
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "agents": [
      {
        "type": "insight",
        "enabled": true,
        "model": "gpt-4o-mini",
        "trust_level": "A",
        "triggers": ["review_received", "scheduled"]
      },
      {
        "type": "plan",
        "enabled": true,
        "model": "gpt-4o",
        "trust_level": "B",
        "require_digital_twin": true
      }
    ],
    "global_settings": {
      "auto_execute_threshold": 85,
      "notification_enabled": true,
      "audit_log_enabled": true
    }
  }
}
```

### 更新Agent配置

```
PUT /stores/{store_id}/agents/config
```

**请求体**:

```json
{
  "agents": [
    {
      "type": "insight",
      "trust_level": "A",
      "custom_prompts": {
        "system": "你是一位经验丰富的餐饮运营专家..."
      }
    }
  ]
}
```

---

## 知识库

### 获取知识列表

```
GET /knowledge
```

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 知识分类 |
| industry | string | 否 | 行业筛选 |
| q | string | 否 | 搜索关键词 |

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "categories": [
      {
        "name": "出品管理",
        "count": 50,
        "items": [
          {
            "id": "kb_001",
            "title": "火锅店出餐标准流程",
            "content": "...",
            "tags": ["火锅", "出品", "标准"],
            "updated_at": "2026-04-20T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

### 添加知识条目

```
POST /knowledge
```

**请求体**:

```json
{
  "title": "新品推广话术",
  "content": "新品推荐的标准话术和技巧...",
  "category": "marketing",
  "industry": "restaurant",
  "tags": ["新品", "推荐", "话术"],
  "metadata": {
    "source": "manual",
    "author": "store_001"
  }
}
```

### 搜索知识

```
POST /knowledge/search
```

**请求体**:

```json
{
  "query": "如何处理客户投诉菜品太咸",
  "industry": "restaurant",
  "top_k": 5
}
```

---

## 事件总线

### Webhook 配置

```
POST /webhooks
```

**请求体**:

```json
{
  "url": "https://your-server.com/webhook",
  "events": [
    "review.received",
    "review.responded",
    "alert.high_risk",
    "task.completed"
  ],
  "secret": "your_webhook_secret",
  "enabled": true
}
```

### 支持的事件类型

| 事件类型 | 说明 | 触发时机 |
|---------|------|---------|
| `review.received` | 收到新评价 | 新评价被抓取 |
| `review.analyzed` | 评价分析完成 | 线索Agent处理完成 |
| `review.responded` | 评价已回复 | 交付Agent执行完成 |
| `alert.high_risk` | 高风险预警 | 检测到高风险事件 |
| `task.created` | 任务创建 | 新任务生成 |
| `task.completed` | 任务完成 | 任务执行完成 |
| `plan.generated` | 方案生成 | 方案Agent输出结果 |
| `store.cloned` | 门店克隆完成 | 克隆任务完成 |

### Webhook 签名验证

```python
import hmac
import hashlib

def verify_webhook(payload_body, secret, signature_header):
    """验证Webhook签名"""
    timestamp = signature_header.split(',')[0].split('=')[1]
    signature = signature_header.split(',')[1].split('=')[1]
    
    computed_signature = hmac.new(
        secret.encode(),
        f"{timestamp}.{payload_body}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(computed_signature, signature)
```

---

## 插件接口

### 插件注册

```javascript
// plugins/example-plugin/index.js
module.exports = {
  name: 'example-plugin',
  version: '1.0.0',
  description: '示例插件',
  
  // 插件安装时调用
  install(context) {
    // 注册触发器
    context.registerTrigger('scheduled', this.onScheduled.bind(this));
    
    // 注册Action
    context.registerAction('custom_action', this.customAction.bind(this));
    
    // 注册中间件
    context.useMiddleware(this.middleware.bind(this));
    
    console.log('插件安装成功');
  },
  
  // 插件卸载时调用
  uninstall() {
    console.log('插件卸载');
  },
  
  // 定时任务触发
  async onScheduled(event) {
    // 自定义逻辑
    return { success: true };
  },
  
  // 自定义Action
  async customAction(params) {
    return { result: 'custom result' };
  },
  
  // 中间件
  middleware(next) {
    return async (context) => {
      // 前置处理
      console.log('执行前:', context);
      const result = await next(context);
      // 后置处理
      console.log('执行后:', result);
      return result;
    };
  }
};
```

### 插件上下文 API

```typescript
interface PluginContext {
  // 注册定时触发器
  registerTrigger(type: 'scheduled' | 'event', handler: Function): void;
  
  // 注册自定义Action
  registerAction(name: string, handler: Function): void;
  
  // 注册中间件
  useMiddleware(middleware: Function): void;
  
  // 发送消息
  sendMessage(receiver: string, message: any): Promise<void>;
  
  // 获取配置
  getConfig(key: string): any;
  
  // 设置配置
  setConfig(key: string, value: any): void;
  
  // 获取知识库
  queryKnowledge(params: QueryParams): Promise<Knowledge[]>;
  
  // 添加知识
  addKnowledge(knowledge: Knowledge): Promise<void>;
  
  // 获取门店数据
  getStoreData(storeId: string): Promise<StoreData>;
  
  // 调用Agent
  callAgent(agentType: string, input: any): Promise<AgentResult>;
  
  // 日志
  logger: Logger;
}
```

### 插件市场 API

```json
{
  "plugin_id": "dynamic-pricing",
  "name": "动态定价插件",
  "description": "基于天气、节假日等因素的智能定价",
  "author": {
    "name": "Plugin Author",
    "email": "author@example.com"
  },
  "version": "1.0.0",
  "compatibility": {
    "min_version": "2.0.0"
  },
  "permissions": [
    "store:read",
    "store:write",
    "pricing:execute"
  ],
  "download_url": "https://plugins.dianying-os.com/dynamic-pricing_v1.0.0.js",
  "installs": 1250,
  "rating": 4.8
}
```

---

## 错误码

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| 0 | 成功 | - |
| 10001 | 参数错误 | 检查请求参数 |
| 10002 | 认证失败 | 重新登录 |
| 10003 | 权限不足 | 申请权限 |
| 10004 | 资源不存在 | 检查ID |
| 10005 | 操作频率限制 | 降低请求频率 |
| 20001 | Agent超时 | 重试 |
| 20002 | Agent错误 | 查看详情 |
| 20003 | 置信度过低 | 人工处理 |
| 30001 | 知识库错误 | 联系支持 |
| 30002 | 插件错误 | 检查插件 |

---

## Rate Limiting

| 等级 | 请求限制 | 窗口 |
|------|---------|------|
| 免费版 | 100次/分钟 | 1分钟 |
| 专业版 | 500次/分钟 | 1分钟 |
| 旗舰版 | 2000次/分钟 | 1分钟 |
| 企业版 | 自定义 | - |

---

## SDK

### Python SDK

```python
from dianying import DianYingOS

# 初始化
client = DianYingOS(api_key='your_api_key')

# 获取门店列表
stores = client.stores.list(page=1, limit=20)

# 获取评价
reviews = client.reviews.list(store_id='store_001', sentiment='negative')

# 获取回复建议
suggestions = client.reviews.suggestions(review_id='review_001')

# 提交回复
client.reviews.respond(review_id='review_001', content='感谢反馈...')

# 调用Agent
result = client.agents.execute('insight', task_type='analyze', input={'data': '...'})

# Webhook验证
is_valid = client.webhooks.verify(payload, signature)
```

### JavaScript SDK

```javascript
import DianYingOS from '@dianying-os/sdk';

const client = new DianYingOS({ apiKey: 'your_api_key' });

// 获取门店列表
const stores = await client.stores.list({ page: 1, limit: 20 });

// 获取评价
const reviews = await client.reviews.list({ 
  storeId: 'store_001', 
  sentiment: 'negative' 
});

// 获取回复建议
const suggestions = await client.reviews.getSuggestions('review_001');

// 提交回复
await client.reviews.respond({ 
  reviewId: 'review_001', 
  content: '感谢反馈...' 
});

// 调用Agent
const result = await client.agents.execute('insight', {
  taskType: 'analyze',
  input: { data: '...' }
});
```

---

**文档版本**: v2.0
**最后更新**: 2026年4月
**联系支持**: api-support@dianying-os.com
