"""
店赢OS管理后台API - 系统设置
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/roles")
async def list_roles(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取角色列表"""
    offset = (page - 1) * size
    roles = execute_query("SELECT * FROM roles ORDER BY id LIMIT ? OFFSET ?", (size, offset))
    total = execute_query("SELECT COUNT(*) as cnt FROM roles")[0]["cnt"]
    
    # 解析permissions JSON
    for r in roles:
        r["permissions"] = json.loads(r["permissions"]) if r["permissions"] else []
    
    return api_response({"items": roles, "total": total})


@router.get("/roles/{role_id}")
async def get_role(role_id: int):
    """获取角色详情"""
    roles = execute_query("SELECT * FROM roles WHERE id = ?", (role_id,))
    if not roles:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    role = roles[0]
    role["permissions"] = json.loads(role["permissions"]) if role["permissions"] else []
    return api_response(role)


@router.post("/roles")
async def create_role(name: str, level: str = "", permissions: list = []):
    """创建角色"""
    cursor = execute_insert("""
        INSERT INTO roles (name, level, permissions, users)
        VALUES (?, ?, ?, 0)
    """, (name, level, json.dumps(permissions)))
    return api_response({"id": cursor}, "角色创建成功")


@router.put("/roles/{role_id}")
async def update_role(role_id: int, name: str = None, permissions: list = None):
    """更新角色"""
    updates = []
    params = []
    
    if name:
        updates.append("name = ?")
        params.append(name)
    if permissions is not None:
        updates.append("permissions = ?")
        params.append(json.dumps(permissions))
    
    if updates:
        params.append(role_id)
        execute_update(f"UPDATE roles SET {', '.join(updates)} WHERE id = ?", tuple(params))
    
    return api_response(None, "角色已更新")


@router.get("/operation-logs")
async def list_operation_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    operator: Optional[str] = None,
    type: Optional[str] = None
):
    """获取操作日志"""
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if operator:
        where_clauses.append("operator LIKE ?")
        params.append(f"%{operator}%")
    if type:
        where_clauses.append("type = ?")
        params.append(type)
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM operation_logs WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    logs = execute_query(f"SELECT * FROM operation_logs WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": logs, "total": total})


@router.get("/pricing")
async def get_pricing():
    """获取定价配置"""
    pricing = execute_query("SELECT * FROM pricing")
    for p in pricing:
        p["features"] = json.loads(p["features"]) if p["features"] else []
    return api_response({"items": pricing})


@router.put("/pricing/{version}")
async def update_pricing(version: str, price: float = None, features: list = None):
    """更新定价配置"""
    updates = []
    params = []
    
    if price is not None:
        updates.append("price = ?")
        params.append(price)
    if features is not None:
        updates.append("features = ?")
        params.append(json.dumps(features))
    
    if updates:
        params.append(version)
        execute_update(f"UPDATE pricing SET {', '.join(updates)} WHERE version = ?", tuple(params))
    
    return api_response(None, "定价已更新")


@router.get("/notifications")
async def list_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取消息通知列表"""
    # 模拟通知数据
    notifications = [
        {"id": 1, "title": "系统更新通知", "content": "平台将于今晚22:00进行例行维护", "type": "system", "status": "unread", "create_time": "2024-12-03 10:00"},
        {"id": 2, "title": "新功能上线", "content": "AI智能客服2.0版本已上线", "type": "feature", "status": "read", "create_time": "2024-12-02 15:30"},
        {"id": 3, "title": "数据备份提醒", "content": "请及时导出重要数据", "type": "reminder", "status": "unread", "create_time": "2024-12-01 09:00"},
    ]
    
    if status:
        notifications = [n for n in notifications if n["status"] == status]
    
    return api_response({"items": notifications, "total": len(notifications)})


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    """标记通知已读"""
    return api_response(None, "已标记为已读")
