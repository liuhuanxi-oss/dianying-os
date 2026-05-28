"""
店赢OS CLI - 支付交易命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="payment")
def payment_group():
    """支付交易命令"""
    pass


@payment_group.command("channels")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_channels(use_json):
    """获取支付通道"""
    output = Output(use_json)
    result = api_client.get("/admin/payment/channels")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "支付通道")
    else:
        output.print_error(result.get("message", "请求失败"))


@payment_group.command("fee-config")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_fee_config(use_json):
    """获取费率配置"""
    output = Output(use_json)
    result = api_client.get("/admin/payment/fee-config")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "费率配置")
    else:
        output.print_error(result.get("message", "请求失败"))


@payment_group.command("fee-update")
@click.option("--config", "config_file", type=click.Path(exists=True), help="费率配置文件")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def update_fee_config(config_file, use_json):
    """更新费率配置"""
    output = Output(use_json)
    output.print_warning("费率配置更新功能开发中")
