<template>
  <div class="page-container camera-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      left-text="←"
      @click-left="$router.push('/')"
      fixed
      placeholder
    >
      <template #right>
        <span class="remaining-badge" @click="showKeyDialog = true">剩余 {{ unlimited ? '∞' : remainingCount }} 次</span>
      </template>
    </van-nav-bar>

    <div class="content-container" v-if="!isAnalyzing">
      <!-- 汉字输入 -->
      <div class="char-input-area">
        <p class="input-label">书一字以观心</p>
        <input
          ref="charInputRef"
          v-model="typedChar"
          type="text"
          class="char-input-underline"
          maxlength="1"
          placeholder="在此写一个汉字"
          @input="onCharInput"
        />
        <div class="char-status">
          <span v-if="charError" class="status-error">{{ charError }}</span>
          <span v-else-if="typedChar && !charError" class="status-valid">善</span>
        </div>
      </div>

      <!-- 问题输入 -->
      <div class="question-section">
        <p class="section-label">所问何事<span class="label-opt">（选填）</span></p>
        <van-field
          v-model="question"
          type="textarea"
          rows="2"
          autosize
          maxlength="200"
          show-word-limit
          placeholder="写下你想问的事…"
          class="question-input"
        />
      </div>

      <!-- 提交 -->
      <div class="submit-section">
        <button
          class="btn-primary"
          style="width:100%"
          :disabled="!typedChar || !!charError"
          @click="handleAnalyze"
        >
          开始测字
        </button>
      </div>
    </div>

    <!-- 加载态 -->
    <div class="content-container loading-container" v-else>
      <div class="loading-char">{{ typedChar || '…' }}</div>
      <div class="spinner"></div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- 密钥弹窗 -->
    <van-dialog
      v-model:show="showKeyDialog"
      title="输入每日密钥"
      show-cancel-button
      @confirm="handleKeySubmit"
    >
      <div style="padding:16px;">
        <p style="font-size:14px;color:var(--color-ink-600);margin-bottom:12px;line-height:1.6;">
          每日免费 2 次，输入密钥后可提至 10 次/天
        </p>
        <p style="font-size:13px;color:var(--color-warm-dark);margin-bottom:12px;text-align:center;background:#f2ece4;padding:8px;border-radius:6px;">
          添加微信 <b>kzeays</b> 获取密钥
        </p>
        <van-field v-model="keyInput" placeholder="输入密钥" maxlength="15" />
        <p v-if="keyError" style="color:var(--color-danger);font-size:12px;margin-top:8px;">{{ keyError }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharStore } from '@/stores/charStore';
import { showError, showSuccess } from '@/utils/errorHandler';
import { canAsk, recordUsage, remainingCount, unlimited, refreshCount, validateAndSetKey } from '@/utils/usageLimit';

const router = useRouter();
const charStore = useCharStore();

const typedChar = ref(charStore.currentChar || '');
const charError = ref('');
const question = ref(charStore.currentQuestion || '');
const isAnalyzing = ref(false);
const showKeyDialog = ref(false);
const keyInput = ref('');
const keyError = ref('');

// 加载文案轮播
const loadingTexts = [
  '正在翻阅《说文解字》…',
  '正在推演字理…',
  '正在观象取格…',
  '正在参悟玄机…',
];
const loadingText = ref(loadingTexts[0]);
let loadingTimer = null;

onMounted(() => refreshCount());

onUnmounted(() => {
  if (loadingTimer) clearInterval(loadingTimer);
});

function onCharInput(e) {
  const val = e.target.value;
  const chineseOnly = val.replace(/[^一-鿿]/g, '');
  if (chineseOnly !== val) typedChar.value = chineseOnly;
  if (!typedChar.value) {
    charError.value = '';
  } else if (!/^[一-鿿]$/.test(typedChar.value)) {
    charError.value = '请输入一个有效的汉字';
  } else {
    charError.value = '';
  }
}

