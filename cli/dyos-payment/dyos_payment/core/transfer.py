#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 转账模块
转账申请、转账查询等功能
"""
import uuid
from typing import Optional, Dict, Any

from ..client import TianqueClient, get_client


class TransferAPI:
    """转账API"""
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def transfer(
        self,
        mno: str = None,
        ord_no: str = None,
        amt: str = None,
        target_mno: str = None,
        target_name: str = None,
        target_type: str = "01",
        notify_url: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        转账
        
        Args:
            mno: 转出商户编号
            ord_no: 商户订单号
            amt: 转账金额(元)
            target_mno: 目标商户编号
            target_name: 目标商户名称
            target_type: 目标账户类型 01-对私 02-对公
            notify_url: 结果通知地址
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {
            "mno": mno,
            "ordNo": ord_no or str(uuid.uuid4()).replace('-', ''),
            "amt": amt,
            "targetMno": target_mno,
            "targetName": target_name,
            "targetType": target_type,
        }
        
        if notify_url:
            req_data["notifyUrl"] = notify_url
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                req_data[key] = value
        
        return self.client.post("/transfer/accountTransfer", req_data)
    
    def query(
        self,
        mno: str = None,
        ord_no: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        转账结果查询
        
        Args:
            mno: 商户编号
            ord_no: 订单号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if ord_no:
            req_data["ordNo"] = ord_no
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                req_data[key] = value
        
        return self.client.post("/query/transferQuery", req_data)
    
    def balance_query(
        self,
        mno: str = None
    ) -> Dict[str, Any]:
        """
        账户余额查询
        
        Args:
            mno: 商户编号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        
        return self.client.post("/query/balanceQuery", req_data)


# 便捷函数
def transfer(**kwargs) -> Dict[str, Any]:
    """转账"""
    return TransferAPI().transfer(**kwargs)


def transfer_query(**kwargs) -> Dict[str, Any]:
    """转账结果查询"""
    return TransferAPI().query(**kwargs)
