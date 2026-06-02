# 部署指南

## 前端部署 (Vercel)

### 1. 准备工作
- 代码推送到 GitHub 仓库
- 注册 [Vercel](https://vercel.com) 账号并关联 GitHub

### 2. 导入项目
1. 在 Vercel 点击 "New Project"
2. 选择 GitHub 仓库
3. **Root Directory** 设置为 `frontend`
4. **Framework Preset** 选择 `Vite`
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 3. 环境变量
在 Vercel 项目设置中添加：
```
VITE_API_BASE_URL=https://your-render-app.onrender.com
```

### 4. 部署
点击 "Deploy" 即可。后续每次 push 到主分支自动部署。

---

## 后端部署 (Render)

### 1. 准备工作
- 代码推送到 GitHub 仓库
- 注册 [Render](https://render.com) 账号并关联 GitHub

### 2. 创建 Web Service
1. 在 Render 点击 "New +" → "Web Service"
2. 选择 GitHub 仓库
3. 设置以下参数：
   - **Name**: `yizixinjie-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. 环境变量
在 Render 添加：
```
NODE_ENV=production
PORT=3000
DEEPSEEK_API_KEY=sk-your-api-key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 4. 部署
点击 "Create Web Service" 即可自动部署。

> ⚠️ 注意：Render 免费计划空闲时会休眠，首次请求可能需等待 30-50 秒。

---

## 本地开发

### 后端
```bash
cd backend
cp .env.example .env.local
# 编辑 .env.local 填入配置
npm install
npm run dev
```

### 前端
```bash
cd frontend
cp .env.example .env.local
# 编辑 .env.local 填入 VITE_API_BASE_URL
npm install
npm run dev
```
