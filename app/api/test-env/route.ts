import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    hasAppId: !!process.env.NEXT_PUBLIC_XFYUN_APP_ID,
    hasApiKey: !!process.env.NEXT_PUBLIC_XFYUN_API_KEY,
    hasApiSecret: !!process.env.NEXT_PUBLIC_XFYUN_API_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    // 显示前几个字符用于验证
    appIdPrefix: process.env.NEXT_PUBLIC_XFYUN_APP_ID?.substring(0, 4) || 'missing',
    apiKeyPrefix: process.env.NEXT_PUBLIC_XFYUN_API_KEY?.substring(0, 4) || 'missing',
    serverTime: new Date().toUTCString(),
  };

  return NextResponse.json(envVars);
}

