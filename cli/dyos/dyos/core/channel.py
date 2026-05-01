"""
店赢OS CLI - 渠道增长命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="channel")
def channel_group():
    """渠道增长命令"""
    pass


@channel_group.command("analysis")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_analysis(use_json):
    """获取渠道分析"""
    output = Output(use_json)
    result = api_client.get("/admin/channel/analysis")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "渠道分析")
    else:
        output.print_error(result.get("message", "请求失败"))


@channel_group.command("invite-fission")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_invite_fission(use_json):
    """获取邀请裂变数据"""
    output = Output(use_json)
    result = api_client.get("/admin/channel/invite-fission")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "邀请裂变")
    else:
        output.print_error(result.get("message", "请求失败"))


@channel_group.command("trial")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def get_trial(use_json):
    """获取试用管理统计"""
    output = Output(use_json)
    result = api_client.get("/admin/channel/trial")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "试用管理")
    else:
        output.print_error(result.get("message", "请求失败"))


@channel_group.command("partners")
@click.option("--status", help="状态")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_partners(status, use_json):
    """获取合作伙伴"""
    output = Output(use_json)
    result = api_client.get("/admin/channel/partners", {"status": status} if status else {})
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "合作伙伴")
    else:
        output.print_error(result.get("message", "请求失败"))
