#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
店赢OS天阙支付CLI工具 - CLI主文件
基于Click框架的命令行接口

支持真实API联调和Mock模式
"""
import os
import sys
import json
import click
from typing import Optional

from .config import get_config, init_config, switch_env
from .crypto import RSACrypto, test_sign
from .client import TianqueClient, get_client, create_client
from .core import (
    MerchantAPI,
    PaymentAPI,
    SplitAPI,
    SettleAPI,
    ReconcileAPI,
)
from .utils import OutputFormatter, format_response, REPLSkin


# ============================================
# 全局选项
# ============================================
def global_options(f):
    """全局选项装饰器"""
    f = click.option('--json', 'json_output', is_flag=True, help='JSON格式输出')(f)
    f = click.option('--env', type=click.Choice(['test', 'prod']), help='切换环境')(f)
    f = click.option('--org-id', help='机构号')(f)
    f = click.option('--timeout', type=int, help='请求超时时间(秒)')(f)
    f = click.option('--mock', is_flag=True, help='使用Mock数据进行测试')(f)
    return f


# ============================================
# 获取带Mock支持的客户端
# ============================================
def get_api_client(use_mock: bool = False, **kwargs) -> TianqueClient:
    """获取API客户端，支持Mock模式"""
    config = get_config()
    
    # 如果环境变量设置了MOCK模式，也启用mock
    if os.environ.get('DYOS_PAYMENT_MOCK') == '1':
        use_mock = True
    
    return TianqueClient(
        org_id=kwargs.get('org_id') or config.org_id,
        base_url=kwargs.get('base_url') or config.base_url,
        timeout=kwargs.get('timeout') or config.timeout,
        use_mock=use_mock
    )


# ============================================
# 工具命令组
# ============================================
@click.group()
@click.version_option(version="1.0.0", prog_name="dyos-payment")
def cli():
    """
    店赢OS天阙支付CLI工具
    
    AI-First Payment CLI for Tianque (SuixingPay) Open Platform
    
    文档: https://github.com/liuhuanxi-oss/dianying-os
    
    示例:
        # 使用Mock数据测试
        dyos-payment --mock merchant query --mno YOUR_MERCHANT_NO
        
        # 使用真实API联调
        dyos-payment merchant query --mno YOUR_MERCHANT_NO
        
        # 切换到生产环境
        dyos-payment env-switch prod
    """
    pass


# ============================================
# 商户管理命令组
# ============================================
@cli.group('merchant')
def merchant_group():
    """商户管理命令"""
    pass


@merchant_group.command('apply')
@click.option('--name', help='签购单名称')
@click.option('--short-name', 'mec_dis_nm', required=True, help='商户简称(必填)')
@click.option('--mobile', 'mbl_no', required=True, help='商户联系手机号(必填)')
@click.option('--industry', 'operational_type', default='01', help='经营类型: 01-线下 02-线上')
@click.option('--license-type', 'have_license_no', default='01', help='资质类型: 01-自然人 02-个体户 03-企业')
@click.option('--merchant-type', 'mec_type_flag', default='00', help='商户类型: 00-普通单店 01-连锁总店 02-连锁分店')
@click.option('--identity-name', required=True, help='法人/负责人姓名(必填)')
@click.option('--identity-type', 'identity_typ', default='00', help='证件类型: 00-身份证')
@click.option('--identity-no', required=True, help='证件号(必填)')
@click.option('--account-name', 'act_nm', required=True, help='结算账户名(必填)')
@click.option('--account-type', 'act_typ', default='01', help='账户类型: 00-对公 01-对私')
@click.option('--account-no', 'act_no', required=True, help='结算卡号(必填)')
@click.option('--address', 'cpr_reg_addr', required=True, help='实际经营地址(必填)')
@click.option('--prov-cd', 'reg_prov_cd', default='110000000000', help='省编码')
@click.option('--city-cd', 'reg_city_cd', default='110100000000', help='市编码')
@click.option('--dist-cd', 'reg_dist_cd', default='110105000000', help='区编码')
@click.option('--mcc-cd', default='5311', help='MCC码')
@click.option('--cs-tel-no', required=True, help='客服电话(必填)')
@click.option('--mer-no', 'mno', help='商户编号')
@global_options
def merchant_apply(**kwargs):
    """商户入驻申请"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    # 构建参数
    req_data = {k: v for k, v in kwargs.items() if v is not None}
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = MerchantAPI(client=client)
        result = api.apply(**req_data)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"商户入驻申请结果")
            if code == '0000':
                click.echo(click.style(f"✓ 商户入驻成功", fg='green'))
                resp_data = result.get('respData', {})
                if resp_data:
                    click.echo(f"商户号: {resp_data.get('mno', 'N/A')}")
            else:
                click.echo(click.style(f"✗ 商户入驻失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@merchant_group.command('query')
@click.option('--mno', help='商户编号')
@click.option('--req-id', 'req_id', help='入驻请求ID')
@global_options
def merchant_query(**kwargs):
    """商户入驻结果查询"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = MerchantAPI(client=client)
        result = api.query(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"商户查询结果")
            click.echo(formatter.format(result))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@merchant_group.command('modify')
@click.option('--id', 'mno', required=True, help='商户编号(必填)')
@click.option('--store-pic', help='门头照片地址')
@click.option('--inside-pic', help='内景照片地址')
@click.option('--identity-front', help='身份证正面照片地址')
@click.option('--identity-back', help='身份证反面照片地址')
@global_options
def merchant_modify(**kwargs):
    """商户入驻修改"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = MerchantAPI(client=client)
        mno = kwargs.pop('mno')
        result = api.modify(mno, **kwargs)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if code == '0000':
                click.echo(click.style(f"✓ 商户信息修改成功", fg='green'))
            else:
                click.echo(click.style(f"✗ 修改失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@merchant_group.command('upload-image')
@click.option('--file', 'file_path', required=True, help='图片文件路径(必填)')
@click.option('--type', 'image_type', default='store', help='图片类型: store/inside/license等')
@global_options
def merchant_upload_image(**kwargs):
    """图片上传"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = MerchantAPI(client=client)
        result = api.upload_image(**kwargs)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if code == '0000':
                click.echo(click.style(f"✓ 图片上传成功", fg='green'))
                resp_data = result.get('respData', {})
                if resp_data:
                    click.echo(f"图片ID: {resp_data.get('imageId', 'N/A')}")
            else:
                click.echo(click.style(f"✗ 上传失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


# ============================================
# 支付交易命令组
# ============================================
@cli.group('trade')
def trade_group():
    """支付交易命令"""
    pass


@trade_group.command('create')
@click.option('--amount', 'amt', required=True, help='订单金额(元)(必填)')
@click.option('--subject', default='订单支付', help='订单标题')
@click.option('--pay-type', 'pay_type', help='支付渠道: WECHAT/ALIPAY/UNIONPAY/YZF/DCEP')
@click.option('--mer-no', 'mno', help='商户编号')
@click.option('--trade-no', 'ord_no', help='商户订单号')
@click.option('--trm-ip', default='127.0.0.1', help='交易终端IP')
@click.option('--time-expire', default='5', help='订单失效时间(分钟)')
@global_options
def trade_create(**kwargs):
    """创建支付订单(主扫)"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = PaymentAPI(client=client)
        result = api.create_scan_pay(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"创建支付订单结果")
            if code == '0000':
                click.echo(click.style(f"✓ 支付订单创建成功", fg='green'))
                resp_data = result.get('respData', {})
                if resp_data:
                    click.echo(f"订单号: {resp_data.get('ordNo', 'N/A')}")
                    click.echo(f"收款URL: {resp_data.get('payUrl', 'N/A')}")
            else:
                click.echo(click.style(f"✗ 创建失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@trade_group.command('scan')
@click.option('--auth-code', 'auth_code', required=True, help='授权码/付款码(必填)')
@click.option('--amount', 'amt', required=True, help='订单金额(元)(必填)')
@click.option('--subject', default='订单支付', help='订单标题')
@click.option('--pay-type', 'pay_type', help='支付渠道: WECHAT/ALIPAY/UNIONPAY')
@click.option('--mer-no', 'mno', help='商户编号')
@click.option('--trade-no', 'ord_no', help='商户订单号')
@click.option('--trm-ip', default='127.0.0.1', help='交易终端IP')
@global_options
def trade_scan(**kwargs):
    """被扫支付(B扫C)"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = PaymentAPI(client=client)
        result = api.reverse_scan(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"被扫支付结果")
            if code == '0000':
                click.echo(click.style(f"✓ 支付成功", fg='green'))
                resp_data = result.get('respData', {})
                if resp_data:
                    click.echo(f"订单号: {resp_data.get('ordNo', 'N/A')}")
            else:
                click.echo(click.style(f"✗ 支付失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@trade_group.command('query')
@click.option('--trade-no', 'ord_no', help='商户订单号')
@click.option('--uuid', help='天阙订单号')
@click.option('--mer-no', 'mno', help='商户编号')
@global_options
def trade_query(**kwargs):
    """支付结果查询"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = PaymentAPI(client=client)
        result = api.query(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"交易查询结果")
            click.echo(formatter.format(result))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@trade_group.command('refund')
@click.option('--trade-no', 'ord_no', help='商户订单号')
@click.option('--uuid', help='天阙订单号')
@click.option('--amount', 'amt', required=True, help='退款金额(元)(必填)')
@click.option('--mer-no', 'mno', help='商户编号')
@click.option('--refund-type', 'refund_type', default='01', help='退款类型: 01-部分退款 02-全额退款')
@global_options
def trade_refund(**kwargs):
    """申请退款"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = PaymentAPI(client=client)
        req_data = {k: v for k, v in kwargs.items() if v is not None}
        result = api.refund(**req_data)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"退款申请结果")
            if code == '0000':
                click.echo(click.style(f"✓ 退款申请成功", fg='green'))
            else:
                click.echo(click.style(f"✗ 退款失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@trade_group.command('close')
@click.option('--trade-no', 'ord_no', help='商户订单号')
@click.option('--uuid', help='天阙订单号')
@click.option('--mer-no', 'mno', help='商户编号')
@global_options
def trade_close(**kwargs):
    """关闭订单"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = PaymentAPI(client=client)
        result = api.close(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if code == '0000':
                click.echo(click.style(f"✓ 订单关闭成功", fg='green'))
            else:
                click.echo(click.style(f"✗ 关闭失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


# ============================================
# 分账命令组
# ============================================
@cli.group('split')
def split_group():
    """分账命令"""
    pass


@split_group.command('apply')
@click.option('--trade-no', 'ord_no', required=True, help='原交易订单号(必填)')
@click.option('--ratio', help='分账比例，逗号分隔如 0.7,0.3')
@click.option('--mer-no', 'mno', help='分账出款商户编号')
@click.option('--merchants', 'ledger_rule', help='分账商户列表JSON')
@click.option('--type', 'ledger_account_flag', default='01', help='分账类型: 00-取消分账 01-分账')
@global_options
def split_apply(**kwargs):
    """分账申请"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = SplitAPI(client=client)
        ord_no = kwargs.pop('ord_no')
        ratio = kwargs.pop('ratio', None)
        ledger_rule_str = kwargs.pop('ledger_rule', None)
        
        # 处理分账规则
        ledger_rule = None
        if ledger_rule_str:
            try:
                ledger_rule = json.loads(ledger_rule_str)
            except:
                pass
        elif ratio:
            ratios = [float(r.strip()) for r in ratio.split(',')]
            total = sum(ratios)
            if abs(total - 1.0) > 0.01:
                if json_output:
                    click.echo(formatter.format_json({"code": "PARAM_ERROR", "msg": f"分账比例总和必须为1，当前总和: {total}"}))
                else:
                    click.echo(click.style(f"✗ 错误: 分账比例总和必须为1，当前总和: {total}", fg='red'))
                return
            ledger_rule = [{"allotValue": str(r), "mno": kwargs.get('mno')} for r in ratios]
        
        result = api.apply(ord_no=ord_no, ledger_rule=ledger_rule, **kwargs)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"分账申请结果")
            if code == '0000':
                click.echo(click.style(f"✓ 分账申请成功", fg='green'))
            else:
                click.echo(click.style(f"✗ 分账失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


@split_group.command('query')
@click.option('--split-no', 'split_no', help='分账订单号')
@click.option('--mer-no', 'mno', help='商户编号')
@global_options
def split_query(**kwargs):
    """分账结果查询"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = SplitAPI(client=client)
        split_no = kwargs.pop('split_no', None)
        result = api.query_split(split_no=split_no, **{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"分账查询结果")
            click.echo(formatter.format(result))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


# ============================================
# 结算命令组
# ============================================
@cli.group('settle')
def settle_group():
    """结算命令"""
    pass


@settle_group.command('query')
@click.option('--merchant-id', 'mno', help='商户编号')
@click.option('--date', help='日期 YYYY-MM 格式')
@click.option('--start-date', help='开始日期 YYYYMMDD')
@click.option('--end-date', help='结束日期 YYYYMMDD')
@global_options
def settle_query(**kwargs):
    """结算查询"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = SettleAPI(client=client)
        result = api.query_by_merchant(**{k: v for k, v in kwargs.items() if v is not None})
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"结算查询结果")
            click.echo(formatter.format(result))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


# ============================================
# 对账命令组
# ============================================
@cli.group('reconcile')
def reconcile_group():
    """对账命令"""
    pass


@reconcile_group.command('download')
@click.option('--date', required=True, help='账单日期 YYYY-MM-DD 或 YYYYMMDD(必填)')
@click.option('--type', 'bill_type', default='01', help='账单类型: 01-码交易 02-结算 03-分账 04-转账')
@global_options
def reconcile_download(**kwargs):
    """下载对账文件"""
    json_output = kwargs.pop('json_output', False)
    use_mock = kwargs.pop('mock', False)
    formatter = OutputFormatter(json_output=json_output)
    
    try:
        client = get_api_client(use_mock=use_mock)
        api = ReconcileAPI(client=client)
        date = kwargs.pop('date').replace('-', '').replace('/', '')
        result = api.download(bill_date=date, **kwargs)
        
        if json_output:
            click.echo(formatter.format_json(result))
        else:
            code = result.get('code', result.get('bizCode', ''))
            msg = result.get('msg', result.get('bizMsg', ''))
            if result.get('_mock'):
                click.echo(click.style(f"[MOCK] ", fg='yellow') + f"对账文件获取结果")
            if code == '0000':
                click.echo(click.style(f"✓ 对账文件获取成功", fg='green'))
                resp_data = result.get('respData', {})
                if resp_data:
                    click.echo(f"文件URL: {resp_data.get('fileUrl', 'N/A')}")
            else:
                click.echo(click.style(f"✗ 获取失败: {code} - {msg}", fg='red'))
    except Exception as e:
        if json_output:
            click.echo(formatter.format_json({"code": "ERROR", "msg": str(e)}))
        else:
            click.echo(click.style(f"✗ 错误: {e}", fg='red'))


# ============================================
# 工具命令
# ============================================
@cli.command('sign-test')
@global_options
def sign_test(**kwargs):
    """测试签名是否正确"""
    use_mock = kwargs.pop('mock', False)
    config = get_config()
    crypto = RSACrypto(
        private_key_pem=config.private_key,
        algorithm=config.sign_algorithm
    )
    
    test_data = "orgId=YOUR_ORG_ID&reqId=test123&timestamp=1234567890"
    
    try:
        signature = crypto.sign(test_data)
        click.echo(click.style("✓ 签名测试成功", fg='green'))
        click.echo(f"\n签名数据: {test_data}")
        click.echo(f"\n签名结果:\n{signature}")
        
        # 如果有公钥，尝试验签
        if config.public_key:
            try:
                is_valid = crypto.verify(test_data, signature, config.public_key)
                if is_valid:
                    click.echo(click.style("\n✓ 自验签成功", fg='green'))
                else:
                    click.echo(click.style("\n✗ 自验签失败", fg='red'))
            except Exception as e:
                click.echo(click.style(f"\n! 自验签跳过: {e}", fg='yellow'))
    except Exception as e:
        click.echo(click.style(f"✗ 签名测试失败: {e}", fg='red'))
        click.echo("\n请检查配置:")
        click.echo(f"  1. org_id: {config.org_id}")
        click.echo(f"  2. private_key: {'已配置' if config.private_key else '未配置'}")
        click.echo(f"  3. sign_algorithm: {config.sign_algorithm}")


@cli.command('env-switch')
@click.argument('env', type=click.Choice(['test', 'prod']))
def env_switch(env):
    """切换环境"""
    switch_env(env)


@cli.command('config')
@click.option('--show', 'show_all', is_flag=True, help='显示完整配置')
@click.option('--json', 'json_output', is_flag=True, help='JSON格式输出')
def config_show(show_all, json_output):
    """显示当前配置"""
    config = get_config()
    
    if json_output:
        output = {
            "org_id": config.org_id,
            "env": config.env,
            "base_url": config.base_url,
            "test_merchant_no": config.test_merchant_no,
            "sign_algorithm": config.sign_algorithm,
            "timeout": config.timeout,
            "retry_times": config.retry_times,
        }
        if show_all:
            output["private_key"] = config.private_key
            output["public_key"] = config.public_key
            output["suixingpay_public_key"] = config.suixingpay_public_key
        click.echo(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        click.echo(click.style("当前配置:", fg='cyan', bold=True))
        click.echo(f"  org_id: {config.org_id}")
        click.echo(f"  env: {config.env}")
        click.echo(f"  base_url: {config.base_url}")
        click.echo(f"  test_merchant_no: {config.test_merchant_no}")
        click.echo(f"  sign_algorithm: {config.sign_algorithm}")
        click.echo(f"  timeout: {config.timeout}s")
        click.echo(f"  retry_times: {config.retry_times}")
        
        if show_all:
            click.echo(click.style("\n密钥信息:", fg='cyan', bold=True))
            click.echo(f"  private_key: {'已配置' if config.private_key else '未配置'}")
            click.echo(f"  public_key: {'已配置' if config.public_key else '未配置'}")
            click.echo(f"  suixingpay_public_key: {'已配置' if config.suixingpay_public_key else '未配置'}")


# ============================================
# 主入口
# ============================================
def main():
    """主入口函数"""
    cli()


if __name__ == '__main__':
    main()
