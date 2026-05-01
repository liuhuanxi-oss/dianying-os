"""
OAuth2.0授权管理

支持各平台的OAuth2.0授权流程
"""

import os
import json
import time
import hashlib
import base64
from typing import Dict, Any, Optional, Callable
from urllib.parse import urlencode


class AuthManager:
    """OAuth2.0授权管理器"""
    
    def __init__(self, platform: str, config: Dict[str, Any]):
        self.platform = platform
        self.config = config
        self.token_file = os.path.expanduser(f"~/.dyos/tokens/{platform}.json")
        self._ensure_token_dir()
    
    def _ensure_token_dir(self):
        """确保Token存储目录存在"""
        token_dir = os.path.dirname(self.token_file)
        if not os.path.exists(token_dir):
            os.makedirs(token_dir, exist_ok=True)
    
    def get_access_token(self) -> Optional[str]:
        """获取访问令牌"""
        token_data = self._load_token()
        if not token_data:
            return None
        
        # 检查Token是否过期
        if token_data.get("expires_at", 0) < time.time():
            # Token过期，尝试刷新
            new_token = self.refresh_token(token_data.get("refresh_token"))
            return new_token
        
        return token_data.get("access_token")
    
    def save_token(self, token_data: Dict[str, Any]):
        """保存Token"""
        # 计算过期时间
        expires_in = token_data.get("expires_in", 7200)
        token_data["expires_at"] = time.time() + expires_in
        
        self._save_token(token_data)
    
    def _load_token(self) -> Optional[Dict[str, Any]]:
        """加载本地Token"""
        try:
            if os.path.exists(self.token_file):
                with open(self.token_file, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return None
    
    def _save_token(self, token_data: Dict[str, Any]):
        """保存Token到本地"""
        try:
            with open(self.token_file, "w") as f:
                json.dump(token_data, f)
        except Exception as e:
            print(f"保存Token失败: {e}")
    
    def refresh_token(self, refresh_token: str = None) -> Optional[str]:
        """刷新访问令牌"""
        # 各平台的刷新逻辑略有不同，这里提供通用模板
        refresh_url = self.config.get("token_url") or f"{self.config.get('api_base')}/oauth/token"
        
        params = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.config.get("client_key") or self.config.get("app_id"),
            "client_secret": self.config.get("client_secret") or self.config.get("app_secret"),
        }
        
        try:
            import requests
            response = requests.post(refresh_url, data=params, timeout=10)
            if response.status_code == 200:
                token_data = response.json()
                self.save_token(token_data)
                return token_data.get("access_token")
        except Exception:
            pass
        
        return None
    
    def build_auth_url(self, redirect_uri: str, state: str = None) -> str:
        """构建授权URL"""
        auth_url = self.config.get("auth_url") or f"{self.config.get('api_base')}/oauth/authorize"
        
        params = {
            "client_id": self.config.get("client_key") or self.config.get("app_id"),
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": self.config.get("scope", "all"),
        }
        
        if state:
            params["state"] = state
        
        return f"{auth_url}?{urlencode(params)}"
    
    def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """用授权码换取访问令牌"""
        token_url = self.config.get("token_url") or f"{self.config.get('api_base')}/oauth/token"
        
        params = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.config.get("client_key") or self.config.get("app_id"),
            "client_secret": self.config.get("client_secret") or self.config.get("app_secret"),
        }
        
        import requests
        response = requests.post(token_url, data=params, timeout=10)
        if response.status_code == 200:
            token_data = response.json()
            self.save_token(token_data)
            return token_data
        
        raise Exception(f"Token交换失败: {response.text}")
