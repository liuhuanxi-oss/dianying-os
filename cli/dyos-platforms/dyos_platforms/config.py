"""
各平台API配置

配置各平台的API基础URL、认证方式、AppKey/AppSecret等
"""

import os
from typing import Dict, Any

# ============== 通用配置 ==============
USE_MOCK = True  # Mock模式开关，比赛中使用Mock数据
DEBUG = os.getenv("DYOS_DEBUG", "false").lower() == "true"

# ============== 美团/大众点评 ==============
MEITUAN_API_BASE = "https://openapi.meituan.com"
MEITUAN_APP_ID = os.getenv("MEITUAN_APP_ID", "")
MEITUAN_APP_SECRET = os.getenv("MEITUAN_APP_SECRET", "")

# ============== 饿了么 ==============
ELEME_API_BASE = "https://open-api.ele.me"
ELEME_APP_ID = os.getenv("ELEME_APP_ID", "")
ELEME_APP_SECRET = os.getenv("ELEME_APP_SECRET", "")

# ============== 抖音本地生活 ==============
DOUYIN_API_BASE = "https://open.douyin.com"
DOUYIN_CLIENT_KEY = os.getenv("DOUYIN_CLIENT_KEY", "")
DOUYIN_CLIENT_SECRET = os.getenv("DOUYIN_CLIENT_SECRET", "")

# ============== 小红书 ==============
XHS_API_BASE = "https://ad.xiaohongshu.com"
XHS_CLIENT_ID = os.getenv("XHS_CLIENT_ID", "")
XHS_CLIENT_SECRET = os.getenv("XHS_CLIENT_SECRET", "")

# ============== 微信视频号 ==============
WECHAT_API_BASE = "https://api.weixin.qq.com"
WECHAT_APP_ID = os.getenv("WECHAT_APP_ID", "")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET", "")

# ============== 高德地图 ==============
AMAP_API_BASE = "https://restapi.amap.com"
AMAP_KEY = os.getenv("AMAP_KEY", "")

# ============== 支付宝/口碑 ==============
ALIPAY_API_BASE = "https://openapi.alipay.com"
ALIPAY_APP_ID = os.getenv("ALIPAY_APP_ID", "")
ALIPAY_PRIVATE_KEY = os.getenv("ALIPAY_PRIVATE_KEY", "")
ALIPAY_PUBLIC_KEY = os.getenv("ALIPAY_PUBLIC_KEY", "")

# ============== 百度地图 ==============
BAIDU_API_BASE = "https://api.map.baidu.com"
BAIDU_AK = os.getenv("BAIDU_AK", "")

# ============== 平台配置表 ==============
PLATFORM_CONFIG: Dict[str, Dict[str, Any]] = {
    "meituan": {
        "name": "美团/大众点评",
        "code": "meituan",
        "api_base": MEITUAN_API_BASE,
        "auth_type": "oauth2",
        "app_id": MEITUAN_APP_ID,
        "app_secret": MEITUAN_APP_SECRET,
    },
    "eleme": {
        "name": "饿了么",
        "code": "eleme",
        "api_base": ELEME_API_BASE,
        "auth_type": "oauth2",
        "app_id": ELEME_APP_ID,
        "app_secret": ELEME_APP_SECRET,
    },
    "douyin": {
        "name": "抖音本地生活",
        "code": "douyin",
        "api_base": DOUYIN_API_BASE,
        "auth_type": "oauth2",
        "client_key": DOUYIN_CLIENT_KEY,
        "client_secret": DOUYIN_CLIENT_SECRET,
    },
    "xiaohongshu": {
        "name": "小红书",
        "code": "xiaohongshu",
        "api_base": XHS_API_BASE,
        "auth_type": "oauth2",
        "client_id": XHS_CLIENT_ID,
        "client_secret": XHS_CLIENT_SECRET,
    },
    "wechat": {
        "name": "微信视频号",
        "code": "wechat",
        "api_base": WECHAT_API_BASE,
        "auth_type": "oauth2",
        "app_id": WECHAT_APP_ID,
        "app_secret": WECHAT_APP_SECRET,
    },
    "amap": {
        "name": "高德地图",
        "code": "amap",
        "api_base": AMAP_API_BASE,
        "auth_type": "api_key",
        "key": AMAP_KEY,
    },
    "alipay": {
        "name": "支付宝/口碑",
        "code": "alipay",
        "api_base": ALIPAY_API_BASE,
        "auth_type": "oauth2",
        "app_id": ALIPAY_APP_ID,
    },
    "baidu": {
        "name": "百度地图",
        "code": "baidu",
        "api_base": BAIDU_API_BASE,
        "auth_type": "api_key",
        "ak": BAIDU_AK,
    },
}

# 支持的平台列表
SUPPORTED_PLATFORMS = list(PLATFORM_CONFIG.keys())
