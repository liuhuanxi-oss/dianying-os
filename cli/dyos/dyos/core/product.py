"""
店赢OS CLI - 产品迭代命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="product")
def product_group():
    """产品迭代命令"""
    pass


@product_group.command("feature-flags")
@click.option("--status", help="状态: enabled, disabled, beta")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_feature_flags(status, use_json):
    """获取功能开关"""
    output = Output(use_json)
    result = api_client.get("/admin/product/feature-flags", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "功能开关")
    else:
        output.print_error(result.get("message", "请求失败"))


@product_group.command("ab-test")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_ab_tests(use_json):
    """获取AB测试列表"""
    output = Output(use_json)
    result = api_client.get("/admin/product/ab-test")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "AB测试")
    else:
        output.print_error(result.get("message", "请求失败"))


@product_group.command("requirements")
@click.option("--status", help="状态")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_requirements(status, use_json):
    """获取需求池"""
    output = Output(use_json)
    result = api_client.get("/admin/product/requirements", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "需求池")
    else:
        output.print_error(result.get("message", "请求失败"))


@product_group.command("versions")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_versions(use_json):
    """获取版本列表"""
    output = Output(use_json)
    result = api_client.get("/admin/product/versions")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "版本列表")
    else:
        output.print_error(result.get("message", "请求失败"))
