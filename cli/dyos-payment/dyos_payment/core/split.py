#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 分账模块
分账申请、分账查询等功能
"""
import uuid
import json
from typing import Optional, Dict, Any, List

from ..client import TianqueClient, get_client


class SplitAPI:
    """分账API"""
    
    # API路径映射
    API_PATHS = {
        "launch_ledger": "/query/ledger/launchLedger",  # 分账申请
        "query_ledger": "/query/ledger/queryLedger",  # 分账结果查询
        "sign_agreement": "/query/ledger/signAgreement",  # 分账协议签署
        "query_agreement": "/query/ledger/querySignAgreement",  # 分账协议签署结果查询
    }
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def apply(
        self,
        mno: str = None,
        ord_no: str = None,
        ledger_account_flag: str = "01",
        ledger_rule: List[Dict] = None,
        notify_address: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        分账申请
        
        Args:
            mno: 分账出款商户编号
            ord_no: 原交易商户订单号
            ledger_account_flag: 分账类型 00-取消分账 01-分账
            ledger_rule: 分账规则列表 [{"allotValue": 0.01, "mno": "399xxx"}]
            notify_address: 分账结果通知地址
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {
            "mno": mno,
            "ordNo": ord_no,
            "uuid": str(uuid.uuid4()).replace('-', ''),
            "ledgerAccountFlag": ledger_account_flag,
        }
        
        if ledger_rule:
            req_data["ledgerRule"] = ledger_rule
        
        if notify_address:
            req_data["notifyAddress"] = notify_address
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["launch_ledger"], req_data)
    
    def apply_split(
        self,
        trade_no: str = None,
        ratio: str = None,
        mno: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        按比例分账(便捷方法)
        
        Args:
            trade_no: 交易订单号
            ratio: 分账比例，逗号分隔如 "0.7,0.3"
            mno: 商户编号
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        if not trade_no:
            return {"code": "PARAM_ERROR", "msg": "交易订单号不能为空"}
        
        if not ratio:
            return {"code": "PARAM_ERROR", "msg": "分账比例不能为空"}
        
        # 解析比例
        ratios = [float(r.strip()) for r in ratio.split(',')]
        if abs(sum(ratios) - 1.0) > 0.01:
            return {"code": "PARAM_ERROR", "msg": f"分账比例总和必须为1，当前总和: {sum(ratios)}"}
        
        # 构建分账规则(简化版本)
        ledger_rule = [{"allotValue": str(r), "mno": mno} for r in ratios]
        
        return self.apply(
            mno=mno,
            ord_no=trade_no,
            ledger_account_flag="01",
            ledger_rule=ledger_rule,
            **kwargs
        )
    
    def query(
        self,
        mno: str = None,
        ledger_uuid: str = None,
        uuid: str = None
    ) -> Dict[str, Any]:
        """
        分账结果查询
        
        Args:
            mno: 商户编号
            ledger_uuid: 天阙分账订单号
            uuid: 商户分账订单号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if ledger_uuid:
            req_data["ledgerUuid"] = ledger_uuid
        if uuid:
            req_data["uuid"] = uuid
        
        return self.client.post(self.API_PATHS["query_ledger"], req_data)
    
    def query_split(
        self,
        split_no: str = None,
        mno: str = None
    ) -> Dict[str, Any]:
        """
        分账结果查询(便捷方法)
        
        Args:
            split_no: 分账订单号
            mno: 商户编号
            
        Returns:
            API响应结果
        """
        return self.query(uuid=split_no, mno=mno)
    
    def sign_agreement(
        self,
        mno: str,
        sign_type: str = "01"
    ) -> Dict[str, Any]:
        """
        分账协议签署
        
        Args:
            mno: 商户编号
            sign_type: 签署方式 01-自动签署
            
        Returns:
            API响应结果
        """
        req_data = {
            "mno": mno,
            "signType": sign_type
        }
        
        return self.client.post(self.API_PATHS["sign_agreement"], req_data)
    
    def query_agreement(
        self,
        mno: str
    ) -> Dict[str, Any]:
        """
        分账协议签署结果查询
        
        Args:
            mno: 商户编号
            
        Returns:
            API响应结果
        """
        req_data = {"mno": mno}
        return self.client.post(self.API_PATHS["query_agreement"], req_data)


# 便捷函数
def split_apply(**kwargs) -> Dict[str, Any]:
    """分账申请"""
    return SplitAPI().apply(**kwargs)


def split_query(**kwargs) -> Dict[str, Any]:
    """分账结果查询"""
    return SplitAPI().query(**kwargs)


def split_sign_agreement(mno: str, **kwargs) -> Dict[str, Any]:
    """分账协议签署"""
    return SplitAPI().sign_agreement(mno, **kwargs)
