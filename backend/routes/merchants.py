# -*- coding: utf-8 -*-
"""
商户路由
包含入驻申请、审核等功能
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Merchant, User, MerchantStatus, UserRole
from routes.auth import get_current_active_user

router = APIRouter()


# ========== 请求/响应模型 ==========

class MerchantBase(BaseModel):
    """商户基础模型"""
    company_name: str
    legal_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    business_license: Optional[str] = None


class MerchantApply(MerchantBase):
    """入驻申请请求"""
    pass


class MerchantUpdate(BaseModel):
    """商户更新模型"""
    company_name: Optional[str] = None
    legal_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    business_license: Optional[str] = None


class MerchantReview(BaseModel):
    """审核请求"""
    status: str
    comment: Optional[str] = None


class MerchantResponse(MerchantBase):
    """商户响应"""
    id: int
    user_id: int
    user_name: str
    status: str
    review_comment: Optional[str]
    created_at: str
    reviewed_at: Optional[str]
    
    class Config:
        from_attributes = True


class MerchantListResponse(BaseModel):
    """商户列表响应"""
    total: int
    page: int
    page_size: int
    items: List[MerchantResponse]


# ========== 路由 ==========

@router.get("/my")
async def get_my_merchant(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取当前用户的商户信息
    """
    merchant = db.query(Merchant).filter(Merchant.user_id == current_user.id).first()
    
    if not merchant:
        return {"merchant": None, "status": "未申请"}
    
    return {
        "merchant": MerchantResponse(
            id=merchant.id,
            user_id=merchant.user_id,
            user_name=current_user.name,
            company_name=merchant.company_name,
            legal_person=merchant.legal_person,
            contact_phone=merchant.contact_phone,
            contact_email=merchant.contact_email,
            business_license=merchant.business_license,
            status=merchant.status.value,
            review_comment=merchant.review_comment,
            created_at=merchant.created_at.isoformat() if merchant.created_at else "",
            reviewed_at=merchant.reviewed_at.isoformat() if merchant.reviewed_at else None
        ),
        "status": merchant.status.value
    }


@router.post("/apply", response_model=MerchantResponse)
async def apply_merchant(
    apply_data: MerchantApply,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    申请入驻
    """
    # 检查是否已有申请
    existing = db.query(Merchant).filter(Merchant.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已有入驻申请")
    
    # 创建申请
    merchant = Merchant(
        user_id=current_user.id,
        company_name=apply_data.company_name,
        legal_person=apply_data.legal_person,
        contact_phone=apply_data.contact_phone,
        contact_email=apply_data.contact_email,
        business_license=apply_data.business_license,
        status=MerchantStatus.PENDING
    )
    
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    
    return MerchantResponse(
        id=merchant.id,
        user_id=merchant.user_id,
        user_name=current_user.name,
        company_name=merchant.company_name,
        legal_person=merchant.legal_person,
        contact_phone=merchant.contact_phone,
        contact_email=merchant.contact_email,
        business_license=merchant.business_license,
        status=merchant.status.value,
        review_comment=merchant.review_comment,
        created_at=merchant.created_at.isoformat() if merchant.created_at else "",
        reviewed_at=None
    )


@router.get("/list", response_model=MerchantListResponse)
async def list_merchants(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取商户列表（平台管理员）
    """
    # 检查权限
    if current_user.role not in [UserRole.ADMIN, UserRole.PLATFORM]:
        raise HTTPException(status_code=403, detail="无权访问")
    
    query = db.query(Merchant).join(User)
    
    # 状态筛选
    if status:
        query = query.filter(Merchant.status == status)
    
    # 关键词搜索
    if keyword:
        query = query.filter(
            Merchant.company_name.contains(keyword) |
            User.name.contains(keyword)
        )
    
    # 获取总数
    total = query.count()
    
    # 分页
    offset = (page - 1) * page_size
    merchants = query.order_by(Merchant.created_at.desc()).offset(offset).limit(page_size).all()
    
    return MerchantListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            MerchantResponse(
                id=m.id,
                user_id=m.user_id,
                user_name=m.user.name if m.user else "",
                company_name=m.company_name,
                legal_person=m.legal_person,
                contact_phone=m.contact_phone,
                contact_email=m.contact_email,
                business_license=m.business_license,
                status=m.status.value,
                review_comment=m.review_comment,
                created_at=m.created_at.isoformat() if m.created_at else "",
                reviewed_at=m.reviewed_at.isoformat() if m.reviewed_at else None
            )
            for m in merchants
        ]
    )


@router.get("/{merchant_id}", response_model=MerchantResponse)
async def get_merchant(
    merchant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取商户详情
    """
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="商户不存在")
    
    # 检查权限
    if merchant.user_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.PLATFORM]:
        raise HTTPException(status_code=403, detail="无权访问")
    
    return MerchantResponse(
        id=merchant.id,
        user_id=merchant.user_id,
        user_name=merchant.user.name if merchant.user else "",
        company_name=merchant.company_name,
        legal_person=merchant.legal_person,
        contact_phone=merchant.contact_phone,
        contact_email=merchant.contact_email,
        business_license=merchant.business_license,
        status=merchant.status.value,
        review_comment=merchant.review_comment,
        created_at=merchant.created_at.isoformat() if merchant.created_at else "",
        reviewed_at=merchant.reviewed_at.isoformat() if merchant.reviewed_at else None
    )


@router.put("/{merchant_id}/review")
async def review_merchant(
    merchant_id: int,
    review_data: MerchantReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    审核商户（平台管理员）
    """
    # 检查权限
    if current_user.role not in [UserRole.ADMIN, UserRole.PLATFORM]:
        raise HTTPException(status_code=403, detail="无权访问")
    
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="商户不存在")
    
    if merchant.status != MerchantStatus.PENDING:
        raise HTTPException(status_code=400, detail="该申请已审核")
    
    # 验证状态值
    try:
        new_status = MerchantStatus(review_data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的状态值")
    
    # 更新审核结果
    merchant.status = new_status
    merchant.review_comment = review_data.comment
    merchant.reviewer_id = current_user.id
    merchant.reviewed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "审核完成"}


@router.put("/{merchant_id}", response_model=MerchantResponse)
async def update_merchant(
    merchant_id: int,
    update_data: MerchantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新商户信息
    """
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="商户不存在")
    
    # 只能修改自己的申请，且必须是待审核状态
    if merchant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权修改")
    
    if merchant.status != MerchantStatus.PENDING:
        raise HTTPException(status_code=400, detail="只有待审核的申请可以修改")
    
    # 更新字段
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(merchant, key, value)
    
    db.commit()
    db.refresh(merchant)
    
    return MerchantResponse(
        id=merchant.id,
        user_id=merchant.user_id,
        user_name=merchant.user.name if merchant.user else "",
        company_name=merchant.company_name,
        legal_person=merchant.legal_person,
        contact_phone=merchant.contact_phone,
        contact_email=merchant.contact_email,
        business_license=merchant.business_license,
        status=merchant.status.value,
        review_comment=merchant.review_comment,
        created_at=merchant.created_at.isoformat() if merchant.created_at else "",
        reviewed_at=merchant.reviewed_at.isoformat() if merchant.reviewed_at else None
    )
