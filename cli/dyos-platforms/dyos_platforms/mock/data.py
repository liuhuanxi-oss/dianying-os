"""
Mock数据 - 丰富的模拟真实业务数据

为比赛Demo提供8大平台的模拟数据，包括商家信息、商品、订单、评价等
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


class MockData:
    """Mock数据生成器"""
    
    # 商家名称库
    SHOP_NAMES = [
        "川味观·成都老火锅", "粤式茶餐厅·点都德", "湘菜馆·辣妹子", 
        "东北饺子馆", "日式料理·樱花亭", "韩式烤肉·首尔欧巴",
        "西餐厅·红酒吧", "咖啡厅·漫时光", "奶茶店·茶颜悦色",
        "烧烤摊·深夜食堂", "小龙虾·盱眙张记", "海鲜自助·渔港盛宴",
        "快餐店·麦当劳", "披萨店·必胜客", "面馆·兰州拉面",
        "包子铺·鼎泰丰", "烘焙坊·味多美", "水果店·百果园",
        "药店·海王星辰", "便利店·7-Eleven"
    ]
    
    # 商品名称库
    PRODUCT_NAMES = [
        "招牌毛肚", "鲜切牛肉", "手工虾滑", "金针菇", "娃娃菜",
        "秘制蘸料", "川香麻辣锅底", "菌汤锅底", "鸳鸯锅底",
        "精品肥牛", "羊肉卷", "猪肉丸", "鱼豆腐", "豆腐皮",
        "土豆片", "莲藕片", "冬瓜片", "海带结", "魔芋丝",
        "大可乐", "雪碧", "王老吉", "酸梅汤", "柠檬水"
    ]
    
    # 评价内容库
    REVIEW_POSITIVE = [
        "味道超级棒！锅底特别香，下次还会再来！",
        "服务态度很好，服务员小哥哥很热情，主动帮忙加汤",
        "食材很新鲜，毛肚脆嫩，牛肉也很嫩滑",
        "环境优雅，装修风格很喜欢，适合朋友聚餐",
        "性价比超高！团购套餐很划算，分量十足",
        "位置好找，停车方便，门口就有停车位",
        "菜品丰富，选择很多，满足不同口味需求",
        "老板人很实在，会再光顾的，推荐给大家！",
        "味道正宗，跟在成都吃到的一样，很满意",
        "值得推荐！已经带朋友来过了，都说好吃"
    ]
    
    REVIEW_NEUTRAL = [
        "还行吧，中规中矩，没有特别惊艳的地方",
        "人有点多，等位等了半小时，建议提前预约",
        "味道不错，就是价格稍微贵了点",
        "菜品分量一般，建议增加一些",
        "服务还可以再提升一下"
    ]
    
    REVIEW_NEGATIVE = [
        "等位时间太长，将近一个小时，体验不好",
        "食材不够新鲜，虾滑有点腥",
        "服务态度一般，叫了好几遍没人理",
        "锅底有点咸，建议调整一下配方",
        "性价比不高，同样的价格可以吃更好的"
    ]
    
    # 地址库
    ADDRESSES = [
        "上海市浦东新区陆家嘴环路1000号",
        "上海市静安区南京西路1266号",
        "北京市朝阳区建国门外大街1号",
        "北京市海淀区中关村大街1号",
        "广州市天河区天河路383号",
        "广州市越秀区北京路步行街123号",
        "深圳市南山区科技园南区高新南七道",
        "杭州市西湖区龙井路1号",
        "成都市锦江区春熙路IFS广场",
        "重庆市渝中区解放碑步行街"
    ]
    
    @classmethod
    def generate_shops(cls, platform: str, count: int = 5) -> List[Dict[str, Any]]:
        """生成模拟店铺数据"""
        shops = []
        for i in range(count):
            shop_id = f"{platform.upper()[:2]}{str(i+1).zfill(3)}"
            status = random.choice(["营业中", "休息中", "已打烊"])
            shops.append({
                "id": shop_id,
                "name": cls.SHOP_NAMES[i % len(cls.SHOP_NAMES)],
                "status": status,
                "rating": round(random.uniform(4.0, 5.0), 1),
                "review_count": random.randint(50, 500),
                "address": cls.ADDRESSES[i % len(cls.ADDRESSES)],
                "phone": f"400-{random.randint(100,999)}-{random.randint(1000,9999)}",
                "business_hours": "09:00-22:00",
                "platform": platform,
                "created_at": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat()
            })
        return shops
    
    @classmethod
    def generate_products(cls, shop_id: str, count: int = 10) -> List[Dict[str, Any]]:
        """生成模拟商品数据"""
        products = []
        for i in range(count):
            product_id = f"P{shop_id[-3:]}{str(i+1).zfill(3)}"
            products.append({
                "id": product_id,
                "name": random.choice(cls.PRODUCT_NAMES),
                "price": round(random.uniform(9.9, 99.9), 2),
                "stock": random.randint(0, 100),
                "sales": random.randint(10, 500),
                "shop_id": shop_id,
                "category": random.choice(["招牌菜", "热销", "新品", "特价"]),
                "status": random.choice(["上架", "下架", "售罄"]),
                "image_url": f"https://cdn.dianyingos.com/products/{product_id}.jpg"
            })
        return products
    
    @classmethod
    def generate_orders(cls, platform: str, shop_id: str, status: str = None, count: int = 5) -> List[Dict[str, Any]]:
        """生成模拟订单数据"""
        statuses = ["pending", "confirmed", "preparing", "delivering", "completed", "cancelled"]
        order_statuses = {
            "pending": "待支付",
            "confirmed": "已接单",
            "preparing": "制作中",
            "delivering": "配送中",
            "completed": "已完成",
            "cancelled": "已取消"
        }
        
        orders = []
        for i in range(count):
            order_status = status or random.choice(statuses)
            order_id = f"ORD{platform.upper()[:2]}{datetime.now().strftime('%Y%m%d')}{str(i+1).zfill(4)}"
            created_at = datetime.now() - timedelta(hours=random.randint(1, 72))
            orders.append({
                "id": order_id,
                "shop_id": shop_id,
                "platform": platform,
                "status": order_status,
                "status_text": order_statuses.get(order_status, order_status),
                "amount": round(random.uniform(30, 300), 2),
                "items": random.randint(1, 5),
                "customer_name": random.choice(["张先生", "李女士", "王同学", "刘经理", "陈老板"]),
                "customer_phone": f"138{random.randint(10000000, 99999999)}",
                "created_at": created_at.isoformat(),
                "paid_at": (created_at + timedelta(minutes=5)).isoformat() if order_status != "pending" else None
            })
        return orders
    
    @classmethod
    def generate_reviews(cls, platform: str, shop_id: str, count: int = 5, days: int = 7) -> List[Dict[str, Any]]:
        """生成模拟评价数据"""
        reviews = []
        for i in range(count):
            review_id = f"R{platform.upper()[:2]}{str(i+1).zfill(4)}"
            rating = random.choices(
                [5, 4, 3, 2, 1],
                weights=[50, 25, 15, 5, 5]
            )[0]
            
            if rating >= 4:
                content = random.choice(cls.REVIEW_POSITIVE)
            elif rating == 3:
                content = random.choice(cls.REVIEW_NEUTRAL)
            else:
                content = random.choice(cls.REVIEW_NEGATIVE)
            
            created_at = datetime.now() - timedelta(
                days=random.randint(0, days),
                hours=random.randint(0, 23)
            )
            
            reviews.append({
                "id": review_id,
                "shop_id": shop_id,
                "platform": platform,
                "rating": rating,
                "content": content,
                "customer_name": random.choice(["小红书达人", "点评VIP", "抖音用户", "饿了么会员"]),
                "images": random.randint(0, 3),
                "created_at": created_at.isoformat(),
                "replied": random.choice([True, False]),
                "reply_content": "感谢您的认可，我们会继续努力！" if random.random() > 0.5 else None,
                "reply_at": (created_at + timedelta(days=1)).isoformat() if random.random() > 0.5 else None
            })
        return reviews
    
    @classmethod
    def generate_analytics(cls, platform: str, days: int = 7) -> Dict[str, Any]:
        """生成模拟经营数据"""
        today = datetime.now()
        daily_data = []
        
        for d in range(days):
            date = (today - timedelta(days=days - d - 1)).strftime("%Y-%m-%d")
            daily_data.append({
                "date": date,
                "orders": random.randint(50, 200),
                "revenue": round(random.uniform(3000, 15000), 2),
                "customers": random.randint(30, 150),
                "avg_order": round(random.uniform(40, 100), 2),
                "rating": round(random.uniform(4.2, 4.9), 1)
            })
        
        return {
            "platform": platform,
            "period": f"最近{days}天",
            "total_orders": sum(d["orders"] for d in daily_data),
            "total_revenue": round(sum(d["revenue"] for d in daily_data), 2),
            "total_customers": sum(d["customers"] for d in daily_data),
            "avg_rating": round(sum(d["rating"] for d in daily_data) / len(daily_data), 1),
            "daily_data": daily_data,
            "generated_at": datetime.now().isoformat()
        }
    
    @classmethod
    def generate_poi_search(cls, keyword: str, city: str, count: int = 10) -> List[Dict[str, Any]]:
        """生成模拟POI搜索数据"""
        pois = []
        for i in range(count):
            poi_id = f"POI{str(i+1).zfill(4)}"
            pois.append({
                "id": poi_id,
                "name": f"{keyword}{random.choice(['(陆家嘴店)', '(南京路店)', '(静安寺店)', '(徐家汇店)', ''])}",
                "address": f"{city}{random.choice(['区', '市'])}{random.choice(['中心路', '人民路', '建设路', '解放路'])}{random.randint(1, 999)}号",
                "location": {
                    "lat": round(random.uniform(30.0, 32.0), 6),
                    "lng": round(random.uniform(120.0, 122.0), 6)
                },
                "telephone": f"{random.randint(10, 99)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "tag": random.choice(["美食", "火锅", "川菜", "烧烤", "自助餐"]),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "price_level": random.randint(1, 4),
                "distance": random.randint(100, 5000)
            })
        return pois
    
    @classmethod
    def generate_marketing(cls, platform: str,营销_type: str = "coupon") -> Dict[str, Any]:
        """生成模拟营销数据"""
        campaign_id = f"CAMP{platform.upper()[:2]}{datetime.now().strftime('%Y%m%d%H%M')}"
        return {
            "id": campaign_id,
            "platform": platform,
            "type":营销_type,
            "name": random.choice([
                "新客专享满50减10", "会员日8折优惠", "限时抢购5折起",
                "满100送饮料", "周末特惠套餐", "生日专属礼包"
            ]),
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "end_time": (datetime.now() + timedelta(days=7)).isoformat(),
            "claimed": random.randint(100, 1000),
            "used": random.randint(50, 500),
            "total": random.randint(1000, 5000)
        }
    
    @classmethod
    def generate_member(cls, platform: str, phone: str = None) -> Dict[str, Any]:
        """生成模拟会员数据"""
        member_id = f"MEM{platform.upper()[:2]}{random.randint(100000, 999999)}"
        return {
            "id": member_id,
            "platform": platform,
            "phone": phone or f"138{random.randint(10000000, 99999999)}",
            "name": random.choice(["张三", "李四", "王五", "赵六", "钱七"]),
            "level": random.choice(["普通会员", "银卡会员", "金卡会员", "钻石会员"]),
            "points": random.randint(0, 10000),
            "balance": round(random.uniform(0, 500), 2),
            "total_orders": random.randint(1, 100),
            "total_spent": round(random.uniform(100, 10000), 2),
            "join_time": (datetime.now() - timedelta(days=random.randint(30, 730))).isoformat(),
            "last_order_time": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
        }
    
    @classmethod
    def generate_payment_reconcile(cls, platform: str, date: str) -> Dict[str, Any]:
        """生成模拟支付对账数据"""
        return {
            "platform": platform,
            "date": date,
            "total_orders": random.randint(100, 500),
            "total_amount": round(random.uniform(10000, 50000), 2),
            "wechat_paid": round(random.uniform(3000, 15000), 2),
            "alipay_paid": round(random.uniform(3000, 15000), 2),
            "cash_paid": round(random.uniform(1000, 5000), 2),
            "card_paid": round(random.uniform(1000, 5000), 2),
            "refund_amount": round(random.uniform(0, 500), 2),
            "net_amount": round(random.uniform(8000, 45000), 2),
            "status": "success",
            "generated_at": datetime.now().isoformat()
        }
    
    @classmethod
    def generate_showcase(cls, platform: str, count: int = 5) -> List[Dict[str, Any]]:
        """生成模拟橱窗数据（微信视频号）"""
        showcases = []
        for i in range(count):
            showcase_id = f"SC{str(i+1).zfill(4)}"
            showcases.append({
                "id": showcase_id,
                "platform": platform,
                "title": random.choice([
                    "【爆款推荐】招牌火锅套餐", "新品上市 | 菌汤锅底上线",
                    "会员专享 | 满100减20", "周末特惠 | 双人套餐仅需88元",
                    "【限时】川味麻辣锅底特惠中"
                ]),
                "status": random.choice(["online", "offline", "pending"]),
                "views": random.randint(100, 10000),
                "likes": random.randint(10, 1000),
                "orders": random.randint(5, 200),
                "cover_url": f"https://cdn.dianyingos.com/showcase/{showcase_id}.jpg",
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
            })
        return showcases
    
    @classmethod
    def generate_live_data(cls, live_id: str) -> Dict[str, Any]:
        """生成模拟直播数据"""
        return {
            "id": live_id,
            "platform": "wechat",
            "title": random.choice([
                "火锅节专场直播", "新品发布会", "粉丝福利专场"
            ]),
            "status": random.choice(["live", "end", "scheduled"]),
            "start_time": (datetime.now() - timedelta(hours=2)).isoformat(),
            "duration": random.randint(60, 180),
            "viewers": random.randint(1000, 10000),
            "likes": random.randint(500, 5000),
            "shares": random.randint(100, 1000),
            "orders": random.randint(50, 500),
            "sales": round(random.uniform(5000, 50000), 2),
            "created_at": datetime.now().isoformat()
        }
    
    @classmethod
    def generate_material(cls, count: int = 5) -> List[Dict[str, Any]]:
        """生成模拟素材中心数据（小红书）"""
        materials = []
        for i in range(count):
            material_id = f"MAT{str(i+1).zfill(4)}"
            materials.append({
                "id": material_id,
                "type": random.choice(["image", "video"]),
                "url": f"https://cdn.dianyingos.com/materials/{material_id}.jpg",
                "thumbnail": f"https://cdn.dianyingos.com/materials/{material_id}_thumb.jpg",
                "size": random.randint(100, 5000),
                "width": random.choice([720, 1080, 1920]),
                "height": random.choice([720, 1080, 1920]),
                "status": random.choice(["uploaded", "processing", "failed"]),
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
            })
        return materials
