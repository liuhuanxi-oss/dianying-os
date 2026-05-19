# -*- coding: utf-8 -*-
"""
评价路由
包含评价列表、AI回复、状态更新等功能
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Review, Store, User, ReviewStatus
from routes.auth import get_current_active_user

router = APIRouter()


# ========== 请求/响应模型 ==========

class ReviewResponse(BaseModel):
    """评价响应"""
    id: int
    store_id: int
    store_name: str
    user_name: str
    rating: int
    content: str
    images: Optional[List[str]] = []
    status: str
    ai_reply: Optional[str] = None
    merchant_reply: Optional[str] = None
    reply_time: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """评价列表响应"""
    total: int
    page: int
    page_size: int
    items: List[ReviewResponse]


class ReviewReplyRequest(BaseModel):
    """回复请求"""
    content: str


class ReviewStatusRequest(BaseModel):
    """状态更新请求"""
    status: str


# ========== AI回复模板 ==========

AI_REPLY_TEMPLATES = {
    1: "感谢您的反馈，我们对此深感抱歉。对于您遇到的问题，我们已经记录并反馈给相关部门处理。我们承诺会不断改进服务，为您提供更好的体验。",
    2: "感谢您的反馈。我们理解您的感受，已将问题反馈给门店负责人。期待下次能为您带来更好的服务体验。",
    3: "感谢您的宝贵意见。我们会认真对待每一条评价，持续改进。感谢您选择我们！",
    4: "感谢您的好评！我们会继续努力，为您提供更优质的服务！",
    5: "感谢您的五星好评！您的支持是我们最大的动力！期待下次为您服务！"
}


# ========== 路由 ==========

@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    store_id: Optional[int] = None,
    status: Optional[str] = None,
    rating: Optional[int] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取评价列表
    支持分页、门店筛选、状态筛选、评分筛选、关键词搜索
    """
    query = db.query(Review).join(Store)
    
    # 门店筛选
    if store_id:
        query = query.filter(Review.store_id == store_id)
    
    # 状态筛选
    if status:
        query = query.filter(Review.status == status)
    
    # 评分筛选
    if rating:
        query = query.filter(Review.rating == rating)
    
    # 关键词搜索
    if keyword:
        query = query.filter(
            Review.content.contains(keyword) | 
            Review.user_name.contains(keyword) |
            Store.name.contains(keyword)
        )
    
    # 获取总数
    total = query.count()
    
    # 分页
    offset = (page - 1) * page_size
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(page_size).all()
    
    return ReviewListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            ReviewResponse(
                id=r.id,
                store_id=r.store_id,
                store_name=r.store.name if r.store else "",
                user_name=r.user_name,
                rating=r.rating,
                content=r.content,
                images=parse_images(r.images),
                status=r.status.value if r.status else "pending",
                ai_reply=r.ai_reply,
                merchant_reply=r.merchant_reply,
                reply_time=r.reply_time.isoformat() if r.reply_time else None,
                created_at=r.created_at.isoformat() if r.created_at else ""
            )
            for r in reviews
        ]
    )


def parse_images(images_json: Optional[str]) -> List[str]:
    """解析图片JSON"""
    if not images_json:
        return []
    try:
        import json
        return json.loads(images_json)
    except:
        return []


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取评价详情
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="评价不存在")
    
    return ReviewResponse(
        id=review.id,
        store_id=review.store_id,
        store_name=review.store.name if review.store else "",
        user_name=review.user_name,
        rating=review.rating,
        content=review.content,
        images=parse_images(review.images),
        status=review.status.value if review.status else "pending",
        ai_reply=review.ai_reply,
        merchant_reply=review.merchant_reply,
        reply_time=review.reply_time.isoformat() if review.reply_time else None,
        created_at=review.created_at.isoformat() if review.created_at else ""
    )


@router.post("/{review_id}/ai-reply")
async def generate_ai_reply(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    生成AI回复
    根据评价星级生成相应的回复内容
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="评价不存在")
    
    # 根据评分生成回复
    ai_reply = AI_REPLY_TEMPLATES.get(review.rating, AI_REPLY_TEMPLATES[3])
    
    # 保存AI回复
    review.ai_reply = ai_reply
    review.reply_time = datetime.utcnow()
    db.commit()
    
    return {
        "message": "AI回复已生成",
        "ai_reply": ai_reply
    }


@router.post("/{review_id}/reply")
async def reply_review(
    review_id: int,
    reply_data: ReviewReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    商户回复评价
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="评价不存在")
    
    # 检查权限
    store = db.query(Store).filter(Store.id == review.store_id).first()
    if store and store.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权回复此评价")
    
    # 保存回复
    review.merchant_reply = reply_data.content
    review.reply_time = datetime.utcnow()
    review.status = ReviewStatus.REPLIED
    db.commit()
    
    return {"message": "回复成功"}


@router.put("/{review_id}/status")
async def update_review_status(
    review_id: int,
    status_data: ReviewStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新评价状态
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="评价不存在")
    
    # 验证状态值
    try:
        new_status = ReviewStatus(status_data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的状态值")
    
    review.status = new_status
    db.commit()
    
    return {"message": "状态更新成功"}


@router.get("/stats/overview")
async def get_review_stats(
    db: Session = Depends(get_db)
):
    """
    获取评价统计概览
    """
    total = db.query(Review).count()
    pending = db.query(Review).filter(Review.status == ReviewStatus.PENDING).count()
    replied = db.query(Review).filter(Review.status == ReviewStatus.REPLIED).count()
    hidden = db.query(Review).filter(Review.status == ReviewStatus.HIDDEN).count()
    
    # 评分分布
    rating_1 = db.query(Review).filter(Review.rating == 1).count()
    rating_2 = db.query(Review).filter(Review.rating == 2).count()
    rating_3 = db.query(Review).filter(Review.rating == 3).count()
    rating_4 = db.query(Review).filter(Review.rating == 4).count()
    rating_5 = db.query(Review).filter(Review.rating == 5).count()
    
    # 平均评分
    avg_rating = db.query(Review).all()
    avg = sum([r.rating for r in avg_rating]) / len(avg_rating) if avg_rating else 0
    
    return {
        "total": total,
        "pending": pending,
        "replied": replied,
        "hidden": hidden,
        "avg_rating": round(avg, 1),
        "rating_distribution": {
            "1": rating_1,
            "2": rating_2,
            "3": rating_3,
            "4": rating_4,
            "5": rating_5
        }
    }
