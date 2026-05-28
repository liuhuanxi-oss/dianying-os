"""
各平台API配置

配置各平台的API基础URL、认证方式、AppKey/AppSecret等
包含真实API接入信息和Mock模式切换
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, List

# ============== 通用配置 ==============
USE_MOCK = os.getenv("DYOS_USE_MOCK", "true").lower() == "true"
DEBUG = os.getenv("DYOS_DEBUG", "false").lower() == "true"

# ============== 配置文件路径 ==============
CONFIG_DIR = Path.home() / ".dyos"
CREDENTIALS_FILE = CONFIG_DIR / "credentials.json"

# 确保配置目录存在
CONFIG_DIR.mkdir(parents=True, exist_ok=True)

# ============== 平台API配置 ==============

# 美团/大众点评
MEITUAN_API_BASE = "https://openapi.meituan.com"
MEITUAN_DOCS_URL = "https://open.meituan.com/docs"
MEITUAN_APP_ID = os.getenv("MEITUAN_APP_ID", "")
MEITUAN_APP_SECRET = os.getenv("MEITUAN_APP_SECRET", "")

# 饿了么
ELEME_API_BASE = "https://open-api.ele.me"
ELEME_DOCS_URL = "https://open.shop.ele.me/develop"
ELEME_APP_KEY = os.getenv("ELEME_APP_KEY", "")
ELEME_APP_SECRET = os.getenv("ELEME_APP_SECRET", "")

# 抖音本地生活
DOUYIN_API_BASE = "https://open.douyin.com"
DOUYIN_DOCS_URL = "https://developer.open-douyin.com/docs"
DOUYIN_CLIENT_KEY = os.getenv("DOUYIN_CLIENT_KEY", "")
DOUYIN_CLIENT_SECRET = os.getenv("DOUYIN_CLIENT_SECRET", "")

# 小红书
XHS_API_BASE = "https://ad.xiaohongshu.com"
XHS_DOCS_URL = "https://open.xiaohongshu.com/doc"
XHS_CLIENT_ID = os.getenv("XHS_CLIENT_ID", "")
XHS_CLIENT_SECRET = os.getenv("XHS_CLIENT_SECRET", "")

# 微信视频号
WECHAT_API_BASE = "https://api.weixin.qq.com"
WECHAT_DOCS_URL = "https://developers.weixin.qq.com/doc"
WECHAT_APP_ID = os.getenv("WECHAT_APP_ID", "")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET", "")

# 高德地图
AMAP_API_BASE = "https://restapi.amap.com"
AMAP_DOCS_URL = "https://lbs.amap.com/api/webservice/summary"
AMAP_KEY = os.getenv("AMAP_KEY", "")
AMAP_KEY_SECRET = os.getenv("AMAP_KEY_SECRET", "")

# 支付宝/口碑
ALIPAY_API_BASE = "https://openapi.alipay.com"
ALIPAY_DOCS_URL = "https://open.alipay.com/docs"
ALIPAY_APP_ID = os.getenv("ALIPAY_APP_ID", "")
ALIPAY_PRIVATE_KEY = os.getenv("ALIPAY_PRIVATE_KEY", "")
ALIPAY_PUBLIC_KEY = os.getenv("ALIPAY_PUBLIC_KEY", "")

# 百度地图
BAIDU_API_BASE = "https://api.map.baidu.com"
BAIDU_DOCS_URL = "https://lbsyun.baidu.com/index.php/Welcome"
BAIDU_AK = os.getenv("BAIDU_AK", "")
BAIDU_SK = os.getenv("BAIDU_SK", "")

# ============== 平台详细配置表 ==============

PLATFORM_CONFIG: Dict[str, Dict[str, Any]] = {
    "meituan": {
        "name": "美团/大众点评",
        "name_en": "Meituan/Dianping",
        "code": "meituan",
        "api_base": MEITUAN_API_BASE,
        "docs_url": MEITUAN_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "OAuth 2.0 + 企业资质认证",
        "app_id": MEITUAN_APP_ID,
        "app_secret": MEITUAN_APP_SECRET,
        "env_vars": ["MEITUAN_APP_ID", "MEITUAN_APP_SECRET"],
        "required_credential": {"app_id": "App ID", "app_secret": "App Secret"},
        "callback_url": "https://your-domain.com/callback/meituan",
        "sdk_languages": ["Java", "Python", "PHP", "Go", "Node.js"],
        "features": ["店铺管理", "商品管理", "订单管理", "评价管理", "营销活动", "经营数据"],
        "api_quota": "按调用量计费，需申请企业资质",
        "approval_days": "3-5个工作日",
        "price_tier": "企业版",
        "open_platform_url": "https://developer.meituan.com/",
    },
    "eleme": {
        "name": "饿了么",
        "name_en": "Ele.me",
        "code": "eleme",
        "api_base": ELEME_API_BASE,
        "docs_url": ELEME_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "OAuth 2.0 + 商家/开发者账号",
        "app_key": ELEME_APP_KEY,
        "app_secret": ELEME_APP_SECRET,
        "env_vars": ["ELEME_APP_KEY", "ELEME_APP_SECRET"],
        "required_credential": {"app_key": "App Key", "app_secret": "App Secret"},
        "callback_url": "https://your-domain.com/callback/eleme",
        "sdk_languages": ["Java", "PHP", "Python"],
        "features": ["商户管理", "店铺管理", "商品管理", "订单管理", "营销活动", "评价管理"],
        "api_quota": "按调用量计费，需商家资质",
        "approval_days": "1-3个工作日",
        "price_tier": "商家版/服务商版",
        "open_platform_url": "https://open.shop.ele.me/",
    },
    "douyin": {
        "name": "抖音本地生活",
        "name_en": "Douyin Local Services",
        "code": "douyin",
        "api_base": DOUYIN_API_BASE,
        "docs_url": DOUYIN_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "OAuth 2.0 + 技术服务商认证",
        "client_key": DOUYIN_CLIENT_KEY,
        "client_secret": DOUYIN_CLIENT_SECRET,
        "env_vars": ["DOUYIN_CLIENT_KEY", "DOUYIN_CLIENT_SECRET"],
        "required_credential": {"client_key": "Client Key", "client_secret": "Client Secret"},
        "callback_url": "https://your-domain.com/callback/douyin",
        "sdk_languages": ["Python", "Java", "Go", "PHP"],
        "features": ["到店餐饮", "到店综合", "商品管理", "券核销", "数据统计"],
        "api_quota": "按调用量计费，需解决方案申请",
        "approval_days": "7-15个工作日",
        "price_tier": "技术服务商",
        "open_platform_url": "https://developer.open-douyin.com/",
    },
    "xiaohongshu": {
        "name": "小红书",
        "name_en": "Xiaohongshu",
        "code": "xiaohongshu",
        "api_base": XHS_API_BASE,
        "docs_url": XHS_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "OAuth 2.0 + 企业认证",
        "client_id": XHS_CLIENT_ID,
        "client_secret": XHS_CLIENT_SECRET,
        "env_vars": ["XHS_CLIENT_ID", "XHS_CLIENT_SECRET"],
        "required_credential": {"client_id": "Client ID", "client_secret": "Client Secret"},
        "callback_url": "https://your-domain.com/callback/xiaohongshu",
        "sdk_languages": ["Java", "Python", "PHP"],
        "features": ["商品管理", "订单管理", "库存管理", "素材中心"],
        "api_quota": "按调用量计费，需企业认证",
        "approval_days": "5-10个工作日",
        "price_tier": "企业版",
        "open_platform_url": "https://open.xiaohongshu.com/",
    },
    "wechat": {
        "name": "微信视频号",
        "name_en": "WeChat Video Account",
        "code": "wechat",
        "api_base": WECHAT_API_BASE,
        "docs_url": WECHAT_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "微信开放平台授权 + 小程序/视频号",
        "app_id": WECHAT_APP_ID,
        "app_secret": WECHAT_APP_SECRET,
        "env_vars": ["WECHAT_APP_ID", "WECHAT_APP_SECRET"],
        "required_credential": {"app_id": "App ID", "app_secret": "App Secret"},
        "callback_url": "https://your-domain.com/callback/wechat",
        "sdk_languages": ["Python", "Java", "Go", "PHP", "Node.js"],
        "features": ["橱窗管理", "直播数据", "商品管理(部分开放)"],
        "api_quota": "部分免费，部分按调用量计费",
        "approval_days": "1-7个工作日",
        "price_tier": "个人版/企业版",
        "open_platform_url": "https://developers.weixin.qq.com/",
    },
    "amap": {
        "name": "高德地图",
        "name_en": "AutoNavi Maps (AMap)",
        "code": "amap",
        "api_base": AMAP_API_BASE,
        "docs_url": AMAP_DOCS_URL,
        "auth_type": "api_key",
        "auth_desc": "API Key (免费注册即可获取)",
        "key": AMAP_KEY,
        "key_secret": AMAP_KEY_SECRET,
        "env_vars": ["AMAP_KEY", "AMAP_KEY_SECRET"],
        "required_credential": {"key": "API Key"},
        "callback_url": None,
        "sdk_languages": ["JavaScript", "Android", "iOS", "Java", "Python", "C++"],
        "features": ["POI搜索", "地理编码", "路径规划", "地理围栏", "门店定位"],
        "api_quota": "个人开发者免费额度5000次/日，企业认证后更高",
        "approval_days": "即时生效(注册后)",
        "price_tier": "免费版/企业版",
        "open_platform_url": "https://lbs.amap.com/",
    },
    "alipay": {
        "name": "支付宝/口碑",
        "name_en": "Alipay/Koubei",
        "code": "alipay",
        "api_base": ALIPAY_API_BASE,
        "docs_url": ALIPAY_DOCS_URL,
        "auth_type": "oauth2",
        "auth_desc": "支付宝开放平台 + 应用签名",
        "app_id": ALIPAY_APP_ID,
        "private_key": ALIPAY_PRIVATE_KEY,
        "public_key": ALIPAY_PUBLIC_KEY,
        "env_vars": ["ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY"],
        "required_credential": {"app_id": "App ID", "private_key": "应用私钥", "public_key": "支付宝公钥"},
        "callback_url": "https://your-domain.com/callback/alipay",
        "sdk_languages": ["Python", "Java", "PHP", ".NET", "Node.js"],
        "features": ["门店管理", "商品管理", "会员管理", "支付对账"],
        "api_quota": "按调用量计费，需实名认证",
        "approval_days": "1-3个工作日",
        "price_tier": "个人版/企业版",
        "open_platform_url": "https://open.alipay.com/",
    },
    "baidu": {
        "name": "百度地图",
        "name_en": "Baidu Maps",
        "code": "baidu",
        "api_base": BAIDU_API_BASE,
        "docs_url": BAIDU_DOCS_URL,
        "auth_type": "api_key",
        "auth_desc": "API Key (免费注册即可获取)",
        "ak": BAIDU_AK,
        "sk": BAIDU_SK,
        "env_vars": ["BAIDU_AK", "BAIDU_SK"],
        "required_credential": {"ak": "AK (Access Key)"},
        "callback_url": None,
        "sdk_languages": ["JavaScript", "Android", "iOS", "Java", "Python", "C++"],
        "features": ["POI搜索", "地理编码", "路径规划", "地理围栏", "批量坐标处理"],
        "api_quota": "个人开发者免费额度6000次/日，企业认证后更高",
        "approval_days": "即时生效(注册后)",
        "price_tier": "免费版/企业版",
        "open_platform_url": "https://lbsyun.baidu.com/",
    },
}

# 支持的平台列表
SUPPORTED_PLATFORMS = list(PLATFORM_CONFIG.keys())

# 真实API支持状态（哪些平台已实现真实API调用）
REAL_API_SUPPORTED = ["amap", "baidu"]

# ============== 凭证管理 ==============

def load_credentials() -> Dict[str, Dict[str, str]]:
    """从配置文件加载凭证"""
    if CREDENTIALS_FILE.exists():
        try:
            with open(CREDENTIALS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_credentials(credentials: Dict[str, Dict[str, str]]) -> None:
    """保存凭证到配置文件"""
    with open(CREDENTIALS_FILE, 'w', encoding='utf-8') as f:
        json.dump(credentials, f, ensure_ascii=False, indent=2)

def get_platform_credential(platform: str) -> Dict[str, str]:
    """获取指定平台的凭证"""
    credentials = load_credentials()
    return credentials.get(platform, {})

def set_platform_credential(platform: str, credential: Dict[str, str]) -> None:
    """设置指定平台的凭证"""
    credentials = load_credentials()
    credentials[platform] = credential
    save_credentials(credentials)

def is_platform_configured(platform: str) -> bool:
    """检查平台是否已配置"""
    if platform not in PLATFORM_CONFIG:
        return False
    
    config = PLATFORM_CONFIG[platform]
    
    # 先检查环境变量
    for env_var in config.get("env_vars", []):
        if os.getenv(env_var):
            return True
    
    # 再检查配置文件
    cred = get_platform_credential(platform)
    if cred:
        return len(cred) > 0
    
    return False

def get_all_platforms_status() -> List[Dict[str, Any]]:
    """获取所有平台的状态"""
    status = []
    for code, config in PLATFORM_CONFIG.items():
        configured = is_platform_configured(code)
        real_api = code in REAL_API_SUPPORTED
        
        status.append({
            "code": code,
            "name": config["name"],
            "name_en": config["name_en"],
            "configured": configured,
            "real_api_supported": real_api,
            "auth_type": config["auth_type"],
            "open_platform_url": config["open_platform_url"],
            "approval_days": config["approval_days"],
        })
    return status

# ============== 配置验证 ==============

def validate_config() -> Dict[str, Any]:
    """验证当前配置状态"""
    results = {
        "total": len(SUPPORTED_PLATFORMS),
        "configured": 0,
        "unconfigured": 0,
        "real_api_ready": 0,
        "platforms": []
    }
    
    for platform in SUPPORTED_PLATFORMS:
        configured = is_platform_configured(platform)
        real_api = platform in REAL_API_SUPPORTED
        
        results["platforms"].append({
            "code": platform,
            "configured": configured,
            "real_api_ready": configured and real_api
        })
        
        if configured:
            results["configured"] += 1
            if real_api:
                results["real_api_ready"] += 1
        else:
            results["unconfigured"] += 1
    
    results["use_mock"] = USE_MOCK
    return results
