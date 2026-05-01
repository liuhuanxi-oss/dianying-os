"""
店赢OS CLI - 核心命令模块
"""
from .merchant import merchant_group
from .agent import agent_group
from .sales import sales_group
from .finance import finance_group
from .analytics import analytics_group
from .payment import payment_group
from .customer import customer_group
from .channel import channel_group
from .support import support_group
from .product import product_group
from .security import security_group
from .settings import settings_group

__all__ = [
    "merchant_group",
    "agent_group",
    "sales_group",
    "finance_group",
    "analytics_group",
    "payment_group",
    "customer_group",
    "channel_group",
    "support_group",
    "product_group",
    "security_group",
    "settings_group",
]
