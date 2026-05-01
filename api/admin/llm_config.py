"""
多渠道LLM配置
支持14+主流大模型API，通过环境变量切换渠道

环境变量:
    AI_PROVIDER: 选择AI渠道 (ark|openai|deepseek|qwen|zhipu|moonshot|wenxin|spark|yi|minimax|baichuan|hunyuan|siliconflow|groq|xiaomi|tencent|aliyun)
    AI_MODEL: 模型名（可选，覆盖默认值）

各渠道环境变量:
    ARK_API_KEY + ARK_ENDPOINT_ID (火山方舟/豆包)
    OPENAI_API_KEY + OPENAI_MODEL (OpenAI)
    DEEPSEEK_API_KEY + DEEPSEEK_MODEL (DeepSeek)
    QWEN_API_KEY + QWEN_MODEL (通义千问-DashScope)
    ZHIPU_API_KEY + ZHIPU_MODEL (智谱AI)
    MOONSHOT_API_KEY + MOONSHOT_MODEL (Kimi)
    WENXIN_API_KEY + WENXIN_MODEL (文心一言)
    SPARK_API_KEY + SPARK_MODEL (讯飞星火)
    YI_API_KEY + YI_MODEL (零一万物)
    MINIMAX_API_KEY + MINIMAX_MODEL (MiniMax)
    BAICHUAN_API_KEY + BAICHUAN_MODEL (百川智能)
    HUNYUAN_API_KEY + HUNYUAN_MODEL (腾讯混元-私有部署)
    SILICONFLOW_API_KEY + SILICONFLOW_MODEL (硅基流动)
    GROQ_API_KEY + GROQ_MODEL (Groq)
    XIAOMI_API_KEY + XIAOMI_MODEL (小米大模型)
    TENCENT_API_KEY + TENCENT_MODEL (腾讯云混元-API)
    ALIYUN_API_KEY + ALIYUN_MODEL (阿里云百炼)
"""

import os
from typing import Dict, Optional, Any

