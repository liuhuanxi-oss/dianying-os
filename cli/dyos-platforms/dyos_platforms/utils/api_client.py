"""
通用HTTP客户端

提供统一的API调用能力，支持签名、鉴权、重试等
"""

import time
import hashlib
import hmac
import json
import requests
from typing import Dict, Any, Optional
from urllib.parse import urlencode


class APIClient:
    """通用API客户端"""
    
    def __init__(
        self,
        base_url: str,
        app_id: str = None,
        app_secret: str = None,
        api_key: str = None,
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.base_url = base_url.rstrip("/")
        self.app_id = app_id
        self.app_secret = app_secret
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "DianYingOS-CLI/0.1.0"
        })
    
    def sign_request(self, params: Dict[str, Any], secret: str = None) -> str:
        """签名请求参数"""
        secret = secret or self.app_secret
        if not secret:
            return ""
        
        # 按字典序排序参数
        sorted_params = sorted(params.items())
        param_str = "&".join([f"{k}={v}" for k, v in sorted_params])
        
        # 计算签名
        sign_str = param_str + secret
        return hashlib.md5(sign_str.encode()).hexdigest()
    
    def call_api(
        self,
        method: str,
        path: str,
        params: Dict[str, Any] = None,
        data: Dict[str, Any] = None,
        headers: Dict[str, str] = None,
        auth_token: str = None
    ) -> Dict[str, Any]:
        """调用API
        
        Args:
            method: HTTP方法 (GET, POST, PUT, DELETE)
            path: API路径
            params: URL查询参数
            data: 请求体数据
            headers: 额外请求头
            auth_token: OAuth认证令牌
        
        Returns:
            API响应数据
        """
        url = f"{self.base_url}/{path.lstrip('/')}"
        retry_count = 0
        
        while retry_count <= self.max_retries:
            try:
                request_headers = dict(self.session.headers)
                if headers:
                    request_headers.update(headers)
                
                if auth_token:
                    request_headers["Authorization"] = f"Bearer {auth_token}"
                elif self.api_key:
                    request_headers["X-API-Key"] = self.api_key
                
                response = self.session.request(
                    method=method.upper(),
                    url=url,
                    params=params,
                    json=data,
                    headers=request_headers,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                retry_count += 1
                if retry_count > self.max_retries:
                    raise Exception(f"API调用失败: {str(e)}")
                time.sleep(1 * retry_count)  # 指数退避
        
        raise Exception("API调用失败: 达到最大重试次数")
    
    def get(self, path: str, params: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """GET请求"""
        return self.call_api("GET", path, params=params, **kwargs)
    
    def post(self, path: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """POST请求"""
        return self.call_api("POST", path, data=data, **kwargs)
    
    def put(self, path: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """PUT请求"""
        return self.call_api("PUT", path, data=data, **kwargs)
    
    def delete(self, path: str, params: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """DELETE请求"""
        return self.call_api("DELETE", path, params=params, **kwargs)
    
    def close(self):
        """关闭会话"""
        self.session.close()
