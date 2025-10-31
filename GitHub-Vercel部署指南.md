# 🚀 GitHub + Vercel 远程部署完整指南

本文档将指导您完成从本地开发到远程部署的完整流程，让用户可以通过互联网访问您的应用。

---

## 📋 前置准备清单

在开始部署前，请确保已完成以下准备工作：

### ✅ 必需项
- [ ] **GitHub账号** - 如果没有，访问 https://github.com 注册
- [ ] **Vercel账号** - 如果没有，访问 https://vercel.com 注册（可用GitHub账号登录）
- [ ] **Supabase项目** - 已完成数据库配置（参考`快速配置Supabase-10分钟.md`）
- [ ] **讯飞API密钥** - 已获取APPID、APIKey、APISecret
- [ ] **环境变量** - 本地`.env.local`文件已配置完成

### 📝 准备信息清单
请准备好以下信息，部署时会用到：

```
✅ GitHub仓库名称（例如：english-practice-app）
✅ Supabase项目URL（例如：https://xxxxx.supabase.co）
✅ Supabase匿名密钥（anon public key）
✅ 讯飞APP_ID
✅ 讯飞API_KEY
✅ 讯飞API_SECRET
✅ JWT_SECRET（生产环境用强随机字符串）
```

---

## 第一步：初始化Git仓库并推送到GitHub

### 1.1 初始化Git仓库

在项目根目录打开终端（PowerShell或CMD），执行：

```bash
# 进入项目目录
cd f:\cursor\20251014English2.4

# 初始化Git仓库
git init

# 添加所有文件（.env.local会被.gitignore自动忽略）
git add .

# 提交代码
git commit -m "Initial commit: AI语音评测系统 v0.3.0"
```

### 1.2 创建GitHub仓库

1. 访问 https://github.com 并登录
2. 点击右上角 **"+"** → **"New repository"**
3. 填写仓库信息：
   ```
   Repository name: english-practice-app（或您喜欢的名称）
   Description: AI语音评测系统 - 在线英语口语练习平台
   Visibility: Public（或Private，根据需求选择）
   ```
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **"Create repository"**

### 1.3 连接本地仓库并推送

GitHub会显示仓库创建成功页面，复制页面上的命令（或使用以下命令）：

```bash
# 添加远程仓库（将YOUR_USERNAME和REPO_NAME替换为您的实际值）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 重命名主分支为main（如果需要）
git branch -M main

# 推送到GitHub
git push -u origin main
```

**示例：**
```bash
git remote add origin https://github.com/john/english-practice-app.git
git branch -M main
git push -u origin main
```

**如果遇到认证问题：**
- GitHub已不再支持密码认证，需要使用Personal Access Token
- 访问 https://github.com/settings/tokens 创建token
- 或者在推送时使用GitHub CLI：`gh auth login`

### 1.4 验证推送成功

访问您的GitHub仓库页面，应该能看到所有代码文件。

---

## 第二步：在Vercel部署项目

### 2.1 登录Vercel

1. 访问 https://vercel.com
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**（推荐，方便后续自动部署）

### 2.2 导入项目

1. 登录后，点击 **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 中找到您的GitHub仓库
3. 点击 **"Import"**

### 2.3 配置项目设置

Vercel会自动检测到Next.js项目，配置如下：

```
Framework Preset: Next.js（自动检测）
Root Directory: ./
Build Command: npm run build（自动检测）
Output Directory: .next（自动检测）
Install Command: npm install（自动检测）
```

**⚠️ 重要：** 在点击"Deploy"之前，先配置环境变量！

---

## 第三步：配置Vercel环境变量

### 3.1 进入环境变量设置

在部署页面，找到 **"Environment Variables"** 部分，点击展开。

### 3.2 添加所有必需的环境变量

点击 **"Add"** 按钮，逐个添加以下环境变量：

| 变量名 | 值 | 环境 | 说明 |
|--------|-----|------|------|
| `NEXT_PUBLIC_XFYUN_APP_ID` | 您的讯飞APP_ID | Production, Preview, Development | 讯飞应用ID |
| `NEXT_PUBLIC_XFYUN_API_KEY` | 您的讯飞API_KEY | Production, Preview, Development | 讯飞API密钥 |
| `NEXT_PUBLIC_XFYUN_API_SECRET` | 您的讯飞API_SECRET | Production, Preview, Development | 讯飞API密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | 您的Supabase URL | Production, Preview, Development | Supabase项目URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的Supabase匿名密钥 | Production, Preview, Development | Supabase公开密钥 |
| `JWT_SECRET` | 强随机字符串（32+字符） | Production, Preview, Development | JWT签名密钥 |

**⚠️ 重要提示：**

1. **JWT_SECRET生成方法：**
   ```bash
   # 在终端执行（任选一种）
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # 或
   openssl rand -hex 32
   ```
   
2. **环境选择：**
   - 勾选 **Production**（生产环境）
   - 勾选 **Preview**（预览环境，用于PR测试）
   - 勾选 **Development**（开发环境，可选）

3. **变量命名：**
   - 确保变量名完全一致（区分大小写）
   - `NEXT_PUBLIC_` 前缀的变量会暴露到客户端
   - `JWT_SECRET` 不要加 `NEXT_PUBLIC_` 前缀（保持私密）

### 3.3 保存并继续

添加完所有环境变量后，点击 **"Deploy"** 按钮。

---

## 第四步：等待部署完成

### 4.1 查看构建日志

部署过程中，Vercel会显示实时构建日志：

```
✓ Cloning repository
✓ Installing dependencies
✓ Building project
✓ Generating static pages
✓ Deploying to production
```

**常见构建时间：** 2-5分钟

### 4.2 部署成功

