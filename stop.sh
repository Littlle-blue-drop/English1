# 停止脚本
# 使用方法: bash stop.sh

#!/bin/bash

echo "🛑 停止 AI语音评测系统..."

pm2 stop voice-evaluation-app || true
pm2 delete voice-evaluation-app || true

echo "✅ 应用已停止"

