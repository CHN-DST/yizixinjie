const { env } = require('./env');

/**
 * DeepSeek Chat API 配置
 */
module.exports = {
  apiKey: env.deepseek.apiKey,
  apiUrl: env.deepseek.apiUrl,
  model: 'deepseek-chat',
  maxTokens: 2048,
  temperature: 0.7,
};
