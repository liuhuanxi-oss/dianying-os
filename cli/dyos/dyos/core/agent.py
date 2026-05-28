"""
店赢OS CLI - 代理商命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="agent")
def agent_group():
    """代理商管理命令"""
    pass


@agent_group.command("list")
@click.option("--level", help="代理级别: silver, gold, diamond")
@click.option("--status", help="状态: active, inactive")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_agents(level, status, page, size, use_json):
    """获取代理商列表"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if level:
        params["level"] = level
    if status:
        params["status"] = status
    
    result = api_client.get("/admin/agents/", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "代理商列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@agent_group.command("create")
@click.option("--name", required=True, help="代理商名称")
@click.option("--level", default="silver", help="代理级别")
@click.option("--region", help="负责区域")
@click.option("--contact", help="联系方式")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def create_agent(name, level, region, contact, use_json):
    """创建代理商"""
    output = Output(use_json)
    data = {
        "name": name,
        "level": level,
        "region": region or "",
        "contact": contact or ""
    }
    
    result = api_client.post("/admin/agents/", data)
    
    if result.get("code") == 0:
        output.print_success(f"代理商 '{name}' 创建成功")
    else:
        output.print_error(result.get("message", "创建失败"))


@agent_group.command("commission")
@click.option("--id", "agent_id", type=int, help="代理商ID")
@click.option("--month", help="月份，如2024-12")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_commission(agent_id, month, use_json):
    """获取佣金分润"""
    output = Output(use_json)
    
    if agent_id:
        result = api_client.get(f"/admin/agents/{agent_id}/commission", {"month": month})
    else:
        result = api_client.get("/admin/agents/dashboard")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "佣金分润")
    else:
        output.print_error(result.get("message", "请求失败"))


@agent_group.command("dashboard")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def agent_dashboard(use_json):
    """获取代理商看板"""
    output = Output(use_json)
    result = api_client.get("/admin/agents/dashboard")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "代理商看板")
    else:
        output.print_error(result.get("message", "请求失败"))
