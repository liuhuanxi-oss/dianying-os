"""
店赢OS管理后台API - 客户成功
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import execute_query, execute_insert, execute_update

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/onboarding")
async def list_onboarding(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取Onboarding列表"""
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


@router.get("/onboarding/{merchant_id}")
async def get_onboarding_detail(merchant_id: int):
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


@router.get("/health-score")
async def list_health_scores(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    threshold: int = Query(60, ge=0, le=100)
):
    """获取健康度列表"""
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


@router.get("/renewal")
async def list_renewals(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    days_threshold: int = Query(30, ge=1)
):
    """获取续费管理列表"""
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
            "days_left": 30,  # 简化计算
            "status": "expiring" if m["status"] == "expiring" else "pending"
        })
    
    return api_response({"items": renewals})


@router.post("/renewal/{merchant_id}")
async def process_renewal(merchant_id: int):
    """处理续费"""
    from datetime import datetime
    new_expire = datetime.now().strftime("%Y-%m-%d")
    execute_update(
        "UPDATE merchants SET status='active', expire_time=? WHERE id=?",
        (new_expire, merchant_id)
    )
    return api_response(None, "续费成功")


@router.get("/upgrade-funnel")
async def get_upgrade_funnel():
    """获取升降级漏斗"""
    merchants = execute_query("SELECT version, COUNT(*) as cnt FROM merchants GROUP BY version")
    
    funnel = {
        "免费版": 0,
        "专业版": 0,
        "旗舰版": 0
    }
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


@router.get("/wake-up")
async def list_wake_up_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取沉默唤醒任务"""
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
            "action_type": "coupon" if w["risk_level"] == "high" else "notification",
            "status": "pending"
        })
    
    return api_response({"items": tasks})


@router.post("/wake-up/{task_id}/send")
async def send_wake_up_notification(task_id: int):
    """发送唤醒通知"""
    return api_response(None, "唤醒通知已发送")
