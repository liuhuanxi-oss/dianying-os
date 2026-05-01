"""
店赢OS CLI - 统一入口

一个命令管理美团、饿了么、抖音、小红书、微信视频号、高德、支付宝、百度8大平台
"""

import click
import json
from typing import Dict, Any, List, Optional

from dyos_platforms import __version__
from dyos_platforms.config import PLATFORM_CONFIG, SUPPORTED_PLATFORMS
from dyos_platforms.core.meituan import MeituanCLI
from dyos_platforms.core.eleme import ElemeCLI
from dyos_platforms.core.douyin import DouyinCLI
from dyos_platforms.core.xiaohongshu import XiaohongshuCLI
from dyos_platforms.core.wechat import WechatCLI
from dyos_platforms.core.amap import AmapCLI
from dyos_platforms.core.alipay import AlipayCLI
from dyos_platforms.core.baidu import BaiduCLI
from dyos_platforms.utils.output import OutputFormatter
from dyos_platforms.utils.repl_skin import REPLSkin


# ==================== CLI实例管理 ====================

def get_platform_cli(platform: str, json_output: bool = False):
    """获取平台CLI实例"""
    platform_map = {
        "meituan": MeituanCLI,
        "eleme": ElemeCLI,
        "douyin": DouyinCLI,
        "xiaohongshu": XiaohongshuCLI,
        "wechat": WechatCLI,
        "amap": AmapCLI,
        "alipay": AlipayCLI,
        "baidu": BaiduCLI,
    }
    
    cli_class = platform_map.get(platform.lower())
    if cli_class:
        return cli_class(use_mock=True, json_output=json_output)
    return None


# ==================== 辅助函数 ====================

