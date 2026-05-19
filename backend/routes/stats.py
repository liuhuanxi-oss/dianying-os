# -*- coding: utf-8 -*-
"""
统计路由
包含概览、趋势、平台分布等统计接口
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from database import get_db
from models import StatsDaily, Store, Review, Order, User
from routes.auth import get_current_active_user

router = APIRouter()


# ========== 请求/响应模型 ==========

class DailyTrendItem(BaseModel):
    """每日趋势项"""
    date: str
    order_count: int
    order_amount: float
    review_count: int
    avg_rating: float


class PlatformDistribution(BaseModel):
    """平台分布项"""
    platform: str
    count: int
    amount: float
    percentage: float


class OverviewStats(BaseModel):
    """概览统计"""
    total_stores: int
    total_orders: int
    total_revenue: float
    avg_rating: float
    total_reviews: int
    pending_reviews: int


# ========== 路由 ==========

@router.get("/overview", response_model=OverviewStats)
async def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取概览统计数据
    """
    # 门店总数
    total_stores = db.query(Store).filter(Store.status == True).count()
    
    # 订单总数和收入
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.final_amount)).scalar() or 0
    
    # 评价相关
    total_reviews = db.query(Review).count()
    pending_reviews = db.query(Review).filter(Review.status == "pending").count()
    
    # 平均评分
    avg_result = db.query(func.avg(Review.rating)).scalar()
    avg_rating = round(float(avg_result), 1) if avg_result else 0
    
    return OverviewStats(
        total_stores=total_stores,
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        avg_rating=avg_rating,
        total_reviews=total_reviews,
        pending_reviews=pending_reviews
    )


@router.get("/trend", response_model=List[DailyTrendItem])
async def get_trend(
    days: int = Query(30, ge=7, le=90),
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取每日趋势数据
    """
    # 计算日期范围
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    query = db.query(StatsDaily).filter(
        StatsDaily.date >= start_date.strftime("%Y-%m-%d")
    )
    
    # 门店筛选
    if store_id:
        query = query.filter(StatsDaily.store_id == store_id)
    
    # 按日期分组汇总
    results = db.query(
        StatsDaily.date,
        func.sum(StatsDaily.order_count).label("order_count"),
        func.sum(StatsDaily.order_amount).label("order_amount"),
        func.sum(StatsDaily.review_count).label("review_count"),
        func.avg(StatsDaily.avg_rating).label("avg_rating")
    ).filter(
        StatsDaily.date >= start_date.strftime("%Y-%m-%d")
    ).group_by(StatsDaily.date).order_by(StatsDaily.date).all()
    
    return [
        DailyTrendItem(
            date=r.date,
            order_count=r.order_count or 0,
            order_amount=round(float(r.order_amount or 0), 2),
            review_count=r.review_count or 0,
            avg_rating=round(float(r.avg_rating or 0), 1)
        )
        for r in results
    ]


@router.get("/distribution", response_model=List[PlatformDistribution])
async def get_platform_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取平台分布数据
    """
    # 按支付方式统计
    results = db.query(
        Order.payment_method,
        func.count(Order.id).label("count"),
        func.sum(Order.final_amount).label("amount")
    ).group_by(Order.payment_method).all()
    
    total_count = sum(r.count for r in results)
    total_amount = sum(float(r.amount or 0) for r in results)
    
    platform_names = {
        "alipay": "支付宝",
        "wechat": "微信支付",
        "cash": "现金"
    }
    
    return [
        PlatformDistribution(
            platform=platform_names.get(r.payment_method or "", r.payment_method or "其他"),
            count=r.count,
            amount=round(float(r.amount or 0), 2),
            percentage=round(r.count / total_count * 100, 1) if total_count > 0 else 0
        )
        for r in results
    ]


@router.get("/store-ranking")
async def get_store_ranking(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取门店排行榜
    """
    results = db.query(
        Store.id,
        Store.name,
        Store.category,
        Store.rating,
        Store.review_count,
        Store.order_count
    ).order_by(Store.order_count.desc()).limit(limit).all()
    
    return {
        "items": [
            {
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "rating": r.rating,
                "review_count": r.review_count,
                "order_count": r.order_count
            }
            for r in results
        ]
    }


@router.get("/review-analysis")
async def get_review_analysis(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取评价分析数据
    """
    # 计算日期范围
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # 按评分统计
    rating_stats = db.query(
        Review.rating,
        func.count(Review.id).label("count")
    ).filter(
        Review.created_at >= start_date
    ).group_by(Review.rating).all()
    
    # 好评率计算
    total_reviews = sum(s.count for s in rating_stats)
    positive_reviews = sum(s.count for s in rating_stats if s.rating >= 4)
    positive_rate = round(positive_reviews / total_reviews * 100, 1) if total_reviews > 0 else 0
    
    # 差评原因分析（关键词统计）
    bad_reviews = db.query(Review).filter(
        Review.rating <= 2,
        Review.created_at >= start_date
    ).all()
    
    keywords = {}
    keyword_list = ["等待", "态度", "分量", "味道", "卫生", "送餐", "质量", "价格"]
    
    for review in bad_reviews:
        content = review.content or ""
        for kw in keyword_list:
            if kw in content:
                keywords[kw] = keywords.get(kw, 0) + 1
    
    return {
        "rating_distribution": {
            str(r.rating): r.count for r in rating_stats
        },
        "total_reviews": total_reviews,
        "positive_rate": positive_rate,
        "negative_keywords": dict(sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:5])
    }


@router.get("/revenue-summary")
async def get_revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取营收汇总数据
    """
    # 今日数据
    today = datetime.utcnow().strftime("%Y-%m-%d")
    today_stats = db.query(
        func.sum(StatsDaily.order_count).label("count"),
        func.sum(StatsDaily.order_amount).label("amount")
    ).filter(StatsDaily.date == today).first()
    
    # 本月数据
    month_start = datetime.utcnow().replace(day=1).strftime("%Y-%m-%d")
    month_stats = db.query(
        func.sum(StatsDaily.order_count).label("count"),
        func.sum(StatsDaily.order_amount).label("amount")
    ).filter(StatsDaily.date >= month_start).first()
    
    # 同比上月
    last_month_end = datetime.utcnow().replace(day=1) - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    last_month_stats = db.query(
        func.sum(StatsDaily.order_count).label("count"),
        func.sum(StatsDaily.order_amount).label("amount")
    ).filter(
        StatsDaily.date >= last_month_start.strftime("%Y-%m-%d"),
        StatsDaily.date <= last_month_end.strftime("%Y-%m-%d")
    ).first()
    
    # 计算环比
    current_amount = float(month_stats.amount or 0)
    last_amount = float(last_month_stats.amount or 0)
    month_growth = round((current_amount - last_amount) / last_amount * 100, 1) if last_amount > 0 else 0
    
    return {
        "today": {
            "order_count": today_stats.count or 0,
            "order_amount": round(float(today_stats.amount or 0), 2)
        },
        "month": {
            "order_count": month_stats.count or 0,
            "order_amount": round(current_amount, 2),
            "growth": month_growth
        }
    }
