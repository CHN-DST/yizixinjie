import api from '@/services/api';
import { ref } from 'vue';

const STORAGE_KEY = 'yzxj_usage';
const FREE_LIMIT = 2;
const PREMIUM_LIMIT = 10;

// 今天的标识（以 24:00 为界）
function getTodayId() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

// 读取本地使用记录
function loadUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { date: '', count: 0, key: '' };
}

// 保存使用记录
function saveUsage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 获取当前剩余次数
export function getRemainingCount() {
  const usage = loadUsage();
  const today = getTodayId();
  if (usage.date !== today) return FREE_LIMIT;
  if (usage.unlimited) return Infinity;
  const limit = usage.key ? PREMIUM_LIMIT : FREE_LIMIT;
  return Math.max(0, limit - usage.count);
}

// 检查是否可以提问
export function canAsk() {
  const usage = loadUsage();
  const today = getTodayId();
  if (usage.date === today && usage.unlimited) return true;
  return getRemainingCount() > 0;
}

// 记录一次使用
export function recordUsage() {
  const usage = loadUsage();
  const today = getTodayId();
  if (usage.date !== today) {
    usage.date = today;
    usage.count = 1;
    usage.key = '';
  } else {
    usage.count++;
  }
  saveUsage(usage);
}

// 验证并设置密钥
export async function validateAndSetKey(key) {
  try {
    const resp = await api.post('/key', { key: key.trim() });
    if (resp.valid) {
      const usage = loadUsage();
      const today = getTodayId();
      usage.date = today;
      usage.key = key.trim().toUpperCase();
      usage.count = 0;
      usage.unlimited = !!resp.unlimited;
      saveUsage(usage);
      return { success: true, unlimited: !!resp.unlimited };
    }
    return { success: false, message: '密钥无效或已过期' };
  } catch {
    return { success: false, message: '验证失败，请稍后重试' };
  }
}

// 是否无限次
export function isUnlimited() {
  const usage = loadUsage();
  const today = getTodayId();
  return usage.date === today && usage.unlimited === true;
}

// 是否已使用密钥
export function hasValidKey() {
  const usage = loadUsage();
  const today = getTodayId();
  return usage.date === today && !!usage.key;
}

// 响应式剩余次数
export const remainingCount = ref(getRemainingCount());
export const unlimited = ref(isUnlimited());

// 刷新剩余次数
export function refreshCount() {
  remainingCount.value = getRemainingCount();
  unlimited.value = isUnlimited();
}
