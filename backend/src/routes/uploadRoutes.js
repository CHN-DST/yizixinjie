const express = require('express');
const { handleUpload } = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

/**
 * POST /api/upload
 * 上传手写汉字图片
 */
router.post('/', handleUpload, uploadImage);

module.exports = router;
