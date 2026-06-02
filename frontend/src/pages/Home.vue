<template>
  <div class="page-container home-page">
    <!-- 头部装饰 -->
    <div class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="app-title">一字心解</h1>
        <p class="app-subtitle">手写汉字，AI 解读你的内心</p>
        <div class="hero-char">心</div>
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
        round
        block
        class="start-btn"
        @click="$router.push('/camera')"
      >
        开始书写
      </van-button>

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
const features = [
  {
    icon: '📷',
    title: '拍照识别',
    desc: '手写汉字，拍照上传即可识别',
  },
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
  {
    icon: '🧠',
    title: '心理分析',
    desc: '从笔画结构洞察书写者心理',
  },
];
</script>

<style scoped>
.home-page {
  background: var(--bg-primary);
}

/* 英雄区 */
.hero-section {
  position: relative;
  height: 320px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg {
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 200%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 0 0 50% 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: var(--text-white);
}

.app-title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 8px;
  margin-bottom: var(--spacing-xs);
}

.app-subtitle {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  letter-spacing: 4px;
}

.hero-char {
  font-size: 80px;
  margin-top: var(--spacing-md);
  opacity: 0.15;
  font-family: 'KaiTi', 'STKaiti', serif;
}

/* 功能卡片 */
.features {
  margin-top: -30px;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.feature-card {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.feature-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.feature-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-title);
}

.feature-desc {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 开始按钮 */
.start-btn {
  margin-top: var(--spacing-xl);
  height: 50px;
  font-size: var(--font-size-lg);
  letter-spacing: 4px;
  background: linear-gradient(135deg, #4a90d9, #357abd);
  border: none;
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
