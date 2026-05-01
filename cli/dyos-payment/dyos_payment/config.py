#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 配置文件
管理orgId、密钥、环境等配置
"""
import os
import json
import click
from pathlib import Path
from typing import Optional, Dict, Any

# 默认配置目录
DEFAULT_CONFIG_DIR = Path.home() / ".dyos-payment"
DEFAULT_CONFIG_FILE = DEFAULT_CONFIG_DIR / "config.json"

# 默认环境配置
DEFAULT_ENV_CONFIG = {
    "test": {
        "base_url": "https://openapi-test.suixingpay.com",
        "description": "测试环境"
    },
    "prod": {
        "base_url": "https://openapi.tianquetech.com",
        "description": "生产环境"
    }
}


class Config:
    """配置管理类"""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or DEFAULT_CONFIG_FILE
        self._config: Dict[str, Any] = {}
        self._load_config()
    
    def _load_config(self):
        """加载配置文件"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self._config = json.load(f)
            except Exception as e:
                click.echo(f"警告: 加载配置文件失败: {e}", err=True)
                self._config = {}
        else:
            self._config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            "org_id": "***REDACTED_ORG_ID***",
            "private_key": "",
            "public_key": "",
            "suixingpay_public_key": "",
            "sign_algorithm": "SHA1withRSA",
            "env": "prod",
            "test_merchant_no": "***REDACTED_MERCHANT_NO***",
            "timeout": 30,
            "retry_times": 3
        }
    
    def _ensure_config_dir(self):
        """确保配置目录存在"""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
    
    def save(self):
        """保存配置到文件"""
        self._ensure_config_dir()
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self._config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            click.echo(f"错误: 保存配置文件失败: {e}", err=True)
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置项"""
        return self._config.get(key, default)
    
    def set(self, key: str, value: Any):
        """设置配置项"""
        self._config[key] = value
    
    @property
    def org_id(self) -> str:
        """获取机构号"""
        return self.get("org_id", "***REDACTED_ORG_ID***")
    
    @org_id.setter
    def org_id(self, value: str):
        self.set("org_id", value)
    
    @property
    def private_key(self) -> str:
        """获取服务商私钥"""
        return self.get("private_key", "")
    
    @private_key.setter
    def private_key(self, value: str):
        self.set("private_key", value)
    
    @property
    def public_key(self) -> str:
        """获取服务商公钥"""
        return self.get("public_key", "")
    
    @public_key.setter
    def public_key(self, value: str):
        self.set("public_key", value)
    
    @property
    def suixingpay_public_key(self) -> str:
        """获取随行付公钥"""
        return self.get("suixingpay_public_key", "")
    
    @suixingpay_public_key.setter
    def suixingpay_public_key(self, value: str):
        self.set("suixingpay_public_key", value)
    
    @property
    def sign_algorithm(self) -> str:
        """获取签名算法"""
        return self.get("sign_algorithm", "SHA1withRSA")
    
    @property
    def env(self) -> str:
        """获取当前环境"""
        return self.get("env", "prod")
    
    @env.setter
    def env(self, value: str):
        if value not in DEFAULT_ENV_CONFIG:
            raise ValueError(f"无效的环境: {value}, 有效值: {list(DEFAULT_ENV_CONFIG.keys())}")
        self.set("env", value)
    
    @property
    def base_url(self) -> str:
        """获取API基础URL"""
        return DEFAULT_ENV_CONFIG.get(self.env, {}).get("base_url", "")
    
    @property
    def test_merchant_no(self) -> str:
        """获取测试商户号"""
        return self.get("test_merchant_no", "***REDACTED_MERCHANT_NO***")
    
    @test_merchant_no.setter
    def test_merchant_no(self, value: str):
        self.set("test_merchant_no", value)
    
    @property
    def timeout(self) -> int:
        """获取请求超时时间"""
        return self.get("timeout", 30)
    
    @property
    def retry_times(self) -> int:
        """获取重试次数"""
        return self.get("retry_times", 3)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return self._config.copy()
    
    def __repr__(self):
        return f"Config(org_id={self.org_id}, env={self.env}, base_url={self.base_url})"


# 全局配置实例
_config_instance: Optional[Config] = None


def get_config() -> Config:
    """获取全局配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = Config()
    return _config_instance


def init_config(
    org_id: Optional[str] = None,
    private_key: Optional[str] = None,
    public_key: Optional[str] = None,
    suixingpay_public_key: Optional[str] = None,
    env: Optional[str] = None,
    test_merchant_no: Optional[str] = None
) -> Config:
    """初始化配置"""
    global _config_instance
    _config_instance = Config()
    
    if org_id:
        _config_instance.org_id = org_id
    if private_key:
        _config_instance.private_key = private_key
    if public_key:
        _config_instance.public_key = public_key
    if suixingpay_public_key:
        _config_instance.suixingpay_public_key = suixingpay_public_key
    if env:
        _config_instance.env = env
    if test_merchant_no:
        _config_instance.test_merchant_no = test_merchant_no
    
    return _config_instance


def switch_env(env: str) -> bool:
    """切换环境"""
    config = get_config()
    try:
        config.env = env
        config.save()
        click.echo(f"✅ 环境已切换为: {env}")
        click.echo(f"   API地址: {config.base_url}")
        return True
    except ValueError as e:
        click.echo(f"❌ 切换失败: {e}", err=True)
        return False
