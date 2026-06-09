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

// ==================== Supabase 数据库 ====================
const SUPABASE_URL = 'https://gobuofltakjowzpqetwf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iL4QzFPXmjLiiHKBYY4ZOQ_OlyCE1vs';
const ADMIN_PASSWORD = 'yizixinjie2026';

async function saveRecord(ip, character, question, result) {
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/records`, {
      ip: ip || 'unknown',
      character,
      question: question || '',
      result: result || {},
      created_at: new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      timeout: 5000,
    });
  } catch (e) {
    console.error('Save record error:', e.message);
  }
}

async function queryRecords(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  try {
    const resp = await axios.get(`${SUPABASE_URL}/rest/v1/records`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      params: { select: '*', order: 'created_at.desc', offset, limit },
      timeout: 5000,
    });
    return resp.data || [];
  } catch (e) { console.error('queryRecords error:', e.message); return []; }
}

async function countRecords() {
  try {
    const resp = await axios.get(`${SUPABASE_URL}/rest/v1/records`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact',
      },
      params: { select: 'id', limit: 1 },
      timeout: 5000,
    });
    return parseInt(resp.headers['content-range']?.split('/')[1] || '0');
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
    ? `\n\n用户手写了「${character}」字，心中想问：「${question}」\n\n⚠️ 所有分析必须围绕此问题：取格回应问题、五行分析关联问题、拆解关联问题、吉凶明确、3-5条建议`
    : '';
  return `你是精通中国古代测字术的大师，深谙《测字秘牒》与《心易六法》。请对汉字"${character}"深度解析。

## 心法：装头/接脚/穿心/破解/对关五法，象形/会意/谐声/假借/指事/转注六义，五行六神定吉凶

## 返回严格 JSON：{"character":"${character}","pronunciation":"","radical":"","strokeCount":0,"wuxing":"","liushen":"","etymology":{"origin":"","formation":"","ancientForms":"","originalMeaning":"","evolution":""},"characterDeconstruction":{"components":"","addStroke":"","removeStroke":"","headAndTail":"","recombine":""},"culture":{"symbolism":"","classicalUsage":"","folkConnection":""},"divination":{"pattern":"","wuxingAnalysis":"","auspiciousness":"","advice":[]},"psychology":{"visualImpression":"","strokePsychology":"","writerInsight":""}}${q}
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
      const records = await queryRecords(page, 50);
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

