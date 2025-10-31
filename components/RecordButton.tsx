import React, { useState } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecord: () => void;
  onStopRecord: () => void;
  disabled?: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isProcessing,
  onStartRecord,
  onStopRecord,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={isRecording ? onStopRecord : onStartRecord}
        disabled={disabled || isProcessing}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-110
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}
        `}
      >
        {isProcessing ? (
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : isRecording ? (
          <div className="w-6 h-6 bg-white rounded" />
        ) : (
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isProcessing
            ? '正在评测...'
            : isRecording
            ? '点击停止录音'
            : '点击开始录音'
          }
        </p>
        {isRecording && (
          <p className="text-xs text-gray-500 mt-1">
            <RecordingTimer />
          </p>
        )}
      </div>
    </div>
  );
};

// 录音计时器
const RecordingTimer: React.FC = () => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return <span className="font-mono">{formatTime(seconds)}</span>;
};

