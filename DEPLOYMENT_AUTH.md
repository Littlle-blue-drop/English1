# 带认证功能的部署指南

## 📋 部署前检查清单

在部署到生产环境前，请确保完成以下检查：

### ✅ 环境变量配置

#### 必需的环境变量
```env
# 讯飞语音API
NEXT_PUBLIC_XFYUN_APP_ID=your_app_id
NEXT_PUBLIC_XFYUN_API_KEY=your_api_key
NEXT_PUBLIC_XFYUN_API_SECRET=your_api_secret

# JWT密钥（必须修改！）
JWT_SECRET=your-production-jwt-secret-here
```

#### ⚠️ 重要：生成强JWT密钥

**绝不要**在生产环境使用默认的JWT_SECRET！

生成强密钥的方法：

**方法1：使用Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**方法2：使用OpenSSL**
```bash
openssl rand -hex 32
```

**方法3：使用在线工具**
- https://generate-secret.vercel.app/32
- https://www.random.org/strings/

将生成的密钥设置为 `JWT_SECRET` 环境变量。

### ✅ 数据库准备

#### 当前状态（v0.2.0）
- 使用内存存储
- **不适合生产环境**
- 服务器重启后数据丢失

#### 生产环境建议
在部署到生产环境前，**强烈建议**集成真实数据库：

**推荐方案：**

1. **MongoDB Atlas**（推荐用于快速部署）
   ```bash
   npm install mongoose
   ```

2. **Supabase**（推荐用于PostgreSQL）
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Vercel Postgres**
   ```bash
   npm install @vercel/postgres
   ```

4. **PlanetScale**（MySQL兼容）
   ```bash
   npm install @planetscale/database
   ```

参考 `AUTH_IMPLEMENTATION.md` 中的数据库集成示例。

## 🚀 Vercel 部署步骤

### 1. 准备工作

1. 将代码推送到GitHub仓库
2. 确保 `.gitignore` 包含敏感文件：
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

### 2. 在Vercel创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 选择 "Next.js" 框架预设

### 3. 配置环境变量

在Vercel项目设置中添加环境变量：

**导航路径：**
```
Project → Settings → Environment Variables
```

**添加以下变量：**

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_XFYUN_APP_ID` | 你的讯飞APP ID | Production, Preview, Development |
| `NEXT_PUBLIC_XFYUN_API_KEY` | 你的讯飞API Key | Production, Preview, Development |
| `NEXT_PUBLIC_XFYUN_API_SECRET` | 你的讯飞API Secret | Production, Preview, Development |
| `JWT_SECRET` | 强随机字符串（32+字符） | Production, Preview, Development |

⚠️ **注意**：
- `NEXT_PUBLIC_` 前缀的变量会暴露到客户端
- `JWT_SECRET` 不要加 `NEXT_PUBLIC_` 前缀（保持私密）

### 4. 部署

点击 "Deploy" 按钮，Vercel会自动：
1. 构建你的应用
2. 运行测试（如果有）
3. 部署到全球CDN

### 5. 验证部署

部署完成后，访问你的Vercel域名：

1. ✅ 检查首页是否正常加载
2. ✅ 测试注册功能
3. ✅ 测试登录功能
4. ✅ 测试登出功能
5. ✅ 检查用户菜单显示
6. ✅ 测试语音评测功能

## 🔧 其他平台部署

### Netlify

1. **环境变量设置**
   ```
   Site settings → Build & deploy → Environment
   ```

2. **构建配置**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

### Railway

1. **创建新项目**
2. **连接GitHub仓库**
3. **添加环境变量**
4. **部署**

### Docker部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
```

构建和运行：
```bash
docker build -t voice-evaluation-app .
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e NEXT_PUBLIC_XFYUN_APP_ID=your-app-id \
  -e NEXT_PUBLIC_XFYUN_API_KEY=your-api-key \
  -e NEXT_PUBLIC_XFYUN_API_SECRET=your-api-secret \
  voice-evaluation-app
```

