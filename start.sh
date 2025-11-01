# 启动脚本 - 使用PM2启动应用
# 使用方法: bash start.sh

#!/bin/bash

set -e

echo "🚀 启动 AI语音评测系统..."

# 检查.env.production文件
if [ ! -f ".env.production" ]; then
    echo "❌ 错误: 未找到.env.production文件"
    echo "请先创建.env.production文件并配置环境变量"
    exit 1
fi

# 检查是否已构建
if [ ! -d ".next" ]; then
    echo "📦 未找到构建文件，正在构建..."
    npm run build
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
fi

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

echo "✅ 应用已启动！"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs voice-evaluation-app"

