'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function DebugPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      setError('请求失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 调试面板
              </h1>
              <p className="text-gray-600">
                查看内存中的用户数据（仅用于开发环境）
              </p>
            </div>
            <Link href="/">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                返回首页
              </button>
            </Link>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={loadUsers}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              🔄 刷新数据
            </button>
            <Link href="/register">
              <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                ➕ 注册新用户
              </button>
            </Link>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            👥 用户列表 {!loading && `(共 ${users.length} 个)`}
          </h2>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">❌ {error}</p>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">📭 暂无用户数据</p>
              <Link href="/register">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  去注册
                </button>
              </Link>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                        <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">📧 邮箱：</span>
                          <span className="font-mono text-gray-700">{user.email}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">🆔 ID：</span>
                          <span className="font-mono text-xs text-gray-600">{user.id}</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">📅 注册时间：</span>
                          <span className="text-gray-700">
                            {new Date(user.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 重要提示</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 当前使用<strong>内存存储</strong>模式，数据在服务器重启后会丢失</li>
            <li>• 密码已使用 bcrypt 加密并自动过滤，不会显示</li>
            <li>• 此调试面板仅在开发环境可用</li>
            <li>• 生产环境建议配置 Supabase 数据库</li>
          </ul>
        </div>

        {/* 测试建议 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-blue-800 mb-2">💡 测试建议</h3>
          <ol className="text-sm text-blue-700 space-y-2">
            <li><strong>1. 注册测试：</strong>使用邮箱 <code className="bg-blue-100 px-2 py-1 rounded">test@example.com</code> 密码 <code className="bg-blue-100 px-2 py-1 rounded">123456</code></li>
            <li><strong>2. 登录测试：</strong>使用相同的邮箱密码登录，确保能成功</li>
            <li><strong>3. 数据持久化：</strong>刷新此页面，检查用户数据是否依然存在</li>
            <li><strong>4. 重启测试：</strong>重启开发服务器后，数据会清空（这是预期行为）</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

