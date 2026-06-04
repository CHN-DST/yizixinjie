<template>
  <div class="page-container camera-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="一字心解"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <span class="remaining-badge" @click="showKeyDialog = true">剩余：{{ remainingCount }}次</span>
        <van-icon name="home-o" size="20" @click="$router.push('/')" style="margin-left: 12px; margin-right: 12px;" />
        <van-icon name="clock-o" size="20" @click="$router.push('/history')" />
      </template>
    </van-nav-bar>

    <div class="content-container">
      <!-- 汉字输入区 -->
      <div class="char-input-area">
        <input
          ref="charInputRef"
          v-model="typedChar"
          type="text"
          class="char-input"
          maxlength="1"
          placeholder="在此写一个汉字"
          @input="onCharInput"
        />
        <div v-if="charError" class="char-error">
          <van-icon name="warning-o" />
          {{ charError }}
        </div>
        <div v-else-if="typedChar && !charError" class="char-valid">
          <van-icon name="success" color="#52c41a" />
          有效的汉字
        </div>
      </div>

      <div class="char-tips">
        <van-icon name="info-o" />
        <span>输入一个你想了解的汉字，如：心、爱、道、家……</span>
      </div>

      <!-- 用户问题区 -->
      <div class="question-section">
        <div class="section-label">💬 你想问什么？（选填）</div>
        <van-field
          v-model="question"
          type="textarea"
          rows="3"
          autosize
          maxlength="200"
          show-word-limit
          placeholder="例如：我什么时候才能找到一份好工作？&#10;或者留空，让 AI 自由解读……"
          class="question-field"
        />
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button
          type="primary"
          size="large"
          round
          block
          :loading="isAnalyzing"
          loading-text="AI正在分析..."
          :disabled="!typedChar || !!charError"
          @click="handleAnalyze"
        >
          开始分析
        </van-button>
      </div>
    </div>

    <!-- 密钥输入弹窗 -->
    <van-dialog
      v-model:show="showKeyDialog"
      title="输入每日密钥"
      show-cancel-button
      @confirm="handleKeySubmit"
    >
      <div style="padding: 16px;">
        <p style="font-size:13px;color:#999;margin-bottom:8px;">
          每天免费 2 次，输入密钥后可提至 10 次/天。密钥每日更新。
        </p>
        <p style="font-size:13px;color:#e8a87c;margin-bottom:12px;text-align:center;background:#fff9f0;padding:8px;border-radius:8px;">
          🔑 添加微信：<b>kzeays</b> 可获取密钥，增加使用次数。
        </p>
        <van-field v-model="keyInput" placeholder="输入密钥，如 YZXJ-XXXXXXXX" maxlength="15" />
        <p v-if="keyError" style="color:#f5222d;font-size:12px;margin-top:8px;">{{ keyError }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCharStore } from '@/stores/charStore';
import { showError } from '@/utils/errorHandler';
import { canAsk, recordUsage, remainingCount, refreshCount, validateAndSetKey, hasValidKey } from '@/utils/usageLimit';

const router = useRouter();
const charStore = useCharStore();

const typedChar = ref('');
const charError = ref('');
const question = ref('');
const isAnalyzing = ref(false);
const showKeyDialog = ref(false);
const keyInput = ref('');
const keyError = ref('');

onMounted(() => refreshCount());

// 输入过滤：只保留汉字
function onCharInput(e) {
  const val = e.target.value;
  const chineseOnly = val.replace(/[^一-鿿]/g, '');
  if (chineseOnly !== val) {
    typedChar.value = chineseOnly;
  }
  if (!typedChar.value) {
    charError.value = '';
  } else if (!/^[一-鿿]$/.test(typedChar.value)) {
    charError.value = '请输入一个有效的汉字';
  } else {
    charError.value = '';
  }
}

// 提交分析
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

  isAnalyzing.value = true;
  const result = await charStore.analyze();
  isAnalyzing.value = false;

  if (result) {
    recordUsage();
    refreshCount();
    router.push('/result');
  } else {
    showError(charStore.error || '分析失败，请稍后再试');
  }
}

// 密钥提交
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
    showError('密钥验证成功！今日可提问 ' + remainingCount.value + ' 次');
  } else {
    keyError.value = result.message;
  }
}
</script>

<style scoped>
.camera-page {
  background: var(--bg-primary);
}

/* 剩余次数 */
.remaining-badge {
  font-size: 12px;
  color: var(--color-primary);
  background: rgba(74, 144, 217, 0.1);
  padding: 3px 8px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
}

/* 汉字输入区 */
.char-input-area {
  margin-top: var(--spacing-lg);
}

.char-input {
  width: 100%;
  height: 150px;
  font-size: 80px;
  font-weight: 400;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  text-align: center;
  border: 2px solid var(--border-color-dark);
  border-radius: 0;
  background: rgba(253, 250, 242, 0.85);
  color: var(--text-title);
  outline: none;
  caret-color: #c41e3a;
  transition: all 0.3s;
  box-shadow: inset 0 2px 8px rgba(44, 24, 16, 0.06);
  letter-spacing: 4px;
}

.char-input:focus {
  border-color: #8b4513;
  border-width: 3px;
  box-shadow: inset 0 2px 12px rgba(139, 69, 19, 0.1), 0 0 0 4px rgba(139, 69, 19, 0.08);
}

.char-input::placeholder {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  font-family: var(--font-family);
}

.char-error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-valid {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-tips {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f0f7ff;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 问题区 */
.question-section {
  margin-top: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: var(--spacing-xs);
}

.question-field {
  border-radius: var(--border-radius);
  background: var(--bg-card);
}

/* 提交区 */
.submit-section {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}
</style>
