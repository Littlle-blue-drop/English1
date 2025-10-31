'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { XFYunClient } from '@/lib/xfyun-client';
import { AudioRecorder } from '@/lib/audio-recorder';
import { RecordButton } from '@/components/RecordButton';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { EvaluationScore, XMLParser } from '@/lib/xml-parser';

// 示例句子列表
const SAMPLE_SENTENCES = [
  'Hello, how are you today?',
  'I love learning English very much.',
  'The weather is beautiful this morning.',
  'She is reading an interesting book.',
  'We should protect our environment.',
  'Technology makes our life more convenient.',
  'Practice makes perfect in everything.',
  'Education is the key to success.',
];

export default function SentencePage() {
  const [currentSentence, setCurrentSentence] = useState(SAMPLE_SENTENCES[0]);
  const [customSentence, setCustomSentence] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<EvaluationScore | null>(null);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const clientRef = useRef<XFYunClient | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const recordStartTimeRef = useRef<number>(0);

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
        category: 'read_sentence',
        text: `[content]\n${currentSentence}`,
        ent: 'en_vip',
        extra_ability: 'multi_dimension',
      });

      // 监听评测结果
      clientRef.current.onMessage((result) => {
        if (result.code !== 0) {
          setError(`评测失败: ${result.message} (错误码: ${result.code})`);
          setIsProcessing(false);
          return;
        }

        if (result.data && result.data.status === 2) {
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
        }
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

      setIsRecording(true);
    } catch (err: any) {
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

    // 发送最后一帧
    if (audioChunksRef.current.length > 0) {
      const lastChunk = audioChunksRef.current[audioChunksRef.current.length - 1];
      clientRef.current.sendAudio(lastChunk, false, true);
    }

    // 释放资源
    recorderRef.current.release();
    recorderRef.current = null;
  };

  const handleSentenceSelect = (sentence: string) => {
    setCurrentSentence(sentence);
    setScore(null);
    setError('');
  };

  const handleCustomSentenceSubmit = () => {
    if (customSentence.trim()) {
      setCurrentSentence(customSentence.trim());
      setCustomSentence('');
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
          type: 'sentence',
          content: currentSentence,
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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">📝 句子跟读</h1>
          <p className="text-gray-600 mt-2">选择或输入句子，点击录音按钮开始练习</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 句子选择 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择句子</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {SAMPLE_SENTENCES.map((sentence, idx) => (
              <button
                key={idx}
                onClick={() => handleSentenceSelect(sentence)}
                className={`px-4 py-3 rounded-lg text-left transition-all ${
                  currentSentence === sentence
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{sentence}</div>
              </button>
            ))}
          </div>

          {/* 自定义句子 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSentence}
              onChange={(e) => setCustomSentence(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSentenceSubmit()}
              placeholder="或输入自定义句子..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleCustomSentenceSubmit}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              确定
            </button>
          </div>
        </div>

        {/* 当前句子显示 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-3xl md:text-4xl font-semibold text-green-700 text-center leading-relaxed">
            {currentSentence}
          </div>
          <div className="text-gray-500 text-center mt-4">请跟读上面的句子</div>
        </div>

        {/* 录音按钮 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 flex justify-center">
          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
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

        {/* 评测说明 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">📊 评测维度说明</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong className="text-blue-600">准确度 (60%)</strong>
              <p className="mt-1">单词发音的准确性，包括音素和音节的正确度</p>
            </div>
            <div>
              <strong className="text-green-600">流畅度 (30%)</strong>
              <p className="mt-1">朗读的流利程度，语速是否自然，停顿是否合理</p>
            </div>
            <div>
              <strong className="text-purple-600">标准度 (10%)</strong>
              <p className="mt-1">发音习惯是否符合英语母语标准，连读、重读等技巧</p>
            </div>
            <div>
              <strong className="text-orange-600">完整度</strong>
              <p className="mt-1">是否完整朗读所有内容，有无遗漏</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

