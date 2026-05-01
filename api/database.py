"""
店赢OS管理后台API - 数据库管理
"""
import sqlite3
from typing import Optional, Dict, List, Any

# 使用文件数据库以支持跨连接共享
DATABASE_PATH = "/tmp/dyos_admin.db"


def get_db():
    """获取数据库连接（单例模式）"""
    global _db_connection
    try:
        if '_db_connection' not in globals() or _db_connection is None:
            _db_connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
            _db_connection.row_factory = sqlite3.Row
        return _db_connection
    except:
        # 如果全局连接不可用，创建新连接
        conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn


def close_db():
    """关闭数据库连接"""
    global _db_connection
    if '_db_connection' in globals() and _db_connection:
        _db_connection.close()
        _db_connection = None


def init_db():
    """初始化数据库表"""
    db = get_db()
    cursor = db.cursor()
    
    # 商家表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            industry TEXT DEFAULT '餐饮',
            version TEXT DEFAULT '免费版',
            status TEXT DEFAULT 'active',
            register_time TEXT,
            expire_time TEXT,
            gmv REAL DEFAULT 0,
            orders INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            ai_usage INTEGER DEFAULT 0,
            phone TEXT DEFAULT '',
            contact TEXT DEFAULT '',
            address TEXT DEFAULT ''
        )
    """)
    
    # 代理商表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level TEXT DEFAULT 'silver',
            merchants INTEGER DEFAULT 0,
            monthly_gmv REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            join_time TEXT,
            contact TEXT DEFAULT '',
            region TEXT DEFAULT ''
        )
    """)
    
    # 业务员表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT DEFAULT '',
            region TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            customers INTEGER DEFAULT 0,
            this_month_sign INTEGER DEFAULT 0
        )
    """)
    
    # 交易流水表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            merchant TEXT NOT NULL,
            amount REAL DEFAULT 0,
            type TEXT DEFAULT 'subscription',
            status TEXT DEFAULT 'success',
            time TEXT
        )
    """)
    
    # 工单表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            merchant TEXT NOT NULL,
            type TEXT DEFAULT '',
            title TEXT DEFAULT '',
            status TEXT DEFAULT 'open',
            priority TEXT DEFAULT 'medium',
            create_time TEXT,
            assignee TEXT DEFAULT ''
        )
    """)
    
    # 公告表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            scope TEXT DEFAULT 'all',
            status TEXT DEFAULT 'published',
            create_time TEXT,
            views INTEGER DEFAULT 0
        )
    """)
    
    # 知识库表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'catering',
            status TEXT DEFAULT 'published',
            update_time TEXT,
            views INTEGER DEFAULT 0
        )
    """)
    
    # AI模板表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT '',
            category TEXT DEFAULT '',
            status TEXT DEFAULT 'published'
        )
    """)
    
    # 运营活动表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT DEFAULT '',
            start_time TEXT,
            end_time TEXT,
            status TEXT DEFAULT 'draft'
        )
    """)
    
    # 流失预警表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS churn_warning (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant TEXT NOT NULL,
            risk_level TEXT DEFAULT 'low',
            probability INTEGER DEFAULT 0,
            last_active TEXT,
            reason TEXT DEFAULT '',
            suggestion TEXT DEFAULT ''
        )
    """)
    
    # 角色表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level TEXT DEFAULT '',
            permissions TEXT DEFAULT '[]',
            users INTEGER DEFAULT 0
        )
    """)
    
    # 操作日志表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operator TEXT DEFAULT '',
            type TEXT DEFAULT '',
            object TEXT DEFAULT '',
            action TEXT DEFAULT '',
            time TEXT,
            ip TEXT DEFAULT ''
        )
    """)
    
    # 退款表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refunds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant TEXT NOT NULL,
            amount REAL DEFAULT 0,
            reason TEXT DEFAULT '',
            time TEXT,
            status TEXT DEFAULT 'pending'
        )
    """)
    
    # 发票表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant TEXT NOT NULL,
            type TEXT DEFAULT '普票',
            amount REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            apply_time TEXT
        )
    """)
    
    # 服务商表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            scope TEXT DEFAULT '',
            region TEXT DEFAULT '',
            qualification TEXT DEFAULT '审核中',
            merchants INTEGER DEFAULT 0
        )
    """)
    
    # 跟访记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visit_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant TEXT NOT NULL,
            salesman TEXT DEFAULT '',
            type TEXT DEFAULT '电话回访',
            content TEXT DEFAULT '',
            time TEXT,
            next_visit TEXT
        )
    """)
    
    # 渠道分析表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS channel_analysis (
            channel TEXT PRIMARY KEY,
            leads INTEGER DEFAULT 0,
            converted INTEGER DEFAULT 0,
            rate REAL DEFAULT 0,
            cost REAL DEFAULT 0
        )
    """)
    
    # 合作伙伴表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            cooperation_time TEXT,
            merchants INTEGER DEFAULT 0
        )
    """)
    
    # FAQ表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS faq (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT DEFAULT '',
            question TEXT DEFAULT '',
            answer TEXT DEFAULT '',
            status TEXT DEFAULT 'published'
        )
    """)
    
    # 功能开关表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feature_flags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'disabled',
            scope TEXT DEFAULT 'all',
            update_time TEXT
        )
    """)
    
    # 需求池表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requirements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            merchant TEXT DEFAULT '',
            votes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'evaluating'
        )
    """)
    
    # 版本管理表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS versions (
            version TEXT PRIMARY KEY,
            status TEXT DEFAULT 'released',
            release_time TEXT,
            changes TEXT DEFAULT ''
        )
    """)
    
    # 登录日志表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT DEFAULT '',
            type TEXT DEFAULT '',
            location TEXT DEFAULT '',
            device TEXT DEFAULT '',
            time TEXT,
            status TEXT DEFAULT 'success'
        )
    """)
    
    # 定价表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pricing (
            version TEXT PRIMARY KEY,
            price REAL DEFAULT 0,
            original_price REAL DEFAULT 0,
            period TEXT DEFAULT '年付',
            features TEXT DEFAULT '[]'
        )
    """)
    
    # 支付通道表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payment_channels (
            name TEXT PRIMARY KEY,
            status TEXT DEFAULT 'online',
            success_rate REAL DEFAULT 99.0,
            avg_time INTEGER DEFAULT 0,
            today_volume REAL DEFAULT 0
        )
    """)
    
    # 结算记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settlement_records (
            agent TEXT PRIMARY KEY,
            month TEXT,
            payable REAL DEFAULT 0,
            actual REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            settle_time TEXT
        )
    """)
    
    # 客户分配表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customer_assigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            customer_name TEXT,
            current_owner TEXT,
            new_owner TEXT,
            assign_time TEXT
        )
    """)
    
    db.commit()
    return db


def execute_query(query: str, params: tuple = ()) -> List[Dict]:
    """执行查询并返回结果"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def execute_insert(query: str, params: tuple = ()) -> int:
    """执行插入并返回ID"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    return cursor.lastrowid


def execute_update(query: str, params: tuple = ()) -> int:
    """执行更新并返回影响的行数"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    return cursor.rowcount


def execute_delete(query: str, params: tuple = ()) -> int:
    """执行删除并返回影响的行数"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    return cursor.rowcount
