# 🎤 AI语音评测系统 v0.3.0

基于科大讯飞语音评测API的在线英语口语练习平台，支持单词、句子和段落跟读评测。集成 Supabase 数据库，提供完整的学习记录和数据统计功能。

## ✨ 功能特性

### 核心功能
- **📖 单词跟读**：单词发音评测，音节级别反馈
- **📝 句子跟读**：句子朗读评测，多维度分析
- **📄 段落朗读**：篇章级别朗读评测，整体流畅性分析（🆕 v0.3）
- **📊 智能评分**：准确度、流畅度、标准度、完整度全方位评测
- **🎯 实时反馈**：录音结束即刻获得评测结果
- **💡 错误定位**：单词级别的增漏读检测
- **👤 用户系统**：邮箱注册登录，会话管理
- **🗄️ 数据持久化**：Supabase 数据库，数据永久保存（🆕 v0.3）
- **📈 学习记录**：历史记录查看，学习数据统计（🆕 v0.3）

### 技术特性
- 流式WebSocket连接，实时音频传输
- Web Audio API录音，16kHz单声道
- JWT认证，bcrypt密码加密（🆕）
- 响应式设计，支持移动端和桌面端
- TypeScript类型安全
- Tailwind CSS美观UI

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- 科大讯飞开放平台账号

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd voice-evaluation-mvp
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 配置环境变量

在讯飞开放平台（https://console.xfyun.cn/）创建应用并获取密钥：

