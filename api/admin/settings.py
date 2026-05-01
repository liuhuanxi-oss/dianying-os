"""
店赢OS管理后台API - 系统设置
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter(tags=["系统设置"])


class Role(BaseModel):
    """角色"""
    id: int
    name: str
    level: str
    permissions: List[str]
    users: int


class OperationLog(BaseModel):
    """操作日志"""
    id: int
    operator: str
    type: str
    target: str
    action: str
    time: str


class PricingPlan(BaseModel):
    """定价方案"""
    version: str
    price: float
    features: List[str]


class Notification(BaseModel):
    """系统通知"""
    id: int
    title: str
    content: str
    type: str
    status: str
    create_time: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/roles",
    summary="获取角色列表",
    description="分页获取系统角色列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_roles(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取角色列表
    
    **系统角色：**
    - 超级管理员
    - 运营管理员
    - 财务管理员
    - 客服管理员
    - 普通用户
    """
    offset = (page - 1) * size
    roles = execute_query("SELECT * FROM roles ORDER BY id LIMIT ? OFFSET ?", (size, offset))
    total = execute_query("SELECT COUNT(*) as cnt FROM roles")[0]["cnt"]
    
    # 解析permissions JSON
    for r in roles:
        r["permissions"] = json.loads(r["permissions"]) if r["permissions"] else []
    
    return api_response({"items": roles, "total": total})


@router.get("/roles/{role_id}",
    summary="获取角色详情",
    description="获取指定角色的详细信息和权限配置",
    responses={200: {"description": "成功获取详情"}, 404: {"description": "角色不存在"}}
)
async def get_role(
    role_id: int = Path(..., description="角色ID")
):
    """获取角色详情"""
    roles = execute_query("SELECT * FROM roles WHERE id = ?", (role_id,))
    if not roles:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    role = roles[0]
    role["permissions"] = json.loads(role["permissions"]) if role["permissions"] else []
    return api_response(role)


@router.post("/roles",
    summary="创建角色",
    description="创建新的系统角色",
    responses={200: {"description": "创建成功"}}
)
async def create_role(
    name: str = Query(..., description="角色名称"),
    level: str = Query("", description="角色级别"),
    permissions: List[str] = Query([], description="权限列表")
):
    """
    创建角色
    
    **权限项：**
    - merchant_view: 查看商户
    - merchant_edit: 编辑商户
    - finance_view: 查看财务
    - finance_edit: 编辑财务
    - system_config: 系统配置
    """
    cursor = execute_insert("""
        INSERT INTO roles (name, level, permissions, users)
        VALUES (?, ?, ?, 0)
    """, (name, level, json.dumps(permissions)))
    return api_response({"id": cursor}, "角色创建成功")


@router.put("/roles/{role_id}",
    summary="更新角色",
    description="更新角色名称或权限配置",
    responses={200: {"description": "更新成功"}}
)
async def update_role(
    role_id: int = Path(..., description="角色ID"),
    name: Optional[str] = Query(None, description="角色名称"),
    permissions: Optional[List[str]] = Query(None, description="权限列表")
):
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


@router.get("/operation-logs",
    summary="获取操作日志",
    description="分页获取系统操作日志",
    responses={200: {"description": "成功获取日志"}}
)
async def list_operation_logs(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    operator: Optional[str] = Query(None, description="操作人"),
    type: Optional[str] = Query(None, description="操作类型")
):
    """
    获取操作日志
    
    **操作类型：**
    - create: 创建
    - update: 更新
    - delete: 删除
    - login: 登录
    - config: 配置变更
    """
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


@router.get("/pricing",
    summary="获取定价配置",
    description="获取平台各版本的定价配置",
    responses={200: {"description": "成功获取配置"}}
)
async def get_pricing():
    """
    获取定价配置
    
    **版本说明：**
    - 免费版: 基础功能
    - 专业版: 高级功能
    - 旗舰版: 全部功能
    """
    pricing = execute_query("SELECT * FROM pricing")
    for p in pricing:
        p["features"] = json.loads(p["features"]) if p["features"] else []
    return api_response({"items": pricing})


@router.put("/pricing/{version}",
    summary="更新定价配置",
    description="更新指定版本的定价配置",
    responses={200: {"description": "更新成功"}}
)
async def update_pricing(
    version: str = Path(..., description="版本"),
    price: Optional[float] = Query(None, description="月费价格(元)"),
    features: Optional[List[str]] = Query(None, description="功能列表")
):
    """
    更新定价配置
    
    **价格范围：**
    - 免费版: 0元
    - 专业版: 99-299元
    - 旗舰版: 299-999元
    """
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


@router.get("/notifications",
    summary="获取消息通知列表",
    description="分页获取系统消息通知列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_notifications(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="状态")
):
    """
    获取消息通知列表
    
    **通知类型：**
    - system: 系统通知
    - feature: 新功能
    - reminder: 提醒
    """
    notifications = [
        {"id": 1, "title": "系统更新通知", "content": "平台将于今晚22:00进行例行维护", "type": "system", "status": "unread", "create_time": "2024-12-03 10:00"},
        {"id": 2, "title": "新功能上线", "content": "AI智能客服2.0版本已上线", "type": "feature", "status": "read", "create_time": "2024-12-02 15:30"},
        {"id": 3, "title": "数据备份提醒", "content": "请及时导出重要数据", "type": "reminder", "status": "unread", "create_time": "2024-12-01 09:00"},
    ]
    
    if status:
        notifications = [n for n in notifications if n["status"] == status]
    
    return api_response({"items": notifications, "total": len(notifications)})


@router.post("/notifications/{notification_id}/read",
    summary="标记通知已读",
    description="将指定通知标记为已读",
    responses={200: {"description": "标记成功"}}
)
async def mark_notification_read(
    notification_id: int = Path(..., description="通知ID")
):
    """标记通知已读"""
    return api_response(None, "已标记为已读")
