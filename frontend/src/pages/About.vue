<template>
  <div class="page-container about-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="关于" left-text="返回" left-arrow @click-left="$router.back()" fixed placeholder />

    <div class="content-container">
      <!-- 应用信息 -->
      <div class="about-header">
        <div class="about-logo">心</div>
        <h2 class="about-title">一字心解</h2>
        <p class="about-version">v1.0.0</p>
      </div>

      <!-- 介绍 -->
      <div class="card">
        <div class="card-text">
          汉字是世界上最古老的文字之一，每一个汉字都承载着数千年的文化记忆。
          「一字心解」运用 AI 视觉识别技术，从字源学、文化学、心理学三个维度，
          为你解读每一个手写汉字的深层内涵。
        </div>
      </div>

      <!-- 分析维度 -->
      <div class="dimensions">
        <div class="dim-card">
          <div class="dim-icon">🔍</div>
          <div class="dim-title">字源学</div>
          <div class="dim-desc">
            追溯汉字的甲骨文、金文、小篆形态，了解造字本义和演变历程。
          </div>
        </div>
        <div class="dim-card">
          <div class="dim-icon">🎭</div>
          <div class="dim-title">文化学</div>
          <div class="dim-desc">
            探索汉字在中国传统文化中的象征意义和在经典文献中的运用。
          </div>
        </div>
        <div class="dim-card">
          <div class="dim-icon">🧠</div>
          <div class="dim-title">心理学</div>
          <div class="dim-desc">
            从笔画结构和书写方式中，洞察书写者的性格和心理状态。
          </div>
        </div>
      </div>

      <!-- 技术说明 -->
      <div class="card">
        <div class="card-title">技术说明</div>
        <div class="card-text">
          本应用使用 DeepSeek Vision API 进行汉字识别与多维度分析。
          前端基于 Vue3 + Vite + Vant，后端使用 Node.js + Express。
          您的图片仅用于当前分析，不会被长期存储。
        </div>
      </div>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <p>⚠️ 免责声明：心理分析仅供参考，不构成专业心理咨询建议。</p>
        <p>如有心理困扰，请寻求专业心理咨询师的帮助。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 纯展示页面，无需额外逻辑
</script>

<style scoped>
.about-page {
  background: var(--bg-primary);
}

/* 头部 */
.about-header {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.about-logo {
  font-size: 64px;
  font-family: 'KaiTi', 'STKaiti', serif;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.about-title {
  font-size: var(--font-size-xxl);
  color: var(--text-title);
  letter-spacing: 8px;
}

.about-version {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin-top: 4px;
}

/* 维度卡片 */
.dimensions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.dim-card {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.dim-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.dim-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 4px;
}

.dim-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.7;
}

/* 免责 */
.disclaimer {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: #fff8e1;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: #8d6e00;
  line-height: 1.8;
}
</style>
