"""
店赢OS管理后台API - FastAPI主入口
店赢OS是AI门店运营SaaS平台，为管理后台提供RESTful JSON API
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from contextlib import asynccontextmanager
import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from seed import seed_all
from admin.router import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动和关闭时的事件处理"""
    # 启动时初始化数据库和种子数据
    print("正在初始化数据库...")
    init_db()
    seed_all()
    print("数据库初始化完成!")
    yield
    # 关闭时清理资源
    print("应用关闭中...")


# 深色主题Swagger UI自定义CSS
SWAGGER_CSS = """
/* 店赢OS 深色主题定制 */
:root {
    --dark-bg: #1a1a2e;
    --dark-secondary: #16213e;
    --dark-accent: #e94560;
    --dark-text: #eaeaea;
    --dark-text-muted: #a0a0a0;
    --dark-border: #2d3748;
    --dyos-primary: #e94560;
    --dyos-secondary: #0f3460;
}

html {
    scrollbar-width: thin;
    scrollbar-color: var(--dyos-accent) var(--dark-bg);
}

body {
    background-color: var(--dark-bg) !important;
    color: var(--dark-text) !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif !important;
}

/* Swagger UI 容器 */
.swagger-ui {
    background-color: var(--dark-bg) !important;
}

.swagger-ui .topbar {
    background-color: var(--dark-secondary) !important;
    border-bottom: 1px solid var(--dark-border) !important;
}

.swagger-ui .topbar .topbar__logo {
    filter: brightness(0) invert(1);
}

.swagger-ui .topbar a {
    color: var(--dark-text) !important;
}

/* 信息区域 */
.swagger-ui .info {
    background: linear-gradient(135deg, var(--dark-secondary) 0%, var(--dark-bg) 100%) !important;
    border-radius: 12px !important;
    padding: 20px !important;
    margin: 0 0 30px 0 !important;
    border: 1px solid var(--dark-border) !important;
}

.swagger-ui .info .title {
    color: var(--dyos-primary) !important;
    font-size: 28px !important;
    font-weight: 700 !important;
    margin-bottom: 10px !important;
}

.swagger-ui .info .description {
    color: var(--dark-text-muted) !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
}

.swagger-ui .info .description code {
    background-color: var(--dark-bg) !important;
    color: var(--dyos-primary) !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
}

/* 标签页样式 */
.swagger-ui .opblock-tag {
    background-color: var(--dark-secondary) !important;
    border-bottom: 2px solid var(--dyos-primary) !important;
    color: var(--dark-text) !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    padding: 15px 20px !important;
    margin-top: 0 !important;
    border-radius: 8px 8px 0 0 !important;
}

.swagger-ui .opblock-tag:hover {
    background-color: var(--dark-bg) !important;
}

.swagger-ui .opblock-tag small {
    color: var(--dark-text-muted) !important;
    font-size: 12px !important;
}

/* API端点块样式 */
.swagger-ui .opblock {
    background-color: var(--dark-secondary) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 8px !important;
    margin-bottom: 10px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.swagger-ui .opblock:hover {
    box-shadow: 0 4px 16px rgba(233, 69, 96, 0.2) !important;
}

.swagger-ui .opblock .opblock-summary {
    padding: 12px 20px !important;
}

.swagger-ui .opblock .opblock-summary .opblock-summary__path {
    color: var(--dark-text) !important;
    font-weight: 500 !important;
}

.swagger-ui .opblock .opblock-summary .opblock-summary__method {
    background-color: var(--dyos-primary) !important;
    color: white !important;
    border-radius: 4px !important;
    font-weight: 600 !important;
    padding: 4px 10px !important;
    font-size: 12px !important;
}

.swagger-ui .opblock.post .opblock-summary__method {
    background-color: #2e7d32 !important;
}

.swagger-ui .opblock.put .opblock-summary__method {
    background-color: #f57c00 !important;
}

.swagger-ui .opblock.delete .opblock-summary__method {
    background-color: #c62828 !important;
}

.swagger-ui .opblock.get .opblock-summary__method {
    background-color: #1565c0 !important;
}

/* 展开的内容区域 */
.swagger-ui .opblock .opblock-body {
    background-color: var(--dark-bg) !important;
    border-top: 1px solid var(--dark-border) !important;
}

.swagger-ui .opblock .opblock-body pre {
    background-color: var(--dark-secondary) !important;
    border-radius: 6px !important;
}

/* 参数样式 */
.swagger-ui .opblock .opblock-body .parameters .parameter {
    background-color: var(--dark-secondary) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 6px !important;
    padding: 12px !important;
    margin-bottom: 10px !important;
}

.swagger-ui .opblock .opblock-body .parameters .parameter input {
    background-color: var(--dark-bg) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 4px !important;
    color: var(--dark-text) !important;
    padding: 8px 12px !important;
}

.swagger-ui .opblock .opblock-body .parameters .parameter input:focus {
    border-color: var(--dyos-primary) !important;
    outline: none !important;
}

.swagger-ui .opblock .opblock-body .parameters .parameter__name {
    color: var(--dark-text) !important;
    font-weight: 500 !important;
}

/* 响应样式 */
.swagger-ui .responses-wrapper .responses-table {
    background-color: var(--dark-secondary) !important;
    border-radius: 6px !important;
}

.swagger-ui .responses-wrapper .responses-table .response {
    border-bottom: 1px solid var(--dark-border) !important;
}

/* Execute按钮 */
.swagger-ui .btn.execute {
    background-color: var(--dyos-primary) !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 10px 24px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

.swagger-ui .btn.execute:hover {
    background-color: #d13653 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4) !important;
}

/* Try it out 按钮 */
.swagger-ui .try-out__btn {
    background-color: var(--dyos-secondary) !important;
    color: var(--dark-text) !important;
    border: 1px solid var(--dyos-primary) !important;
    border-radius: 4px !important;
}

.swagger-ui .try-out__btn:hover {
    background-color: var(--dyos-primary) !important;
}

/* 模型/Schema样式 */
.swagger-ui .model-container {
    background-color: var(--dark-secondary) !important;
    border-radius: 6px !important;
    padding: 15px !important;
}

.swagger-ui .model {
    color: var(--dark-text) !important;
}

.swagger-ui .model-title {
    color: var(--dyos-primary) !important;
    font-weight: 600 !important;
}

.swagger-ui .prop {
    color: var(--dark-text) !important;
}

.swagger-ui .prop-type {
    color: #64b5f6 !important;
}

.swagger-ui .prop-format {
    color: var(--dark-text-muted) !important;
}

/* 服务器选择器 */
.swagger-ui .servers > label {
    color: var(--dark-text) !important;
}

.swagger-ui .servers select {
    background-color: var(--dark-secondary) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 4px !important;
    color: var(--dark-text) !important;
    padding: 8px 12px !important;
}

/* 认证区域 */
.swagger-ui .auth-wrapper .authorize {
    background-color: var(--dyos-secondary) !important;
    border: 1px solid var(--dyos-primary) !important;
    border-radius: 4px !important;
    padding: 8px 16px !important;
}

.swagger-ui .auth-wrapper .authorize:hover {
    background-color: var(--dyos-primary) !important;
}

/* 滚动条样式 */
.swagger-ui ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
}

.swagger-ui ::-webkit-scrollbar-track {
    background: var(--dark-bg) !important;
}

.swagger-ui ::-webkit-scrollbar-thumb {
    background: var(--dark-border) !important;
    border-radius: 4px !important;
}

.swagger-ui ::-webkit-scrollbar-thumb:hover {
    background: var(--dyos-primary) !important;
}

/* Footer */
.swagger-ui .footer {
    background-color: var(--dark-secondary) !important;
    color: var(--dark-text-muted) !important;
    border-top: 1px solid var(--dark-border) !important;
    padding: 15px !important;
}

/* 加载动画 */
.swagger-ui .loading-container .loading:after {
    background-color: var(--dyos-primary) !important;
}

/* JSON响应样式 */
.swagger-ui .highlight-code {
    background-color: var(--dark-bg) !important;
    border-radius: 6px !important;
}

.swagger-ui .highlight-code code {
    color: var(--dark-text) !important;
}

/* 版本标签 */
.swagger-ui .info .title .nest {
    color: var(--dark-text-muted) !important;
    font-size: 14px !important;
    font-weight: normal !important;
    margin-left: 10px !important;
}

/* 展开/折叠箭头 */
.swagger-ui .opblock .opblock-summary .arrow {
    fill: var(--dark-text) !important;
}

/* 描述文字 */
.swagger-ui .opblock .opblock-summary-description {
    color: var(--dark-text-muted) !important;
    font-size: 13px !important;
}

/* Content-type */
.swagger-ui .content-type-wrapper .content-type {
    background-color: var(--dark-secondary) !important;
    border: 1px solid var(--dark-border) !important;
    color: var(--dark-text) !important;
}
"""

