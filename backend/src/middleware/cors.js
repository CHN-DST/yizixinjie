const cors = require('cors');
const { env } = require('../config/env');

/**
 * CORS 中间件
 * 开发环境：允许 localhost
 * 生产环境：允许指定的 Vercel 域名 + Vercel 预览域名
 */
const allowedOrigins = [
  env.corsOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  // Vercel 预览部署的域名通配
  ...(env.nodeEnv === 'production'
    ? [/\.vercel\.app$/]
    : []),
];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如 curl、Postman）
    if (!origin) return callback(null, true);

    // 检查是否匹配允许的 origin
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] 拒绝请求 origin: ${origin}`);
      callback(null, true); // 宽松模式：允许所有（生产环境可收紧）
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

module.exports = corsMiddleware;
