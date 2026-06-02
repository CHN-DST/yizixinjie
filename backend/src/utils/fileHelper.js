const fs = require('fs');
const path = require('path');

/**
 * 文件操作辅助工具
 */

/**
 * 获取文件的 Base64 编码（用于传给 Vision API）
 */
function getFileAsBase64(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  const mimeType = mimeMap[ext] || 'image/jpeg';
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

/**
 * 安全删除文件
 */
function safeDeleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`[FileHelper] 删除文件失败: ${filePath}`, err.message);
  }
}

/**
 * 获取文件路径相对于 uploads 目录的路径
 */
function getRelativePath(absolutePath) {
  const uploadsDir = path.resolve(__dirname, '../uploads');
  return path.relative(uploadsDir, absolutePath);
}

module.exports = { getFileAsBase64, safeDeleteFile, getRelativePath };
