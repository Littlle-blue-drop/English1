# 🔧 故障排查指南

## 常见问题解决方案

### 问题1: "录音启动失败: undefined" ✅ 已解决

**问题原因**：
1. 环境变量配置错误（修改了env.example而不是.env.local）
2. 错误信息提取逻辑不完善

**解决方案**：
- ✅ 已创建 `.env.local` 文件并配置API密钥
- ✅ 已改进错误处理逻辑

**后续步骤**：

#### 1. 重启开发服务器（重要！）

```bash
# 如果服务器正在运行，先按 Ctrl+C 停止

# 然后重新启动
npm run dev
```

#### 2. 清除浏览器缓存

按 `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac) 强制刷新页面

#### 3. 检查浏览器控制台

打开浏览器开发者工具 (F12)，查看控制台是否有详细错误信息：

```
应该看到：
✅ "录音器初始化成功"
✅ "WebSocket连接成功"

不应该看到：
❌ NotAllowedError (麦克风权限被拒绝)
❌ NotFoundError (未找到麦克风设备)
❌ WebSocket连接失败
```

---

## 其他常见问题

### 问题2: 麦克风权限被拒绝

**错误信息**：`NotAllowedError` 或 `Permission denied`

**解决方案**：

1. **Chrome浏览器**：
   - 点击地址栏左侧的锁图标 🔒
   - 选择"网站设置"
   - 将"麦克风"设置为"允许"
   - 刷新页面

2. **Edge浏览器**：
   - 类似Chrome的操作
   - 或访问 `edge://settings/content/microphone`

3. **Safari浏览器**：
   - Safari → 偏好设置 → 网站 → 麦克风
   - 选择您的网站，设置为"允许"

### 问题3: 未找到麦克风设备

**错误信息**：`NotFoundError` 或 `Requested device not found`

**解决方案**：

1. 检查麦克风是否正确连接
2. Windows系统设置：
   - 设置 → 隐私 → 麦克风
   - 确保"允许应用访问麦克风"已开启
3. 尝试在其他应用中测试麦克风（如录音机）
4. 重启浏览器或电脑

### 问题4: WebSocket连接失败

**错误信息**：`WebSocket connection failed` 或 错误码 401/403

**可能原因**：

1. **API密钥错误**
   ```bash
   # 检查 .env.local 文件
   NEXT_PUBLIC_XFYUN_APP_ID=68e8f7dc
   NEXT_PUBLIC_XFYUN_API_KEY=5bcb3b65355065be495f97c90ab9b330
   NEXT_PUBLIC_XFYUN_API_SECRET=NDFhZDgyMzk3ZTZhNzk4YjFhNmY4M2Zl
   ```

2. **服务器未重启**
   - 修改环境变量后必须重启开发服务器
   ```bash
   # 停止服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

3. **网络问题**
   - 检查网络连接
   - 尝试禁用VPN或代理
   - 检查防火墙设置

4. **时间同步问题**
   - 讯飞API使用时间戳验证（±5分钟）
   - 确保系统时间正确

### 问题5: 评测结果解析失败

**错误信息**：`评测结果解析失败` 或 `XML解析错误`

**解决方案**：

1. 检查浏览器控制台的XML原始数据
2. 确认返回的status=2（评测完成）
3. 查看错误码：
   - 10163: 数据过长
   - 68676: 乱读检测
   - 其他错误码见API文档

### 问题6: 录音质量差或无声音

**问题表现**：评分很低或显示"无语音"

**解决方案**：

1. **检查麦克风音量**
   - Windows: 设置 → 系统 → 声音 → 输入设备音量
   - 建议音量70-90%

2. **测试麦克风**
   ```javascript
   // 在浏览器控制台运行
   navigator.mediaDevices.getUserMedia({audio: true})
     .then(stream => {
       console.log('麦克风可用:', stream.getAudioTracks());
       stream.getTracks().forEach(t => t.stop());
     })
     .catch(err => console.error('麦克风错误:', err));
   ```

3. **环境要求**
   - 在安静环境录音
   - 距离麦克风10-30cm
   - 避免背景噪音

### 问题7: HTTPS/安全上下文错误

**错误信息**：`getUserMedia is not defined` 或 `Only available in secure contexts`

**解决方案**：

1. **开发环境**：
   - localhost 自动被视为安全上下文 ✅
   - 127.0.0.1 也可以 ✅

2. **生产环境**：
   - 必须使用 HTTPS ✅
   - Vercel自动提供HTTPS

3. **局域网测试**：
   - 使用 `https://` 或配置本地证书

