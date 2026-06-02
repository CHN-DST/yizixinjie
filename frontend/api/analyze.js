/**
 * Vercel Serverless Function — 汉字测字分析 API
 * 接收 { character, question }，调用 DeepSeek 返回分析结果
 */

// DeepSeek 系统 Prompt（与 deepseekService.js 一致）
function buildPrompt(character, question) {
  const questionSuffix = question
    ? `\n\n用户手写了「${character}」字，心中想问：「${question}」\n\n## ⚠️ 核心任务：用户的问题\n\n**这是本次测字的灵魂所在！所有分析必须紧紧围绕此问题展开！**\n\n要求：\n1. 测字取格（pattern）必须直接回应用户问题\n2. 五行分析必须解释与用户问题的因果关系\n3. 测字拆解的每个部件含义都要关联到用户的问题上\n4. 吉凶判断要针对用户问题给出明确答案\n5. **必须给出3-5条具体可操作的建议**`
    : '';

  return `你是一位精通中国古代测字术的大师，深谙《测字秘牒》与《心易六法》的奥义。请对汉字"${character}"进行深度解析。

## 测字心法总纲

盖一字之来必各有体，因其体之隐现不同，故其测之变化不定。邵子书曰：「认定用神。」又曰：「体立而后用行。」字不加减，不足以开问者之蒙昧。

## 分析方法

**一、拆字观象法**——装头、接脚、穿心、破解、对关，五法并用
**二、象形会意法**——以字象物，如「煙」为因风吹火之象、「裕」为补天浴日之象
**三、五行六神法**——详其五行生克，观其六神动静（青龙/朱雀/勾陈/螣蛇/白虎/玄武）
**四、谐声假借法**——以音通义，如「倒」通「到」、「桃」通「逃」
**五、观梅心易法**——心镜光明，随机应变

## 分析维度

**1. 字源追溯（15%）** — 甲骨文/金文/小篆形态、造字法、本义演变
**2. 测字拆解（25%）** — 拆解部件、添笔减笔、对关取象、破解重组，每项含义关联用户问题
**3. 文化象征（15%）** — 文化含义、经典引用、民俗关联、五行六神
**4. 测字取格与建议（45%）** — 取格回应问题、五行分析、吉凶判断、3-5条具体建议${questionSuffix}

## 输出格式（严格 JSON）
{
  "character": "${character}",
  "pronunciation": "拼音",
  "radical": "部首",
  "strokeCount": 笔画数,
  "wuxing": "五行",
  "liushen": "六神",
  "etymology": {
    "origin": "字源简述",
    "formation": "造字法",
    "ancientForms": "古文字形态",
    "originalMeaning": "本义",
    "evolution": "演变"
  },
  "characterDeconstruction": {
    "components": "部件拆解",
    "addStroke": "添一笔成何字，暗示什么",
    "removeStroke": "减一笔成何字，暗示什么",
    "headAndTail": "对关法：某头某尾",
    "recombine": "破解重组"
  },
  "culture": {
    "symbolism": "文化象征",
    "classicalUsage": "经典引用",
    "folkConnection": "民俗关联"
  },
  "divination": {
    "pattern": "取格——回应问题",
    "wuxingAnalysis": "五行分析",
    "auspiciousness": "吉凶判断",
    "advice": ["建议1", "建议2", "建议3", "建议4", "建议5"]
  },
  "psychology": {
    "visualImpression": "视觉印象",
    "strokePsychology": "笔画心理",
    "writerInsight": "书写者洞察——以测字大师口吻直接回应用户问题"
  }
}
只返回 JSON，不要有其他文字。`;
}

function parseResponse(content) {
  try {
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
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
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { character, question } = req.body || {};

    // 验证
    if (!character || !/^[一-鿿]$/.test(character)) {
      return res.status(400).json({ success: false, error: '请输入一个有效的汉字' });
    }
    if (question && question.length > 500) {
      return res.status(400).json({ success: false, error: '问题字数不能超过500字' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'API Key 未配置' });
    }

    const systemPrompt = buildPrompt(character, question || '');
    const userMessage = question
      ? `请以测字大师的身份，分析汉字"${character}"，并为我心中所问之事指点迷津。`
      : `请以测字大师的身份，为我一解"${character}"字的玄机。`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek API error:', err);
      return res.status(502).json({ success: false, error: 'AI 服务暂时不可用' });
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ success: false, error: 'AI 返回为空' });
    }

    const data = parseResponse(content);
    if (!data) {
      return res.status(502).json({ success: false, error: 'AI 返回解析失败' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, error: '服务器错误' });
  }
}
