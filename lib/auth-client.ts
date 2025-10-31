// 客户端认证工具函数

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * 登录
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

/**
 * 注册
 */
export async function register(email: string, password: string, name: string): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  return response.json();
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<any> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.user;
}



