"""
店赢OS管理后台API - 安全合规
"""
from fastapi import APIRouter, Query
from typing import Optional
from database import execute_query

router = APIRouter()


def api_response(data=None, message="", code=0):
    return {"code": code, "message": message, "data": data}


@router.get("/login-security")
async def list_login_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None
):
    """获取登录日志"""
    offset = (page - 1) * size
    where_sql = "status = ?" if status else "1=1"
    params = (status,) if status else ()
    
    total = execute_query(f"SELECT COUNT(*) as cnt FROM login_logs WHERE {where_sql}", params)[0]["cnt"]
    params = params + (size, offset)
    logs = execute_query(f"SELECT * FROM login_logs WHERE {where_sql} ORDER BY id DESC LIMIT ? OFFSET ?", params)
    
    return api_response({"items": logs, "total": total})


@router.post("/login-security/{log_id}/handle")
async def handle_login_warning(log_id: int):
    """处理登录安全警告"""
    return api_response(None, "已处理")


@router.get("/data-masking")
async def get_data_masking_rules():
    """获取数据脱敏规则"""
    return api_response({
        "rules": [
            {"id": 1, "field": "phone", "type": "phone", "pattern": "***", "enabled": True},
            {"id": 2, "field": "id_card", "type": "id_card", "pattern": "**************", "enabled": True},
            {"id": 3, "field": "bank_card", "type": "bank_card", "pattern": "****", "enabled": True},
            {"id": 4, "field": "address", "type": "address", "pattern": "***", "enabled": False},
        ]
    })


@router.put("/data-masking/{rule_id}")
async def update_masking_rule(rule_id: int, enabled: bool):
    """更新脱敏规则"""
    return api_response(None, "规则已更新")


@router.get("/compliance")
async def list_compliance_records(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """获取合规审计记录"""
    # 模拟合规数据
    records = [
        {"id": 1, "type": "数据安全", "description": "年度安全审计", "operator": "安全团队", "time": "2024-12-01", "status": "passed"},
        {"id": 2, "type": "隐私合规", "description": "GDPR合规检查", "operator": "法务团队", "time": "2024-11-15", "status": "passed"},
        {"id": 3, "type": "系统安全", "description": "渗透测试", "operator": "安全团队", "time": "2024-10-20", "status": "passed"},
    ]
    return api_response({"items": records})
