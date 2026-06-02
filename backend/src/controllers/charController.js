const path = require('path');
const fs = require('fs');
const charAnalysisService = require('../services/charAnalysisService');
const imageService = require('../services/imageService');
const { safeDeleteFile } = require('../utils/fileHelper');
const { isValidChineseChar } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * 汉字分析控制器
 */

/**
 * POST /api/analyze
 * 分析手写汉字 — 支持两种模式：
 *   模式1: 上传图片 (imageBase64/imageId) → OCR → AI
 *   模式2: 直接输入汉字 (character) → AI
 * 可选: question 用户问题，用于个性化解读
 */
async function analyzeCharacter(req, res, next) {
  let filePath = null;

  try {
    const { imageId, imageBase64, character, question } = req.body;

    // ======== 参数验证 ========
    const hasImage = !!(imageId || imageBase64);
    const hasChar = !!character;

    // 二选一：不能同时有或同时无
    if (hasImage && hasChar) {
      return res.status(400).json({
        success: false,
        error: '请只选择一种输入方式：上传图片或直接输入汉字',
      });
    }
    if (!hasImage && !hasChar) {
      return res.status(400).json({
        success: false,
        error: '请上传图片或直接输入一个汉字',
      });
    }

    // 验证 question 长度
    if (question && question.length > 500) {
      return res.status(400).json({
        success: false,
        error: '问题字数不能超过500字',
      });
    }

    // ======== 模式2: 直接输入汉字 ========
    if (hasChar) {
      if (!isValidChineseChar(character)) {
        return res.status(400).json({
          success: false,
          error: '请输入一个有效的汉字',
        });
      }

      logger.info(`直接输入模式，汉字: "${character}"${question ? `，问题: "${question}"` : ''}`);
      const { result } = await charAnalysisService.analyzeByCharacter(
        character,
        question || ''
      );

      if (!result.character) {
        return res.status(422).json({
          success: false,
          error: '分析失败，请稍后再试',
        });
      }

      logger.info(`分析完成: "${result.character}"`);

      return res.json({
        success: true,
        data: result.toJSON(),
      });
    }

    // ======== 模式1: 上传图片 ========
    let base64Data;

    if (imageId) {
      const uploadsDir = path.resolve(__dirname, '../uploads');
      if (!/^[a-zA-Z0-9_-]+$/.test(imageId)) {
        return res.status(400).json({
          success: false,
          error: '无效的图片 ID 格式',
        });
      }

      const files = fs.readdirSync(uploadsDir);
      const matchedFile = files.find(
        (f) => f !== '.gitkeep' && f.startsWith(imageId)
      );

      if (!matchedFile) {
        return res.status(404).json({
          success: false,
          error: '未找到对应图片，请重新上传',
        });
      }

      filePath = path.join(uploadsDir, matchedFile);
      base64Data = imageService.toBase64(filePath);
    } else {
      base64Data = imageBase64;
    }

    logger.info(`图片模式，开始 OCR${question ? `，问题: "${question}"` : ''}`);
    const { result, ocrInfo } = await charAnalysisService.analyze(
      base64Data,
      question || ''
    );

    if (!result.character) {
      return res.status(422).json({
        success: false,
        error:
          '未能从图片中识别出汉字。请确保图片清晰、光线充足、汉字居中书写。',
        ocrInfo,
      });
    }

    logger.info(`分析完成: "${result.character}"`);

    return res.json({
      success: true,
      data: result.toJSON(),
      ocr: {
        rawText: ocrInfo.rawText,
        detectedChars: ocrInfo.chineseChars,
        confidence: ocrInfo.confidence,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath) {
      safeDeleteFile(filePath);
    }
  }
}

/**
 * GET /api/analyze/health
 * 健康检查
 */
function healthCheck(_req, res) {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ocrAvailable: true,
    },
  });
}

module.exports = { analyzeCharacter, healthCheck };
