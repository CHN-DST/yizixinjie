<template>
  <div class="analysis-card" :class="{ 'highlight': highlighted }">
    <div class="card-header">
      <span class="card-icon">{{ icon }}</span>
      <span class="card-heading">{{ title }}</span>
      <van-tag v-if="tag" type="primary" size="small">{{ tag }}</van-tag>
    </div>
    <div class="card-content">
      <div v-for="item in items" :key="item.label" class="info-item">
        <div class="info-label">{{ item.label }}</div>
        <div class="info-text">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📋' },
  title: { type: String, default: '' },
  tag: { type: String, default: '' },
  highlighted: { type: Boolean, default: false },
  items: {
    type: Array,
    default: () => [],
    // each item: { label: string, value: string }
  },
});
</script>

<style scoped>
.analysis-card {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.analysis-card.highlight {
  border-left: 3px solid var(--color-accent);
  background: linear-gradient(135deg, #fffdf5, #fff9f0);
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
  font-size: 18px;
}

.card-heading {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-title);
  flex: 1;
}

.info-item {
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-weight: 500;
}

.info-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.7;
}
</style>
