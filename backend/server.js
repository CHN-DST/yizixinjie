const app = require('./src/app');
const { env } = require('./src/config/env');
const logger = require('./src/utils/logger');

// 设置定时清理过期图片（每 30 分钟）
const imageService = require('./src/services/imageService');
setInterval(
  () => imageService.cleanExpiredFiles(),
  30 * 60 * 1000
);

// 启动服务器
app.listen(env.port, () => {
  logger.info('='.repeat(50));
  logger.info('  一字心解 API 服务已启动');
  logger.info(`  环境: ${env.nodeEnv}`);
  logger.info(`  端口: ${env.port}`);
  logger.info(`  API: http://localhost:${env.port}/api`);
  logger.info(`  健康检查: http://localhost:${env.port}/api/analyze/health`);
  logger.info('='.repeat(50));
});
