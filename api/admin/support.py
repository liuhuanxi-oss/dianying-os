"""
店赢OS管理后台API - 客服支持
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


class TicketCreate(BaseModel):
    merchant: str
    type: str = ""
    title: str = ""
    priority: str = "medium"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    assignee: Optional[str] = None


@router.get("/tickets")
async def list_tickets(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    """获取工单列表"""
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


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """获取工单详情"""
    tickets = execute_query("SELECT * FROM tickets WHERE id = ?", (ticket_id,))
    if not tickets:
        raise HTTPException(status_code=404, detail="工单不存在")
    return api_response(tickets[0])


@router.post("/tickets")
async def create_ticket(ticket: TicketCreate):
    """创建工单"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    cursor = execute_insert("""
        INSERT INTO tickets (id, merchant, type, title, status, priority, create_time, assignee)
        VALUES (?, ?, ?, ?, 'open', ?, ?, '待分配')
    """, (f"TK{datetime.now().strftime('%Y%m%d')}{str(cursor).zfill(3)}" if False else f"TK{now[:4]+now[5:7]+now[8:10]}001", 
          ticket.merchant, ticket.type, ticket.title, ticket.priority, now))
    return api_response({"id": cursor}, "工单创建成功")


@router.put("/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, update: TicketUpdate):
    """更新工单"""
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


@router.get("/faq")
async def list_faq(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None
):
    """获取FAQ列表"""
    offset = (page - 1) * size
    where_sql = "category = ?" if category else "1=1"
    params = (category,) if category else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM faq WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    faqs = execute_query(f"SELECT * FROM faq WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": faqs, "total": total})


@router.post("/faq")
async def create_faq(
    category: str,
    question: str,
    answer: str
):
    """创建FAQ"""
    cursor = execute_insert("""
        INSERT INTO faq (category, question, answer, status)
        VALUES (?, ?, ?, 'published')
    """, (category, question, answer))
    return api_response({"id": cursor}, "FAQ创建成功")


@router.get("/satisfaction")
async def get_satisfaction():
    """获取满意度调研数据"""
    return api_response({
        "nps_score": 72,
        "promoters": 156,
        "passives": 42,
        "detractors": 12,
        "avg_score": 4.6,
        "total_responses": 210
    })
