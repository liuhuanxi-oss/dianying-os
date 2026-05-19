# -*- coding: utf-8 -*-
"""
配置文件
包含JWT配置、CORS配置、企业微信webhook等
"""

import os
from datetime import timedelta
from typing import List

# 基础路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 数据库配置
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'dianying.db')}"

# JWT配置
SECRET_KEY = "dianying-os-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

# CORS配置
CORS_ORIGINS: List[str] = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# 企业微信Webhook配置（用于消息推送）
WECOM_WEBHOOK_URL = os.getenv("WECOM_WEBHOOK_URL", "")

# 平台配置
PLATFORM_CONFIG = {
    "name": "店赢OS",
    "version": "1.0.0",
    "api_prefix": "/api"
}

# 分页配置
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100

# 文件上传配置
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB

# 确保上传目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)
