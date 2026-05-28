"""
店赢OS CLI - 客服支持命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="support")
def support_group():
    """客服支持命令"""
    pass


@support_group.command("tickets")
@click.option("--status", help="状态: open, pending, resolved")
@click.option("--priority", help="优先级: high, medium, low")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_tickets(status, priority, page, size, use_json):
    """获取工单列表"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if status:
        params["status"] = status
    if priority:
        params["priority"] = priority
    
    result = api_client.get("/admin/support/tickets", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "工单列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@support_group.command("faq")
@click.option("--category", help="分类")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_faq(category, use_json):
    """获取FAQ列表"""
    output = Output(use_json)
    result = api_client.get("/admin/support/faq", {"category": category} if category else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "FAQ列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@support_group.command("satisfaction")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_satisfaction(use_json):
    """获取满意度调研"""
    output = Output(use_json)
    result = api_client.get("/admin/support/satisfaction")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "满意度调研")
    else:
        output.print_error(result.get("message", "请求失败"))
