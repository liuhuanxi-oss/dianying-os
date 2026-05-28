"""
店赢OS管理后台API - 产品迭代
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update

router = APIRouter(tags=["产品迭代"])


class FeatureFlag(BaseModel):
    """功能开关"""
    id: int
    name: str
    key: str
    status: str
    description: str
    update_time: str


class ABTest(BaseModel):
    """AB测试"""
    id: int
    name: str
    variant: str
    traffic: int
    conversion: int
    status: str


class Requirement(BaseModel):
    """需求"""
    id: int
    title: str
    description: str
    status: str
    votes: int
    priority: str


class Version(BaseModel):
    """版本"""
    id: int
    version: str
    release_time: str
    features: list
    status: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/feature-flags",
    summary="获取功能开关列表",
    description="分页获取功能开关列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_feature_flags(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="状态")
):
    """
    获取功能开关列表
    
    **功能开关状态：**
    - enabled: 已启用
    - disabled: 已禁用
    - beta: Beta测试
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM feature_flags WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    flags = execute_query(f"SELECT * FROM feature_flags WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": flags, "total": total})


@router.put("/feature-flags/{flag_id}",
    summary="更新功能开关",
    description="更新功能开关状态",
    responses={200: {"description": "更新成功"}}
)
async def update_feature_flag(
    flag_id: int = Path(..., description="开关ID"),
    status: str = Query(..., description="目标状态")
):
    """
    更新功能开关
    
    **状态值：**
    - enabled: 启用
    - disabled: 禁用
    - beta: Beta测试
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    execute_update(
        "UPDATE feature_flags SET status = ?, update_time = ? WHERE id = ?",
        (status, now, flag_id)
    )
    return api_response(None, "功能开关已更新")


@router.get("/ab-test",
    summary="获取AB测试列表",
    description="分页获取AB测试列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_ab_tests(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取AB测试列表
    
    **测试状态：**
    - running: 进行中
    - completed: 已完成
    - paused: 已暂停
    """
    tests = [
        {"id": 1, "name": "新首页布局", "variant": "A", "traffic": 5000, "conversion": 280, "status": "running"},
        {"id": 2, "name": "价格展示方式", "variant": "B", "traffic": 3000, "conversion": 195, "status": "completed"},
        {"id": 3, "name": "CTA按钮颜色", "variant": "A", "traffic": 4500, "conversion": 315, "status": "running"},
    ]
    return api_response({"items": tests})


@router.post("/ab-test",
    summary="创建AB测试",
    description="创建新的AB测试",
    responses={200: {"description": "创建成功"}}
)
async def create_ab_test(
    name: str = Query(..., description="测试名称"),
    description: str = Query("", description="测试描述")
):
    """创建AB测试"""
    return api_response({"id": 1}, "AB测试创建成功")


@router.get("/requirements",
    summary="获取需求池列表",
    description="分页获取需求池列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_requirements(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="状态")
):
    """
    获取需求池列表
    
    **需求状态：**
    - submitted: 已提交
    - reviewing: 评审中
    - approved: 已采纳
    - rejected: 已拒绝
    - planned: 已规划
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM requirements WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    requirements = execute_query(f"SELECT * FROM requirements WHERE {where_sql} ORDER BY votes DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": requirements, "total": total})


@router.post("/requirements/{req_id}/vote",
    summary="投票需求",
    description="为需求投票",
    responses={200: {"description": "投票成功"}}
)
async def vote_requirement(
    req_id: int = Path(..., description="需求ID")
):
    """投票需求"""
    execute_update("UPDATE requirements SET votes = votes + 1 WHERE id = ?", (req_id,))
    return api_response(None, "投票成功")


@router.get("/versions",
    summary="获取版本列表",
    description="分页获取版本发布列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_versions(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取版本列表
    
    **返回信息：**
    - 版本号
    - 发布时间
    - 更新内容
    - 发布状态
    """
    offset = (page - 1) * size
    versions = execute_query("SELECT * FROM versions ORDER BY release_time DESC LIMIT ? OFFSET ?", (size, offset))
    return api_response({"items": versions})
