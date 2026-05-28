"""
店赢OS管理后台API - 渠道增长
"""
from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel, Field
from database import execute_query, execute_insert

router = APIRouter(tags=["渠道增长"])


class ChannelAnalysis(BaseModel):
    """渠道分析"""
    channel: str = Field(..., description="渠道名称")
    leads: int = Field(..., description="线索数")
    converted: int = Field(..., description="转化数")
    cost: float = Field(..., description="成本")


class InviteFission(BaseModel):
    """邀请裂变"""
    total_invites: int
    successful_invites: int
    reward_given: float
    conversion_rate: float


class Partner(BaseModel):
    """合作伙伴"""
    id: int
    name: str
    type: str
    status: str
    cooperation_time: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/analysis",
    summary="获取渠道分析",
    description="获取各渠道获客分析数据",
    responses={200: {"description": "成功获取分析数据"}}
)
async def get_channel_analysis():
    """
    获取渠道分析
    
    **渠道类型：**
    - SEO/SEM: 搜索引擎
    - 社交媒体: 微信/微博
    - 内容营销: 短视频/直播
    - 线下活动: 展会/沙龙
    - 口碑推荐: 老客转介绍
    """
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


@router.get("/invite-fission",
    summary="获取邀请裂变数据",
    description="获取邀请裂变活动数据",
    responses={200: {"description": "成功获取数据"}}
)
async def get_invite_fission():
    """
    获取邀请裂变数据
    
    **返回指标：**
    - 总邀请人数
    - 成功转化数
    - 已发放奖励
    - 转化率
    - Top邀请人排行
    """
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


@router.get("/trial",
    summary="获取试用管理统计",
    description="获取试用用户管理统计数据",
    responses={200: {"description": "成功获取统计"}}
)
async def get_trial_stats():
    """
    获取试用管理统计
    
    **返回指标：**
    - 试用总数
    - 活跃试用
    - 已转化
    - 已过期
    - 转化率
    """
    return api_response({
        "total": 128,
        "active": 45,
        "converted": 62,
        "expired": 21,
        "conversion_rate": 48.4,
        "avg_trial_days": 14
    })


@router.get("/partners",
    summary="获取合作伙伴列表",
    description="分页获取合作伙伴列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_partners(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="状态")
):
    """
    获取合作伙伴列表
    
    **合作类型：**
    - 技术合作
    - 渠道合作
    - 资源合作
    - 战略合作
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM partners WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    partners = execute_query(f"SELECT * FROM partners WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": partners, "total": total})


@router.post("/partners",
    summary="创建合作伙伴",
    description="创建新的合作伙伴",
    responses={200: {"description": "创建成功"}}
)
async def create_partner(
    name: str = Query(..., description="合作伙伴名称"),
    partner_type: str = Query("", description="合作类型"),
    cooperation_time: str = Query("", description="合作开始时间")
):
    """创建合作伙伴"""
    cursor = execute_insert("""
        INSERT INTO partners (name, type, status, cooperation_time)
        VALUES (?, ?, 'active', ?)
    """, (name, partner_type, cooperation_time))
    return api_response({"id": cursor}, "合作伙伴创建成功")
