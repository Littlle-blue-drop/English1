'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-client';

interface Practice {
  id: string;
  type: 'word' | 'sentence' | 'paragraph';
  content: string;
  total_score: number;
  accuracy: number;
  fluency: number;
  integrity: number;
  standard: number;
  duration: number;
  created_at: string;
}

interface Stats {
  total_count: number;
  total_duration: number;
  average_score: number;
  best_score: number;
  by_type: {
    word: { count: number; avg_score: number };
    sentence: { count: number; avg_score: number };
    paragraph: { count: number; avg_score: number };
  };
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'word' | 'sentence' | 'paragraph'>('all');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPractices();
      loadStats();
    }
  }, [user, filter]);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) {
        setError('请先登录');
        setLoading(false);
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setError('获取用户信息失败');
      setLoading(false);
    }
  };

  const loadPractices = async () => {
    try {
      setLoading(true);
      const typeParam = filter !== 'all' ? `?type=${filter}` : '';
      const response = await fetch(`/api/practice${typeParam}`);
      
      if (!response.ok) {
        throw new Error('获取记录失败');
      }

      const result = await response.json();
      setPractices(result.data || []);
    } catch (error: any) {
      console.error('加载记录失败:', error);
      setError(error.message || '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/practice/stats');
      
      if (!response.ok) {
        return;
      }

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      word: '单词',
      sentence: '句子',
      paragraph: '段落',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      word: 'bg-blue-100 text-blue-700',
      sentence: 'bg-green-100 text-green-700',
      paragraph: 'bg-purple-100 text-purple-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user && !loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">需要登录</h1>
            <p className="text-gray-600 mb-8">请先登录以查看您的学习记录</p>
            <Link
              href="/login"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              前往登录
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">📊 学习记录</h1>
          <p className="text-gray-600 mt-2">查看您的练习历史和学习进度</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">总练习次数</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.total_count}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">总时长</div>
              <div className="text-3xl font-bold text-blue-600">{formatDuration(stats.total_duration)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">平均分数</div>
              <div className="text-3xl font-bold text-green-600">{stats.average_score.toFixed(1)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">最高分数</div>
              <div className="text-3xl font-bold text-purple-600">{stats.best_score.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* 类型统计 */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">分类统计</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-semibold">📖 单词</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.by_type.word.count}</span>
                </div>
                <div className="text-sm text-blue-600">
                  平均分: {stats.by_type.word.avg_score > 0 ? stats.by_type.word.avg_score.toFixed(1) : '--'}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 font-semibold">📝 句子</span>
                  <span className="text-2xl font-bold text-green-600">{stats.by_type.sentence.count}</span>
                </div>
                <div className="text-sm text-green-600">
                  平均分: {stats.by_type.sentence.avg_score > 0 ? stats.by_type.sentence.avg_score.toFixed(1) : '--'}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 font-semibold">📄 段落</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.by_type.paragraph.count}</span>
                </div>
                <div className="text-sm text-purple-600">
                  平均分: {stats.by_type.paragraph.avg_score > 0 ? stats.by_type.paragraph.avg_score.toFixed(1) : '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('word')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'word'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📖 单词
            </button>
            <button
              onClick={() => setFilter('sentence')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'sentence'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 句子
            </button>
            <button
              onClick={() => setFilter('paragraph')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'paragraph'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 段落
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 记录列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : practices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl text-gray-600 mb-2">暂无练习记录</div>
              <div className="text-gray-500">开始练习后，记录将显示在这里</div>
              <Link
                href="/"
                className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                开始练习
              </Link>
            </div>
          ) : (
            practices.map((practice) => (
              <div key={practice.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(practice.type)}`}>
                        {getTypeLabel(practice.type)}
                      </span>
                      <span className="text-gray-500 text-sm">{formatDate(practice.created_at)}</span>
                    </div>
                    <div className="text-gray-700 mb-2 line-clamp-2">{practice.content}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>时长: {formatDuration(practice.duration)}</span>
                      <span>准确度: {practice.accuracy.toFixed(1)}</span>
                      <span>流畅度: {practice.fluency.toFixed(1)}</span>
                      <span>完整度: {practice.integrity.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-600 mb-1">总分</div>
                    <div className={`text-4xl font-bold ${getScoreColor(practice.total_score)}`}>
                      {practice.total_score.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 提示 */}
        {practices.length > 0 && (
          <div className="mt-8 bg-indigo-50 rounded-xl p-6 text-center">
            <p className="text-indigo-700">
              💡 <strong>提示：</strong>坚持练习，您的发音会越来越好！
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

