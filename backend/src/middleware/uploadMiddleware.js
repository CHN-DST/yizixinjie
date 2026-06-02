const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const uploadConfig = require('../config/upload');

// 确保上传目录存在
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 存储配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // 生成唯一文件名
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// 文件过滤器
const fileFilter = (_req, file, cb) => {
  if (uploadConfig.isValidMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(uploadConfig.getFileTypeErrorMessage()), false);
  }
};

// multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

/**
 * 单图上传中间件
 * 字段名: image
 */
const uploadSingleImage = upload.single('image');

/**
 * 包装 multer 错误处理
 */
function handleUpload(req, res, next) {
  uploadSingleImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: `文件大小超过限制 (最大 ${uploadConfig.maxFileSize / 1024 / 1024}MB)`,
        });
      }
      return res.status(400).json({
        success: false,
        error: `上传错误: ${err.message}`,
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
    next();
  });
}

module.exports = { handleUpload };