# OpenAPI元数据配置
OPENAPI_METADATA = {
    "title": "店赢OS管理后台API",
    "description": """
# 店赢OS平台API文档

店赢OS是AI门店运营SaaS平台，为管理后台提供全面的RESTful JSON API接口。

## 📋 平台概述
店赢OS覆盖**13大核心模块**，为商户提供从入驻、交易、营销到数据分析的全链路服务。

## 📦 API模块列表

| 模块 | 标签 | 描述 |
|------|------|------|
| 商户管理 | `商户管理` | 商户入驻、审核、权限配置 |
| 代理商体系 | `代理商体系` | 代理商管理、佣金分润 |
| 业务人员 | `业务人员` | 业务员管理、业绩追踪 |
| 财务中心 | `财务中心` | 收入统计、账单管理、退款审批、发票申请 |
| 内容运营 | `内容运营` | 知识库、公告、运营活动 |
| 数据洞察 | `数据洞察` | 平台总览、GMV趋势、AI使用统计 |
| 支付交易 | `支付交易` | 交易流水、费率配置、分账管理 |
| 天阙支付 | `天阙支付` | 对接天阙开放平台支付能力 |
| 客户成功 | `客户成功` | Onboarding、健康度、续费管理 |
| 渠道增长 | `渠道增长` | 渠道分析、邀请裂变、合作伙伴 |
| 客服支持 | `客服支持` | 工单管理、FAQ、满意度调研 |
| 产品迭代 | `产品迭代` | 功能开关、AB测试、需求池 |
| 安全合规 | `安全合规` | 登录日志、数据脱敏、合规审计 |
| 系统设置 | `系统设置` | 角色权限、操作日志、定价配置 |

## 🔐 认证方式
- 当前版本：无需认证（开发环境）
- 生产环境：需配置JWT Token认证

## 📊 响应格式
所有API统一返回以下JSON格式：
```json
{
    "code": 0,
    "message": "操作成功",
    "data": { ... }
}
```

## 🏢 公司信息
- **版权**: 广东德天商务服务有限公司
- **技术支持**: 店赢OS技术团队
    """,
    "version": "1.0.0",
    "contact": {
        "name": "店赢OS技术支持",
        "email": "tech@dianyingos.com",
        "url": "https://www.dianyingos.com"
    },
    "license": {
        "name": "专有软件授权",
        "url": "https://www.dianyingos.com/license"
    },
    "termsOfService": "https://www.dianyingos.com/terms",
    "x-logo": {
        "url": "https://www.dianyingos.com/logo.png",
        "backgroundColor": "#1a1a2e",
        "altText": "店赢OS Logo"
    }
}


