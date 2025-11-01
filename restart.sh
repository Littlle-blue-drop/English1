# 重启脚本
# 使用方法: bash restart.sh

#!/bin/bash

echo "🔄 重启 AI语音评测系统..."

pm2 restart voice-evaluation-app || pm2 start ecosystem.config.js

echo "✅ 应用已重启"

