import dayjs from 'dayjs';

/**
 * 数据格式化工具
 */

/**
 * 格式化时间戳为可读日期
 */
export function formatDate(isoString) {
  return dayjs(isoString).format('YYYY年MM月DD日 HH:mm');
}

/**
 * 格式化时间戳为相对时间
 */
export function formatRelativeTime(isoString) {
  const now = dayjs();
  const target = dayjs(isoString);
  const minutes = now.diff(target, 'minute');
  const hours = now.diff(target, 'hour');
  const days = now.diff(target, 'day');

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(isoString);
}

/**
 * 截断长文本
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
