const express = require('express');
const path = require('path');
const corsMiddleware = require('./middleware/cors');
const loggerMiddleware = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const { validateEnv } = require('./config/env');

// 启动时验证环境变量
validateEnv();

const app = express();

// ============================================
// 全局中间件
// ============================================

// CORS 跨域
app.use(corsMiddleware);

// 请求日志
app.use(loggerMiddleware);

// 解析 JSON 请求体（限制 10MB，支持 Base64 图片）
app.use(express.json({ limit: '10mb' }));

// 解析 URL 编码请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件 - 提供上传图片访问
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// ============================================
// API 路由
// ============================================

app.use('/api', routes);

// ============================================
// 前端静态文件（生产模式）
// ============================================

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: 所有非 API 路径返回 index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
      // API 路径没匹配到，返回 404
      notFoundHandler(req, res);
    }
  });
}

// ============================================
// 错误处理
// ============================================

// 404 处理
app.use(notFoundHandler);

// 统一错误处理
app.use(errorHandler);

module.exports = app;
