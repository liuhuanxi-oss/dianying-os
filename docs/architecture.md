# 店赢OS 技术架构文档

> 本文档详细描述店赢OS的系统架构设计、技术选型、核心模块及扩展点。

**文档版本**: v2.0
**更新日期**: 2026年4月
**维护者**: 店赢OS Team

---

## 📋 目录

- [系统概述](#系统概述)
- [架构分层](#架构分层)
- [核心模块](#核心模块)
- [数据流转](#数据流转)
- [Agent通信协议](#agent通信协议)
- [扩展点说明](#扩展点说明)

---

## 系统概述

### 设计目标

1. **高可用**: 多Agent协同，单点故障不影响整体
2. **可扩展**: 模块化设计，支持垂直扩展和水平扩展
3. **智能化**: 80%+运营自动化率
4. **易用性**: 开箱即用，学习成本低

### 核心原则

```
┌─────────────────────────────────────────────────────────────┐
│                    架构设计原则                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 🔄 松耦合    Agent之间通过消息总线通信，互不依赖          │
│  2. 📦 模块化    每个功能独立封装，易于替换和升级             │
│  3. 🎯 单一职责  每个Agent只负责自己的领域                    │
│  4. 🔒 安全性    敏感操作需要人工确认，数据加密传输            │
│  5. 📊 可观测    完整的日志和监控，便于问题定位                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 架构分层

```mermaid
flowchart TB
    subgraph Presentation["表现层 Presentation Layer"]
        Dashboard[Dashboard 管理面板]
        MobileApp[移动端 App]
        WeChatBot[企业微信机器人]
        APIGateway[API 网关]
    end

    subgraph Application["应用层 Application Layer"]
        IntentLayer[意图理解层]
        TaskRouter[任务路由]
        SessionMgr[会话管理]
    end

    subgraph Agent["Agent 层 - AI 虚拟店长"]
        subgraph Agents["核心 Agents"]
            InsightAgent[🤔 线索Agent]
            PlanAgent[📋 方案Agent]
            DeliverAgent[🚀 交付Agent]
            OperateAgent[⚙️ 运营Agent]
        end
        
        subgraph Memory["记忆系统"]
            KG[知识图谱]
            CM[客户画像]
            SM[门店画像]
        end
        
        subgraph Safety["安全机制"]
            TrustEngine[信任阈值引擎]
            AuditLog[审计日志]
        end
    end

    subgraph Data["数据层 Data Layer"]
        ReviewData[评价数据]
        OperationData[运营数据]
        ExternalAPI[外部 API]
        CacheLayer[缓存层]
    end

    subgraph Infrastructure["基础设施层"]
        CozePlatform[Coze 平台]
        StorageEngine[存储引擎]
        MessageBus[消息总线]
    end

    Presentation --> Application
    Application --> Agent
    Agent --> Data
    Data --> Infrastructure

    Dashboard --> APIGateway
    MobileApp --> APIGateway
    WeChatBot --> APIGateway
```

### 分层详解

#### 1. 表现层 (Presentation Layer)

| 组件 | 技术栈 | 说明 |
|------|-------|------|
| Dashboard | HTML5 + CSS3 + JS | PC端管理后台 |
| Mobile App | React Native / Flutter | iOS/Android 原生应用 |
| 企业微信 | 企业微信 SDK | 轻量化入口 |
| API Gateway | RESTful API | 第三方集成接口 |

#### 2. 应用层 (Application Layer)

```
┌─────────────────────────────────────────────────────────────┐
│                      意图理解层                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   用户输入                                                    │
│      │                                                       │
│      ▼                                                       │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │  语义   │───►│  意图   │───►│  任务   │                │
│   │  解析   │    │  分类   │    │  拆解   │                │
│   └─────────┘    └─────────┘    └─────────┘                │
│                                              │                │
│                                              ▼                │
│                                    ┌─────────────┐           │
│                                    │   任务路由   │           │
│                                    │  TaskRouter │           │
│                                    └─────────────┘           │
│                                              │                │
│                          ┌───────────────────┼────────────┐  │
│                          │                   │            │  │
│                          ▼                   ▼            ▼  │
│                    ┌──────────┐      ┌──────────┐    ┌──────────┐
│                    │  线索    │      │  方案    │    │  交付    │
│                    │  Agent   │      │  Agent   │    │  Agent   │
│                    └──────────┘      └──────────┘    └──────────┘
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Agent 层 (Agent Layer)

详见 [Agent体系说明](#agent体系说明)

#### 4. 数据层 (Data Layer)

```python
# 数据模型示例
class StoreData:
    """门店数据模型"""
    store_id: str           # 门店唯一标识
    store_name: str         # 门店名称
    industry: str           # 所属行业
    location: dict          # 地理位置
    capacity: dict          # 容量信息
    staff: list             # 员工配置
    operations: dict       # 运营配置
    integrations: dict     # 第三方集成

class ReviewData:
    """评价数据模型"""
    review_id: str         # 评价ID
    platform: str          # 来源平台
    rating: int            # 评分 1-5
    content: str           # 评价内容
    sentiment: str         # 情感分析
    entities: list         # 实体抽取
    action_items: list     # 需要执行的动作

class CustomerProfile:
    """客户画像模型"""
    customer_id: str       # 客户ID
    basic_info: dict       # 基本信息
    preferences: dict      # 消费偏好
    lifecycle: str         # 生命周期阶段
    churn_risk: float      # 流失风险评分
```

---

## 核心模块

### Agent体系

#### 线索Agent (Insight Agent)

**职责**: 发现问题、识别机会、预测风险

```mermaid
flowchart LR
    subgraph Input["输入"]
        R[评价数据]
        O[运营数据]
        E[外部数据]
    end

    subgraph Process["处理"]
        NER[实体识别]
        SA[情感分析]
        TP[趋势预测]
        RP[风险识别]
    end

    subgraph Output["输出"]
        Event[洞察事件]
        Alert[预警信号]
        Insight[商业洞察]
    end

    R --> NER
    O --> TP
    E --> RP
    NER --> SA
    SA --> Event
    TP --> Insight
    RP --> Alert
```

**能力矩阵**:

| 能力 | 算法/模型 | 输入 | 输出 |
|------|----------|------|------|
| 实体识别 | NER | 评价文本 | 菜名/人名/问题 |
| 情感分析 | BERT/RoBERTa | 评价文本 | 情感极性+强度 |
| 趋势预测 | LSTM/Transformer | 历史数据 | 未来趋势 |
| 风险识别 | 规则+ML混合 | 多源数据 | 风险等级 |

#### 方案Agent (Plan Agent)

**职责**: 问题诊断、策略生成、资源调配

```mermaid
flowchart TB
    subgraph Input["输入"]
        E[洞察事件]
        KG[知识图谱]
        SM[门店画像]
    end

    subgraph Diagnose["诊断"]
        RC[根因分析]
        SC[场景分类]
        PC[问题分类]
    end

    subgraph Generate["生成"]
        SG[策略生成]
        RS[资源调度]
        DT[数字孪生验证]
    end

    subgraph Output["输出"]
        Plan[运营方案]
        Cost[成本预估]
        Risk[风险评估]
    end

    E --> Diagnose
    KG --> Generate
    SM --> Generate
    Diagnose --> Generate
    Generate --> Output
```

**策略模板库**:

| 策略类型 | 触发条件 | 执行动作 |
|---------|---------|---------|
| 好评感谢 | 5星好评 | 自动回复+积分奖励 |
| 差评响应 | 1-2星评价 | 道歉+补偿+跟踪 |
| 流失预警 | 30天未消费 | 定向优惠券 |
| 动态定价 | 节假日/雨天 | 价格调整 |
| 补货提醒 | 库存低于阈值 | 生成采购建议 |

#### 交付Agent (Deliver Agent)

**职责**: 任务分解、执行追踪、结果反馈

```mermaid
flowchart TB
    subgraph Input["输入"]
        P[运营方案]
        Store[门店配置]
    end

    subgraph Decompose["分解"]
        TD[任务拆分]
        SD[子任务分配]
        DEP[依赖解析]
    end

    subgraph Execute["执行"]
        EX[指令下发]
        TR[进度追踪]
        EXC[异常处理]
    end

    subgraph Output["输出"]
        Result[执行结果]
        Report[执行报告]
        Feedback[反馈优化]
    end

    P --> Decompose
    Store --> SD
    Decompose --> Execute
    Execute --> Output
```

#### 运营Agent (Operate Agent)

**职责**: 持续优化、知识积累、策略迭代

```
┌─────────────────────────────────────────────────────────────┐
│                      运营优化循环                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   效果验证                                                    │
│      │                                                       │
│      ▼                                                       │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │  数据   │───►│  分析   │───►│  迭代   │                │
│   │  采集   │    │  评估   │    │  优化   │                │
│   └─────────┘    └─────────┘    └─────────┘                │
│                                              │                │
│                                              ▼                │
│                                    ┌─────────────┐           │
│                                    │  知识沉淀   │           │
│                                    │ Knowledge   │           │
│                                    └─────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 记忆系统

#### 知识图谱 (Knowledge Graph)

```mermaid
flowchart TB
    subgraph Entities["实体层"]
        Store[门店]
        Product[产品]
        Customer[客户]
        Staff[员工]
    end

    subgraph Relations["关系层"]
        S_P[属于-供应]
        C_P[购买]
        S_C[服务]
        S_St[雇佣]
    end

    subgraph Attributes["属性层"]
        Price[价格]
        Rating[评分]
        Preference[偏好]
        Skill[技能]
    end

    Entities --> Relations
    Relations --> Attributes
```

#### 双重画像系统

```mermaid
flowchart LR
    subgraph Customer["客户画像"]
        CI[基本信息]
        CP[消费偏好]
        CL[生命周期]
        CR[流失风险]
    end

    subgraph Store["门店画像"]
        SI[基础信息]
        SH[历史问题]
        SC[执行能力]
        SP[优化空间]
    end

    subgraph Match["智能匹配"]
        M1[个性化推荐]
        M2[精准营销]
        M3[服务定制]
    end

    Customer --> Match
    Store --> Match
```

---

## 数据流转

### 评价处理流程

```mermaid
sequenceDiagram
    participant User as 👤 用户
    participant Platform as 🏪 平台
    participant Crawler as 📥 采集器
    participant Insight as 🤔 线索Agent
    participant Plan as 📋 方案Agent
    participant Trust as 🎯 信任引擎
    participant Deliver as 🚀 交付Agent
    participant Store as 🏪 门店

    Platform->>Crawler: 新评价推送
    Crawler->>Insight: 原始评价数据
    
    Insight->>Insight: 情感分析
    Insight->>Insight: 实体识别
    Insight->>Insight: 风险评估
    
    Insight->>Plan: 洞察事件 + 置信度
    
    alt 高置信度 (>85%)
        Plan->>Plan: 直接生成方案
        Plan->>Trust: 自动通过
        Trust->>Deliver: 执行指令
    else 中置信度 (60-85%)
        Plan->>Trust: 需要审核
        Trust->>User: 发送审核通知
        User->>Trust: 确认/修改
        Trust->>Deliver: 执行指令
    else 低置信度 (<60%)
        Plan->>Trust: 预警
        Trust->>User: 紧急通知
        User->>Trust: 人工决策
        Trust->>Deliver: 执行指令
    end
    
    Deliver->>Store: 执行操作
    Deliver->>User: 执行结果通知
    Deliver->>Insight: 反馈更新
```

### 数据同步机制

```
┌─────────────────────────────────────────────────────────────┐
│                    多源数据同步架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   美团/点评                                                   │
│      │                                                       │
│      ▼                                                       │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │  数据   │───►│   数据   │───►│   数据   │                │
│   │  采集   │    │   清洗   │    │   存储   │                │
│   └─────────┘    └─────────┘    └─────────┘                │
│                                           │                  │
│   饿了么/抖音 ───────────────────────────┤                  │
│                                           │                  │
│   小红书/微信 ───────────────────────────┤                  │
│                                           ▼                  │
│                                    ┌─────────────┐           │
│                                    │  统一数据   │           │
│                                    │    视图     │           │
│                                    └─────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent通信协议

### 消息格式

```json
{
  "message_id": "msg_20260428001",
  "timestamp": "2026-04-28T10:30:00Z",
  "sender": "insight_agent",
  "receiver": "plan_agent",
  "type": "event",
  "payload": {
    "event_type": "negative_review",
    "confidence": 0.92,
    "data": {
      "review_id": "r_12345",
      "content": "等了1小时还没上菜...",
      "rating": 1,
      "sentiment": "negative",
      "entities": ["等位", "上菜慢"],
      "action_required": true
    }
  },
  "metadata": {
    "store_id": "store_hotpot_001",
    "priority": "high",
    "ttl": 300
  }
}
```

### Agent间协议定义

| 协议 | 描述 | 触发条件 |
|------|------|---------|
| `event.trigger` | 事件触发 | 线索Agent检测到重要事件 |
| `plan.request` | 方案请求 | 需要生成解决方案 |
| `plan.response` | 方案响应 | 方案生成完成 |
| `execute.command` | 执行命令 | 方案获批，等待执行 |
| `execute.result` | 执行结果 | 执行完成，结果反馈 |
| `feedback.update` | 反馈更新 | 运营结果反馈 |
| `knowledge.update` | 知识更新 | 知识图谱更新 |

### 错误处理

```python
class AgentError(Exception):
    """Agent基础异常"""
    pass

class TimeoutError(AgentError):
    """超时异常"""
    pass

class ConfidenceError(AgentError):
    """置信度过低"""
    pass

class ValidationError(AgentError):
    """验证失败"""
    pass

# 错误处理策略
ERROR_STRATEGIES = {
    "timeout": "retry_3_times_then_escalate",
    "low_confidence": "force_human_review",
    "validation_failed": "log_and_skip",
    "network_error": "retry_with_backoff"
}
```

---

## 扩展点说明

### 1. 自定义Agent扩展

```javascript
// 示例：注册自定义Agent
class CustomAgent extends BaseAgent {
    constructor(config) {
        super(config);
        this.name = config.name;
        this.capabilities = config.capabilities;
    }

    async process(input) {
        // 自定义处理逻辑
        const result = await this.analyze(input);
        return this.formatOutput(result);
    }

    getSchema() {
        return {
            name: this.name,
            input: this.inputSchema,
            output: this.outputSchema,
            capabilities: this.capabilities
        };
    }
}

// 注册到系统
AgentRegistry.register('custom_agent', CustomAgent);
```

### 2. 插件系统

```javascript
// 插件接口定义
interface Plugin {
    name: string;
    version: string;
    install(context: PluginContext): void;
    uninstall(): void;
}

// 示例插件
class DynamicPricingPlugin implements Plugin {
    name = 'dynamic_pricing';
    version = '1.0.0';

    install(context) {
        context.registerTrigger('scheduled', this.executePricing.bind(this));
        context.registerAction('adjust_price', this.adjustPrice.bind(this));
    }
}
```

### 3. 自定义数据源

```python
class CustomDataSource(BaseDataSource):
    """自定义数据源示例"""
    
    def __init__(self, config):
        self.api_endpoint = config['endpoint']
        self.api_key = config['api_key']
    
    async def fetch(self, params: dict) -> list:
        """获取数据"""
        response = await self.call_api(self.api_endpoint, params)
        return self.transform(response)
    
    async def subscribe(self, callback: callable):
        """订阅实时数据"""
        await self.websocket.connect()
        self.websocket.on_message(callback)
```

### 4. 行业模板扩展

```yaml
# config/industries/restaurant.yaml
industry: restaurant
name: 餐饮行业

knowledge_base:
  - category: 出品管理
    items:
      - 菜品标准制作流程
      - 食品安全规范
      - 损耗控制策略
  
  - category: 服务管理
    items:
      - 服务标准SOP
      - 投诉处理流程
      - 客户满意度提升

triggers:
  - type: review_received
    conditions:
      rating: { $lte: 2 }
    actions:
      - analyze_sentiment
      - generate_response
  
  - type: inventory_low
    conditions:
      stock: { $lt: threshold }
    actions:
      - generate_purchase_order
      - notify_manager
```

---

## 性能指标

| 指标 | 目标值 | 当前状态 |
|------|-------|---------|
| 系统可用性 | 99.9% | 99.5% |
| 平均响应时间 | <500ms | <800ms |
| 并发处理能力 | 1000 req/s | 500 req/s |
| 评价处理速度 | <5s | <10s |
| 自动执行率 | 80%+ | 65% |

---

## 安全机制

### 权限控制

```mermaid
flowchart TB
    subgraph Auth["认证授权"]
        Login[用户登录]
        MFA[多因素认证]
        Token[JWT Token]
    end

    subgraph Perms["权限体系"]
        RBAC[RBAC模型]
        StorePerm[门店权限]
        AgentPerm[Agent权限]
    end

    subgraph Audit["审计"]
        Log[操作日志]
        Monitor[实时监控]
        Alert[异常告警]
    end

    Login --> MFA
    MFA --> Token
    Token --> RBAC
    RBAC --> StorePerm
    RBAC --> AgentPerm
    StorePerm --> Audit
    AgentPerm --> Audit
```

### 数据安全

| 安全措施 | 实现方式 |
|---------|---------|
| 传输加密 | HTTPS/TLS 1.3 |
| 存储加密 | AES-256 |
| 访问控制 | RBAC + ABAC |
| 审计日志 | 完整操作记录 |
| 数据脱敏 | 敏感信息脱敏 |

---

## 部署架构

### 开发环境

```
┌─────────────────────────────────────────────────────────────┐
│                    开发环境架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │  开发者   │    │  GitHub  │    │  本地    │             │
│   │  本地    │◄──►│  Repo   │◄──►│  测试    │             │
│   │  IDE    │    │         │    │  数据    │             │
│   └──────────┘    └──────────┘    └──────────┘             │
│                                            │                  │
└────────────────────────────────────────────┼────────────────┘
```

### 生产环境（推荐）

```mermaid
flowchart TB
    subgraph Client["客户端"]
        Web[Web Browser]
        Mobile[Mobile App]
        WeChat[企业微信]
    end

    subgraph CDN["CDN"]
        Static[静态资源]
    end

    subgraph Cloud["云服务"]
        LB[负载均衡]
        API[API服务器]
        Cache[Redis缓存]
        DB[(数据库)]
    end

    subgraph AI["AI服务"]
        Coze[Coze平台]
        Agents[多Agent集群]
    end

    Web --> CDN
    Mobile --> LB
    WeChat --> LB
    CDN --> LB
    LB --> API
    API --> Cache
    API --> DB
    API --> Coze
    Coze --> Agents
```

---

## 监控与运维

### 监控指标

```yaml
metrics:
  system:
    - cpu_usage
    - memory_usage
    - disk_io
    - network_traffic
  
  application:
    - request_count
    - response_time
    - error_rate
    - active_users
  
  business:
    - reviews_processed
    - auto_execute_rate
    - customer_satisfaction
    - revenue_impact
```

### 告警策略

| 告警级别 | 触发条件 | 通知方式 |
|---------|---------|---------|
| P1 紧急 | 系统不可用 | 电话+短信+邮件 |
| P2 高 | 响应超时>10s | 短信+邮件 |
| P3 中 | 错误率>5% | 邮件+钉钉 |
| P4 低 | 指标波动>20% | 邮件 |

---

## 总结

本文档详细描述了店赢OS的技术架构设计。系统采用多Agent协同架构，通过线索Agent、方案Agent、交付Agent和运营Agent的协作，实现了80%+的运营自动化率。

核心创新点：
1. **多Agent协同**: 四个专业Agent各司其职，协同完成复杂任务
2. **信任阈值机制**: 根据置信度自动决定处理方式，确保安全可控
3. **数字孪生验证**: 新策略上线前在数字孪生中验证，降低风险
4. **知识图谱**: 沉淀行业知识，支持智能决策
5. **双重画像**: 客户画像+门店画像，实现精准运营

---

**文档版本**: v2.0
**最后更新**: 2026年4月
**维护者**: DianYing OS Team
