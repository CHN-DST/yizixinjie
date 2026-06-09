<template>
  <div class="page-container result-page">
    <!-- 导航 -->
    <van-nav-bar
      left-text="←"
      @click-left="$router.push('/camera')"
      fixed
      placeholder
    >
      <template #right>
        <span class="nav-action" @click="$router.push('/history')">历史</span>
      </template>
    </van-nav-bar>

    <div v-if="charStore.currentResult" class="content-container">
      <!-- 汉字 -->
      <header class="char-header anim-1">
        <div class="char-display">{{ charStore.currentResult.character }}</div>
        <div class="char-meta" v-if="charStore.currentResult.pronunciation || charStore.currentResult.radical || charStore.currentResult.strokeCount">
          <span v-if="charStore.currentResult.pronunciation" class="pinyin">{{ charStore.currentResult.pronunciation }}</span>
          <span v-if="charStore.currentResult.radical">部首 {{ charStore.currentResult.radical }}</span>
          <span v-if="charStore.currentResult.strokeCount">{{ charStore.currentResult.strokeCount }} 画</span>
        </div>
        <div class="char-tags" v-if="charStore.currentResult.wuxing || charStore.currentResult.liushen">
          <van-tag v-if="charStore.currentResult.wuxing" type="primary" size="medium">五行属{{ charStore.currentResult.wuxing }}</van-tag>
          <van-tag v-if="charStore.currentResult.liushen" type="warning" size="medium">{{ charStore.currentResult.liushen }}</van-tag>
        </div>
      </header>

      <!-- 取格判词 -->
      <section class="anim-2" v-if="charStore.currentResult.divination?.pattern">
        <div class="verdict-card">
          <p class="verdict-label">取格</p>
          <p class="verdict-pattern">「{{ charStore.currentResult.divination.pattern }}」</p>
          <p class="verdict-analysis" v-if="charStore.currentResult.divination.wuxingAnalysis">
            {{ charStore.currentResult.divination.wuxingAnalysis }}
          </p>
          <p class="verdict-auspiciousness" v-if="charStore.currentResult.divination.auspiciousness">
            {{ charStore.currentResult.divination.auspiciousness }}
          </p>
        </div>
      </section>

      <!-- 建议 -->
      <section class="anim-3" v-if="charStore.currentResult.divination?.advice?.length">
        <div class="advice-section">
          <p class="section-title">测字真人的建议</p>
          <div class="advice-list">
            <div class="advice-item" v-for="(item, index) in charStore.currentResult.divination.advice" :key="index">
              <span class="advice-num">{{ index + 1 }}</span>
              <span class="advice-text">{{ item }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 字源追溯（折叠面板） -->
      <section class="anim-4" v-if="hasEtymology">
        <details class="fold-panel">
          <summary class="fold-summary">
            <span>字源追溯</span>
            <span class="fold-icon">▾</span>
          </summary>
          <div class="fold-body">
            <div class="info-row" v-if="charStore.currentResult.etymology.origin">
              <span class="info-label">起源</span>
              <span class="info-value">{{ charStore.currentResult.etymology.origin }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.etymology.formation">
              <span class="info-label">造字法</span>
              <van-tag type="primary" size="medium">{{ charStore.currentResult.etymology.formation }}</van-tag>
            </div>
            <div class="info-row" v-if="charStore.currentResult.etymology.ancientForms">
              <span class="info-label">古文字形</span>
              <span class="info-value">{{ charStore.currentResult.etymology.ancientForms }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.etymology.originalMeaning">
              <span class="info-label">本义</span>
              <span class="info-value">{{ charStore.currentResult.etymology.originalMeaning }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.etymology.evolution">
              <span class="info-label">演变</span>
              <span class="info-value">{{ charStore.currentResult.etymology.evolution }}</span>
            </div>
          </div>
        </details>
      </section>

      <!-- 文化象征（折叠面板） -->
      <section class="anim-4" v-if="hasCulture">
        <details class="fold-panel">
          <summary class="fold-summary">
            <span>文化象征</span>
            <span class="fold-icon">▾</span>
          </summary>
          <div class="fold-body">
            <div class="info-row" v-if="charStore.currentResult.culture.symbolism">
              <span class="info-label">文化象征</span>
              <span class="info-value">{{ charStore.currentResult.culture.symbolism }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.culture.classicalUsage">
              <span class="info-label">经典引用</span>
              <span class="info-value classic">{{ charStore.currentResult.culture.classicalUsage }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.culture.folkConnection">
              <span class="info-label">民俗关联</span>
              <span class="info-value">{{ charStore.currentResult.culture.folkConnection }}</span>
            </div>
          </div>
        </details>
      </section>

      <!-- 测字拆解（折叠面板） -->
      <section class="anim-4" v-if="hasDeconstruction">
        <details class="fold-panel">
          <summary class="fold-summary">
            <span>测字拆解</span>
            <span class="fold-icon">▾</span>
          </summary>
          <div class="fold-body">
            <div class="info-row" v-if="charStore.currentResult.characterDeconstruction.components">
              <span class="info-label">部件拆解</span>
              <span class="info-value">{{ charStore.currentResult.characterDeconstruction.components }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.characterDeconstruction.addStroke">
              <span class="info-label">添笔之变</span>
              <span class="info-value">{{ charStore.currentResult.characterDeconstruction.addStroke }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.characterDeconstruction.removeStroke">
              <span class="info-label">减笔之示</span>
              <span class="info-value">{{ charStore.currentResult.characterDeconstruction.removeStroke }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.characterDeconstruction.headAndTail">
              <span class="info-label">对关取象</span>
              <span class="info-value">{{ charStore.currentResult.characterDeconstruction.headAndTail }}</span>
            </div>
            <div class="info-row" v-if="charStore.currentResult.characterDeconstruction.recombine">
              <span class="info-label">破解重组</span>
              <span class="info-value">{{ charStore.currentResult.characterDeconstruction.recombine }}</span>
            </div>
          </div>
        </details>
      </section>

      <!-- 赠言 -->
      <section class="gift-section anim-5">
        <div class="gift-quote">
          <span class="gift-mark">「</span>
          <p class="gift-text">{{ giftText }}</p>
          <span class="gift-mark right">」</span>
        </div>
        <button class="btn-text" @click="shareResult">分享这张卡片</button>
      </section>

      <!-- 底部操作 -->
      <div class="result-actions anim-5">
        <button class="btn-primary" style="width:100%" @click="$router.push('/camera')">
          再测一字
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <div class="content-container" style="text-align:center;padding-top:120px;">
        <p style="font-size:48px;font-family:var(--font-kai);margin-bottom:16px;">字</p>
        <p style="color:var(--color-ink-400);margin-bottom:24px;">暂无测字结果</p>
        <button class="btn-primary" @click="$router.push('/camera')">去测字</button>
      </div>
    </div>

    <!-- 分享海报（隐藏画布） -->
    <SharePoster ref="posterRef" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useCharStore } from '@/stores/charStore';
import SharePoster from '@/components/common/SharePoster.vue';

const charStore = useCharStore();
const posterRef = ref(null);

const hasEtymology = computed(() => {
  const e = charStore.currentResult?.etymology;
  return e && (e.origin || e.formation || e.ancientForms || e.originalMeaning || e.evolution);
});

const hasCulture = computed(() => {
  const c = charStore.currentResult?.culture;
  return c && (c.symbolism || c.classicalUsage || c.folkConnection);
});

const hasDeconstruction = computed(() => {
  const d = charStore.currentResult?.characterDeconstruction;
  return d && (d.components || d.addStroke || d.removeStroke || d.headAndTail || d.recombine);
});

// 生成一句赠言
const giftText = computed(() => {
  const advices = charStore.currentResult?.divination?.advice;
  if (advices && advices.length > 0) {
    return advices[advices.length - 1];
  }
  const insights = charStore.currentResult?.psychology?.writerInsight;
  if (insights) {
    const sentences = insights.split(/[。！？]/).filter(s => s.trim());
    return sentences.length > 0 ? sentences[0].trim() : '一字见心';
  }
  return '一字见心';
});

function shareResult() {
  if (posterRef.value) {
    posterRef.value.show(charStore.currentResult, charStore.currentQuestion);
  }
}
</script>

<style scoped>
.result-page {
  background: var(--color-ink-50);
  padding-bottom: var(--space-16);
}

.nav-action {
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  cursor: pointer;
  letter-spacing: 0.03em;
}

/* ============================================================
   汉字头部
   ============================================================ */
.char-header {
  text-align: center;
  padding: var(--space-10) 0 var(--space-6);
}

.char-display {
  font-family: var(--font-kai);
  font-size: 80px;
  color: var(--color-ink-900);
  line-height: 1.1;
}

.char-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-ink-500);
}

.pinyin {
  font-style: italic;
  color: var(--color-accent);
}

.char-tags {
  margin-top: var(--space-3);
  display: flex;
  justify-content: center;
  gap: var(--space-2);
}

/* ============================================================
   取格判词
   ============================================================ */
.verdict-card {
  background: #fff;
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-xs);
}

.verdict-label {
  font-size: var(--text-xs);
  color: var(--color-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.verdict-pattern {
  font-family: var(--font-kai);
  font-size: var(--text-xl);
  color: var(--color-ink-900);
  line-height: 1.6;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-3);
}

.verdict-analysis,
.verdict-auspiciousness {
  font-size: var(--text-base);
  color: var(--color-ink-600);
  line-height: 1.8;
}

/* ============================================================
   建议
   ============================================================ */
.advice-section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink-800);
  letter-spacing: 0.04em;
  margin-bottom: var(--space-4);
  padding-left: var(--space-1);
}

.advice-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-ink-150);
  align-items: flex-start;
}

.advice-item:last-child {
  border-bottom: none;
}

.advice-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--color-ink-100);
  color: var(--color-ink-600);
  font-size: var(--text-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.advice-text {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-ink-800);
  line-height: 1.8;
}

/* ============================================================
   折叠面板
   ============================================================ */
.fold-panel {
  margin-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-ink-150);
}

