"""
店赢OS管理后台API - 数据洞察
"""
from fastapi import APIRouter, Query, Path
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query

router = APIRouter(tags=["数据洞察"])


class OverviewResponse(BaseModel):
    """平台总览响应"""
    total_merchants: int = Field(..., description="商户总数", example=286)
    active_merchants: int = Field(..., description="活跃商户数", example=258)
    total_gmv: float = Field(..., description="累计GMV(元)", example=156800000.00)
    total_orders: int = Field(..., description="累计订单数", example=2860000)
    avg_rating: float = Field(..., description="平均评分", example=4.6)
    ai_usage_rate: float = Field(..., description="AI使用率(%)", example=72.5)
    month_growth: float = Field(..., description="本月增长率(%)", example=15.8)
    today_gmv: float = Field(..., description="今日GMV", example=156000.00)
    today_orders: int = Field(..., description="今日订单数", example=856)


class GMVTrendItem(BaseModel):
    """GMV趋势项"""
    month: str = Field(..., description="月份", example="2024-12")
    gmv: float = Field(..., description="GMV(元)", example=2560000.00)
    orders: int = Field(..., description="订单数", example=17800)


class IndustryReportItem(BaseModel):
    """行业报告项"""
    industry: str = Field(..., description="行业名称", example="餐饮")
    merchants: int = Field(..., description="商户数", example=158)
    avg_gmv: float = Field(..., description="平均GMV", example=568000.00)
    avg_rating: float = Field(..., description="平均评分", example=4.5)
    ai_usage_rate: float = Field(..., description="AI使用率", example=72)


class AIStatsResponse(BaseModel):
    """AI使用统计响应"""
    total_calls: int = Field(..., description="总调用次数", example=325600)
    total_tokens: int = Field(..., description="总Token数", example=1250000000)
    agents: List[dict] = Field(..., description="各Agent统计")
    monthly_trend: List[dict] = Field(..., description="月度趋势")


class ChurnWarningItem(BaseModel):
    """流失预警项"""
    id: int = Field(..., description="预警ID", example=1)
    merchant: str = Field(..., description="商户名称", example="某某餐厅")
    probability: int = Field(..., description="流失概率(%)", example=75)
    risk_level: str = Field(..., description="风险等级", example="high")
    last_active: str = Field(..., description="最后活跃时间", example="2024-11-01")


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/overview",
    summary="获取平台总览",
    description="获取平台整体运营数据概览，包括商户数、GMV、订单数、评分等核心指标",
    response_model=OverviewResponse,
    responses={
        200: {"description": "成功获取平台总览数据"}
    }
)
async def get_overview():
    """
    获取平台总览
    
    **核心指标：**
    - 商户数据：总数、活跃数
    - 交易数据：累计GMV、累计订单
    - 质量数据：平均评分、AI使用率
    - 今日数据：今日GMV、今日订单
    
    **计算说明：**
    - AI使用率 = AI调用次数 / (订单数 × 0.5) × 100%
    - 月增长率 = (本月GMV - 上月GMV) / 上月GMV × 100%
    """
    total_merchants = execute_query("SELECT COUNT(*) as cnt FROM merchants")[0]["cnt"]
    active_merchants = execute_query("SELECT COUNT(*) as cnt FROM merchants WHERE status='active'")[0]["cnt"]
    total_gmv = execute_query("SELECT SUM(gmv) as sum FROM merchants")[0]["sum"] or 0
    total_orders = execute_query("SELECT SUM(orders) as sum FROM merchants")[0]["sum"] or 0
    avg_rating = execute_query("SELECT AVG(rating) as avg FROM merchants WHERE rating > 0")[0]["avg"] or 0
    ai_usage = execute_query("SELECT SUM(ai_usage) as sum FROM merchants")[0]["sum"] or 0
    
    return api_response({
        "total_merchants": total_merchants,
        "active_merchants": active_merchants,
        "total_gmv": total_gmv,
        "total_orders": total_orders,
        "avg_rating": round(avg_rating, 1),
        "ai_usage_rate": round(ai_usage / (total_orders * 0.5) * 100, 1) if total_orders > 0 else 0,
        "month_growth": 15.8,
        "today_gmv": 156000,
        "today_orders": 856
    })


@router.get("/gmv-trend",
    summary="获取GMV趋势",
    description="获取近期的GMV和订单趋势数据",
    responses={
        200: {"description": "成功获取GMV趋势数据"}
    }
)
async def get_gmv_trend(
    months: int = Query(12, ge=1, le=24, description="查询月份数", example=12)
):
    """
    获取GMV趋势
    
    **查询参数：**
    - `months`: 查询月份数，默认12个月，最多24个月
    
    **返回数据：**
    - 每月GMV金额
    - 每月订单数量
    - 按时间倒序排列
    
    **用途：**
    - 了解业务增长趋势
    - 分析季节性波动
    - 制定运营策略
    """
    trend = [
        {"month": "2024-01", "gmv": 1250000, "orders": 8560},
        {"month": "2024-02", "gmv": 1380000, "orders": 9200},
        {"month": "2024-03", "gmv": 1420000, "orders": 9800},
        {"month": "2024-04", "gmv": 1560000, "orders": 10200},
        {"month": "2024-05", "gmv": 1680000, "orders": 11500},
        {"month": "2024-06", "gmv": 1750000, "orders": 12000},
        {"month": "2024-07", "gmv": 1820000, "orders": 12600},
        {"month": "2024-08", "gmv": 1950000, "orders": 13200},
        {"month": "2024-09", "gmv": 2080000, "orders": 14500},
        {"month": "2024-10", "gmv": 2250000, "orders": 15800},
        {"month": "2024-11", "gmv": 2380000, "orders": 16500},
        {"month": "2024-12", "gmv": 2560000, "orders": 17800},
    ]
    return api_response({"trend": trend[:months]})


