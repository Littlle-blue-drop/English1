# ⚡ 快速启动指南

## 📋 5分钟快速上手

### 第一步：安装依赖

```bash
npm install
```

### 第二步：配置API密钥

创建 `.env.local` 文件：

```bash
# Windows PowerShell
New-Item .env.local

# macOS / Linux
touch .env.local
```

编辑 `.env.local`，添加以下内容：

```env
NEXT_PUBLIC_XFYUN_APP_ID=你的APPID
NEXT_PUBLIC_XFYUN_API_KEY=你的APIKey
NEXT_PUBLIC_XFYUN_API_SECRET=你的APISecret
```

> **如何获取API密钥？**
> 1. 访问 https://console.xfyun.cn/
> 2. 注册/登录账号
> 3. 创建 WebAPI 应用
> 4. 添加"语音评测（流式版）"服务
> 5. 在应用详情页复制 APPID、APIKey、APISecret

### 第三步：启动开发服务器

```bash
npm run dev
```

浏览器访问：http://localhost:3000

### 第四步：测试功能

1. 点击"单词跟读"或"句子跟读"
2. 授权浏览器麦克风权限（首次使用）
3. 点击录音按钮，朗读内容
4. 再次点击停止，查看评分结果

## 🎯 功能演示

### 单词跟读示例

```
1. 选择单词 "apple"
2. 点击录音按钮 🎤
3. 清晰朗读 "apple"
4. 点击停止 ⏹
5. 查看评分结果（总分、音节分析）
```

### 句子跟读示例

```
1. 选择句子 "Hello, how are you today?"
2. 点击录音按钮 🎤
3. 完整朗读句子
4. 点击停止 ⏹
5. 查看多维度评分（准确度、流畅度、标准度）
```

## 📦 项目文件说明

```
.
├── app/                    # 页面目录
│   ├── page.tsx           # 首页
│   ├── word/              # 单词跟读
│   └── sentence/          # 句子跟读
├── components/            # React组件
│   ├── RecordButton.tsx   # 录音按钮
│   └── ScoreDisplay.tsx   # 评分展示
├── lib/                   # 核心库
│   ├── xfyun-client.ts    # 讯飞API客户端
│   ├── audio-recorder.ts  # 录音器
│   └── xml-parser.ts      # 结果解析
└── .env.local             # API密钥（需创建）
```

## 🚀 部署到Vercel

### 最快方法（3步）

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 添加环境变量
vercel env add NEXT_PUBLIC_XFYUN_APP_ID
vercel env add NEXT_PUBLIC_XFYUN_API_KEY  
vercel env add NEXT_PUBLIC_XFYUN_API_SECRET

# 生产部署
vercel --prod
```

### 通过GitHub（推荐）

1. 推送到GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

2. 访问 https://vercel.com
3. 导入GitHub仓库
4. 添加环境变量
5. 点击 Deploy

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## ❓ 常见问题

### Q1: 无法录音？

**A:** 检查以下几点：
- ✅ 使用 Chrome/Edge/Safari 浏览器
- ✅ 授权麦克风权限
- ✅ 使用 HTTPS 或 localhost
- ✅ 麦克风设备正常工作

### Q2: 评测失败？

**A:** 检查：
- ✅ API密钥配置正确
- ✅ 讯飞账户有余额
- ✅ 网络连接正常
- ✅ 查看浏览器控制台错误信息

### Q3: 评分太低？

**A:** 建议：
- 🎤 在安静环境录音
- 📢 清晰准确地发音
- ⏱️ 保持自然语速
- 🔊 调整麦克风音量

### Q4: 如何添加自定义单词/句子？

**A:** 两种方式：
1. 在页面上输入框中输入
2. 修改代码中的 `SAMPLE_WORDS` 或 `SAMPLE_SENTENCES` 数组

## 📚 进阶使用

### 修改示例单词

编辑 `app/word/page.tsx`：

```typescript
const SAMPLE_WORDS = [
  'apple',
  'banana',
  'your-word-here',  // 添加你的单词
];
```

### 修改示例句子

编辑 `app/sentence/page.tsx`：

```typescript
const SAMPLE_SENTENCES = [
  'Your custom sentence here.',  // 添加你的句子
];
```

### 调整评分标准

评分权重在讯飞API中定义，不同学段有不同权重：

- **成人**：准确度50% + 流畅度30% + 标准度20%
- **学生**：准确度60% + 流畅度30% + 标准度10%

### 添加中文评测

1. 修改 `ent` 参数为 `cn_vip`
2. 修改 `category` 为中文题型
3. 调整试题格式（详见API文档）

## 🎨 自定义样式

### 修改主题颜色

编辑 `tailwind.config.ts`：

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',    // 主色调
      secondary: '#your-color',  // 次色调
      danger: '#your-color',     // 警告色
    },
  },
},
```

### 修改页面布局

编辑对应页面文件：
- 首页：`app/page.tsx`
- 单词页：`app/word/page.tsx`
- 句子页：`app/sentence/page.tsx`

## 📊 查看API使用情况

访问讯飞控制台：
1. 登录 https://console.xfyun.cn/
2. 查看"服务管理"
3. 点击"语音评测（流式版）"
4. 查看调用次数、余额等信息

## 🔧 故障排查

### 查看详细日志

打开浏览器开发者工具（F12）：
- Console：查看错误信息
- Network：查看API请求
- Application：查看存储数据

### 重置项目

```bash
# 删除依赖
rm -rf node_modules

# 清除缓存
rm -rf .next

# 重新安装
npm install

# 重新启动
npm run dev
```

## 📞 获取帮助

- 📖 查看完整文档：[README.md](./README.md)
- 🚀 部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 提交Issue：GitHub Issues
- 💬 社区讨论：GitHub Discussions

## ✅ 检查清单

在部署前确认：

- [ ] API密钥已配置
- [ ] 本地测试通过
- [ ] 录音功能正常
- [ ] 评分显示正确
- [ ] 浏览器兼容性测试
- [ ] 移动端适配测试
- [ ] 环境变量已添加到Vercel
- [ ] 部署成功并可访问

---

**🎉 恭喜！您已完成快速启动，开始使用AI语音评测系统吧！**

如有问题，请查看 [README.md](./README.md) 获取更多信息。

