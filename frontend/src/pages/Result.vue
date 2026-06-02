<template>
  <div class="page-container result-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="测字结果"
      left-text="返回"
      left-arrow
      @click-left="$router.push('/camera')"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="home-o" size="20" @click="$router.push('/')" style="margin-right: 16px;" />
        <van-icon name="clock-o" size="20" @click="$router.push('/history')" />
      </template>
    </van-nav-bar>

    <div v-if="charStore.currentResult" class="content-container">
      <!-- 汉字头部 -->
      <div class="char-header">
        <div class="char-display">{{ charStore.currentResult.character }}</div>
        <div class="char-meta">
          <span class="pinyin" v-if="charStore.currentResult.pronunciation">
            {{ charStore.currentResult.pronunciation }}
          </span>
          <span v-if="charStore.currentResult.radical">
            部首: {{ charStore.currentResult.radical }}
          </span>
          <span v-if="charStore.currentResult.strokeCount">
            {{ charStore.currentResult.strokeCount }}画
          </span>
        </div>
        <div class="char-tags" v-if="charStore.currentResult.wuxing || charStore.currentResult.liushen">
          <van-tag v-if="charStore.currentResult.wuxing" type="warning" size="medium">
            五行属{{ charStore.currentResult.wuxing }}
          </van-tag>
          <van-tag v-if="charStore.currentResult.liushen" type="primary" size="medium">
            {{ charStore.currentResult.liushen }}
          </van-tag>
        </div>
      </div>

      <!-- 测字取格（一语定乾坤） -->
      <div class="card divination-card" v-if="charStore.currentResult.divination?.pattern">
        <div class="divination-pattern">「{{ charStore.currentResult.divination.pattern }}」</div>
        <div class="divination-wuxing" v-if="charStore.currentResult.divination.wuxingAnalysis">
          {{ charStore.currentResult.divination.wuxingAnalysis }}
        </div>
        <div class="divination-auspiciousness" v-if="charStore.currentResult.divination.auspiciousness">
          {{ charStore.currentResult.divination.auspiciousness }}
        </div>
      </div>

      <!-- 具体建议 -->
      <div class="card advice-card" v-if="charStore.currentResult.divination?.advice?.length">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <span class="card-title">测字真人的建议</span>
        </div>
        <div class="advice-list">
          <div
            class="advice-item"
            v-for="(item, index) in charStore.currentResult.divination.advice"
            :key="index"
          >
            <span class="advice-num">{{ index + 1 }}</span>
            <span class="advice-text">{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 测字拆解 -->
      <div class="card" v-if="charStore.currentResult.characterDeconstruction">
        <div class="card-header">
          <span class="card-icon">🔮</span>
          <span class="card-title">测字拆解</span>
        </div>
        <div class="card-body">
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
      </div>

      <!-- 字源学分析 -->
      <div class="card" v-if="hasEtymology">
        <div class="card-header">
          <span class="card-icon">📜</span>
          <span class="card-title">字源追溯</span>
        </div>
        <div class="card-body">
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
      </div>

      <!-- 文化学分析 -->
      <div class="card" v-if="hasCulture">
        <div class="card-header">
          <span class="card-icon">🏛</span>
          <span class="card-title">文化象征</span>
        </div>
        <div class="card-body">
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
      </div>

      <!-- 心理学分析 -->
      <div class="card psychology-card" v-if="hasPsychology">
        <div class="card-header">
          <span class="card-icon">🧠</span>
          <span class="card-title">书写者洞察</span>
        </div>
        <div class="card-body">
          <div class="psych-block" v-if="charStore.currentResult.psychology.visualImpression">
            <div class="psych-label">视觉印象</div>
            <div class="psych-text">{{ charStore.currentResult.psychology.visualImpression }}</div>
          </div>
          <div class="psych-block" v-if="charStore.currentResult.psychology.strokePsychology">
            <div class="psych-label">笔画心理</div>
            <div class="psych-text">{{ charStore.currentResult.psychology.strokePsychology }}</div>
          </div>
          <div class="psych-block highlight" v-if="charStore.currentResult.psychology.writerInsight">
            <div class="psych-label">💡 测字真人曰</div>
            <div class="psych-text">{{ charStore.currentResult.psychology.writerInsight }}</div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="result-actions">
        <van-button round block @click="$router.push('/camera')">再测一字</van-button>
        <van-button round block type="primary" class="mt-sm" @click="$router.push('/history')">
          查看历史记录
        </van-button>
      </div>
    </div>

    <!-- 无结果时的空状态 -->
    <div v-else class="content-container">
      <van-empty description="暂无测字结果" />
      <van-button type="primary" round block @click="$router.push('/camera')">去测字</van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCharStore } from '@/stores/charStore';

const charStore = useCharStore();

const hasEtymology = computed(() => {
  const e = charStore.currentResult?.etymology;
  return e && (e.origin || e.formation || e.ancientForms || e.originalMeaning || e.evolution);
});

const hasCulture = computed(() => {
  const c = charStore.currentResult?.culture;
  return c && (c.symbolism || c.classicalUsage || c.folkConnection);
});

const hasPsychology = computed(() => {
  const p = charStore.currentResult?.psychology;
  return p && (p.visualImpression || p.strokePsychology || p.writerInsight);
});
</script>

<style scoped>
.result-page {
  background: var(--bg-primary);
}

/* 汉字头部 */
.char-header {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.char-display {
  font-size: 80px;
  font-weight: 700;
  color: var(--text-title);
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.2;
}

.char-meta {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  align-items: center;
}

.char-tags {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: center;
  gap: var(--spacing-xs);
}

.pinyin {
  font-style: italic;
}

/* 测字取格 */
.divination-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #e8d5b7;
  border: 1px solid #3d2e1e;
  text-align: center;
}

.divination-pattern {
  font-size: var(--font-size-xl);
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
  color: #f0d78c;
}

.divination-wuxing {
  font-size: var(--font-size-sm);
  color: #c4a97d;
  line-height: 1.6;
  margin-bottom: var(--spacing-xs);
}

.divination-auspiciousness {
  font-size: var(--font-size-sm);
  color: #d4c4a8;
  line-height: 1.6;
}

/* 建议卡片 */
.advice-card {
  border-left: 3px solid var(--color-accent);
}

.advice-list {
  padding: 0;
}

.advice-item {
  display: flex;
  gap: var(--spacing-sm);
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  align-items: flex-start;
}

.advice-item:last-child {
  border-bottom: none;
}

.advice-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advice-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.7;
  flex: 1;
}

/* 分析卡片 */
.card {
  margin-bottom: var(--spacing-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-sm);
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-title);
}

/* 信息行 */
.info-row {
  display: flex;
  gap: var(--spacing-sm);
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
  min-width: 64px;
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.7;
}

.classic {
  font-style: italic;
  color: #8b4513;
}

/* 心理学区块 */
.psych-block {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px dashed var(--border-color);
}

.psych-block:last-child {
  border-bottom: none;
}

.psych-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.psych-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.8;
}

.psych-block.highlight {
  background: linear-gradient(135deg, #fff9f0, #fff3e0);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.psych-block.highlight .psych-label {
  color: var(--color-accent);
}

/* 空状态 */
.empty-section {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-light);
  font-size: var(--font-size-sm);
}

/* 底部操作 */
.result-actions {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
}
</style>
