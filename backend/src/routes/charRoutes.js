const express = require('express');
const {
  analyzeCharacter,
  healthCheck,
} = require('../controllers/charController');

const router = express.Router();

/**
 * POST /api/analyze
 * 分析手写汉字
 */
router.post('/', analyzeCharacter);

/**
 * GET /api/analyze/health
 * 健康检查
 */
router.get('/health', healthCheck);

module.exports = router;
