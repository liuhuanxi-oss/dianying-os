"""
店赢OS管理后台API - FastAPI主入口
店赢OS是AI门店运营SaaS平台，为管理后台提供RESTful JSON API
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


app = FastAPI(
    title="店赢OS管理后台API",
    description="店赢OS是AI门店运营SaaS平台，为管理后台54个功能模块提供RESTful JSON API接口",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
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


@app.get("/")
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


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": "dyos-admin-api"}


# 注册管理后台路由
app.include_router(admin_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
