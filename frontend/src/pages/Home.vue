<template>
  <div class="page-container home-page">
    <!-- 头部装饰 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="app-title">一字心解</h1>
        <p class="app-subtitle">手写汉字，AI 解读你的内心</p>
      </div>
    </div>

    <!-- 功能介绍 -->
    <div class="content-container">
      <div class="features">
        <div class="feature-card" v-for="item in features" :key="item.title">
          <div class="feature-icon">{{ item.icon }}</div>
          <div class="feature-info">
            <div class="feature-title">{{ item.title }}</div>
            <div class="feature-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <van-button
        type="primary"
        size="large"
        block
        class="start-btn"
        @click="$router.push('/camera')"
      >
        开始测字
      </van-button>

      <!-- 今日统计 -->
      <div class="stats-bar">
        <span>👀 访问人数 {{ todayStats.views }} 人</span>
        <span class="stats-divider">|</span>
        <span>🔮 一共测字 {{ todayStats.analyzes }} 次</span>
      </div>

      <!-- 底部导航 -->
      <div class="home-nav">
        <span @click="$router.push('/history')">历史记录</span>
        <span class="nav-divider">|</span>
        <span @click="$router.push('/about')">关于</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const todayStats = ref({ views: 0, analyzes: 0 });

onMounted(async () => {
  const url = 'https://1439501934-k13421vmpj.ap-guangzhou.tencentscf.com';

  // 1. 立即显示缓存的统计数据
  try {
    const cached = localStorage.getItem('yzxj_today_stats');
    if (cached) todayStats.value = JSON.parse(cached);
  } catch {}

  // 2. 首次访问：计数
  if (!sessionStorage.getItem('yzxj_pinged')) {
    sessionStorage.setItem('yzxj_pinged', '1');
    fetch(url + '/ping', { method: 'POST' }).catch(() => {});
  }

  // 3. 后台静默获取最新统计
  try {
    const resp = await fetch(url + '/stats');
    const data = await resp.json();
    if (data.success && data.data?.length) {
      todayStats.value = data.data[0];
      localStorage.setItem('yzxj_today_stats', JSON.stringify(data.data[0]));
    }
  } catch {}
});

const features = [
  {
    icon: '🔍',
    title: '字源解析',
    desc: '追溯汉字起源，解读甲骨文金文',
  },
  {
    icon: '🎭',
    title: '文化洞察',
    desc: '探索汉字背后的文化象征意义',
  },
];
</script>

<style scoped>
.home-page {
  background: var(--bg-primary);
}

/* 英雄区 */
.hero-section {
  padding: 60px 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
}

.app-title {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 10px;
  margin-bottom: var(--spacing-xs);
  color: #3a2f28;
  font-family: 'KaiTi', 'STKaiti', serif;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.app-subtitle {
  font-size: var(--font-size-sm);
  color: #8b7355;
  letter-spacing: 6px;
}

/* 功能卡片 */
.features {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.feature-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-md);
}

.feature-icon { font-size: 28px; flex-shrink: 0; }
.feature-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-title); }
.feature-desc { font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 2px; }

/* 开始按钮 — 印章风格 */
.start-btn {
  margin-top: var(--spacing-xl);
  height: 54px;
  font-size: var(--font-size-lg);
  letter-spacing: 8px;
  font-family: var(--font-kai);
  background: linear-gradient(180deg, #B5432E 0%, #8B2A1A 60%, #6B1A0E 100%) !important;
  border: 2px solid #5C1F14 !important;
  border-radius: var(--border-radius) !important;
  box-shadow: 0 4px 14px rgba(107, 26, 14, 0.4), inset 0 1px 0 rgba(255,255,255,0.12) !important;
  transition: all var(--transition-fast) !important;
  position: relative;
}

.start-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 6px rgba(107, 26, 14, 0.5) !important;
}

/* 统计条 */
.stats-bar {
  text-align: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: #f0f7ff;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}
.stats-divider {
  margin: 0 8px;
  color: #ccc;
}

/* 底部导航 */
.home-nav {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.home-nav span {
  cursor: pointer;
  padding: var(--spacing-xs);
}

.home-nav span:hover {
  color: var(--color-primary);
}

.nav-divider {
  margin: 0 var(--spacing-xs);
  cursor: default !important;
}
</style>
