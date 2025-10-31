# 🚀 部署指南

## 部署到 Vercel

### 步骤 1：准备工作

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **获取讯飞 API 密钥**
   - 访问 https://console.xfyun.cn/
   - 创建 WebAPI 应用
   - 添加"语音评测（流式版）"服务
   - 记录以下信息：
     - `APPID`
     - `APIKey`
     - `APISecret`

### 步骤 2：通过 GitHub 部署（推荐）

1. **推送代码到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **在 Vercel 导入项目**
   - 登录 Vercel Dashboard
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 授权 GitHub 并选择您的仓库
   - 点击 "Import"

3. **配置环境变量**

在 "Configure Project" 页面，展开 "Environment Variables" 部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-------|------|
| `NEXT_PUBLIC_XFYUN_APP_ID` | 您的APPID | 讯飞应用ID |
| `NEXT_PUBLIC_XFYUN_API_KEY` | 您的APIKey | 讯飞API密钥 |
| `NEXT_PUBLIC_XFYUN_API_SECRET` | 您的APISecret | 讯飞API签名密钥 |

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约1-2分钟）
   - 访问分配的域名测试

### 步骤 3：通过 Vercel CLI 部署

1. **安装 Vercel CLI**

```bash
npm i -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **首次部署**

```bash
vercel
```

按照提示操作：
- 是否要链接到现有项目？选择 `N`（新项目）
- 项目名称？输入项目名称或回车使用默认值
- 代码目录？回车（使用当前目录）
- 是否覆盖设置？选择 `N`

4. **添加环境变量**

```bash
vercel env add NEXT_PUBLIC_XFYUN_APP_ID
vercel env add NEXT_PUBLIC_XFYUN_API_KEY
vercel env add NEXT_PUBLIC_XFYUN_API_SECRET
```

每个命令会提示输入值，选择环境：
- Production: `y`
- Preview: `y`
- Development: `n`（本地使用 .env.local）

5. **生产部署**

```bash
vercel --prod
```

### 步骤 4：验证部署

1. **访问您的域名**
   - Vercel 会自动分配一个域名，如：`your-project.vercel.app`
   - 在浏览器中打开

2. **测试功能**
   - 授权麦克风权限
   - 测试单词跟读
   - 测试句子跟读
   - 检查评分是否正常显示

3. **检查错误**
   - 打开浏览器开发者工具 (F12)
   - 查看 Console 是否有错误
   - 查看 Network 标签检查 API 请求

## 自定义域名

### 添加自定义域名

1. 在 Vercel Dashboard 中选择您的项目
2. 进入 "Settings" → "Domains"
3. 点击 "Add Domain"
4. 输入您的域名（如 `voice.yourdomain.com`）
5. 按照提示配置 DNS 记录

### DNS 配置示例

**A Record:**
```
Type: A
Name: voice (或 @)
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: voice
Value: cname.vercel-dns.com
```

## 环境管理

### 查看所有环境变量

```bash
vercel env ls
```

### 删除环境变量

```bash
vercel env rm NEXT_PUBLIC_XFYUN_APP_ID
```

### 更新环境变量

```bash
# 删除旧的
vercel env rm NEXT_PUBLIC_XFYUN_APP_ID

# 添加新的
vercel env add NEXT_PUBLIC_XFYUN_APP_ID
```

## 持续部署

### 自动部署设置

Vercel 默认启用自动部署：

- **Production（main 分支）**
  - 推送到 `main` 分支会自动部署到生产环境
  - 域名：`your-project.vercel.app`

- **Preview（其他分支）**
  - 推送到其他分支会创建预览部署
  - 域名：`your-project-git-branch.vercel.app`

- **Pull Request**
  - 每个 PR 都会创建独立的预览部署
  - 可在 PR 中直接预览效果

### 禁用自动部署

在项目设置中：
1. Settings → Git
2. 取消勾选 "Automatically deploy new commits"

## 性能优化

### 1. 启用缓存

Vercel 自动处理静态资源缓存，无需额外配置。

### 2. 图片优化

如果添加图片，使用 Next.js Image 组件：

```tsx
import Image from 'next/image'