---

## 详细诊断步骤

### 完整诊断流程

```bash
# 1. 检查环境变量
Get-Content .env.local

# 2. 检查依赖
npm list next react

# 3. 清除缓存重新构建
Remove-Item -Recurse -Force .next
npm run dev

# 4. 查看详细日志
# 开启浏览器控制台，切换到 Network 和 Console 标签
```

### 浏览器兼容性测试

| 功能 | Chrome | Edge | Safari | Firefox |
|------|--------|------|--------|---------|
| getUserMedia | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| ScriptProcessor | ⚠️ 已废弃但可用 | ⚠️ | ⚠️ | ⚠️ |

**注意**：ScriptProcessorNode已被废弃，未来可能需要迁移到AudioWorklet。

---

## 环境检查清单

### 开发环境

- [ ] Node.js 18+ 已安装
- [ ] npm 依赖已安装 (`npm install`)
- [ ] `.env.local` 文件存在且配置正确
- [ ] 开发服务器正在运行 (`npm run dev`)
- [ ] 浏览器支持 Web Audio API
- [ ] 麦克风设备正常工作

### 浏览器环境

- [ ] 使用现代浏览器 (Chrome/Edge/Safari/Firefox)
- [ ] 已授权麦克风权限
- [ ] 在安全上下文中 (localhost 或 HTTPS)
- [ ] 浏览器控制台无致命错误
- [ ] 网络连接正常

### API配置

- [ ] APPID 正确
- [ ] APIKey 正确
- [ ] APISecret 正确
- [ ] 讯飞账户有余额
- [ ] 服务已开通（语音评测流式版）

---

## 获取帮助

### 查看日志

**浏览器控制台 (F12)**：
```javascript
// 应该看到的日志
"录音器初始化成功"
"WebSocket连接成功"
"发送参数帧: {...}"
"发送音频帧: 首帧, 大小: ..."
"收到评测结果: {...}"
```

**网络请求**：
- 查看 Network 标签
- 筛选 WS (WebSocket)
- 查看连接状态和消息

### 常用调试命令

```bash
# 查看环境变量是否加载
# 在浏览器控制台运行
console.log(process.env.NEXT_PUBLIC_XFYUN_APP_ID)

# 测试麦克风
navigator.mediaDevices.enumerateDevices()
  .then(devices => console.log(devices.filter(d => d.kind === 'audioinput')))

# 测试WebSocket连接
const ws = new WebSocket('wss://ise-api.xfyun.cn/v2/open-ise')
ws.onopen = () => console.log('连接成功')
ws.onerror = (e) => console.error('连接失败', e)
```

---

## 联系支持

如果以上方法都无法解决问题：

1. **查看完整错误日志**
   - 浏览器控制台 (F12)
   - Network 标签的 WebSocket 消息

2. **提供以下信息**
   - 操作系统和版本
   - 浏览器和版本
   - Node.js 版本 (`node -v`)
   - 完整错误消息
   - 控制台截图

3. **参考文档**
   - [README.md](./README.md)
   - [讯飞开放平台文档](https://www.xfyun.cn/doc/)
   - [GitHub Issues](your-repo-issues-url)

---

**最后更新**: 2025年  
**适用版本**: v1.0.0


