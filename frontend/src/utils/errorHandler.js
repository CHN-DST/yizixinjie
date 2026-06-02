import { showToast, showDialog } from 'vant';

/**
 * 统一错误处理工具
 */

/**
 * 显示错误提示（轻量 toast）
 */
export function showError(message) {
  showToast({
    message: message || '操作失败，请稍后再试',
    icon: 'fail',
    duration: 3000,
  });
}

/**
 * 显示成功提示
 */
export function showSuccess(message) {
  showToast({
    message: message || '操作成功',
    icon: 'success',
    duration: 2000,
  });
}

/**
 * 显示确认对话框
 */
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    showDialog({
      title: title || '提示',
      message: message || '确定执行此操作吗？',
      showCancelButton: true,
    })
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

/**
 * 处理 API 错误并显示友好提示
 */
export function handleApiError(error, fallbackMsg = '请求失败') {
  console.error('[API Error]', error);
  const message = error.message || fallbackMsg;
  showError(message);
}
