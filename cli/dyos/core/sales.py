"""
店赢OS CLI - 业务员命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="sales")
def sales_group():
    """业务员管理命令"""
    pass


@sales_group.command("list")
@click.option("--status", help="状态: active, inactive")
@click.option("--region", help="区域")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_sales(status, region, page, size, use_json):
    """获取业务员列表"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if status:
        params["status"] = status
    if region:
        params["region"] = region
    
    result = api_client.get("/admin/sales/", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "业务员列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@sales_group.command("performance")
@click.option("--month", help="月份")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_performance(month, use_json):
    """获取业务员业绩"""
    output = Output(use_json)
    result = api_client.get("/admin/sales/performance", {"month": month} if month else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "业务员业绩")
    else:
        output.print_error(result.get("message", "请求失败"))


@sales_group.command("visits")
@click.option("--salesman", help="业务员名称")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_visits(salesman, use_json):
    """获取跟访记录"""
    output = Output(use_json)
    params = {}
    if salesman:
        params["salesman"] = salesman
    
    result = api_client.get("/admin/sales/visits", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "跟访记录")
    else:
        output.print_error(result.get("message", "请求失败"))
