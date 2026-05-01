"""
店赢OS管理后台API - 代理商体系
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pydantic import BaseModel
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


class AgentCreate(BaseModel):
    name: str
    level: str = "silver"
    region: str = ""
    contact: str = ""


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = None
    region: Optional[str] = None


@router.get("/")
async def list_agents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    level: Optional[str] = None,
    status: Optional[str] = None,
    keyword: Optional[str] = None
):
    """获取代理商列表"""
    offset = (page - 1) * size
    where_clauses = []
    params = []
    
    if level:
        where_clauses.append("level = ?")
        params.append(level)
    if status:
        where_clauses.append("status = ?")
        params.append(status)
    if keyword:
        where_clauses.append("name LIKE ?")
        params.append(f"%{keyword}%")
    
    where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM agents WHERE {where_sql}", tuple(params))[0]["cnt"]
    params.extend([size, offset])
    agents = execute_query(f"SELECT * FROM agents WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", tuple(params))
    
    return api_response({
        "items": agents,
        "total": total,
        "page": page,
        "size": size
    })


@router.get("/stats")
async def get_agent_stats():
    """获取代理商统计"""
    total = execute_query("SELECT COUNT(*) as cnt FROM agents")[0]["cnt"]
    total_merchants = execute_query("SELECT SUM(merchants) as sum FROM agents")[0]["sum"] or 0
    total_gmv = execute_query("SELECT SUM(monthly_gmv) as sum FROM agents")[0]["sum"] or 0
    
    return api_response({
        "total": total,
        "total_merchants": total_merchants,
        "total_gmv": total_gmv
    })


@router.get("/{agent_id}")
async def get_agent(agent_id: int):
    """获取代理商详情"""
    agents = execute_query("SELECT * FROM agents WHERE id = ?", (agent_id,))
    if not agents:
        raise HTTPException(status_code=404, detail="代理商不存在")
    return api_response(agents[0])


@router.get("/{agent_id}/merchants")
async def get_agent_merchants(agent_id: int, page: int = 1, size: int = 20):
    """获取代理商下级商家"""
    offset = (page - 1) * size
    merchants = execute_query(
        "SELECT * FROM merchants LIMIT ? OFFSET ?",
        (size, offset)
    )
    return api_response({"items": merchants})


@router.get("/{agent_id}/commission")
async def get_agent_commission(agent_id: int, month: Optional[str] = None):
    """获取代理商佣金分润"""
    agents = execute_query("SELECT * FROM agents WHERE id = ?", (agent_id,))
    if not agents:
        raise HTTPException(status_code=404, detail="代理商不存在")
    
    agent = agents[0]
    commissions = execute_query(
        "SELECT * FROM settlement_records WHERE agent = ?",
        (agent["name"],)
    )
    
    return api_response({
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "commissions": commissions
    })


@router.post("/")
async def create_agent(agent: AgentCreate):
    """创建代理商"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO agents (name, level, region, contact, join_time, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    """, (agent.name, agent.level, agent.region, agent.contact, now))
    return api_response({"id": cursor}, "代理商创建成功")


@router.put("/{agent_id}")
async def update_agent(agent_id: int, agent: AgentUpdate):
    """更新代理商信息"""
    updates = []
    params = []
    
    if agent.name is not None:
        updates.append("name = ?")
        params.append(agent.name)
    if agent.level is not None:
        updates.append("level = ?")
        params.append(agent.level)
    if agent.status is not None:
        updates.append("status = ?")
        params.append(agent.status)
    if agent.region is not None:
        updates.append("region = ?")
        params.append(agent.region)
    
    if updates:
        params.append(agent_id)
        execute_update(f"UPDATE agents SET {', '.join(updates)} WHERE id = ?", tuple(params))
    
    return api_response(None, "代理商信息更新成功")


@router.delete("/{agent_id}")
async def delete_agent(agent_id: int):
    """删除代理商"""
    execute_delete("DELETE FROM agents WHERE id = ?", (agent_id,))
    return api_response(None, "代理商删除成功")


@router.get("/service-providers/")
async def list_service_providers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    qualification: Optional[str] = None
):
    """获取服务商列表"""
    offset = (page - 1) * size
    where_sql = "qualification = ?" if qualification else "1=1"
    params = (qualification,) if qualification else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM service_providers WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    providers = execute_query(f"SELECT * FROM service_providers WHERE {where_sql} LIMIT ? OFFSET ?", params)
    
    return api_response({"items": providers, "total": total})


@router.get("/dashboard")
async def get_agent_dashboard():
    """获取代理商看板数据"""
    agents = execute_query("SELECT * FROM agents WHERE status='active' ORDER BY monthly_gmv DESC")
    
    return api_response({
        "agents": agents,
        "total_agents": len(agents),
        "total_gmv": sum(a["monthly_gmv"] for a in agents)
    })
