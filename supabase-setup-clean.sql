-- ====================================
-- Supabase 数据库初始化脚本
-- 直接复制全部内容到 Supabase SQL Editor 执行
-- ====================================

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

-- 执行完成提示
DO $$
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ 数据库初始化完成！';
  RAISE NOTICE '已创建表：users, practices';
  RAISE NOTICE '已创建索引：4个';
  RAISE NOTICE '已创建触发器：3个';
  RAISE NOTICE '=================================';
END $$;

