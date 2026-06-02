const express = require('express');
const uploadRoutes = require('./uploadRoutes');
const charRoutes = require('./charRoutes');

const router = express.Router();

/**
 * API 路由汇总
 */
router.use('/upload', uploadRoutes);
router.use('/analyze', charRoutes);

/**
 * GET /api
 * API 根路径 - 返回基本信息
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: '一字心解 API',
      version: '1.0.0',
      endpoints: {
        upload: 'POST /api/upload',
        analyze: 'POST /api/analyze',
        health: 'GET /api/analyze/health',
      },
    },
  });
});

module.exports = router;
