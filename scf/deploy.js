/**
 * 自动部署 SCF 函数到腾讯云
 * 用法: node deploy.js
 */
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============ 配置 ============
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const REGION = 'ap-guangzhou';
const FUNCTION_NAME = 'yizixinjie-api';
const NAMESPACE = 'default';

// ============ 签名 (TC3-HMAC-SHA256) ============
function sign(service, action, payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  const endpoint = `${service}.tencentcloudapi.com`;

  // Step 1: Canonical Request
  const httpMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json\nhost:${endpoint}\n`;
  const signedHeaders = 'content-type;host';
  const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = [
    httpMethod, canonicalUri, canonicalQueryString,
    canonicalHeaders, signedHeaders, hashedPayload,
  ].join('\n');

  // Step 2: String to Sign
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = [algorithm, timestamp, credentialScope, hashedCanonicalRequest].join('\n');

  // Step 3: Signature
  const kDate = crypto.createHmac('sha256', `TC3${SECRET_KEY}`).update(date).digest();
  const kService = crypto.createHmac('sha256', kDate).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('tc3_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // Step 4: Authorization header
  const authorization = `${algorithm} Credential=${SECRET_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorization, timestamp, endpoint, date };
}

// ============ API 请求 ============
function apiRequest(action, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const { authorization, timestamp, endpoint } = sign('scf', action, payload);

    const req = https.request({
      hostname: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: endpoint,
        'X-TC-Action': action,
        'X-TC-Version': '2018-04-16',
        'X-TC-Timestamp': timestamp,
        'X-TC-Region': REGION,
        Authorization: authorization,
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          if (r.Response.Error) {
            reject(new Error(r.Response.Error.Message));
          } else {
            resolve(r.Response);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ============ 打包函数 ============
function createZip() {
  const AdmZip = require('./node_modules/adm-zip');
  const zip = new AdmZip();

  function addDir(dirPath, base) {
    fs.readdirSync(dirPath).forEach((f) => {
      if (f === 'package-lock.json' || f.startsWith('.') || f === 'deploy.js') return;
      const full = path.join(dirPath, f);
      if (fs.statSync(full).isDirectory()) {
        addDir(full, base);
      } else {
        zip.addLocalFile(full, path.dirname(path.relative(base, full)));
      }
    });
  }
  addDir(__dirname, __dirname);

  const zipPath = path.resolve(__dirname, '../yizixinjie-api.zip');
  zip.writeZip(zipPath);
  return zipPath;
}

// ============ 主流程 ============
async function deploy() {
  console.log('📦 打包代码...');
  const zipPath = createZip();
  const zipSize = (fs.statSync(zipPath).size / 1024).toFixed(0);
  console.log(`  ✅ ${zipPath} (${zipSize} KB)`);

  // 读取 zip 并 base64 编码
  const zipBuffer = fs.readFileSync(zipPath);
  const base64Code = zipBuffer.toString('base64');

  // 方法 1: 先获取函数信息确认存在
  console.log('🔍 检查函数...');
  try {
    const info = await apiRequest('GetFunction', {
      FunctionName: FUNCTION_NAME,
      Namespace: NAMESPACE,
    });
    console.log(`  ✅ ${info.FunctionName} (Runtime: ${info.Runtime}, Status: ${info.Status})`);
  } catch (e) {
    console.log(`  ⚠️ ${e.message}`);
  }

  // 方法 2: 更新函数代码
  console.log('🚀 更新函数代码...');
  const result = await apiRequest('UpdateFunctionCode', {
    FunctionName: FUNCTION_NAME,
    Namespace: NAMESPACE,
    Handler: 'index.main_handler',
    ZipFile: base64Code,
  });
  console.log(`  ✅ 请求已提交 (RequestId: ${result.RequestId})`);

  // 方法 3: 触发函数更新（可选，API 更新后自动生效）
  console.log('🎉 部署完成！');
}

deploy().catch((e) => {
  console.error('❌ 部署失败:', e.message);
  process.exit(1);
});
