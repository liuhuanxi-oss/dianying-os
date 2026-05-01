"""
店赢OS管理后台API - 内容运营
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter(tags=["内容运营"])


class KnowledgeArticle(BaseModel):
    """知识库文章模型"""
    id: int = Field(..., description="文章ID", example=1)
    title: str = Field(..., description="标题", example="餐饮行业AI营销技巧")
    category: str = Field(..., description="分类", example="catering")
    content: str = Field(..., description="内容", example="...")
    status: str = Field(..., description="状态", example="published")
    update_time: str = Field(..., description="更新时间", example="2024-12-01 10:00:00")


class AnnouncementCreate(BaseModel):
    """创建公告请求"""
    title: str = Field(..., description="公告标题", example="系统升级通知")
    content: str = Field("", description="公告内容", example="平台将于今晚22:00进行例行维护...")
    scope: str = Field("all", description="发布范围", example="all")


class ActivityCreate(BaseModel):
    """创建活动请求"""
    title: str = Field(..., description="活动标题", example="双十一促销活动")
    type: str = Field("", description="活动类型", example="promotion")
    start_time: str = Field("", description="开始时间", example="2024-11-01 00:00:00")
    end_time: str = Field("", description="结束时间", example="2024-11-11 23:59:59")


class AITemplate(BaseModel):
    """AI模板模型"""
    id: int = Field(..., description="模板ID", example=1)
    name: str = Field(..., description="模板名称", example="智能客服回复模板")
    category: str = Field(..., description="分类", example="customer_service")
    prompt: str = Field(..., description="提示词模板", example="你是...")
    usage_count: int = Field(..., description="使用次数", example=1250)


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/knowledge",
    summary="获取知识库列表",
    description="分页获取知识库文章列表，支持按分类、状态筛选",
    responses={
        200: {"description": "成功获取知识库列表"}
    }
)
async def list_knowledge(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    category: Optional[str] = Query(None, description="文章分类", example="catering"),
    status: Optional[str] = Query(None, description="状态", example="published")
):
    """
    获取知识库列表
    
    **筛选条件：**
    - `category`: catering(餐饮)/retail(零售)/entertainment(休娱)等
    - `status`: draft(草稿)/published(已发布)/archived(已归档)
    
    **知识库分类：**
    - 操作指南
    - 行业解决方案
    - 常见问题
    - 更新日志
    """
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if category:
        where_clauses.append("category = ?")
        params.append(category)
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM knowledge WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    articles = execute_query(f"SELECT * FROM knowledge WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": articles, "total": total})


@router.get("/knowledge/{article_id}",
    summary="获取知识库文章详情",
    description="根据文章ID获取详细信息",
    responses={
        200: {"description": "成功获取文章详情"},
        404: {"description": "文章不存在"}
    }
)
async def get_knowledge_article(
    article_id: int = Path(..., description="文章ID", example=1)
):
    """
    获取知识库文章详情
    
    **路径参数：**
    - `article_id`: 文章唯一标识
    """
    articles = execute_query("SELECT * FROM knowledge WHERE id = ?", (article_id,))
    if not articles:
        raise HTTPException(status_code=404, detail="文章不存在")
    return api_response(articles[0])


@router.post("/knowledge",
    summary="创建知识库文章",
    description="创建新的知识库文章",
    responses={
        200: {"description": "创建成功"}
    }
)
async def create_knowledge_article(
    title: str = Query(..., description="文章标题", example="新功能使用指南"),
    category: str = Query("catering", description="文章分类", example="operation"),
    content: str = Query("", description="文章内容")
):
    """
    创建知识库文章
    
    **请求参数：**
    - `title`: 文章标题(必填)
    - `category`: 分类
    - `content`: 文章内容
    
    **业务规则：**
    - 创建后状态为draft(草稿)
    - 需审核后才能发布
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO knowledge (title, category, status, update_time)
        VALUES (?, ?, 'draft', ?)
    """, (title, category, now))
    return api_response({"id": cursor}, "文章创建成功")


@router.put("/knowledge/{article_id}",
    summary="更新知识库文章",
    description="更新文章状态或内容",
    responses={
        200: {"description": "更新成功"}
    }
)
async def update_knowledge_article(
    article_id: int = Path(..., description="文章ID", example=1),
    status: Optional[str] = Query(None, description="状态", example="published")
):
    """
    更新知识库文章
    
    **可更新字段：**
    - `status`: published(发布)/draft(草稿)/archived(归档)
    """
    if status:
        execute_update("UPDATE knowledge SET status = ? WHERE id = ?", (status, article_id))
    return api_response(None, "文章已更新")


@router.get("/ai-templates",
    summary="获取AI模板列表",
    description="获取平台预设的AI提示词模板",
    responses={
        200: {"description": "成功获取模板列表"}
    }
)
async def list_ai_templates(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    category: Optional[str] = Query(None, description="模板分类", example="marketing")
):
    """
    获取AI模板列表
    
    **模板分类：**
    - `customer_service`: 智能客服
    - `marketing`: 营销推广
    - `operation`: 运营分析
    - `design`: 设计素材
    """
    offset = (page - 1) * size
    where_sql = "category = ?" if category else "1=1"
    params = (category,) if category else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM ai_templates WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    templates = execute_query(f"SELECT * FROM ai_templates WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": templates, "total": total})


@router.get("/announcements",
    summary="获取公告列表",
    description="分页获取系统公告列表",
    responses={
        200: {"description": "成功获取公告列表"}
    }
)
async def list_announcements(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="状态", example="published")
):
    """
    获取公告列表
    
    **公告类型：**
    - system: 系统公告
    - feature: 新功能
    - maintenance: 维护通知
    - activity: 活动通知
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM announcements WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    announcements = execute_query(f"SELECT * FROM announcements WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": announcements, "total": total})


