"""
店赢OS CLI - 安全合规命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="security")
def security_group():
    """安全合规命令"""
    pass


@security_group.command("login-logs")
@click.option("--status", help="状态: success, warning, failed")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_login_logs(status, page, size, use_json):
    """获取登录日志"""
    output = Output(use_json)
    result = api_client.get("/admin/security/login-security", {"status": status, "page": page, "size": size} if status else {"page": page, "size": size})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "登录日志")
    else:
        output.print_error(result.get("message", "请求失败"))


@security_group.command("data-masking")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_data_masking(use_json):
    """获取数据脱敏规则"""
    output = Output(use_json)
    result = api_client.get("/admin/security/data-masking")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "数据脱敏规则")
    else:
        output.print_error(result.get("message", "请求失败"))


@security_group.command("compliance")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_compliance(use_json):
    """获取合规审计记录"""
    output = Output(use_json)
    result = api_client.get("/admin/security/compliance")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "合规审计")
    else:
        output.print_error(result.get("message", "请求失败"))