看到 **"Congratulations! Your project has been deployed."** 表示部署成功！

您会看到：
- ✅ 部署URL（例如：`https://your-project.vercel.app`）
- ✅ 部署时间
- ✅ 构建信息

---

## 第五步：验证部署

### 5.1 访问生产站点

点击部署URL，访问您的应用。

### 5.2 功能测试清单

逐项测试以下功能：

- [ ] ✅ **首页加载** - 访问根路径，页面正常显示
- [ ] ✅ **用户注册** - 测试注册新用户功能
- [ ] ✅ **用户登录** - 测试登录功能
- [ ] ✅ **用户菜单** - 登录后右上角显示用户信息
- [ ] ✅ **登出功能** - 测试退出登录
- [ ] ✅ **单词跟读** - 测试语音评测功能
- [ ] ✅ **句子跟读** - 测试句子评测功能
- [ ] ✅ **段落朗读** - 测试段落评测功能
- [ ] ✅ **学习记录** - 查看历史记录页面
- [ ] ✅ **数据持久化** - 刷新页面，数据依然存在

### 5.3 常见问题排查

**问题1：页面显示"环境变量未配置"**
- **解决**：检查Vercel环境变量是否全部添加
- **解决**：确认变量名拼写正确
- **解决**：重新部署（修改环境变量后需要重新部署）

**问题2：登录功能不工作**
- **解决**：检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
- **解决**：检查Supabase数据库表是否已创建
- **解决**：查看浏览器控制台错误信息

**问题3：语音评测失败**
- **解决**：检查讯飞API密钥是否正确
- **解决**：确认讯飞账户余额充足
- **解决**：检查浏览器是否授予麦克风权限（需要HTTPS）

**问题4：构建失败**
- **解决**：查看Vercel构建日志中的错误信息
- **解决**：确认`package.json`中的依赖版本正确
- **解决**：检查代码中是否有语法错误

---

## 第六步：配置自定义域名（可选）

### 6.1 添加域名

1. 在Vercel项目页面，点击 **"Settings"** → **"Domains"**
2. 输入您的域名（例如：`english.example.com`）
3. 点击 **"Add"**

### 6.2 配置DNS

按照Vercel提示配置DNS记录：

**CNAME记录：**
```
类型: CNAME
名称: english（或@）
值: cname.vercel-dns.com
```

或使用**A记录**（推荐）：
```
类型: A
名称: @
值: 76.76.21.21
```

### 6.3 等待DNS生效

DNS配置后，等待几分钟到几小时生效。Vercel会自动为您的域名配置SSL证书。

---

## 第七步：设置自动部署（推荐）

### 7.1 自动部署已启用

如果使用GitHub集成，Vercel默认已启用自动部署：

- ✅ 推送到 `main` 分支 → 自动部署到生产环境
- ✅ 创建Pull Request → 自动创建预览部署
- ✅ 提交代码 → 自动触发构建

### 7.2 验证自动部署

1. 修改本地代码（例如：修改README.md）
2. 提交并推送：
   ```bash
   git add .
   git commit -m "测试自动部署"
   git push origin main
   ```
3. 访问Vercel Dashboard，应该看到新的部署任务

---

## 📊 部署后管理

### 查看部署历史

在Vercel项目页面，可以看到所有部署记录：
- 部署时间
- 构建状态
- Git提交信息
- 部署URL

### 回滚部署

如果新版本有问题，可以快速回滚：

1. 在Deployments页面找到之前的部署
2. 点击 **"..."** → **"Promote to Production"**
3. 确认回滚

### 查看日志

1. 点击部署记录
2. 查看 **"Functions"** 标签页
3. 查看实时日志和错误信息

### 环境变量管理

随时可以在 **Settings → Environment Variables** 中：
- 添加新变量
- 修改现有变量
- 删除变量

**⚠️ 注意：** 修改环境变量后需要重新部署才会生效。

---

## 🔒 安全建议

### 1. 保护敏感信息

- ✅ `.env.local` 已添加到 `.gitignore`（不会提交到GitHub）
- ✅ `JWT_SECRET` 不要加 `NEXT_PUBLIC_` 前缀
- ✅ 不要在代码中硬编码密钥

### 2. 定期更新依赖

```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 提交更新
git add package*.json
git commit -m "更新依赖"
git push
```

### 3. 监控和日志

- 定期查看Vercel日志
- 监控Supabase数据库使用情况
- 关注讯飞API调用次数

---

## 📈 Vercel免费额度

您获得的免费资源：

- ✅ **100GB 带宽/月**
- ✅ **无限部署**
- ✅ **100GB 函数执行时间/月**
- ✅ **自动HTTPS**
- ✅ **全球CDN**
- ✅ **自动备份**

**足够个人项目和小型应用使用！**

---

## 🎉 部署完成！

恭喜！您的应用现在已经：

- ✅ 可以通过互联网访问
- ✅ 自动HTTPS加密
- ✅ 全球CDN加速
- ✅ 自动部署更新
- ✅ 完整的数据持久化

---

## 📞 获取帮助

如果遇到问题：

1. **查看Vercel文档**：https://vercel.com/docs
2. **查看构建日志**：在Vercel Dashboard查看详细错误
3. **检查环境变量**：确认所有变量都已正确配置
4. **查看Supabase日志**：在Supabase Dashboard查看数据库错误

---

## 📝 快速命令参考

```bash
# 本地开发
npm run dev

# 构建测试
npm run build

# 推送到GitHub
git add .
git commit -m "提交信息"
git push origin main

# 查看部署状态
vercel ls

# 查看环境变量
vercel env ls
```

---

**祝部署顺利！如有问题随时查看此文档或联系支持。** 🚀

