# 🚀 快速配置Supabase - 10分钟解决登录问题

## 📋 第一步：创建Supabase账号（2分钟）

1. 访问：https://supabase.com
2. 点击 "Start your project" 或 "Sign Up"
3. 使用GitHub账号登录（最快）或邮箱注册
4. 登录成功后进入控制台

---

## 📦 第二步：创建新项目（3分钟）

1. 点击 "New Project" 按钮
2. 填写项目信息：
   ```
   Name: english-practice （或任意名称）
   Database Password: 设置一个强密码（记住它！）
   Region: Northeast Asia (Seoul) - 选择离您最近的区域
   ```
3. 点击 "Create new project"
4. 等待 1-2 分钟，项目创建中...

---

## 🗄️ 第三步：创建数据库表（3分钟）

1. 项目创建完成后，在左侧菜单找到 **"SQL Editor"**
2. 点击 "New query" 或 直接在编辑器中
3. **复制粘贴以下完整SQL**（全选，一次性执行）：

```sql
-- 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_practice_count INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0
);

-- 创建 practices 表
CREATE TABLE IF NOT EXISTS public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('word', 'sentence', 'paragraph')),
  content TEXT NOT NULL,
  audio_url TEXT,
  total_score DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  fluency DECIMAL(5,2),
  integrity DECIMAL(5,2),
  standard DECIMAL(5,2),
  word_details JSONB,
  raw_result JSONB,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_practices_user_id ON public.practices(user_id);
CREATE INDEX IF NOT EXISTS idx_practices_user_created ON public.practices(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practices_type ON public.practices(type);

-- 自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 practices 表添加触发器
DROP TRIGGER IF EXISTS update_practices_updated_at ON public.practices;
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON public.practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 更新用户统计的触发器函数
CREATE OR REPLACE FUNCTION update_user_practice_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users
    SET 
      total_practice_count = total_practice_count + 1,
      total_practice_time = total_practice_time + COALESCE(NEW.duration, 0)
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET 
      total_practice_count = GREATEST(total_practice_count - 1, 0),
      total_practice_time = GREATEST(total_practice_time - COALESCE(OLD.duration, 0), 0)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为 practices 表添加统计更新触发器
DROP TRIGGER IF EXISTS update_user_stats_on_practice ON public.practices;
CREATE TRIGGER update_user_stats_on_practice
  AFTER INSERT OR DELETE ON public.practices
  FOR EACH ROW
  EXECUTE FUNCTION update_user_practice_stats();
```

4. 点击 **"Run"** 按钮（或按 Ctrl+Enter）
5. 看到 "Success. No rows returned" 表示成功！✅

---

## 🔑 第四步：获取API密钥（1分钟）

1. 在左侧菜单点击 **"Settings"** （设置图标 ⚙️）
2. 点击 **"API"**
3. 找到以下信息（复制保存）：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（一长串）
   ```

---

## ⚙️ 第五步：配置项目环境变量（1分钟）

1. 打开项目根目录的 `.env.local` 文件
2. 添加以下配置（替换成您的实际值）：

```env
# 讯飞语音 API（保持不变）
NEXT_PUBLIC_XFYUN_APP_ID=your_app_id
NEXT_PUBLIC_XFYUN_API_KEY=your_api_key
NEXT_PUBLIC_XFYUN_API_SECRET=your_api_secret

# JWT密钥（保持不变）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ✨ 新增：Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. 保存文件

---

## 🔄 第六步：重启开发服务器

1. 在终端按 **Ctrl + C** 停止当前服务器
2. 重新启动：
   ```bash
   npm run dev
   ```
3. 等待启动完成

---

## ✅ 第七步：测试（2分钟）

### 1. 注册新用户
访问：http://localhost:3000/register
```
姓名：测试用户
邮箱：test@test.com
密码：123456
```

### 2. 退出登录
点击右上角头像 → 退出登录

### 3. 重新登录
访问：http://localhost:3000/login
```
邮箱：test@test.com
密码：123456
```

### 4. 验证成功 🎉
- ✅ 登录成功
- ✅ 刷新页面，依然登录
- ✅ 重启服务器，数据依然存在
- ✅ 问题彻底解决！

---

## 🔍 验证数据库

### 方法1：在Supabase控制台查看
1. 左侧菜单 → "Table Editor"
2. 选择 "users" 表
3. 应该能看到您注册的用户！

### 方法2：在项目中查看
访问：http://localhost:3000/debug
- 应该能看到用户列表

---

## 🎊 完成！

**恭喜！您现在拥有：**
- ✅ 真实的PostgreSQL数据库
- ✅ 用户数据永久保存
- ✅ 登录功能完全正常
- ✅ 支持生产环境部署
- ✅ 免费额度足够使用

---

## 📊 Supabase免费额度

您获得的免费资源：
- ✅ 500MB 数据库空间
- ✅ 50,000 每月活跃用户
- ✅ 2GB 文件存储
- ✅ 无限 API 请求
- ✅ 实时订阅

**足够个人项目和中小型应用使用！**

---

## 🔧 如果遇到问题

### 问题1：SQL执行失败
**解决**：
- 确保完整复制所有SQL代码
- 检查是否有语法错误
- 可以分段执行（先创建表，再创建索引和触发器）

### 问题2：环境变量不生效
**解决**：
- 确保文件名是 `.env.local`（不是 `.env`）
- 确保重启了开发服务器
- 检查URL和Key没有多余空格

### 问题3：连接失败
**解决**：
- 检查Project URL是否正确
- 检查anon key是否完整复制
- 确保Supabase项目已完成创建（不是Creating状态）

---

## 🆚 对比：配置前后

| 项目 | 配置前（内存模式） | 配置后（Supabase） |
|------|------------------|-------------------|
| 数据持久化 | ❌ 不保存 | ✅ 永久保存 |
| 登录功能 | ⚠️ 不稳定 | ✅ 稳定可靠 |
| 刷新页面 | ❌ 数据丢失 | ✅ 数据保留 |
| 重启服务器 | ❌ 数据清空 | ✅ 数据保留 |
| 生产部署 | ❌ 不适合 | ✅ 完全支持 |
| 设置时间 | 0分钟 | 10分钟 |

---

## 💡 温馨提示

1. **保存好数据库密码**：虽然不常用，但很重要
2. **备份环境变量**：将 `.env.local` 文件内容保存到安全的地方
3. **Supabase控制台**：可以随时登录查看和管理数据
4. **免费额度充足**：无需担心费用问题

---

## 🎯 下一步

配置完成后，您可以：
1. ✅ 正常使用所有功能
2. ✅ 测试语音评测功能
3. ✅ 查看学习记录和统计
4. ✅ 部署到生产环境（Vercel）

---

**总耗时：10分钟**  
**难度：⭐⭐☆☆☆（简单）**  
**收益：永久解决登录问题** 🎉

祝配置顺利！如有问题随时询问！

