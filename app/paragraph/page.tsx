'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { XFYunClient } from '@/lib/xfyun-client';
import { AudioRecorder } from '@/lib/audio-recorder';
import { RecordButton } from '@/components/RecordButton';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { EvaluationScore, XMLParser } from '@/lib/xml-parser';

// 示例段落列表（精选英语段落）
const SAMPLE_PARAGRAPHS = [
  {
    title: "The Power of Reading",
    text: "Reading is one of the most important skills we can develop. It opens doors to new worlds, ideas, and perspectives. Through reading, we can travel to distant lands, learn about different cultures, and understand complex concepts. Books are windows to knowledge and imagination.",
  },
  {
    title: "Technology and Life",
    text: "Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, innovations continue to reshape our daily experiences. While technology brings convenience and efficiency, it's important to maintain balance and remember the value of human connection.",
  },
  {
    title: "Environmental Protection",
    text: "Protecting our environment is one of the greatest challenges facing humanity today. Climate change, pollution, and loss of biodiversity threaten our planet's future. Each of us has a responsibility to make sustainable choices and work together to preserve the Earth for future generations.",
  },
  {
    title: "The Value of Education",
    text: "Education is the foundation of personal and societal progress. It empowers individuals with knowledge, critical thinking skills, and opportunities for growth. Quality education not only prepares us for careers but also helps us become informed citizens who can contribute positively to our communities.",
  },
  {
    title: "Importance of Exercise",
    text: "Regular physical exercise is essential for maintaining good health and well-being. It strengthens our bodies, improves mental health, and boosts energy levels. Whether it's walking, swimming, or playing sports, finding activities we enjoy makes it easier to stay active and healthy throughout our lives.",
  },
];