app = FastAPI(
    title=OPENAPI_METADATA["title"],
    description=OPENAPI_METADATA["description"],
    version=OPENAPI_METADATA["version"],
    contact=OPENAPI_METADATA["contact"],
    license_info=OPENAPI_METADATA["license"],
    terms_of_service=OPENAPI_METADATA["termsOfService"],
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "deepLinking": True,
        "displayOperationId": True,
        "displayRequestDuration": True,
        "filter": True,
        "showExtensions": True,
        "showCommonExtensions": True,
        "syntaxHighlight.theme": "obsidian",
        "presets": [
            "APIsTown.apis.preset"
        ] if hasattr(__import__('sys'), 'modules') and 'APIsTown' in str(dir()) else None,
    },
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": str(exc), "data": None}
    )


@app.get("/", include_in_schema=False)
async def root():
    """API根路径"""
    return {
        "name": "店赢OS管理后台API",
        "version": "1.0.0",
        "description": "店赢OS是AI门店运营SaaS平台管理后台API",
        "modules": [
            "商家管理", "代理商体系", "业务人员", "财务中心", "内容运营",
            "数据洞察", "支付交易", "客户成功", "渠道增长", "客服支持",
            "产品迭代", "安全合规", "系统设置"
        ],
        "endpoints": {
            "admin": "/admin",
            "docs": "/docs",
            "health": "/health"
        }
    }


@app.get("/health", 
    tags=["系统管理"],
    summary="健康检查",
    description="检查API服务是否正常运行，返回服务状态信息"
)
async def health_check():
    """
    健康检查接口
    
    - 用于监控API服务状态
    - 返回服务名称、状态、版本等信息
    """
    return {
        "status": "healthy",
        "service": "dyos-admin-api",
        "version": "1.0.0",
        "timestamp": "2024-12-03T10:00:00Z"
    }


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """自定义Swagger UI页面 - 深色主题"""
    return get_swagger_ui_html(
        title="店赢OS管理后台API",
        openapi_url=app.openapi_url,
        swagger_favicon_url="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏪</text></svg>",
    )


@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    """ReDoc文档页面"""
    return get_redoc_html(
        title="店赢OS管理后台API - ReDoc",
        redoc_url="/redoc",
        openapi_url=app.openapi_url
    )


# 注册管理后台路由
app.include_router(admin_router)


# 添加自定义Swagger CSS中间件
@app.middleware("http")
async def add_swagger_css(request: Request, call_next):
    response = await call_next(request)
    if request.url.path == "/docs":
        response.headers["custom-swagger-css"] = "true"
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
