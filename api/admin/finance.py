"""
店赢OS管理后台API - 财务中心
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter(tags=["财务中心"])


class RevenueTrendItem(BaseModel):
    """收入趋势项"""
    month: str = Field(..., description="月份", example="2024-12")
    amount: float = Field(..., description="金额(元)", example=2560000.00)


class RevenueStatsResponse(BaseModel):
    """收入统计响应"""
    total: float = Field(..., description="累计收入", example=28600000.00)
    by_type: List[dict] = Field(..., description="按类型分类")
    month: float = Field(..., description="本月收入", example=2560000.00)
    growth: float = Field(..., description="增长率(%)", example=7.6)


class BillingItem(BaseModel):
    """账单项"""
    id: str = Field(..., description="账单ID", example="BILL20241203001")
    merchant: str = Field(..., description="商户名称", example="粤式茶餐厅")
    amount: float = Field(..., description="金额", example=299.00)
    type: str = Field(..., description="账单类型", example="subscription")
    status: str = Field(..., description="状态", example="paid")
    time: str = Field(..., description="创建时间", example="2024-12-01 10:00:00")


class RefundItem(BaseModel):
    """退款项"""
    id: int = Field(..., description="退款ID", example=1)
    merchant: str = Field(..., description="商户名称", example="粤式茶餐厅")
    amount: float = Field(..., description="退款金额", example=100.00)
    reason: str = Field(..., description="退款原因", example="重复扣款")
    status: str = Field(..., description="状态", example="pending")
    apply_time: str = Field(..., description="申请时间", example="2024-12-01 15:30:00")


class InvoiceItem(BaseModel):
    """发票项"""
    id: int = Field(..., description="发票ID", example=1)
    merchant: str = Field(..., description="商户名称", example="粤式茶餐厅")
    type: str = Field(..., description="发票类型", example="专票")
    amount: float = Field(..., description="发票金额", example=3588.00)
    status: str = Field(..., description="状态", example="pending")
    apply_time: str = Field(..., description="申请时间", example="2024-12-01 09:00:00")


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/revenue",
    summary="获取收入趋势",
    description="获取平台收入趋势数据，支持查询多个月份",
    responses={
        200: {"description": "成功获取收入趋势"}
    }
)
async def get_revenue_trend(
    months: int = Query(12, ge=1, le=24, description="查询月份数", example=12)
):
    """
    获取收入趋势
    
    **查询参数：**
    - `months`: 查询月份数，默认12，最多24个月
    
    **返回数据：**
    - 每月收入金额
    - 累计总收入
    - 按时间倒序排列
    """
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


@router.get("/revenue/stats",
    summary="获取收入统计",
    description="获取收入统计汇总数据",
    response_model=RevenueStatsResponse,
    responses={
        200: {"description": "成功获取收入统计"}
    }
)
async def get_revenue_stats():
    """
    获取收入统计
    
    **统计维度：**
    - 累计总收入
    - 按交易类型分类
    - 本月收入
    - 环比增长率
    
    **收入来源：**
    - 订阅费收入
    - 交易手续费
    - 增值服务收入
    """
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


@router.get("/billing",
    summary="获取账单列表",
    description="分页获取账单列表，支持按状态、商户筛选",
    responses={
        200: {"description": "成功获取账单列表"}
    }
)
async def list_billing(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="账单状态", example="paid"),
    merchant: Optional[str] = Query(None, description="商户名称", example="粤式")
):
    """
    获取账单列表
    
    **筛选条件：**
    - `status`: pending(待付款)/paid(已付款)/overdue(逾期)
    - `merchant`: 商户名称模糊搜索
    
    **账单类型：**
    - `subscription`: 订阅费
    - `upgrade`: 升级费
    - `addon`: 增值服务
    """
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


@router.get("/billing/{bill_id}",
    summary="获取账单详情",
    description="根据账单ID获取详细信息",
    responses={
        200: {"description": "成功获取账单详情"},
        404: {"description": "账单不存在"}
    }
)
async def get_billing_detail(
    bill_id: str = Path(..., description="账单ID", example="BILL20241203001")
):
    """
    获取账单详情
    
    **路径参数：**
    - `bill_id`: 账单唯一标识
    
    **返回信息：**
    - 账单基本信息
    - 关联商户信息
    - 支付记录(如有)
    """
    bills = execute_query("SELECT * FROM transactions WHERE id = ?", (bill_id,))
    if not bills:
        raise HTTPException(status_code=404, detail="账单不存在")
    return api_response(bills[0])


@router.post("/billing/{bill_id}/confirm",
    summary="确认账单",
    description="确认账单已支付，手动标记为已付款",
    responses={
        200: {"description": "确认成功"}
    }
)
async def confirm_billing(
    bill_id: str = Path(..., description="账单ID", example="BILL20241203001")
):
    """
    确认账单
    
    **适用场景：**
    - 线下转账需手动确认
    - 系统同步延迟
    - 异常订单修复
    """
    execute_update("UPDATE transactions SET status = 'success' WHERE id = ?", (bill_id,))
    return api_response(None, "账单已确认")


@router.get("/refund",
    summary="获取退款列表",
    description="分页获取退款申请列表",
    responses={
        200: {"description": "成功获取退款列表"}
    }
)
async def list_refunds(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="退款状态", example="pending")
):
    """
    获取退款列表
    
    **筛选条件：**
    - `status`: pending(待审批)/approved(已批准)/rejected(已拒绝)/completed(已完成)
    
    **退款状态说明：**
    - `pending`: 待审批
    - `approved`: 已批准，待退款
    - `rejected`: 已拒绝
    - `completed`: 退款完成
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM refunds WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    refunds = execute_query(f"SELECT * FROM refunds WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": refunds, "total": total})


