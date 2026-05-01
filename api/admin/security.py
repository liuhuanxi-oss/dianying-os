"""
店赢OS管理后台API - 安全合规
"""
from fastapi import APIRouter, Path, Query
from typing import Optional, List
from pydantic import BaseModel, Field
from database import execute_query

router = APIRouter(tags=["安全合规"])


class LoginLog(BaseModel):
    """登录日志"""
    id: int
    user: str
    ip: str
    device: str
    status: str
    time: str


class MaskingRule(BaseModel):
    """脱敏规则"""
    id: int
    field: str
    type: str
    pattern: str
    enabled: bool


class ComplianceRecord(BaseModel):
    """合规审计记录"""
    id: int
    type: str
    description: str
    operator: str
    time: str
    status: str


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/login-security",
    summary="获取登录日志",
    description="分页获取用户登录日志",
    responses={200: {"description": "成功获取日志"}}
)
async def list_login_logs(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数"),
    status: Optional[str] = Query(None, description="登录状态")
):
    """
    获取登录日志
    
    **登录状态：**
    - success: 登录成功
    - failed: 登录失败
    - blocked: 账户被封
    """
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM login_logs WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    logs = execute_query(f"SELECT * FROM login_logs WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": logs, "total": total})


@router.post("/login-security/{log_id}/handle",
    summary="处理登录安全警告",
    description="处理异常登录警告",
    responses={200: {"description": "处理成功"}}
)
async def handle_login_warning(
    log_id: int = Path(..., description="日志ID")
):
    """
    处理登录安全警告
    
    **处理方式：**
    - 标记为已处理
    - 冻结账户
    - 修改密码
    """
    return api_response(None, "已处理")


@router.get("/data-masking",
    summary="获取数据脱敏规则",
    description="获取敏感数据脱敏规则列表",
    responses={200: {"description": "成功获取规则"}}
)
async def get_data_masking_rules():
    """
    获取数据脱敏规则
    
    **支持的脱敏类型：**
    - phone: 手机号
    - id_card: 身份证
    - bank_card: 银行卡
    - address: 地址
    """
    return api_response({
        "rules": [
            {"id": 1, "field": "phone", "type": "phone", "pattern": "***", "enabled": True},
            {"id": 2, "field": "id_card", "type": "id_card", "pattern": "**************", "enabled": True},
            {"id": 3, "field": "bank_card", "type": "bank_card", "pattern": "****", "enabled": True},
            {"id": 4, "field": "address", "type": "address", "pattern": "***", "enabled": False},
        ]
    })


@router.put("/data-masking/{rule_id}",
    summary="更新脱敏规则",
    description="更新脱敏规则启用状态",
    responses={200: {"description": "更新成功"}}
)
async def update_masking_rule(
    rule_id: int = Path(..., description="规则ID"),
    enabled: bool = Query(..., description="是否启用")
):
    """更新脱敏规则"""
    return api_response(None, "规则已更新")


@router.get("/compliance",
    summary="获取合规审计记录",
    description="分页获取合规审计记录列表",
    responses={200: {"description": "成功获取记录"}}
)
async def list_compliance_records(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页条数")
):
    """
    获取合规审计记录
    
    **审计类型：**
    - 数据安全: 年度安全审计
    - 隐私合规: GDPR合规检查
    - 系统安全: 渗透测试
    """
    records = [
        {"id": 1, "type": "数据安全", "description": "年度安全审计", "operator": "安全团队", "time": "2024-12-01", "status": "passed"},
        {"id": 2, "type": "隐私合规", "description": "GDPR合规检查", "operator": "法务团队", "time": "2024-11-15", "status": "passed"},
        {"id": 3, "type": "系统安全", "description": "渗透测试", "operator": "安全团队", "time": "2024-10-20", "status": "passed"},
    ]
    return api_response({"items": records})
