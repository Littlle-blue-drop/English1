# ⚡ Vercel 快速部署指南（5分钟完成）

## 🎯 快速步骤

### 第一步：访问 Vercel 并导入项目（1分钟）

1. 访问 https://vercel.com
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**（推荐）
4. 点击 **"Add New..."** → **"Project"**
5. 找到 **"English1"** 仓库，点击 **"Import"**

---

### 第二步：配置环境变量（3分钟） ⚠️ 重要！

**在点击 Deploy 之前，必须先配置环境变量！**

在 **"Environment Variables"** 部分，添加以下6个变量：

#### 1. 讯飞 API 配置（3个变量）

```
名称: NEXT_PUBLIC_XFYUN_APP_ID
值: 68e8f7dc
环境: ✅ Production ✅ Preview ✅ Development
```

```
名称: NEXT_PUBLIC_XFYUN_API_KEY
值: 5bcb3b65355065be495f97c90ab9b330
环境: ✅ Production ✅ Preview ✅ Development
```

```
名称: NEXT_PUBLIC_XFYUN_API_SECRET
值: NDFhZDgyMzk3ZTZhNzk4YjFhNmY4M2Zl
环境: ✅ Production ✅ Preview ✅ Development
```

#### 2. Supabase 配置（2个变量）

```
名称: NEXT_PUBLIC_SUPABASE_URL
值: [您的 Supabase URL]
环境: ✅ Production ✅ Preview ✅ Development
```

```
名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: [您的 Supabase 匿名密钥]
环境: ✅ Production ✅ Preview ✅ Development
```

#### 3. JWT 密钥（1个变量）

```
名称: JWT_SECRET
值: [生成一个强随机字符串]
环境: ✅ Production ✅ Preview ✅ Development
```

**生成 JWT_SECRET 的方法：**

在本地终端执行以下命令之一：

```bash
# 方法1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法2：使用 OpenSSL
openssl rand -hex 32
```

复制生成的字符串作为 JWT_SECRET 的值。

---

### 第三步：开始部署（1分钟）

1. 确认所有环境变量都已添加
2. 点击 **"Deploy"** 按钮
3. 等待2-5分钟构建完成

---

## ✅ 部署完成检查

部署成功后，您会看到：
- 🎉 "Congratulations!" 成功消息
- 🔗 部署URL（例如：`https://english1.vercel.app`）

点击URL访问您的应用，测试以下功能：

- [ ] 首页正常加载
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 单词跟读
- [ ] 句子跟读
- [ ] 段落朗读
- [ ] 学习记录查看

---

## 🔄 自动部署已启用

以后每次推送代码到 GitHub，Vercel 会自动部署：

```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push origin main

# Vercel 会自动部署新版本
```

---

## 🚨 常见问题

### 问题1：环境变量配置错误

**症状：** 页面显示"环境变量未配置"或功能无法使用

**解决：**
1. 进入 Vercel Dashboard
2. 点击项目 → **Settings** → **Environment Variables**
3. 检查所有变量是否正确添加
4. 修改后点击 **Deployments** → **Redeploy**

### 问题2：Supabase 连接失败

**症状：** 登录注册功能不工作

**解决：**
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
2. 检查 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
3. 确认 Supabase 数据库表已创建（参考 `supabase-schema.sql`）

### 问题3：语音评测失败

**症状：** 录音功能不工作

**解决：**
1. 检查讯飞 API 密钥是否正确
2. 确认讯飞账户余额充足
3. 确保使用 HTTPS（Vercel 自动提供）

---

## 📞 需要帮助？

- 📖 详细文档：查看 `GitHub-Vercel部署指南.md`
- 🔧 Vercel 文档：https://vercel.com/docs
- 💾 Supabase 文档：https://supabase.com/docs

---

**祝部署顺利！🚀**

