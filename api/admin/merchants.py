"""
店赢OS管理后台API - 商家管理
"""
from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter(tags=["商户管理"])


class MerchantResponse(BaseModel):
    """商户响应模型"""
    id: int = Field(..., description="商户ID", example=1001)
    name: str = Field(..., description="商户名称", example="粤式茶餐厅")
    industry: str = Field(..., description="行业分类", example="餐饮")
    version: str = Field(..., description="版本", example="专业版")
    status: str = Field(..., description="状态", example="active")
    register_time: str = Field(..., description="注册时间", example="2024-01-15")
    expire_time: str = Field(..., description="到期时间", example="2025-01-15")
    gmv: float = Field(..., description="累计GMV", example=568000.00)
    orders: int = Field(..., description="累计订单数", example=12580)
    rating: float = Field(..., description="评分", example=4.8)
    ai_usage: int = Field(..., description="AI使用次数", example=2560)
    phone: str = Field(..., description="联系电话", example="13800138000")
    contact: str = Field(..., description="联系人", example="张经理")
    address: str = Field(..., description="地址", example="广州市天河区珠江新城")


class MerchantCreate(BaseModel):
    """创建商户请求模型"""
    name: str = Field(..., description="商户名称(必填)", example="新开茶餐厅")
    industry: str = Field("餐饮", description="行业分类", example="餐饮")
    version: str = Field("免费版", description="版本", example="免费版")
    phone: str = Field("", description="联系电话", example="13900139000")
    contact: str = Field("", description="联系人", example="李老板")
    address: str = Field("", description="地址", example="深圳市南山区")


class MerchantUpdate(BaseModel):
    """更新商户请求模型"""
    name: Optional[str] = Field(None, description="商户名称", example="更新后的名称")
    industry: Optional[str] = Field(None, description="行业分类", example="零售")
    version: Optional[str] = Field(None, description="版本", example="旗舰版")
    status: Optional[str] = Field(None, description="状态", example="active")


class AuditRequest(BaseModel):
    """商户审核请求模型"""
    merchant_id: int = Field(..., description="商户ID", example=1001)
    approve: bool = Field(..., description="是否通过审核", example=True)
    reason: Optional[str] = Field("", description="审核说明", example="资质齐全，审核通过")


class MerchantListResponse(BaseModel):
    """商户列表响应模型"""
    items: List[MerchantResponse]
    total: int = Field(..., description="总数", example=286)
    page: int = Field(..., description="当前页", example=1)
    size: int = Field(..., description="每页条数", example=20)
    pages: int = Field(..., description="总页数", example=15)


class MerchantStatsResponse(BaseModel):
    """商户统计响应模型"""
    total: int = Field(..., description="商户总数", example=286)
    active: int = Field(..., description="活跃商户数", example=258)
    expiring: int = Field(..., description="即将到期数", example=18)
    inactive: int = Field(..., description="非活跃数", example=10)


class PermissionResponse(BaseModel):
    """商户权限响应模型"""
    merchant_id: int = Field(..., description="商户ID", example=1001)
    version: str = Field(..., description="版本", example="专业版")
    permissions: List[str] = Field(..., description="权限列表", example=["basic_ai", "basic_stats", "marketing"])


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/",
    summary="获取商户列表",
    description="分页获取商户列表，支持按状态、行业、版本、关键词筛选",
    response_model=MerchantListResponse,
    responses={
        200: {"description": "成功获取商户列表"},
        500: {"description": "服务器内部错误"}
    }
)
async def list_merchants(
    page: int = Query(1, ge=1, description="页码", example=1),
    size: int = Query(20, ge=1, le=100, description="每页条数", example=20),
    status: Optional[str] = Query(None, description="商户状态", example="active"),
    industry: Optional[str] = Query(None, description="行业分类", example="餐饮"),
    version: Optional[str] = Query(None, description="版本", example="专业版"),
    keyword: Optional[str] = Query(None, description="搜索关键词(匹配名称/联系人)", example="粤式")
):
    """
    获取商户列表
    
    **功能说明：**
    - 支持分页查询
    - 支持多条件筛选：状态、行业、版本
    - 支持关键词模糊搜索商户名称或联系人
    
    **状态枚举：**
    - `pending`: 待审核
    - `active`: 正常
    - `expiring`: 即将到期
    - `inactive`: 已停用
    - `rejected`: 审核拒绝
    
    **行业枚举：**
    - 餐饮、零售、休娱、医疗、教育、服务等
    """
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if industry:
        where_clauses.append("industry = ?")
        params.append(industry)
    if version:
        where_clauses.append("version = ?")
        params.append(version)
    if keyword:
        where_clauses.append("(name LIKE ? OR contact LIKE ?)")
        params.append(f"%{keyword}%")
        params.append(f"%{keyword}%")
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    
    # 获取总数
    total = execute_query(f"SELECT COUNT(*) as cnt FROM merchants WHERE {where_sql}", tuple(params))[0]["cnt"]
    
    # 获取列表
    params.extend([size, offset])
    merchants = execute_query(
        f"SELECT * FROM merchants WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?",
        tuple(params)
    )
    
    return api_response({
        "items": merchants,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    })


