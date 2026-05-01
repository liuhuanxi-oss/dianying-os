#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - RSA加密工具
提供签名、验签、Base64编码等功能
"""
import base64
import hashlib
from typing import Optional, Tuple
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.backends import default_backend
from cryptography.x509 import load_pem_x509_certificate


class RSACrypto:
    """RSA加密解密工具类"""
    
    def __init__(
        self,
        private_key_pem: Optional[str] = None,
        public_key_pem: Optional[str] = None,
        suixingpay_public_key_pem: Optional[str] = None,
        algorithm: str = "SHA1withRSA"
    ):
        """
        初始化RSA加密工具
        
        Args:
            private_key_pem: 服务商私钥(PEM格式或Base64编码的PKCS8)
            public_key_pem: 服务商公钥(PEM格式或Base64编码的X509)
            suixingpay_public_key_pem: 随行付公钥(PEM格式或Base64编码的X509)
            algorithm: 签名算法
        """
        self.private_key = None
        self.public_key = None
        self.suixingpay_public_key = None
        self.algorithm = algorithm
        
        if private_key_pem:
            self.load_private_key(private_key_pem)
        if public_key_pem:
            self.load_public_key(public_key_pem)
        if suixingpay_public_key_pem:
            self.load_suixingpay_public_key(suixingpay_public_key_pem)
    
    def load_private_key(self, private_key_pem: str):
        """加载私钥"""
        pem_data = private_key_pem.strip()
        
        # 检查是否已经是PEM格式
        if pem_data.startswith('-----BEGIN'):
            pem_bytes = pem_data.encode('utf-8')
        else:
            # 尝试作为Base64编码的PKCS8私钥解析
            try:
                decoded = base64.b64decode(pem_data)
                # 检查是否是DER格式
                self.private_key = serialization.load_der_private_key(
                    decoded,
                    password=None,
                    backend=default_backend()
                )
                return
            except Exception:
                pass
            
            # 尝试添加PEM头尾
            pem_with_header = f"-----BEGIN RSA PRIVATE KEY-----\n"
            # 每64字符换行
            for i in range(0, len(pem_data), 64):
                pem_with_header += pem_data[i:i+64] + "\n"
            pem_with_header += "-----END RSA PRIVATE KEY-----"
            pem_bytes = pem_with_header.encode('utf-8')
        
        try:
            self.private_key = serialization.load_pem_private_key(
                pem_bytes,
                password=None,
                backend=default_backend()
            )
        except Exception as e:
            raise ValueError(f"加载私钥失败: {e}")
    
    def load_public_key(self, public_key_pem: str):
        """加载公钥"""
        pem_data = public_key_pem.strip()
        
        # 检查是否已经是PEM格式
        if pem_data.startswith('-----BEGIN'):
            pem_bytes = pem_data.encode('utf-8')
        else:
            # 尝试作为Base64编码的X509公钥解析
            try:
                decoded = base64.b64decode(pem_data)
                self.public_key = serialization.load_der_public_key(
                    decoded,
                    backend=default_backend()
                )
                return
            except Exception:
                pass
            
            # 尝试添加PEM头尾
            pem_with_header = f"-----BEGIN PUBLIC KEY-----\n"
            for i in range(0, len(pem_data), 64):
                pem_with_header += pem_data[i:i+64] + "\n"
            pem_with_header += "-----END PUBLIC KEY-----"
            pem_bytes = pem_with_header.encode('utf-8')
        
        try:
            self.public_key = serialization.load_pem_x509_certificate(
                pem_bytes,
                backend=default_backend()
            ).public_key()
        except Exception as e:
            raise ValueError(f"加载公钥失败: {e}")
    
    def load_suixingpay_public_key(self, public_key_pem: str):
        """加载随行付公钥"""
        self.load_public_key(public_key_pem)
        self.suixingpay_public_key = self.public_key
    
    def _get_hash_algorithm(self):
        """获取哈希算法"""
        if self.algorithm == "SHA1withRSA":
            return hashes.SHA1()
        elif self.algorithm == "SHA256withRSA":
            return hashes.SHA256()
        else:
            return hashes.SHA1()
    
    def sign(self, data: str) -> str:
        """
        对数据进行签名
        
        Args:
            data: 待签名的字符串数据
            
        Returns:
            Base64编码的签名结果
        """
        if not self.private_key:
            raise ValueError("私钥未加载")
        
        try:
            message = data.encode('utf-8')
            signature = self.private_key.sign(
                message,
                padding.PKCS1v15(),
                self._get_hash_algorithm()
            )
            return base64.b64encode(signature).decode('utf-8')
        except Exception as e:
            raise ValueError(f"签名失败: {e}")
    
    def verify(self, data: str, signature: str, public_key_pem: Optional[str] = None) -> bool:
        """
        验签
        
        Args:
            data: 原始数据
            signature: Base64编码的签名
            public_key_pem: 公钥(可选，默认使用随行付公钥)
            
        Returns:
            验签结果
        """
        key = self.suixingpay_public_key
        if public_key_pem:
            key = self._load_public_key_from_pem(public_key_pem)
        
        if not key:
            raise ValueError("公钥未加载")
        
        try:
            message = data.encode('utf-8')
            sig_bytes = base64.b64decode(signature)
            key.verify(
                sig_bytes,
                message,
                padding.PKCS1v15(),
                self._get_hash_algorithm()
            )
            return True
        except Exception:
            return False
    
    def _load_public_key_from_pem(self, public_key_pem: str):
        """从PEM加载公钥"""
        pem_data = public_key_pem.strip()
        if pem_data.startswith('-----BEGIN'):
            pem_bytes = pem_data.encode('utf-8')
        else:
            try:
                decoded = base64.b64decode(pem_data)
                return serialization.load_der_public_key(decoded, backend=default_backend())
            except Exception:
                pem_with_header = f"-----BEGIN PUBLIC KEY-----\n"
                for i in range(0, len(pem_data), 64):
                    pem_with_header += pem_data[i:i+64] + "\n"
                pem_with_header += "-----END PUBLIC KEY-----"
                pem_bytes = pem_with_header.encode('utf-8')
        
        return serialization.load_pem_x509_certificate(pem_bytes, backend=default_backend()).public_key()
    
    def verify_response(self, response_data: dict) -> bool:
        """
        验签响应数据
        
        Args:
            response_data: 响应数据字典
            
        Returns:
            验签结果
        """
        if 'sign' not in response_data:
            return True  # 无签名字段，默认通过
        
        sign = response_data.get('sign', '')
        
        # 构建待验签字符串(按字典key排序)
        sign_data = self._build_sign_string(response_data)
        
        return self.verify(sign_data, sign)
    
    def _build_sign_string(self, data: dict, exclude_keys: Optional[set] = None) -> str:
        """
        构建签名字符串
        
        Args:
            data: 待签名的字典
            exclude_keys: 排除的key集合
            
        Returns:
            待签名字符串
        """
        if exclude_keys is None:
            exclude_keys = {'sign', 'signType'}
        
        # 过滤和排序
        filtered = {k: v for k, v in data.items() if k not in exclude_keys and v is not None}
        sorted_keys = sorted(filtered.keys())
        
        # 拼接
        parts = []
        for key in sorted_keys:
            value = filtered[key]
            if isinstance(value, dict):
                value = self._build_sign_string(value)
            elif isinstance(value, list):
                value = str(value)
            else:
                value = str(value)
            parts.append(f"{key}={value}")
        
        return '&'.join(parts)


def test_sign(crypto: RSACrypto) -> bool:
    """
    测试签名功能
    
    Args:
        crypto: RSACrypto实例
        
    Returns:
        测试结果
    """
    test_data = "orgId=YOUR_ORG_ID&reqId=test123&timestamp=1234567890"
    
    try:
        signature = crypto.sign(test_data)
        print(f"签名结果: {signature}")
        
        # 自验签
        is_valid = crypto.verify(test_data, signature, crypto.public_key.public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8') if crypto.public_key else None)
        print(f"自验签结果: {is_valid}")
        
        return True
    except Exception as e:
        print(f"签名测试失败: {e}")
        return False


def get_public_key_from_private_key(private_key_pem: str) -> str:
    """
    从私钥提取公钥
    
    Args:
        private_key_pem: PEM格式私钥
        
    Returns:
        PEM格式公钥
    """
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    
    try:
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        public_key = private_key.public_key()
        return public_key.public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
    except Exception:
        return ""
