-- ============================================
-- AI语音评测系统 - Supabase 数据库表结构
-- ============================================
-- 使用说明：
-- 1. 访问 https://supabase.com 创建项目
-- 2. 进入项目的 SQL Editor
-- 3. 复制粘贴此文件内容并执行
-- ============================================

-- 1️⃣ 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  total_practice_count INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0  -- 总练习时长（秒）
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 用户表注释
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON COLUMN users.id IS '用户唯一标识';
COMMENT ON COLUMN users.name IS '用户姓名';
COMMENT ON COLUMN users.email IS '用户邮箱（登录账号）';
COMMENT ON COLUMN users.password_hash IS 'bcrypt加密后的密码';
COMMENT ON COLUMN users.total_practice_count IS '总练习次数（冗余字段，提升查询性能）';
COMMENT ON COLUMN users.total_practice_time IS '总练习时长（秒）';

-- ============================================

-- 2️⃣ 练习记录表
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('word', 'sentence', 'paragraph')),
  content TEXT NOT NULL,
  audio_url TEXT,
  
  -- 评分数据
  total_score DECIMAL(5,2) NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  fluency DECIMAL(5,2) NOT NULL,
  integrity DECIMAL(5,2) NOT NULL,
  standard DECIMAL(5,2) NOT NULL,
  
  -- 详细结果（JSON格式）
  word_details JSONB,
  raw_result JSONB,
  
  -- 元数据
  duration INTEGER NOT NULL,  -- 录音时长（秒）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 练习记录表索引
CREATE INDEX IF NOT EXISTS idx_practices_user_id ON practices(user_id);
CREATE INDEX IF NOT EXISTS idx_practices_type ON practices(type);
CREATE INDEX IF NOT EXISTS idx_practices_created_at ON practices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practices_user_created ON practices(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practices_user_type ON practices(user_id, type);

-- 练习记录表注释
COMMENT ON TABLE practices IS '练习记录表';
COMMENT ON COLUMN practices.id IS '记录唯一标识';
COMMENT ON COLUMN practices.user_id IS '用户ID（外键）';
COMMENT ON COLUMN practices.type IS '练习类型：word-单词, sentence-句子, paragraph-段落';
COMMENT ON COLUMN practices.content IS '练习的文本内容';
COMMENT ON COLUMN practices.audio_url IS '录音文件URL（可选）';
COMMENT ON COLUMN practices.total_score IS '总分（0-100）';
COMMENT ON COLUMN practices.accuracy IS '准确度分数';
COMMENT ON COLUMN practices.fluency IS '流畅度分数';
COMMENT ON COLUMN practices.integrity IS '完整度分数';
COMMENT ON COLUMN practices.standard IS '标准度分数';
COMMENT ON COLUMN practices.word_details IS '单词级别的详细评测结果（JSON）';
COMMENT ON COLUMN practices.raw_result IS '原始评测结果（JSON）';
COMMENT ON COLUMN practices.duration IS '录音时长（秒）';

-- ============================================

-- 3️⃣ 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 practices 表添加触发器
DROP TRIGGER IF EXISTS update_practices_updated_at ON practices;
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 4️⃣ 触发器：自动更新用户统计数据
CREATE OR REPLACE FUNCTION update_user_practice_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 新增练习记录时，更新用户统计
  IF (TG_OP = 'INSERT') THEN
    UPDATE users
    SET 
      total_practice_count = total_practice_count + 1,
      total_practice_time = total_practice_time + NEW.duration
    WHERE id = NEW.user_id;
  -- 删除练习记录时，更新用户统计
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE users
    SET 
      total_practice_count = GREATEST(0, total_practice_count - 1),
      total_practice_time = GREATEST(0, total_practice_time - OLD.duration)
    WHERE id = OLD.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 为 practices 表添加统计触发器
DROP TRIGGER IF EXISTS update_user_stats_on_practice ON practices;
CREATE TRIGGER update_user_stats_on_practice
  AFTER INSERT OR DELETE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_user_practice_stats();

-- ============================================

-- 5️⃣ 启用行级安全策略 (Row Level Security - RLS)
-- 注意：这里暂时不启用RLS，因为我们使用服务端API控制权限
-- 如果需要启用，可以取消下面的注释

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的数据
-- CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY practices_all_own ON practices FOR ALL USING (auth.uid() = user_id);

-- ============================================

-- 6️⃣ 插入测试数据（可选，用于开发测试）
-- 注意：密码为 "password123" 的 bcrypt hash
-- 如不需要测试数据，可以删除下面的 INSERT 语句

-- INSERT INTO users (name, email, password_hash) VALUES
-- ('测试用户', 'test@example.com', '$2b$10$YourBcryptHashHere');

-- ============================================

-- ✅ 数据库表结构创建完成！
-- 下一步：
-- 1. 复制 .env.example 为 .env
-- 2. 在 Supabase 项目设置中获取 URL 和 Anon Key
-- 3. 填入 .env 文件
-- 4. 重启开发服务器

SELECT 'Database schema created successfully!' AS status;

