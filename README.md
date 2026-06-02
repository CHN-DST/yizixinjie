# 一字心解 (Yi Zi Xin Jie)

汉字之美，一字见心。通过 AI 视觉识别，从字源学、文化学、心理学三个维度深入解析每一个汉字。

## 项目结构

```
CharSoul/
├── frontend/     # Vue3 + Vite + Vant 前端
├── backend/      # Node.js + Express 后端
└── README.md     # 项目总说明
```

## 功能流程

1. 用户手写汉字并拍照
2. 上传图片至后端
3. 调用 DeepSeek Vision API 识别汉字
4. 从字源学、文化学、心理学角度进行解析
5. 返回详细分析结果

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
cp .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY
npm run dev
```

## 技术栈

| 层   | 技术                    |
|------|------------------------|
| 前端 | Vue3, Vite, Vant, Axios |
| 后端 | Node.js, Express        |
| AI   | DeepSeek Vision API     |
| 部署 | 前端 Vercel / 后端 Render |

## 部署

详见 [DEPLOYMENT.md](DEPLOYMENT.md)
