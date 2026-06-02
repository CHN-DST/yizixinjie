const imageService = require('../services/imageService');
const logger = require('../utils/logger');

/**
 * 图片上传控制器
 */

/**
 * POST /api/upload
 * 处理图片上传
 */
async function uploadImage(req, res, next) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: '请选择一张图片上传',
      });
    }

    const fileInfo = imageService.getFileInfo(file);
    logger.info(`图片上传成功: ${fileInfo.filename}`);

    res.json({
      success: true,
      data: {
        imageId: fileInfo.filename.replace(/\.[^.]+$/, ''), // 去掉扩展名
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadImage };
