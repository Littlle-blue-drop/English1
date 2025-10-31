import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from './supabase';

// JWT密钥（在生产环境应该使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// 用户类型定义
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

// 不包含密码的用户信息
export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

// 🔄 兼容模式：如果 Supabase 未配置，使用内存存储（用于开发测试）
let memoryUsers: User[] = [];

/**
 * 注册新用户
 */
export async function registerUser(email: string, password: string, name: string): Promise<UserWithoutPassword> {
  // 对密码进行加密
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🗄️ 使用 Supabase 数据库
  if (isSupabaseConfigured()) {
    // 检查邮箱是否已存在
    const { data: existingUser } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }

    // 插入新用户
    const { data, error } = await (supabase as any)
      .from('users')
      .insert({
        name,
        email,
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase 注册错误:', error);
      throw new Error('注册失败，请稍后重试');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: new Date(data.created_at),
    };
  } 
  
  // 💾 回退到内存存储（开发模式）
  else {
    console.warn('⚠️ Supabase 未配置，使用内存存储（数据将在服务器重启后丢失）');
    
    const existingUser = memoryUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    memoryUsers.push(newUser);
    console.log(`✅ 用户注册成功: ${email}, 当前用户总数: ${memoryUsers.length}`);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}

/**
 * 验证用户登录
 */
export async function verifyUser(email: string, password: string): Promise<UserWithoutPassword> {
  // 🗄️ 使用 Supabase 数据库
  if (isSupabaseConfigured()) {
    // 查找用户
    const { data: user, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('邮箱或密码错误');
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('邮箱或密码错误');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  } 
  
  // 💾 回退到内存存储（开发模式）
  else {
    console.log(`🔍 尝试登录: ${email}, 内存中用户总数: ${memoryUsers.length}`);
    console.log(`📋 内存中的用户列表: ${memoryUsers.map(u => u.email).join(', ')}`);
    
    const user = memoryUsers.find(u => u.email === email);
    if (!user) {
      console.error(`❌ 找不到用户: ${email}`);
      throw new Error('邮箱或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.error(`❌ 密码错误: ${email}`);
      throw new Error('邮箱或密码错误');
    }

    console.log(`✅ 登录成功: ${email}`);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

/**
 * 生成JWT token
 */
export function generateToken(user: UserWithoutPassword): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('无效的token');
  }
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<UserWithoutPassword | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    
    // 🗄️ 使用 Supabase 数据库
    if (isSupabaseConfigured()) {
      const { data: user, error } = await (supabase as any)
        .from('users')
        .select('id, email, name, created_at')
        .eq('id', payload.userId)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.created_at),
      };
    } 
    
    // 💾 回退到内存存储
    else {
      const user = memoryUsers.find(u => u.id === payload.userId);
      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  } catch (error) {
    return null;
  }
}

/**
 * 根据用户ID获取用户信息
 */
export async function getUserById(userId: string): Promise<UserWithoutPassword | null> {
  // 🗄️ 使用 Supabase 数据库
  if (isSupabaseConfigured()) {
    const { data: user, error } = await (supabase as any)
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
  } 
  
  // 💾 回退到内存存储
  else {
    const user = memoryUsers.find(u => u.id === userId);
    if (!user) {
      return null;
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

/**
 * 获取所有用户（仅用于开发调试）
 */
export async function getAllUsers(): Promise<UserWithoutPassword[]> {
  // 🗄️ 使用 Supabase 数据库
  if (isSupabaseConfigured()) {
    const { data: users, error } = await (supabase as any)
      .from('users')
      .select('id, email, name, created_at');

    if (error || !users) {
      return [];
    }

    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
    }));
  } 
  
  // 💾 回退到内存存储
  else {
    return memoryUsers.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}