# 所有支持的LLM渠道配置
LLM_PROVIDERS: Dict[str, Dict[str, Any]] = {
    # 火山方舟(豆包) - 字节跳动
    "ark": {
        "name": "火山方舟",
        "name_en": "Volcengine Ark",
        "icon": "🔥",
        "base_url": "https://ark.cn-beijing.volces.com/api/v3",
        "api_key_env": "ARK_API_KEY",
        "model_env": "ARK_ENDPOINT_ID",
        "default_model": "ep-xxxxxxxxxx",
        "description": "字节跳动火山方舟(豆包)",
        "color": "#ff6b6b",
    },
    
    # OpenAI
    "openai": {
        "name": "OpenAI",
        "name_en": "OpenAI",
        "icon": "🤖",
        "base_url": "https://api.openai.com/v1",
        "api_key_env": "OPENAI_API_KEY",
        "model_env": "OPENAI_MODEL",
        "default_model": "gpt-4o",
        "description": "OpenAI官方API",
        "color": "#10a37f",
    },
    
    # DeepSeek
    "deepseek": {
        "name": "DeepSeek",
        "name_en": "DeepSeek",
        "icon": "🔮",
        "base_url": "https://api.deepseek.com/v1",
        "api_key_env": "DEEPSEEK_API_KEY",
        "model_env": "DEEPSEEK_MODEL",
        "default_model": "deepseek-chat",
        "description": "DeepSeek深度求索",
        "color": "#7c3aed",
    },
    
    # 阿里通义千问 (DashScope)
    "qwen": {
        "name": "通义千问",
        "name_en": "Qwen",
        "icon": "👁️",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "api_key_env": "QWEN_API_KEY",
        "model_env": "QWEN_MODEL",
        "default_model": "qwen-plus",
        "description": "阿里通义千问(DashScope)",
        "color": "#ff6b00",
    },
    
    # 智谱AI (GLM)
    "zhipu": {
        "name": "智谱AI",
        "name_en": "Zhipu GLM",
        "icon": "✨",
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "api_key_env": "ZHIPU_API_KEY",
        "model_env": "ZHIPU_MODEL",
        "default_model": "glm-4",
        "description": "智谱AI GLM大模型",
        "color": "#06b6d4",
    },
    
    # 月之暗面 (Kimi)
    "moonshot": {
        "name": "Kimi",
        "name_en": "Moonshot",
        "icon": "🌙",
        "base_url": "https://api.moonshot.cn/v1",
        "api_key_env": "MOONSHOT_API_KEY",
        "model_env": "MOONSHOT_MODEL",
        "default_model": "moonshot-v1-8k",
        "description": "月之暗面Kimi",
        "color": "#6366f1",
    },
    
    # 百度文心一言
    "wenxin": {
        "name": "文心一言",
        "name_en": "Wenxin ERNIE",
        "icon": "📚",
        "base_url": "https://qianfan.baidubce.com/v2",
        "api_key_env": "WENXIN_API_KEY",
        "model_env": "WENXIN_MODEL",
        "default_model": "ernie-4.0-8k-latest",
        "description": "百度文心一言",
        "color": "#2932e1",
    },
    
    # 讯飞星火
    "spark": {
        "name": "讯飞星火",
        "name_en": "iFlytek Spark",
        "icon": "⭐",
        "base_url": "https://spark-api-open.xf-yun.com/v1",
        "api_key_env": "SPARK_API_KEY",
        "model_env": "SPARK_MODEL",
        "default_model": "generalv3.5",
        "description": "科大讯飞星火大模型",
        "color": "#00d4aa",
    },
    
    # 零一万物 (Yi)
    "yi": {
        "name": "零一万物",
        "name_en": "01.AI Yi",
        "icon": "💫",
        "base_url": "https://api.lingyiwanwu.com/v1",
        "api_key_env": "YI_API_KEY",
        "model_env": "YI_MODEL",
        "default_model": "yi-large",
        "description": "零一万物Yi大模型",
        "color": "#f59e0b",
    },
    
    # MiniMax
    "minimax": {
        "name": "MiniMax",
        "name_en": "MiniMax",
        "icon": "🎯",
        "base_url": "https://api.minimax.chat/v1",
        "api_key_env": "MINIMAX_API_KEY",
        "model_env": "MINIMAX_MODEL",
        "default_model": "abab6.5s-chat",
        "description": "MiniMax海螺AI",
        "color": "#ec4899",
    },
    
    # 百川智能
    "baichuan": {
        "name": "百川智能",
        "name_en": "Baichuan",
        "icon": "🌊",
        "base_url": "https://api.baichuan-ai.com/v1",
        "api_key_env": "BAICHUAN_API_KEY",
        "model_env": "BAICHUAN_MODEL",
        "default_model": "Baichuan4",
        "description": "百川智能大模型",
        "color": "#14b8a6",
    },
    
    # 腾讯混元 (私有部署版)
    "hunyuan": {
        "name": "腾讯混元",
        "name_en": "Tencent Hunyuan",
        "icon": "🐧",
        "base_url": "https://api.hunyuan.tencent.com/v1",
        "api_key_env": "HUNYUAN_API_KEY",
        "model_env": "HUNYUAN_MODEL",
        "default_model": "hunyuan-pro",
        "description": "腾讯混元(私有部署)",
        "color": "#06c2ff",
    },
    
    # 硅基流动 (SiliconFlow)
    "siliconflow": {
        "name": "硅基流动",
        "name_en": "SiliconFlow",
        "icon": "💎",
        "base_url": "https://api.siliconflow.cn/v1",
        "api_key_env": "SILICONFLOW_API_KEY",
        "model_env": "SILICONFLOW_MODEL",
        "default_model": "Qwen/Qwen2.5-72B-Instruct",
        "description": "硅基流动聚合API",
        "color": "#8b5cf6",
    },
    
    # Groq
    "groq": {
        "name": "Groq",
        "name_en": "Groq",
        "icon": "⚡",
        "base_url": "https://api.groq.com/openai/v1",
        "api_key_env": "GROQ_API_KEY",
        "model_env": "GROQ_MODEL",
        "default_model": "llama-3.3-70b-versatile",
        "description": "Groq高速推理",
        "color": "#22d3ee",
    },
    
    # 小米大模型
    "xiaomi": {
        "name": "小米大模型",
        "name_en": "MiLM",
        "icon": "📱",
        "base_url": "https://xiaomi.ai/v1",
        "api_key_env": "XIAOMI_API_KEY",
        "model_env": "XIAOMI_MODEL",
        "default_model": "mi-lm-70b",
        "description": "小米大模型",
        "color": "#f97316",
    },
    
    # 腾讯云混元 (API版)
    "tencent": {
        "name": "腾讯云混元",
        "name_en": "Tencent Cloud Hunyuan",
        "icon": "☁️",
        "base_url": "https://hunyuan.tencentcloudapi.com/openai/v1",
        "api_key_env": "TENCENT_API_KEY",
        "model_env": "TENCENT_MODEL",
        "default_model": "hunyuan-lite",
        "description": "腾讯云混元大模型(API版)",
        "color": "#eb4444",
    },
    
    # 阿里云百炼
    "aliyun": {
        "name": "阿里云百炼",
        "name_en": "Aliyun Bailian",
        "icon": "🏆",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "api_key_env": "ALIYUN_API_KEY",
        "model_env": "ALIYUN_MODEL",
        "default_model": "qwen-turbo",
        "description": "阿里云百炼(AccessKey)",
        "color": "#ff9500",
    },
}

