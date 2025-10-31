# 登录功能使用指南

## 功能概述

本系统已集成完整的用户认证功能，支持邮箱注册和登录。

## 主要功能

### 1. 用户注册
- 访问 `/register` 页面
- 填写姓名、邮箱、密码
- 密码至少6个字符
- 注册成功后自动登录并跳转到首页

### 2. 用户登录
- 访问 `/login` 页面
- 输入邮箱和密码
- 登录成功后跳转到首页

### 3. 用户会话管理
- 登录后会话保持7天
- 首页右上角显示用户信息
- 点击用户头像可以查看个人信息或登出

### 4. 登出功能
- 点击用户菜单中的"登出"按钮
- 清除会话，返回未登录状态

## 技术实现

### 认证方式
- 使用 JWT (JSON Web Token) 进行用户认证
- Token 存储在 HttpOnly Cookie 中，提高安全性
- 密码使用 bcrypt 加密存储

### 数据存储
- **开发环境**：当前使用内存存储（重启后数据丢失）
- **生产环境建议**：集成数据库（如 MongoDB, PostgreSQL 等）

### 安全特性
- 密码加密存储
- HttpOnly Cookie 防止 XSS 攻击
- JWT Token 有效期限制
- 邮箱格式验证

## 环境配置

在 `.env` 文件中配置以下变量：

```env
# JWT密钥（生产环境请使用强密码）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**重要提示**：在生产环境中，请务必修改 `JWT_SECRET` 为一个强随机字符串。

## API 端点

### 注册
- **URL**: `/api/auth/register`
- **方法**: POST
- **参数**: 
  - `email`: 邮箱地址
  - `password`: 密码（至少6个字符）
  - `name`: 用户姓名

### 登录
- **URL**: `/api/auth/login`
- **方法**: POST
- **参数**:
  - `email`: 邮箱地址
  - `password`: 密码

### 登出
- **URL**: `/api/auth/logout`
- **方法**: POST

### 获取当前用户
- **URL**: `/api/auth/me`
- **方法**: GET

## 客户端集成

使用提供的客户端工具函数：

```typescript
import { login, register, logout, getCurrentUser } from '@/lib/auth-client';

// 登录
const result = await login('user@example.com', 'password');

// 注册
const result = await register('user@example.com', 'password', 'User Name');

// 登出
await logout();

// 获取当前用户
const user = await getCurrentUser();
```

## 页面路由

- `/` - 首页（显示登录状态）
- `/login` - 登录页面
- `/register` - 注册页面
- `/word` - 单词跟读（需要登录后访问更佳体验）
- `/sentence` - 句子跟读（需要登录后访问更佳体验）

## 未来改进建议

1. **数据库集成**：替换内存存储为持久化数据库
2. **邮箱验证**：添加邮箱验证功能
3. **密码重置**：实现忘记密码功能
4. **用户资料**：添加用户资料编辑功能
5. **学习记录**：保存用户的练习记录和成绩
6. **社交登录**：集成第三方登录（Google, GitHub等）
7. **访问控制**：为某些功能添加登录保护

## 开发测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问 http://localhost:3000

3. 点击右上角"注册"按钮创建测试账号

4. 使用创建的账号登录

## 常见问题

### Q: 重启服务器后无法登录？
A: 当前使用内存存储，重启后数据会丢失。请重新注册账号。

### Q: 如何更改 JWT 密钥？
A: 在 `.env` 文件中修改 `JWT_SECRET` 的值。

### Q: 是否支持第三方登录？
A: 当前版本仅支持邮箱登录，未来可以扩展第三方登录功能。

### Q: 密码是否安全？
A: 是的，密码使用 bcrypt 加密存储，不会以明文形式保存。

## 技术栈

- **前端框架**: Next.js 14 (React)
- **样式**: Tailwind CSS
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **Cookie管理**: cookie

## 联系支持

如有问题或建议，请联系开发团队。



