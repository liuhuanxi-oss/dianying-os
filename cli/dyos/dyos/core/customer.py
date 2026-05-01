"""
店赢OS CLI - 客户成功命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="customer")
def customer_group():
    """客户成功命令"""
    pass


@customer_group.command("onboarding")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_onboarding(page, size, use_json):
    """获取Onboarding列表"""
    output = Output(use_json)
    result = api_client.get("/admin/customer/onboarding", {"page": page, "size": size})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "Onboarding进度")
    else:
        output.print_error(result.get("message", "请求失败"))


@customer_group.command("health-score")
@click.option("--threshold", default=60, help="健康度阈值")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_health_scores(threshold, use_json):
    """获取健康度列表"""
    output = Output(use_json)
    result = api_client.get("/admin/customer/health-score", {"threshold": threshold})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"健康度 (≤{threshold})")
    else:
        output.print_error(result.get("message", "请求失败"))


@customer_group.command("renewal")
@click.option("--days", default=30, help="剩余天数阈值")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_renewals(days, use_json):
    """获取续费列表"""
    output = Output(use_json)
    result = api_client.get("/admin/customer/renewal", {"days_threshold": days})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"续费管理 (≤{days}天)")
    else:
        output.print_error(result.get("message", "请求失败"))


@customer_group.command("wake-up")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_wake_up(use_json):
    """获取沉默唤醒任务"""
    output = Output(use_json)
    result = api_client.get("/admin/customer/wake-up")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "沉默唤醒任务")
    else:
        output.print_error(result.get("message", "请求失败"))
