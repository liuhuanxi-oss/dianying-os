#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS管理后台API - 天阙支付路由
对接天阙开放平台API，为前端管理后台提供支付能力

API文档: https://paas.tianquetech.com/docs/
生产环境: https://openapi.tianquetech.com
生产环境: https://openapi.tianquetech.com
"""
import os
import sys
import time
import uuid
import json
import base64
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException, Body
from pydantic import BaseModel, Field

# 添加路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import execute_query, execute_insert, execute_update

router = APIRouter(prefix="/payment", tags=["天阙支付"])


# ================================
# 配置和密钥加载
# ================================
def load_tianque_config():
    """从环境变量或配置文件加载天阙配置"""
    return {
        "org_id": os.environ.get("TIANQUE_ORG_ID", "YOUR_ORG_ID"),
        "private_key": os.environ.get("TIANQUE_PRIVATE_KEY", ""),
        "suixingpay_public_key": os.environ.get("TIANQUE_PUBLIC_KEY", ""),
        "sign_algorithm": os.environ.get("TIANQUE_SIGN_ALGORITHM", "SHA1withRSA"),
        "base_url": os.environ.get("TIANQUE_BASE_URL", "https://openapi.tianquetech.com"),
        "test_merchant_no": os.environ.get("TIANQUE_TEST_MNO", "YOUR_MERCHANT_NO"),
    }


def get_rsa_crypto():
    """获取RSA加密工具"""
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.backends import default_backend
    import base64
    
    config = load_tianque_config()
    
    class RSACryptoHelper:
        def __init__(self):
            self.private_key_pem = config["private_key"]
            self.algorithm = config["sign_algorithm"]
            self.private_key = None
            if self.private_key_pem:
                self._load_private_key()
        
        def _load_private_key(self):
            pem_data = self.private_key_pem.strip()
            if pem_data.startswith('-----BEGIN'):
                pem_bytes = pem_data.encode('utf-8')
            else:
                try:
                    decoded = base64.b64decode(pem_data)
                    from cryptography.hazmat.primitives.serialization import load_der_private_key
                    self.private_key = load_der_private_key(decoded, password=None, backend=default_backend())
                    return
                except:
                    pass
                pem_with_header = f"-----BEGIN RSA PRIVATE KEY-----\n"
                for i in range(0, len(pem_data), 64):
                    pem_with_header += pem_data[i:i+64] + "\n"
                pem_with_header += "-----END RSA PRIVATE KEY-----"
                pem_bytes = pem_with_header.encode('utf-8')
            
            from cryptography.hazmat.primitives.serialization import load_pem_private_key
            self.private_key = load_pem_private_key(pem_bytes, password=None, backend=default_backend())
        
        def sign(self, data: str) -> str:
            if not self.private_key:
                raise ValueError("私钥未配置")
            
            hash_algo = hashes.SHA1() if self.algorithm == "SHA1withRSA" else hashes.SHA256()
            signature = self.private_key.sign(
                data.encode('utf-8'),
                padding.PKCS1v15(),
                hash_algo
            )
            return base64.b64encode(signature).decode('utf-8')
    
    return RSACryptoHelper()


def build_sign_string(data: Dict, exclude_keys: set = None) -> str:
    """构建签名字符串"""
    if exclude_keys is None:
        exclude_keys = {'sign', 'signType'}
    
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


def call_tianque_api(uri: str, data: Dict = None, method: str = "POST") -> Dict:
    """
    调用天阙API
    
    Args:
        uri: API路径
        data: 请求数据
        method: HTTP方法
    """
    import requests
    
    config = load_tianque_config()
    url = config["base_url"] + uri
    
    # 生成公共参数
    req_id = str(uuid.uuid4()).replace('-', '')
    timestamp = int(time.time() * 1000)
    
    # 构建签名数据
    sign_data = {
        "orgId": config["org_id"],
        "reqId": req_id,
        "timestamp": timestamp,
    }
    if data:
        sign_data.update(data)
    
    # 签名
    sign_string = build_sign_string(sign_data)
    crypto = get_rsa_crypto()
    sign = crypto.sign(sign_string)
    
    # 构建请求体
    request_body = {
        "orgId": config["org_id"],
        "reqId": req_id,
        "timestamp": timestamp,
        "version": "1.0",
        "signType": "RSA",
        "sign": sign,
    }
    if data:
        request_body["reqData"] = data
    
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "DYOS-Admin-API/1.0"
    }
    
    try:
        if method == "POST":
            response = requests.post(url, json=request_body, headers=headers, timeout=30)
        else:
            response = requests.get(url, params=request_body, headers=headers, timeout=30)
        
        return response.json()
    except Exception as e:
        return {"code": "NETWORK_ERROR", "msg": str(e)}


# ================================
# Mock数据生成
# ================================
def generate_mock_response(api_name: str, data: Dict = None) -> Dict:
    """生成Mock响应数据"""
    mock_responses = {
        "merchant_income": {
            "code": "0000",
            "msg": "交易成功",
            "reqId": str(uuid.uuid4()).replace('-', '')[:32],
            "respData": {
                "mno": f"399{int(time.time()) % 100000000:08d}",
                "auditStatus": "03",  # 审核通过
                "auditMsg": "入驻成功"
            }
        },
        "merchant_incomeQuery": {
            "code": "0000",
            "msg": "交易成功",
            "reqId": str(uuid.uuid4()).replace('-', '')[:32],
            "respData": {
                "mno": data.get("mno", "YOUR_MERCHANT_NO") if data else "YOUR_MERCHANT_NO",
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
                "ordNo": data.get("ordNo", f"T{int(time.time()*1000)}") if data else f"T{int(time.time()*1000)}",
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
                "ordNo": data.get("ordNo", "T1234567890") if data else "T1234567890",
                "status": "01",  # 支付成功
                "amt": data.get("amt", "0.01") if data else "0.01",
                "payType": "WECHAT",
                "payTime": datetime.now().strftime("%Y%m%d%H%M%S")
            }
        },
        "refund": {
            "code": "0000",
            "msg": "交易成功",
            "reqId": str(uuid.uuid4()).replace('-', '')[:32],
            "respData": {
                "refundUuid": str(uuid.uuid4()).replace('-', '')[:32],
                "refundStatus": "01",  # 退款中
                "refundAmt": data.get("amt", "0.01") if data else "0.01"
            }
        },
        "launchLedger": {
            "code": "0000",
            "msg": "交易成功",
            "reqId": str(uuid.uuid4()).replace('-', '')[:32],
            "respData": {
                "ledgerUuid": str(uuid.uuid4()).replace('-', '')[:32],
                "ledgerStatus": "01"  # 分账中
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
                        "status": "01"  # 已结算
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
    return mock_responses.get(api_name, {"code": "0000", "msg": "成功"})


# ================================
# 请求/响应模型
# ================================
class MerchantApplyRequest(BaseModel):
    """商户入驻请求"""
    mer_name: Optional[str] = Field(None, description="签购单名称")
    mec_dis_nm: str = Field(..., description="商户简称(必填)")
    mbl_no: str = Field(..., description="商户联系手机号(必填)")
    operational_type: str = Field("01", description="经营类型: 01-线下 02-线上")
    have_license_no: str = Field("01", description="资质类型: 01-自然人 02-个体户 03-企业")
    mec_type_flag: str = Field("00", description="商户类型: 00-普通单店 01-连锁总店 02-连锁分店")
    identity_name: str = Field(..., description="法人/负责人姓名(必填)")
    identity_typ: str = Field("00", description="证件类型: 00-身份证")
    identity_no: str = Field(..., description="证件号(必填)")
    act_nm: str = Field(..., description="结算账户名(必填)")
    act_typ: str = Field("01", description="账户类型: 00-对公 01-对私")
    act_no: str = Field(..., description="结算卡号(必填)")
    cpr_reg_addr: str = Field(..., description="实际经营地址(必填)")
    reg_prov_cd: str = Field("110000000000", description="省编码")
    reg_city_cd: str = Field("110100000000", description="市编码")
    reg_dist_cd: str = Field("110105000000", description="区编码")
    mcc_cd: str = Field("5311", description="MCC码")
    cs_tel_no: str = Field(..., description="客服电话(必填)")
    qrcode_list: Optional[List[Dict]] = Field(None, description="二维码费率列表")


class TradeCreateRequest(BaseModel):
    """创建支付请求"""
    mno: Optional[str] = Field(None, description="商户编号")
    ord_no: Optional[str] = Field(None, description="商户订单号")
    amt: str = Field(..., description="订单金额(元)(必填)")
    subject: str = Field("订单支付", description="订单标题")
    pay_type: Optional[str] = Field(None, description="支付渠道: WECHAT/ALIPAY/UNIONPAY/YZF/DCEP")
    trm_ip: str = Field("127.0.0.1", description="交易终端IP")
    time_expire: str = Field("5", description="订单失效时间(分钟)")


class RefundRequest(BaseModel):
    """退款请求"""
    mno: Optional[str] = Field(None, description="商户编号")
    ord_no: Optional[str] = Field(None, description="商户订单号")
    uuid: Optional[str] = Field(None, description="天阙订单号")
    amt: str = Field(..., description="退款金额(元)(必填)")
    refund_type: str = Field("01", description="退款类型: 01-部分退款 02-全额退款")


class SplitApplyRequest(BaseModel):
    """分账请求"""
    mno: Optional[str] = Field(None, description="分账出款商户编号")
    ord_no: str = Field(..., description="原交易订单号(必填)")
    ledger_account_flag: str = Field("01", description="分账类型: 00-取消分账 01-分账")
    ledger_rule: Optional[List[Dict]] = Field(None, description="分账规则列表")
    notify_address: Optional[str] = Field(None, description="分账结果通知地址")


def api_response(data=None, message="", code=0):
    """统一响应格式"""
    return {"code": code, "message": message, "data": data}


# ================================
# API接口实现
# ================================
@router.post("/merchant-apply")
async def merchant_apply(
    request: MerchantApplyRequest = Body(...),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    商户入网申请
    
    提交商户基本信息到天阙平台进行入驻审核
    """
    if mock:
        result = generate_mock_response("merchant_income", request.dict())
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    # 构建请求数据
    req_data = {
        "mecDisNm": request.mec_dis_nm,
        "mblNo": request.mbl_no,
        "operationalType": request.operational_type,
        "haveLicenseNo": request.have_license_no,
        "mecTypeFlag": request.mec_type_flag,
        "identityName": request.identity_name,
        "identityTyp": request.identity_typ,
        "identityNo": request.identity_no,
        "actNm": request.act_nm,
        "actTyp": request.act_typ,
        "actNo": request.act_no,
        "cprRegAddr": request.cpr_reg_addr,
        "regProvCd": request.reg_prov_cd,
        "regCityCd": request.reg_city_cd,
        "regDistCd": request.reg_dist_cd,
        "mccCd": request.mcc_cd,
        "csTelNo": request.cs_tel_no,
    }
    
    if request.mer_name:
        req_data["merName"] = request.mer_name
    
    if request.qrcode_list:
        req_data["qrcodeList"] = request.qrcode_list
    else:
        # 默认二维码费率
        req_data["qrcodeList"] = [
            {"rateType": "01", "rate": "0.72"},  # 微信
            {"rateType": "02", "rate": "0.72"},  # 支付宝
            {"rateType": "06", "rate": "0.72"},  # 银联小额
            {"rateType": "07", "rate": "0.72"},  # 银联大额
        ]
    
    result = call_tianque_api("/merchant/income", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.get("/merchant-query/{mno}")
async def merchant_query(
    mno: str,
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    入网结果查询
    
    查询商户入驻审核结果
    """
    if mock:
        result = generate_mock_response("merchant_incomeQuery", {"mno": mno})
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    req_data = {"mno": mno}
    result = call_tianque_api("/merchant/incomeQuery", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.post("/trade-create")
async def trade_create(
    request: TradeCreateRequest = Body(...),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    创建支付订单(主扫)
    
    生成收款二维码，消费者扫码支付
    """
    if mock:
        result = generate_mock_response("activePlusScan", request.dict())
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    config = load_tianque_config()
    
    # 生成订单号
    ord_no = request.ord_no or f"T{int(time.time()*1000)}"
    
    req_data = {
        "mno": request.mno or config["test_merchant_no"],
        "ordNo": ord_no,
        "amt": request.amt,
        "subject": request.subject,
        "trmIp": request.trm_ip,
        "timeExpire": request.time_expire,
        "ledgerAccountFlag": "01",  # 默认不分账
    }
    
    if request.pay_type:
        req_data["payType"] = request.pay_type
    
    result = call_tianque_api("/order/activePlusScan", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.get("/trade-query/{trade_no}")
async def trade_query(
    trade_no: str,
    mno: Optional[str] = Query(None, description="商户编号"),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    交易查询
    
    查询支付订单状态
    """
    if mock:
        result = generate_mock_response("tradeQuery", {"ordNo": trade_no})
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    req_data = {"ordNo": trade_no}
    if mno:
        req_data["mno"] = mno
    
    result = call_tianque_api("/query/tradeQuery", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.post("/refund")
async def refund(
    request: RefundRequest = Body(...),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    申请退款
    
    对已支付订单进行退款
    """
    if mock:
        result = generate_mock_response("refund", request.dict())
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    req_data = {
        "refundType": request.refund_type,
        "amt": request.amt,
    }
    
    if request.ord_no:
        req_data["ordNo"] = request.ord_no
    if request.uuid:
        req_data["uuid"] = request.uuid
    if request.mno:
        req_data["mno"] = request.mno
    
    result = call_tianque_api("/order/refund", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.post("/split-apply")
async def split_apply(
    request: SplitApplyRequest = Body(...),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    分账申请
    
    对已交易成功的订单进行分账
    """
    if mock:
        result = generate_mock_response("launchLedger", request.dict())
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    req_data = {
        "ordNo": request.ord_no,
        "ledgerAccountFlag": request.ledger_account_flag,
        "uuid": str(uuid.uuid4()).replace('-', ''),
    }
    
    if request.mno:
        req_data["mno"] = request.mno
    if request.ledger_rule:
        req_data["ledgerRule"] = request.ledger_rule
    if request.notify_address:
        req_data["notifyAddress"] = request.notify_address
    
    result = call_tianque_api("/query/ledger/launchLedger", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.get("/settle-query")
async def settle_query(
    mno: Optional[str] = Query(None, description="商户编号"),
    start_date: Optional[str] = Query(None, description="开始日期 YYYYMMDD"),
    end_date: Optional[str] = Query(None, description="结束日期 YYYYMMDD"),
    page_no: str = Query("1", description="页码"),
    page_size: str = Query("10", description="每页条数"),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    结算查询
    
    查询商户结算记录
    """
    if mock:
        result = generate_mock_response("settleQuery")
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
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
    
    result = call_tianque_api("/query/settleQuery", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.get("/reconcile")
async def reconcile(
    bill_date: str = Query(..., description="账单日期 YYYYMMDD(必填)"),
    bill_type: str = Query("01", description="账单类型: 01-码交易 02-结算 03-分账 04-转账"),
    mock: bool = Query(False, description="是否使用Mock数据")
):
    """
    对账文件获取
    
    下载指定日期的对账文件
    """
    if mock:
        result = generate_mock_response("downloadFile")
        return api_response(result.get("respData"), result.get("msg"), 0 if result.get("code") == "0000" else 1)
    
    req_data = {
        "billDate": bill_date,
        "billType": bill_type,
    }
    
    result = call_tianque_api("/reconcile/downloadFile", req_data)
    
    if result.get("code") == "0000":
        return api_response(result.get("respData"), result.get("msg"), 0)
    else:
        raise HTTPException(status_code=400, detail=result)


@router.get("/config")
async def get_payment_config():
    """
    获取支付配置信息
    
    返回当前配置的支付通道信息（不含密钥）
    """
    config = load_tianque_config()
    return api_response({
        "org_id": config["org_id"],
        "base_url": config["base_url"],
        "test_merchant_no": config["test_merchant_no"],
        "sign_algorithm": config["sign_algorithm"],
        "has_private_key": bool(config["private_key"]),
    })


@router.get("/channels")
async def list_payment_channels():
    """
    获取支持的支付通道
    
    返回天阙支持的支付渠道列表
    """
    channels = [
        {"code": "WECHAT", "name": "微信支付", "icon": "wechat"},
        {"code": "ALIPAY", "name": "支付宝", "icon": "alipay"},
        {"code": "UNIONPAY", "name": "银联云闪付", "icon": "unionpay"},
        {"code": "YZF", "name": "翼支付", "icon": "yzf"},
        {"code": "DCEP", "name": "数字人民币", "icon": "dcep"},
    ]
    return api_response({"items": channels})


@router.get("/fee-rates")
async def get_fee_rates():
    """
    获取费率信息
    
    返回标准费率参考
    """
    rates = [
        {"type": "01", "name": "微信二维码", "rate": "0.72%", "min": None, "max": None},
        {"type": "02", "name": "支付宝二维码", "rate": "0.72%", "min": None, "max": None},
        {"type": "06", "name": "银联小额(≤1000)", "rate": "0.72%", "min": None, "max": None},
        {"type": "07", "name": "银联大额(>1000)", "rate": "0.72%", "min": None, "max": None},
        {"type": "21", "name": "贷记卡刷卡", "rate": "0.92%", "min": None, "max": None},
        {"type": "22", "name": "借记卡刷卡", "rate": "0.95%", "min": "0", "max": "85"},
    ]
    return api_response({"items": rates})
