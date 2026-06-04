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
const STATS_BLOB_ID = '019e8c8e-e512-7565-af11-96a2c7970ab4';
const STATS_URL = `https://jsonblob.com/api/jsonBlob/${STATS_BLOB_ID}`;

// 内存缓存，避免每次读写都调 API
let statsCache = null;
let cacheTime = 0;

// ==================== 访问统计（jsonblob.com 云存储，多实例共享） ====================
async function loadStats() {
  if (statsCache && Date.now() - cacheTime < 30000) return statsCache;
  try {
    const resp = await axios.get(STATS_URL, { timeout: 3000 });
    statsCache = resp.data;
    cacheTime = Date.now();
    return statsCache;
  } catch { return statsCache || {}; }
}

async function saveStats(stats) {
  statsCache = stats;
  cacheTime = Date.now();
  try { await axios.put(STATS_URL, stats, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }); } catch {}
}

function getToday() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

async function trackVisit() {
  const stats = await loadStats();
  const today = getToday();
  if (!stats[today]) stats[today] = { views: 0, analyzes: 0 };
  stats[today].views++;
  await saveStats(stats);
}

async function trackAnalyze() {
  const stats = await loadStats();
  const today = getToday();
  if (!stats[today]) stats[today] = { views: 0, analyzes: 0 };
  stats[today].analyzes++;
  await saveStats(stats);
}

async function getStatsData(days = 7) {
  const stats = await loadStats();
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    result.push({ date: key, views: (stats[key]?.views || 0), analyzes: (stats[key]?.analyzes || 0) });
  }
  return result;
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

  // GET /key
  if (method === 'GET' && reqPath === '/key') {
    return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, todayKey: getTodayKey() }) };
  }

  // GET /stats
  if (method === 'GET' && reqPath === '/stats') {
    const data = await getStatsData(7);
    return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, data }) };
  }

  // POST /ping
  if (method === 'POST' && reqPath === '/ping') {
    await trackVisit();
    const s = await loadStats();
    const today = getToday();
    return { statusCode: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: true, today: { views: s[today]?.views || 0, analyzes: s[today]?.analyzes || 0 } }) };
  }

  // POST /key
  if (method === 'POST' && reqPath === '/key') {
    try {
      const { key } = JSON.parse(event.body || '{}');
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

    await trackAnalyze();
    return { statusCode: 200, headers: h, body: JSON.stringify({ success: true, data }) };
  } catch (e) {
    console.error(e.message);
    return { statusCode: 500, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify({ success: false, error: '服务器错误' }) };
  }
};
