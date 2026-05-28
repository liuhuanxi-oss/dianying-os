"""
百度地图 CLI实现

支持POI搜索、地理编码、门店定位
真实API调用（API Key免费注册即可获取）
"""

import os
import json
import hashlib
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
from dyos_platforms.core.base import PlatformCLI


class BaiduCLI(PlatformCLI):
    """百度地图 CLI"""
    
    platform_name = "百度地图"
    platform_code = "baidu"
    api_base_url = "https://api.map.baidu.com"
    auth_type = "api_key"
    
    def __init__(self, use_mock: bool = True, json_output: bool = False):
        super().__init__(use_mock, json_output)
        
        # 获取API Key
        self.api_key = os.getenv("BAIDU_AK", "")
        self.secret_key = os.getenv("BAIDU_SK", "")
        
        if not self.api_key:
            from dyos_platforms.config import get_platform_credential
            cred = get_platform_credential("baidu")
            self.api_key = cred.get("ak", "")
            self.secret_key = cred.get("sk", "")
    
    def _get_api_key(self) -> str:
        """获取API Key"""
        if not self.api_key:
            raise ValueError("百度API Key未配置。请设置环境变量 BAIDU_AK 或使用 dyos-platform config set baidu --ak <your_key>")
        return self.api_key
    
    def _call_api(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """调用百度API"""
        ak = self._get_api_key()
        params["ak"] = ak
        
        # 如果有SK，进行sn签名（可选）
        sn = params.pop("sn", None)
        if sn:
            params["sn"] = sn
        
        url = f"{self.api_base_url}{path}?{urllib.parse.urlencode(params)}"
        
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))
                
                if data.get("status") == 0:
                    return {"code": 0, "message": "success", "data": data}
                else:
                    return {
                        "code": data.get("status", 1),
                        "message": data.get("message", "API调用失败"),
                        "data": data
                    }
        except Exception as e:
            return {"code": 1, "message": f"API调用失败: {str(e)}", "data": None}
    
    def poi_search(self, keyword: str = None, city: str = None, **kwargs) -> Dict[str, Any]:
        """POI搜索"""
        if self.use_mock or not self.api_key:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": self.mock.generate_poi_search(keyword or "火锅", city or "上海", 10),
                "mode": "mock"
            }
        
        params = {
            "query": keyword or "火锅",
            "region": city or "上海",
            "output": "json",
            "page_size": kwargs.get("page_size", 20),
            "page_num": kwargs.get("page_num", 0),
            "scope": kwargs.get("scope", 2),  # 2-详细信息
            "coord_type": kwargs.get("coord_type", 3),  # 3-GCJ02
        }
        
        result = self._call_api("/place/v2/search", params)
        
        if result["code"] == 0:
            pois = []
            for poi in result["data"].get("results", []):
                pois.append({
                    "id": poi.get("uid", ""),
                    "name": poi.get("name", ""),
                    "address": poi.get("address", ""),
                    "telephone": poi.get("telephone", ""),
                    "location": poi.get("location", {}),
                    "rating": poi.get("detail_info", {}).get("overall_rating", ""),
                    "distance": "",
                    "type": poi.get("detail_info", {}).get("type", ""),
                    "cityname": city or "未知",
                    "adname": poi.get("province", ""),
                })
            result["data"] = pois
            result["total"] = result["data"].get("total", len(pois))
        
        return result
    
    def poi_detail(self, poi_id: str = None, **kwargs) -> Dict[str, Any]:
        """POI详情"""
        if self.use_mock or not self.api_key:
            pois = self.mock.generate_poi_search("火锅", "上海", 10)
            poi = pois[0]
            poi["id"] = poi_id or poi["id"]
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": poi,
                "mode": "mock"
            }
        
        params = {"uid": poi_id, "scope": 2, "output": "json"}
        result = self._call_api("/place/v2/detail", params)
        
        if result["code"] == 0:
            poi = result["data"].get("result", {})
            result["data"] = {
                "id": poi.get("uid", ""),
                "name": poi.get("name", ""),
                "address": poi.get("address", ""),
                "telephone": poi.get("telephone", ""),
                "location": poi.get("location", {}),
                "type": poi.get("detail_info", {}).get("type", ""),
                "rating": poi.get("detail_info", {}).get("overall_rating", ""),
            }
        
        return result
    
    def geocode(self, address: str = None, city: str = None, **kwargs) -> Dict[str, Any]:
        """地理编码 - 地址转坐标"""
        if self.use_mock or not self.api_key:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "address": address or "南京路100号",
                    "city": city or "上海市",
                    "location": {
                        "lat": 31.230416,
                        "lng": 121.473701
                    },
                    "precise": 1,
                    "confidence": 80
                },
                "mode": "mock"
            }
        
        params = {
            "address": address,
            "city": city or "上海市",
            "output": "json"
        }
        
        result = self._call_api("/geocoding/v3/", params)
        
        if result["code"] == 0:
            location = result["data"].get("location", {})
            result["data"] = {
                "address": address,
                "city": result["data"].get("city", ""),
                "province": result["data"].get("province", ""),
                "district": result["data"].get("district", ""),
                "location": {
                    "lng": location.get("lng", 0),
                    "lat": location.get("lat", 0)
                },
                "precise": result["data"].get("precise", 0),
                "confidence": result["data"].get("confidence", 0)
            }
        
        return result
    
    def regeocode(self, lat: float = None, lng: float = None, **kwargs) -> Dict[str, Any]:
        """逆地理编码 - 坐标转地址"""
        if self.use_mock or not self.api_key:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "address": "上海市黄浦区南京路步行街",
                    "formatted_address": "上海市黄浦区南京路100号",
                    "province": "上海市",
                    "city": "上海市",
                    "district": "黄浦区"
                },
                "mode": "mock"
            }
        
        params = {
            "location": f"{lat},{lng}",
            "output": "json",
            "pois": 1
        }
        
        result = self._call_api("/geocoding/v3/", params)
        
        if result["code"] == 0:
            result["data"] = {
                "address": result["data"].get("formatted_address", ""),
                "province": result["data"].get("province", ""),
                "city": result["data"].get("city", ""),
                "district": result["data"].get("district", ""),
            }
        
        return result
    
    def direction_driving(self, origin: str = None, destination: str = None, **kwargs) -> Dict[str, Any]:
        """驾车路线规划"""
        if self.use_mock or not self.api_key:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "origin": origin,
                    "destination": destination,
                    "distance": "12.5公里",
                    "duration": "35分钟",
                    "route": "详细路线..."
                },
                "mode": "mock"
            }
        
        params = {
            "origin": origin,
            "destination": destination,
            "output": "json",
            "tactics": kwargs.get("tactics", 11)  # 推荐路线
        }
        
        result = self._call_api("/direction/v2/driving", params)
        
        if result["code"] == 0:
            routes = result["data"].get("result", {}).get("routes", [])
            if routes:
                route = routes[0]
                result["data"] = {
                    "origin": origin,
                    "destination": destination,
                    "distance": f"{route.get('distance', 0)/1000:.1f}公里",
                    "duration": f"{route.get('duration', 0)//60}分钟",
                }
        
        return result
    
    def _shop_list_impl(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无店铺管理API")
    
    def _shop_detail_impl(self, shop_id: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无店铺管理API")
    
    def _product_list_impl(self, shop_id: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无商品管理API")
    
    def _product_sync_impl(self, source: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无商品管理API")
    
    def _order_list_impl(self, shop_id: str = None, status: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无订单管理API")
    
    def _review_list_impl(self, shop_id: str = None, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无评价管理API")
    
    def _review_reply_impl(self, review_id: str, content: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无评价管理API")
    
    def _marketing_create_impl(self, 营销_type: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无营销管理API")
    
    def _analytics_overview_impl(self, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("百度地图无数据分析API")
