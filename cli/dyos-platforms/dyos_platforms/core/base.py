"""
平台CLI基类

定义8大平台统一的CLI接口规范
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dyos_platforms.mock.data import MockData
from dyos_platforms.utils.output import OutputFormatter


class PlatformCLI(ABC):
    """平台CLI基类 - 统一8大平台的交互范式"""
    
    # 平台基本信息（子类必须定义）
    platform_name: str = "未知平台"
    platform_code: str = "unknown"
    api_base_url: str = ""
    auth_type: str = "api_key"  # oauth2 or api_key
    
    def __init__(self, use_mock: bool = True, json_output: bool = False):
        """初始化平台CLI
        
        Args:
            use_mock: 是否使用Mock数据
            json_output: 是否输出JSON格式
        """
        self.use_mock = use_mock
        self.output = OutputFormatter(json_output=json_output)
        self.mock = MockData()
    
    # ==================== 店铺管理 ====================
    
    def shop_list(self, **kwargs) -> Dict[str, Any]:
        """获取店铺列表
        
        Args:
            city: 城市筛选
            status: 状态筛选
            
        Returns:
            店铺列表数据
        """
        if self.use_mock:
            count = kwargs.get("count", 5)
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_shops(self.platform_code, count)
            }
        return self._shop_list_impl(**kwargs)
    
    @abstractmethod
    def _shop_list_impl(self, **kwargs) -> Dict[str, Any]:
        """店铺列表实现（子类实现真实API）"""
        pass
    
    def shop_detail(self, shop_id: str, **kwargs) -> Dict[str, Any]:
        """获取店铺详情
        
        Args:
            shop_id: 店铺ID
            
        Returns:
            店铺详情数据
        """
        if self.use_mock:
            shops = self.mock.generate_shops(self.platform_code, 10)
            shop = next((s for s in shops if s["id"] == shop_id), shops[0])
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": shop
            }
        return self._shop_detail_impl(shop_id, **kwargs)
    
    @abstractmethod
    def _shop_detail_impl(self, shop_id: str, **kwargs) -> Dict[str, Any]:
        """店铺详情实现"""
        pass
    
    # ==================== 商品管理 ====================
    
    def product_list(self, shop_id: str = None, **kwargs) -> Dict[str, Any]:
        """获取商品列表
        
        Args:
            shop_id: 店铺ID
            category: 分类筛选
            
        Returns:
            商品列表数据
        """
        if self.use_mock:
            count = kwargs.get("count", 10)
            shop_id = shop_id or f"{self.platform_code.upper()[:2]}001"
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_products(shop_id, count)
            }
        return self._product_list_impl(shop_id, **kwargs)
    
    @abstractmethod
    def _product_list_impl(self, shop_id: str = None, **kwargs) -> Dict[str, Any]:
        """商品列表实现"""
        pass
    
    def product_sync(self, source: str = "dyos", **kwargs) -> Dict[str, Any]:
        """同步商品（从店赢OS或其他平台同步）
        
        Args:
            source: 来源平台
            
        Returns:
            同步结果
        """
        if self.use_mock:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "synced_count": 25,
                    "source": source,
                    "products": self.mock.generate_products("SYNC001", 25),
                    "synced_at": "2026-04-30T12:00:00+08:00"
                }
            }
        return self._product_sync_impl(source, **kwargs)
    
    @abstractmethod
    def _product_sync_impl(self, source: str, **kwargs) -> Dict[str, Any]:
        """商品同步实现"""
        pass
    
    # ==================== 订单管理 ====================
    
    def order_list(self, shop_id: str = None, status: str = None, **kwargs) -> Dict[str, Any]:
        """获取订单列表
        
        Args:
            shop_id: 店铺ID
            status: 订单状态
            days: 查询天数
            
        Returns:
            订单列表数据
        """
        if self.use_mock:
            shop_id = shop_id or f"{self.platform_code.upper()[:2]}001"
            count = kwargs.get("count", 5)
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_orders(self.platform_code, shop_id, status, count)
            }
        return self._order_list_impl(shop_id, status, **kwargs)
    
    @abstractmethod
    def _order_list_impl(self, shop_id: str = None, status: str = None, **kwargs) -> Dict[str, Any]:
        """订单列表实现"""
        pass
    
    # ==================== 评价管理 ====================
    
    def review_list(self, shop_id: str = None, days: int = 7, **kwargs) -> Dict[str, Any]:
        """获取评价列表
        
        Args:
            shop_id: 店铺ID
            days: 查询天数
            rating: 评分筛选
            
        Returns:
            评价列表数据
        """
        if self.use_mock:
            shop_id = shop_id or f"{self.platform_code.upper()[:2]}001"
            count = kwargs.get("count", 5)
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_reviews(self.platform_code, shop_id, count, days)
            }
        return self._review_list_impl(shop_id, days, **kwargs)
    
    @abstractmethod
    def _review_list_impl(self, shop_id: str = None, days: int = 7, **kwargs) -> Dict[str, Any]:
        """评价列表实现"""
        pass
    
    def review_reply(self, review_id: str, content: str, **kwargs) -> Dict[str, Any]:
        """回复评价
        
        Args:
            review_id: 评价ID
            content: 回复内容
            
        Returns:
            回复结果
        """
        if self.use_mock:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "review_id": review_id,
                    "reply_content": content,
                    "replied_at": "2026-04-30T12:00:00+08:00",
                    "status": "success"
                }
            }
        return self._review_reply_impl(review_id, content, **kwargs)
    
    @abstractmethod
    def _review_reply_impl(self, review_id: str, content: str, **kwargs) -> Dict[str, Any]:
        """回复评价实现"""
        pass
    
    # ==================== 营销管理 ====================
    
    def marketing_create(self,营销_type: str = "coupon", **kwargs) -> Dict[str, Any]:
        """创建营销活动
        
        Args:
            营销_type: 活动类型 (coupon, discount, gift)
            name: 活动名称
            amount: 优惠金额
            threshold: 使用门槛
            
        Returns:
            营销活动数据
        """
        if self.use_mock:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_marketing(self.platform_code,营销_type)
            }
        return self._marketing_create_impl(营销_type, **kwargs)
    
    @abstractmethod
    def _marketing_create_impl(self,营销_type: str, **kwargs) -> Dict[str, Any]:
        """营销活动创建实现"""
        pass
    
    # ==================== 数据分析 ====================
    
    def analytics_overview(self, days: int = 7, **kwargs) -> Dict[str, Any]:
        """获取经营概览
        
        Args:
            days: 统计天数
            
        Returns:
            经营数据
        """
        if self.use_mock:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_analytics(self.platform_code, days)
            }
        return self._analytics_overview_impl(days, **kwargs)
    
    @abstractmethod
    def _analytics_overview_impl(self, days: int, **kwargs) -> Dict[str, Any]:
        """经营概览实现"""
        pass
    
    # ==================== 工具方法 ====================
    
    def call_api(self, method: str, path: str, params: Dict = None, data: Dict = None) -> Dict[str, Any]:
        """调用API（模板方法）"""
        # 子类实现真实API调用
        raise NotImplementedError("子类必须实现API调用方法")
    
    def get_platform_info(self) -> Dict[str, Any]:
        """获取平台信息"""
        return {
            "platform_name": self.platform_name,
            "platform_code": self.platform_code,
            "api_base_url": self.api_base_url,
            "auth_type": self.auth_type,
            "use_mock": self.use_mock
        }
    
    def verify_response(self, data: Dict) -> bool:
        """验证API响应"""
        return data.get("code") == 0 or data.get("errno") == 0
