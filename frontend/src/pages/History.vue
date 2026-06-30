<template>
  <div class="page-container history-page">
    <van-nav-bar
      left-text="←"
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <span v-if="charStore.historyCount > 0" class="clear-btn" @click="handleClear">清空</span>
      </template>
    </van-nav-bar>

    <div class="content-container">
      <template v-if="charStore.historyCount > 0">
        <p class="history-count-text">{{ charStore.historyCount }} 条记录</p>
        <div
          v-for="record in charStore.history"
          :key="record.id"
          class="history-item"
          @click="viewDetail(record)"
        >
          <span class="history-char">{{ record.character }}</span>
          <div class="history-info">
            <span class="history-preview" v-if="record.psychology?.writerInsight">
              {{ truncate(record.psychology.writerInsight, 35) }}
            </span>
            <span class="history-preview" v-else>点击查看完整解析</span>
          </div>
          <span class="history-time">{{ formatRelativeTime(record.timestamp) }}</span>
        </div>
      </template>

      <div v-else class="empty-state">
        <p class="empty-char">字</p>
        <p class="empty-desc">暂无历史记录</p>
        <button class="btn-text" @click="$router.push('/camera')">去测字 →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCharStore } from '@/stores/charStore';
import { formatRelativeTime } from '@/utils/formatters';
import { showConfirm } from '@/utils/errorHandler';

const router = useRouter();
const charStore = useCharStore();

function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return text.substring(0, max) + '...';
}

function viewDetail(record) {
  charStore.currentResult = {
    character: record.character,
    pronunciation: record.pronunciation,
    radical: record.radical,
    strokeCount: record.strokeCount,
    etymology: record.etymology,
    culture: record.culture,
    psychology: record.psychology,
    divination: record.divination,
    characterDeconstruction: record.characterDeconstruction,
    timestamp: record.timestamp,
  };
  router.push('/result');
}

async function handleClear() {
  const confirmed = await showConfirm('确定要清空所有历史记录吗？');
  if (confirmed) charStore.clearHistory();
}
</script>

<style scoped>
.history-page {
  /* transparent — app-container bg shows through */
}

.history-count-text {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  letter-spacing: 0.05em;
  margin: var(--space-6) 0 var(--space-4);
}

.clear-btn {
  font-size: var(--text-xs);
  color: var(--color-danger);
  cursor: pointer;
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: #fff;
  border: 1px solid var(--color-ink-150);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.history-item:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}

.history-char {
  font-family: var(--font-kai);
  font-size: 28px;
  color: var(--color-ink-900);
  flex-shrink: 0;
  width: 44px;
  text-align: center;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-preview {
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  line-height: 1.5;
}

.history-time {
  font-size: var(--text-2xs);
  color: var(--color-ink-400);
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding-top: 100px;
}

.empty-char {
  font-family: var(--font-kai);
  font-size: 48px;
  color: var(--color-ink-300);
  margin-bottom: var(--space-3);
}

.empty-desc {
  font-size: var(--text-base);
  color: var(--color-ink-400);
  margin-bottom: var(--space-4);
}
</style>
