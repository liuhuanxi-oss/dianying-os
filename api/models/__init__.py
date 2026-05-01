"""
店赢OS管理后台API - 数据模型定义
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class StatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"
    expiring = "expiring"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    resolved = "resolved"
    published = "published"
    draft = "draft"
    online = "online"
    offline = "offline"


class VersionEnum(str, Enum):
    free = "免费版"
    pro = "专业版"
    premium = "旗舰版"


class LevelEnum(str, Enum):
    silver = "silver"
    gold = "gold"
    diamond = "diamond"


class Merchant(BaseModel):
    id: int
    name: str
    industry: str = "餐饮"
    version: str = "免费版"
    status: str = "active"
    register_time: str = ""
    expire_time: str = ""
    gmv: float = 0
    orders: int = 0
    rating: float = 0
    ai_usage: int = 0
    phone: Optional[str] = ""
    contact: Optional[str] = ""
    address: Optional[str] = ""


class Agent(BaseModel):
    id: int
    name: str
    level: str = "silver"
    merchants: int = 0
    monthly_gmv: float = 0
    status: str = "active"
    join_time: str = ""
    contact: Optional[str] = ""
    region: Optional[str] = ""


class SalesPerson(BaseModel):
    id: int
    name: str
    phone: str = ""
    region: str = ""
    status: str = "active"
    customers: int = 0
    this_month_sign: int = 0


class Transaction(BaseModel):
    id: str
    merchant: str
    amount: float
    type: str = "subscription"
    status: str = "success"
    time: str = ""


class Ticket(BaseModel):
    id: str
    merchant: str
    type: str = ""
    title: str = ""
    status: str = "open"
    priority: str = "medium"
    create_time: str = ""
    assignee: str = ""


class Response(BaseModel):
    code: int = 0
    message: str = ""
    data: Any = None


class PaginatedResponse(BaseModel):
    code: int = 0
    message: str = ""
    data: dict = Field(default_factory=dict)


class PaginationParams(BaseModel):
    page: int = 1
    size: int = 20
    total: int = 0