1. 注册/登录 [讯飞开放平台](https://www.xfyun.cn/)
2. 进入控制台，创建WebAPI应用
3. 添加"语音评测（流式版）"服务
4. 获取 `APPID`、`APIKey`、`APISecret`

创建 `.env` 文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入您的密钥：

```env
# 讯飞语音API配置
NEXT_PUBLIC_XFYUN_APP_ID=your_app_id
NEXT_PUBLIC_XFYUN_API_KEY=your_api_key
NEXT_PUBLIC_XFYUN_API_SECRET=your_api_secret

# JWT密钥（用于用户认证，生产环境请修改为强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

⚠️ **重要**：在生产环境中，请务必修改 `JWT_SECRET` 为强随机字符串！

生成强密钥的方法：
```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 使用 OpenSSL
openssl rand -hex 32
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000

## 📦 部署到Vercel

### 方式一：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 方式二：通过GitHub集成

1. 将代码推送到GitHub仓库
2. 访问 [Vercel](https://vercel.com)
3. 点击 "Import Project"
4. 选择您的GitHub仓库
5. 配置环境变量：
   - `NEXT_PUBLIC_XFYUN_APP_ID`
   - `NEXT_PUBLIC_XFYUN_API_KEY`
   - `NEXT_PUBLIC_XFYUN_API_SECRET`
6. 点击 "Deploy"

### 环境变量配置

在Vercel项目设置中添加环境变量：

```
Settings → Environment Variables
```

添加以下变量：
- `NEXT_PUBLIC_XFYUN_APP_ID`
- `NEXT_PUBLIC_XFYUN_API_KEY`
- `NEXT_PUBLIC_XFYUN_API_SECRET`

## 🖥️ 部署到阿里云服务器

### 前置要求
- 阿里云ECS服务器（推荐：2核4G，Ubuntu 20.04/22.04）
- 域名（已备案）
- SSL证书（Let's Encrypt或阿里云SSL证书）
- Supabase项目已配置

### 快速部署

1. **上传代码到服务器**
   ```bash
   # 方法1: 使用Git
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/voice-evaluation
   
   # 方法2: 使用SCP
   scp -r ./voice-evaluation-mvp/* root@your-server-ip:/var/www/voice-evaluation/
   ```

2. **配置环境变量**
   ```bash
   cd /var/www/voice-evaluation
   cp env.production.example .env.production
   nano .env.production  # 填入实际值
   ```

3. **安装依赖并构建**
   ```bash
   npm ci --production=false
   npm run build
   ```

4. **使用PM2启动**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # 按提示执行输出命令
   ```

5. **配置Nginx反向代理**
   ```bash
   cp nginx.conf /etc/nginx/sites-available/voice-evaluation
   # 编辑配置文件，修改域名和SSL证书路径
   ln -s /etc/nginx/sites-available/voice-evaluation /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

6. **配置SSL证书**
   ```bash
   # 使用Let's Encrypt
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

**详细文档：** 查看 [`阿里云部署指南.md`](./阿里云部署指南.md)  
**快速参考：** 查看 [`阿里云部署快速参考.md`](./阿里云部署快速参考.md)

### 使用Docker部署（可选）

```bash
# 构建镜像
docker build -t voice-evaluation-app .

# 运行容器
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name voice-evaluation \
  voice-evaluation-app
```

## 🏗️ 项目结构

```
voice-evaluation-mvp/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 首页（含用户菜单）
│   ├── login/               # 登录页面 🆕
│   │   └── page.tsx
│   ├── register/            # 注册页面 🆕
│   │   └── page.tsx
│   ├── word/                # 单词跟读页面
│   │   └── page.tsx
│   ├── sentence/            # 句子跟读页面
│   │   └── page.tsx
│   ├── api/                 # API路由 🆕
│   │   └── auth/            # 认证API
│   │       ├── register/    # 注册接口
│   │       ├── login/       # 登录接口
│   │       ├── logout/      # 登出接口
│   │       └── me/          # 获取当前用户
│   ├── layout.tsx           # 根布局
│   └── globals.css          # 全局样式
├── components/              # React组件
│   ├── RecordButton.tsx     # 录音按钮组件
│   ├── ScoreDisplay.tsx     # 评分展示组件
│   ├── AuthProvider.tsx     # 认证状态管理 🆕
│   └── UserMenu.tsx         # 用户菜单组件 🆕
├── lib/                     # 核心库
│   ├── xfyun-client.ts      # 讯飞WebSocket客户端
│   ├── audio-recorder.ts    # Web Audio录音器
│   ├── xml-parser.ts        # XML结果解析器
│   ├── auth.ts              # 服务端认证逻辑 🆕
│   └── auth-client.ts       # 客户端认证工具 🆕
├── public/                  # 静态资源
├── env.example              # 环境变量示例
├── next.config.js           # Next.js配置
├── tailwind.config.ts       # Tailwind CSS配置
├── tsconfig.json            # TypeScript配置
├── vercel.json              # Vercel部署配置
├── package.json             # 项目依赖
├── LOGIN_GUIDE.md           # 登录功能详细指南 🆕
├── QUICK_START_LOGIN.md     # 快速开始指南 🆕
├── AUTH_IMPLEMENTATION.md   # 认证系统实现总览 🆕
└── TEST_SCENARIOS.md        # 测试场景 🆕
```

## 🎯 使用说明

### 用户注册和登录（🆕）

1. **注册新账户**
   - 访问首页，点击右上角"注册"按钮
   - 填写姓名、邮箱和密码（至少6个字符）
   - 注册成功后自动登录

2. **登录已有账户**
   - 点击"登录"按钮
   - 输入邮箱和密码
   - 登录成功后跳转到首页

3. **用户菜单**
   - 登录后，右上角显示用户头像和姓名
   - 点击可查看个人信息
   - 点击"登出"退出登录

📚 **详细文档**：
- [登录功能使用指南](LOGIN_GUIDE.md)
- [快速开始指南](QUICK_START_LOGIN.md)
- [测试场景](TEST_SCENARIOS.md)

### 单词跟读

1. 进入"单词跟读"页面
2. 选择预设单词或输入自定义单词
3. 点击录音按钮（需授权麦克风权限）
4. 朗读单词后点击停止
5. 查看评测结果和详细反馈

### 句子跟读

1. 进入"句子跟读"页面
2. 选择预设句子或输入自定义句子
3. 点击录音按钮开始录音
4. 完整朗读句子后点击停止
5. 查看多维度评分和单词级错误分析

### 评分说明

- **总分**：综合评分（0-100分）
  - 90-100分：优秀 🌟
  - 80-89分：良好 ✨
  - 70-79分：及格 👍
  - 0-69分：待提高 💪

- **准确度**：单词发音准确性（权重60%）
- **流畅度**：朗读流利程度（权重30%）
- **标准度**：母语发音习惯（权重10%）
- **完整度**：内容完整性

### 错误类型

- ✅ **正确**：发音准确
- 🔴 **漏读**：应读但未读
- 🟠 **增读**：不应读但读了
- 🟡 **回读**：重复朗读
- 🔵 **替换**：读错发音

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **API**：科大讯飞语音评测（流式版）
- **音频**：Web Audio API
- **通信**：WebSocket
- **认证**：JWT + bcrypt 🆕
- **会话**：HttpOnly Cookie 🆕
- **部署**：Vercel

## ⚠️ 注意事项

1. **浏览器兼容性**
   - 推荐使用 Chrome、Edge、Safari 等现代浏览器
   - 需要支持 Web Audio API 和 WebSocket

2. **录音环境**
   - 确保在安静环境中录音
   - 使用质量较好的麦克风
   - 避免背景噪音干扰

3. **API限制**
   - 默认支持50路并发
   - 单次录音不超过5分钟
   - 音频格式：16kHz, 16bit, 单声道

4. **安全性**
   - 不要将 `.env.local` 提交到版本控制
   - API密钥仅在客户端使用（环境变量前缀 NEXT_PUBLIC_）
   - 生产环境建议使用服务端代理

## 🐛 常见问题

### 1. 无法录音

**问题**：点击录音按钮没有反应

**解决方案**：
- 检查浏览器是否授予麦克风权限
- 确保使用 HTTPS 或 localhost
- 尝试刷新页面或更换浏览器

### 2. 评测失败

**问题**：显示"评测失败"错误

**解决方案**：
- 检查 API 密钥是否正确配置
- 查看浏览器控制台的详细错误信息
- 确认讯飞账户余额充足
- 检查网络连接是否正常

### 3. 结果不准确

**问题**：评分异常或出现"乱读检测"

**解决方案**：
- 确保在安静环境录音
- 清晰准确地朗读
- 避免长时间停顿
- 检查麦克风音量是否适中

### 4. 部署后环境变量无效

**问题**：Vercel部署后无法连接API

**解决方案**：
- 确认在 Vercel 项目设置中配置了环境变量
- 环境变量名必须以 `NEXT_PUBLIC_` 开头
- 修改环境变量后需要重新部署

## 📈 后续优化方向

### ✅ 已完成（v0.3.0）
- [x] ✅ 实现用户系统（邮箱登录）
- [x] ✅ 集成真实数据库（Supabase PostgreSQL）
- [x] ✅ 添加学习历史记录
- [x] ✅ 保存用户练习数据和成绩
- [x] ✅ 添加篇章朗读功能

### 🚀 计划中
- [ ] 学习趋势图表（Chart.js / Recharts）
- [ ] 错题本和薄弱点分析
- [ ] 每日/每周学习目标设置
- [ ] 添加 AI 发音纠正建议（GPT-4 集成）
- [ ] 添加邮箱验证功能
- [ ] 实现密码重置功能
- [ ] 支持中文普通话评测
- [ ] 支持更多题型（看图说话、情景反应等）
- [ ] 排行榜和竞赛系统
- [ ] 社交登录（Google、GitHub等）
- [ ] 录音回放和对比功能
- [ ] 支持离线评测
- [ ] 移动端原生App

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至：[your-email@example.com]

---

**Powered by iFlytek Voice Evaluation API**