async function handleAnalyze() {
  if (!typedChar.value) {
    showError('请输入一个汉字');
    return;
  }
  if (!/^[一-鿿]$/.test(typedChar.value)) {
    showError('请输入一个有效的汉字');
    return;
  }
  if (!canAsk()) {
    showKeyDialog.value = true;
    return;
  }

  charStore.setCharacter(typedChar.value);
  charStore.setQuestion(question.value.trim());
  charStore.setMode('text');

  // 开始加载动画
  isAnalyzing.value = true;
  let idx = 0;
  loadingText.value = loadingTexts[0];
  loadingTimer = setInterval(() => {
    idx = (idx + 1) % loadingTexts.length;
    loadingText.value = loadingTexts[idx];
  }, 2000);

  const result = await charStore.analyze();

  if (loadingTimer) clearInterval(loadingTimer);
  isAnalyzing.value = false;

  if (result) {
    recordUsage();
    refreshCount();
    router.push('/result');
  } else {
    showError(charStore.error || '分析失败，请稍后再试');
  }
}

async function handleKeySubmit() {
  if (!keyInput.value.trim()) {
    keyError.value = '请输入密钥';
    return;
  }
  const result = await validateAndSetKey(keyInput.value);
  if (result.success) {
    keyInput.value = '';
    keyError.value = '';
    showKeyDialog.value = false;
    refreshCount();
    if (result.unlimited) {
      showSuccess('密钥验证成功！已解锁无限次数');
    } else {
      showSuccess('密钥验证成功！今日可提问 ' + remainingCount.value + ' 次');
    }
  } else {
    keyError.value = result.message;
  }
}
</script>

<style scoped>
.camera-page {
  /* transparent — app-container bg shows through */
}

/* 剩余次数 */
.remaining-badge {
  font-size: var(--text-xs);
  color: var(--color-ink-500);
  cursor: pointer;
  letter-spacing: 0.03em;
}

/* 汉字输入 */
.char-input-area {
  margin-top: var(--space-16);
  text-align: center;
}

.input-label {
  font-size: var(--text-sm);
  color: var(--color-ink-400);
  letter-spacing: 0.08em;
  margin-bottom: var(--space-8);
}

.char-input-underline {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: block;
  height: 140px;
  font-size: 72px;
  font-family: var(--font-kai);
  text-align: center;
  color: var(--color-ink-900);
  border-bottom: 1.5px solid var(--color-ink-200);
  transition: border-color var(--transition-normal);
  background: transparent;
  padding: 0;
  letter-spacing: 0.06em;
}

.char-input-underline:focus {
  border-bottom-color: var(--color-gold);
}

.char-input-underline::placeholder {
  font-size: var(--text-base);
  font-family: var(--font-sans);
  color: var(--color-ink-400);
  letter-spacing: 0.04em;
}

.char-status {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  min-height: 21px;
}

.status-error {
  color: var(--color-danger);
}

.status-valid {
  color: var(--color-accent);
  font-family: var(--font-kai);
}

/* 问题 */
.question-section {
  margin-top: var(--space-10);
}

.section-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink-800);
  margin-bottom: var(--space-2);
  letter-spacing: 0.05em;
}

.label-opt {
  font-weight: 400;
  color: var(--color-ink-400);
  font-size: var(--text-xs);
  letter-spacing: 0.03em;
}

.question-input {
  border-bottom: 1px solid var(--color-ink-150) !important;
}

/* 提交 */
.submit-section {
  margin-top: var(--space-10);
}

/* 加载态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  gap: var(--space-6);
}

.loading-char {
  font-family: var(--font-kai);
  font-size: 72px;
  color: var(--color-ink-900);
  animation: breatheIn 0.6s var(--ease-out);
}

.loading-text {
  font-size: var(--text-base);
  color: var(--color-ink-500);
  letter-spacing: 0.04em;
  animation: fadeInUp 0.4s var(--ease-out);
}

@keyframes breatheIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
