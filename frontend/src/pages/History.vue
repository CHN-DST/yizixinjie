<template>
  <div class="page-container history-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="历史记录"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <span v-if="charStore.historyCount > 0" class="clear-btn" @click="handleClear">
          清空
        </span>
      </template>
    </van-nav-bar>

    <div class="content-container">
      <!-- 有历史记录 -->
      <template v-if="charStore.historyCount > 0">
        <div
          v-for="record in charStore.history"
          :key="record.id"
          class="history-card"
          @click="viewDetail(record)"
        >
          <div class="history-char">{{ record.character }}</div>
          <div class="history-info">
            <div class="history-pinyin" v-if="record.pronunciation">
              {{ record.pronunciation }}
            </div>
            <div class="history-preview" v-if="record.psychology?.writerInsight">
              {{ truncate(record.psychology.writerInsight, 40) }}
            </div>
          </div>
          <div class="history-time">{{ formatRelativeTime(record.timestamp) }}</div>
        </div>

        <div class="history-count">
          共 {{ charStore.historyCount }} 条记录
        </div>
      </template>

      <!-- 空状态 -->
      <van-empty v-else description="暂无历史记录" />
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

// 截断文本
function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return text.substring(0, max) + '...';
}

// 查看详情
function viewDetail(record) {
  charStore.currentResult = {
    character: record.character,
    pronunciation: record.pronunciation,
    radical: record.radical,
    strokeCount: record.strokeCount,
    etymology: record.etymology,
    culture: record.culture,
    psychology: record.psychology,
    timestamp: record.timestamp,
  };
  router.push('/result');
}

// 清空历史
async function handleClear() {
  const confirmed = await showConfirm('确定要清空所有历史记录吗？');
  if (confirmed) {
    charStore.clearHistory();
  }
}
</script>

<style scoped>
.history-page {
  background: var(--bg-primary);
}

.clear-btn {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

/* 历史卡片 */
.history-card {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s;
}

.history-card:active {
  transform: scale(0.98);
}

.history-char {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-title);
  font-family: 'KaiTi', 'STKaiti', serif;
  min-width: 60px;
  text-align: center;
}

.history-info {
  flex: 1;
  padding: 0 var(--spacing-sm);
}

.history-pinyin {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-style: italic;
}

.history-preview {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.history-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
}

/* 计数 */
.history-count {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--text-light);
}
</style>
