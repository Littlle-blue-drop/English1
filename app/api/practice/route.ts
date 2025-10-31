import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 💾 内存存储（回退方案）
let memoryPractices: any[] = [];

/**
 * POST /api/practice
 * 保存练习记录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      type,
      content,
      total_score,
      accuracy,
      fluency,
      integrity,
      standard,
      word_details,
      raw_result,
      duration,
      audio_url,
    } = body;

    // 验证必填字段
    if (!type || !content || total_score === undefined || duration === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证类型
    if (!['word', 'sentence', 'paragraph'].includes(type)) {
      return NextResponse.json(
        { error: '无效的练习类型' },
        { status: 400 }
      );
    }

    // 🗄️ 使用 Supabase 数据库
    if (isSupabaseConfigured()) {
      const practiceData = {
        user_id: user.id,
        type: type as 'word' | 'sentence' | 'paragraph',
        content,
        total_score: parseFloat(total_score),
        accuracy: parseFloat(accuracy || 0),
        fluency: parseFloat(fluency || 0),
        integrity: parseFloat(integrity || 0),
        standard: parseFloat(standard || 0),
        word_details: word_details || null,
        raw_result: raw_result || null,
        duration: parseInt(duration),
        audio_url: audio_url || null,
      };

      const { data, error } = await (supabase as any)
        .from('practices')
        .insert([practiceData])
        .select()
        .single();

      if (error) {
        console.error('Supabase 保存练习记录错误:', error);
        return NextResponse.json(
          { error: '保存记录失败' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: data.id,
          type: data.type,
          content: data.content,
          total_score: data.total_score,
          created_at: data.created_at,
        },
      });
    } 
    
    // 💾 回退到内存存储
    else {
      console.warn('⚠️ Supabase 未配置，使用内存存储');
      
      const practice = {
        id: Date.now().toString(),
        user_id: user.id,
        type,
        content,
        total_score: parseFloat(total_score),
        accuracy: parseFloat(accuracy || 0),
        fluency: parseFloat(fluency || 0),
        integrity: parseFloat(integrity || 0),
        standard: parseFloat(standard || 0),
        word_details: word_details || null,
        raw_result: raw_result || null,
        duration: parseInt(duration),
        audio_url: audio_url || null,
        created_at: new Date().toISOString(),
      };

      memoryPractices.push(practice);

      return NextResponse.json({
        success: true,
        data: {
          id: practice.id,
          type: practice.type,
          content: practice.content,
          total_score: practice.total_score,
          created_at: practice.created_at,
        },
      });
    }
  } catch (error: any) {
    console.error('保存练习记录错误:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/practice
 * 获取当前用户的练习记录列表
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // word, sentence, paragraph
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 🗄️ 使用 Supabase 数据库
    if (isSupabaseConfigured()) {
      let query = (supabase as any)
        .from('practices')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // 按类型筛选
      if (type && ['word', 'sentence', 'paragraph'].includes(type)) {
        query = query.eq('type', type);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase 查询练习记录错误:', error);
        return NextResponse.json(
          { error: '查询记录失败' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        total: count || 0,
        limit,
        offset,
      });
    } 
    
    // 💾 回退到内存存储
    else {
      let filtered = memoryPractices.filter(p => p.user_id === user.id);

      // 按类型筛选
      if (type && ['word', 'sentence', 'paragraph'].includes(type)) {
        filtered = filtered.filter(p => p.type === type);
      }

      // 排序（最新的在前）
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 分页
      const paginated = filtered.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: paginated,
        total: filtered.length,
        limit,
        offset,
      });
    }
  } catch (error: any) {
    console.error('查询练习记录错误:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

