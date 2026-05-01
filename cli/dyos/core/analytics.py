"""
店赢OS CLI - 数据洞察命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="analytics")
def analytics_group():
    """数据洞察命令"""
    pass


@analytics_group.command("overview")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_overview(use_json):
    """获取平台总览"""
    output = Output(use_json)
    result = api_client.get("/admin/analytics/overview")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "平台总览")
    else:
        output.print_error(result.get("message", "请求失败"))


@analytics_group.command("gmv-trend")
@click.option("--months", default=12, help="月份数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_gmv_trend(months, use_json):
    """获取GMV趋势"""
    output = Output(use_json)
    result = api_client.get("/admin/analytics/gmv-trend", {"months": months})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"GMV趋势 (近{months}个月)")
    else:
        output.print_error(result.get("message", "请求失败"))


@analytics_group.command("churn-warning")
@click.option("--threshold", default=50, help="流失概率阈值")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_churn_warning(threshold, use_json):
    """获取流失预警"""
    output = Output(use_json)
    result = api_client.get("/admin/analytics/churn-warning", {"threshold": threshold})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"流失预警 (概率≥{threshold}%)")
    else:
        output.print_error(result.get("message", "请求失败"))


@analytics_group.command("ai-stats")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_ai_stats(use_json):
    """获取AI使用统计"""
    output = Output(use_json)
    result = api_client.get("/admin/analytics/ai-stats")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "AI使用统计")
    else:
        output.print_error(result.get("message", "请求失败"))


@analytics_group.command("industry-report")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_industry_report(use_json):
    """获取行业报告"""
    output = Output(use_json)
    result = api_client.get("/admin/analytics/industry-report")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "行业报告")
    else:
        output.print_error(result.get("message", "请求失败"))
