import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';

/**
 * 调试接口：查看内存中的所有用户
 * 仅用于开发环境
 * GET /api/debug/users
 */
export async function GET() {
  // 仅在开发环境允许
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '此接口仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
      message: '用户列表（密码已自动过滤）'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取用户列表失败' 
      },
      { status: 500 }
    );
  }
}

