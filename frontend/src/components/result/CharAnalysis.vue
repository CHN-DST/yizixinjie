<template>
  <div class="char-analysis">
    <!-- 汉字展示 -->
    <div class="char-main">
      <div class="char-big">{{ character }}</div>
      <div class="char-info" v-if="pronunciation">
        <span class="pinyin">{{ pronunciation }}</span>
        <span class="separator" v-if="radical">|</span>
        <span v-if="radical">部首: {{ radical }}</span>
        <span class="separator" v-if="strokeCount">|</span>
        <span v-if="strokeCount">{{ strokeCount }}画</span>
      </div>
    </div>

    <!-- 分析内容 -->
    <div class="analysis-sections">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  character: { type: String, default: '' },
  pronunciation: { type: String, default: '' },
  radical: { type: String, default: '' },
  strokeCount: { type: Number, default: 0 },
});
</script>

<style scoped>
.char-analysis {
  width: 100%;
}

.char-main {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.char-big {
  font-size: 80px;
  font-weight: 700;
  color: var(--text-title);
  font-family: 'KaiTi', 'STKaiti', serif;
  line-height: 1.1;
}

.char-info {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
}

.separator {
  color: var(--text-light);
  margin: 0 4px;
}

.analysis-sections {
  margin-top: var(--spacing-md);
}
</style>
