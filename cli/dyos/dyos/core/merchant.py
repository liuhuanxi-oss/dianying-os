"""
店赢OS CLI - 商家管理命令
"""
import click
from dyos.utils import api_client, Output


@click.group(name="merchant")
def merchant_group():
    """商家管理命令"""
    pass


@merchant_group.command("list")
@click.option("--status", help="商家状态: active, inactive, expiring")
@click.option("--industry", help="行业类型")
@click.option("--version", help="版本: 免费版, 专业版, 旗舰版")
@click.option("--page", default=1, help="页码")
@click.option("--size", default=20, help="每页数量")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def list_merchants(status, industry, version, page, size, use_json):
    """获取商家列表"""
    output = Output(use_json)
    params = {"page": page, "size": size}
    if status:
        params["status"] = status
    if industry:
        params["industry"] = industry
    if version:
        params["version"] = version
    
    result = api_client.get("/admin/merchants/", params)
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "商家列表")
    else:
        output.print_error(result.get("message", "请求失败"))


@merchant_group.command("stats")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def merchant_stats(use_json):
    """获取商家统计"""
    output = Output(use_json)
    result = api_client.get("/admin/merchants/stats")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), "商家统计")
    else:
        output.print_error(result.get("message", "请求失败"))


@merchant_group.command("detail")
@click.option("--id", "merchant_id", required=True, type=int, help="商家ID")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def merchant_detail(merchant_id, use_json):
    """获取商家详情"""
    output = Output(use_json)
    result = api_client.get(f"/admin/merchants/{merchant_id}")
    
    if result.get("code") == 0:
        output.print(result.get("data", {}), f"商家详情 (ID: {merchant_id})")
    else:
        output.print_error(result.get("message", "商家不存在"))


@merchant_group.command("create")
@click.option("--name", required=True, help="商家名称")
@click.option("--industry", default="餐饮", help="行业类型")
@click.option("--version", default="免费版", help="版本")
@click.option("--phone", help="联系电话")
@click.option("--contact", help="联系人")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def create_merchant(name, industry, version, phone, contact, use_json):
    """创建商家"""
    output = Output(use_json)
    data = {
        "name": name,
        "industry": industry,
        "version": version,
        "phone": phone or "",
        "contact": contact or ""
    }
    
    result = api_client.post("/admin/merchants/", data)
    
    if result.get("code") == 0:
        output.print_success(f"商家 '{name}' 创建成功，ID: {result.get('data', {}).get('id')}")
    else:
        output.print_error(result.get("message", "创建失败"))


@merchant_group.command("onboard")
@click.option("--name", required=True, help="商家名称")
@click.option("--industry", default="餐饮", help="行业类型")
@click.option("--phone", help="联系电话")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def onboard_merchant(name, industry, phone, use_json):
    """快速入驻商家"""
    output = Output(use_json)
    data = {
        "name": name,
        "industry": industry,
        "version": "免费版",
        "phone": phone or ""
    }
    
    result = api_client.post("/admin/merchants/", data)
    
    if result.get("code") == 0:
        output.print_success(f"商家 '{name}' 已入驻")
        output.print(result.get("data", {}))
    else:
        output.print_error(result.get("message", "入驻失败"))


@merchant_group.command("audit")
@click.option("--id", "merchant_id", type=int, help="商家ID")
@click.option("--approve", is_flag=True, help="审核通过")
@click.option("--reject", is_flag=True, help="审核拒绝")
@click.option("--batch-file", type=click.Path(exists=True), help="批量审核文件")
@click.option("--approve-all", is_flag=True, help="批量全部通过")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def audit_merchant(merchant_id, approve, reject, batch_file, approve_all, use_json):
    """审核商家"""
    output = Output(use_json)
    
    if batch_file or approve_all:
        # 批量审核
        result = api_client.post("/admin/merchants/", {"action": "batch_audit", "approve": True})
        if result.get("code") == 0:
            output.print_success("批量审核完成")
        else:
            output.print_error(result.get("message", "批量审核失败"))
    elif merchant_id:
        result = api_client.post("/admin/merchants/audit", {
            "merchant_id": merchant_id,
            "approve": approve
        })
        if result.get("code") == 0:
            action = "通过" if approve else "拒绝"
            output.print_success(f"商家 {merchant_id} 审核{action}")
        else:
            output.print_error(result.get("message", "审核失败"))
    else:
        output.print_error("请指定商家ID或使用批量审核")


@merchant_group.command("upgrade")
@click.option("--id", "merchant_id", required=True, type=int, help="商家ID")
@click.option("--version", required=True, help="目标版本")
@click.option("--json", "use_json", is_flag=True, help="JSON格式输出")
def upgrade_merchant(merchant_id, version, use_json):
    """升级商家版本"""
    output = Output(use_json)
    result = api_client.post(f"/admin/merchants/{merchant_id}/upgrade?version={version}")
    
    if result.get("code") == 0:
        output.print_success(f"商家 {merchant_id} 已升级到 {version}")
    else:
        output.print_error(result.get("message", "升级失败"))
