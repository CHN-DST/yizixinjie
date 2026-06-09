<template>
  <div class="page-container admin-page">
    <div class="content-container">
      <!-- 登录 -->
      <div v-if="!loggedIn" class="login-box">
        <h1>一字心解</h1>
        <p class="login-sub">后台管理系统</p>
        <input v-model="password" type="password" placeholder="请输入管理密码" @keyup.enter="login" />
        <button class="login-btn" @click="login">登录后台</button>
        <p v-if="loginError" class="error-msg">{{ loginError }}</p>
      </div>

      <!-- 数据面板 -->
      <div v-else>
        <div class="admin-header">
          <h1>一字心解 · 后台管理</h1>
          <button class="refresh-btn" @click="loadRecords">刷新</button>
        </div>

        <div class="stats-row">
          <span>共 <b>{{ total }}</b> 条记录</span>
          <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>时间</th>
                <th>汉字</th>
                <th>问题</th>
                <th>五行</th>
                <th>取格</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="7" class="loading-cell">加载中...</td></tr>
              <tr v-for="r in records" :key="r.id">
                <td>{{ r.id }}</td>
                <td class="time-cell">{{ formatTime(r.created_at) }}</td>
                <td class="char-cell">{{ r.character }}</td>
                <td class="q-cell">{{ r.question }}</td>
                <td>{{ r.result?.wuxing || '-' }}</td>
                <td class="pattern-cell">{{ (r.result?.divination?.pattern || '-').substring(0, 50) }}</td>
                <td class="ip-cell">{{ r.ip }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager">
          <button :disabled="page <= 1" @click="prevPage">上一页</button>
          <span>第 {{ page }} 页</span>
          <button @click="nextPage">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const password = ref('');
const loggedIn = ref(false);
const loginError = ref('');
const records = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / 50)));

async function login() {
  try {
    const resp = await fetch('https://1439501934-k13421vmpj.ap-guangzhou.tencentscf.com/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    });
    const data = await resp.json();
    if (data.success) {
      loggedIn.value = true;
      loadRecords();
    } else {
      loginError.value = '密码错误';
    }
  } catch {
    loginError.value = '网络错误';
  }
}

async function loadRecords() {
  loading.value = true;
  try {
    const resp = await fetch(`https://1439501934-k13421vmpj.ap-guangzhou.tencentscf.com/admin/records?page=${page.value}`);
    const data = await resp.json();
    if (data.success) {
      records.value = data.data;
      total.value = data.total;
    }
  } catch {} finally {
    loading.value = false;
  }
}

function prevPage() {
  if (page.value > 1) { page.value--; loadRecords(); }
}

function nextPage() {
  page.value++; loadRecords();
}

function formatTime(t) {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN');
}
</script>

<style scoped>
.admin-page { background: #f5f0e8; min-height: 100vh; }

.login-box { max-width: 320px; margin: 100px auto; text-align: center; }
.login-box h1 { font-family: KaiTi, STKaiti, serif; letter-spacing: 4px; color: #2c1810; font-size: 28px; }
.login-sub { color: #8b7355; margin: 8px 0 24px; font-size: 14px; }
.login-box input { width: 100%; padding: 12px; border: 1px solid #a89078; font-size: 16px; text-align: center; background: rgba(253,250,244,0.9); }
.login-btn { width: 100%; padding: 12px; margin-top: 10px; background: #8b3a2a; color: #fff; border: none; font-size: 16px; cursor: pointer; font-family: KaiTi, serif; letter-spacing: 2px; }
.error-msg { color: #c41e3a; margin-top: 12px; font-size: 14px; }

.admin-header { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
.admin-header h1 { font-family: KaiTi, serif; font-size: 22px; letter-spacing: 2px; }
.refresh-btn { padding: 8px 20px; background: #8b3a2a; color: #fff; border: none; cursor: pointer; font-family: KaiTi, serif; letter-spacing: 2px; }

.stats-row { display: flex; justify-content: space-between; font-size: 14px; color: #6b5040; margin-bottom: 12px; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: rgba(253,250,244,0.92); border: 1px solid #d0c0a8; font-size: 13px; }
th { background: #2c1810; color: #fdf8f0; padding: 10px 8px; text-align: left; font-weight: 400; white-space: nowrap; }
td { padding: 8px; border-bottom: 1px solid #d0c0a8; vertical-align: top; line-height: 1.5; }
tr:hover { background: rgba(139,58,42,0.04); }
.char-cell { font-family: KaiTi, serif; font-size: 20px; text-align: center; font-weight: 700; }
.time-cell { white-space: nowrap; font-size: 12px; color: #6b5040; }
.q-cell { max-width: 180px; word-break: break-all; }
.pattern-cell { font-size: 12px; max-width: 200px; }
.ip-cell { font-size: 11px; color: #999; white-space: nowrap; }
.loading-cell { text-align: center; padding: 40px; color: #999; }

.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pager button { padding: 8px 24px; background: #8b3a2a; color: #fff; border: none; cursor: pointer; font-family: KaiTi, serif; }
.pager button:disabled { opacity: 0.4; cursor: default; }
</style>
