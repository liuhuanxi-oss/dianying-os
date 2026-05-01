"""
店赢OS管理后台API - 客服支持
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update

router = APIRouter(tags=["客服支持"])


class TicketCreate(BaseModel):
    """创建工单"""
    merchant: str = Field(..., description="商户名称")
    type: str = Field("", description="工单类型")
    title: str = Field("", description="工单标题")
    priority: str = Field("medium", description="优先级: low/medium/high/urgent")


class TicketUpdate(BaseModel):
    """更新工单"""
    status: Optional[str] = None
    assignee: Optional[str] = None


class TicketResponse(BaseModel):
    """工单响应"""
    id: str
    merchant: str
    type: str
    title: str
    status: str
    priority: str
    create_time: str
    assignee: str


class FAQResponse(BaseModel):
    """FAQ响应"""
    id: int
    category: str
    question: str
    answer: str
    status: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/tickets",
    summary="获取工单列表",
    description="分页获取客服工单列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_tickets(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="状态"),
    priority: Optional[str] = Query(None, description="优先级")
):
    """
    获取工单列表
    
    **工单状态：**
    - open: 待处理
    - processing: 处理中
    - pending: 等待用户
    - resolved: 已解决
    - closed: 已关闭
    
    **工单类型：**
    - technical: 技术问题
    - billing: 账单问题
    - feature: 功能咨询
    - complaint: 投诉建议
    """
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if priority:
        where_clauses.append("priority = ?")
        params.append(priority)
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM tickets WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    tickets = execute_query(f"SELECT * FROM tickets WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": tickets, "total": total, "page": page, "size": size})


@router.get("/tickets/{ticket_id}",
    summary="获取工单详情",
    description="获取指定工单的详细信息",
    responses={200: {"description": "成功获取详情"}, 404: {"description": "工单不存在"}}
)
async def get_ticket(
    ticket_id: str = Path(..., description="工单ID")
):
    """获取工单详情"""
    tickets = execute_query("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    if not tickets:
        raise HTTPException(status_code=404, detail="工单不存在")
    return api_response(tickets[0])


@router.post("/tickets",
    summary="创建工单",
    description="创建新的客服工单",
    responses={200: {"description": "创建成功"}}
)
async def create_ticket(
    ticket: TicketCreate = ...
):
    """
    创建工单
    
    **请求参数：**
    - merchant: 商户名称
    - type: 工单类型
    - title: 工单标题
    - priority: 优先级
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    cursor = execute_insert("""
        INSERT INTO tickets (id, merchant, type, title, status, priority, create_time, assignee)
        VALUES (?, ?, ?, ?, 'open', ?, ?, '待分配')
    """, (f"TK{now[:4]+now[5:7]+now[8:10]}001", 
          ticket.merchant, ticket.type, ticket.title, ticket.priority, now))
    return api_response({"id": cursor}, "工单创建成功")


@router.put("/tickets/{ticket_id}",
    summary="更新工单",
    description="更新工单状态或分配处理人",
    responses={200: {"description": "更新成功"}}
)
async def update_ticket(
    ticket_id: str = Path(..., description="工单ID"),
    update: TicketUpdate = ...
):
    """
    更新工单
    
    **可更新字段：**
    - status: 工单状态
    - assignee: 处理人
    """
    updates = []
    params = []
    
    if update.status:
        updates.append("status = ?")
        params.append(update.status)
    if update.assignee:
        updates.append("assignee = ?")
        params.append(update.assignee)
    
    if updates:
        params.append(ticket_id)
        execute_update(f"UPDATE tickets SET {', '.join(updates)} WHERE id = ?", tuple(params))
    
    return api_response(None, "工单已更新")


@router.get("/faq",
    summary="获取FAQ列表",
    description="分页获取常见问题列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_faq(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    category: Optional[str] = Query(None, description="分类")
):
    """
    获取FAQ列表
    
    **FAQ分类：**
    - getting_started: 入门指南
    - billing: 账单相关
    - technical: 技术问题
    - account: 账户问题
    """
    offset = (page - 1) * size
    where_sql = "category = ?" if category else "1=1"
    params = (category,) if category else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM faq WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    faqs = execute_query(f"SELECT * FROM faq WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": faqs, "total": total})


@router.post("/faq",
    summary="创建FAQ",
    description="创建新的常见问题",
    responses={200: {"description": "创建成功"}}
)
async def create_faq(
    category: str = Query(..., description="分类"),
    question: str = Query(..., description="问题"),
    answer: str = Query(..., description="答案")
):
    """创建FAQ"""
    cursor = execute_insert("""
        INSERT INTO faq (category, question, answer, status)
        VALUES (?, ?, ?, 'published')
    """, (category, question, answer))
    return api_response({"id": cursor}, "FAQ创建成功")


@router.get("/satisfaction",
    summary="获取满意度调研数据",
    description="获取客服满意度调研统计数据",
    responses={200: {"description": "成功获取数据"}}
)
async def get_satisfaction():
    """
    获取满意度调研数据
    
    **返回指标：**
    - NPS评分
    - 推荐者/被动者/贬损者数量
    - 平均评分
    - 反馈总数
    """
    return api_response({
        "nps_score": 72,
        "promoters": 156,
        "passives": 42,
        "detractors": 12,
        "avg_score": 4.6,
        "total_responses": 210
    })
