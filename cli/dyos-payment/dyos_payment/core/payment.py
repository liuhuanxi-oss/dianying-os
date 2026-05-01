#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 支付交易模块
主扫、被扫、查询、退款、关单等功能

API文档: https://paas.tianquetech.com/docs/#/product/shjj
"""
import uuid
import time
from typing import Optional, Dict, Any, List

from ..client import TianqueClient, get_client


class PaymentAPI:
    """支付交易API"""
    
    # API路径映射
    API_PATHS = {
        "active_scan": "/order/activePlusScan",  # 主扫支付(统一下单)
        "reverse_scan": "/order/reverseScan",  # 被扫支付(B扫C)
        "trade_query": "/query/tradeQuery",  # 支付结果查询
        "refund": "/order/refund",  # 申请退款
        "refund_query": "/query/refundQuery",  # 退款结果查询
        "close": "/order/close",  # 关闭订单
        "fee_query": "/query/feeQuery",  # 手续费查询
    }
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def create_scan_pay(
        self,
        mno: str = None,
        ord_no: str = None,
        amt: str = None,
        subject: str = None,
        pay_type: str = None,
        trm_ip: str = "127.0.0.1",
        time_expire: str = "5",
        **kwargs
    ) -> Dict[str, Any]:
        """
        主扫支付(统一下单)
        
        Args:
            mno: 商户编号
            ord_no: 商户订单号
            amt: 订单金额(元)
            subject: 订单标题
            pay_type: 支付渠道 WECHAT/ALIPAY/UNIONPAY/YZF/DCEP
            trm_ip: 交易终端IP
            time_expire: 订单失效时间(分钟)
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果，包含payUrl用于生成二维码
        """
        # 使用测试商户号或配置
        config = self.client.base_url
        mno = mno or self.client.org_id
        
        req_data = {
            "mno": mno,
            "ordNo": ord_no or self._generate_ord_no(),
            "amt": amt,
            "subject": subject or "订单支付",
            "trmIp": trm_ip,
            "timeExpire": time_expire,
            "ledgerAccountFlag": "01",  # 默认不分账
        }
        
        if pay_type:
            req_data["payType"] = pay_type
        
        # 添加可选参数
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["active_scan"], req_data)
    
    def create_scan_pay_v2(
        self,
        mno: str = None,
        ord_no: str = None,
        amt: str = None,
        subject: str = None,
        pay_type: str = None,
        trm_ip: str = "127.0.0.1",
        **kwargs
    ) -> Dict[str, Any]:
        """
        主扫支付(统一下单) v2版本别名
        """
        return self.create_scan_pay(mno=mno, ord_no=ord_no, amt=amt, subject=subject, pay_type=pay_type, trm_ip=trm_ip, **kwargs)
    
    def reverse_scan(
        self,
        mno: str = None,
        ord_no: str = None,
        amt: str = None,
        auth_code: str = None,
        subject: str = None,
        pay_type: str = None,
        trm_ip: str = "127.0.0.1",
        **kwargs
    ) -> Dict[str, Any]:
        """
        被扫支付(B扫C)
        
        Args:
            mno: 商户编号
            ord_no: 商户订单号
            amt: 订单金额(元)
            auth_code: 授权码(付款码)
            subject: 订单标题
            pay_type: 支付渠道 WECHAT/ALIPAY/UNIONPAY/YZF/DCEP
            trm_ip: 交易终端IP
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        if not auth_code:
            return {"code": "PARAM_ERROR", "msg": "授权码(auth_code)不能为空"}
        
        req_data = {
            "mno": mno or self.client.org_id,
            "ordNo": ord_no or self._generate_ord_no(),
            "amt": amt,
            "authCode": auth_code,
            "subject": subject or "订单支付",
            "trmIp": trm_ip,
        }
        
        if pay_type:
            req_data["payType"] = pay_type
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["reverse_scan"], req_data)
    
    def query(
        self,
        mno: str = None,
        ord_no: str = None,
        uuid: str = None
    ) -> Dict[str, Any]:
        """
        支付结果查询
        
        Args:
            mno: 商户编号
            ord_no: 商户订单号
            uuid: 天阙订单号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if ord_no:
            req_data["ordNo"] = ord_no
        if uuid:
            req_data["uuid"] = uuid
        
        return self.client.post(self.API_PATHS["trade_query"], req_data)
    
    def refund(
        self,
        mno: str = None,
        ord_no: str = None,
        uuid: str = None,
        amt: str = None,
        refund_type: str = "01",
        **kwargs
    ) -> Dict[str, Any]:
        """
        申请退款
        
        Args:
            mno: 商户编号
            ord_no: 商户订单号
            uuid: 天阙订单号
            amt: 退款金额(元)
            refund_type: 退款类型 01-部分退款 02-全额退款
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {
            "refundType": refund_type,
        }
        
        if mno:
            req_data["mno"] = mno
        if ord_no:
            req_data["ordNo"] = ord_no
        if uuid:
            req_data["uuid"] = uuid
        if amt:
            req_data["amt"] = amt
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["refund"], req_data)
    
    def refund_query(
        self,
        mno: str = None,
        refund_uuid: str = None,
        orig_uuid: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        退款结果查询
        
        Args:
            mno: 商户编号
            refund_uuid: 退款订单号
            orig_uuid: 原交易订单号
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if refund_uuid:
            req_data["refundUuid"] = refund_uuid
        if orig_uuid:
            req_data["origUuid"] = orig_uuid
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                camel_key = ''.join(word.title() if i else word for i, word in enumerate(key.split('_')))
                camel_key = camel_key[0].lower() + camel_key[1:] if len(camel_key) > 1 else camel_key.lower()
                req_data[camel_key] = value
        
        return self.client.post(self.API_PATHS["refund_query"], req_data)
    
    def close(
        self,
        mno: str = None,
        ord_no: str = None,
        uuid: str = None
    ) -> Dict[str, Any]:
        """
        关闭订单
        
        Args:
            mno: 商户编号
            ord_no: 商户订单号
            uuid: 天阙订单号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if ord_no:
            req_data["ordNo"] = ord_no
        if uuid:
            req_data["uuid"] = uuid
        
        return self.client.post(self.API_PATHS["close"], req_data)
    
    def query_fee(
        self,
        mno: str = None,
        uuid: str = None
    ) -> Dict[str, Any]:
        """
        手续费查询
        
        Args:
            mno: 商户编号
            uuid: 天阙订单号
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if uuid:
            req_data["uuid"] = uuid
        
        return self.client.post(self.API_PATHS["fee_query"], req_data)
    
    def _generate_ord_no(self) -> str:
        """生成商户订单号"""
        return f"T{int(time.time()*1000)}"


# 便捷函数
def create_scan_pay(**kwargs) -> Dict[str, Any]:
    """主扫支付"""
    return PaymentAPI().create_scan_pay(**kwargs)


def reverse_scan(**kwargs) -> Dict[str, Any]:
    """被扫支付"""
    return PaymentAPI().reverse_scan(**kwargs)


def query_trade(**kwargs) -> Dict[str, Any]:
    """支付结果查询"""
    return PaymentAPI().query(**kwargs)


def refund(**kwargs) -> Dict[str, Any]:
    """申请退款"""
    return PaymentAPI().refund(**kwargs)


def close_order(**kwargs) -> Dict[str, Any]:
    """关闭订单"""
    return PaymentAPI().close(**kwargs)
