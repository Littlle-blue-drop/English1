# 🔧 Vercel 部署故障排查指南

## 问题 1: 录音启动失败 - WebSocket 连接失败 (错误代码 1006)

### 症状
```
录音启动失败: [object Event]
WebSocket connection to 'wss://ise-api.xfyun.cn/v2/open-ise?...' failed
WebSocket关闭: 1006
```

### 可能的原因和解决方案

---

#### ✅ 1. 检查环境变量是否正确配置

**步骤 1：访问环境变量检查 API**

在浏览器中访问：
```
https://your-app.vercel.app/api/test-env
```

应该看到类似这样的输出：
```json
{
  "hasAppId": true,
  "hasApiKey": true,
  "hasApiSecret": true,
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true,
  "hasJwtSecret": true,
  "appIdPrefix": "68e8",
  "apiKeyPrefix": "5bcb",
  "serverTime": "Sat, 01 Nov 2025 14:06:51 GMT"
}
```

**如果任何值为 `false` 或 `missing`：**

1. 进入 Vercel Dashboard
2. 选择项目 → **Settings** → **Environment Variables**
3. 确认所有变量都已添加：
   - `NEXT_PUBLIC_XFYUN_APP_ID`
   - `NEXT_PUBLIC_XFYUN_API_KEY`
   - `NEXT_PUBLIC_XFYUN_API_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. 每个变量都要勾选：✅ Production ✅ Preview ✅ Development
5. 保存后，重新部署：**Deployments** → 最新部署 → **Redeploy**

---

#### ✅ 2. 检查讯飞 API IP 白名单设置

**问题：** 讯飞 API 可能启用了 IP 白名单，导致 Vercel 服务器无法访问。

**解决方案：**

1. 登录讯飞开放平台：https://console.xfyun.cn/
2. 进入您的应用 → **应用管理**
3. 查看 **IP白名单** 设置
4. 如果启用了 IP 白名单：
   - **选项 A（推荐）：** 关闭 IP 白名单限制
   - **选项 B：** 添加 Vercel IP 范围（不推荐，Vercel IP 是动态的）

**注意：** 讯飞 WebSocket API (ISE) 通常在客户端浏览器中运行，IP 应该是用户的 IP，而不是服务器 IP。

---

#### ✅ 3. 检查讯飞 API 密钥是否正确

**验证步骤：**

1. 登录讯飞开放平台：https://console.xfyun.cn/
2. 进入 **控制台** → **我的应用**
3. 找到您的应用，查看：
   - **APPID** (应用ID)
   - **APIKey**
   - **APISecret**
4. 对比这些值是否与 Vercel 环境变量中的值完全一致
5. **注意：不要有多余的空格或引号**

**正确的格式：**
```
NEXT_PUBLIC_XFYUN_APP_ID=68e8f7dc
NEXT_PUBLIC_XFYUN_API_KEY=5bcb3b65355065be495f97c90ab9b330
NEXT_PUBLIC_XFYUN_API_SECRET=NDFhZDgyMzk3ZTZhNzk4YjFhNmY4M2Zl
```

**错误的格式（不要这样）：**
```
NEXT_PUBLIC_XFYUN_APP_ID="68e8f7dc"  ❌ 有引号
NEXT_PUBLIC_XFYUN_APP_ID= 68e8f7dc   ❌ 有空格
```

---

#### ✅ 4. 检查讯飞 API 服务是否开通

**验证步骤：**

1. 登录讯飞开放平台
2. 进入 **控制台** → **我的应用**
3. 检查 **语音评测（ISE）** 服务是否已开通
4. 查看服务状态：
   - 是否已实名认证
   - 是否有剩余调用次数
   - 服务是否处于正常状态

**如果服务未开通：**
- 在应用中添加 **语音评测** 服务
- 完成实名认证（如需要）
- 确认有可用的调用次数

---

#### ✅ 5. 检查浏览器麦克风权限

**症状：** 录音器初始化失败

**解决方案：**

1. **确保使用 HTTPS**
   - Vercel 自动提供 HTTPS
   - 本地开发使用 `https://localhost`（而不是 `http://`）
   
2. **检查浏览器权限**
   - 点击地址栏左侧的锁图标
   - 确认麦克风权限已允许
   - 如果被拒绝，点击"重置权限"并刷新页面

