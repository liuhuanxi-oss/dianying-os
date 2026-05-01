"""
店赢OS管理后台API - 支付交易
"""
from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete
import json

router = APIRouter(tags=["支付交易"])


class PaymentChannel(BaseModel):
    """支付通道模型"""
    name: str = Field(..., description="通道名称", example="微信支付")
    code: str = Field(..., description="通道编码", example="WECHAT")
    status: str = Field(..., description="状态", example="active")
    fee_rate: float = Field(..., description="费率", example=0.006)


class TransactionResponse(BaseModel):
    """交易记录响应模型"""
    id: str = Field(..., description="交易ID", example="T20241203100012345")
    merchant: str = Field(..., description="商户名称", example="粤式茶餐厅")
    amount: float = Field(..., description="交易金额(元)", example=156.80)
    type: str = Field(..., description="交易类型", example="scan")
    status: str = Field(..., description="状态", example="success")
    time: str = Field(..., description="交易时间", example="2024-12-03 10:00:00")
    channel: str = Field(..., description="支付渠道", example="WECHAT")


class FeeConfig(BaseModel):
    """费率配置模型"""
    version: str = Field(..., description="版本", example="专业版")
    price: float = Field(..., description="价格(元/月)", example=299.00)
    features: List[str] = Field(..., description="功能列表")


class SplitPayment(BaseModel):
    """分账记录模型"""
    id: int = Field(..., description="记录ID", example=1)
    transaction_id: str = Field(..., description="交易ID", example="T20241203100012345")
    merchant: str = Field(..., description="商户", example="粤式茶餐厅")
    amount: float = Field(..., description="交易金额", example=156.80)
    platform_fee: float = Field(..., description="平台手续费(6%)", example=9.41)
    agent_commission: float = Field(..., description="代理商佣金(4%)", example=6.27)
    actual_amount: float = Field(..., description="实际到账金额", example=141.12)


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/channels",
    summary="获取支付通道列表",
    description="获取平台支持的支付通道列表及其状态",
    response_model=List[PaymentChannel],
    responses={
        200: {"description": "成功获取支付通道列表"}
    }
)
async def list_payment_channels():
    """
    获取支付通道列表
    
    **支持的支付通道：**
    - 微信支付
    - 支付宝
    - 银联云闪付
    - 翼支付
    - 数字人民币
    
    **返回信息：**
    - 通道名称、编码
    - 当前状态(启用/停用)
    - 当前费率
    """
    channels = execute_query("SELECT * FROM payment_channels")
    return api_response({"items": channels})


@router.get("/channels/{channel_name}",
    summary="获取支付通道详情",
    description="获取指定支付通道的详细信息",
    response_model=PaymentChannel,
    responses={
        200: {"description": "成功获取通道详情"},
        404: {"description": "通道不存在"}
    }
)
async def get_payment_channel(
    channel_name: str = Path(..., description="通道名称", example="微信支付")
):
    """
    获取支付通道详情
    
    **路径参数：**
    - `channel_name`: 支付通道名称(URL编码)
    
    **返回字段：**
    - 基本信息：名称、编码
    - 状态：启用/停用
    - 费率配置
    """
    channels = execute_query("SELECT * FROM payment_channels WHERE name = ?", (channel_name,))
    if not channels:
        raise HTTPException(status_code=404, detail="通道不存在")
    return api_response(channels[0])


@router.put("/channels/{channel_name}",
    summary="更新支付通道配置",
    description="更新指定支付通道的状态或费率",
    responses={
        200: {"description": "配置更新成功"}
    }
)
async def update_payment_channel(
    channel_name: str = Path(..., description="通道名称", example="微信支付"),
    status: Optional[str] = Query(None, description="状态", example="active"),
    fee: Optional[float] = Query(None, description="费率", example=0.006)
):
    """
    更新支付通道配置
    
    **可更新字段：**
    - `status`: 启用状态(active/inactive)
    - `fee`: 交易费率
    
    **业务规则：**
    - 费率通常为0.6%-0.72%
    - 停用通道将无法进行相关交易
    """
    if status:
        execute_update("UPDATE payment_channels SET status = ? WHERE name = ?", (status, channel_name))
    return api_response(None, "通道配置已更新")


