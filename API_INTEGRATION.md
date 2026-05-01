# 店赢OS管理后台 - API集成说明

## 概述

店赢OS管理后台前端已从纯Mock数据模式升级为支持FastAPI后端API调用的混合模式。

## 核心特性

### 1. API客户端 (`js/admin-api.js`)
- 封装94个API端点
- 统一错误处理和超时管理
- 自动检测API可用性
- API不可用时自动fallback到Mock数据

### 2. 智能降级
- 优先尝试连接FastAPI后端
- 3秒超时后自动切换到Mock数据
- 右下角显示当前模式（API已连接 / Mock数据模式）
- 确保GitHub Pages纯静态环境正常运行

### 3. UI增强
- Toast通知提示
- 确认对话框
- 加载状态显示
- 分页组件

## API端点一览

### 商家管理
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/merchants/` | GET | 商家列表（支持分页/筛选） |
| `/api/admin/merchants/{id}` | GET | 商家详情 |
| `/api/admin/merchants/` | POST | 创建商家 |
| `/api/admin/merchants/{id}` | PUT | 更新商家 |
| `/api/admin/merchants/{id}` | DELETE | 删除商家 |
| `/api/admin/merchants/stats` | GET | 商家统计 |

### 代理商管理
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/agents/` | GET | 代理商列表 |
| `/api/admin/agents/dashboard` | GET | 代理商看板 |
| `/api/admin/agents/stats` | GET | 代理商统计 |
| `/api/admin/agents/{id}` | GET | 代理商详情 |
| `/api/admin/agents/{id}/commission` | GET | 佣金信息 |

### 业务员管理
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/sales/` | GET | 业务员列表 |
| `/api/admin/sales/{id}/performance` | GET | 业绩数据 |
| `/api/admin/sales/{id}/customers` | GET | 客户分配 |

### 财务中心
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/finance/revenue` | GET | 收入统计 |
| `/api/admin/finance/billing` | GET | 账单列表 |
| `/api/admin/finance/refund` | POST | 退款处理 |
| `/api/admin/finance/invoice` | GET | 发票管理 |

### 其他模块
- **内容运营**: 知识库、AI模板、公告、活动
- **数据洞察**: 平台总览、GMV趋势、行业报告、AI统计、流失预警
- **支付交易**: 通道监控、交易流水、费率配置、分账管理、对账
- **客户成功**: Onboarding、健康度、续费管理、升降级、沉默唤醒
- **渠道增长**: 渠道分析、邀请裂变、试用管理、合作伙伴
- **客服支持**: 工单系统、FAQ管理、满意度调研
- **产品迭代**: 功能开关、AB测试、需求池、版本管理
- **安全合规**: 登录安全、数据脱敏、合规审计
- **系统设置**: 角色权限、操作日志、定价配置、消息通知

## 启动方式

### 方式一：完整开发环境（推荐）
```bash
# 启动统一服务器（同时提供前端+API）
./start-dev.sh
# 或
python3 api/api_proxy.py
```
访问: http://localhost:3000/admin.html

### 方式二：分别启动
```bash
# 终端1: 启动API后端
cd api && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 终端2: 启动静态文件服务器（任意静态服务器均可）
python3 -m http.server 3000 --directory .
```

### 方式三：纯前端模式（GitHub Pages）
无需任何后端，直接访问admin.html即可。

## 配置说明

### API地址配置
在 `js/admin-api.js` 中修改：
```javascript
const API = {
  baseURL: '/api',  // 修改为实际的API地址
  timeout: 10000,   // 请求超时(ms)
  retryTimes: 2,    // 重试次数
};
```

### 生产环境Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/dianying-os;
        index admin.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 文件结构

```
.
├── admin.html              # 管理后台入口页面
├── js/
│   ├── admin-api.js        # API客户端封装
│   └── admin.js            # 主逻辑（含Mock数据）
├── css/
│   └── admin.css           # 样式
├── api/
│   ├── main.py             # FastAPI入口
│   ├── api_proxy.py         # 完整版代理服务器
│   └── admin/              # 各模块API实现
├── start-dev.sh            # 开发环境启动脚本
└── API_INTEGRATION.md      # 本文档
```

## 数据流程

```
用户操作 → admin.js → admin-api.js
                          ↓
                    API可用?
                    ↙       ↘
                   是        否
                   ↓         ↓
            FastAPI后端    Mock数据
                   ↓         ↓
                    ↘       ↙
                     数据渲染
```

## 兼容性

- ✅ 完整API环境（开发/生产）
- ✅ API不可用时自动降级
- ✅ 纯静态环境（GitHub Pages）
- ✅ 移动端375px适配
- ✅ 深色主题
