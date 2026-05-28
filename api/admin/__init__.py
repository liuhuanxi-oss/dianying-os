"""
店赢OS管理后台API - Admin模块
"""
from .merchants import router as merchants_router
from .agents import router as agents_router
from .sales import router as sales_router
from .finance import router as finance_router
from .content import router as content_router
from .analytics import router as analytics_router
from .payment import router as payment_router
from .customer import router as customer_router
from .channel import router as channel_router
from .support import router as support_router
from .product import router as product_router
from .security import router as security_router
from .settings import router as settings_router

__all__ = [
    "merchants_router",
    "agents_router",
    "sales_router",
    "finance_router",
    "content_router",
    "analytics_router",
    "payment_router",
    "customer_router",
    "channel_router",
    "support_router",
    "product_router",
    "security_router",
    "settings_router",
]
