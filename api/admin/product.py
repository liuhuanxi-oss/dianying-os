"""
店赢OS管理后台API - 产品迭代
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from database import execute_query, execute_insert, execute_update

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/feature-flags")
async def list_feature_flags(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取功能开关列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM feature_flags WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    flags = execute_query(f"SELECT * FROM feature_flags WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": flags, "total": total})


@router.put("/feature-flags/{flag_id}")
async def update_feature_flag(flag_id: int, status: str):
    """更新功能开关"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    execute_update(
        "UPDATE feature_flags SET status = ?, update_time = ? WHERE id = ?",
        (status, now, flag_id)
    )
    return api_response(None, "功能开关已更新")


@router.get("/ab-test")
async def list_ab_tests(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取AB测试列表"""
    # 模拟AB测试数据
    tests = [
        {"id": 1, "name": "新首页布局", "variant": "A", "traffic": 5000, "conversion": 280, "status": "running"},
        {"id": 2, "name": "价格展示方式", "variant": "B", "traffic": 3000, "conversion": 195, "status": "completed"},
        {"id": 3, "name": "CTA按钮颜色", "variant": "A", "traffic": 4500, "conversion": 315, "status": "running"},
    ]
    return api_response({"items": tests})


@router.post("/ab-test")
async def create_ab_test(name: str, description: str = ""):
    """创建AB测试"""
    return api_response({"id": 1}, "AB测试创建成功")


@router.get("/requirements")
async def list_requirements(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取需求池列表"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM requirements WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    requirements = execute_query(f"SELECT * FROM requirements WHERE {where_sql} ORDER BY votes DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": requirements, "total": total})


@router.post("/requirements/{req_id}/vote")
async def vote_requirement(req_id: int):
    """投票需求"""
    execute_update("UPDATE requirements SET votes = votes + 1 WHERE id = ?", (req_id,))
    return api_response(None, "投票成功")


@router.get("/versions")
async def list_versions(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取版本列表"""
    offset = (page - 1) * size
    versions = execute_query("SELECT * FROM versions ORDER BY release_time DESC LIMIT ? OFFSET ?", (size, offset))
    return api_response({"items": versions})
