"""
店赢OS - 8大本地生活平台统一CLI工具

一个命令管理美团、饿了么、抖音、小红书、微信视频号、高德、支付宝、百度8大平台
"""

__version__ = "0.1.0"
__author__ = "店赢OS Team"

from dyos_platforms.core.base import PlatformCLI

# 导出所有平台CLI类
from dyos_platforms.core.meituan import MeituanCLI
from dyos_platforms.core.eleme import ElemeCLI
from dyos_platforms.core.douyin import DouyinCLI
from dyos_platforms.core.xiaohongshu import XiaohongshuCLI
from dyos_platforms.core.wechat import WechatCLI
from dyos_platforms.core.amap import AmapCLI
from dyos_platforms.core.alipay import AlipayCLI
from dyos_platforms.core.baidu import BaiduCLI

__all__ = [
    "PlatformCLI",
    "MeituanCLI",
    "ElemeCLI", 
    "DouyinCLI",
    "XiaohongshuCLI",
    "WechatCLI",
    "AmapCLI",
    "AlipayCLI",
    "BaiduCLI",
]
