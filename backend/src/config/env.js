const path = require('path');

// 加载环境变量文件（本地优先，生产兜底）
const envFiles = ['.env.local', '.env.production', '.env.example'].map((f) =>
  path.resolve(__dirname, '../../', f)
);
require('dotenv').config({ path: envFiles });

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl:
      process.env.DEEPSEEK_API_URL ||
      'https://api.deepseek.com/v1/chat/completions',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10, // MB
};

// 验证必要环境变量
function validateEnv() {
  const errors = [];
  if (!env.deepseek.apiKey || env.deepseek.apiKey === 'sk-your-api-key-here') {
    errors.push('DEEPSEEK_API_KEY 未配置，请在 backend/.env.local 中设置');
  }
  if (errors.length > 0) {
    console.error('[环境变量错误]');
    errors.forEach((e) => console.error(`  - ${e}`));
    // 不阻止启动，允许在没有 API key 时使用本地数据
  }
}

module.exports = { env, validateEnv };
