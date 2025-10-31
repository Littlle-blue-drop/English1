# 🗄️ Supabase 数据库配置指南

本指南帮助您快速设置 Supabase 数据库。

## 📋 前置要求

- GitHub 账号或邮箱账号（用于注册 Supabase）
- 5-10 分钟时间

---

## 🚀 步骤 1：创建 Supabase 项目

### 1.1 注册/登录 Supabase

访问：https://supabase.com

- 点击 "Start your project" 或 "Sign In"
- 使用 GitHub 账号或邮箱注册/登录

### 1.2 创建新项目

1. 点击 "New Project"（新建项目）
2. 选择组织（Organization）
   - 如果是第一次使用，需要先创建组织
   - 组织名称随意，如 "My Projects"
3. 填写项目信息：
   - **Name**（项目名称）：`english-evaluation` 或任意名称
   - **Database Password**（数据库密码）：设置一个强密码（**请妥善保存！**）
   - **Region**（区域）：选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（延迟更低）
   - **Pricing Plan**：选择 **Free（免费）** 即可
4. 点击 "Create new project"
5. 等待 1-2 分钟，项目创建完成

---

## 🔧 步骤 2：执行数据库表结构 SQL

### 2.1 进入 SQL Editor

1. 在 Supabase 项目页面左侧菜单
2. 点击 **"SQL Editor"**（SQL 编辑器）图标

### 2.2 执行 SQL 脚本

1. 点击 "New query"（新建查询）
2. 打开本项目的 `supabase-schema.sql` 文件
3. **复制全部内容**
4. **粘贴到 SQL Editor**
5. 点击右下角 **"Run"**（运行）按钮
6. 看到 ✅ "Success. No rows returned" 即表示成功

### 2.3 验证表是否创建成功

1. 左侧菜单点击 **"Table Editor"**（表编辑器）
2. 应该能看到两个表：
   - ✅ `users` - 用户表
   - ✅ `practices` - 练习记录表

---

## 🔑 步骤 3：获取 API 密钥

### 3.1 进入项目设置

1. 点击左侧菜单最下方的 **齿轮图标⚙️ "Project Settings"**
2. 点击左侧 **"API"** 选项卡

### 3.2 复制关键信息

您会看到以下信息：

```
Project URL
https://xxxxxxxxxxxxx.supabase.co

Project API keys
  - anon public (公开密钥)
  - service_role (服务端密钥 - 请勿泄露！)
```

**复制以下两项**（点击右侧的复制图标）：
1. **Project URL** → 这是 `NEXT_PUBLIC_SUPABASE_URL`
2. **anon public** → 这是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **注意**：不要复制 `service_role` 密钥，我们不需要它。

---

## 📝 步骤 4：配置环境变量

### 4.1 创建 .env 文件

在项目根目录（与 `package.json` 同级）创建 `.env` 文件：

```bash
# Windows 用户在项目根目录新建文件，命名为 .env
# 或者在终端执行：
copy env.example .env
```

### 4.2 填写环境变量

打开 `.env` 文件，填入以下内容：

```env
# 讯飞语音API配置（已有的，保持不变）
NEXT_PUBLIC_XFYUN_APP_ID=你的APPID
NEXT_PUBLIC_XFYUN_API_KEY=你的APIKey
NEXT_PUBLIC_XFYUN_API_SECRET=你的APISecret

# JWT密钥（已有的，保持不变）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ⭐ Supabase配置（新增）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你复制的anon-public-密钥
```

**示例**：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

### 4.3 保存文件

- 按 `Ctrl + S` 保存
- **确保文件名是 `.env`，不是 `.env.txt`**

---

## 🎉 步骤 5：测试连接

### 5.1 重启开发服务器

如果开发服务器正在运行，需要重启以加载新的环境变量：

```bash
# 按 Ctrl + C 停止服务器
# 然后重新启动
npm run dev
```

### 5.2 验证配置

启动后，控制台不应该出现：

❌ `⚠️ Supabase 环境变量未配置，请检查 .env 文件`

如果没有这个警告，说明配置成功！✅

---

## 🔍 常见问题

### Q1: 找不到 `.env` 文件？

**A**: Windows 系统默认隐藏以 `.` 开头的文件。

**解决方案**：
1. 在 VS Code 中直接创建文件
2. 或在文件资源管理器中：
   - 点击"查看"选项卡
   - 勾选"文件扩展名"
   - 勾选"隐藏的项目"

### Q2: 执行 SQL 报错？

**A**: 可能的原因：
1. SQL 没有完整复制
2. 已经执行过一次（重复执行不影响，可以忽略）

**解决方案**：
- 删除已有表，重新执行：
  ```sql
  DROP TABLE IF EXISTS practices;
  DROP TABLE IF EXISTS users;
  ```
- 然后再次执行 `supabase-schema.sql`

### Q3: Supabase 免费版够用吗？

**A**: 完全够用！免费版提供：
- ✅ 500 MB 数据库存储
- ✅ 1 GB 文件存储
- ✅ 50,000 月活跃用户
- ✅ 500 MB 出站流量/月
- ✅ 5 GB 入站流量/月

对于学习和小型项目来说非常充足。

### Q4: 如何查看数据库中的数据？

**A**: 
1. 在 Supabase 控制台
2. 点击 "Table Editor"
3. 选择 `users` 或 `practices` 表
4. 可以直接查看、编辑数据

---

## 🎯 下一步

配置完成后，您可以：

1. ✅ 注册新用户 → 数据会保存到 Supabase
2. ✅ 登录系统 → 从 Supabase 验证
3. ✅ 进行单词/句子/段落测评 → 自动保存记录
4. ✅ 查看学习历史 → 从数据库读取

---

## 📞 需要帮助？

如果遇到问题：
1. 检查 `.env` 文件是否正确配置
2. 查看浏览器控制台是否有错误
3. 查看 Supabase 项目的 "Logs" 查看数据库日志

---

**祝您配置顺利！🚀**

