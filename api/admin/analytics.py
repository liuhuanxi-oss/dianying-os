"""
店赢OS管理后台API - 数据洞察
"""
from fastapi import APIRouter, Query
from typing import Optional
from database import execute_query

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/overview")
async def get_overview():
    """获取平台总览"""
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


@router.get("/gmv-trend")
async def get_gmv_trend(months: int = Query(12, ge=1, le=24)):
    """获取GMV趋势"""
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


@router.get("/industry-report")
async def get_industry_report():
    """获取行业报告"""
    reports = [
        {"industry": "餐饮", "merchants": 158, "avg_gmv": 568000, "avg_rating": 4.5, "ai_usage_rate": 72},
        {"industry": "零售", "merchants": 86, "avg_gmv": 890000, "avg_rating": 4.3, "ai_usage_rate": 68},
        {"industry": "休娱", "merchants": 42, "avg_gmv": 420000, "avg_rating": 4.6, "ai_usage_rate": 65},
    ]
    return api_response({"reports": reports})


@router.get("/ai-stats")
async def get_ai_stats():
    """获取AI使用统计"""
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


@router.get("/churn-warning")
async def list_churn_warning(
    threshold: int = Query(50, ge=0, le=100, description="流失概率阈值")
):
    """获取流失预警列表"""
    warnings = execute_query(
        "SELECT * FROM churn_warning WHERE probability >= ? ORDER BY probability DESC",
        (threshold,)
    )
    return api_response({"items": warnings, "total": len(warnings)})


@router.get("/churn-warning/{warning_id}")
async def get_churn_warning_detail(warning_id: int):
    """获取流失预警详情"""
    warnings = execute_query("SELECT * FROM churn_warning WHERE id = ?", (warning_id,))
    if not warnings:
        return api_response(None, "预警不存在", 404)
    return api_response(warnings[0])


@router.post("/churn-warning/{warning_id}/handle")
async def handle_churn_warning(warning_id: int, action: str = "contact"):
    """处理流失预警"""
    return api_response(None, f"已执行{action}操作")
