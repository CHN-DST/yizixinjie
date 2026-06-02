const axios = require('axios');
const deepseekConfig = require('../config/deepseek');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * DeepSeek Chat API 服务
 * 使用文本模型，融入中国古代测字秘法对汉字进行多维度分析
 */
class DeepSeekService {
  constructor() {
    this.apiKey = deepseekConfig.apiKey;
    this.apiUrl = deepseekConfig.apiUrl;
    this.isConfigured = !!(
      this.apiKey && this.apiKey !== 'sk-your-api-key-here'
    );
  }

  /**
   * 调用 Chat API 分析汉字
   * @param {string} character - 要分析的汉字
   * @param {string} question - 用户自定义问题（可选）
   * @returns {Promise<object>} 分析结果
   */
  async analyzeCharacter(character, question = '') {
    if (!this.isConfigured) {
      logger.warn('DeepSeek API Key 未配置');
      return null;
    }

    if (!character || character.length !== 1) {
      logger.warn('无效的汉字输入:', character);
      return null;
    }

    const questionSuffix = question
      ? `\n\n## ⚠️ 核心任务：用户的问题\n\n用户手写了「${character}」字，心中想问：「${question}」\n\n**这是本次测字的灵魂所在！所有分析必须紧紧围绕此问题展开！**\n\n要求：\n1. 测字取格（pattern）必须直接回应用户问题，取格格式如：「问工作——某字为某某之象，主……」\n2. 五行分析必须解释与用户问题的因果关系\n3. 测字拆解的每个部件含义都要关联到用户的问题上\n4. 吉凶判断要针对用户问题给出明确答案\n5. **必须给出3-5条具体可操作的建议**，如：何时行动、方向选择、注意事项等\n6. 书写者洞察要像一位智慧长者在与你促膝谈心，既有测字玄机，又有人生哲理，更要直接解答你心中的困惑。`
      : '';

    const systemPrompt = `你是一位精通中国古代测字术的大师，深谙《测字秘牒》与《心易六法》的奥义。请对汉字"${character}"进行深度解析。

## 测字心法总纲

盖一字之来必各有体，因其体之隐现不同，故其测之变化不定。邵子书曰：「认定用神。」又曰：「体立而后用行。」测不立法，不足以示学者之权衡；字不加减，不足以开问者之蒙昧。是必乘除损益每一字到真机，流动变化数位于其间，则所问之事昭然在目。

## 分析方法：运用以下测字秘法

**一、拆字观象法**——将字拆解为部件，观其离合：
- 装头法：添笔于上，如「古」添笔为「苦」「居」，揭示隐藏的上方含义
- 接脚法：添笔于下，如「立」接脚为「童」「音」，补全下方之意
- 穿心法：从中穿入，如「月」穿心为「用」「舟」，洞察内核之机
- 破解法：拆分重组，如「行」破为「術」「衙」，另辟蹊径
- 对关法：取头足首尾，如「善」为美头喜足、「先」为牛头虎足，开门见山

**二、象形会意法**——以字象物，以意象字：
- 如「煙」为因风吹火之象，事必借力方成
- 「淋」为楚汉争锋之象，主有口角是非
- 「裕」为补天浴日之象，必得大人维持
- 「爐」为百病丛生之象，骤然更变
- 以字之形神，通天地万物之理

**三、五行六神法**——详其五行生克，观其六神动静：
- 五行定其质：金木水火土，各有旺相休囚死
- 六神察其机：青龙主吉庆，朱雀主口舌，勾陈主田土，螣蛇主怪异，白虎主凶丧，玄武主盗贼
- 字中有金者性刚，有木者仁厚，有水者智圆，有火者性急，有土者信实

**四、谐声假借法**——以音通义：
- 「倒」通「到」，「秤」通「称」，「桃」通「逃」，「梨」通「离」
- 一字多音则多义，随机应变而用之

**五、观梅心易法**——活泼泼地，惟在人之心镜光明：
- 观人、察色、辨言、辨事、察墨、辨纸、观时、相机
- 字从太极出，各具首尾，各有结构，生生化化，变幻万端

## 分析维度

请从以下维度进行解析。**若有用户问题，所有维度的分析都必须紧扣问题，不可泛泛而谈。** 语言需兼具学术底蕴与测字大师的智慧口吻：

**1. 字源追溯（15%）**
追溯甲骨文/金文/小篆形态，说明造字法、本义与演变。若有用户问题，重点选取与该问题相关的字形演变部分。

**2. 测字拆解（25%）**
运用上述拆字观象法，将该字拆解为部件。**每个部件的解读都要与用户问题建立关联**。例如：部件组合暗示问题的根源、拆开后看到什么转机、添一笔减一笔暗示何种变化方向。

**3. 文化象征（15%）**
该字的传统文化含义、经典引用、民俗关联。五行属性及六神归属。

**4. 测字取格与建议（45%）——最重要**
- **取格**：运用会意法给出「取格」，必须紧密结合用户问题，格式如：「问某事——某字为某某之象，主……」
- **五行分析**：分析五行生克如何影响用户所问之事
- **吉凶判断**：针对用户问题给出明确的吉凶趋势
- **具体建议**：**必须列出3-5条具体、可操作的建议**。每一条都需结合测字心法给出，如：
  - 时机建议（何时行动最佳，从字的哪一笔看出）
  - 方向建议（向何处去，从字的哪个部件看出）
  - 注意事项（需避开什么，从五行生克看出）
  - 心态建议（以何种心境面对，从字的气势看出）
  - 化解之法（若有不吉，如何化解）${questionSuffix}

## 输出格式

请严格以 JSON 格式返回：
{
  "character": "${character}",
  "pronunciation": "拼音",
  "radical": "部首",
  "strokeCount": 笔画数,
  "wuxing": "五行属性（金/木/水/火/土）",
  "liushen": "六神归属（青龙/朱雀/勾陈/螣蛇/白虎/玄武）",
  "etymology": {
    "origin": "字源简述",
    "formation": "造字法",
    "ancientForms": "甲骨文/金文/小篆形态描述",
    "originalMeaning": "本义",
    "evolution": "字义演变过程"
  },
  "characterDeconstruction": {
    "components": "拆解出的部件，如：木+子=李",
    "addStroke": "添一笔成何字，暗示何种变化",
    "removeStroke": "减一笔成何字，暗示何种缺失",
    "headAndTail": "对关法：某头某尾，如：善为美头喜足",
    "recombine": "破解法：拆分重组后成何新字"
  },
  "culture": {
    "symbolism": "文化象征意义",
    "classicalUsage": "经典文献用法",
    "folkConnection": "民俗关联"
  },
  "divination": {
    "pattern": "取格——必须关联用户问题，格式如：'问工作——心为火烛之象，主前程光明但需静待时机'",
    "wuxingAnalysis": "五行生克分析，必须解释与用户问题的因果关系",
    "auspiciousness": "针对用户问题的吉凶判断（200字内，给出明确答案）",
    "advice": ["建议1（具体可操作，结合测字心法）", "建议2", "建议3", "建议4", "建议5"]
  },
  "psychology": {
    "visualImpression": "视觉心理印象",
    "strokePsychology": "笔画心理分析",
    "writerInsight": "书写者心理洞察——以测字大师口吻，直接回应用户问题，像智慧长者促膝谈心，既有玄机又有人生哲理（200字以上）"
  }
}
只返回 JSON，不要有其他文字。`;

    const userMessage = question
      ? `请以测字大师的身份，分析汉字"${character}"，并为我心中所问之事指点迷津。`
      : `请以测字大师的身份，为我一解"${character}"字的玄机。`;

    const requestBody = {
      model: deepseekConfig.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    };

    try {
      logger.info(`正在调用 DeepSeek API 分析汉字: ${character}`);
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 90000,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('API 返回数据为空');
      }

      logger.info(`DeepSeek API 分析完成: ${character}`);
      return this.parseResponse(content);
    } catch (error) {
      logger.error('DeepSeek API 调用失败:', error.message);
      if (error.response) {
        logger.error('API 错误详情:', JSON.stringify(error.response.data));
      }
      return null;
    }
  }

  /**
   * 解析 API 返回的 JSON 字符串
   */
  parseResponse(content) {
    try {
      let jsonStr = content.trim();

      // 移除可能的 markdown 代码块标记
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const data = JSON.parse(jsonStr);
      return {
        character: data.character || '',
        pronunciation: data.pronunciation || '',
        radical: data.radical || '',
        strokeCount: data.strokeCount || 0,
        wuxing: data.wuxing || '',
        liushen: data.liushen || '',
        etymology: data.etymology || {},
        characterDeconstruction: data.characterDeconstruction || {},
        culture: data.culture || {},
        divination: data.divination || {},
        psychology: data.psychology || {},
      };
    } catch (error) {
      logger.error('解析 AI 返回数据失败:', error.message);
      logger.debug('原始内容:', content.substring(0, 500));
      return null;
    }
  }
}

module.exports = new DeepSeekService();
