const { createWorker } = require('tesseract.js');
const logger = require('../utils/logger');

/**
 * OCR 识别服务
 * 使用 Tesseract.js 识别图片中的汉字
 */
class OcrService {
  constructor() {
    this.worker = null;
    this.isReady = false;
  }

  /**
   * 初始化 OCR Worker（懒加载 + 单例）
   */
  async initWorker() {
    if (this.worker && this.isReady) return this.worker;

    logger.info('初始化 Tesseract OCR Worker...');
    this.worker = await createWorker('chi_sim', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.debug(`OCR 进度: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    this.isReady = true;
    logger.info('OCR Worker 初始化完成');
    return this.worker;
  }

  /**
   * 从图片中识别文字
   * @param {string} imageBase64 - 图片的 Base64 编码
   * @returns {Promise<{text: string, chars: string[]}>} 识别结果
   */
  async recognize(imageBase64) {
    try {
      const worker = await this.initWorker();

      logger.info('开始 OCR 识别...');
      const { data } = await worker.recognize(imageBase64);
      const rawText = data.text.trim();

      // 提取所有汉字
      const chineseChars = this.extractChinese(rawText);

      logger.info(`OCR 识别完成: "${rawText}" → 汉字: [${chineseChars.join(', ')}]`);

      return {
        rawText,
        chineseChars,
        confidence: data.confidence,
      };
    } catch (error) {
      logger.error('OCR 识别失败:', error.message);
      return { rawText: '', chineseChars: [], confidence: 0 };
    }
  }

  /**
   * 从文本中提取汉字字符
   */
  extractChinese(text) {
    if (!text) return [];
    const matches = text.match(/[一-鿿]/g);
    return matches ? [...new Set(matches)] : []; // 去重
  }

  /**
   * 销毁 Worker（释放资源）
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

module.exports = new OcrService();
