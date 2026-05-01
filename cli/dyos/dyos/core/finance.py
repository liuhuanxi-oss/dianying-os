"""
店赢OS CLI - 财务命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="finance")
def finance_group():
    """财务管理命令"""
    pass


@finance_group.command("revenue")
@click.option("--months", default=12, help="月份数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_revenue(months, use_json):
    """获取收入趋势"""
    output = Output(use_json)
    result = api_client.get("/admin/finance/revenue", {"months": months})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"收入趋势 (近{months}个月)")
    else:
        output.print_error(result.get("message", "请求失败"))


@finance_group.command("transactions")
@click.option("--status", help="状态")
@click.option("--type", help="类型")
@click.option("--merchant", help="商家名称")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_transactions(status, type, merchant, page, size, use_json):
    """获取交易流水"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if status:
        params["status"] = status
    if type:
        params["type"] = type
    if merchant:
        params["merchant"] = merchant
    
    result = api_client.get("/admin/payment/transactions", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "交易流水")
    else:
        output.print_error(result.get("message", "请求失败"))


@finance_group.command("refunds")
@click.option("--status", help="状态")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_refunds(status, use_json):
    """获取退款列表"""
    output = Output(use_json)
    result = api_client.get("/admin/finance/refund", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "退款列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@finance_group.command("invoices")
@click.option("--status", help="状态")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_invoices(status, use_json):
    """获取发票列表"""
    output = Output(use_json)
    result = api_client.get("/admin/finance/invoice", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "发票列表")
    else:
        output.print_error(result.get("message", "请求失败"))
