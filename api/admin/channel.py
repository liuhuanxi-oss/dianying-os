"""
店赢OS管理后台API - 渠道增长
"""
from fastapi import APIRouter, Query
from typing import Optional
from database import execute_query, execute_insert

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/analysis")
async def get_channel_analysis():
    """获取渠道分析"""
    channels = execute_query("SELECT * FROM channel_analysis")
    
    total_leads = sum(c["leads"] for c in channels)
    total_converted = sum(c["converted"] for c in channels)
    total_cost = sum(c["cost"] for c in channels)
    
    return api_response({
        "channels": channels,
        "summary": {
            "total_leads": total_leads,
            "total_converted": total_converted,
            "overall_rate": round(total_converted / total_leads * 100, 1) if total_leads > 0 else 0,
            "total_cost": total_cost,
            "avg_cost_per_lead": round(total_cost / total_leads, 2) if total_leads > 0 else 0
        }
    })


@router.get("/invite-fission")
async def get_invite_fission():
    """获取邀请裂变数据"""
    return api_response({
        "total_invites": 856,
        "successful_invites": 324,
        "reward_given": 48600,
        "conversion_rate": 37.9,
        "top_inviters": [
            {"name": "张总", "invites": 28, "rewards": 4200},
            {"name": "李总", "invites": 22, "rewards": 3300},
            {"name": "王总", "invites": 18, "rewards": 2700}
        ]
    })


@router.get("/trial")
async def get_trial_stats():
    """获取试用管理统计"""
    return api_response({
        "total": 128,
        "active": 45,
        "converted": 62,
        "expired": 21,
        "conversion_rate": 48.4,
        "avg_trial_days": 14
    })


@router.get("/partners")
async def list_partners(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取合作伙伴列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM partners WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    partners = execute_query(f"SELECT * FROM partners WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": partners, "total": total})


@router.post("/partners")
async def create_partner(
    name: str,
    partner_type: str = "",
    cooperation_time: str = ""
):
    """创建合作伙伴"""
    cursor = execute_insert("""
        INSERT INTO partners (name, type, status, cooperation_time)
        VALUES (?, ?, 'active', ?)
    """, (name, partner_type, cooperation_time))
    return api_response({"id": cursor}, "合作伙伴创建成功")
