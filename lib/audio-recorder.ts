export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private audioChunks: ArrayBuffer[] = [];

  // 初始化录音
  async init(): Promise<void> {
    try {
      // 请求麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // 创建音频处理器 (4096 buffer size)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      console.log('录音器初始化成功');
    } catch (error) {
      console.error('初始化录音失败:', error);
      throw error;
    }
  }

  // 开始录音
  start(onAudioData: (data: ArrayBuffer) => void): void {
    if (!this.source || !this.processor || !this.audioContext) {
      throw new Error('录音器未初始化');
    }

    this.isRecording = true;
    this.audioChunks = [];

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // 转换为16bit PCM
      const pcmData = this.float32ToInt16(inputData);
      
      const audioBuffer = pcmData.buffer as ArrayBuffer;
      this.audioChunks.push(audioBuffer);
      onAudioData(audioBuffer);
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    console.log('开始录音');
  }

  // 停止录音
  stop(): ArrayBuffer[] {
    if (!this.processor || !this.source) {
      return [];
    }

    this.isRecording = false;
    this.processor.disconnect();
    this.source.disconnect();
    
    console.log('停止录音，共录制:', this.audioChunks.length, '个音频块');
    return this.audioChunks;
  }

  // 释放资源
  release(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.processor = null;
    this.source = null;
    this.audioChunks = [];
    console.log('录音器资源已释放');
  }

  // Float32转Int16
  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  // 合并音频数据
  static mergeAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    buffers.forEach(buffer => {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
    
    return result.buffer;
  }

  // 检查浏览器支持
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }
}

