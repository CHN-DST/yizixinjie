<template>
  <div class="page-container home-page">
    <!-- Hero -->
    <section class="hero">
      <h1 class="hero-title anim-1">一字心解 · 一字见心</h1>
      <p class="hero-sub anim-2">输入一个字，看见真实的自己</p>
    </section>

    <!-- 核心输入区 -->
    <section class="content-container">
      <div class="input-area anim-3">
        <input
          v-model="charInput"
          type="text"
          class="home-char-input"
          maxlength="1"
          placeholder="写一个字"
          @input="onCharInput"
          @keyup.enter="goAnalyze"
        />
        <div class="input-underline-bar" :class="{ active: charInput }"></div>
        <p class="input-hint" v-if="!charInput">如：心、静、等、缘、悟</p>
        <p class="input-hint valid" v-else-if="isValidChar">可测之字</p>
        <p class="input-hint error" v-else>请输入一个有效汉字</p>
      </div>

      <div class="home-actions anim-3">
        <button class="btn-primary home-btn" :disabled="!isValidChar" @click="goAnalyze">
          开始测字
        </button>
        <button class="btn-text" @click="$router.push('/history')">
          测字历史 →
        </button>
      </div>
    </section>

    <!-- 今日解字 -->
    <section class="content-container anim-4">
      <div class="daily-section">
        <p class="daily-label">今日解字</p>
        <div class="daily-card" @click="goDailyChar">
          <span class="daily-char">{{ dailyChar.char }}</span>
          <span class="daily-hint">{{ dailyChar.hint }}</span>
          <span class="daily-arrow">→</span>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="home-footer anim-5">
      <p class="footer-desc">东方哲学 × AI 测字</p>
      <button class="btn-text about-link" @click="$router.push('/about')">关于这个网站 →</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCharStore } from '@/stores/charStore';

const router = useRouter();
const charStore = useCharStore();

const charInput = ref('');

const isValidChar = computed(() => {
  return charInput.value && /^[一-鿿]$/.test(charInput.value);
});

// 今日解字 — 按日期轮换
const dailyChars = [
  { char: '静', hint: '静能生慧，今日宜静心' },
  { char: '等', hint: '等待是最好的答案' },
  { char: '缘', hint: '缘起缘灭，顺其自然' },
  { char: '悟', hint: '觉悟只在转念之间' },
  { char: '舍', hint: '有舍才有得' },
  { char: '安', hint: '心安即是归处' },
  { char: '信', hint: '信者，人言也，诚在其中' },
];

const dailyChar = computed(() => {
  return dailyChars[new Date().getDate() % dailyChars.length];
});

function onCharInput(e) {
  const val = e.target.value;
  const chineseOnly = val.replace(/[^一-鿿]/g, '');
  if (chineseOnly !== val) charInput.value = chineseOnly;
}

function goAnalyze() {
  if (!isValidChar.value) return;
  charStore.setCharacter(charInput.value);
  charStore.setQuestion('');
  charStore.setMode('text');
  router.push('/camera');
}

function goAnalyzeWithQuestion() {
  if (isValidChar.value) {
    charStore.setCharacter(charInput.value);
    charStore.setQuestion('');
    charStore.setMode('text');
  }
  router.push('/camera');
}

function goDailyChar() {
  charStore.setCharacter(dailyChar.value.char);
  charStore.setQuestion('');
  charStore.setMode('text');
  router.push('/camera');
}
</script>

<style scoped>
/* ============================================================
   Hero
   ============================================================ */
.hero {
  text-align: center;
  padding: var(--space-24) var(--space-4) var(--space-12);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-ink-900);
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.hero-sub {
  font-size: var(--text-base);
  color: var(--color-ink-500);
  margin-top: var(--space-4);
  letter-spacing: 0.04em;
}

/* ============================================================
   输入区
   ============================================================ */
.input-area {
  margin-bottom: var(--space-6);
  text-align: center;
}

.home-char-input {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  display: block;
  height: 64px;
  font-size: var(--text-3xl);
  font-family: var(--font-kai);
  text-align: center;
  color: var(--color-ink-900);
  border-bottom: 1.5px solid var(--color-ink-200);
  transition: border-color var(--transition-normal);
  background: transparent;
  padding: 8px 0;
  letter-spacing: 0.06em;
}

.home-char-input:focus {
  border-bottom-color: var(--color-accent);
}

.home-char-input::placeholder {
  font-size: var(--text-base);
  font-family: var(--font-sans);
  color: var(--color-ink-400);
  letter-spacing: 0.04em;
}

.input-underline-bar {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  height: 1.5px;
  background: var(--color-accent);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
  margin-top: -1.5px;
}

.input-underline-bar.active {
  transform: scaleX(1);
}

.input-hint {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-ink-400);
  letter-spacing: 0.03em;
}

.input-hint.valid {
  color: var(--color-accent);
}

.input-hint.error {
  color: var(--color-danger);
}

/* ============================================================
   操作按钮
   ============================================================ */
.home-actions {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-12);
}

.home-btn {
  min-width: 200px;
}

/* ============================================================
   今日解字
   ============================================================ */
.daily-section {
  margin-bottom: var(--space-16);
}

.daily-label {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
  padding-left: var(--space-1);
}

.daily-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  background: #fff;
  border: 1px solid var(--color-ink-150);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.daily-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
  border-color: var(--color-gold-border);
}

.daily-char {
  font-family: var(--font-kai);
  font-size: var(--text-2xl);
  color: var(--color-ink-900);
  flex-shrink: 0;
}

.daily-hint {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-ink-600);
  letter-spacing: 0.03em;
}

.daily-arrow {
  font-size: var(--text-lg);
  color: var(--color-ink-400);
  flex-shrink: 0;
}

/* ============================================================
   页脚
   ============================================================ */
.home-footer {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

.footer-brand {
  font-family: var(--font-serif);
  font-size: var(--text-sm);
  color: var(--color-ink-600);
  letter-spacing: 0.06em;
}

.footer-desc {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  margin-top: var(--space-1);
  letter-spacing: 0.04em;
}

.about-link {
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-ink-400);
}

/* ============================================================
   入场动画
   ============================================================ */
.anim-1 { animation: fadeInUp 0.6s var(--ease-out) both; }
.anim-2 { animation: fadeInUp 0.5s var(--ease-out) 0.2s both; }
.anim-3 { animation: fadeInUp 0.5s var(--ease-out) 0.4s both; }
.anim-4 { animation: fadeInUp 0.5s var(--ease-out) 0.7s both; }
.anim-5 { animation: fadeIn 0.4s var(--ease-out) 1s both; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (min-width: 640px) {
  .hero-title { font-size: 56px; }
}
</style>