@router.post("/announcements",
    summary="创建公告",
    description="发布新的系统公告",
    responses={
        200: {"description": "创建成功"}
    }
)
async def create_announcement(
    announcement: AnnouncementCreate = ...
):
    """
    创建公告
    
    **请求参数：**
    - `title`: 公告标题
    - `content`: 公告内容
    - `scope`: 发布范围(all/vip/specific)
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO announcements (title, content, scope, status, create_time)
        VALUES (?, ?, ?, 'published', ?)
    """, (announcement.title, announcement.content, announcement.scope, now))
    return api_response({"id": cursor}, "公告创建成功")


@router.put("/announcements/{announcement_id}",
    summary="更新公告",
    description="更新公告状态",
    responses={
        200: {"description": "更新成功"}
    }
)
async def update_announcement(
    announcement_id: int = Path(..., description="公告ID", example=1),
    status: Optional[str] = Query(None, description="状态", example="archived")
):
    """
    更新公告
    
    **状态：**
    - published: 已发布
    - archived: 已归档
    """
    if status:
        execute_update("UPDATE announcements SET status = ? WHERE id = ?", (status, announcement_id))
    return api_response(None, "公告已更新")


@router.delete("/announcements/{announcement_id}",
    summary="删除公告",
    description="删除指定公告",
    responses={
        200: {"description": "删除成功"}
    }
)
async def delete_announcement(
    announcement_id: int = Path(..., description="公告ID", example=1)
):
    """
    删除公告
    
    **警告：此操作不可恢复！**
    """
    execute_delete("DELETE FROM announcements WHERE id = ?", (announcement_id,))
    return api_response(None, "公告已删除")


@router.get("/activities",
    summary="获取运营活动列表",
    description="分页获取运营活动列表",
    responses={
        200: {"description": "成功获取活动列表"}
    }
)
async def list_activities(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="状态", example="running")
):
    """
    获取运营活动列表
    
    **活动状态：**
    - draft: 草稿
    - scheduled: 已排期
    - running: 进行中
    - ended: 已结束
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM activities WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    activities = execute_query(f"SELECT * FROM activities WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": activities, "total": total})


@router.post("/activities",
    summary="创建运营活动",
    description="创建新的运营活动",
    responses={
        200: {"description": "创建成功"}
    }
)
async def create_activity(
    activity: ActivityCreate = ...
):
    """
    创建运营活动
    
    **请求参数：**
    - `title`: 活动标题
    - `type`: 活动类型
    - `start_time`: 开始时间
    - `end_time`: 结束时间
    """
    cursor = execute_insert("""
        INSERT INTO activities (title, type, start_time, end_time, status)
        VALUES (?, ?, ?, ?, 'draft')
    """, (activity.title, activity.type, activity.start_time, activity.end_time))
    return api_response({"id": cursor}, "活动创建成功")


@router.put("/activities/{activity_id}",
    summary="更新运营活动",
    description="更新活动状态或信息",
    responses={
        200: {"description": "更新成功"}
    }
)
async def update_activity(
    activity_id: int = Path(..., description="活动ID", example=1),
    status: Optional[str] = Query(None, description="状态", example="running")
):
    """
    更新运营活动
    
    **状态流转：**
    draft → scheduled → running → ended
    """
    if status:
        execute_update("UPDATE activities SET status = ? WHERE id = ?", (status, activity_id))
    return api_response(None, "活动已更新")
