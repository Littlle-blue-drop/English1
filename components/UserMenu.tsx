'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onLogout();
      router.refresh();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  if (!user) {
    return (
      <div className="flex gap-3">
        <Link href="/login">
          <button className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition">
            登录
          </button>
        </Link>
        <Link href="/register">
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
            注册
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-700">{user.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 py-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {loading ? '登出中...' : '登出'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}



