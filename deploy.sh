#!/bin/bash

# 阿里云服务器部署脚本
# 使用方法: bash deploy.sh

set -e

echo "🚀 开始部署 AI语音评测系统..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js版本
echo -e "${YELLOW}检查Node.js版本...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装Node.js，请先安装Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}错误: Node.js版本过低，需要18+，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js版本: $(node -v)${NC}"

# 检查PM2
echo -e "${YELLOW}检查PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2未安装，正在安装...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2已安装${NC}"

# 检查环境变量文件
echo -e "${YELLOW}检查环境变量...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}错误: 未找到.env.production文件${NC}"
    echo -e "${YELLOW}请创建.env.production文件并配置环境变量${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 环境变量文件存在${NC}"

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
npm ci --production=false
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 构建应用
echo -e "${YELLOW}构建应用...${NC}"
npm run build
echo -e "${GREEN}✓ 构建完成${NC}"

# 创建日志目录
mkdir -p logs

# 停止旧进程（如果存在）
echo -e "${YELLOW}停止旧进程...${NC}"
pm2 delete voice-evaluation-app 2>/dev/null || true
echo -e "${GREEN}✓ 旧进程已停止${NC}"

# 启动应用
echo -e "${YELLOW}启动应用...${NC}"
pm2 start ecosystem.config.js
echo -e "${GREEN}✓ 应用已启动${NC}"

# 保存PM2配置
pm2 save

# 设置PM2开机自启
echo -e "${YELLOW}设置PM2开机自启...${NC}"
pm2 startup | grep -v "PM2" | bash || true
echo -e "${GREEN}✓ PM2开机自启已配置${NC}"

# 显示状态
echo -e "${YELLOW}应用状态:${NC}"
pm2 status

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}应用运行在: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  查看日志: pm2 logs voice-evaluation-app"
echo "  重启应用: pm2 restart voice-evaluation-app"
echo "  停止应用: pm2 stop voice-evaluation-app"
echo "  查看状态: pm2 status"

