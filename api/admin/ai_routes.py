"""
店赢OS AI对话路由
支持多渠道大模型API统一调用
"""
import os
import httpx
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .llm_config import get_llm_config, list_providers, switch_provider, is_current_provider_configured

router = APIRouter(prefix="/api/ai", tags=["AI对话"])

# 角色System Prompt配置
ROLE_PROMPTS = {
    "owner": """你是店赢OS的AI运营顾问，帮助门店老板分析经营数据、优化运营策略。
关注点：单店流水、顾客评价、营销ROI、成本控制。
请用专业但易懂的语言回复，包含具体数字和数据支撑。""",
    
    "manager": """你是店赢OS的AI运营顾问，帮助区域运营经理管理多门店运营。
关注点：区域营收对比、门店排名、异常预警、人员效率。
请用专业但易懂的语言回复，包含具体数字和数据支撑。""",
    
    "admin": """你是店赢OS的AI运营顾问，帮助平台管理员掌握全局运营状况。
关注点：平台GMV、商户增长、行业趋势、风控合规。
请用专业但易懂的语言回复，包含具体数字和数据支撑。"""
}

# 请求模型
class ChatRequest(BaseModel):
    message: str
    role: str = "owner"  # owner/manager/admin
    context: List[Dict[str, str]] = []

# 响应模型
class ChatResponse(BaseModel):
    response: str
    thinking_steps: List[str]
    data: Optional[Dict[str, Any]] = None

class StatusResponse(BaseModel):
    status: str  # online/offline
    model: str
    mode: str  # api/mock
    provider: str
    provider_name: str

class ProviderSwitchRequest(BaseModel):
    provider: str

class ProviderListResponse(BaseModel):
    providers: List[Dict[str, Any]]
    current_provider: str


async def call_llm_api(messages: List[Dict[str, str]]) -> str:
    """统一调用LLM API（OpenAI兼容格式）"""
    config = get_llm_config()
    
    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": config["model"],
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{config['base_url']}/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]