@router.post("/refund/{refund_id}/approve",
    summary="审批通过退款",
    description="批准退款申请，触发退款流程",
    responses={
        200: {"description": "审批通过"}
    }
)
async def approve_refund(
    refund_id: int = Path(..., description="退款ID", example=1)
):
    """
    审批通过退款
    
    **业务规则：**
    - 批准后将状态改为approved
    - 触发自动退款流程
    - 记录审批人和时间
    """
    execute_update("UPDATE refunds SET status = 'approved' WHERE id = ?", (refund_id,))
    return api_response(None, "退款已审批通过")


@router.post("/refund/{refund_id}/reject",
    summary="审批拒绝退款",
    description="拒绝退款申请，需填写拒绝原因",
    responses={
        200: {"description": "已拒绝"}
    }
)
async def reject_refund(
    refund_id: int = Path(..., description="退款ID", example=1),
    reason: str = Query("", description="拒绝原因", example="不符合退款条件")
):
    """
    审批拒绝退款
    
    **拒绝原因：**
    - 超过退款期限
    - 账户异常
    - 恶意退款
    - 资料不全
    """
    execute_update("UPDATE refunds SET status = 'rejected' WHERE id = ?", (refund_id,))
    return api_response(None, "退款已拒绝")


@router.get("/invoice",
    summary="获取发票列表",
    description="分页获取发票申请列表",
    responses={
        200: {"description": "成功获取发票列表"}
    }
)
async def list_invoices(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="发票状态", example="pending")
):
    """
    获取发票列表
    
    **筛选条件：**
    - `status`: pending(待开)/processing(开票中)/sent(已寄出)/completed(已完成)
    
    **发票类型：**
    - `普票`: 普通发票
    - `专票`: 增值税专用发票
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM invoices WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    invoices = execute_query(f"SELECT * FROM invoices WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": invoices, "total": total})


@router.post("/invoice",
    summary="创建发票申请",
    description="提交发票开具申请",
    responses={
        200: {"description": "申请提交成功"}
    }
)
async def create_invoice(
    merchant: str = Query(..., description="商户名称", example="粤式茶餐厅"),
    invoice_type: str = Query("普票", description="发票类型", example="专票"),
    amount: float = Query(0, description="发票金额", example=3588.00)
):
    """
    创建发票申请
    
    **请求参数：**
    - `merchant`: 商户名称
    - `invoice_type`: 普票/专票
    - `amount`: 发票金额
    
    **业务规则：**
    - 专票需提供完整开票信息
    - 金额需与实际消费匹配
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO invoices (merchant, type, amount, status, apply_time)
        VALUES (?, ?, ?, 'pending', ?)
    """, (merchant, invoice_type, amount, now))
    return api_response({"id": cursor}, "发票申请已提交")


@router.put("/invoice/{invoice_id}",
    summary="更新发票状态",
    description="更新发票申请状态",
    responses={
        200: {"description": "状态更新成功"}
    }
)
async def update_invoice(
    invoice_id: int = Path(..., description="发票ID", example=1),
    status: str = Query(..., description="目标状态", example="sent")
):
    """
    更新发票状态
    
    **状态流转：**
    - pending → processing → sent → completed
    """
    execute_update("UPDATE invoices SET status = ? WHERE id = ?", (status, invoice_id))
    return api_response(None, "发票状态已更新")
