"""
店赢OS管理后台API - 商家管理
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter()


class MerchantResponse(BaseModel):
    id: int
    name: str
    industry: str
    version: str
    status: str
    register_time: str
    expire_time: str
    gmv: float
    orders: int
    rating: float
    ai_usage: int
    phone: str
    contact: str
    address: str


class MerchantCreate(BaseModel):
    name: str
    industry: str = "餐饮"
    version: str = "免费版"
    phone: str = ""
    contact: str = ""
    address: str = ""


class MerchantUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None


class AuditRequest(BaseModel):
    merchant_id: int
    approve: bool
    reason: Optional[str] = ""


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/")
async def list_merchants(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    industry: Optional[str] = None,
    version: Optional[str] = None,
    keyword: Optional[str] = None
):
    """获取商家列表"""
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


@router.get("/stats")
async def get_merchant_stats():
    """获取商家统计"""
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


@router.get("/{merchant_id}")
async def get_merchant(merchant_id: int):
    """获取商家详情"""
    merchants = execute_query("SELECT * FROM merchants WHERE id = ?", (merchant_id,))
    if not merchants:
        raise HTTPException(status_code=404, detail="商家不存在")
    return api_response(merchants[0])


@router.post("/")
async def create_merchant(merchant: MerchantCreate):
    """创建商家"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    expire = datetime.now().strftime("%Y-%m-%d")
    
    cursor = execute_insert("""
        INSERT INTO merchants (name, industry, version, phone, contact, address, register_time, expire_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    """, (merchant.name, merchant.industry, merchant.version, merchant.phone, merchant.contact, merchant.address, now, expire))
    
    return api_response({"id": cursor}, "商家创建成功")


@router.put("/{merchant_id}")
async def update_merchant(merchant_id: int, merchant: MerchantUpdate):
    """更新商家信息"""
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


@router.delete("/{merchant_id}")
async def delete_merchant(merchant_id: int):
    """删除商家"""
    execute_delete("DELETE FROM merchants WHERE id = ?", (merchant_id,))
    return api_response(None, "商家删除成功")


@router.post("/audit")
async def audit_merchant(req: AuditRequest):
    """审核商家"""
    status = "active" if req.approve else "rejected"
    execute_update("UPDATE merchants SET status = ? WHERE id = ?", (status, req.merchant_id))
    return api_response(None, "审核完成")


@router.post("/upgrade")
async def upgrade_merchant(merchant_id: int, version: str):
    """升级商家版本"""
    execute_update("UPDATE merchants SET version = ? WHERE id = ?", (version, merchant_id))
    return api_response(None, "版本升级成功")


@router.get("/{merchant_id}/permission")
async def get_merchant_permission(merchant_id: int):
    """获取商家权限配置"""
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


@router.put("/{merchant_id}/permission")
async def update_merchant_permission(merchant_id: int, version: str):
    """更新商家版本/权限"""
    execute_update("UPDATE merchants SET version = ? WHERE id = ?", (version, merchant_id))
    return api_response(None, "权限配置更新成功")