def get_mock_response(message: str, role: str) -> tuple[str, List[str]]:
    """获取Mock回复（当API未配置时使用）"""
    thinking_steps = [
        "检索相关数据...",
        "分析趋势与关联...",
        "生成运营洞察...",
        "构建建议方案..."
    ]
    
    msg_lower = message.lower()
    
    if "流水" in message or "下降" in message or "下滑" in message:
        response = f"""## 门店流水分析报告

### 数据分析
- 本月门店日均流水 **¥28.7万**，较上月下降 **12.3%**
- 工作日与周末差距明显，周末营收是工作日的 **1.3倍**
- 下午茶时段(14:00-17:00)订单量下滑 **18%**

### 洞察发现
1. 竞对在本区域新开了2家同类门店，分流约15%客流
2. 近期差评增加与出餐速度相关，差评中提及"等太久"占比45%
3. 新品上线后缺乏持续推广，热度消退快

### 行动建议
1. **短期**：推出限时折扣套餐，激活工作日午市客流
2. **中期**：优化出餐流程，目标将等餐时间缩短30%
3. **长期**：建立会员积分体系，提升复购率至40%"""
        
    elif "评分" in message or "星级" in message:
        response = f"""## 门店评分分析报告

### 数据分析
- 平台门店平均评分 **4.72分**，较上月微降 **0.05分**
- 4.5分以上门店占比 **87%**，但有12家门店评分低于4.0
- 差评主要集中在：出餐慢(45%)、服务差(32%)、菜品凉了(28%)

### 洞察发现
1. 评分下滑门店主要集中在快餐品类，平均评分4.1分
2. 周末高峰期差评率是平日的2.3倍
3. 差评用户中68%是首次到店新客

### 行动建议
1. **高优先级**：针对评分<4.0门店启动专项提升计划
2. **中优先级**：建立差评实时预警机制，2小时内响应
3. **持续优化**：收集好评话术，标准化服务质量"""
        
    elif "营销" in message or "策略" in message or "推广" in message:
        response = f"""## 下月营销策略建议

### 数据分析
- 当前营销ROI为 **1:3.5**（投入1元带来3.5元营收）
- 茶饮品类营销转化率最高，达 **12.3%**
- 周末活动参与率比平日高 **45%**

### 洞察发现
1. 会员日活动效果显著，参与会员消费频次提升60%
2. 短视频+直播带货新渠道增速快，环比增长120%
3. 跨店联合活动比单店活动转化率高35%

### 行动建议
1. **新品推广**：借助茶饮品类热度，推出跨界联名款
2. **会员运营**：每月18日设为会员专享日
3. **渠道拓展**：试水短视频种草+直播带货新模式"""
        
    elif "对比" in message or "行业" in message or "表现" in message:
        response = f"""## 各行业营收对比分析

### 数据分析
- 快餐简餐占比 **35%**，基盘最大但增速放缓(+3.2%)
- 茶饮咖啡占比 **18%**，增速最快(**+15.6%**)
- 火锅烤肉占比 **12%**，客单价最高(人均¥89)
- 烘焙甜品占比 **7%**，连续2个月下滑(-8.3%)

### 洞察发现
1. 茶饮赛道热度持续，年轻人消费力强劲
2. 正餐品类虽占比不高，但客单价稳定
3. 烘焙甜品受健康饮食趋势影响明显

### 行动建议
1. **茶饮赛道**：建议新增茶饮品类或联名合作
2. **快餐优化**：借鉴茶饮的爆品运营策略
3. **正餐稳健**：维持现有投入，注重品质稳定性"""
    
    else:
        response = f"""## 运营洞察

您好！作为店赢OS的AI运营顾问，我来为您分析当前运营状况：

### 核心指标
- 今日营收：**¥287,432** (+12.3%)
- 订单数量：**1,247单** (+8.6%)
- 平均评分：**4.72分** (-0.05)
- 活跃门店：**386家** (+15)

### 建议关注
1. 本周营收增速放缓，建议关注竞对动态
2. 评分略有波动，建议加强服务培训
3. 新增门店表现良好，可考虑复制经验

如需深入分析，请告诉我具体想了解的方向！"""
    
    return response, thinking_steps


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI对话接口
    
    - **message**: 用户问题
    - **role**: 用户角色 (owner/manager/admin)
    - **context**: 对话历史上下文
    """
    try:
        thinking_steps = [
            "正在检索相关数据...",
            "正在分析趋势与关联...",
            "正在生成运营洞察...",
            "正在构建建议方案..."
        ]
        
        if is_current_provider_configured():
            # 调用配置的LLM API
            system_prompt = ROLE_PROMPTS.get(request.role, ROLE_PROMPTS["owner"])
            
            messages = [
                {"role": "system", "content": system_prompt},
                *request.context,
                {"role": "user", "content": request.message}
            ]
            
            config = get_llm_config()
            response_text = await call_llm_api(messages)
            
            return ChatResponse(
                response=response_text,
                thinking_steps=thinking_steps,
                data={"source": f"{config['provider']}_api"}
            )
        else:
            # Fallback到Mock模式
            response_text, thinking_steps = get_mock_response(request.message, request.role)
            
            return ChatResponse(
                response=response_text,
                thinking_steps=thinking_steps,
                data={"source": "mock"}
            )
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"API调用失败: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")


@router.get("/status", response_model=StatusResponse)
async def status():
    """
    AI服务状态检查
    
    检查当前渠道API Key是否配置，返回服务状态
    """
    config = get_llm_config()
    
    if config["configured"]:
        return StatusResponse(
            status="online",
            model=config["model"],
            mode="api",
            provider=config["provider"],
            provider_name=config["name"]
        )
    else:
        return StatusResponse(
            status="offline",
            model="未配置",
            mode="mock",
            provider=config["provider"],
            provider_name=config["name"]
        )


@router.get("/providers", response_model=ProviderListResponse)
async def providers():
    """
    获取所有支持的渠道列表及其配置状态
    """
    return ProviderListResponse(
        providers=list_providers(),
        current_provider=get_llm_config()["provider"]
    )


@router.post("/provider/switch")
async def switch(request: ProviderSwitchRequest):
    """
    切换当前使用的AI渠道（运行时切换）
    
    - **provider**: 渠道ID (ark|openai|deepseek|qwen|zhipu|...)
    """
    try:
        config = switch_provider(request.provider)
        return {
            "success": True,
            "message": f"已切换到 {config['name']}",
            "provider": config["provider"],
            "provider_name": config["name"],
            "model": config["model"],
            "configured": config["configured"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
