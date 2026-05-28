# -*- coding: utf-8 -*-
"""
门店路由
包含门店CRUD操作
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Store, User
from routes.auth import get_current_active_user

router = APIRouter()


# ========== 请求/响应模型 ==========

class StoreBase(BaseModel):
    """门店基础模型"""
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None


class StoreCreate(StoreBase):
    """创建门店请求"""
    pass


class StoreUpdate(BaseModel):
    """更新门店请求"""
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[bool] = None


class StoreResponse(StoreBase):
    """门店响应"""
    id: int
    rating: float
    review_count: int
    order_count: int
    status: bool
    owner_id: int
    created_at: str
    
    class Config:
        from_attributes = True


class StoreListResponse(BaseModel):
    """门店列表响应"""
    total: int
    page: int
    page_size: int
    items: List[StoreResponse]


# ========== 路由 ==========

@router.get("", response_model=StoreListResponse)
async def list_stores(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取门店列表
    支持分页、关键词搜索、分类筛选
    """
    query = db.query(Store)
    
    # 关键词搜索
    if keyword:
        query = query.filter(Store.name.contains(keyword) | Store.address.contains(keyword))
    
    # 分类筛选
    if category:
        query = query.filter(Store.category == category)
    
    # 状态筛选
    if status is not None:
        query = query.filter(Store.status == status)
    
    # 获取总数
    total = query.count()
    
    # 分页
    offset = (page - 1) * page_size
    stores = query.order_by(Store.created_at.desc()).offset(offset).limit(page_size).all()
    
    return StoreListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            StoreResponse(
                id=s.id,
                name=s.name,
                address=s.address,
                phone=s.phone,
                category=s.category,
                description=s.description,
                logo=s.logo,
                rating=s.rating,
                review_count=s.review_count,
                order_count=s.order_count,
                status=s.status,
                owner_id=s.owner_id,
                created_at=s.created_at.isoformat() if s.created_at else ""
            )
            for s in stores
        ]
    )


@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取门店详情
    """
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")
    
    return StoreResponse(
        id=store.id,
        name=store.name,
        address=store.address,
        phone=store.phone,
        category=store.category,
        description=store.description,
        logo=store.logo,
        rating=store.rating,
        review_count=store.review_count,
        order_count=store.order_count,
        status=store.status,
        owner_id=store.owner_id,
        created_at=store.created_at.isoformat() if store.created_at else ""
    )


@router.post("", response_model=StoreResponse)
async def create_store(
    store_data: StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建门店
    """
    # 检查名称是否重复
    existing = db.query(Store).filter(Store.name == store_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="门店名称已存在")
    
    store = Store(
        **store_data.dict(),
        owner_id=current_user.id
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    
    return StoreResponse(
        id=store.id,
        name=store.name,
        address=store.address,
        phone=store.phone,
        category=store.category,
        description=store.description,
        logo=store.logo,
        rating=store.rating,
        review_count=store.review_count,
        order_count=store.order_count,
        status=store.status,
        owner_id=store.owner_id,
        created_at=store.created_at.isoformat() if store.created_at else ""
    )


@router.put("/{store_id}", response_model=StoreResponse)
async def update_store(
    store_id: int,
    store_data: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新门店信息
    """
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")
    
    # 只能修改自己的门店
    if store.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权修改此门店")
    
    # 更新字段
    update_data = store_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(store, key, value)
    
    db.commit()
    db.refresh(store)
    
    return StoreResponse(
        id=store.id,
        name=store.name,
        address=store.address,
        phone=store.phone,
        category=store.category,
        description=store.description,
        logo=store.logo,
        rating=store.rating,
        review_count=store.review_count,
        order_count=store.order_count,
        status=store.status,
        owner_id=store.owner_id,
        created_at=store.created_at.isoformat() if store.created_at else ""
    )


@router.delete("/{store_id}")
async def delete_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除门店
    """
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")
    
    # 只能删除自己的门店
    if store.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权删除此门店")
    
    db.delete(store)
    db.commit()
    
    return {"message": "删除成功"}


@router.get("/categories/list")
async def list_categories(
    db: Session = Depends(get_db)
):
    """
    获取所有门店分类
    """
    categories = db.query(Store.category).distinct().filter(Store.category.isnot(None)).all()
    return {"categories": [c[0] for c in categories if c[0]]}