@router.get("/stats",
    summary="获取商户统计",
    description="获取平台商户统计信息，包括总数、活跃数、即将到期数等",
    response_model=MerchantStatsResponse,
    responses={
        200: {"description": "成功获取统计数据"}
    }
)
async def get_merchant_stats():
    """
    获取商户统计
    
    **返回指标：**
    - `total`: 商户总数
    - `active`: 活跃商户数(状态为active)
    - `expiring`: 即将到期商户数
    - `inactive`: 非活跃商户数
    """
    total = execute_query("SELECT COUNT(*) as cnt FROM merchants")[0]["cnt"]
    active = execute_query("SELECT COUNT(*) as cnt FROM merchants WHERE status='active'")[0]["cnt"]
    expiring = execute_query("SELECT COUNT(*) as cnt FROM merchants WHERE status='expiring'")[0]["cnt"]
    inactive = execute_query("SELECT COUNT(*) as cnt FROM merchants WHERE status='inactive'")[0]["cnt"]
    
    return api_response({
        "total": total,
        "active": active,
        "expiring": expiring,
        "inactive": inactive
    })


@router.get("/{merchant_id}",
    summary="获取商户详情",
    description="根据商户ID获取商户详细信息",
    response_model=MerchantResponse,
    responses={
        200: {"description": "成功获取商户详情"},
        404: {"description": "商户不存在"}
    }
)
async def get_merchant(
    merchant_id: int = Path(..., description="商户ID", example=1001)
):
    """
    获取商户详情
    
    **路径参数：**
    - `merchant_id`: 商户唯一标识ID
    
    **返回字段：**
    - 基本信息：名称、行业、版本、状态
    - 时间信息：注册时间、到期时间
    - 经营数据：GMV、订单数、评分、AI使用次数
    - 联系信息：电话、联系人、地址
    """
    merchants = execute_query("SELECT * FROM merchants WHERE id = ?", (merchant_id,))
    if not merchants:
        raise HTTPException(status_code=404, detail="商家不存在")
    return api_response(merchants[0])


