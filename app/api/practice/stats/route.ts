import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 💾 内存存储的练习记录（从主 route.ts 导入会有问题，所以这里重新声明）
// 注意：实际生产环境应该使用数据库
const getMemoryPractices = () => {
  // 这里需要访问 route.ts 中的 memoryPractices
  // 为了简化，我们暂时返回空数组，实际应该共享状态
  return [];
};

/**
 * GET /api/practice/stats
 * 获取用户的练习统计数据
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

    // 🗄️ 使用 Supabase 数据库
    if (isSupabaseConfigured()) {
      // 获取总体统计
      const { data: practices, error } = await (supabase as any)
        .from('practices')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase 查询统计错误:', error);
        return NextResponse.json(
          { error: '查询统计失败' },
          { status: 500 }
        );
      }

      const stats = calculateStats(practices || []);
      
      return NextResponse.json({
        success: true,
        data: stats,
      });
    } 
    
    // 💾 回退到内存存储
    else {
      const practices = getMemoryPractices().filter((p: any) => p.user_id === user.id);
      const stats = calculateStats(practices);
      
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }
  } catch (error: any) {
    console.error('查询统计错误:', error);
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 计算统计数据
 */
function calculateStats(practices: any[]) {
  const total = practices.length;
  
  if (total === 0) {
    return {
      total_count: 0,
      total_duration: 0,
      average_score: 0,
      best_score: 0,
      by_type: {
        word: { count: 0, avg_score: 0 },
        sentence: { count: 0, avg_score: 0 },
        paragraph: { count: 0, avg_score: 0 },
      },
      recent_7_days: [],
    };
  }

  // 总时长
  const totalDuration = practices.reduce((sum, p) => sum + (p.duration || 0), 0);

  // 平均分和最高分
  const scores = practices.map(p => p.total_score);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const bestScore = Math.max(...scores);

  // 按类型统计
  const byType = {
    word: {
      count: practices.filter(p => p.type === 'word').length,
      avg_score: 0,
    },
    sentence: {
      count: practices.filter(p => p.type === 'sentence').length,
      avg_score: 0,
    },
    paragraph: {
      count: practices.filter(p => p.type === 'paragraph').length,
      avg_score: 0,
    },
  };

  // 计算各类型平均分
  ['word', 'sentence', 'paragraph'].forEach(type => {
    const typePractices = practices.filter(p => p.type === type);
    if (typePractices.length > 0) {
      byType[type as keyof typeof byType].avg_score = 
        typePractices.reduce((sum, p) => sum + p.total_score, 0) / typePractices.length;
    }
  });

  // 最近7天练习数量
  const now = new Date();
  const recent7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = practices.filter(p => {
      const practiceDate = new Date(p.created_at).toISOString().split('T')[0];
      return practiceDate === dateStr;
    }).length;

    recent7Days.push({
      date: dateStr,
      count,
    });
  }

  return {
    total_count: total,
    total_duration: totalDuration,
    average_score: Math.round(averageScore * 100) / 100,
    best_score: Math.round(bestScore * 100) / 100,
    by_type: byType,
    recent_7_days: recent7Days,
  };
}

