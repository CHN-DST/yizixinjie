<template>
  <div class="page-container admin-page">
    <div class="content-container">
      <!-- 登录 -->
      <div v-if="!loggedIn" class="login-box card">
        <p class="login-char">字</p>
        <h1 class="login-title">一字心解</h1>
        <p class="login-sub">后台管理系统</p>
        <input
          v-model="password"
          type="password"
          class="login-input"
          placeholder="请输入管理密码"
          @keyup.enter="login"
        />
        <button class="btn-primary" style="width:100%;margin-top:16px;" @click="login">
          登录后台
        </button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>

      <!-- 数据面板 -->
      <div v-else>
        <div class="admin-header">
          <h1 class="admin-title">一字心解 · 后台管理</h1>
          <button class="btn-secondary" @click="loadRecords" style="padding:6px 16px;font-size:13px;">刷新</button>
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
                <td class="id-cell">{{ r.id }}</td>
                <td class="time-cell">{{ formatTime(r.created_at) }}</td>
                <td class="char-cell">{{ r.character }}</td>
                <td class="q-cell">{{ r.question || '-' }}</td>
                <td>{{ r.result?.wuxing || '-' }}</td>
                <td class="pattern-cell">{{ (r.result?.divination?.pattern || '-').substring(0, 50) }}</td>
                <td class="ip-cell">{{ r.ip }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager">
          <button class="btn-secondary" :disabled="page <= 1" @click="prevPage" style="padding:6px 20px;font-size:13px;">上一页</button>
          <span class="page-info">第 {{ page }} 页</span>
          <button class="btn-secondary" @click="nextPage" style="padding:6px 20px;font-size:13px;">下一页</button>
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

const PAGE_SIZE = 10;
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

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
    const resp = await fetch(`https://1439501934-k13421vmpj.ap-guangzhou.tencentscf.com/admin/records?page=${page.value}&limit=${PAGE_SIZE}`);
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
/* ============================================================
   页面背景 + 宽版容器
   ============================================================ */
.admin-page {
  /* transparent — app-container bg shows through */
  min-height: 100vh;
}

.admin-page .content-container {
  max-width: 1100px;
}

/* ============================================================
   登录框 — 与首页 Hero 风格一致
   ============================================================ */
.login-box {
  max-width: 360px;
  margin: 120px auto;
  text-align: center;
  padding: var(--space-10) var(--space-6);
}

.login-char {
  font-family: var(--font-kai);
  font-size: 56px;
  color: var(--color-ink-900);
  line-height: 1;
  margin-bottom: var(--space-4);
}

.login-title {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-ink-900);
  letter-spacing: 0.08em;
}

.login-sub {
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  margin: var(--space-2) 0 var(--space-8);
  letter-spacing: 0.06em;
}

.login-input {
  width: 100%;
  padding: var(--space-3) 0;
  font-size: var(--text-base);
  color: var(--color-ink-900);
  text-align: center;
  border-bottom: 1.5px solid var(--color-ink-200);
  background: transparent;
  transition: border-color var(--transition-normal);
  border-radius: 0;
}

.login-input:focus {
  border-bottom-color: var(--color-gold);
}

.login-input::placeholder {
  color: var(--color-ink-400);
}

.login-error {
  color: var(--color-danger);
  margin-top: var(--space-3);
  font-size: var(--text-sm);
}

/* ============================================================
   顶部栏
   ============================================================ */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--space-8) 0 var(--space-4);
}

.admin-title {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-ink-900);
  letter-spacing: 0.06em;
}

/* ============================================================
   统计
   ============================================================ */
.stats-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  margin-bottom: var(--space-4);
  letter-spacing: 0.03em;
}

/* ============================================================
   表格
   ============================================================ */
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-ink-150);
  box-shadow: var(--shadow-xs);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  font-size: var(--text-sm);
}

th {
  background: var(--color-ink-900);
  color: var(--color-ink-50);
  padding: 10px 10px;
  text-align: left;
  font-weight: 500;
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

td {
  padding: 10px;
  border-bottom: 1px solid var(--color-ink-150);
  vertical-align: top;
  line-height: 1.6;
  color: var(--color-ink-700);
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: var(--color-ink-75);
}

.char-cell {
  font-family: var(--font-kai);
  font-size: var(--text-lg);
  text-align: center;
  font-weight: 600;
  color: var(--color-ink-900);
}

.time-cell {
  white-space: nowrap;
  font-size: var(--text-xs);
  color: var(--color-ink-500);
}

.q-cell {
  max-width: 240px;
  word-break: break-all;
}

.pattern-cell {
  font-size: var(--text-sm);
  min-width: 280px;
  line-height: 1.7;
}

.ip-cell {
  font-size: var(--text-2xs);
  color: var(--color-ink-400);
  white-space: nowrap;
  font-family: monospace;
}

.id-cell {
  font-size: var(--text-2xs);
  color: var(--color-ink-400);
}

.loading-cell {
  text-align: center;
  padding: var(--space-10) !important;
  color: var(--color-ink-400);
}

/* ============================================================
   分页
   ============================================================ */
.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-bottom: var(--space-8);
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-ink-500);
}
</style>
