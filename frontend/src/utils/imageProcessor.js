/**
 * 图片处理工具
 */

/**
 * 将 file 对象转换为 Base64 字符串
 * @param {File} file - 图片文件
 * @returns {Promise<string>} Base64 编码
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 压缩图片（限制最大宽度和大小）
 * @param {string} base64 - 原始 Base64
 * @param {number} maxWidth - 最大宽度（默认 1024）
 * @param {number} quality - 压缩质量（默认 0.8）
 * @returns {Promise<string>} 压缩后的 Base64
 */
export function compressImage(base64, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 如果图片本身已经很小，不需要压缩
      if (img.width <= maxWidth) {
        resolve(base64);
        return;
      }

      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = base64;
  });
}

/**
 * 获取图片文件大小（MB）
 * @param {string} base64
 * @returns {number} 大小（MB）
 */
export function getBase64Size(base64) {
  // 去除 data:image/xxx;base64, 头部
  const str = base64.split(',')[1] || base64;
  const bytes = (str.length * 3) / 4;
  return bytes / (1024 * 1024);
}
