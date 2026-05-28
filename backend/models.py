# -*- coding: utf-8 -*-
"""
数据库模型
包含User/Store/Review/Order/StatsDaily/Merchant等7张表
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, 
    ForeignKey, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    MERCHANT = "merchant"
    PLATFORM = "platform"
    AGENT = "agent"


class ReviewStatus(str, enum.Enum):
    """评价状态枚举"""
    PENDING = "pending"      # 待处理
    REPLIED = "replied"      # 已回复
    HIDDEN = "hidden"       # 已隐藏
    DELETED = "deleted"     # 已删除


class MerchantStatus(str, enum.Enum):
    """商户状态枚举"""
    PENDING = "pending"      # 待审核
    APPROVED = "approved"    # 已通过
    REJECTED = "rejected"    # 已拒绝
    SUSPENDED = "suspended" # 已暂停


class OrderStatus(str, enum.Enum):
    """订单状态枚举"""
    PENDING = "pending"      # 待处理
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消
    REFUNDED = "refunded"    # 已退款


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, index=True)
    email = Column(String(100))
    role = Column(SQLEnum(UserRole), default=UserRole.MERCHANT)
    name = Column(String(100))
    avatar = Column(String(500))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    stores = relationship("Store", back_populates="owner")
    merchant = relationship("Merchant", back_populates="user", uselist=False, foreign_keys="Merchant.user_id")


class Store(Base):
    """门店表"""
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    address = Column(String(500))
    phone = Column(String(20))
    category = Column(String(50), index=True)
    description = Column(Text)
    logo = Column(String(500))
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    order_count = Column(Integer, default=0)
    status = Column(Boolean, default=True)
    
    # 关联
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="stores")
    reviews = relationship("Review", back_populates="store")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Review(Base):
    """评价表"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), index=True)
    user_name = Column(String(100))
    rating = Column(Integer)  # 1-5星
    content = Column(Text)
    images = Column(Text)  # JSON数组存储图片URL
    status = Column(SQLEnum(ReviewStatus), default=ReviewStatus.PENDING)
    ai_reply = Column(Text)  # AI回复内容
    merchant_reply = Column(Text)  # 商户回复
    reply_time = Column(DateTime)
    
    # 关联
    store = relationship("Store", back_populates="reviews")
    order = relationship("Order", back_populates="review")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    """订单表"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(50), unique=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), index=True)
    user_name = Column(String(100))
    user_phone = Column(String(20))
    total_amount = Column(Float, default=0)
    discount_amount = Column(Float, default=0)
    final_amount = Column(Float, default=0)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    payment_method = Column(String(20))  # alipay/wechat/cash
    payment_time = Column(DateTime)
    
    # 关联
    store = relationship("Store")
    review = relationship("Review", back_populates="order", uselist=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StatsDaily(Base):
    """每日统计表"""
    __tablename__ = "stats_daily"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True)  # YYYY-MM-DD格式
    store_id = Column(Integer, ForeignKey("stores.id"), index=True)
    
    # 统计数据
    order_count = Column(Integer, default=0)
    order_amount = Column(Float, default=0)
    review_count = Column(Integer, default=0)
    new_user_count = Column(Integer, default=0)
    
    # 评分统计
    avg_rating = Column(Float, default=5.0)
    positive_count = Column(Integer, default=0)  # 好评数
    negative_count = Column(Integer, default=0)  # 差评数
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Merchant(Base):
    """商户入驻表"""
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # 商户信息
    company_name = Column(String(200), nullable=False)
    business_license = Column(String(500))  # 营业执照URL
    legal_person = Column(String(50))  # 法人姓名
    contact_phone = Column(String(20))
    contact_email = Column(String(100))
    
    # 审核信息
    status = Column(SQLEnum(MerchantStatus), default=MerchantStatus.PENDING)
    review_comment = Column(Text)  # 审核意见
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    
    # 关联
    user = relationship("User", back_populates="merchant", foreign_keys=[user_id], remote_side="User.id")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reviewed_at = Column(DateTime)
