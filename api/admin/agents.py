"""
店赢OS管理后台API - 代理商体系
"""
from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query, execute_insert, execute_update, execute_delete

router = APIRouter(tags=["代理商体系"])


class AgentResponse(BaseModel):
    """代理商响应"""
    id: int = Field(..., description="代理商ID")
    name: str = Field(..., description="代理商名称")
    level: str = Field(..., description="等级")
    region: str = Field(..., description="区域")
    contact: str = Field(..., description="联系方式")
    status: str = Field(..., description="状态")
    merchants: int = Field(..., description="商户数量")
    monthly_gmv: float = Field(..., description="月GMV")


class AgentCreate(BaseModel):
    """创建代理商"""
    name: str = Field(..., description="代理商名称")
    level: str = Field("silver", description="等级: bronze/silver/gold/platinum")
    region: str = Field("", description="负责区域")
    contact: str = Field("", description="联系方式")


class AgentUpdate(BaseModel):
    """更新代理商"""
    name: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = None
    region: Optional[str] = None


class ServiceProvider(BaseModel):
    """服务商"""
    id: int
    name: str
    qualification: str
    status: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/",
    summary="获取代理商列表",
    description="分页获取代理商列表，支持按等级、状态、关键词筛选",
    responses={200: {"description": "成功获取列表"}}
)
async def list_agents(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    level: Optional[str] = Query(None, description="等级"),
    status: Optional[str] = Query(None, description="状态"),
    keyword: Optional[str] = Query(None, description="关键词")
):
    """
    获取代理商列表
    
    **代理商等级：**
    - bronze: 铜牌
    - silver: 银牌
    - gold: 金牌
    - platinum: 白金
    """
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
    
    return api_response({"items": agents, "total": total, "page": page, "size": size})


@router.get("/stats",
    summary="获取代理商统计",
    description="获取代理商统计数据",
    responses={200: {"description": "成功获取统计"}}
)
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


@router.get("/{agent_id}",
    summary="获取代理商详情",
    description="获取指定代理商的详细信息",
    responses={200: {"description": "成功获取详情"}, 404: {"description": "代理商不存在"}}
)
async def get_agent(
    agent_id: int = Path(..., description="代理商ID")
):
    """获取代理商详情"""
    agents = execute_query("SELECT * FROM agents WHERE id = ?", (agent_id,))
    if not agents:
        raise HTTPException(status_code=404, detail="代理商不存在")
    return api_response(agents[0])


@router.get("/{agent_id}/merchants",
    summary="获取代理商下级商家",
    description="获取指定代理商发展的商户列表",
    responses={200: {"description": "成功获取列表"}}
)
async def get_agent_merchants(
    agent_id: int = Path(..., description="代理商ID"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取代理商下级商家"""
    offset = (page - 1) * size
    merchants = execute_query(
        "SELECT * FROM merchants LIMIT ? OFFSET ?",
        (size, offset)
    )
    return api_response({"items": merchants})


@router.get("/{agent_id}/commission",
    summary="获取代理商佣金分润",
    description="获取指定代理商的佣金分润记录",
    responses={200: {"description": "成功获取分润记录"}}
)
async def get_agent_commission(
    agent_id: int = Path(..., description="代理商ID"),
    month: Optional[str] = Query(None, description="月份")
):
    """
    获取代理商佣金分润
    
    **佣金规则：**
    - 根据商户交易额计算
    - 按月结算
    """
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


@router.post("/",
    summary="创建代理商",
    description="创建新的代理商",
    responses={200: {"description": "创建成功"}}
)
async def create_agent(
    agent: AgentCreate = ...
):
    """创建代理商"""
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d")
    cursor = execute_insert("""
        INSERT INTO agents (name, level, region, contact, join_time, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    """, (agent.name, agent.level, agent.region, agent.contact, now))
    return api_response({"id": cursor}, "代理商创建成功")


@router.put("/{agent_id}",
    summary="更新代理商信息",
    description="更新代理商基本信息",
    responses={200: {"description": "更新成功"}}
)
async def update_agent(
    agent_id: int = Path(..., description="代理商ID"),
    agent: AgentUpdate = ...
):
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


@router.delete("/{agent_id}",
    summary="删除代理商",
    description="删除指定代理商",
    responses={200: {"description": "删除成功"}}
)
async def delete_agent(
    agent_id: int = Path(..., description="代理商ID")
):
    """删除代理商"""
    execute_delete("DELETE FROM agents WHERE id = ?", (agent_id,))
    return api_response(None, "代理商删除成功")


@router.get("/service-providers/",
    summary="获取服务商列表",
    description="获取服务商列表",
    responses={200: {"description": "成功获取列表"}}
)
async def list_service_providers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    qualification: Optional[str] = Query(None, description="资质类型")
):
    """
    获取服务商列表
    
    **资质类型：**
    - payment: 支付资质
    - tech: 技术服务
    - marketing: 营销服务
    """
    offset = (page - 1) * size
    where_sql = "qualification = ?" if qualification else "1=1"
    params = (qualification,) if qualification else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM service_providers WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    providers = execute_query(f"SELECT * FROM service_providers WHERE {where_sql} LIMIT ? OFFSET ?", params)
    
    return api_response({"items": providers, "total": total})


@router.get("/dashboard",
    summary="获取代理商看板数据",
    description="获取代理商运营看板数据",
    responses={200: {"description": "成功获取数据"}}
)
async def get_agent_dashboard():
    """获取代理商看板数据"""
    agents = execute_query("SELECT * FROM agents WHERE status='active' ORDER BY monthly_gmv DESC")
    
    return api_response({
        "agents": agents,
        "total_agents": len(agents),
        "total_gmv": sum(a["monthly_gmv"] for a in agents)
    })
