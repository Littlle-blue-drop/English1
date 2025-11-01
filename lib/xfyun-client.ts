import CryptoJS from 'crypto-js';
import { Base64 } from 'js-base64';

export interface XFYunConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

export interface EvaluationParams {
  category: 'read_word' | 'read_sentence' | 'read_chapter';
  text: string;
  ent?: 'en_vip' | 'cn_vip';
  extra_ability?: string;
}

export interface EvaluationResult {
  code: number;
  message: string;
  sid: string;
  data?: {
    status: number;
    data: string; // base64编码的XML结果
  };
}

export class XFYunClient {
  private config: XFYunConfig;
  private ws: WebSocket | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isConnected = false;
  private onErrorCallback?: (error: string) => void;
  private onCloseCallback?: () => void;

  constructor(config: XFYunConfig) {
    this.config = config;
  }

  // 生成鉴权URL
  private generateAuthUrl(): string {
    const url = 'wss://ise-api.xfyun.cn/v2/open-ise';
    const host = 'ise-api.xfyun.cn';
    const date = new Date().toUTCString();
    const requestLine = 'GET /v2/open-ise HTTP/1.1';

    // 生成signature_origin
    const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;

    // 使用hmac-sha256算法结合apiSecret对signatureOrigin签名
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.config.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);

    // 生成authorization_origin
    const authorizationOrigin = 
      `api_key="${this.config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    
    // base64编码
    const authorization = Base64.encode(authorizationOrigin);

    // 拼接最终URL
    return `${url}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
  }

  // 连接WebSocket
  async connect(params: EvaluationParams): Promise<void> {
    return new Promise((resolve, reject) => {
      const authUrl = this.generateAuthUrl();
      this.ws = new WebSocket(authUrl);

      this.ws.onopen = () => {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        
        // 发送第一帧：参数上传
        const firstFrame = {
          common: {
            app_id: this.config.appId,
          },
          business: {
            aue: 'raw',
            auf: 'audio/L16;rate=16000',
            category: params.category,
            cmd: 'ssb',
            ent: params.ent || 'en_vip',
            sub: 'ise',
            text: params.text,
            ttp_skip: true,
            rst: 'entirety',
            ise_unite: '1',
            extra_ability: params.extra_ability || 'multi_dimension',
          },
          data: {
            status: 0,
          },
        };

        this.ws?.send(JSON.stringify(firstFrame));
        console.log('发送参数帧:', firstFrame);
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket关闭:', event.code, event.reason);
        this.isConnected = false;
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
      };

      // 设置连接超时
      setTimeout(() => {
        if (!this.isConnected && this.ws?.readyState === WebSocket.CONNECTING) {
          this.ws.close();
          reject(new Error('WebSocket连接超时'));
        }
      }, 10000); // 10秒超时
    });
  }

  // 发送音频数据
  sendAudio(audioData: ArrayBuffer, isFirst: boolean, isLast: boolean): void {
    if (!this.ws || !this.isConnected) {
      console.error('WebSocket未连接');
      return;
    }

    // 转换为base64
    const base64Audio = this.arrayBufferToBase64(audioData);

    const frame = {
      business: {
        cmd: 'auw',
        aus: isFirst ? 1 : isLast ? 4 : 2,
      },
      data: {
        status: isLast ? 2 : 1,
        data: base64Audio,
      },
    };

    this.ws.send(JSON.stringify(frame));
    console.log(`发送音频帧: ${isFirst ? '首帧' : isLast ? '尾帧' : '中间帧'}, 大小: ${audioData.byteLength}`);
  }

  // 监听消息
  onMessage(callback: (result: EvaluationResult) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const result: EvaluationResult = JSON.parse(event.data);
          console.log('收到评测结果:', result);
          callback(result);
        } catch (error) {
          console.error('解析评测结果失败:', error);
          if (this.onErrorCallback) {
            this.onErrorCallback('解析评测结果失败');
          }
        }
      };
    }
  }

  // 设置错误回调
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // 设置关闭回调
  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  // 关闭连接
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  // ArrayBuffer转Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return Base64.btoa(binary);
  }
}

