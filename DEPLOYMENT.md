# 一字心解 — 部署指南

## 第 1 步：推送代码到 GitHub

### 1.1 在 GitHub 创建仓库
1. 打开 https://github.com/new
2. Repository name: `yizixinjie`（或自定义）
3. 选择 Public 或 Private
4. **不要**勾选 "Add a README file"
5. 点击 "Create repository"

### 1.2 推送代码
创建完成后，GitHub 会显示一串命令，复制执行：

```bash
cd d:/Project/CharSoul
git remote add origin https://github.com/YOUR_USERNAME/yizixinjie.git
git branch -M master main
git push -u origin main
```

> 如果提示登录，使用 GitHub 用户名 + Personal Access Token 认证

---

## 第 2 步：部署后端到 Render

### 2.1 创建 Render 账号
1. 打开 https://render.com
2. 使用 GitHub 账号注册/登录

### 2.2 创建 Web Service
1. 点击 **"New +"** → **"Web Service"**
2. 选择刚推送的 GitHub 仓库
3. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Name | `yizixinjie-api` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

### 2.3 设置环境变量
在 Render 的 Environment 标签中添加：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DEEPSEEK_API_KEY` | `sk-f772e061f1b84082a36480c46bf6364a` |
| `DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` |
| `CORS_ORIGIN` | `https://你的前端域名.vercel.app`（先填 *，部署前端后再改） |
| `MAX_FILE_SIZE` | `10` |

### 2.4 部署
点击 **"Create Web Service"**，等待部署完成（约 3-5 分钟）。

记下 Render 提供的域名，类似：`https://yizixinjie-api.onrender.com`

> ⚠️ 免费计划：空闲 15 分钟后服务会休眠，下次请求需等待 30-50 秒唤醒。

---

## 第 3 步：部署前端到 Vercel

### 3.1 创建 Vercel 账号
1. 打开 https://vercel.com
2. 使用 GitHub 账号注册/登录

### 3.2 导入项目
1. 点击 **"New Project"**
2. 选择 GitHub 仓库
3. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 3.3 设置环境变量
在 Vercel 的 Environment Variables 中添加：

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://yizixinjie-api.onrender.com`（第 2 步的 Render 域名） |

### 3.4 部署
点击 **"Deploy"**。Vercel 会自动构建并部署。

部署完成后你会获得一个域名，类似：`https://yizixinjie.vercel.app`

### 3.5 更新 Render CORS
回到 Render，将 `CORS_ORIGIN` 环境变量更新为你的 Vercel 域名：
```
CORS_ORIGIN=https://yizixinjie.vercel.app
```

---

## 第 4 步：验证部署

1. 打开 Vercel 提供的域名
2. 输入一个汉字（如「心」）
3. 填写问题
4. 点击「开始分析」
5. 查看测字结果

---

## 本地开发

```bash
# 后端
cd backend
cp .env.example .env.local
# 编辑 .env.local 配置 DEEPSEEK_API_KEY
npm install && npm run dev

# 前端
cd frontend
npm install && npm run dev
```