<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

### 3. 分析包大小

```bash
npm run build
```

检查构建输出，优化大型依赖。

### 4. CDN 配置

Vercel 的 Edge Network 自动提供全球 CDN，无需额外配置。

## 监控和日志

### 查看部署日志

1. Vercel Dashboard
2. 选择项目
3. 点击 "Deployments"
4. 选择具体部署查看日志

### 实时日志（CLI）

```bash
vercel logs <deployment-url>
```

### 查看函数日志

```bash
vercel logs <deployment-url> --follow
```

## 故障排查

### 问题 1：构建失败

**错误信息**：`Error: Build failed`

**解决方案**：
1. 检查 `package.json` 依赖是否正确
2. 本地运行 `npm run build` 测试
3. 检查 TypeScript 类型错误
4. 查看 Vercel 构建日志详细错误

### 问题 2：环境变量无效

**错误信息**：API 密钥未定义

**解决方案**：
1. 确认环境变量已添加到 Vercel
2. 变量名必须以 `NEXT_PUBLIC_` 开头
3. 重新部署项目：`vercel --prod`

### 问题 3：WebSocket 连接失败

**错误信息**：`WebSocket connection failed`

**解决方案**：
1. 检查浏览器是否阻止混合内容
2. 确保使用 `wss://` 协议
3. 检查讯飞 API 密钥是否正确
4. 查看控制台详细错误信息

### 问题 4：CORS 错误

**错误信息**：`Access-Control-Allow-Origin`

**解决方案**：
1. 讯飞 API 应该支持跨域
2. 如果仍有问题，考虑添加服务端代理
3. 在 `next.config.js` 中配置重写规则

## 安全性建议

### 1. API 密钥保护

⚠️ **注意**：当前实现中 API 密钥暴露在客户端

**改进方案**：
- 创建 Next.js API Route 作为代理
- 在服务端处理 WebSocket 连接
- 密钥仅存储在服务端

**示例**：`app/api/evaluate/route.ts`

```typescript
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { text, category } = await request.json();
  
  // 使用服务端环境变量（不带 NEXT_PUBLIC_ 前缀）
  const appId = process.env.XFYUN_APP_ID;
  const apiKey = process.env.XFYUN_API_KEY;
  const apiSecret = process.env.XFYUN_API_SECRET;
  
  // 在服务端连接讯飞 API
  // ...
}
```

### 2. 速率限制

考虑添加速率限制避免滥用：
- 使用 Vercel Edge Middleware
- 集成 Redis 存储请求计数
- 实现用户认证

### 3. HTTPS 强制

Vercel 自动提供 HTTPS，确保：
- 所有资源使用 HTTPS
- WebSocket 使用 WSS

## 成本估算

### Vercel 定价

- **Hobby（免费）**
  - 100 GB 带宽/月
  - 100 GB-Hrs 执行时间
  - 适合个人项目

- **Pro ($20/月)**
  - 1 TB 带宽
  - 1000 GB-Hrs 执行时间
  - 团队协作功能

### 讯飞 API 定价

- 查看讯飞官网最新定价
- 通常按调用次数计费
- 新用户可能有免费额度

## 后续优化

1. **添加服务端代理**
   - 保护 API 密钥
   - 统一错误处理

2. **实现用户认证**
   - 使用 NextAuth.js
   - 记录用户练习历史

3. **添加数据库**
   - 使用 Vercel Postgres
   - 存储学习记录

4. **性能监控**
   - 集成 Vercel Analytics
   - 监控 API 调用频率

5. **错误追踪**
   - 集成 Sentry
   - 实时错误报警

---

**部署成功后，记得测试所有功能！** 🎉

