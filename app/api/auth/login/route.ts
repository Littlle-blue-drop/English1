import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请填写邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证用户
    const user = await verifyUser(email, password);

    // 生成token
    const token = generateToken(user);

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user,
    });

    // 设置cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '登录失败，请稍后重试' 
      },
      { status: 401 }
    );
  }
}



