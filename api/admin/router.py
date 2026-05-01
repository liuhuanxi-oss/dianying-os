"""
店赢OS管理后台API - 路由汇总
包含13大核心模块的路由注册
"""
from fastapi import APIRouter
from . import (
    merchants, agents, sales, finance, content, analytics,
    payment, customer, channel, support, product, security, settings
)
from . import payment_routes

router = APIRouter(prefix="/admin", tags=["管理后台"])

# 商户管理模块 - 商户入驻、审核、权限配置
router.include_router(merchants.router, prefix="/merchants", tags=["商户管理"])

# 代理商体系模块 - 代理商管理、佣金分润
router.include_router(agents.router, prefix="/agents", tags=["代理商体系"])

# 业务人员模块 - 业务员管理、业绩追踪
router.include_router(sales.router, prefix="/sales", tags=["业务人员"])

# 财务中心模块 - 收入统计、账单管理、退款审批、发票申请
router.include_router(finance.router, prefix="/finance", tags=["财务中心"])

# 内容运营模块 - 知识库、公告、运营活动
router.include_router(content.router, prefix="/content", tags=["内容运营"])

# 数据洞察模块 - 平台总览、GMV趋势、AI使用统计
router.include_router(analytics.router, prefix="/analytics", tags=["数据洞察"])

# 支付交易模块 - 交易流水、费率配置、分账管理
router.include_router(payment.router, prefix="/payment", tags=["支付交易"])

# 天阙支付模块 - 对接天阙开放平台支付能力
router.include_router(payment_routes.router, prefix="/payment-tianque", tags=["天阙支付"])

# 客户成功模块 - Onboarding、健康度、续费管理
router.include_router(customer.router, prefix="/customer", tags=["客户成功"])

# 渠道增长模块 - 渠道分析、邀请裂变、合作伙伴
router.include_router(channel.router, prefix="/channel", tags=["渠道增长"])

# 客服支持模块 - 工单管理、FAQ、满意度调研
router.include_router(support.router, prefix="/support", tags=["客服支持"])

# 产品迭代模块 - 功能开关、AB测试、需求池
router.include_router(product.router, prefix="/product", tags=["产品迭代"])

# 安全合规模块 - 登录日志、数据脱敏、合规审计
router.include_router(security.router, prefix="/security", tags=["安全合规"])

# 系统设置模块 - 角色权限、操作日志、定价配置
router.include_router(settings.router, prefix="/settings", tags=["系统设置"])
