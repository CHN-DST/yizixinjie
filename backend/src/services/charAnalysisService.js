const path = require('path');
const fs = require('fs');
const ocrService = require('./ocrService');
const deepseekService = require('./deepseekService');
const CharacterResult = require('../models/Character');
const logger = require('../utils/logger');

/**
 * 汉字综合分析服务
 * 流程: OCR 识别 → AI 文本分析 → 本地数据补充
 */
class CharAnalysisService {
  constructor() {
    this.charDatabase = null;
    this.psychologyMappings = null;
    this.loadLocalData();
  }

  /**
   * 加载本地汉字数据库
   */
  loadLocalData() {
    try {
      const charPath = path.resolve(__dirname, '../data/charDatabase.json');
      const psychPath = path.resolve(
        __dirname,
        '../data/psychologyMappings.json'
      );

      this.charDatabase = fs.existsSync(charPath)
        ? JSON.parse(fs.readFileSync(charPath, 'utf-8'))
        : {};

      this.psychologyMappings = fs.existsSync(psychPath)
        ? JSON.parse(fs.readFileSync(psychPath, 'utf-8'))
        : {};
    } catch (error) {
      logger.warn('加载本地数据失败:', error.message);
      this.charDatabase = {};
      this.psychologyMappings = {};
    }
  }

  /**
   * 综合分析汉字图片（OCR + AI）
   * @param {string} imageBase64 - 图片 Base64
   * @param {string} question - 用户自定义问题（可选）
   * @returns {Promise<{result: CharacterResult, ocrInfo: object}>}
   */
  async analyze(imageBase64, question = '') {
    // ======== 第1步: OCR 识别 ========
    logger.info('步骤1: OCR 识别图片中的汉字...');
    const ocrResult = await ocrService.recognize(imageBase64);

    const ocrInfo = {
      rawText: ocrResult.rawText,
      chineseChars: ocrResult.chineseChars,
      confidence: ocrResult.confidence,
    };

    // 取第一个识别到的汉字
    const detectedChar = ocrResult.chineseChars[0] || '';

    if (!detectedChar) {
      logger.warn('OCR 未能识别到汉字');
      return {
        result: new CharacterResult({
          character: '',
          psychology: {
            visualImpression: '未能从图片中识别出汉字，请确保图片清晰，汉字居中书写。',
            strokePsychology: '',
            writerInsight: '',
          },
        }),
        ocrInfo,
      };
    }

    logger.info(`OCR 识别到汉字: "${detectedChar}"`);

    // ======== 第2步: AI 文本分析 ========
    logger.info('步骤2: 调用 AI 进行多维分析...');
    let aiResult = await deepseekService.analyzeCharacter(detectedChar, question);

    // ======== 第3步: 本地数据补充 ========
    let enriched;
    if (aiResult && aiResult.character) {
      enriched = this.enrichWithLocalData(aiResult);
    } else {
      // AI 不可用时使用纯本地数据
      enriched = this.buildLocalOnlyResult(detectedChar);
    }

    // ======== 第4步: 构建结果 ========
    const result = new CharacterResult({
      ...enriched,
    });

    return { result, ocrInfo };
  }

  /**
   * 直接通过汉字进行分析（跳过 OCR）
   * @param {string} character - 用户直接输入的汉字
   * @param {string} question - 用户自定义问题（可选）
   * @returns {Promise<{result: CharacterResult, ocrInfo: object}>}
   */
  async analyzeByCharacter(character, question = '') {
    logger.info(`直接输入模式，分析汉字: "${character}"`);

    // 步骤1: AI 文本分析
    let aiResult = await deepseekService.analyzeCharacter(character, question);

    // 步骤2: 本地数据补充
    let enriched;
    if (aiResult && aiResult.character) {
      enriched = this.enrichWithLocalData(aiResult);
    } else {
      enriched = this.buildLocalOnlyResult(character);
    }

    // 步骤3: 构建结果
    const result = new CharacterResult(enriched);

    return {
      result,
      ocrInfo: { rawText: character, chineseChars: [character], confidence: 100 },
    };
  }

  /**
   * 用本地数据库丰富 AI 返回的结果
   */
  enrichWithLocalData(aiResult) {
    const char = aiResult.character;
    const localData = this.charDatabase[char];

    if (!localData) return aiResult;

    return {
      ...aiResult,
      etymology: {
        origin: aiResult.etymology.origin || localData.etymology?.origin || '',
        formation:
          aiResult.etymology.formation || localData.etymology?.formation || '',
        ancientForms:
          aiResult.etymology.ancientForms ||
          localData.etymology?.ancientForms ||
          '',
        originalMeaning:
          aiResult.etymology.originalMeaning ||
          localData.etymology?.originalMeaning ||
          '',
        evolution:
          aiResult.etymology.evolution || localData.etymology?.evolution || '',
      },
      culture: {
        symbolism:
          aiResult.culture.symbolism || localData.culture?.symbolism || '',
        classicalUsage:
          aiResult.culture.classicalUsage ||
          localData.culture?.classicalUsage ||
          '',
        folkConnection:
          aiResult.culture.folkConnection ||
          localData.culture?.folkConnection ||
          '',
      },
      psychology: {
        visualImpression:
          aiResult.psychology.visualImpression ||
          this.getPsychologyForChar(char)?.visualImpression ||
          '',
        strokePsychology:
          aiResult.psychology.strokePsychology ||
          this.getPsychologyForChar(char)?.strokePsychology ||
          '',
        writerInsight:
          aiResult.psychology.writerInsight ||
          this.getPsychologyForChar(char)?.writerInsight ||
          '',
      },
    };
  }

  /**
   * 纯本地数据构建（AI 不可用时的降级方案）
   */
  buildLocalOnlyResult(char) {
    const localData = this.charDatabase[char];
    const psychData = this.psychologyMappings[char];

    if (localData || psychData) {
      return {
        character: char,
        etymology: localData?.etymology || {},
        culture: localData?.culture || {},
        psychology: psychData || {},
      };
    }

    // 本地也没有该汉字的数据
    return {
      character: char,
      psychology: {
        visualImpression: `「${char}」的分析需要 AI 支持，请配置 DeepSeek API Key 后重试`,
        strokePsychology: '',
        writerInsight: '',
      },
    };
  }

  /**
   * 获取指定汉字的心理学映射
   */
  getPsychologyForChar(char) {
    return this.psychologyMappings[char] || null;
  }

  /**
   * 重新加载本地数据（用于热更新）
   */
  reload() {
    this.loadLocalData();
    logger.info('本地数据已重新加载');
  }
}

module.exports = new CharAnalysisService();
