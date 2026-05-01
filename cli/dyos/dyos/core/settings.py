"""
店赢OS CLI - 系统设置命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="settings")
def settings_group():
    """系统设置命令"""
    pass


@settings_group.command("roles")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_roles(use_json):
    """获取角色列表"""
    output = Output(use_json)
    result = api_client.get("/admin/settings/roles")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "角色列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@settings_group.command("operation-logs")
@click.option("--operator", help="操作人")
@click.option("--type", help="操作类型")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_operation_logs(operator, type, page, size, use_json):
    """获取操作日志"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if operator:
        params["operator"] = operator
    if type:
        params["type"] = type
    
    result = api_client.get("/admin/settings/operation-logs", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "操作日志")
    else:
        output.print_error(result.get("message", "请求失败"))


@settings_group.command("pricing")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_pricing(use_json):
    """获取定价配置"""
    output = Output(use_json)
    result = api_client.get("/admin/settings/pricing")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "定价配置")
    else:
        output.print_error(result.get("message", "请求失败"))


@settings_group.command("notifications")
@click.option("--status", help="状态: read, unread")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_notifications(status, use_json):
    """获取消息通知"""
    output = Output(use_json)
    result = api_client.get("/admin/settings/notifications", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "消息通知")
    else:
        output.print_error(result.get("message", "请求失败"))
