# -*- coding: utf-8 -*-
"""
数据库初始化脚本
建表 + 预置数据（3用户 + 10门店 + 50差评 + 30天数据 + 5商户）
"""

import sys
import os
from datetime import datetime, timedelta
import random
import json

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bcrypt

# 使用bcrypt哈希（与auth路由一致）
def hash_password(password: str) -> str:
    """密码哈希 - 使用bcrypt，与auth路由保持一致"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

from database import get_db_context, init_database
from models import (
    User, Store, Review, Order, StatsDaily, Merchant,
    UserRole, ReviewStatus, OrderStatus, MerchantStatus
)

# 差评模板
BAD_REVIEW_TEMPLATES = [
    "等了30分钟还没上菜，差评！",
    "菜量太小，根本不够吃",
    "服务员态度很差，问什么都不理",
    "环境很脏，桌上还有上桌客人的残渣",
    "味道一般，价格还贵",
    "包装破损，菜都洒出来了",
    "送错餐了，等半天才发现",
    "虚假宣传，实物和图片差太多",
    "凉菜不凉，热菜不热",
    "牛肉是假的，口感完全不对",
    "米饭夹生，根本没法吃",
    "分量越来越少，越来越坑",
    "等了一个小时，建议大家别来",
    "投诉后没人处理，态度恶劣",
    "吃完拉肚子，再也不会来了",
]

# 好评模板
GOOD_REVIEW_TEMPLATES = [
    "味道不错，下次还会再来",
    "服务热情，环境也很好",
    "性价比高，推荐大家来",
    "菜品新鲜，分量足",
    "上菜快，口味地道",
    "很满意的一次用餐体验",
    "老板人好，下次带朋友来",
    "物美价廉，值得推荐",
    "装修风格很喜欢",
    "食材新鲜，做工精细",
]


def create_users(db):
    """创建用户"""
    users_data = [
        {
            "username": "admin",
            "password": "admin123",
            "phone": "13800000001",
            "email": "admin@dianying.com",
            "role": UserRole.ADMIN,
            "name": "系统管理员"
        },
        {
            "username": "platform",
            "password": "admin123",
            "phone": "13800000002",
            "email": "platform@dianying.com",
            "role": UserRole.PLATFORM,
            "name": "平台运营"
        },
        {
            "username": "merchant",
            "password": "admin123",
            "phone": "13800000003",
            "email": "merchant@dianying.com",
            "role": UserRole.MERCHANT,
            "name": "测试商户"
        },
    ]
    
    users = []
    for data in users_data:
        user = User(
            username=data["username"],
            password_hash=hash_password(data["password"]),
            phone=data["phone"],
            email=data["email"],
            role=data["role"],
            name=data["name"],
            status=True
        )
        db.add(user)
        users.append(user)
    
    db.flush()
    print(f"✓ 创建了 {len(users)} 个用户")
    return users


def create_stores(db, users):
    """创建门店"""
    merchant_user = users[2]  # merchant用户
    
    stores_data = [
        {"name": "老北京炸酱面馆", "address": "朝阳区建国路88号", "category": "中式快餐"},
        {"name": "川香麻辣烫", "address": "海淀区中关村大街100号", "category": "麻辣烫"},
        {"name": "粤式茶餐厅", "address": "西城区金融街50号", "category": "粤菜"},
        {"name": "日式寿司店", "address": "东城区王府井大街200号", "category": "日料"},
        {"name": "韩式烤肉屋", "address": "朝阳区三里屯太古里", "category": "韩餐"},
        {"name": "意式披萨坊", "address": "海淀区五道口购物中心", "category": "西餐"},
        {"name": "湘菜馆", "address": "丰台区马家堡西路", "category": "湘菜"},
        {"name": "火锅旗舰店", "address": "朝阳区望京SOHO", "category": "火锅"},
        {"name": "西北面馆", "address": "海淀区知春路", "category": "面馆"},
        {"name": "东北菜馆", "address": "昌平区回龙观", "category": "东北菜"},
    ]
    
    stores = []
    for i, data in enumerate(stores_data):
        store = Store(
            name=data["name"],
            address=data["address"],
            phone=f"010-{68000000 + i:04d}",
            category=data["category"],
            description=f"位于{data['address']}的{data['category']}店",
            owner_id=merchant_user.id,
            rating=round(random.uniform(4.0, 5.0), 1),
            review_count=random.randint(50, 200),
            order_count=random.randint(500, 2000),
            status=True
        )
        db.add(store)
        stores.append(store)
    
    db.flush()
    print(f"✓ 创建了 {len(stores)} 个门店")
    return stores


def create_reviews(db, stores):
    """创建评价（50条差评）"""
    reviews = []
    user_names = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"]
    
    for i in range(50):
        store = random.choice(stores)
        is_bad = i < 40  # 前40条是差评
        templates = BAD_REVIEW_TEMPLATES if is_bad else GOOD_REVIEW_TEMPLATES
        
        review = Review(
            store_id=store.id,
            user_name=random.choice(user_names),
            rating=random.randint(1, 2) if is_bad else random.randint(4, 5),
            content=random.choice(templates),
            status=ReviewStatus.PENDING if is_bad else ReviewStatus.REPLIED,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(review)
        reviews.append(review)
    
    db.flush()
    print(f"✓ 创建了 {len(reviews)} 条评价")
    return reviews


def create_orders(db, stores):
    """创建订单"""
    orders = []
    payment_methods = ["alipay", "wechat", "cash"]
    
    for i in range(200):
        store = random.choice(stores)
        total = round(random.uniform(30, 200), 2)
        discount = round(random.uniform(0, 30), 2) if random.random() > 0.5 else 0
        
        order = Order(
            order_no=f"ORD{20240101 + i:08d}",
            store_id=store.id,
            user_name=f"顾客{random.randint(1, 1000)}",
            user_phone=f"138{random.randint(10000000, 99999999)}",
            total_amount=total,
            discount_amount=discount,
            final_amount=total - discount,
            status=random.choice([OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.PENDING]),
            payment_method=random.choice(payment_methods),
            payment_time=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(order)
        orders.append(order)
    
    db.flush()
    print(f"✓ 创建了 {len(orders)} 个订单")
    return orders


def create_stats(db, stores):
    """创建30天统计数据"""
    stats = []
    
    for store in stores:
        for days_ago in range(30):
            date = (datetime.utcnow() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            order_count = random.randint(20, 80)
            order_amount = round(random.uniform(500, 3000), 2)
            
            # 根据评价情况计算评分
            avg_rating = round(random.uniform(3.5, 4.9), 1)
            positive = int(order_count * 0.7)
            negative = int(order_count * 0.15)
            
            stat = StatsDaily(
                date=date,
                store_id=store.id,
                order_count=order_count,
                order_amount=order_amount,
                review_count=random.randint(3, 15),
                new_user_count=random.randint(5, 20),
                avg_rating=avg_rating,
                positive_count=positive,
                negative_count=negative
            )
            db.add(stat)
            stats.append(stat)
    
    db.flush()
    print(f"✓ 创建了 {len(stats)} 条统计数据（30天 x {len(stores)}门店）")
    return stats


def create_merchants(db, users):
    """创建商户入驻申请"""
    merchant_user = users[2]
    
    merchants_data = [
        {
            "user_id": merchant_user.id,
            "company_name": "测试餐饮管理有限公司",
            "legal_person": "张三",
            "contact_phone": "13800000003",
            "contact_email": "test@dianying.com",
            "status": MerchantStatus.APPROVED
        },
    ]
    
    merchants = []
    for data in merchants_data:
        merchant = Merchant(**data)
        db.add(merchant)
        merchants.append(merchant)
    
    db.flush()
    print(f"✓ 创建了 {len(merchants)} 个商户入驻申请")
    return merchants


def main():
    """主函数"""
    print("=" * 50)
    print("店赢OS 数据库初始化")
    print("=" * 50)
    
    # 创建表
    print("\n[1/7] 创建数据库表...")
    init_database()
    
    with get_db_context() as db:
        # 创建数据
        print("\n[2/7] 创建用户...")
        users = create_users(db)
        
        print("\n[3/7] 创建门店...")
        stores = create_stores(db, users)
        
        print("\n[4/7] 创建评价...")
        reviews = create_reviews(db, stores)
        
        print("\n[5/7] 创建订单...")
        orders = create_orders(db, stores)
        
        print("\n[6/7] 创建统计数据...")
        stats = create_stats(db, stores)
        
        print("\n[7/7] 创建商户...")
        merchants = create_merchants(db, users)
    
    print("\n" + "=" * 50)
    print("数据库初始化完成！")
    print("=" * 50)
    print("\n预置账号：")
    print("  admin/admin123 (管理员)")
    print("  platform/admin123 (平台运营)")
    print("  merchant/admin123 (商户)")
    print()


if __name__ == "__main__":
    main()
