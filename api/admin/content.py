"""
店赢OS管理后台API - 内容运营
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


class AnnouncementCreate(BaseModel):
    title: str
    content: str = ""
    scope: str = "all"


class ActivityCreate(BaseModel):
    title: str
    type: str = ""
    start_time: str = ""
    end_time: str = ""


@router.get("/knowledge")
async def list_knowledge(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None
):
    """获取知识库列表"""
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


@router.get("/knowledge/{article_id}")
async def get_knowledge_article(article_id: int):
    """获取知识库文章详情"""
    articles = execute_query("SELECT * FROM knowledge WHERE id = ?", (article_id,))
    if not articles:
        raise HTTPException(status_code=404, detail="文章不存在")
    return api_response(articles[0])


@router.post("/knowledge")
async def create_knowledge_article(
    title: str,
    category: str = "catering",
    content: str = ""
):
    """创建知识库文章"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO knowledge (title, category, status, update_time)
        VALUES (?, ?, 'draft', ?)
    """, (title, category, now))
    return api_response({"id": cursor}, "文章创建成功")


@router.put("/knowledge/{article_id}")
async def update_knowledge_article(article_id: int, status: str = None):
    """更新知识库文章"""
    if status:
        execute_update("UPDATE knowledge SET status = ? WHERE id = ?", (status, article_id))
    return api_response(None, "文章已更新")


@router.get("/ai-templates")
async def list_ai_templates(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None
):
    """获取AI模板列表"""
    offset = (page - 1) * size
    where_sql = "category = ?" if category else "1=1"
    params = (category,) if category else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM ai_templates WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    templates = execute_query(f"SELECT * FROM ai_templates WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": templates, "total": total})


@router.get("/announcements")
async def list_announcements(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取公告列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM announcements WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    announcements = execute_query(f"SELECT * FROM announcements WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": announcements, "total": total})


@router.post("/announcements")
async def create_announcement(announcement: AnnouncementCreate):
    """创建公告"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO announcements (title, content, scope, status, create_time)
        VALUES (?, ?, ?, 'published', ?)
    """, (announcement.title, announcement.content, announcement.scope, now))
    return api_response({"id": cursor}, "公告创建成功")


@router.put("/announcements/{announcement_id}")
async def update_announcement(announcement_id: int, status: str = None):
    """更新公告"""
    if status:
        execute_update("UPDATE announcements SET status = ? WHERE id = ?", (status, announcement_id))
    return api_response(None, "公告已更新")


@router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: int):
    """删除公告"""
    execute_delete("DELETE FROM announcements WHERE id = ?", (announcement_id,))
    return api_response(None, "公告已删除")


@router.get("/activities")
async def list_activities(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取运营活动列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM activities WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    activities = execute_query(f"SELECT * FROM activities WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": activities, "total": total})


@router.post("/activities")
async def create_activity(activity: ActivityCreate):
    """创建运营活动"""
    cursor = execute_insert("""
        INSERT INTO activities (title, type, start_time, end_time, status)
        VALUES (?, ?, ?, ?, 'draft')
    """, (activity.title, activity.type, activity.start_time, activity.end_time))
    return api_response({"id": cursor}, "活动创建成功")


@router.put("/activities/{activity_id}")
async def update_activity(activity_id: int, status: str = None):
    """更新运营活动"""
    if status:
        execute_update("UPDATE activities SET status = ? WHERE id = ?", (status, activity_id))
    return api_response(None, "活动已更新")
