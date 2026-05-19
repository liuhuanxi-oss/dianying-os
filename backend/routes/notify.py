# -*- coding: utf-8 -*-
"""
通知路由
包含企业微信推送等功能
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import httpx

import config
from models import User
from routes.auth import get_current_active_user

router = APIRouter()


class WeComMessage(BaseModel):
    """企业微信消息"""
    msgtype: str = "text"
    text: dict


class PushRequest(BaseModel):
    """推送请求"""
    content: str
    to_user: Optional[str] = None  # 指定用户，为空则推送给当前用户


@router.post("/wecom/push")
async def push_to_wecom(
    push_data: PushRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    推送消息到企业微信
    """
    if not config.WECOM_WEBHOOK_URL:
        return {"message": "企业微信webhook未配置，跳过推送"}
    
    # 构建消息
    message = {
        "msgtype": "text",
        "text": {
            "content": f"{push_data.content}\n\n—— 来自店赢OS"
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config.WECOM_WEBHOOK_URL,
                json=message,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("errcode") == 0:
                    return {"message": "推送成功"}
                else:
                    return {"message": f"推送失败: {result.get('errmsg')}"}
            else:
                return {"message": f"HTTP错误: {response.status_code}"}
    except Exception as e:
        return {"message": f"推送异常: {str(e)}"}


@router.get("/wecom/test")
async def test_wecom(
    current_user: User = Depends(get_current_active_user)
):
    """
    测试企业微信连接
    """
    if not config.WECOM_WEBHOOK_URL:
        return {
            "status": "not_configured",
            "message": "企业微信webhook未配置"
        }
    
    test_message = {
        "msgtype": "text",
        "text": {
            "content": f"店赢OS连接测试\n时间: 2024-01-01 00:00:00\n状态: 正常"
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config.WECOM_WEBHOOK_URL,
                json=test_message,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("errcode") == 0:
                    return {
                        "status": "success",
                        "message": "企业微信连接正常"
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"企业微信错误: {result.get('errmsg')}"
                    }
            else:
                return {
                    "status": "error",
                    "message": f"HTTP错误: {response.status_code}"
                }
    except Exception as e:
        return {
            "status": "error",
            "message": f"连接异常: {str(e)}"
        }


@router.post("/notification")
async def send_notification(
    notification_type: str,
    title: str,
    content: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    发送站内通知
    通知类型: review_alert, order_alert, system_notice
    """
    # 这里可以扩展为存储通知到数据库
    # 目前仅返回成功，实际使用时可结合WebSocket或轮询实现
    
    return {
        "message": "通知发送成功",
        "notification": {
            "type": notification_type,
            "title": title,
            "content": content,
            "user_id": current_user.id,
            "created_at": "2024-01-01T00:00:00Z"
        }
    }
