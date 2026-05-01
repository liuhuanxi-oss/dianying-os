#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
初始化配置脚本
运行此脚本配置默认的密钥和参数
"""
import json
import os
from pathlib import Path

DEFAULT_CONFIG = {
    "org_id": "***REDACTED_ORG_ID***",
    "private_key": "***REDACTED_PRIVATE_KEY***==",
    "public_key": "***REDACTED_PUBLIC_KEY***",
    "suixingpay_public_key": "***REDACTED_SP_PUBLIC_KEY***",
    "sign_algorithm": "SHA1withRSA",
    "env": "prod",
    "test_merchant_no": "***REDACTED_MERCHANT_NO***",
    "timeout": 30,
    "retry_times": 3
}


def init_config():
    """初始化配置"""
    config_dir = Path.home() / ".dyos-payment"
    config_file = config_dir / "config.json"
    
    # 确保目录存在
    config_dir.mkdir(parents=True, exist_ok=True)
    
    # 写入配置
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_CONFIG, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 配置已初始化")
    print(f"  配置文件: {config_file}")
    print(f"  机构号: {DEFAULT_CONFIG['org_id']}")
    print(f"  环境: {DEFAULT_CONFIG['env']}")
    print(f"  测试商户号: {DEFAULT_CONFIG['test_merchant_no']}")


if __name__ == '__main__':
    init_config()
