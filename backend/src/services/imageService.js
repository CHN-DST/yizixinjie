const fs = require('fs');
const path = require('path');
const { getFileAsBase64, safeDeleteFile } = require('../utils/fileHelper');

/**
 * 图片处理服务
 */
class ImageService {
  /**
   * 将上传的图片文件转换为 Base64 编码
   * @param {string} filePath - 图片文件的绝对路径
   * @returns {string} Base64 编码的图片数据
   */
  toBase64(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
      throw Object.assign(new Error('图片文件不存在'), { statusCode: 404 });
    }
    return getFileAsBase64(filePath);
  }

  /**
   * 获取图片的文件信息
   * @param {object} file - multer 返回的文件对象
   * @returns {object} 文件信息
   */
  getFileInfo(file) {
    if (!file) return null;
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
    };
  }

  /**
   * 清理过期图片文件（超过1小时）
   */
  cleanExpiredFiles() {
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    fs.readdir(uploadsDir, (err, files) => {
      if (err) return;
      files.forEach((file) => {
        if (file === '.gitkeep') return;
        const filePath = path.join(uploadsDir, file);
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) return;
          if (now - stats.mtimeMs > oneHour) {
            safeDeleteFile(filePath);
          }
        });
      });
    });
  }
}

module.exports = new ImageService();
