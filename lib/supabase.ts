import { createClient } from '@supabase/supabase-js';

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
          total_practice_count: number;
          total_practice_time: number;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          total_practice_count?: number;
          total_practice_time?: number;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          total_practice_count?: number;
          total_practice_time?: number;
        };
      };
      practices: {
        Row: {
          id: string;
          user_id: string;
          type: 'word' | 'sentence' | 'paragraph';
          content: string;
          audio_url: string | null;
          total_score: number;
          accuracy: number;
          fluency: number;
          integrity: number;
          standard: number;
          word_details: any;
          raw_result: any;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'word' | 'sentence' | 'paragraph';
          content: string;
          audio_url?: string | null;
          total_score: number;
          accuracy: number;
          fluency: number;
          integrity: number;
          standard: number;
          word_details?: any;
          raw_result?: any;
          duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'word' | 'sentence' | 'paragraph';
          content?: string;
          audio_url?: string | null;
          total_score?: number;
          accuracy?: number;
          fluency?: number;
          integrity?: number;
          standard?: number;
          word_details?: any;
          raw_result?: any;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// 创建 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 辅助函数：检查 Supabase 是否已配置
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');
}

// 只在已配置时创建客户端，否则使用一个 mock 对象避免构建错误
export const supabase = isSupabaseConfigured() 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');

