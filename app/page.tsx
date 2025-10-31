'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import UserMenu from '@/components/UserMenu';
import { getCurrentUser } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* 顶部用户菜单 */}
        <div className="flex justify-end mb-8">
          {!loading && (
            <UserMenu user={user} onLogout={handleLogout} />
          )}
        </div>

        {/* 头部 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎤 AI语音评测系统
          </h1>
          <p className="text-xl text-gray-600">
            基于科大讯飞语音评测API，提供专业的英语口语评测服务
          </p>
          {user && (
            <p className="text-lg text-blue-600 mt-4">
              👋 欢迎回来，{user.name}！
            </p>
          )}
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 单词跟读 */}
          <Link href="/word">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-4">📖</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                单词跟读
              </h2>
              <p className="text-gray-600 mb-4">
                练习单词发音，获取音节级别的详细评测反馈
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>✓ 单词发音准确度评测</li>
                <li>✓ 音节重读检测</li>
                <li>✓ 增漏读智能识别</li>
              </ul>
              <div className="mt-6">
                <span className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full font-medium">
                  开始练习 →
                </span>
              </div>
            </div>
          </Link>

          {/* 句子跟读 */}
          <Link href="/sentence">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                句子跟读
              </h2>
              <p className="text-gray-600 mb-4">
                练习句子朗读，提升流畅度和标准度
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>✓ 准确度、流畅度、标准度评测</li>
                <li>✓ 单词级别错误定位</li>
                <li>✓ 乱读智能检测</li>
              </ul>
              <div className="mt-6">
                <span className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-medium">
                  开始练习 →
                </span>
              </div>
            </div>
          </Link>

          {/* 段落朗读 🆕 */}
          <Link href="/paragraph">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                段落朗读 <span className="text-sm bg-purple-500 text-white px-2 py-1 rounded ml-2">新</span>
              </h2>
              <p className="text-gray-600 mb-4">
                挑战长篇朗读，全面提升综合表现力
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>✓ 篇章级别朗读评测</li>
                <li>✓ 整体流畅性分析</li>
                <li>✓ 连贯性和情感表达</li>
              </ul>
              <div className="mt-6">
                <span className="inline-block bg-purple-500 text-white px-6 py-2 rounded-full font-medium">
                  开始练习 →
                </span>
              </div>
            </div>
          </Link>

          {/* 学习记录 🆕 */}
          <Link href="/history">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                学习记录 <span className="text-sm bg-indigo-500 text-white px-2 py-1 rounded ml-2">新</span>
              </h2>
              <p className="text-gray-600 mb-4">
                查看练习历史，追踪学习进步
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>✓ 历史记录查看</li>
                <li>✓ 学习数据统计</li>
                <li>✓ 进步趋势分析</li>
              </ul>
              <div className="mt-6">
                <span className="inline-block bg-indigo-500 text-white px-6 py-2 rounded-full font-medium">
                  查看记录 →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* 功能特点 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            核心特性
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎯"
              title="精准评测"
              description="采用科大讯飞专业语音评测引擎，提供音素级别的精准反馈"
            />
            <FeatureCard
              icon="⚡"
              title="实时反馈"
              description="流式评测技术，录音结束即刻获得评测结果"
            />
            <FeatureCard
              icon="📊"
              title="多维度分析"
              description="准确度、流畅度、标准度、完整度全方位评测"
            />
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-16 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            💡 使用提示
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">1.</span>
              <span>首次使用需要授权浏览器麦克风权限</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">2.</span>
              <span>确保在安静的环境中录音，以获得更准确的评测</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">3.</span>
              <span>点击录音按钮开始，再次点击停止并获取评测结果</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">4.</span>
              <span>建议使用Chrome、Edge等现代浏览器以获得最佳体验</span>
            </li>
          </ul>
        </div>

        {/* 页脚 */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by iFlytek Voice Evaluation API</p>
          <p className="mt-2">© 2025 AI语音评测系统. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}

// 功能卡片组件
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