3. **测试麦克风**
   - 打开浏览器设置 → 隐私和安全 → 网站设置 → 麦克风
   - 确认麦克风设备正常工作

---

#### ✅ 6. 检查讯飞 API 配额和余额

**问题：** API 调用次数用尽或余额不足

**检查步骤：**

1. 登录讯飞开放平台
2. 查看 **控制台** → **资源包管理**
3. 检查：
   - 免费调用次数是否用尽
   - 如果购买了服务，检查余额
   - 查看今日调用次数统计

**如果配额用尽：**
- 等待次日刷新（免费版）
- 或购买额外的调用次数

---

#### ✅ 7. 查看详细错误日志

**在 Vercel 上查看日志：**

1. 进入 Vercel Dashboard
2. 选择项目 → **Deployments**
3. 点击最新的部署
4. 查看 **Functions** 标签页
5. 查看是否有服务器端错误

**在浏览器中查看日志：**

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 查看完整的错误信息
4. 复制错误信息用于进一步分析

---

#### ✅ 8. 测试 API 连接

**创建一个简单的测试页面：**

1. 访问 `/api/test-env` 检查环境变量
2. 检查输出中的 `appIdPrefix` 和 `apiKeyPrefix`
3. 确认前缀与您的实际密钥匹配

---

#### ✅ 9. 检查 CORS 设置

**问题：** 跨域请求被阻止

**解决方案：**

讯飞 WebSocket API 应该支持跨域连接。如果遇到 CORS 错误：

1. 检查浏览器控制台是否有 CORS 相关错误
2. 确认使用的是 WebSocket 协议（`wss://`）而不是 HTTP

---

#### ✅ 10. 尝试重新部署

有时部署过程中的缓存问题可能导致环境变量未正确加载：

1. 进入 Vercel Dashboard
2. **Deployments** → 最新部署
3. 点击右上角的 **...** 菜单
4. 选择 **Redeploy**
5. 勾选 **"Use existing Build Cache"** 选项为 **OFF**（清除缓存）
6. 点击 **Redeploy**

---

## 问题 2: 登录/注册功能失败

### 症状
- 无法注册新用户
- 登录失败
- 显示"数据库连接失败"

### 解决方案

#### ✅ 检查 Supabase 配置

1. 访问 https://supabase.com 并登录
2. 选择您的项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** (例如：https://xxxxx.supabase.co)
   - **anon public** key (一个长字符串)

5. 在 Vercel 中更新环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL = [您的 Project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [您的 anon public key]
   ```

6. 保存后重新部署

#### ✅ 检查数据库表是否创建

1. 在 Supabase Dashboard 中
2. 进入 **SQL Editor**
3. 运行项目中的 `supabase-schema.sql` 文件内容
4. 确认表已成功创建：
   - `users` 表
   - `practice_records` 表

---

## 问题 3: 部署成功但页面显示 500 错误

### 解决方案

1. **查看 Vercel 函数日志**
   - Deployments → Functions → 查看错误详情

2. **检查构建日志**
   - 查看是否有编译错误
   - 检查依赖是否正确安装

3. **验证所有环境变量**
   - 使用 `/api/test-env` 端点检查

---

## 📞 获取更多帮助

如果以上方法都无法解决问题：

1. **查看讯飞文档**
   - https://www.xfyun.cn/doc/asr/ise/API.html

2. **查看 Vercel 文档**
   - https://vercel.com/docs

3. **查看 Supabase 文档**
   - https://supabase.com/docs

4. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签页
   - 截图错误信息

---

## 🔍 快速诊断清单

在联系支持之前，请完成以下检查：

- [ ] 环境变量全部配置正确（访问 `/api/test-env` 验证）
- [ ] 讯飞 API 密钥正确且服务已开通
- [ ] 讯飞 API 有剩余调用次数
- [ ] 浏览器已授予麦克风权限
- [ ] 使用 HTTPS 访问（Vercel 自动提供）
- [ ] Supabase 数据库表已创建
- [ ] 已尝试重新部署（清除缓存）
- [ ] 已查看浏览器控制台和 Vercel 日志

---

**祝您部署顺利！如有问题，请提供以上检查结果以便进一步诊断。** 🚀