def echo_result(result: Dict[str, Any], json_output: bool, table_columns: List[str] = None):
    """输出结果"""
    if json_output:
        click.echo(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        output = OutputFormatter(json_output=False)
        if "data" in result and isinstance(result["data"], list):
            output.print_table(result["data"], title=result.get("platform", ""), columns=table_columns)
        elif "data" in result and isinstance(result["data"], dict):
            output.print_dict(result["data"], title=result.get("platform", ""))
        else:
            click.echo(result)


def get_table_columns(command: str, resource: str) -> List[str]:
    """获取表格列"""
    columns_map = {
        "shop_list": ["id", "name", "status", "rating", "review_count", "address"],
        "product_list": ["id", "name", "price", "stock", "sales", "status"],
        "order_list": ["id", "shop_id", "status_text", "amount", "customer_name", "created_at"],
        "review_list": ["id", "rating", "content", "customer_name", "created_at", "replied"],
        "poi_search": ["id", "name", "address", "telephone", "rating", "distance"],
        "showcase_list": ["id", "title", "status", "views", "likes", "orders"],
        "material_list": ["id", "type", "url", "size", "status", "created_at"],
    }
    return columns_map.get(f"{command}_{resource}")


# ==================== 主CLI组 ====================

@click.group()
@click.version_option(version=__version__, prog_name="dyos-platform")
def cli():
    """店赢OS - 8大本地生活平台统一CLI工具
    
    一个命令管理美团、饿了么、抖音、小红书、微信视频号、高德、支付宝、百度8大平台。
    
    示例:
    
        dyos-platform list                                    列出所有平台
        dyos-platform meituan shop list --json                查看美团店铺列表
        dyos-platform all shop sync --from dyos               一键同步8个平台店铺
    """
    pass


# ==================== 列出平台 ====================

@cli.command("list")
def list_platforms():
    """列出所有已配置的平台"""
    output = OutputFormatter(json_output=False)
    skin = REPLSkin()
    
    platforms = []
    for code, config in PLATFORM_CONFIG.items():
        platforms.append({
            "name": config["name"],
            "command": code,
            "configured": bool(config.get("app_id") or config.get("key") or config.get("client_key")),
        })
    
    skin.print_platforms(platforms)
    
    click.echo("\n[提示] 当前为Mock模式，输入真实API Key后可切换到真实API")


# ==================== 美团命令组 ====================

@cli.group("meituan")
def meituan():
    """美团/大众点评 - 店铺管理/商品/订单/评价/营销/经营数据"""
    pass


@meituan.command("shop")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_shop(json_output):
    """店铺管理（list/detail子命令）"""
    click.echo("请使用子命令: list, detail")


@meituan.command("shop-list")
@click.option("--id", "shop_id", help="店铺ID")
@click.option("--city", help="城市筛选")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_shop_list(shop_id, city, json_output):
    """获取店铺列表"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.shop_list(shop_id=shop_id, city=city)
    columns = get_table_columns("shop_list", "")
    echo_result(result, json_output, columns)


@meituan.command("shop-detail")
@click.option("--id", "shop_id", required=True, help="店铺ID")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_shop_detail(shop_id, json_output):
    """获取店铺详情"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.shop_detail(shop_id)
    echo_result(result, json_output)


@meituan.command("product-sync")
@click.option("--from", "source", default="dyos", help="商品来源平台")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_product_sync(source, json_output):
    """同步商品"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.product_sync(source=source)
    echo_result(result, json_output)


@meituan.command("product-list")
@click.option("--shop", "shop_id", help="店铺ID")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_product_list(shop_id, json_output):
    """获取商品列表"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.product_list(shop_id=shop_id)
    columns = get_table_columns("product_list", "")
    echo_result(result, json_output, columns)


@meituan.command("order-list")
@click.option("--shop", "shop_id", help="店铺ID")
@click.option("--status", help="订单状态: pending/confirmed/preparing/delivering/completed/cancelled")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_order_list(shop_id, status, json_output):
    """获取订单列表"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.order_list(shop_id=shop_id, status=status)
    columns = get_table_columns("order_list", "")
    echo_result(result, json_output, columns)


@meituan.command("review-list")
@click.option("--shop", "shop_id", help="店铺ID")
@click.option("--days", default=7, type=int, help="查询天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_review_list(shop_id, days, json_output):
    """获取评价列表"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.review_list(shop_id=shop_id, days=days)
    columns = get_table_columns("review_list", "")
    echo_result(result, json_output, columns)


@meituan.command("review-reply")
@click.option("--id", "review_id", required=True, help="评价ID")
@click.option("--content", required=True, help="回复内容")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_review_reply(review_id, content, json_output):
    """回复评价"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.review_reply(review_id, content)
    echo_result(result, json_output)


@meituan.command("marketing-create")
@click.option("--type", "营销_type", default="coupon", help="营销类型: coupon/discount/gift")
@click.option("--name", help="活动名称")
@click.option("--amount", type=float, help="优惠金额")
@click.option("--threshold", type=float, help="使用门槛")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_marketing_create(营销_type, name, amount, threshold, json_output):
    """创建营销活动"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.marketing_create(营销_type=营销_type, name=name, amount=amount, threshold=threshold)
    echo_result(result, json_output)


@meituan.command("analytics-overview")
@click.option("--days", default=7, type=int, help="统计天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def meituan_analytics_overview(days, json_output):
    """获取经营数据概览"""
    cli = get_platform_cli("meituan", json_output)
    result = cli.analytics_overview(days=days)
    echo_result(result, json_output)


# ==================== 饿了么命令组 ====================

@cli.group("eleme")
def eleme():
    """饿了么 - 商户/店铺/商品/订单/营销/评价"""
    pass


@eleme.command("shop-list")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def eleme_shop_list(json_output):
    """获取店铺列表"""
    cli = get_platform_cli("eleme", json_output)
    result = cli.shop_list()
    columns = get_table_columns("shop_list", "")
    echo_result(result, json_output, columns)


@eleme.command("product-sync")
@click.option("--from", "source", default="dyos", help="商品来源平台")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def eleme_product_sync(source, json_output):
    """同步商品"""
    cli = get_platform_cli("eleme", json_output)
    result = cli.product_sync(source=source)
    echo_result(result, json_output)


@eleme.command("order-list")
@click.option("--status", help="订单状态")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def eleme_order_list(status, json_output):
    """获取订单列表"""
    cli = get_platform_cli("eleme", json_output)
    result = cli.order_list(status=status)
    columns = get_table_columns("order_list", "")
    echo_result(result, json_output, columns)


@eleme.command("review-list")
@click.option("--days", default=7, type=int, help="查询天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def eleme_review_list(days, json_output):
    """获取评价列表"""
    cli = get_platform_cli("eleme", json_output)
    result = cli.review_list(days=days)
    columns = get_table_columns("review_list", "")
    echo_result(result, json_output, columns)


# ==================== 抖音命令组 ====================

@cli.group("douyin")
def douyin():
    """抖音本地生活 - 到店餐饮/到综/商品/券核销/数据"""
    pass


@douyin.command("local-life-product-publish")
@click.option("--shop", "shop_id", help="店铺ID")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def douyin_product_publish(shop_id, json_output):
    """发布本地生活商品"""
    cli = get_platform_cli("douyin", json_output)
    result = cli.local_life_product_publish(shop_id=shop_id)
    echo_result(result, json_output)


@douyin.command("local-life-coupon-create")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def douyin_coupon_create(json_output):
    """创建优惠券"""
    cli = get_platform_cli("douyin", json_output)
    result = cli.local_life_coupon_create()
    echo_result(result, json_output)


@douyin.command("analytics-order")
@click.option("--days", default=7, type=int, help="统计天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def douyin_analytics_order(days, json_output):
    """订单数据分析"""
    cli = get_platform_cli("douyin", json_output)
    result = cli.analytics_order(days=days)
    echo_result(result, json_output)


@douyin.command("review-list")
@click.option("--days", default=7, type=int, help="查询天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def douyin_review_list(days, json_output):
    """获取评价列表"""
    cli = get_platform_cli("douyin", json_output)
    result = cli.review_list(days=days)
    columns = get_table_columns("review_list", "")
    echo_result(result, json_output, columns)


# ==================== 小红书命令组 ====================

@cli.group("xiaohongshu")
def xiaohongshu():
    """小红书 - 商品/订单/库存/素材中心"""
    pass


@xiaohongshu.command("product-list")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def xiaohongshu_product_list(json_output):
    """获取商品列表"""
    cli = get_platform_cli("xiaohongshu", json_output)
    result = cli.product_list()
    columns = get_table_columns("product_list", "")
    echo_result(result, json_output, columns)


@xiaohongshu.command("material-upload")
@click.option("--file", "file_path", required=True, help="素材文件路径")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def xiaohongshu_material_upload(file_path, json_output):
    """上传素材"""
    cli = get_platform_cli("xiaohongshu", json_output)
    result = cli.material_upload(file_path=file_path)
    echo_result(result, json_output)


# ==================== 微信视频号命令组 ====================

@cli.group("wechat")
def wechat():
    """微信视频号 - 橱窗/直播/商品"""
    pass


@wechat.command("showcase-list")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def wechat_showcase_list(json_output):
    """获取橱窗列表"""
    cli = get_platform_cli("wechat", json_output)
    result = cli.showcase_list()
    columns = get_table_columns("showcase_list", "")
    echo_result(result, json_output, columns)


@wechat.command("live-data")
@click.option("--id", "live_id", help="直播ID")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def wechat_live_data(live_id, json_output):
    """获取直播数据"""
    cli = get_platform_cli("wechat", json_output)
    result = cli.live_data(live_id=live_id)
    echo_result(result, json_output)


# ==================== 高德地图命令组 ====================

@cli.group("amap")
def amap():
    """高德地图 - POI/地理编码/门店定位"""
    pass


@amap.command("poi-search")
@click.option("--keyword", required=True, help="搜索关键词")
@click.option("--city", help="城市")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def amap_poi_search(keyword, city, json_output):
    """搜索POI"""
    cli = get_platform_cli("amap", json_output)
    result = cli.poi_search(keyword=keyword, city=city)
    columns = get_table_columns("poi_search", "")
    echo_result(result, json_output, columns)


@amap.command("poi-detail")
@click.option("--id", "poi_id", required=True, help="POI ID")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def amap_poi_detail(poi_id, json_output):
    """获取POI详情"""
    cli = get_platform_cli("amap", json_output)
    result = cli.poi_detail(poi_id=poi_id)
    echo_result(result, json_output)


@amap.command("geocode")
@click.option("--address", required=True, help="地址")
@click.option("--city", help="城市")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def amap_geocode(address, city, json_output):
    """地理编码 - 地址转坐标"""
    cli = get_platform_cli("amap", json_output)
    result = cli.geocode(address=address, city=city)
    echo_result(result, json_output)


# ==================== 支付宝命令组 ====================

@cli.group("alipay")
def alipay():
    """支付宝/口碑 - 门店/商品/会员/支付对账"""
    pass


@alipay.command("shop-list")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def alipay_shop_list(json_output):
    """获取店铺列表"""
    cli = get_platform_cli("alipay", json_output)
    result = cli.shop_list()
    columns = get_table_columns("shop_list", "")
    echo_result(result, json_output, columns)


@alipay.command("member-query")
@click.option("--phone", help="手机号")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def alipay_member_query(phone, json_output):
    """查询会员信息"""
    cli = get_platform_cli("alipay", json_output)
    result = cli.member_query(phone=phone)
    echo_result(result, json_output)


@alipay.command("payment-reconcile")
@click.option("--date", help="对账日期 YYYY-MM-DD")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def alipay_payment_reconcile(date, json_output):
    """支付对账"""
    cli = get_platform_cli("alipay", json_output)
    result = cli.payment_reconcile(date=date)
    echo_result(result, json_output)


# ==================== 百度地图命令组 ====================

@cli.group("baidu")
def baidu():
    """百度地图 - POI/地理编码/门店"""
    pass


@baidu.command("poi-search")
@click.option("--keyword", required=True, help="搜索关键词")
@click.option("--city", help="城市")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def baidu_poi_search(keyword, city, json_output):
    """搜索POI"""
    cli = get_platform_cli("baidu", json_output)
    result = cli.poi_search(keyword=keyword, city=city)
    columns = get_table_columns("poi_search", "")
    echo_result(result, json_output, columns)


@baidu.command("geocode")
@click.option("--address", required=True, help="地址")
@click.option("--city", help="城市")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def baidu_geocode(address, city, json_output):
    """地理编码 - 地址转坐标"""
    cli = get_platform_cli("baidu", json_output)
    result = cli.geocode(address=address, city=city)
    echo_result(result, json_output)


# ==================== 跨平台聚合命令组 ====================

@cli.group("all")
def all_platforms():
    """跨平台聚合 - 一个命令操作8个平台"""
    pass


@all_platforms.command("shop-sync")
@click.option("--from", "source", default="dyos", help="商品来源平台")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def all_shop_sync(source, json_output):
    """一键同步8个平台店铺信息"""
    platforms = ["meituan", "eleme", "douyin", "xiaohongshu", "wechat", "amap", "alipay", "baidu"]
    results = []
    
    for platform in platforms:
        cli = get_platform_cli(platform, json_output)
        try:
            result = cli.shop_list()
            results.append({
                "platform": platform,
                "platform_name": PLATFORM_CONFIG[platform]["name"],
                "status": "success",
                "shops_count": len(result.get("data", []))
            })
        except Exception as e:
            results.append({
                "platform": platform,
                "platform_name": PLATFORM_CONFIG[platform]["name"],
                "status": "error",
                "error": str(e)
            })
    
    if json_output:
        click.echo(json.dumps({"code": 0, "message": "success", "data": results}, ensure_ascii=False, indent=2))
    else:
        output = OutputFormatter(json_output=False)
        output.print_table(results, title="8平台店铺同步状态", columns=["platform", "platform_name", "status", "shops_count"])


@all_platforms.command("product-publish")
@click.option("--from", "source", default="dyos", help="商品来源平台")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def all_product_publish(source, json_output):
    """一键发布商品到所有平台"""
    platforms = ["meituan", "eleme", "douyin", "xiaohongshu", "wechat", "amap", "alipay", "baidu"]
    results = []
    
    for platform in platforms:
        cli = get_platform_cli(platform, json_output)
        try:
            result = cli.product_sync(source=source)
            results.append({
                "platform": platform,
                "platform_name": PLATFORM_CONFIG[platform]["name"],
                "status": "success",
                "synced_count": result.get("data", {}).get("synced_count", 0)
            })
        except Exception as e:
            results.append({
                "platform": platform,
                "platform_name": PLATFORM_CONFIG[platform]["name"],
                "status": "error",
                "error": str(e)
            })
    
    if json_output:
        click.echo(json.dumps({"code": 0, "message": "success", "data": results}, ensure_ascii=False, indent=2))
    else:
        output = OutputFormatter(json_output=False)
        output.print_table(results, title="8平台商品发布状态", columns=["platform", "platform_name", "status", "synced_count"])


@all_platforms.command("review-list")
@click.option("--days", default=7, type=int, help="查询天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def all_review_list(days, json_output):
    """聚合所有平台评价"""
    platforms = ["meituan", "eleme", "douyin", "xiaohongshu"]
    all_reviews = []
    
    for platform in platforms:
        cli = get_platform_cli(platform, json_output)
        try:
            result = cli.review_list(days=days)
            reviews = result.get("data", [])
            for review in reviews:
                review["source_platform"] = platform
            all_reviews.extend(reviews)
        except Exception:
            pass
    
    if json_output:
        click.echo(json.dumps({
            "code": 0,
            "message": "success",
            "total": len(all_reviews),
            "data": all_reviews
        }, ensure_ascii=False, indent=2))
    else:
        output = OutputFormatter(json_output=False)
        output.print_table(all_reviews, title=f"聚合评价 (共{len(all_reviews)}条)", 
                          columns=["id", "rating", "content", "customer_name", "source_platform"])


@all_platforms.command("analytics-overview")
@click.option("--days", default=7, type=int, help="统计天数")
@click.option("--json", "json_output", is_flag=True, help="输出JSON格式")
def all_analytics_overview(days, json_output):
    """聚合所有平台经营数据"""
    platforms = ["meituan", "eleme", "douyin", "xiaohongshu", "alipay"]
    summary = []
    total_revenue = 0
    total_orders = 0
    
    for platform in platforms:
        cli = get_platform_cli(platform, json_output)
        try:
            result = cli.analytics_overview(days=days)
            data = result.get("data", {})
            summary.append({
                "platform": platform,
                "platform_name": PLATFORM_CONFIG[platform]["name"],
                "total_orders": data.get("total_orders", 0),
                "total_revenue": data.get("total_revenue", 0),
                "avg_rating": data.get("avg_rating", 0)
            })
            total_revenue += data.get("total_revenue", 0)
            total_orders += data.get("total_orders", 0)
        except Exception:
            pass
    
    if json_output:
        click.echo(json.dumps({
            "code": 0,
            "message": "success",
            "summary": {
                "total_orders": total_orders,
                "total_revenue": round(total_revenue, 2)
            },
            "data": summary
        }, ensure_ascii=False, indent=2))
    else:
        output = OutputFormatter(json_output=False)
        output.print_table(summary, title=f"8平台经营概览 (共{total_orders}单, ¥{round(total_revenue, 2)})",
                          columns=["platform", "platform_name", "total_orders", "total_revenue", "avg_rating"])


# ==================== 入口函数 ====================

def main():
    """CLI入口"""
    cli()


if __name__ == "__main__":
    main()
