#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - API客户端
封装HTTP请求、签名、响应处理等功能
"""
import os
import time
import uuid
import json
import hashlib
import requests
from typing import Optional, Dict, Any, Union
from urllib.parse import urljoin

from .crypto import RSACrypto
from .config import get_config


class TianqueClient:
    """天阙API HTTP客户端"""
    
    # 测试环境
    TEST_BASE_URL = "https://openapi-test.suixingpay.com"
    # 生产环境
    PROD_BASE_URL = "https://openapi.tianquetech.com"
    
    def __init__(
        self,
        org_id: Optional[str] = None,
        private_key: Optional[str] = None,
        suixingpay_public_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = 30,
        retry_times: int = 3,
        use_mock: bool = False
    ):
        """
        初始化API客户端
        
        Args:
            org_id: 机构号
            private_key: 服务商私钥
            suixingpay_public_key: 随行付公钥
            base_url: API基础URL
            timeout: 请求超时时间(秒)
            retry_times: 重试次数
            use_mock: 是否使用Mock模式
        """
        config = get_config()
        
        self.org_id = org_id or config.org_id
        self.timeout = timeout
        self.retry_times = retry_times
        self.use_mock = use_mock
        
        # 确定base_url
        if base_url:
            self.base_url = base_url
        elif config.base_url:
            self.base_url = config.base_url
        else:
            self.base_url = "https://openapi.tianquetech.com"
        
        # 初始化加密工具
        self.crypto = RSACrypto(
            private_key_pem=private_key or config.private_key,
            suixingpay_public_key_pem=suixingpay_public_key or config.suixingpay_public_key,
            algorithm=config.sign_algorithm
        )
        
        # Mock数据
        self._mock_responses = self._init_mock_responses()
    
    def _init_mock_responses(self) -> Dict[str, Any]:
        """初始化Mock响应数据"""
        return {
            "merchant_income": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "mno": f"399{int(time.time()) % 100000000:08d}",
                    "auditStatus": "03",
                    "auditMsg": "入驻成功"
                }
            },
            "merchant_incomeQuery": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "mno": "***REDACTED_MERCHANT_NO***",
                    "auditStatus": "03",
                    "auditMsg": "审核通过",
                    "merName": "测试商户",
                    "mecDisNm": "测试店铺",
                    "mblNo": "13800138000"
                }
            },
            "activePlusScan": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "uuid": str(uuid.uuid4()).replace('-', '')[:32],
                    "ordNo": f"T{int(time.time()*1000)}",
                    "payUrl": "https://qr.alipay.com/xxx",
                    "expireTime": "300"
                }
            },
            "tradeQuery": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "uuid": str(uuid.uuid4()).replace('-', '')[:32],
                    "ordNo": "T1234567890",
                    "status": "01",
                    "amt": "0.01",
                    "payType": "WECHAT",
                    "payTime": time.strftime("%Y%m%d%H%M%S")
                }
            },
            "refund": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "refundUuid": str(uuid.uuid4()).replace('-', '')[:32],
                    "refundStatus": "01",
                    "refundAmt": "0.01"
                }
            },
            "settleQuery": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "settleList": [
                        {
                            "settleDate": "20240501",
                            "settleAmt": "1000.00",
                            "status": "01"
                        }
                    ],
                    "totalCount": 1
                }
            },
            "downloadFile": {
                "code": "0000",
                "msg": "交易成功",
                "reqId": str(uuid.uuid4()).replace('-', '')[:32],
                "respData": {
                    "fileUrl": "https://osscdn.suixingpay.com/reconcile/20240501.csv",
                    "fileName": "reconcile_20240501.csv"
                }
            }
        }
    
    def _get_mock_response(self, uri: str, data: Dict = None) -> Dict[str, Any]:
        """获取Mock响应"""
        # 根据URI映射到mock key
        uri_to_mock = {
            "/merchant/income": "merchant_income",
            "/merchant/incomeQuery": "merchant_incomeQuery",
            "/order/activePlusScan": "activePlusScan",
            "/query/tradeQuery": "tradeQuery",
            "/order/refund": "refund",
            "/query/settleQuery": "settleQuery",
            "/reconcile/downloadFile": "downloadFile",
        }
        
        mock_key = uri_to_mock.get(uri, "merchant_incomeQuery")
        mock_resp = self._mock_responses.get(mock_key, {}).copy()
        
        # 动态填充数据
        if data and "respData" in mock_resp:
            if "ordNo" in data:
                mock_resp["respData"]["ordNo"] = data["ordNo"]
            if "amt" in data:
                mock_resp["respData"]["amt"] = data["amt"]
            if "mno" in data:
                mock_resp["respData"]["mno"] = data["mno"]
        
        return mock_resp
    
    def _generate_req_id(self) -> str:
        """生成请求ID"""
        return str(uuid.uuid4()).replace('-', '')
    
    def _generate_timestamp(self) -> int:
        """生成时间戳"""
        return int(time.time() * 1000)
    
    def _sign_data(self, data: Dict[str, Any]) -> str:
        """
        对数据进行签名
        
        Args:
            data: 待签名数据
            
        Returns:
            签名字符串
        """
        # 构建签名字符串(排除sign和signType)
        sign_string = self._build_sign_string(data)
        return self.crypto.sign(sign_string)
    
    def _build_sign_string(self, data: Dict[str, Any], exclude_keys: set = None) -> str:
        """
        构建签名字符串
        
        Args:
            data: 待签名数据
            exclude_keys: 排除的key
            
        Returns:
            待签名字符串
        """
        if exclude_keys is None:
            exclude_keys = {'sign', 'signType'}
        
        # 过滤和排序
        filtered = {k: v for k, v in data.items() if k not in exclude_keys and v is not None}
        sorted_keys = sorted(filtered.keys())
        
        parts = []
        for key in sorted_keys:
            value = filtered[key]
            if isinstance(value, dict):
                value = json.dumps(value, ensure_ascii=False)
            elif isinstance(value, list):
                value = json.dumps(value, ensure_ascii=False)
            else:
                value = str(value)
            parts.append(f"{key}={value}")
        
        return '&'.join(parts)
    
    def _verify_response(self, response: Dict[str, Any]) -> bool:
        """
        验签响应数据
        
        Args:
            response: 响应数据
            
        Returns:
            验签结果
        """
        if 'sign' not in response or not response['sign']:
            return True
        
        return self.crypto.verify_response(response)
    
    def _build_request(
        self,
        uri: str,
        data: Optional[Dict[str, Any]] = None,
        sign_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        构建请求数据
        
        Args:
            uri: API路径
            data: 业务数据
            sign_data: 签名数据(如果不传则用data)
            
        Returns:
            完整的请求字典
        """
        req_id = self._generate_req_id()
        timestamp = self._generate_timestamp()
        
        request_body = {
            "orgId": self.org_id,
            "reqId": req_id,
            "timestamp": timestamp,
            "version": "1.0",
            "signType": "RSA"
        }
        
        if data:
            request_body["reqData"] = data
        
        # 签名
        sign_string_data = sign_data or data or {}
        sign_string_data.update({
            "orgId": self.org_id,
            "reqId": req_id,
            "timestamp": timestamp
        })
        request_body["sign"] = self._sign_data(sign_string_data)
        
        return request_body
    
    def request(
        self,
        method: str,
        uri: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        发送HTTP请求
        
        Args:
            method: HTTP方法
            uri: API路径
            data: 请求数据
            headers: 请求头
            **kwargs: 其他requests参数
            
        Returns:
            响应数据
        """
        # Mock模式
        if self.use_mock:
            mock_resp = self._get_mock_response(uri, data)
            mock_resp["_mock"] = True
            return mock_resp
        
        url = urljoin(self.base_url, uri)
        
        # 构建请求
        request_body = self._build_request(uri, data)
        
        # 设置请求头
        request_headers = {
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "DYOS-Payment-CLI/1.0"
        }
        if headers:
            request_headers.update(headers)
        
        # 发送请求(带重试)
        last_error = None
        for attempt in range(self.retry_times):
            try:
                if method.upper() == "POST":
                    response = requests.post(
                        url,
                        json=request_body,
                        headers=request_headers,
                        timeout=self.timeout,
                        **kwargs
                    )
                else:
                    response = requests.get(
                        url,
                        params=request_body,
                        headers=request_headers,
                        timeout=self.timeout,
                        **kwargs
                    )
                
                # 解析响应
                try:
                    response_data = response.json()
                except:
                    response_data = {"raw_response": response.text}
                
                # 验签
                if self._verify_response(response_data):
                    response_data["_verify_passed"] = True
                else:
                    response_data["_verify_passed"] = False
                
                response_data["_http_status"] = response.status_code
                return response_data
                
            except requests.exceptions.Timeout:
                last_error = f"请求超时(第{attempt + 1}次)"
            except requests.exceptions.ConnectionError:
                last_error = f"连接失败(第{attempt + 1}次)"
            except Exception as e:
                last_error = f"请求异常: {str(e)}"
        
        return {
            "code": "NETWORK_ERROR",
            "msg": last_error,
            "_http_status": 0,
            "_verify_passed": False
        }
    
    def post(self, uri: str, data: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """POST请求"""
        return self.request("POST", uri, data, **kwargs)
    
    def get(self, uri: str, data: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """GET请求"""
        return self.request("GET", uri, data, **kwargs)


# 便捷函数
def get_client(use_mock: bool = False) -> TianqueClient:
    """获取API客户端实例"""
    return TianqueClient(use_mock=use_mock)


def create_client(
    org_id: Optional[str] = None,
    private_key: Optional[str] = None,
    suixingpay_public_key: Optional[str] = None,
    base_url: Optional[str] = None,
    use_mock: bool = False
) -> TianqueClient:
    """创建API客户端"""
    return TianqueClient(
        org_id=org_id,
        private_key=private_key,
        suixingpay_public_key=suixingpay_public_key,
        base_url=base_url,
        use_mock=use_mock
    )
