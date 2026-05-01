"""
店赢OS Demo Server
FastAPI HTTP服务，用于接收Bot请求并生成海报

启动方式:
    cd demo-server
    pip install fastapi uvicorn
    python server.py

API端点:
    POST /api/generate-poster  - 生成海报
    GET  /api/health           - 健康检查
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os

from generators import PosterGenerator

# 创建应用
app = FastAPI(
    title="店赢OS Demo Server",
    description="AI Agent海报生成服务",
    version="1.0.0"
)

# CORS配置（允许跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化生成器
OUTPUT_DIR = "public/posters"
os.makedirs(OUTPUT_DIR, exist_ok=True)
generator = PosterGenerator(output_dir=OUTPUT_DIR)

# 挂载静态文件目录
if os.path.exists("public"):
    app.mount("/posters", StaticFiles(directory=OUTPUT_DIR), name="posters")

# ==================== 数据模型 ====================

class PosterRequest(BaseModel):
    """海报生成请求"""
    theme: str = "节日促销"
    title: str = "限时特惠"
    subtitle: str = "全场8折"
    style: str = "festival"  # romantic/festival/luxury/fresh/ocean
    store_name: str = "店赢OS"
    size_type: str = "poster"  # poster/square/wide
    logo_text: Optional[str] = None


class PosterResponse(BaseModel):
    """海报生成响应"""
    success: bool
    url: Optional[str] = None
    filename: Optional[str] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    service: str


# ==================== API端点 ====================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        service="店赢OS Demo Server"
    )


@app.post("/api/generate-poster", response_model=PosterResponse)
async def generate_poster(req: PosterRequest):
    """
    生成海报
    
    示例请求:
    ```json
    {
        "theme": "520情人节",
        "title": "甜蜜告白季",
        "subtitle": "限时8折 · 全场优惠",
        "style": "romantic",
        "store_name": "老码头火锅"
    }
    ```
    
    示例响应:
    ```json
    {
        "success": true,
        "url": "/posters/poster_romantic_1716200000.png",
        "filename": "poster_romantic_1716200000.png",
        "message": "海报生成成功"
    }
    ```
    """
    try:
        # 验证风格参数
        valid_styles = ["romantic", "festival", "luxury", "fresh", "ocean"]
        if req.style not in valid_styles:
            raise ValueError(f"不支持的风格: {req.style}，可选: {valid_styles}")
        
        # 验证尺寸参数
        valid_sizes = ["poster", "square", "wide"]
        if req.size_type not in valid_sizes:
            raise ValueError(f"不支持的尺寸: {req.size_type}，可选: {valid_sizes}")
        
        # 生成海报
        url = generator.generate(
            theme=req.theme,
            title=req.title,
            subtitle=req.subtitle,
            style=req.style,
            store_name=req.store_name,
            size_type=req.size_type,
            logo_text=req.logo_text
        )
        
        filename = os.path.basename(url)
        
        return PosterResponse(
            success=True,
            url=url,
            filename=filename,
            message="海报生成成功"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")


@app.get("/api/styles")
async def list_styles():
    """获取可用的风格列表"""
    return JSONResponse({
        "styles": [
            {
                "id": "romantic",
                "name": "浪漫粉",
                "description": "粉色系，适合情人节、520等浪漫节日"
            },
            {
                "id": "festival",
                "name": "中国红",
                "description": "红色系，适合春节、国庆等传统节日"
            },
            {
                "id": "luxury",
                "name": "轻奢金",
                "description": "黑金色系，适合高端品牌、会员活动"
            },
            {
                "id": "fresh",
                "name": "清新绿",
                "description": "绿色系，适合新品上市、健康餐饮"
            },
            {
                "id": "ocean",
                "name": "海洋蓝",
                "description": "蓝色系，适合游泳馆、水上乐园等"
            }
        ]
    })


@app.get("/api/sizes")
async def list_sizes():
    """获取可用的尺寸列表"""
    return JSONResponse({
        "sizes": [
            {
                "id": "poster",
                "name": "手机海报",
                "width": 1080,
                "height": 1920,
                "description": "适合朋友圈、小程序轮播"
            },
            {
                "id": "square",
                "name": "正方形",
                "width": 1080,
                "height": 1080,
                "description": "适合朋友圈、微博"
            },
            {
                "id": "wide",
                "name": "横版海报",
                "width": 1920,
                "height": 1080,
                "description": "适合外卖平台banner"
            }
        ]
    })


# ==================== 主程序 ====================

def main():
    """启动服务器"""
    print("🚀 启动店赢OS Demo Server...")
    print("📍 API文档: http://localhost:8080/docs")
    print("📍 健康检查: http://localhost:8080/api/health")
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        reload=False,
        log_level="info"
    )


if __name__ == "__main__":
    main()
