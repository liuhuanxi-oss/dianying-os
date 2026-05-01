"""
店赢OS管理后台API - 支付交易
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/channels")
async def list_payment_channels():
    """获取支付通道列表"""
    channels = execute_query("SELECT * FROM payment_channels")
    return api_response({"items": channels})


@router.get("/channels/{channel_name}")
async def get_payment_channel(channel_name: str):
    """获取支付通道详情"""
    channels = execute_query("SELECT * FROM payment_channels WHERE name = ?", (channel_name,))
    if not channels:
        raise HTTPException(status_code=404, detail="通道不存在")
    return api_response(channels[0])


@router.put("/channels/{channel_name}")
async def update_payment_channel(channel_name: str, status: str = None, fee: float = None):
    """更新支付通道配置"""
    if status:
        execute_update("UPDATE payment_channels SET status = ? WHERE name = ?", (status, channel_name))
    return api_response(None, "通道配置已更新")


@router.get("/transactions")
async def list_transactions(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    type: Optional[str] = None,
    merchant: Optional[str] = None
):
    """获取交易流水"""
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if type:
        where_clauses.append("type = ?")
        params.append(type)
    if merchant:
        where_clauses.append("merchant LIKE ?")
        params.append(f"%{merchant}%")
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM transactions WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    transactions = execute_query(f"SELECT * FROM transactions WHERE {where_sql} ORDER BY time DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": transactions, "total": total, "page": page, "size": size})


@router.get("/transactions/{transaction_id}")
async def get_transaction(transaction_id: str):
    """获取交易详情"""
    transactions = execute_query("SELECT * FROM transactions WHERE id = ?", (transaction_id,))
    if not transactions:
        raise HTTPException(status_code=404, detail="交易不存在")
    return api_response(transactions[0])


@router.get("/fee-config")
async def get_fee_config():
    """获取费率配置"""
    pricing = execute_query("SELECT * FROM pricing")
    return api_response({"items": pricing})


@router.put("/fee-config/{version}")
async def update_fee_config(version: str, price: float = None, features: list = None):
    """更新费率配置"""
    if price is not None:
        execute_update("UPDATE pricing SET price = ? WHERE version = ?", (price, version))
    return api_response(None, "费率配置已更新")


@router.get("/split-payment")
async def list_split_payments(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取分账记录"""
    offset = (page - 1) * size
    transactions = execute_query(
        "SELECT * FROM transactions WHERE status='success' ORDER BY time DESC LIMIT ? OFFSET ?",
        (size, offset)
    )
    
    split_payments = []
    for t in transactions:
        split_payments.append({
            "id": len(split_payments) + 1,
            "transaction_id": t["id"],
            "merchant": t["merchant"],
            "amount": t["amount"],
            "platform_fee": round(t["amount"] * 0.06, 2),
            "agent_commission": round(t["amount"] * 0.04, 2),
            "actual_amount": round(t["amount"] * 0.90, 2)
        })
    
    return api_response({"items": split_payments})


@router.get("/reconciliation")
async def get_reconciliation(
    month: Optional[str] = Query(None, description="月份，如2024-12")
):
    """获取对账数据"""
    settlements = execute_query("SELECT * FROM settlement_records")
    total = sum(s["payable"] for s in settlements)
    settled = sum(s["actual"] for s in settlements if s["status"] == "settled")
    
    return api_response({
        "month": month or "2024-12",
        "settlements": settlements,
        "total_payable": total,
        "total_settled": settled,
        "pending": total - settled
    })


@router.post("/reconciliation/settle")
async def settle_commission(agent: str, month: str):
    """结算佣金"""
    execute_update(
        "UPDATE settlement_records SET status='settled', settle_time=datetime('now') WHERE agent=? AND month=?",
        (agent, month)
    )
    return api_response(None, "结算成功")
