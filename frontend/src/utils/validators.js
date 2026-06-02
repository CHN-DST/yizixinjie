/**
 * 表单验证工具
 */

/**
 * 验证图片文件
 */
export function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return '请选择图片文件';
  }
  if (!allowedTypes.includes(file.type)) {
    return '只支持 JPG、PNG、WebP 格式的图片';
  }
  if (file.size > maxSize) {
    return `图片大小不能超过 ${maxSize / 1024 / 1024}MB`;
  }
  return null; // 验证通过
}

/**
 * 验证 Base64 图片数据
 */
export function validateBase64(base64) {
  if (!base64) {
    return '缺少图片数据';
  }
  if (!base64.startsWith('data:image/')) {
    return '无效的图片数据格式';
  }
  return null;
}
