"""
高德地图 CLI实现

支持POI搜索、地理编码、门店定位
真实API调用（API Key免费注册即可获取）
"""

import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
from dyos_platforms.core.base import PlatformCLI


class AmapCLI(PlatformCLI):
    """高德地图 CLI"""
    
    platform_name = "高德地图"
    platform_code = "amap"
    api_base_url = "https://restapi.amap.com"
    auth_type = "api_key"
    
    def __init__(self, use_mock: bool = True, json_output: bool = False):
        super().__init__(use_mock, json_output)
        
        # 获取API Key
        self.api_key = os.getenv("AMAP_KEY", "")
        if not self.api_key:
            from dyos_platforms.config import get_platform_credential
            cred = get_platform_credential("amap")
            self.api_key = cred.get("key", "")
    
    def _get_api_key(self) -> str:
        """获取API Key"""
        if not self.api_key:
            raise ValueError("高德API Key未配置。请设置环境变量 AMAP_KEY 或使用 dyos-platform config set amap --key <your_key>")
        return self.api_key
    
    def _call_api(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """调用高德API"""
        key = self._get_api_key()
        params["key"] = key
        
        url = f"{self.api_base_url}{path}?{urllib.parse.urlencode(params)}"
        
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))
                
                if data.get("status") == "1":
                    return {"code": 0, "message": "success", "data": data}
                else:
                    return {
                        "code": data.get("infocode", 1),
                        "message": data.get("info", "API调用失败"),
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
            "keywords": keyword or "火锅",
            "city": city or "全国",
            "offset": kwargs.get("offset", 20),
            "page": kwargs.get("page", 1),
            "extensions": "all"
        }
        
        result = self._call_api("/v3/place/text", params)
        
        if result["code"] == 0:
            pois = []
            for poi in result["data"].get("pois", []):
                pois.append({
                    "id": poi.get("id", ""),
                    "name": poi.get("name", ""),
                    "address": poi.get("address", ""),
                    "telephone": poi.get("tel", ""),
                    "location": poi.get("location", ""),
                    "rating": poi.get("biz_ext", {}).get("rating", ""),
                    "distance": poi.get("distance", ""),
                    "type": poi.get("type", ""),
                    "cityname": poi.get("cityname", ""),
                    "adname": poi.get("adname", "")
                })
            result["data"] = pois
            result["total"] = result["data"].get("count", len(pois))
        
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
        
        params = {"id": poi_id}
        result = self._call_api("/v3/place/detail", params)
        
        if result["code"] == 0:
            poi = result["data"].get("pois", [{}])[0]
            result["data"] = {
                "id": poi.get("id", ""),
                "name": poi.get("name", ""),
                "address": poi.get("address", ""),
                "telephone": poi.get("tel", ""),
                "location": poi.get("location", ""),
                "type": poi.get("type", ""),
                "rating": poi.get("biz_ext", {}).get("rating", ""),
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
                    "province": "上海市",
                    "district": "黄浦区"
                },
                "mode": "mock"
            }
        
        params = {
            "address": address,
            "city": city
        }
        
        result = self._call_api("/v3/geocode/geo", params)
        
        if result["code"] == 0:
            geocodes = result["data"].get("geocodes", [])
            if geocodes:
                geo = geocodes[0]
                location = geo.get("location", "").split(",")
                result["data"] = {
                    "address": geo.get("province", "") + geo.get("city", "") + geo.get("district", "") + geo.get("township", ""),
                    "city": geo.get("city", ""),
                    "province": geo.get("province", ""),
                    "district": geo.get("district", ""),
                    "location": {
                        "lng": float(location[0]) if len(location) > 0 else 0,
                        "lat": float(location[1]) if len(location) > 1 else 0
                    }
                }
        
        return result
    
    def regeocode(self, location: str = None, **kwargs) -> Dict[str, Any]:
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
        
        params = {"location": location}
        result = self._call_api("/v3/geocode/regeo", params)
        
        if result["code"] == 0:
            regeo = result["data"].get("regeocode", {})
            result["data"] = {
                "address": regeo.get("formatted_address", ""),
                "province": regeo.get("addressComponent", {}).get("province", ""),
                "city": regeo.get("addressComponent", {}).get("city", ""),
                "district": regeo.get("addressComponent", {}).get("district", ""),
            }
        
        return result
    
    def weather(self, city: str = None, **kwargs) -> Dict[str, Any]:
        """天气查询"""
        if self.use_mock or not self.api_key:
            return {
                "code": 0,
                "message": "success",
                "platform": self.platform_code,
                "data": {
                    "city": city or "上海",
                    "weather": "多云",
                    "temperature": "18-26°C",
                    "humidity": "65%"
                },
                "mode": "mock"
            }
        
        params = {"city": city, "extensions": "all"}
        result = self._call_api("/v3/weather/weatherInfo", params)
        
        if result["code"] == 0:
            lives = result["data"].get("lives", [])
            if lives:
                live = lives[0]
                result["data"] = {
                    "city": live.get("city", ""),
                    "weather": live.get("weather", ""),
                    "temperature": f"{live.get('temperature_float', '0')}°C",
                    "humidity": f"{live.get('humidity_float', '0')}%",
                    "winddirection": live.get("winddirection", ""),
                    "windspeed": live.get("windpower", "")
                }
        
        return result
    
    def _shop_list_impl(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无店铺管理API")
    
    def _shop_detail_impl(self, shop_id: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无店铺管理API")
    
    def _product_list_impl(self, shop_id: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无商品管理API")
    
    def _product_sync_impl(self, source: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无商品管理API")
    
    def _order_list_impl(self, shop_id: str = None, status: str = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无订单管理API")
    
    def _review_list_impl(self, shop_id: str = None, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无评价管理API")
    
    def _review_reply_impl(self, review_id: str, content: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无评价管理API")
    
    def _marketing_create_impl(self, 营销_type: str, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无营销管理API")
    
    def _analytics_overview_impl(self, days: int = 7, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("高德地图无数据分析API")
