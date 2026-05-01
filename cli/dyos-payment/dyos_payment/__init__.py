#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具
DianYing OS Tianque Payment CLI Tool

AI-First Payment CLI for Tianque (SuixingPay) Open Platform
"""
__version__ = "1.0.0"
__author__ = "DianYing OS Team"
__description__ = "店赢OS天阙支付CLI工具 - Agent-First支付能力封装"

from .config import Config, get_config, init_config, switch_env
from .crypto import RSACrypto, test_sign
from .client import TianqueClient, get_client, create_client
from .core import (
    MerchantAPI,
    PaymentAPI,
    SplitAPI,
    SettleAPI,
    TransferAPI,
    ReconcileAPI,
)
from .utils import OutputFormatter, REPLSkin

__all__ = [
    # 版本信息
    '__version__',
    '__author__',
    '__description__',
    # 配置
    'Config',
    'get_config',
    'init_config',
    'switch_env',
    # 加密
    'RSACrypto',
    'test_sign',
    # 客户端
    'TianqueClient',
    'get_client',
    'create_client',
    # 核心API
    'MerchantAPI',
    'PaymentAPI',
    'SplitAPI',
    'SettleAPI',
    'TransferAPI',
    'ReconcileAPI',
    # 工具
    'OutputFormatter',
    'REPLSkin',
]
