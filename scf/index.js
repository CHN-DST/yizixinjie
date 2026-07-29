/**
 * 腾讯云 SCF 函数 — 一字心解（前端 + API 二合一）
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const KEY_SECRET = 'yizixinjie2026!';

// ==================== Cloudflare D1 数据库 ====================
const CF_ACCOUNT_ID = 'f8573594431f8f4d77e16d0f37c20722';
const CF_D1_ID = '1ab19a8d-0fb9-418a-93c8-9fe07449289f';
const CF_API_TOKEN = process.env.CF_API_TOKEN || '';
const ADMIN_PASSWORD = 'a1431474270';

function d1Query(sql, params = []) {
  return axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_ID}/query`,
    { sql, params },
    {
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );
}

async function saveRecord(ip, character, question, result) {
  try {
    const resp = await d1Query(
      'INSERT INTO records (ip, character, question, result, created_at) VALUES (?, ?, ?, ?, ?)',
      [ip || 'unknown', character, question || '', JSON.stringify(result || {}), new Date().toISOString()]
    );
    if (!resp.data.success) console.error('D1 insert failed:', resp.data.errors);
  } catch (e) {
    console.error('Save record error:', e.message);
  }
}

async function queryRecords(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const resp = await d1Query(
      'SELECT * FROM records ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    if (resp.data.success && resp.data.result[0]) {
      return resp.data.result[0].results.map(r => ({
        ...r,
        result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
      }));
    }
    return [];
  } catch (e) { console.error('queryRecords error:', e.message); return []; }
}

async function countRecords() {
  try {
    const resp = await d1Query('SELECT COUNT(*) AS total FROM records');
    if (resp.data.success && resp.data.result[0]) {
      return resp.data.result[0].results[0]?.total || 0;
    }
    return 0;
  } catch (e) { console.error('countRecords error:', e.message); return 0; }
}

// ==================== 密钥系统 ====================
function getTodayKey() {
  const now = new Date();
  const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const hash = crypto.createHash('sha256').update(KEY_SECRET + dateStr).digest('hex');
  return 'YZXJ-' + hash.substring(0, 8).toUpperCase();
}

function validateKey(key) {
  if (!key || typeof key !== 'string') return false;
  return key.trim().toUpperCase() === getTodayKey();
}

// ==================== 静态文件 ====================
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

function serveStatic(filePath) {
  const full = path.join(PUBLIC_DIR, filePath);
  if (!full.startsWith(PUBLIC_DIR)) return null;
  try {
    if (fs.statSync(full).isFile()) {
      const ext = path.extname(full).toLowerCase();
      return { body: fs.readFileSync(full, 'utf-8'), contentType: MIME[ext] || 'application/octet-stream' };
    }
  } catch {}
  try {
    return { body: fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8'), contentType: 'text/html; charset=utf-8' };
  } catch { return null; }
}

// ==================== DeepSeek Prompt ====================
function buildPrompt(character, question) {
  const q = question
    ? `\n\n用户手写了「${character}」字，心中想问：「${question}」\n\n⚠️ 所有分析必须围绕此问题展开：以所问之事为体，以所写之字为用，体用结合，取格回应问题、五行关联问题、拆解扣合问题、吉凶明确、3-5条具体建议。`
    : '';
  return `你是精通中国古代测字术的大师，深谙《测字秘牒》《心易六法》《相字心法》《梅花易数》等古籍。

# 心法总纲
字从太极出，各具首尾，各有结构。测字不离羲画之理，生生化化，变幻万端。因其所示之事而推之，据吾所触之几而断之。认定用神，体立而后用行。

# 测字九法（据《测字秘牒》）
1. 装头法：添笔于字之上部以彰其理。如"古"添头为"罟/苦/居"；"兄"为"克/兌"；"日"为"春/皆/百"。
2. 接脚法：添笔于下部以完其意。如"采"接脚为"悉/番"；"千"为"秀/壬"；"立"为"産/童"。
3. 穿心法：从字中穿入数笔以变其形。如衣裾之缝，不从中而合。
4. 破解法：将字拆开，分离偏旁笔画，各自观之，再合而推之。
5. 添笔法：于字中任意位置添一笔画，观其变化。
6. 减笔法：于字中减一笔画，观其所剩。
7. 对关法：取字之头尾以断吉凶。如"善"为美头喜足；"帛"为皇头帝足；"伯"为伸头缩脚；"友"为有头没尾。
8. 摘字法：摘取字中一二小笔画以断之。如"哉"摘"土/戈"；"殿"摘"共"；"調"摘"吉/司"。
9. 观梅法：邵子心诀，活泼泼地，唯心镜光明、随物洞照。万物影响皆可借来应用。此最高法门。

# 六书六义
象形（画成其物）、会意（比类和谊）、谐声（以事为名取譬相成）、假借（本无其字依声托事）、指事（视而可识察而见意）、转注（建类一首同意相受）。

# 五行六神
木火土金水生克乘侮定吉凶。六神（青龙/朱雀/勾陈/螣蛇/白虎/玄武）配字之方位笔画决事体。

# 心易心法
测字贵在活变。字同而人异，事异而断殊。须结合问者年龄、性别、所问之事、所书之时地、笔画轻重疾徐、墨色浓淡枯润，综合决断。吉凶悔吝生乎动，字之笔画即心之动象。

# 返回严格 JSON
{"character":"${character}","pronunciation":"","radical":"","strokeCount":0,"wuxing":"","liushen":"","etymology":{"origin":"","formation":"","ancientForms":"","originalMeaning":"","evolution":""},"characterDeconstruction":{"components":"","addStroke":"此法添笔后变为何字、其义如何","removeStroke":"此法减笔后变为何字、其义如何","headAndTail":"对关法：头为何、尾为何、吉凶如何","pierceHeart":"穿心法","recombine":"破解法：拆解后各部分含义与重组"},"culture":{"symbolism":"","classicalUsage":"","folkConnection":""},"divination":{"pattern":"取格：用何法（装头/接脚/穿心/破解/对关/摘字），何故取此格","wuxingAnalysis":"五行生克分析","auspiciousness":"吉/凶/平，详述理由","advice":["3-5条切实可行的建议，每条关联字之拆解"]},"psychology":{"visualImpression":"字之形态给人的第一感觉","strokePsychology":"笔画轻重疾徐反映的心理状态","writerInsight":"从书写特征洞察当下心境"}}${q}
只返回 JSON。`;
}

function parseAndValidate(content) {
  try {
    let j = content.trim();
    const m = j.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (m) j = m[1];
    return JSON.parse(j);
  } catch { return null; }
}

// ==================== SCF 入口 ====================
exports.main_handler = async (event) => {
  const method = (event.httpMethod || event.method || 'GET').toUpperCase();
  const reqPath = event.path || '/';

  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };

  if (method === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };

  // ========== POST /admin → 登录验证 ==========
  if (method === 'POST' && reqPath === '/admin') {
    try {
      const { password } = JSON.parse(event.body || '{}');
      if (password === ADMIN_PASSWORD) {
        return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, token: 'admin_verified' }) };
      }
      return { statusCode: 401, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: '密码错误' }) };
    } catch { return { statusCode: 400, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: '参数错误' }) }; }
  }

  // ========== GET /admin/records → 查询记录 ==========
  if (method === 'GET' && reqPath === '/admin/records') {
    try {
      const page = parseInt(event.queryString?.page || '1');
      const limit = parseInt(event.queryString?.limit || '50');
      const records = await queryRecords(page, limit);
      const total = await countRecords();
      return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, data: records, total }) };
    } catch (e) { return { statusCode: 500, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: e.message }) }; }
  }

  // GET /key
  if (method === 'GET' && reqPath === '/key') {
    return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, todayKey: getTodayKey() }) };
  }

  // POST /key
  if (method === 'POST' && reqPath === '/key') {
    try {
      const { key } = JSON.parse(event.body || '{}');
      // 隐藏密钥：无限次使用
      if (key && key.trim() === 'dst666') {
        return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, valid: true, unlimited: true }) };
      }
      const valid = validateKey(key);
      return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, valid, todayKey: valid ? undefined : getTodayKey() }) };
    } catch {
      return { statusCode: 400, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: '参数错误' }) };
    }
  }

  // GET → 前端页面
  if (method === 'GET') {
    const file = serveStatic(reqPath === '/' ? '/index.html' : reqPath);
    if (file) {
      return { statusCode: 200, isBase64Encoded: true, headers: { ...corsHeaders, 'content-type': file.contentType }, body: Buffer.from(file.body, 'utf-8').toString('base64') };
    }
    return { statusCode: 404, isBase64Encoded: true, headers: { ...corsHeaders, 'content-type': 'text/plain' }, body: Buffer.from('Not Found').toString('base64') };
  }

  // POST /analyze
  try {
    const body = JSON.parse(event.body || '{}');
    const { character, question } = body;
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const h = { ...corsHeaders, 'content-type': 'application/json' };

    if (!apiKey) return { statusCode: 500, headers: h, body: JSON.stringify({ success: false, error: 'API Key 未配置' }) };
    if (!character || !/^[一-鿿]$/.test(character)) return { statusCode: 400, headers: h, body: JSON.stringify({ success: false, error: '请输入一个有效汉字' }) };
    if (question && question.length > 500) return { statusCode: 400, headers: h, body: JSON.stringify({ success: false, error: '问题字数不能超过500字' }) };

    const resp = await axios.post(DEEPSEEK_URL, {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildPrompt(character, question || '') },
        { role: 'user', content: question ? `请以测字大师身份分析"${character}"，为我指点迷津。` : `请为我一解"${character}"字的玄机。` },
      ],
      max_tokens: 4096, temperature: 0.7,
    }, { headers: { 'content-type': 'application/json', Authorization: `Bearer ${apiKey}` }, timeout: 90000 });

    const content = resp.data?.choices?.[0]?.message?.content;
    if (!content) return { statusCode: 502, headers: h, body: JSON.stringify({ success: false, error: 'AI 返回为空' }) };
    const data = parseAndValidate(content);
    if (!data) return { statusCode: 502, headers: h, body: JSON.stringify({ success: false, error: 'AI 结果解析失败' }) };

    // 保存记录到数据库（异步，不阻塞响应）
    const clientIp = event.requestContext?.sourceIp || event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '';
    saveRecord(clientIp, character, question || '', data).catch(() => {});

    return { statusCode: 200, headers: h, body: JSON.stringify({ success: true, data }) };
  } catch (e) {
    console.error(e.message);
    return { statusCode: 500, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: '服务器错误' }) };
  }
};