@router.post("/",
    summary="创建商户",
    description="创建新商户，商户初始状态为pending(待审核)",
    response_model=MerchantResponse,
    responses={
        200: {"description": "创建成功，返回商户ID"},
        400: {"description": "请求参数错误"}
    }
)
async def create_merchant(
    merchant: MerchantCreate = ...
):
    """
    创建商户
    
    **请求体参数：**
    - `name`: 商户名称(必填)
    - `industry`: 行业分类，默认"餐饮"
    - `version`: 版本，默认"免费版"
    - `phone`: 联系电话
    - `contact`: 联系人
    - `address`: 地址
    
    **业务规则：**
    - 创建后商户状态为pending，需审核后才能active
    - 注册时间和到期时间默认为当天
    """
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    expire = datetime.now().strftime("%Y-%m-%d")
    
    cursor = execute_insert("""
        INSERT INTO merchants (name, industry, version, phone, contact, address, register_time, expire_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (merchant.name, merchant.industry, merchant.version, merchant.phone, merchant.contact, merchant.address, now, expire))
    
    return api_response({"id": cursor}, "商家创建成功")


@router.put("/{merchant_id}",
    summary="更新商户信息",
    description="更新指定商户的基本信息",
    responses={
        200: {"description": "更新成功"},
        400: {"description": "没有需要更新的字段"},
        404: {"description": "商户不存在"}
    }
)
async def update_merchant(
    merchant_id: int = Path(..., description="商户ID", example=1001),
    merchant: MerchantUpdate = ...
):
    """
    更新商户信息
    
    **可更新字段：**
    - `name`: 商户名称
    - `industry`: 行业分类
    - `version`: 版本(会同步更新权限)
    - `status`: 状态
    
    **说明：**
    - 所有字段均为可选，只更新提供的字段
    - 版本变更会同步更新商户权限
    """
    updates = []
    params = []
    
    if merchant.name is not None:
        updates.append("name = ?")
        params.append(merchant.name)
    if merchant.industry is not None:
        updates.append("industry = ?")
        params.append(merchant.industry)
    if merchant.version is not None:
        updates.append("version = ?")
        params.append(merchant.version)
    if merchant.status is not None:
        updates.append("status = ?")
        params.append(merchant.status)
    
    if not updates:
        raise HTTPException(status_code=400, detail="没有需要更新的字段")
    
    params.append(merchant_id)
    execute_update(f"UPDATE merchants SET {', '.join(updates)} WHERE id = ?", tuple(params))
    
    return api_response(None, "商家信息更新成功")


@router.delete("/{merchant_id}",
    summary="删除商户",
    description="删除指定商户(谨慎操作)",
    responses={
        200: {"description": "删除成功"},
        404: {"description": "商户不存在"}
    }
)
async def delete_merchant(
    merchant_id: int = Path(..., description="商户ID", example=1001)
):
    """
    删除商户
    
    **警告：此操作不可恢复！**
    - 将永久删除商户及其所有关联数据
    - 建议先进行数据备份
    """
    execute_delete("DELETE FROM merchants WHERE id = ?", (merchant_id,))
    return api_response(None, "商家删除成功")


@router.post("/audit",
    summary="审核商户",
    description="对pending状态的商户进行审核，通过后状态变为active，拒绝则变为rejected",
    responses={
        200: {"description": "审核完成"},
        404: {"description": "商户不存在"}
    }
)
async def audit_merchant(
    req: AuditRequest = ...
):
    """
    审核商户
    
    **请求参数：**
    - `merchant_id`: 待审核的商户ID
    - `approve`: 是否通过审核
    - `reason`: 审核说明(可选)
    
    **业务规则：**
    - `approve=true`: 状态变为active
    - `approve=false`: 状态变为rejected
    """
    status = "active" if req.approve else "rejected"
    execute_update("UPDATE merchants SET status = ? WHERE id = ?", (status, req.merchant_id))
    return api_response(None, "审核完成")


@router.post("/upgrade",
    summary="升级商户版本",
    description="将商户版本升级为指定版本，同步更新权限",
    responses={
        200: {"description": "升级成功"}
    }
)
async def upgrade_merchant(
    merchant_id: int = Path(..., description="商户ID", example=1001),
    version: str = Query(..., description="目标版本", example="旗舰版")
):
    """
    升级商户版本
    
    **版本等级：**
    免费版 → 专业版 → 旗舰版
    
    **版本权限差异：**
    - 免费版：基础AI功能、基础统计
    - 专业版：+营销工具、优先客服
    - 旗舰版：全部功能
    """
    execute_update("UPDATE merchants SET version = ? WHERE id = ?", (version, merchant_id))
    return api_response(None, "版本升级成功")


@router.get("/{merchant_id}/permission",
    summary="获取商户权限配置",
    description="获取指定商户的权限列表",
    response_model=PermissionResponse,
    responses={
        200: {"description": "成功获取权限配置"},
        404: {"description": "商户不存在"}
    }
)
async def get_merchant_permission(
    merchant_id: int = Path(..., description="商户ID", example=1001)
):
    """
    获取商户权限配置
    
    **权限说明：**
    - `basic_ai`: 基础AI功能
    - `basic_stats`: 基础统计分析
    - `marketing`: 营销工具
    - `priority_support`: 优先客服支持
    - `all`: 全部功能(旗舰版)
    """
    merchants = execute_query("SELECT version FROM merchants WHERE id = ?", (merchant_id,))
    if not merchants:
        raise HTTPException(status_code=404, detail="商家不存在")
    
    version = merchants[0]["version"]
    permissions = {
        "免费版": ["basic_ai", "basic_stats"],
        "专业版": ["basic_ai", "basic_stats", "marketing", "priority_support"],
        "旗舰版": ["all"]
    }
    
    return api_response({
        "merchant_id": merchant_id,
        "version": version,
        "permissions": permissions.get(version, ["basic_ai"])
    })


@router.put("/{merchant_id}/permission",
    summary="更新商户权限",
    description="通过更新版本号来调整商户权限",
    responses={
        200: {"description": "权限更新成功"}
    }
)
async def update_merchant_permission(
    merchant_id: int = Path(..., description="商户ID", example=1001),
    version: str = Query(..., description="目标版本", example="旗舰版")
):
    """
    更新商户版本/权限
    
    **操作说明：**
    - 修改商户版本会同步更新其权限范围
    - 高版本包含低版本的全部权限
    """
    execute_update("UPDATE merchants SET version = ? WHERE id = ?", (version, merchant_id))
    return api_response(None, "权限配置更新成功")