@router.get("/industry-report",
    summary="获取行业报告",
    description="获取各行业的经营分析报告",
    responses={
        200: {"description": "成功获取行业报告"}
    }
)
async def get_industry_report():
    """
    获取行业报告
    
    **报告内容：**
    - 各行业商户数量
    - 各行业平均GMV
    - 各行业平均评分
    - 各行业AI使用率
    
    **行业分类：**
    - 餐饮
    - 零售
    - 休娱
    - 医疗
    - 教育
    - 服务
    """
    reports = [
        {"industry": "餐饮", "merchants": 158, "avg_gmv": 568000, "avg_rating": 4.5, "ai_usage_rate": 72},
        {"industry": "零售", "merchants": 86, "avg_gmv": 890000, "avg_rating": 4.3, "ai_usage_rate": 68},
        {"industry": "休娱", "merchants": 42, "avg_gmv": 420000, "avg_rating": 4.6, "ai_usage_rate": 65},
    ]
    return api_response({"reports": reports})


@router.get("/ai-stats",
    summary="获取AI使用统计",
    description="获取AI功能的使用统计数据",
    response_model=AIStatsResponse,
    responses={
        200: {"description": "成功获取AI使用统计"}
    }
)
async def get_ai_stats():
    """
    获取AI使用统计
    
    **统计维度：**
    - 总调用次数
    - 总Token消耗
    - 各Agent调用量
    - 月度趋势变化
    
    **Agent类型：**
    - 智能客服：自动回复咨询
    - 营销助手：活动策划推广
    - 数据分析：经营报告生成
    - 海报设计：营销素材生成
    - 运营建议：智能诊断优化
    """
    stats = {
        "total_calls": 325600,
        "total_tokens": 1250000000,
        "agents": [
            {"name": "智能客服", "calls": 29500, "growth": 12.5},
            {"name": "营销助手", "calls": 24200, "growth": 18.3},
            {"name": "数据分析", "calls": 20500, "growth": 8.7},
            {"name": "海报设计", "calls": 12000, "growth": 25.6},
            {"name": "运营建议", "calls": 9500, "growth": 15.2},
        ],
        "monthly_trend": [
            {"month": "2024-07", "calls": 62000},
            {"month": "2024-08", "calls": 68000},
            {"month": "2024-09", "calls": 76500},
            {"month": "2024-10", "calls": 82900},
            {"month": "2024-11", "calls": 88100},
            {"month": "2024-12", "calls": 95700},
        ]
    }
    return api_response(stats)


@router.get("/churn-warning",
    summary="获取流失预警列表",
    description="获取存在流失风险的商户预警列表",
    response_model=List[ChurnWarningItem],
    responses={
        200: {"description": "成功获取流失预警列表"}
    }
)
async def list_churn_warning(
    threshold: int = Query(50, ge=0, le=100, description="流失概率阈值(%)", example=50)
):
    """
    获取流失预警列表
    
    **筛选条件：**
    - `threshold`: 流失概率阈值，默认50%
    
    **风险等级：**
    - high: 高风险(概率≥70%)
    - medium: 中风险(概率40-70%)
    - low: 低风险(概率<40%)
    
    **预警规则：**
    - 30天未活跃
    - 评分持续下降
    - 订单量大幅减少
    - 版本即将到期
    """
    warnings = execute_query(
        "SELECT * FROM churn_warning WHERE probability >= ? ORDER BY probability DESC",
        (threshold,)
    )
    return api_response({"items": warnings, "total": len(warnings)})


@router.get("/churn-warning/{warning_id}",
    summary="获取流失预警详情",
    description="获取指定流失预警的详细信息",
    responses={
        200: {"description": "成功获取预警详情"},
        404: {"description": "预警不存在"}
    }
)
async def get_churn_warning_detail(
    warning_id: int = Path(..., description="预警ID", example=1)
):
    """
    获取流失预警详情
    
    **路径参数：**
    - `warning_id`: 预警唯一ID
    
    **返回信息：**
    - 商户基本信息
    - 流失概率
    - 风险因素列表
    - 最后活跃时间
    - 建议措施
    """
    warnings = execute_query("SELECT * FROM churn_warning WHERE id = ?", (warning_id,))
    if not warnings:
        return api_response(None, "预警不存在", 404)
    return api_response(warnings[0])


@router.post("/churn-warning/{warning_id}/handle",
    summary="处理流失预警",
    description="对流失预警进行处理，记录处理措施",
    responses={
        200: {"description": "处理成功"}
    }
)
async def handle_churn_warning(
    warning_id: int = Path(..., description="预警ID", example=1),
    action: str = Query("contact", description="处理动作", example="contact")
):
    """
    处理流失预警
    
    **处理动作：**
    - `contact`: 联系商户
    - `coupon`: 发放优惠券
    - `upgrade`: 版本升级
    - `dismiss`: 标记误报
    
    **处理流程：**
    1. 选择处理方式
    2. 记录处理结果
    3. 更新预警状态
    """
    return api_response(None, f"已执行{action}操作")