.fold-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-ink-800);
  cursor: pointer;
  letter-spacing: 0.03em;
  list-style: none;
  user-select: none;
}

.fold-summary::-webkit-details-marker {
  display: none;
}

.fold-icon {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  transition: transform var(--transition-normal);
}

.fold-panel[open] .fold-icon {
  transform: rotate(180deg);
}

.fold-body {
  padding: 0 0 var(--space-5);
}

.info-row {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

.info-label {
  flex-shrink: 0;
  min-width: 64px;
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  letter-spacing: 0.03em;
}

.info-value {
  font-size: var(--text-base);
  color: var(--color-ink-800);
  line-height: 1.8;
}

.classic {
  font-style: italic;
  color: var(--color-accent);
}

/* ============================================================
   赠言
   ============================================================ */
.gift-section {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.gift-quote {
  position: relative;
  display: inline-block;
  max-width: 360px;
}

.gift-text {
  font-family: var(--font-kai);
  font-size: var(--text-lg);
  color: var(--color-ink-800);
  line-height: 1.8;
  letter-spacing: 0.04em;
}

.gift-mark {
  font-family: var(--font-serif);
  font-size: 32px;
  color: var(--color-ink-200);
  position: absolute;
  top: -12px;
  left: -24px;
}

.gift-mark.right {
  left: auto;
  right: -24px;
  top: auto;
  bottom: -24px;
}

/* ============================================================
   底部操作
   ============================================================ */
.result-actions {
  margin-top: var(--space-8);
}

/* ============================================================
   空状态
   ============================================================ */
.empty-container {
  min-height: 100vh;
}

/* ============================================================
   入场动画
   ============================================================ */
.anim-1 { animation: revealChar 0.5s var(--ease-out) both; }
.anim-2 { animation: fadeInUp 0.5s var(--ease-out) 0.2s both; }
.anim-3 { animation: fadeInUp 0.5s var(--ease-out) 0.4s both; }
.anim-4 { animation: fadeInUp 0.5s var(--ease-out) 0.55s both; }
.anim-5 { animation: fadeInUp 0.5s var(--ease-out) 0.7s both; }

@keyframes revealChar {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
