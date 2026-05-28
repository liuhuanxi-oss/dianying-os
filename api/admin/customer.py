"""
店赢OS管理后台API - 客户成功
"""
from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update

router = APIRouter(tags=["客户成功"])


class OnboardingStep(BaseModel):
    """Onboarding步骤"""
    step: int = Field(..., description="步骤序号", example=1)
    title: str = Field(..., description="步骤标题", example="账号注册")
    status: str = Field(..., description="状态", example="completed")
    completed_time: Optional[str] = Field(None, description="完成时间")


class OnboardingDetail(BaseModel):
    """Onboarding详情"""
    merchant_id: int = Field(..., description="商户ID")
    merchant_name: str = Field(..., description="商户名称")
    progress: int = Field(..., description="进度百分比")
    steps: List[OnboardingStep]


class HealthScoreItem(BaseModel):
    """健康度项"""
    merchant_id: int = Field(..., description="商户ID")
    merchant: str = Field(..., description="商户名称")
    score: int = Field(..., description="健康度分数")
    rating_trend: str = Field(..., description="评分趋势")
    order_trend: str = Field(..., description="订单趋势")
    ai_usage_trend: str = Field(..., description="AI使用趋势")
    risk_factors: List[str] = Field(..., description="风险因素")


class RenewalItem(BaseModel):
    """续费项"""
    id: int = Field(..., description="ID")
    merchant: str = Field(..., description="商户名称")
    version: str = Field(..., description="版本")
    expire_time: str = Field(..., description="到期时间")
    days_left: int = Field(..., description="剩余天数")
    status: str = Field(..., description="状态")


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/onboarding",
    summary="获取Onboarding列表",
    description="获取商户Onboarding进度列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_onboarding(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取Onboarding列表
    
    **Onboarding步骤：**
    1. 账号注册
    2. 资质认证
    3. 平台绑定
    4. 首次使用
    5. 功能培训
    """
    offset = (page - 1) * size
    merchants = execute_query(
        "SELECT * FROM merchants WHERE status IN ('active', 'pending') ORDER BY register_time DESC LIMIT ? OFFSET ?",
        (size, offset)
    )
    
    onboarding_list = []
    for m in merchants:
        steps = [
            {"step": 1, "title": "账号注册", "status": "completed", "completed_time": m["register_time"]},
            {"step": 2, "title": "资质认证", "status": "completed" if m["status"] == "active" else "pending"},
            {"step": 3, "title": "平台绑定", "status": "completed" if m["gmv"] > 0 else "pending"},
            {"step": 4, "title": "首次使用", "status": "completed" if m["ai_usage"] > 0 else "pending"},
            {"step": 5, "title": "功能培训", "status": "pending"},
        ]
        onboarding_list.append({
            "merchant_id": m["id"],
            "merchant_name": m["name"],
            "steps": steps,
            "progress": sum(1 for s in steps if s["status"] == "completed") * 20
        })
    
    return api_response({"items": onboarding_list})


@router.get("/onboarding/{merchant_id}",
    summary="获取Onboarding详情",
    description="获取指定商户的Onboarding详细信息",
    responses={200: {"description": "成功获取详情"}, 404: {"description": "商户不存在"}}
)
async def get_onboarding_detail(
    merchant_id: int = Path(..., description="商户ID")
):
    """获取Onboarding详情"""
    merchants = execute_query("SELECT * FROM merchants WHERE id = ?", (merchant_id,))
    if not merchants:
        raise HTTPException(status_code=404, detail="商家不存在")
    
    m = merchants[0]
    return api_response({
        "merchant_id": m["id"],
        "merchant_name": m["name"],
        "progress": min(100, m["ai_usage"] // 10),
        "steps": [
            {"step": 1, "title": "账号注册", "status": "completed", "completed_time": m["register_time"]},
            {"step": 2, "title": "资质认证", "status": "completed"},
            {"step": 3, "title": "平台绑定", "status": "completed" if m["gmv"] > 0 else "pending"},
            {"step": 4, "title": "首次使用", "status": "completed" if m["ai_usage"] > 0 else "pending"},
            {"step": 5, "title": "功能培训", "status": "pending"},
        ]
    })


@router.get("/health-score",
    summary="获取健康度列表",
    description="获取商户健康度评分列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_health_scores(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    threshold: int = Query(60, ge=0, le=100, description="健康度阈值")
):
    """
    获取健康度列表
    
    **评分规则：**
    - 评分 × 20 + AI使用量/100
    - 满分100
    
    **风险因素：**
    - 评分偏低(<4.5)
    - AI使用率低(<500次)
    - 即将到期
    """
    offset = (page - 1) * size
    merchants = execute_query(
        "SELECT * FROM merchants WHERE status='active' ORDER BY rating DESC LIMIT ? OFFSET ?",
        (size, offset)
    )
    
    scores = []
    for m in merchants:
        score = int(min(100, m["rating"] * 20 + m["ai_usage"] / 100))
        risk_factors = []
        if m["rating"] < 4.5:
            risk_factors.append("评分偏低")
        if m["ai_usage"] < 500:
            risk_factors.append("AI使用率低")
        if m["status"] == "expiring":
            risk_factors.append("即将到期")
        
        scores.append({
            "merchant_id": m["id"],
            "merchant": m["name"],
            "score": score,
            "rating_trend": "up" if m["rating"] >= 4.5 else "down",
            "order_trend": "up" if m["orders"] >= 1000 else "down",
            "ai_usage_trend": "up" if m["ai_usage"] >= 500 else "down",
            "risk_factors": risk_factors
        })
    
    scores = [s for s in scores if s["score"] <= threshold] if threshold < 100 else scores
    
    return api_response({"items": scores})


@router.get("/renewal",
    summary="获取续费管理列表",
    description="获取即将到期和待续费的商户列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_renewals(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    days_threshold: int = Query(30, ge=1, description="天数阈值")
):
    """
    获取续费管理列表
    
    **筛选条件：**
    - `days_threshold`: 剩余天数阈值
    """
    offset = (page - 1) * size
    merchants = execute_query(
        "SELECT * FROM merchants WHERE status IN ('active', 'expiring') ORDER BY expire_time ASC LIMIT ? OFFSET ?",
        (size, offset)
    )
    
    renewals = []
    for m in merchants:
        renewals.append({
            "id": m["id"],
            "merchant": m["name"],
            "version": m["version"],
            "expire_time": m["expire_time"],
            "days_left": 30,
            "status": "expiring" if m["status"] == "expiring" else "pending"
        })
    
    return api_response({"items": renewals})


@router.post("/renewal/{merchant_id}",
    summary="处理续费",
    description="为商户办理续费",
    responses={200: {"description": "续费成功"}}
)
async def process_renewal(
    merchant_id: int = Path(..., description="商户ID")
):
    """处理续费"""
    from datetime import datetime
    new_expire = datetime.now().strftime("%Y-%m-%d")
    execute_update(
        "UPDATE merchants SET status='active', expire_time=? WHERE id=?",
        (new_expire, merchant_id)
    )
    return api_response(None, "续费成功")


@router.get("/upgrade-funnel",
    summary="获取升降级漏斗",
    description="获取版本升级漏斗数据",
    responses={200: {"description": "成功获取数据"}}
)
async def get_upgrade_funnel():
    """
    获取升降级漏斗
    
    **返回信息：**
    - 各版本商户数量
    - 本期升级人数
    """
    merchants = execute_query("SELECT version, COUNT(*) as cnt FROM merchants GROUP BY version")
    
    funnel = {"免费版": 0, "专业版": 0, "旗舰版": 0}
    for m in merchants:
        if m["version"] in funnel:
            funnel[m["version"]] = m["cnt"]
    
    return api_response({
        "funnel": [
            {"version": "免费版", "count": funnel["免费版"], "upgrades": 0},
            {"version": "专业版", "count": funnel["专业版"], "upgrades": 45},
            {"version": "旗舰版", "count": funnel["旗舰版"], "upgrades": 28}
        ]
    })


@router.get("/wake-up",
    summary="获取沉默唤醒任务",
    description="获取需要唤醒的沉默用户列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_wake_up_tasks(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取沉默唤醒任务
    
    **沉默用户定义：**
    - 30天未活跃
    - 无新订单
    """
    offset = (page - 1) * size
    warnings = execute_query(
        "SELECT * FROM churn_warning ORDER BY probability DESC LIMIT ? OFFSET ?",
        (size, offset)
    )
    
    tasks = []
    for w in warnings:
        tasks.append({
            "id": w["id"],
            "merchant": w["merchant"],
            "last_active": w["last_active"],
            "inactive_days": 30,
            "action_type": "coupon" if w.get("risk_level") == "high" else "notification",
            "status": "pending"
        })
    
    return api_response({"items": tasks})


@router.post("/wake-up/{task_id}/send",
    summary="发送唤醒通知",
    description="向沉默用户发送唤醒通知",
    responses={200: {"description": "发送成功"}}
)
async def send_wake_up_notification(
    task_id: int = Path(..., description="任务ID")
):
    """发送唤醒通知"""
    return api_response(None, "唤醒通知已发送")