# 运行时渠道缓存（支持零重启切换）
_current_provider_cache: Optional[str] = None


def get_current_provider() -> str:
    """获取当前配置的渠道，默认ark"""
    global _current_provider_cache
    if _current_provider_cache is None:
        _current_provider_cache = os.getenv("AI_PROVIDER", "ark").lower()
    return _current_provider_cache


def get_llm_config() -> Dict[str, Any]:
    """
    获取当前渠道的完整配置
    返回: {base_url, api_key, model, provider_name, ...}
    """
    provider = get_current_provider()
    
    if provider not in LLM_PROVIDERS:
        provider = "ark"  # 默认回退到ark
    
    config = LLM_PROVIDERS[provider].copy()
    
    # 从环境变量读取实际值
    api_key = os.getenv(config["api_key_env"], "")
    model = os.getenv(config["model_env"], config["default_model"])
    
    config["api_key"] = api_key
    config["model"] = model
    config["provider"] = provider
    config["configured"] = bool(api_key)
    
    return config


def list_providers() -> list:
    """
    列出所有可用渠道及其配置状态
    返回: [{id, name, icon, configured, model, ...}, ...]
    """
    result = []
    for pid, cfg in LLM_PROVIDERS.items():
        api_key = os.getenv(cfg["api_key_env"], "")
        model = os.getenv(cfg["model_env"], cfg["default_model"])
        current = get_current_provider()
        
        result.append({
            "id": pid,
            "name": cfg["name"],
            "name_en": cfg["name_en"],
            "icon": cfg["icon"],
            "description": cfg["description"],
            "color": cfg["color"],
            "base_url": cfg["base_url"],
            "default_model": cfg["default_model"],
            "current_model": model,
            "configured": bool(api_key),
            "is_current": pid == current,
        })
    
    return result


def switch_provider(provider_id: str) -> Dict[str, Any]:
    """
    切换当前使用的渠道（运行时切换）
    注意：这只影响当前进程，实际生产环境建议配合环境变量使用
    """
    global _current_provider_cache
    
    if provider_id not in LLM_PROVIDERS:
        raise ValueError(f"不支持的渠道: {provider_id}")
    
    _current_provider_cache = provider_id.lower()
    return get_llm_config()


def is_current_provider_configured() -> bool:
    """检查当前渠道是否已配置"""
    config = get_llm_config()
    return config["configured"]
