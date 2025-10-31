import React from 'react';
import { EvaluationScore, WordScore, XMLParser } from '@/lib/xml-parser';

interface ScoreDisplayProps {
  score: EvaluationScore;
  showDetails?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, showDetails = true }) => {
  const { level, color, label } = XMLParser.getScoreLevel(score.totalScore);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* 总分显示 */}
      <div className="text-center">
        <div className="text-6xl font-bold mb-2" style={{ color: getScoreColor(score.totalScore) }}>
          {score.totalScore.toFixed(1)}
        </div>
        <div className={`text-xl font-semibold ${color}`}>
          {label}
        </div>
        {score.isRejected && (
          <div className="mt-2 text-red-500 text-sm">
            ⚠️ 检测到乱读，评分不可信
          </div>
        )}
      </div>

      {/* 维度评分 */}
      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {score.accuracyScore !== undefined && (
            <ScoreDimension label="准确度" score={score.accuracyScore} />
          )}
          {score.fluencyScore !== undefined && (
            <ScoreDimension label="流畅度" score={score.fluencyScore} />
          )}
          {score.standardScore !== undefined && (
            <ScoreDimension label="标准度" score={score.standardScore} />
          )}
          {score.integrityScore !== undefined && (
            <ScoreDimension label="完整度" score={score.integrityScore} />
          )}
        </div>
      )}

      {/* 详细分析 */}
      {showDetails && score.sentences.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">详细分析</h3>
          <div className="space-y-4">
            {score.sentences.map((sentence, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">句子 {idx + 1}</span>
                  <span className="font-semibold">
                    得分: {sentence.totalScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sentence.words.map((word, widx) => (
                    <WordChip key={widx} word={word} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 维度评分组件
const ScoreDimension: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
        {score.toFixed(1)}
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score),
          }}
        />
      </div>
    </div>
  );
};

// 单词显示组件
const WordChip: React.FC<{ word: WordScore }> = ({ word }) => {
  const getWordStyle = () => {
    if (word.dpMessage === 0) {
      // 正确：根据分数显示颜色
      if (word.totalScore >= 90) return 'bg-green-100 text-green-800 border-green-300';
      if (word.totalScore >= 80) return 'bg-blue-100 text-blue-800 border-blue-300';
      if (word.totalScore >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      return 'bg-orange-100 text-orange-800 border-orange-300';
    } else {
      // 有错误：红色
      return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const errorDesc = word.dpMessage !== 0 ? XMLParser.getErrorDescription(word.dpMessage) : null;

  return (
    <div className="relative group">
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getWordStyle()}`}>
        {word.content}
        {word.totalScore > 0 && (
          <span className="ml-1 text-xs opacity-75">
            {word.totalScore.toFixed(0)}
          </span>
        )}
      </span>
      {errorDesc && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {errorDesc}
        </div>
      )}
    </div>
  );
};

// 根据分数获取颜色
function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // green
  if (score >= 80) return '#3b82f6'; // blue
  if (score >= 70) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

