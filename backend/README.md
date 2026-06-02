# 一字心解 - 后端 API

基于 Node.js + Express 的汉字分析 API 服务。

## 目录说明

```
backend/
├── server.js                          # 服务器启动入口
├── src/
│   ├── app.js                         # Express 应用配置
│   ├── config/                        # 配置管理
│   │   ├── env.js                     # 环境变量加载与验证
│   │   ├── deepseek.js                # DeepSeek API 配置与 Prompt
│   │   └── upload.js                  # 文件上传配置
│   ├── controllers/                   # 请求处理
│   │   ├── charController.js          # 汉字分析接口
│   │   └── uploadController.js        # 图片上传接口
│   ├── services/                      # 业务逻辑
│   │   ├── charAnalysisService.js     # 汉字综合分析
│   │   ├── deepseekService.js         # DeepSeek Vision API
│   │   └── imageService.js            # 图片处理
│   ├── models/                        # 数据模型
│   │   └── Character.js               # 汉字分析结果模型
│   ├── routes/                        # 路由
│   │   ├── index.js                   # 路由汇总
│   │   ├── charRoutes.js              # 分析路由
│   │   └── uploadRoutes.js            # 上传路由
│   ├── middleware/                    # 中间件
│   │   ├── cors.js                    # 跨域配置
│   │   ├── uploadMiddleware.js        # 文件上传处理
│   │   ├── logger.js                  # 请求日志
│   │   └── errorHandler.js            # 错误处理
│   ├── utils/                         # 工具函数
│   │   ├── validators.js              # 数据验证
│   │   ├── fileHelper.js              # 文件操作
│   │   └── logger.js                  # 日志工具
│   └── data/                          # 本地数据
│       ├── charDatabase.json          # 汉字字源库
│       └── psychologyMappings.json    # 心理学映射
│
└── uploads/                           # 临时上传目录
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload | 上传图片 |
| POST | /api/analyze | 分析汉字 |
| GET | /api/analyze/health | 健康检查 |
| GET | /api | API 信息 |

## Quick Start

```bash
cp .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY
npm install
npm run dev
```
