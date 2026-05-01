#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - 商户管理模块
商户入驻、入网查询、图片上传等功能
"""
import json
import base64
from typing import Optional, Dict, Any, List

from ..client import TianqueClient, get_client


class MerchantAPI:
    """商户管理API"""
    
    def __init__(self, client: Optional[TianqueClient] = None):
        self.client = client or get_client()
    
    def apply(
        self,
        mer_name: str = None,
        mec_dis_nm: str = None,
        mbl_no: str = None,
        operational_type: str = "01",
        have_license_no: str = "01",
        mec_type_flag: str = "00",
        identity_name: str = None,
        identity_typ: str = "00",
        identity_no: str = None,
        act_nm: str = None,
        act_typ: str = "01",
        act_no: str = None,
        cpr_reg_addr: str = None,
        reg_prov_cd: str = None,
        reg_city_cd: str = None,
        reg_dist_cd: str = None,
        mcc_cd: str = "5311",
        cs_tel_no: str = None,
        qrcode_list: List[Dict] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        商户入驻
        
        Args:
            mer_name: 签购单名称
            mec_dis_nm: 商户简称(必填)
            mbl_no: 商户联系手机号(必填)
            operational_type: 经营类型 01-线下 02-线上 03-非盈利类
            have_license_no: 资质类型 01-自然人 02-个体户 03-企业
            mec_type_flag: 商户类型 00-普通单店 01-连锁总店 02-连锁分店
            identity_name: 法人/商户负责人姓名(必填)
            identity_typ: 法人证件类型 00-身份证
            identity_no: 法人证件号(必填)
            act_nm: 结算账户名(必填)
            act_typ: 结算账户类型 00-对公 01-对私
            act_no: 结算卡号(必填)
            cpr_reg_addr: 商户实际经营详细地址(必填)
            reg_prov_cd: 实际经营地址省编码
            reg_city_cd: 实际经营地址市编码
            reg_dist_cd: 实际经营地址区编码
            mcc_cd: 经营类目MCC码
            cs_tel_no: 客服电话(必填)
            qrcode_list: 二维码费率列表
            
        Returns:
            API响应结果
        """
        # 构建请求数据
        req_data = {
            "mecDisNm": mec_dis_nm,
            "mblNo": mbl_no,
            "operationalType": operational_type,
            "haveLicenseNo": have_license_no,
            "mecTypeFlag": mec_type_flag,
            "identityName": identity_name,
            "identityTyp": identity_typ,
            "identityNo": identity_no,
            "actNm": act_nm,
            "actTyp": act_typ,
            "actNo": act_no,
            "cprRegAddr": cpr_reg_addr,
            "regProvCd": reg_prov_cd or "110000000000",
            "regCityCd": reg_city_cd or "110100000000",
            "regDistCd": reg_dist_cd or "110105000000",
            "mccCd": mcc_cd,
            "csTelNo": cs_tel_no,
        }
        
        if mer_name:
            req_data["merName"] = mer_name
        
        # 默认二维码费率
        if qrcode_list:
            req_data["qrcodeList"] = qrcode_list
        else:
            req_data["qrcodeList"] = [
                {"rateType": "01", "rate": "0.72"},  # 微信
                {"rateType": "02", "rate": "0.72"},  # 支付宝
                {"rateType": "06", "rate": "0.72"},  # 银联小额
                {"rateType": "07", "rate": "0.72"},  # 银联大额
            ]
        
        # 添加可选参数
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                req_data[key] = value
        
        return self.client.post("/merchant/income", req_data)
    
    def query(self, mno: str = None, req_id: str = None) -> Dict[str, Any]:
        """
        商户入驻结果查询
        
        Args:
            mno: 商户编号(15位)
            req_id: 入驻请求ID
            
        Returns:
            API响应结果
        """
        req_data = {}
        if mno:
            req_data["mno"] = mno
        if req_id:
            req_data["reqId"] = req_id
        
        return self.client.post("/merchant/incomeQuery", req_data)
    
    def modify(
        self,
        mno: str,
        store_pic: str = None,
        inside_scene_pic: str = None,
        legal_personid_positive_pic: str = None,
        legal_personid_opposite_pic: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        商户入驻修改
        
        Args:
            mno: 商户编号
            store_pic: 门头照片地址
            inside_scene_pic: 真实商户内景照片地址
            legal_personid_positive_pic: 法人身份证正面照片地址
            legal_personid_opposite_pic: 法人身份证反面照片地址
            **kwargs: 其他可选参数
            
        Returns:
            API响应结果
        """
        req_data = {"mno": mno}
        
        if store_pic:
            req_data["storePic"] = store_pic
        if inside_scene_pic:
            req_data["insideScenePic"] = inside_scene_pic
        if legal_personid_positive_pic:
            req_data["legalPersonidPositivePic"] = legal_personid_positive_pic
        if legal_personid_opposite_pic:
            req_data["legalPersonidOppositePic"] = legal_personid_opposite_pic
        
        for key, value in kwargs.items():
            if value is not None and key not in req_data:
                req_data[key] = value
        
        return self.client.post("/merchant/incomeModify", req_data)
    
    def upload_image(
        self,
        file_path: str = None,
        image_type: str = "store",
        image_data: str = None
    ) -> Dict[str, Any]:
        """
        图片上传
        
        Args:
            file_path: 图片文件路径
            image_type: 图片类型(store/inside/license等)
            image_data: Base64编码的图片数据
            
        Returns:
            API响应结果
        """
        if file_path and not image_data:
            try:
                with open(file_path, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
            except Exception as e:
                return {"code": "FILE_ERROR", "msg": f"读取文件失败: {e}"}
        
        if not image_data:
            return {"code": "PARAM_ERROR", "msg": "请提供图片文件或Base64数据"}
        
        req_data = {
            "imageType": image_type,
            "imageData": image_data
        }
        
        return self.client.post("/file/upload", req_data)
    
    def query_merchant_info(self, mno: str) -> Dict[str, Any]:
        """
        商户信息查询
        
        Args:
            mno: 商户编号
            
        Returns:
            API响应结果
        """
        req_data = {"mno": mno}
        return self.client.post("/merchant/merchantInfoQuery", req_data)
    
    def query_audit_status(self, mno: str) -> Dict[str, Any]:
        """
        查询商户审核状态
        
        Args:
            mno: 商户编号
            
        Returns:
            API响应结果
        """
        req_data = {"mno": mno}
        return self.client.post("/merchant/auditStatusQuery", req_data)


# 便捷函数
def merchant_apply(**kwargs) -> Dict[str, Any]:
    """商户入驻"""
    return MerchantAPI().apply(**kwargs)


def merchant_query(mno: str = None, req_id: str = None) -> Dict[str, Any]:
    """商户入驻结果查询"""
    return MerchantAPI().query(mno=mno, req_id=req_id)


def merchant_modify(mno: str, **kwargs) -> Dict[str, Any]:
    """商户入驻修改"""
    return MerchantAPI().modify(mno, **kwargs)


def merchant_upload_image(file_path: str = None, image_type: str = "store", image_data: str = None) -> Dict[str, Any]:
    """图片上传"""
    return MerchantAPI().upload_image(file_path=file_path, image_type=image_type, image_data=image_data)


def merchant_info_query(mno: str) -> Dict[str, Any]:
    """商户信息查询"""
    return MerchantAPI().query_merchant_info(mno)
