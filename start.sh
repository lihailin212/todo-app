#!/bin/bash

echo "========================================"
echo "  todo-app 启动脚本"
echo "========================================"
echo ""

cd "$(dirname "$0")/dist"

# 检查 Python
if command -v python3 &> /dev/null; then
    echo "检测到 Python3，使用 Python HTTP 服务器..."
    echo "应用地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# 检查 Python (旧版本)
if command -v python &> /dev/null; then
    echo "检测到 Python，使用 Python HTTP 服务器..."
    echo "应用地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务"
    echo ""
    python -m http.server 8000
    exit 0
fi

# 检查 Node.js
if command -v node &> /dev/null; then
    echo "检测到 Node.js，使用 serve 静态服务器..."
    echo "应用地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务"
    echo ""
    npx serve -p 8000
    exit 0
fi

echo "错误: 未找到 Python 或 Node.js"
echo ""
echo "请安装以下任一环境:"
echo "1. Python 3.x (推荐) - 从 https://python.org 下载"
echo "2. Node.js - 从 https://nodejs.org 下载"
echo ""
echo "安装后重新运行此脚本。"
read -p "按回车键退出..."