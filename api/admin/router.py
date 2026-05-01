"""
店赢OS管理后台API - 路由汇总
"""
from fastapi import APIRouter
from . import (
    merchants, agents, sales, finance, content, analytics,
    payment, customer, channel, support, product, security, settings
)

router = APIRouter(prefix="/admin", tags=["管理后台"])

router.include_router(merchants.router, prefix="/merchants", tags=["商家管理"])
router.include_router(agents.router, prefix="/agents", tags=["代理商体系"])
router.include_router(sales.router, prefix="/sales", tags=["业务人员"])
router.include_router(finance.router, prefix="/finance", tags=["财务中心"])
router.include_router(content.router, prefix="/content", tags=["内容运营"])
router.include_router(analytics.router, prefix="/analytics", tags=["数据洞察"])
router.include_router(payment.router, prefix="/payment", tags=["支付交易"])
router.include_router(customer.router, prefix="/customer", tags=["客户成功"])
router.include_router(channel.router, prefix="/channel", tags=["渠道增长"])
router.include_router(support.router, prefix="/support", tags=["客服支持"])
router.include_router(product.router, prefix="/product", tags=["产品迭代"])
router.include_router(security.router, prefix="/security", tags=["安全合规"])
router.include_router(settings.router, prefix="/settings", tags=["系统设置"])
