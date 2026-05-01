"""
店赢OS - API代理服务器
同时提供FastAPI后端和静态文件服务
用于开发环境 - 统一访问前端和API

启动方式: python api_proxy.py
访问地址: http://localhost:3000
"""
import os
import sys
import asyncio
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / 'api'))

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 导入现有API
from main import app as api_app

# 创建主应用
app = FastAPI(
    title="店赢OS管理后台(完整版)",
    description="包含FastAPI后端 + 静态前端",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.mount("/api", api_app)

# 获取静态文件目录
static_dir = project_root


@app.get("/")
async def serve_index():
    """提供admin.html"""
    index_path = static_dir / "admin.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "admin.html not found"}


@app.get("/index.html")
async def serve_index_html():
    """提供index.html"""
    index_path = static_dir / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "index.html not found"}


@app.get("/js/{filename}")
async def serve_js(filename: str):
    """提供JS文件"""
    js_path = static_dir / "js" / filename
    if js_path.exists():
        return FileResponse(str(js_path), media_type="application/javascript")
    return {"error": "JS file not found"}


@app.get("/css/{filename}")
async def serve_css(filename: str):
    """提供CSS文件"""
    css_path = static_dir / "css" / filename
    if css_path.exists():
        return FileResponse(str(css_path), media_type="text/css")
    return {"error": "CSS file not found"}


@app.get("/assets/{filepath:path}")
async def serve_assets(filepath: str):
    """提供静态资源"""
    asset_path = static_dir / "assets" / filepath
    if asset_path.exists():
        return FileResponse(str(asset_path))
    return {"error": "Asset not found"}


# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "dyos-admin-full",
        "api_status": "running",
        "static_status": "running"
    }


if __name__ == "__main__":
    print("=" * 60)
    print("店赢OS管理后台 - 完整版开发服务器")
    print("=" * 60)
    print("前端页面: http://localhost:3000/admin.html")
    print("API文档:  http://localhost:3000/api/docs")
    print("健康检查: http://localhost:3000/health")
    print("=" * 60)
    print()
    print("按 Ctrl+C 停止服务器")
    print()
    
    uvicorn.run(
        "api_proxy:app",
        host="0.0.0.0",
        port=3000,
        reload=False,
        log_level="info"
    )
