'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { XFYunClient } from '@/lib/xfyun-client';
import { AudioRecorder } from '@/lib/audio-recorder';
import { RecordButton } from '@/components/RecordButton';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { EvaluationScore, XMLParser } from '@/lib/xml-parser';

// 示例单词列表
const SAMPLE_WORDS = [
  'apple',
  'beautiful',
  'computer',
  'delicious',
  'elephant',
  'fantastic',
  'guitar',
  'hospital',
  'interesting',
  'wonderful',
];

export default function WordPage() {
  const [currentWord, setCurrentWord] = useState(SAMPLE_WORDS[0]);
  const [customWord, setCustomWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [score, setScore] = useState<EvaluationScore | null>(null);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const clientRef = useRef<XFYunClient | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 检查浏览器支持
    if (!AudioRecorder.isSupported()) {
      setIsSupported(false);
      setError('您的浏览器不支持录音功能，请使用Chrome、Edge等现代浏览器');
    }

    // 检查环境变量
    if (
      !process.env.NEXT_PUBLIC_XFYUN_APP_ID ||
      !process.env.NEXT_PUBLIC_XFYUN_API_KEY ||
      !process.env.NEXT_PUBLIC_XFYUN_API_SECRET
    ) {
      setError('请配置讯飞API密钥（.env.local文件）');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recorderRef.current) {
        recorderRef.current.release();
      }
      if (clientRef.current) {
        clientRef.current.close();
      }
    };
  }, []);

  const handleStartRecord = async () => {
    try {
      setError('');
      setScore(null);
      setIsInitializing(true);
      recordStartTimeRef.current = Date.now();

      // 初始化录音器
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.init();

      // 初始化讯飞客户端
      clientRef.current = new XFYunClient({
        appId: process.env.NEXT_PUBLIC_XFYUN_APP_ID!,
        apiKey: process.env.NEXT_PUBLIC_XFYUN_API_KEY!,
        apiSecret: process.env.NEXT_PUBLIC_XFYUN_API_SECRET!,
      });

      // 连接WebSocket
      await clientRef.current.connect({
        category: 'read_word',
        text: `[word]\n${currentWord}`,
        ent: 'en_vip',
        extra_ability: 'multi_dimension',
      });

      // 监听评测结果
      clientRef.current.onMessage((result) => {
        // 清除超时定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (result.code !== 0) {
          setError(`评测失败: ${result.message} (错误码: ${result.code})`);
          setIsProcessing(false);
          return;
        }

        // 处理不同状态
        if (result.data) {
          if (result.data.status === 2) {
            // 评测完成
            const scoreData = XMLParser.parseResult(result.data.data);
            if (scoreData) {
              setScore(scoreData);
              
              // 🔄 自动保存练习记录到数据库
              savePracticeRecord(scoreData);
            } else {
              setError('评测结果解析失败');
            }
            setIsProcessing(false);
          } else if (result.data.status === 1) {
            // 中间结果，继续等待
            console.log('收到中间结果，继续等待...');
          }
        }
      });

      // 监听WebSocket错误
      clientRef.current.onError((error) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setError(`连接错误: ${error}`);
        setIsProcessing(false);
      });

      // 监听WebSocket关闭
      clientRef.current.onClose(() => {
        console.log('WebSocket连接已关闭');
      });

      // 开始录音
      audioChunksRef.current = [];
      let isFirstFrame = true;

      recorderRef.current.start((audioData) => {
        audioChunksRef.current.push(audioData);
        
        // 发送音频数据到讯飞
        if (clientRef.current) {
          clientRef.current.sendAudio(audioData, isFirstFrame, false);
          isFirstFrame = false;
        }
      });

      setIsInitializing(false);
      setIsRecording(true);
    } catch (err: any) {
      setIsInitializing(false);
      const errorMsg = err?.message || err?.toString() || '未知错误';
      setError(`录音启动失败: ${errorMsg}`);
      console.error('录音启动详细错误:', err);
    }
  };

  const handleStopRecord = () => {
    if (!recorderRef.current || !clientRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    // 停止录音
    recorderRef.current.stop();

    // 发送结束帧（空数据 + isLast=true）
    // 注意：音频数据已经在录音过程中实时发送，这里只需要标记结束
    const emptyBuffer = new ArrayBuffer(0);
    clientRef.current.sendAudio(emptyBuffer, false, true);

    console.log('发送结束帧，等待评测结果');

    // 设置超时（30秒）
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) {
        setError('评测超时，请重试');
        setIsProcessing(false);
        timeoutRef.current = null;
      }
    }, 30000);

    // 释放资源
    recorderRef.current.release();
    recorderRef.current = null;
  };

  const handleWordSelect = (word: string) => {
    setCurrentWord(word);
    setScore(null);
    setError('');
  };

  const handleCustomWordSubmit = () => {
    if (customWord.trim()) {
      setCurrentWord(customWord.trim());
      setCustomWord('');
      setScore(null);
      setError('');
    }
  };

  // 🆕 保存练习记录到数据库
  const savePracticeRecord = async (scoreData: EvaluationScore) => {
    try {
      const duration = Math.floor((Date.now() - recordStartTimeRef.current) / 1000);

      const response = await fetch('/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'word',
          content: currentWord,
          total_score: scoreData.totalScore,
          accuracy: scoreData.accuracyScore || 0,
          fluency: scoreData.fluencyScore || 0,
          integrity: scoreData.integrityScore || 0,
          standard: scoreData.standardScore || 0,
          word_details: scoreData.sentences,
          raw_result: scoreData,
          duration,
        }),
      });

      if (!response.ok) {
        console.warn('保存练习记录失败');
      } else {
        console.log('✅ 练习记录已保存');
      }
    } catch (error) {
      console.error('保存练习记录错误:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">📖 单词跟读</h1>
          <p className="text-gray-600 mt-2">选择或输入单词，点击录音按钮开始练习</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 单词选择 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择单词</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {SAMPLE_WORDS.map((word) => (
              <button
                key={word}
                onClick={() => handleWordSelect(word)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentWord === word
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {word}
              </button>
            ))}
          </div>

          {/* 自定义单词 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomWordSubmit()}
              placeholder="或输入自定义单词..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCustomWordSubmit}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              确定
            </button>
          </div>
        </div>

        {/* 当前单词显示 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {currentWord}
          </div>
          <div className="text-gray-500">请跟读上面的单词</div>
        </div>

        {/* 录音按钮 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 flex justify-center">
          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            isInitializing={isInitializing}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            disabled={!isSupported}
          />
        </div>

        {/* 评分展示 */}
        {score && (
          <div className="mb-6">
            <ScoreDisplay score={score} showDetails={true} />
          </div>
        )}
      </div>
    </main>
  );
}

