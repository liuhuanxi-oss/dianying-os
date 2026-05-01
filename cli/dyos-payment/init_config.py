#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
初始化配置脚本
运行此脚本配置默认参数（密钥通过环境变量设置，不在代码中硬编码）

环境变量:
  TIANQUE_ORG_ID         - 服务商机构号
  TIANQUE_PRIVATE_KEY    - 服务商私钥
  TIANQUE_PUBLIC_KEY     - 服务商公钥
  TIANQUE_SP_PUBLIC_KEY  - 随行付公钥
  TIANQUE_MERCHANT_NO    - 测试商户号
"""
import json
import os
from pathlib import Path


def init_config():
    """初始化配置"""
    config_dir = Path.home() / ".dyos-payment"
    config_file = config_dir / "config.json"
    
    # 确保目录存在
    config_dir.mkdir(parents=True, exist_ok=True)
    
    # 从环境变量读取密钥
    private_key = os.environ.get("TIANQUE_PRIVATE_KEY", "")
    public_key = os.environ.get("TIANQUE_PUBLIC_KEY", "")
    suixingpay_public_key = os.environ.get("TIANQUE_SP_PUBLIC_KEY", "")
    org_id = os.environ.get("TIANQUE_ORG_ID", "")
    merchant_no = os.environ.get("TIANQUE_MERCHANT_NO", "")
    
    DEFAULT_CONFIG = {
        "org_id": org_id,
        "private_key": private_key,
        "public_key": public_key,
        "suixingpay_public_key": suixingpay_public_key,
        "sign_algorithm": "SHA1withRSA",
        "env": "prod",
        "test_merchant_no": merchant_no,
        "timeout": 30,
        "retry_times": 3
    }
    
    # 写入配置
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_CONFIG, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 配置已初始化")
    print(f"  配置文件: {config_file}")
    print(f"  机构号: {org_id or '未设置'}")
    print(f"  环境: {DEFAULT_CONFIG['env']}")
    
    if not private_key:
        print(f"\n⚠️  私钥未设置！请设置环境变量:")
        print(f"  export TIANQUE_ORG_ID='你的机构号'")
        print(f"  export TIANQUE_PRIVATE_KEY='你的私钥'")
        print(f"  export TIANQUE_PUBLIC_KEY='你的公钥'")
        print(f"  export TIANQUE_SP_PUBLIC_KEY='随行付公钥'")
        print(f"  export TIANQUE_MERCHANT_NO='测试商户号'")
        print(f"  然后重新运行此脚本")
    else:
        print(f"  私钥: 已配置 ✓")


if __name__ == '__main__':
    init_config()
