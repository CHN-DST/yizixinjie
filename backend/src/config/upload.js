const { env } = require('./env');

/**
 * 图片上传配置
 */
module.exports = {
  maxFileSize: env.maxFileSize * 1024 * 1024, // 转换为字节
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],

  /**
   * 验证文件类型
   */
  isValidMimeType(mimetype) {
    return this.allowedMimeTypes.includes(mimetype);
  },

  /**
   * 获取友好的错误信息
   */
  getFileTypeErrorMessage() {
    return `只支持以下图片格式: ${this.allowedExtensions.join(', ')}`;
  },
};
