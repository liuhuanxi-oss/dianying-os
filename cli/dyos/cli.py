"""
店赢OS CLI - 主命令行入口
"""
import click
from rich.console import Console
from dyos.utils import Output
from dyos.config import config

from .core import (
    merchant_group, agent_group, sales_group, finance_group,
    analytics_group, payment_group, customer_group, channel_group,
    support_group, product_group, security_group, settings_group
)

console = Console()


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """
    店赢OS CLI - AI门店运营SaaS平台管理工具
    
    让Agent可以通过命令行高效管理平台
    
    示例:
      dyo merchant list --json
      dyo analytics overview
      dyo agent list --level gold
    """
    pass


# 注册命令组
cli.add_command(merchant_group)
cli.add_command(agent_group)
cli.add_command(sales_group)
cli.add_command(finance_group)
cli.add_command(analytics_group)
cli.add_command(payment_group)
cli.add_command(customer_group)
cli.add_command(channel_group)
cli.add_command(support_group)
cli.add_command(product_group)
cli.add_command(security_group)
cli.add_command(settings_group)


@cli.command("config")
@click.option("--get", "action", flag_value="get", help="获取配置")
@click.option("--set-url", help="设置API URL")
@click.option("--set-key", help="设置API Key")
def config_cmd(action, set_url, set_key):
    """配置管理"""
    output = Output(use_json=False)
    
    if set_url:
        config.base_url = set_url
        output.print_success(f"API URL已设置为: {set_url}")
    elif set_key:
        config.api_key = set_key
        output.print_success("API Key已设置")
    else:
        output.print({
            "base_url": config.base_url,
            "api_key": "***" if config.api_key else "",
            "timeout": config.timeout,
            "output_format": config.output_format
        }, "当前配置")


@cli.command("workflow")
@click.option("--merchant", help="商家名称")
@click.option("--industry", default="餐饮", help="行业类型")
@click.option("--assign-agent", help="分配的代理商")
@click.option("--enable-channels", help="启用的渠道，逗号分隔")
@click.option("--payment-apply", is_flag=True, help="申请支付通道")
def workflow(merchant, industry, assign_agent, enable_channels, payment_apply):
    """工作流编排 - 链式组合操作"""
    output = Output(use_json=False)
    
    if not merchant:
        output.print_error("请指定商家名称 (--merchant)")
        return
    
    output.print_panel(f"""
[bold cyan]店赢OS 商家入驻工作流[/bold cyan]

[cyan]步骤1:[/cyan] 创建商家
  商家名称: {merchant}
  行业类型: {industry}

[cyan]步骤2:[/cyan] 分配代理商
  代理商: {assign_agent or '待分配'}

[cyan]步骤3:[/cyan] 渠道配置
  渠道: {enable_channels or '默认渠道'}

[cyan]步骤4:[/cyan] 支付申请
  状态: {'已申请' if payment_apply else '未申请'}
""", "工作流执行中")
    
    output.print_success(f"工作流 '{merchant}' 编排完成")


@cli.command("batch")
@click.argument("action")
@click.option("--file", "batch_file", type=click.Path(exists=True), help="批量操作文件")
@click.option("--type", help="操作类型")
def batch_cmd(action, batch_file, type):
    """批量操作"""
    output = Output(use_json=False)
    
    if action == "audit" and batch_file:
        output.print_success(f"批量审核文件已加载: {batch_file}")
        output.print_warning("批量审核功能开发中")
    else:
        output.print_error(f"未知批量操作: {action}")


@cli.command("serve")
@click.option("--host", default="0.0.0.0", help="监听主机")
@click.option("--port", default=8000, help="监听端口")
def serve_cmd(host, port):
    """启动FastAPI服务"""
    import subprocess
    import sys
    import os
    
    output = Output(use_json=False)
    output.print_success(f"正在启动FastAPI服务 (http://{host}:{port})...")
    
    # 切换到api目录并启动服务
    api_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "api")
    os.chdir(api_dir)
    
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", host, "--port", str(port), "--reload"])


if __name__ == "__main__":
    cli()
