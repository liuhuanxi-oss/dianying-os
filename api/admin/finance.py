"""
店赢OS管理后台API - 财务中心
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/revenue")
async def get_revenue_trend(
    months: int = Query(12, ge=1, le=24)
):
    """获取收入趋势"""
    # 生成模拟收入趋势数据
    trend = [
        {"month": "2024-01", "amount": 1250000},
        {"month": "2024-02", "amount": 1380000},
        {"month": "2024-03", "amount": 1420000},
        {"month": "2024-04", "amount": 1560000},
        {"month": "2024-05", "amount": 1680000},
        {"month": "2024-06", "amount": 1750000},
        {"month": "2024-07", "amount": 1820000},
        {"month": "2024-08", "amount": 1950000},
        {"month": "2024-09", "amount": 2080000},
        {"month": "2024-10", "amount": 2250000},
        {"month": "2024-11", "amount": 2380000},
        {"month": "2024-12", "amount": 2560000},
    ]
    return api_response({"trend": trend[:months], "total": sum(t["amount"] for t in trend[:months])})


@router.get("/revenue/stats")
async def get_revenue_stats():
    """获取收入统计"""
    transactions = execute_query("""
        SELECT type, SUM(amount) as total, COUNT(*) as count 
        FROM transactions 
        WHERE status='success' 
        GROUP BY type
    """)
    
    total = execute_query("SELECT SUM(amount) as total FROM transactions WHERE status='success'")[0]["total"] or 0
    
    return api_response({
        "total": total,
        "by_type": transactions,
        "month": 2560000,
        "growth": 7.6
    })


@router.get("/billing")
async def list_billing(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    merchant: Optional[str] = None
):
    """获取账单列表"""
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if merchant:
        where_clauses.append("merchant LIKE ?")
        params.append(f"%{merchant}%")
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM transactions WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    bills = execute_query(f"SELECT * FROM transactions WHERE {where_sql} ORDER BY time DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": bills, "total": total, "page": page, "size": size})


@router.get("/billing/{bill_id}")
async def get_billing_detail(bill_id: str):
    """获取账单详情"""
    bills = execute_query("SELECT * FROM transactions WHERE id = ?", (bill_id,))
    if not bills:
        raise HTTPException(status_code=404, detail="账单不存在")
    return api_response(bills[0])


@router.post("/billing/{bill_id}/confirm")
async def confirm_billing(bill_id: str):
    """确认账单"""
    execute_update("UPDATE transactions SET status = 'success' WHERE id = ?", (bill_id,))
    return api_response(None, "账单已确认")


@router.get("/refund")
async def list_refunds(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取退款列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM refunds WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    refunds = execute_query(f"SELECT * FROM refunds WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": refunds, "total": total})


@router.post("/refund/{refund_id}/approve")
async def approve_refund(refund_id: int):
    """审批通过退款"""
    execute_update("UPDATE refunds SET status = 'approved' WHERE id = ?", (refund_id,))
    return api_response(None, "退款已审批通过")


@router.post("/refund/{refund_id}/reject")
async def reject_refund(refund_id: int, reason: str = ""):
    """审批拒绝退款"""
    execute_update("UPDATE refunds SET status = 'rejected' WHERE id = ?", (refund_id,))
    return api_response(None, "退款已拒绝")


@router.get("/invoice")
async def list_invoices(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取发票列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM invoices WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    invoices = execute_query(f"SELECT * FROM invoices WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": invoices, "total": total})


@router.post("/invoice")
async def create_invoice(
    merchant: str,
    invoice_type: str = "普票",
    amount: float = 0
):
    """创建发票申请"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO invoices (merchant, type, amount, status, apply_time)
        VALUES (?, ?, ?, 'pending', ?)
    """, (merchant, invoice_type, amount, now))
    return api_response({"id": cursor}, "发票申请已提交")


@router.put("/invoice/{invoice_id}")
async def update_invoice(invoice_id: int, status: str):
    """更新发票状态"""
    execute_update("UPDATE invoices SET status = ? WHERE id = ?", (status, invoice_id))
    return api_response(None, "发票状态已更新")
