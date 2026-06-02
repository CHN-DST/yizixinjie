import axios from 'axios';

/**
 * Axios 实例
 * 统一配置基础 URL、超时、拦截器
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000, // 120秒超时（AI 分析需要时间）
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可在此添加 token 等
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.success === false) {
      return Promise.reject(new Error(data.error || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请检查网络后重试'));
    }
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }
    const msg =
      error.response.data?.error || `服务器错误 (${error.response.status})`;
    return Promise.reject(new Error(msg));
  }
);

export default api;
