#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 对账模块
对账文件下载等功能
"""
from typing import Optional, Dict, Any

from ..client import TianqueClient, get_client


class ReconcileAPI:
    """对账API"""
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def download(
        self,
        bill_date: str = None,
        bill_type: str = "01",
        **kwargs
    ) -> Dict[str, Any]:
        """
        对账文件获取
        
        Args:
            bill_date: 账单日期 YYYYMMDD
            bill_type: 账单类型
                01-码交易对账文件
                02-结算对账文件
                03-分账对账文件
                04-转账对账文件
                05-硬件交易对账文件
                06-微校对账文件
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {
            "billDate": bill_date,
            "billType": bill_type,
        }
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                req_data[key] = value
        
        return self.client.post("/reconcile/downloadFile", req_data)
    
    def download_trade_bill(
        self,
        date: str = None
    ) -> Dict[str, Any]:
        """
        下载交易对账文件(便捷方法)
        
        Args:
            date: 日期 YYYY-MM-DD 或 YYYYMMDD 格式
            
        Returns:
            API响应结果
        """
        if date:
            date = date.replace("-", "").replace("/", "")
        
        return self.download(bill_date=date, bill_type="01")
    
    def download_settle_bill(
        self,
        date: str = None
    ) -> Dict[str, Any]:
        """
        下载结算对账文件(便捷方法)
        
        Args:
            date: 日期 YYYY-MM-DD 或 YYYYMMDD 格式
            
        Returns:
            API响应结果
        """
        if date:
            date = date.replace("-", "").replace("/", "")
        
        return self.download(bill_date=date, bill_type="02")
    
    def download_split_bill(
        self,
        date: str = None
    ) -> Dict[str, Any]:
        """
        下载分账对账文件(便捷方法)
        
        Args:
            date: 日期 YYYY-MM-DD 或 YYYYMMDD 格式
            
        Returns:
            API响应结果
        """
        if date:
            date = date.replace("-", "").replace("/", "")
        
        return self.download(bill_date=date, bill_type="03")
    
    def download_transfer_bill(
        self,
        date: str = None
    ) -> Dict[str, Any]:
        """
        下载转账对账文件(便捷方法)
        
        Args:
            date: 日期 YYYY-MM-DD 或 YYYYMMDD 格式
            
        Returns:
            API响应结果
        """
        if date:
            date = date.replace("-", "").replace("/", "")
        
        return self.download(bill_date=date, bill_type="04")


# 便捷函数
def reconcile_download(**kwargs) -> Dict[str, Any]:
    """对账文件获取"""
    return ReconcileAPI().download(**kwargs)


def download_trade_bill(date: str = None) -> Dict[str, Any]:
    """下载交易对账文件"""
    return ReconcileAPI().download_trade_bill(date=date)
