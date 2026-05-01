"""
店赢OS管理后台API - 业务人员
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


class SalesCreate(BaseModel):
    name: str
    phone: str = ""
    region: str = ""


class CustomerAssign(BaseModel):
    customer_id: int
    new_owner: str


@router.get("/")
async def list_sales(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    region: Optional[str] = None
):
    """获取业务员列表"""
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if region:
        where_clauses.append("region = ?")
        params.append(region)
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    total = execute_query(f"SELECT COUNT(*) as cnt FROM sales WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    sales = execute_query(f"SELECT * FROM sales WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({"items": sales, "total": total, "page": page, "size": size})


@router.get("/stats")
async def get_sales_stats():
    """获取业务员统计"""
    total = execute_query("SELECT COUNT(*) as cnt FROM sales")[0]["cnt"]
    active = execute_query("SELECT COUNT(*) as cnt FROM sales WHERE status='active'")[0]["cnt"]
    total_customers = execute_query("SELECT SUM(customers) as sum FROM sales")[0]["sum"] or 0
    
    return api_response({"total": total, "active": active, "total_customers": total_customers})


@router.get("/{sales_id}")
async def get_sales(sales_id: int):
    """获取业务员详情"""
    sales_list = execute_query("SELECT * FROM sales WHERE id = ?", (sales_id,))
    if not sales_list:
        raise HTTPException(status_code=404, detail="业务员不存在")
    return api_response(sales_list[0])


@router.post("/")
async def create_sales(sales: SalesCreate):
    """创建业务员"""
    cursor = execute_insert("""
        INSERT INTO sales (name, phone, region, status)
        VALUES (?, ?, ?, 'active')
    """, (sales.name, sales.phone, sales.region))
    return api_response({"id": cursor}, "业务员创建成功")


@router.put("/{sales_id}")
async def update_sales(sales_id: int, sales: SalesCreate):
    """更新业务员信息"""
    execute_update(
        "UPDATE sales SET name = ?, phone = ?, region = ? WHERE id = ?",
        (sales.name, sales.phone, sales.region, sales_id)
    )
    return api_response(None, "业务员信息更新成功")


@router.delete("/{sales_id}")
async def delete_sales(sales_id: int):
    """删除业务员"""
    execute_delete("DELETE FROM sales WHERE id = ?", (sales_id,))
    return api_response(None, "业务员删除成功")


@router.get("/customers/assign")
async def list_customer_assigns(page: int = 1, size: int = 20):
    """获取客户分配列表"""
    offset = (page - 1) * size
    assigns = execute_query("SELECT * FROM customer_assigns ORDER BY id DESC LIMIT ? OFFSET ?", (size, offset))
    return api_response({"items": assigns})


@router.post("/customers/assign")
async def assign_customer(req: CustomerAssign):
    """分配客户"""
    merchants = execute_query("SELECT name FROM merchants WHERE id = ?", (req.customer_id,))
    if not merchants:
        raise HTTPException(status_code=404, detail="客户不存在")
    
    cursor = execute_insert("""
        INSERT INTO customer_assigns (customer_id, customer_name, current_owner, new_owner, assign_time)
        VALUES (?, ?, '', ?, datetime('now'))
    """, (req.customer_id, merchants[0]["name"], req.new_owner))
    
    return api_response({"id": cursor}, "客户分配成功")


@router.get("/performance")
async def get_sales_performance(
    month: Optional[str] = Query(None, description="月份，如2024-12")
):
    """获取业务员业绩"""
    sales = execute_query("SELECT * FROM sales WHERE status='active' ORDER BY this_month_sign DESC")
    return api_response({
        "month": month or "2024-12",
        "sales": sales,
        "total_signs": sum(s["this_month_sign"] for s in sales)
    })


@router.get("/visits")
async def list_visit_records(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    salesman: Optional[str] = None
):
    """获取跟访记录"""
    offset = (page - 1) * size
    where_sql = "salesman = ?" if salesman else "1=1"
    params = (salesman,) if salesman else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM visit_records WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    records = execute_query(f"SELECT * FROM visit_records WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": records, "total": total})


@router.post("/visits")
async def create_visit_record(
    merchant: str,
    salesman: str,
    visit_type: str = "电话回访",
    content: str = "",
    next_visit: Optional[str] = None
):
    """创建跟访记录"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    cursor = execute_insert("""
        INSERT INTO visit_records (merchant, salesman, type, content, time, next_visit)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (merchant, salesman, visit_type, content, now, next_visit))
    return api_response({"id": cursor}, "跟访记录创建成功")
