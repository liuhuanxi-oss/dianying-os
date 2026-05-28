# -*- coding: utf-8 -*-
"""
FastAPI应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

import config
from database import init_database

# 创建FastAPI应用
app = FastAPI(
    title=config.PLATFORM_CONFIG["name"],
    version=config.PLATFORM_CONFIG["version"],
    description="店赢OS 后端API服务",
    docs_url="/docs" if os.getenv("DEBUG") else None,
    redoc_url="/redoc" if os.getenv("DEBUG") else None,
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 注册路由（必须在SPA catch-all之前）
from routes import auth, stores, reviews, stats, merchants, notify

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(stores.router, prefix="/api/stores", tags=["门店"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["评价"])
app.include_router(stats.router, prefix="/api/stats", tags=["统计"])
app.include_router(merchants.router, prefix="/api/merchants", tags=["商户"])
app.include_router(notify.router, prefix="/api/notify", tags=["通知"])


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    # 初始化数据库
    init_database()
    
    print(f"{config.PLATFORM_CONFIG['name']} v{config.PLATFORM_CONFIG['version']} 启动成功")


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": config.PLATFORM_CONFIG["name"],
        "version": config.PLATFORM_CONFIG["version"],
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


# SPA fallback - 非/api路径返回对应HTML文件
@app.get("/{path:path}")
async def serve_spa(path: str):
    """SPA路由支持 - 匹配前端页面"""
    frontend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 尝试匹配具体HTML文件
    if path.endswith('.html') or path.endswith('.css') or path.endswith('.js'):
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path):
            return FileResponse(file_path)
    
    # 尝试匹配页面名称（如 merchant → merchant.html）
    html_path = os.path.join(frontend_dir, f"{path}.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    
    # 默认返回首页
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
