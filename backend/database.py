# -*- coding: utf-8 -*-
"""
数据库连接模块
提供SQLAlchemy引擎和session管理
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
import config

# 创建引擎
engine = create_engine(
    config.DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite需要
    echo=False  # 设置为True可查看SQL日志
)

# 创建Session工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    获取数据库会话的依赖项
    用于FastAPI的Depends注入
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    获取数据库会话的上下文管理器
    用于非FastAPI环境（如初始化脚本）
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_database():
    """
    初始化数据库
    创建所有表
    """
    from models import Base
    Base.metadata.create_all(bind=engine)
    print("数据库表创建成功")


def drop_database():
    """
    删除所有表（慎用）
    """
    from models import Base
    Base.metadata.drop_all(bind=engine)
    print("数据库表已删除")
