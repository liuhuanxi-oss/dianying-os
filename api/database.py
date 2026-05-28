"""
店赢OS管理后台API - 数据库管理 (MySQL)
"""
import pymysql
import pymysql.cursors
import os
from typing import List, Dict

# MySQL 配置从环境变量读取
MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", "3306"))
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "dyos_admin")

_db_connection = None


def get_db():
    """获取数据库连接（自动重连）"""
    global _db_connection
    try:
        if _db_connection is None:
            _db_connection = _create_connection()
        else:
            _db_connection.ping(reconnect=True)
        return _db_connection
    except Exception:
        _db_connection = _create_connection()
        return _db_connection


def _create_connection():
    """创建新的 MySQL 连接"""
    conn = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=10,
        read_timeout=30,
        write_timeout=30,
    )
    return conn


def close_db():
    """关闭数据库连接"""
    global _db_connection
    if _db_connection is not None:
        try:
            _db_connection.close()
        except Exception:
            pass
        _db_connection = None


def _convert_query(query: str) -> str:
    """将 SQLite 的 ? 占位符转换为 pymysql 的 %s"""
    return query.replace("?", "%s")


def init_db():
    """初始化数据库和表"""
    # 先尝试连接（不指定数据库），创建数据库
    try:
        tmp_conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            charset='utf8mb4',
            autocommit=True,
        )
        with tmp_conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                f"DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        tmp_conn.close()
    except Exception as e:
        print(f"创建数据库失败: {e}")

    db = get_db()
    cursor = db.cursor()

    # 商家表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchants (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            industry VARCHAR(50) DEFAULT '餐饮',
            version VARCHAR(50) DEFAULT '免费版',
            status VARCHAR(50) DEFAULT 'active',
            register_time VARCHAR(50),
            expire_time VARCHAR(50),
            gmv DOUBLE DEFAULT 0,
            orders INT DEFAULT 0,
            rating DOUBLE DEFAULT 0,
            ai_usage INT DEFAULT 0,
            phone VARCHAR(30) DEFAULT '',
            contact VARCHAR(50) DEFAULT '',
            address VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 代理商表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            level VARCHAR(50) DEFAULT 'silver',
            merchants INT DEFAULT 0,
            monthly_gmv DOUBLE DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active',
            join_time VARCHAR(50),
            contact VARCHAR(50) DEFAULT '',
            region VARCHAR(50) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 业务员表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(30) DEFAULT '',
            region VARCHAR(50) DEFAULT '',
            status VARCHAR(50) DEFAULT 'active',
            customers INT DEFAULT 0,
            this_month_sign INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 交易流水表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            merchant VARCHAR(200) NOT NULL,
            amount DOUBLE DEFAULT 0,
            type VARCHAR(50) DEFAULT 'subscription',
            status VARCHAR(50) DEFAULT 'success',
            time VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 工单表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id VARCHAR(50) PRIMARY KEY,
            merchant VARCHAR(200) NOT NULL,
            type VARCHAR(50) DEFAULT '',
            title VARCHAR(500) DEFAULT '',
            status VARCHAR(50) DEFAULT 'open',
            priority VARCHAR(50) DEFAULT 'medium',
            create_time VARCHAR(50),
            assignee VARCHAR(100) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 公告表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            content TEXT DEFAULT '',
            scope VARCHAR(50) DEFAULT 'all',
            status VARCHAR(50) DEFAULT 'published',
            create_time VARCHAR(50),
            views INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 知识库表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            category VARCHAR(50) DEFAULT 'catering',
            status VARCHAR(50) DEFAULT 'published',
            update_time VARCHAR(50),
            views INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # AI模板表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_templates (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) DEFAULT '',
            category VARCHAR(50) DEFAULT '',
            status VARCHAR(50) DEFAULT 'published'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 运营活动表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            type VARCHAR(50) DEFAULT '',
            start_time VARCHAR(50),
            end_time VARCHAR(50),
            status VARCHAR(50) DEFAULT 'draft'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 流失预警表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS churn_warning (
            id INT PRIMARY KEY AUTO_INCREMENT,
            merchant VARCHAR(200) NOT NULL,
            risk_level VARCHAR(50) DEFAULT 'low',
            probability INT DEFAULT 0,
            last_active VARCHAR(50),
            reason TEXT DEFAULT '',
            suggestion TEXT DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 角色表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            level VARCHAR(50) DEFAULT '',
            permissions TEXT DEFAULT '[]',
            users INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 操作日志表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operation_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            operator VARCHAR(100) DEFAULT '',
            type VARCHAR(50) DEFAULT '',
            object VARCHAR(500) DEFAULT '',
            action VARCHAR(500) DEFAULT '',
            time VARCHAR(50),
            ip VARCHAR(50) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 退款表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refunds (
            id INT PRIMARY KEY AUTO_INCREMENT,
            merchant VARCHAR(200) NOT NULL,
            amount DOUBLE DEFAULT 0,
            reason TEXT DEFAULT '',
            time VARCHAR(50),
            status VARCHAR(50) DEFAULT 'pending'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 发票表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INT PRIMARY KEY AUTO_INCREMENT,
            merchant VARCHAR(200) NOT NULL,
            type VARCHAR(50) DEFAULT '普票',
            amount DOUBLE DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            apply_time VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 服务商表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_providers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            scope VARCHAR(100) DEFAULT '',
            region VARCHAR(50) DEFAULT '',
            qualification VARCHAR(50) DEFAULT '审核中',
            merchants INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 跟访记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visit_records (
            id INT PRIMARY KEY AUTO_INCREMENT,
            merchant VARCHAR(200) NOT NULL,
            salesman VARCHAR(100) DEFAULT '',
            type VARCHAR(50) DEFAULT '电话回访',
            content TEXT DEFAULT '',
            time VARCHAR(50),
            next_visit VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 渠道分析表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS channel_analysis (
            channel VARCHAR(100) PRIMARY KEY,
            leads INT DEFAULT 0,
            converted INT DEFAULT 0,
            rate DOUBLE DEFAULT 0,
            cost DOUBLE DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 合作伙伴表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS partners (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) DEFAULT '',
            status VARCHAR(50) DEFAULT 'active',
            cooperation_time VARCHAR(50),
            merchants INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # FAQ表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS faq (
            id INT PRIMARY KEY AUTO_INCREMENT,
            category VARCHAR(50) DEFAULT '',
            question TEXT DEFAULT '',
            answer TEXT DEFAULT '',
            status VARCHAR(50) DEFAULT 'published'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 功能开关表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feature_flags (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            status VARCHAR(50) DEFAULT 'disabled',
            scope VARCHAR(50) DEFAULT 'all',
            update_time VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 需求池表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requirements (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(500) NOT NULL,
            merchant VARCHAR(200) DEFAULT '',
            votes INT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'evaluating'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 版本管理表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS versions (
            version VARCHAR(50) PRIMARY KEY,
            status VARCHAR(50) DEFAULT 'released',
            release_time VARCHAR(50),
            changes TEXT DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 登录日志表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user VARCHAR(100) DEFAULT '',
            type VARCHAR(50) DEFAULT '',
            location VARCHAR(100) DEFAULT '',
            device VARCHAR(200) DEFAULT '',
            time VARCHAR(50),
            status VARCHAR(50) DEFAULT 'success'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 定价表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pricing (
            version VARCHAR(50) PRIMARY KEY,
            price DOUBLE DEFAULT 0,
            original_price DOUBLE DEFAULT 0,
            period VARCHAR(50) DEFAULT '年付',
            features TEXT DEFAULT '[]'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 支付通道表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payment_channels (
            name VARCHAR(100) PRIMARY KEY,
            status VARCHAR(50) DEFAULT 'online',
            success_rate DOUBLE DEFAULT 99.0,
            avg_time INT DEFAULT 0,
            today_volume DOUBLE DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 结算记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settlement_records (
            agent VARCHAR(200) PRIMARY KEY,
            month VARCHAR(50),
            payable DOUBLE DEFAULT 0,
            actual DOUBLE DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            settle_time VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    # 客户分配表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customer_assigns (
            id INT PRIMARY KEY AUTO_INCREMENT,
            customer_id INT,
            customer_name VARCHAR(200),
            current_owner VARCHAR(100),
            new_owner VARCHAR(100),
            assign_time VARCHAR(50)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)

    db.commit()
    return db


def execute_query(query: str, params: tuple = ()) -> List[Dict]:
    """执行查询并返回结果"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(_convert_query(query), params)
    rows = cursor.fetchall()
    return rows


def execute_insert(query: str, params: tuple = ()) -> int:
    """执行插入并返回ID"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(_convert_query(query), params)
    db.commit()
    return cursor.lastrowid


def execute_update(query: str, params: tuple = ()) -> int:
    """执行更新并返回影响的行数"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(_convert_query(query), params)
    db.commit()
    return cursor.rowcount


def execute_delete(query: str, params: tuple = ()) -> int:
    """执行删除并返回影响的行数"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(_convert_query(query), params)
    db.commit()
    return cursor.rowcount
