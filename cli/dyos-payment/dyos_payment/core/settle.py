#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 结算模块
结算查询等功能
"""
from typing import Optional, Dict, Any

from ..client import TianqueClient, get_client


class SettleAPI:
    """结算API"""
    
    # API路径映射
    API_PATHS = {
        "settle_query": "/query/settleQuery",  # 结算查询
        "settle_detail": "/query/settleDetailQuery",  # 结算明细查询
    }
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def query(
        self,
        mno: str = None,
        start_date: str = None,
        end_date: str = None,
        page_no: str = "1",
        page_size: str = "10",
        **kwargs
    ) -> Dict[str, Any]:
        """
        结算查询
        
        Args:
            mno: 商户编号
            start_date: 开始日期 YYYYMMDD
            end_date: 结束日期 YYYYMMDD
            page_no: 页码
            page_size: 每页条数
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {
            "pageNo": page_no,
            "pageSize": page_size,
        }
        
        if mno:
            req_data["mno"] = mno
        if start_date:
            req_data["startDate"] = start_date
        if end_date:
            req_data["endDate"] = end_date
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["settle_query"], req_data)
    
    def query_by_merchant(
        self,
        merchant_id: str = None,
        date: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        按商户查询结算(便捷方法)
        
        Args:
            merchant_id: 商户ID
            date: 日期 YYYY-MM 格式
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        if date:
            # 转换为 YYYYMMDD 格式
            date = date.replace("-", "").replace("/", "")
            if len(date) == 6:  # YYYYMM
                start_date = date + "01"
                # 计算月末
                year = int(date[:4])
                month = int(date[4:6])
                if month == 12:
                    end_date = str(year + 1) + "01" + "01"
                else:
                    end_date = date[:4] + str(month + 1).zfill(2) + "01"
            else:
                start_date = date
                end_date = date
        else:
            start_date = None
            end_date = None
        
        return self.query(mno=merchant_id, start_date=start_date, end_date=end_date, **kwargs)
    
    def query_detail(
        self,
        mno: str = None,
        settle_date: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        结算明细查询
        
        Args:
            mno: 商户编号
            settle_date: 结算日期 YYYYMMDD
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if settle_date:
            req_data["settleDate"] = settle_date
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["settle_detail"], req_data)


# 便捷函数
def settle_query(**kwargs) -> Dict[str, Any]:
    """结算查询"""
    return SettleAPI().query(**kwargs)


def settle_query_by_merchant(merchant_id: str = None, date: str = None, **kwargs) -> Dict[str, Any]:
    """按商户查询结算"""
    return SettleAPI().query_by_merchant(merchant_id=merchant_id, date=date, **kwargs)