@router.get("/transactions",
    summary="获取交易流水",
    description="分页获取交易流水记录，支持按状态、类型、商户筛选",
    response_model=List[TransactionResponse],
    responses={
        200: {"description": "成功获取交易流水"}
    }
)
async def list_transactions(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="交易状态", example="success"),
    type: Optional[str] = Query(None, description="交易类型", example="scan"),
    merchant: Optional[str] = Query(None, description="商户名称关键词", example="粤式")
):
    """
    获取交易流水
    
    **筛选条件：**
    - `status`: success/success/pending/failed
    - `type`: scan(扫码)/card(刷卡)/transfer(转账)
    - `merchant`: 商户名称模糊搜索
    
    **交易类型说明：**
    - `scan`: 主扫(生成二维码)
    - `card`: 刷卡(被扫)
    - `transfer`: 转账
    """
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


@router.get("/transactions/{transaction_id}",
    summary="获取交易详情",
    description="根据交易ID获取交易详细信息",
    response_model=TransactionResponse,
    responses={
        200: {"description": "成功获取交易详情"},
        404: {"description": "交易不存在"}
    }
)
async def get_transaction(
    transaction_id: str = Path(..., description="交易ID", example="T20241203100012345")
):
    """
    获取交易详情
    
    **路径参数：**
    - `transaction_id`: 交易唯一标识
    
    **返回信息：**
    - 基本信息：ID、商户、金额、时间
    - 状态：支付状态
    - 渠道：支付渠道
    - 分账信息(如有)
    """
    transactions = execute_query("SELECT * FROM transactions WHERE id = ?", (transaction_id,))
    if not transactions:
        raise HTTPException(status_code=404, detail="交易不存在")
    return api_response(transactions[0])


@router.get("/fee-config",
    summary="获取费率配置",
    description="获取各版本的费率配置信息",
    response_model=List[FeeConfig],
    responses={
        200: {"description": "成功获取费率配置"}
    }
)
async def get_fee_config():
    """
    获取费率配置
    
    **返回内容：**
    - 各版本的月费价格
    - 包含的功能列表
    - 交易费率说明
    """
    pricing = execute_query("SELECT * FROM pricing")
    return api_response({"items": pricing})


@router.put("/fee-config/{version}",
    summary="更新费率配置",
    description="更新指定版本的费率配置",
    responses={
        200: {"description": "配置更新成功"}
    }
)
async def update_fee_config(
    version: str = Path(..., description="版本", example="专业版"),
    price: Optional[float] = Query(None, description="月费价格(元)", example=299.00),
    features: Optional[List[str]] = Query(None, description="功能列表")
):
    """
    更新费率配置
    
    **可更新字段：**
    - `price`: 月费价格
    - `features`: 功能列表
    
    **业务规则：**
    - 价格通常为99-999元/月
    - 功能列表需为JSON数组格式
    """
    if price is not None:
        execute_update("UPDATE pricing SET price = ? WHERE version = ?", (price, version))
    return api_response(None, "费率配置已更新")


@router.get("/split-payment",
    summary="获取分账记录",
    description="分页获取分账记录，包含平台手续费和代理商佣金信息",
    response_model=List[SplitPayment],
    responses={
        200: {"description": "成功获取分账记录"}
    }
)
async def list_split_payments(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20)
):
    """
    获取分账记录
    
    **分账规则：**
    - 平台手续费：6%
    - 代理商佣金：4%
    - 商户实收：90%
    
    **返回字段：**
    - `platform_fee`: 平台手续费
    - `agent_commission`: 代理商佣金
    - `actual_amount`: 商户实际到账金额
    """
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


@router.get("/reconciliation",
    summary="获取对账数据",
    description="获取指定月份的对账汇总数据",
    responses={
        200: {"description": "成功获取对账数据"}
    }
)
async def get_reconciliation(
    month: Optional[str] = Query(None, description="月份，格式YYYY-MM", example="2024-12")
):
    """
    获取对账数据
    
    **查询参数：**
    - `month`: 目标月份，格式YYYY-MM，默认当月
    
    **返回内容：**
    - 结算记录列表
    - 应付总额、已付总额、待付总额
    """
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


@router.post("/reconciliation/settle",
    summary="结算佣金",
    description="对指定代理商进行佣金结算",
    responses={
        200: {"description": "结算成功"}
    }
)
async def settle_commission(
    agent: str = Query(..., description="代理商名称", example="华南区代理"),
    month: str = Query(..., description="结算月份", example="2024-12")
):
    """
    结算佣金
    
    **请求参数：**
    - `agent`: 代理商名称
    - `month`: 结算月份
    
    **业务规则：**
    - 结算后将状态改为settled
    - 记录结算时间
    """
    execute_update(
        "UPDATE settlement_records SET status='settled', settle_time=datetime('now') WHERE agent=? AND month=?",
        (agent, month)
    )
    return api_response(None, "结算成功")
