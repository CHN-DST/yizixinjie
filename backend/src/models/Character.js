/**
 * 汉字分析结果数据模型
 * 用于规范 API 返回的数据结构（含测字秘法字段）
 */
class CharacterResult {
  constructor(data) {
    this.character = data.character || '';
    this.pronunciation = data.pronunciation || '';
    this.radical = data.radical || '';
    this.strokeCount = data.strokeCount || 0;
    this.wuxing = data.wuxing || '';              // 五行
    this.liushen = data.liushen || '';            // 六神
    this.etymology = this.normalizeEtymology(data.etymology);
    this.characterDeconstruction = this.normalizeDeconstruction(data.characterDeconstruction);
    this.culture = this.normalizeCulture(data.culture);
    this.divination = this.normalizeDivination(data.divination);
    this.psychology = this.normalizePsychology(data.psychology);
    this.imageUrl = data.imageUrl || '';
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  normalizeDeconstruction(d) {
    if (!d) return {};
    return {
      components: d.components || '',
      addStroke: d.addStroke || '',
      removeStroke: d.removeStroke || '',
      headAndTail: d.headAndTail || '',
      recombine: d.recombine || '',
    };
  }

  normalizeDivination(div) {
    if (!div) return {};
    return {
      pattern: div.pattern || '',
      wuxingAnalysis: div.wuxingAnalysis || '',
      auspiciousness: div.auspiciousness || '',
      advice: Array.isArray(div.advice) ? div.advice : [],
    };
  }

  normalizeEtymology(etym) {
    if (!etym) return {};
    return {
      origin: etym.origin || '',
      formation: etym.formation || '',
      ancientForms: etym.ancientForms || '',
      originalMeaning: etym.originalMeaning || '',
      evolution: etym.evolution || '',
    };
  }

  normalizeCulture(cult) {
    if (!cult) return {};
    return {
      symbolism: cult.symbolism || '',
      classicalUsage: cult.classicalUsage || '',
      folkConnection: cult.folkConnection || '',
    };
  }

  normalizePsychology(psych) {
    if (!psych) return {};
    return {
      visualImpression: psych.visualImpression || '',
      strokePsychology: psych.strokePsychology || '',
      writerInsight: psych.writerInsight || '',
    };
  }

  /**
   * 验证结果是否完整有效
   */
  isValid() {
    return this.character && this.character.length === 1;
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      character: this.character,
      pronunciation: this.pronunciation,
      radical: this.radical,
      strokeCount: this.strokeCount,
      wuxing: this.wuxing,
      liushen: this.liushen,
      etymology: this.etymology,
      characterDeconstruction: this.characterDeconstruction,
      culture: this.culture,
      divination: this.divination,
      psychology: this.psychology,
      imageUrl: this.imageUrl,
      timestamp: this.timestamp,
    };
  }
}

module.exports = CharacterResult;