export default function ParagraphPage() {
  const [currentParagraph, setCurrentParagraph] = useState(SAMPLE_PARAGRAPHS[0]);
  const [customParagraph, setCustomParagraph] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [score, setScore] = useState<EvaluationScore | null>(null);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);
  const [processingMessage, setProcessingMessage] = useState('正在评测...');
  const [evaluationStartTime, setEvaluationStartTime] = useState<number | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const clientRef = useRef<XFYunClient | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
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
      setHasResult(false);
      setIsInitializing(true);
      setProcessingMessage('正在初始化...');
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

      // 连接WebSocket - 使用 read_chapter 模式
      await clientRef.current.connect({
        category: 'read_chapter',
        text: `[content]\n${currentParagraph.text}`,
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
          const errorMsg = result.message || '未知错误';
          setError(`评测失败: ${errorMsg} (错误码: ${result.code})`);
          setIsProcessing(false);
          setProcessingMessage('正在评测...');
          setEvaluationStartTime(null);
          return;
        }

        // 处理不同状态
        if (result.data) {
          if (result.data.status === 2) {
            // 评测完成
            const scoreData = XMLParser.parseResult(result.data.data);
            if (scoreData) {
              // 计算评测耗时
              if (evaluationStartTime) {
                const elapsed = ((Date.now() - evaluationStartTime) / 1000).toFixed(1);
                console.log(`评测完成，耗时: ${elapsed}秒`);
              }
              
              setScore(scoreData);
              setHasResult(true);
              
              // 🔄 自动保存练习记录到数据库
              savePracticeRecord(scoreData);
            } else {
              setError('评测结果解析失败，请重试');
            }
            setIsProcessing(false);
            setProcessingMessage('正在评测...');
            setEvaluationStartTime(null);
            // 清除计时器
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
          } else if (result.data.status === 1) {
            // 中间结果，更新提示
            setProcessingMessage('正在分析音频数据...');
            console.log('收到中间结果，继续处理...');
          } else if (result.data.status === 0) {
            // 初始状态
            setProcessingMessage('正在接收评测结果...');
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
        setProcessingMessage('正在评测...');
        setEvaluationStartTime(null);
        // 清除计时器
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
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
    setProcessingMessage('正在上传音频...');
    setEvaluationStartTime(Date.now());
    setElapsedTime(0);
    setHasResult(false);

    // 停止录音
    const audioChunks = recorderRef.current.stop();

    // 发送最后一帧（如果有音频数据，发送最后一块；否则发送空数据标记结束）
    if (audioChunks.length > 0) {
      const lastChunk = audioChunks[audioChunks.length - 1];
      clientRef.current.sendAudio(lastChunk, false, true);
    } else {
      // 如果没有录制到音频，发送空帧
      const emptyBuffer = new ArrayBuffer(0);
      clientRef.current.sendAudio(emptyBuffer, false, true);
    }

    // 启动计时器（降低频率避免触发过多更新）
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 0.5;
        // 避免超过 30 秒
        return newTime > 30 ? 30 : newTime;
      });
    }, 500);

    // 更新提示（1秒后）
    setTimeout(() => {
      setProcessingMessage((prev) => {
        if (prev === '正在上传音频...') {
          return '正在评测中...';
        }
        return prev;
      });
    }, 1000);

    // 设置超时（30秒）
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) {
        setError('评测超时，可能是网络问题或服务器繁忙，请重试');
        setIsProcessing(false);
        setProcessingMessage('正在评测...');
        setEvaluationStartTime(null);
        setElapsedTime(0);
        timeoutRef.current = null;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    }, 30000);

    // 释放资源
    recorderRef.current.release();
    recorderRef.current = null;
  };

  const handleParagraphSelect = (paragraph: typeof SAMPLE_PARAGRAPHS[0]) => {
    setCurrentParagraph(paragraph);
    setScore(null);
    setError('');
    setHasResult(false);
    // 如果正在评测，取消评测
    if (isProcessing && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsProcessing(false);
      setProcessingMessage('正在评测...');
      setEvaluationStartTime(null);
      if (clientRef.current) {
        clientRef.current.close();
      }
    }
  };

  const handleCustomParagraphSubmit = () => {
    if (customParagraph.trim()) {
      setCurrentParagraph({
        title: '自定义段落',
        text: customParagraph.trim(),
      });
      setCustomParagraph('');
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
          type: 'paragraph',
          content: currentParagraph.text,
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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">📄 段落朗读</h1>
          <p className="text-gray-600 mt-2">选择或输入段落，挑战更长篇幅的朗读练习</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            {!isProcessing && (
              <button
                onClick={() => {
                  setError('');
                  handleStartRecord();
                }}
                className="ml-4 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                重试
              </button>
            )}
          </div>
        )}

        {/* 段落选择 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择段落</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {SAMPLE_PARAGRAPHS.map((paragraph, idx) => (
              <button
                key={idx}
                onClick={() => handleParagraphSelect(paragraph)}
                className={`px-4 py-3 rounded-lg text-left transition-all ${
                  currentParagraph.title === paragraph.title
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="font-semibold mb-1">{paragraph.title}</div>
                <div className="text-sm opacity-75 line-clamp-2">{paragraph.text}</div>
              </button>
            ))}
          </div>

          {/* 自定义段落 */}
          <div className="flex flex-col gap-2">
            <textarea
              value={customParagraph}
              onChange={(e) => setCustomParagraph(e.target.value)}
              placeholder="或输入自定义段落（支持多句）..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
            <button
              onClick={handleCustomParagraphSubmit}
              className="self-end px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              使用此段落
            </button>
          </div>
        </div>

        {/* 当前段落显示 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">{currentParagraph.title}</h3>
          <div className="text-lg md:text-xl text-gray-700 leading-relaxed whitespace-pre-wrap">
            {currentParagraph.text}
          </div>
          <div className="text-gray-500 text-center mt-6">请朗读上面的段落</div>
        </div>

        {/* 录音按钮 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 flex flex-col items-center">
          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            isInitializing={isInitializing}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            disabled={!isSupported}
            processingMessage={processingMessage}
          />
          {isProcessing && elapsedTime > 0 && (
            <div className="mt-4 text-sm text-gray-500 animate-pulse">
              评测耗时: {elapsedTime.toFixed(1)}秒
            </div>
          )}
        </div>

        {/* 评分展示 */}
        {score && (
          <div className="mb-6 animate-fade-in">
            <ScoreDisplay score={score} showDetails={true} />
            {hasResult && (
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setScore(null);
                    setHasResult(false);
                    setError('');
                    handleStartRecord();
                  }}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  再次练习
                </button>
                <button
                  onClick={() => {
                    setScore(null);
                    setHasResult(false);
                    setError('');
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  清除结果
                </button>
              </div>
            )}
          </div>
        )}

        {/* 评测说明 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">📊 段落朗读评测说明</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong className="text-blue-600">准确度 (60%)</strong>
              <p className="mt-1">单词发音的准确性，段落越长，挑战越大</p>
            </div>
            <div>
              <strong className="text-green-600">流畅度 (30%)</strong>
              <p className="mt-1">整体朗读的流畅程度，考察语速和停顿</p>
            </div>
            <div>
              <strong className="text-purple-600">标准度 (10%)</strong>
              <p className="mt-1">发音习惯是否符合英语母语标准</p>
            </div>
            <div>
              <strong className="text-orange-600">完整度</strong>
              <p className="mt-1">是否完整朗读所有内容，有无遗漏</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              💡 <strong>小提示：</strong>段落朗读更考验整体表现力。建议先熟读文本，注意句子之间的连贯性和情感表达。
              录音前深呼吸，保持平稳的语速，不要急于求成。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

