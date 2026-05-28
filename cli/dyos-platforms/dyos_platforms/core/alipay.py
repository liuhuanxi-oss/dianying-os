"""
支付宝/口碑 CLI实现

支持门店管理、商品管理、会员管理、支付对账
"""

from typing import Dict, Any
from dyos_platforms.core.base import PlatformCLI


class AlipayCLI(PlatformCLI):
    """支付宝/口碑 CLI"""
    
    platform_name = "支付宝/口碑"
    platform_code = "alipay"
    api_base_url = "https://openapi.alipay.com"
    auth_type = "oauth2"
    
    def __init__(self, use_mock: bool = True, json_output: bool = False):
        super().__init__(use_mock, json_output)
    
    def member_query(self, phone: str = None, **kwargs) -> Dict[str, Any]:
        """查询会员信息"""
        if self.use_mock:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_member(self.platform_code, phone)
            }
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def payment_reconcile(self, date: str = None, **kwargs) -> Dict[str, Any]:
        """支付对账"""
        if self.use_mock:
            import datetime
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_payment_reconcile(
                    self.platform_code, 
                    date or datetime.datetime.now().strftime("%Y-%m-%d")
                )
            }
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _shop_list_impl(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _shop_detail_impl(self, shop_id: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _product_list_impl(self, shop_id: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _product_sync_impl(self, source: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _order_list_impl(self, shop_id: str = None, status: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _review_list_impl(self, shop_id: str = None, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _review_reply_impl(self, review_id: str, content: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _marketing_create_impl(self,营销_type: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
    
    def _analytics_overview_impl(self, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("请配置支付宝API Key后使用真实API")
