"""
店赢OS CLI - 配置管理
"""
import os
import json
from pathlib import Path


class Config:
    """CLI配置管理"""
    
    def __init__(self):
        self.config_dir = Path.home() / ".dyos"
        self.config_file = self.config_dir / "config.json"
        self._load_config()
    
    def _load_config(self):
        """加载配置"""
        if self.config_file.exists():
            with open(self.config_file, "r") as f:
                self._config = json.load(f)
        else:
            self._config = self._default_config()
            self._save_config()
    
    def _default_config(self):
        """默认配置"""
        return {
            "base_url": "http://localhost:8000",
            "api_key": "",
            "timeout": 30,
            "output_format": "table"
        }
    
    def _save_config(self):
        """保存配置"""
        self.config_dir.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, "w") as f:
            json.dump(self._config, f, indent=2)
    
    @property
    def base_url(self) -> str:
        return self._config.get("base_url", "http://localhost:8000")
    
    @base_url.setter
    def base_url(self, value: str):
        self._config["base_url"] = value
        self._save_config()
    
    @property
    def api_key(self) -> str:
        return self._config.get("api_key", "")
    
    @api_key.setter
    def api_key(self, value: str):
        self._config["api_key"] = value
        self._save_config()
    
    @property
    def timeout(self) -> int:
        return self._config.get("timeout", 30)
    
    @property
    def output_format(self) -> str:
        return self._config.get("output_format", "table")
    
    @output_format.setter
    def output_format(self, value: str):
        self._config["output_format"] = value
        self._save_config()
    
    def get(self, key: str, default=None):
        return self._config.get(key, default)
    
    def set(self, key: str, value):
        self._config[key] = value
        self._save_config()


# 全局配置实例
config = Config()
