import { Base64 } from 'js-base64';

export interface WordScore {
  content: string;
  totalScore: number;
  dpMessage: number; // 0正常 16漏读 32增读 64回读 128替换
  begPos: number;
  endPos: number;
  syllables?: SyllableScore[];
}

export interface SyllableScore {
  content: string;
  syllScore?: number;
  serrMsg?: number; // 音节错误信息
  syllAccent?: number; // 重读标记
}

export interface SentenceScore {
  content: string;
  totalScore: number;
  accuracyScore?: number;
  fluencyScore?: number;
  standardScore?: number;
  words: WordScore[];
}

export interface EvaluationScore {
  totalScore: number;
  accuracyScore?: number;
  fluencyScore?: number;
  standardScore?: number;
  integrityScore?: number;
  isRejected?: boolean;
  exceptInfo?: string;
  sentences: SentenceScore[];
}

export class XMLParser {
  // 解析base64编码的XML结果
  static parseResult(base64Xml: string): EvaluationScore | null {
    try {
      const xmlString = Base64.decode(base64Xml);
      console.log('解析XML:', xmlString);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // 检查是否有解析错误
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML解析错误:', parserError.textContent);
        return null;
      }

      // 获取根节点 (read_word 或 read_sentence)
      const rootNode = xmlDoc.querySelector('read_word, read_sentence, read_chapter');
      if (!rootNode) {
        console.error('未找到根节点');
        return null;
      }

      const result: EvaluationScore = {
        totalScore: parseFloat(rootNode.getAttribute('total_score') || '0'),
        accuracyScore: this.getFloatAttr(rootNode, 'accuracy_score'),
        fluencyScore: this.getFloatAttr(rootNode, 'fluency_score'),
        standardScore: this.getFloatAttr(rootNode, 'standard_score'),
        integrityScore: this.getFloatAttr(rootNode, 'integrity_score'),
        isRejected: rootNode.getAttribute('is_rejected') === 'true',
        exceptInfo: rootNode.getAttribute('except_info') || undefined,
        sentences: [],
      };

      // 解析句子
      const sentences = xmlDoc.querySelectorAll('sentence');
      sentences.forEach(sentenceNode => {
        const sentence: SentenceScore = {
          content: sentenceNode.getAttribute('content') || '',
          totalScore: parseFloat(sentenceNode.getAttribute('total_score') || '0'),
          accuracyScore: this.getFloatAttr(sentenceNode, 'accuracy_score'),
          fluencyScore: this.getFloatAttr(sentenceNode, 'fluency_score'),
          standardScore: this.getFloatAttr(sentenceNode, 'standard_score'),
          words: [],
        };

        // 解析单词
        const words = sentenceNode.querySelectorAll('word');
        words.forEach(wordNode => {
          const word: WordScore = {
            content: wordNode.getAttribute('content') || '',
            totalScore: parseFloat(wordNode.getAttribute('total_score') || '0'),
            dpMessage: parseInt(wordNode.getAttribute('dp_message') || '0'),
            begPos: parseInt(wordNode.getAttribute('beg_pos') || '0'),
            endPos: parseInt(wordNode.getAttribute('end_pos') || '0'),
            syllables: [],
          };

          // 解析音节
          const syllables = wordNode.querySelectorAll('syll');
          syllables.forEach(syllNode => {
            word.syllables?.push({
              content: syllNode.getAttribute('content') || '',
              syllScore: this.getFloatAttr(syllNode, 'syll_score'),
              serrMsg: this.getIntAttr(syllNode, 'serr_msg'),
              syllAccent: this.getIntAttr(syllNode, 'syll_accent'),
            });
          });

          sentence.words.push(word);
        });

        result.sentences.push(sentence);
      });

      // ⚙️ 当根节点没有给出总分（或为0）时，使用句子分数的平均值作为总分
      if ((!result.totalScore || result.totalScore === 0) && result.sentences.length > 0) {
        const validSentenceScores = result.sentences
          .map(s => s.totalScore)
          .filter(s => typeof s === 'number' && !isNaN(s));
        if (validSentenceScores.length > 0) {
          const avg = validSentenceScores.reduce((sum, s) => sum + s, 0) / validSentenceScores.length;
          result.totalScore = Math.round(avg * 10) / 10;
        }
      }

      // 同步填充分项分数（若缺失），取句子分项的平均值
      const fillDimAvg = (getter: (s: SentenceScore) => number | undefined) => {
        const vals = result.sentences
          .map(getter)
          .filter((v): v is number => typeof v === 'number' && !isNaN(v));
        if (vals.length > 0) {
          return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
        }
        return undefined;
      };

      if ((result.accuracyScore === undefined || result.accuracyScore === 0) && result.sentences.length > 0) {
        const v = fillDimAvg(s => s.accuracyScore);
        if (v !== undefined) result.accuracyScore = v;
      }
      if ((result.fluencyScore === undefined || result.fluencyScore === 0) && result.sentences.length > 0) {
        const v = fillDimAvg(s => s.fluencyScore);
        if (v !== undefined) result.fluencyScore = v;
      }
      if ((result.standardScore === undefined || result.standardScore === 0) && result.sentences.length > 0) {
        const v = fillDimAvg(s => s.standardScore);
        if (v !== undefined) result.standardScore = v;
      }

      return result;
    } catch (error) {
      console.error('XML解析失败:', error);
      return null;
    }
  }

  // 获取评分等级
  static getScoreLevel(score: number): {
    level: string;
    color: string;
    label: string;
  } {
    if (score >= 90) {
      return { level: 'excellent', color: 'text-green-600', label: '优秀' };
    } else if (score >= 80) {
      return { level: 'good', color: 'text-blue-600', label: '良好' };
    } else if (score >= 70) {
      return { level: 'pass', color: 'text-yellow-600', label: '及格' };
    } else {
      return { level: 'fail', color: 'text-red-600', label: '待提高' };
    }
  }

  // 获取错误类型描述
  static getErrorDescription(dpMessage: number): string {
    switch (dpMessage) {
      case 0:
        return '正确';
      case 16:
        return '漏读';
      case 32:
        return '增读';
      case 64:
        return '回读';
      case 128:
        return '替换';
      default:
        return '未知错误';
    }
  }

  private static getFloatAttr(node: Element, attr: string): number | undefined {
    const value = node.getAttribute(attr);
    return value ? parseFloat(value) : undefined;
  }

  private static getIntAttr(node: Element, attr: string): number | undefined {
    const value = node.getAttribute(attr);
    return value ? parseInt(value) : undefined;
  }
}