## 🔒 安全最佳实践

### 1. HTTPS必须启用

确保生产环境使用HTTPS：
- Vercel自动提供HTTPS
- 自托管需要配置SSL证书

### 2. Cookie安全

代码已自动处理：
```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,                              // 防止XSS
  secure: process.env.NODE_ENV === 'production',  // 仅HTTPS
  sameSite: 'lax',                            // 防止CSRF
  maxAge: 60 * 60 * 24 * 7,                  // 7天
  path: '/',
});
```

### 3. 环境变量安全

- ✅ 不要将 `.env` 文件提交到Git
- ✅ 使用强随机的JWT_SECRET
- ✅ 定期轮换密钥
- ✅ 区分开发和生产环境的密钥

### 4. 密码策略

当前要求：
- 最少6个字符
- bcrypt加密（10 rounds）

**建议增强（未来版本）：**
- 最少8个字符
- 包含大小写字母、数字、特殊字符
- 密码强度检测
- 防暴力破解（速率限制）

### 5. API安全

**建议实现（未来版本）：**
- 请求频率限制
- IP白名单
- API密钥轮换
- 请求签名验证

## 📊 监控和日志

### 推荐工具

1. **Vercel Analytics**
   - 自动集成
   - 页面性能监控
   - 用户访问分析

2. **Sentry**（错误追踪）
   ```bash
   npm install @sentry/nextjs
   ```

3. **LogRocket**（会话回放）
   ```bash
   npm install logrocket
   ```

### 重要指标

监控以下指标：
- 注册成功率
- 登录成功率
- 会话时长
- API响应时间
- 错误率

## 🔄 持续部署

### GitHub Actions示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 部署前测试

### 本地生产构建测试

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 访问 http://localhost:3000 测试
```

### 测试清单

- [ ] 注册新用户
- [ ] 登录已有用户
- [ ] 登出功能
- [ ] 会话持久性
- [ ] 错误处理
- [ ] 移动端响应式
- [ ] 语音评测功能
- [ ] 页面加载速度
- [ ] 无控制台错误

## 🐛 故障排查

### 问题1：JWT_SECRET未设置

**症状**：登录后立即登出，或无法保持会话

**解决**：
1. 检查Vercel环境变量是否设置了 `JWT_SECRET`
2. 确认变量名拼写正确（区分大小写）
3. 重新部署应用

### 问题2：Cookie无法设置

**症状**：登录成功但刷新后显示未登录

**解决**：
1. 确保使用HTTPS（localhost除外）
2. 检查浏览器Cookie设置
3. 查看浏览器控制台的Cookie警告

### 问题3：环境变量不生效

**症状**：配置了环境变量但应用仍使用默认值

**解决**：
1. 确认环境变量名以 `NEXT_PUBLIC_` 开头（客户端使用的变量）
2. 修改环境变量后需要重新部署
3. 清除浏览器缓存

### 问题4：数据丢失

**症状**：用户注册后无法登录，或数据随机丢失

**原因**：使用内存存储，服务器重启后数据丢失

**解决**：
1. 集成真实数据库（强烈建议）
2. 或接受这是开发版本的限制

## 📚 相关文档

- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - 认证系统实现详情
- [LOGIN_GUIDE.md](LOGIN_GUIDE.md) - 登录功能使用指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 基础部署指南
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 问题排查指南

## 🆘 获取帮助

如果遇到部署问题：

1. 查看Vercel构建日志
2. 检查浏览器控制台错误
3. 查阅相关文档
4. 在GitHub提交Issue

---

**部署建议**：
- 生产环境部署前必须集成真实数据库
- 定期备份数据
- 监控应用性能和错误
- 及时更新依赖包

**安全提醒**：
- 使用强JWT密钥
- 启用HTTPS
- 定期审查安全日志
- 保持依赖包更新

祝部署顺利！🚀



