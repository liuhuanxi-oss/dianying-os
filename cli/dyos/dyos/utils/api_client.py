"""
店赢OS CLI - API客户端
"""
import requests
from typing import Optional, Dict, Any
from dyos.config import config


class APIClient:
    """API客户端"""
    
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or config.base_url
        self.api_key = api_key or config.api_key
        self.timeout = config.timeout
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    def _build_url(self, path: str) -> str:
        """构建完整URL"""
        return f"{self.base_url}{path}"
    
    def get(self, path: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET请求"""
        url = self._build_url(path)
        try:
            response = requests.get(
                url,
                params=params,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            return {"code": -1, "message": f"无法连接到API服务器，请确保FastAPI服务正在运行 (URL: {self.base_url})", "data": None}
        except requests.exceptions.Timeout:
            return {"code": -1, "message": "请求超时", "data": None}
        except Exception as e:
            return {"code": -1, "message": str(e), "data": None}
    
    def post(self, path: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """POST请求"""
        url = self._build_url(path)
        try:
            response = requests.post(
                url,
                json=data,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            return {"code": -1, "message": f"无法连接到API服务器，请确保FastAPI服务正在运行 (URL: {self.base_url})", "data": None}
        except requests.exceptions.Timeout:
            return {"code": -1, "message": "请求超时", "data": None}
        except Exception as e:
            return {"code": -1, "message": str(e), "data": None}
    
    def put(self, path: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """PUT请求"""
        url = self._build_url(path)
        try:
            response = requests.put(
                url,
                json=data,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            return {"code": -1, "message": f"无法连接到API服务器，请确保FastAPI服务正在运行 (URL: {self.base_url})", "data": None}
        except Exception as e:
            return {"code": -1, "message": str(e), "data": None}
    
    def delete(self, path: str) -> Dict[str, Any]:
        """DELETE请求"""
        url = self._build_url(path)
        try:
            response = requests.delete(
                url,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            return {"code": -1, "message": f"无法连接到API服务器，请确保FastAPI服务正在运行 (URL: {self.base_url})", "data": None}
        except Exception as e:
            return {"code": -1, "message": str(e), "data": None}


# 全局API客户端实例
api_client = APIClient()
