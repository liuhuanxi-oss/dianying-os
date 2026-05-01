#!/bin/bash
# 店赢OS - 开发环境启动脚本

echo "========================================"
echo "  店赢OS管理后台 - 开发环境"
echo "========================================"
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "错误: 需要安装Python3"
    exit 1
fi

# 检查依赖
if [ ! -d "api/__pycache__" ]; then
    echo "首次运行，安装依赖..."
    pip install fastapi uvicorn pydantic -q 2>/dev/null
fi

echo "启动服务器..."
echo ""
echo "  前端页面: http://localhost:3000/admin.html"
echo "  API文档:  http://localhost:3000/api/docs"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"
echo ""

# 启动完整版服务器（API + 前端）
python3 api/api_proxy.py
