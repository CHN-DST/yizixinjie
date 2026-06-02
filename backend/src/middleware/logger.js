const morgan = require('morgan');

/**
 * HTTP 请求日志中间件
 * 开发环境使用 'dev' 格式（彩色）
 * 生产环境使用 'combined' 格式（详细）
 */
const loggerMiddleware = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
);

module.exports = loggerMiddleware;
