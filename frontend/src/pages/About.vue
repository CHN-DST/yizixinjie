<template>
  <div class="page-container about-page">
    <van-nav-bar left-text="←" @click-left="$router.back()" fixed placeholder />

    <div class="content-container">
      <!-- 头部 -->
      <header class="about-header">
        <p class="about-char">心</p>
        <h1 class="about-name">一字心解</h1>
        <p class="about-tagline">言为心声，字为心画。心形运笔，笔画藏休咎。</p>
      </header>

      <!-- 项目简介 -->
      <section class="about-section">
        <h2 class="section-title">项目简介</h2>
        <p class="section-text">
          一字心解是一款融合 DeepSeek AI 与中国古代测字术的 Web 应用。
          用户输入一个汉字，AI 深谙《测字秘牒》九法（装头/接脚/穿心/破解/添笔/减笔/对关/摘字/观梅），
          结合六书六义、五行六神、心易心法，从字源学、文化学、字相学三维度深度解析，
          给出测字取格与个性化成长建议。
        </p>
      </section>

      <!-- 技术架构 -->
      <section class="about-section">
        <h2 class="section-title">技术架构</h2>
        <div class="tech-list">
          <div class="tech-item">
            <span class="tech-label">前端</span>
            <span class="tech-value">Vue 3 · Vite · Vant 4 · Pinia · Vue Router · Canvas</span>
          </div>
          <div class="tech-item">
            <span class="tech-label">后端</span>
            <span class="tech-value">Node.js 18 · 腾讯云 SCF（Serverless）</span>
          </div>
          <div class="tech-item">
            <span class="tech-label">AI</span>
            <span class="tech-value">DeepSeek Chat API · 古籍 Prompt 工程</span>
          </div>
          <div class="tech-item">
            <span class="tech-label">数据库</span>
            <span class="tech-value">Supabase（PostgreSQL）</span>
          </div>
          <div class="tech-item">
            <span class="tech-label">部署</span>
            <span class="tech-value">Cloudflare Pages + 腾讯云 SCF 双栈</span>
          </div>
          <div class="tech-item">
            <span class="tech-label">版本</span>
            <span class="tech-value">v0.4.0</span>
          </div>
        </div>
      </section>

      <!-- 参考古籍 -->
      <section class="about-section">
        <h2 class="section-title">参考古籍</h2>
        <div class="book-list">
          <div class="book-item">
            <span class="book-title">《测字秘牒》</span>
            <span class="book-author">清 · 程省</span>
            <p class="book-desc">测字术开山经典。系统阐述装头、接脚、穿心、破解、添笔、减笔、对关、摘字、观梅九法，附双句格法、散格法。AI prompt 核心依据。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《新刻相字心法》</span>
            <span class="book-author">明 · 仲</span>
            <p class="book-desc">相字秘传心法，与《测字秘牒》互补，详述字之体用、笔画吉凶。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《字触》</span>
            <span class="book-author">清 · 周工亮 辑</span>
            <p class="book-desc">汇集历代测字案例，以字触机，以机断事，实战经验宝库。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《梅花易数》</span>
            <span class="book-author">宋 · 邵康节</span>
            <p class="book-desc">邵子观梅心诀：万物皆可借来应用，唯心镜光明、随物洞照。测字最高法门。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《渊海子平》</span>
            <span class="book-author">宋 · 徐大升</span>
            <p class="book-desc">八字命理奠基之作，五行生克、六神配位、干支体用理论体系。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《说文解字》</span>
            <span class="book-author">东汉 · 许慎</span>
            <p class="book-desc">汉字字源学奠基之作，系统分析汉字字形与字义，测字拆解之本源。</p>
          </div>
          <div class="book-item">
            <span class="book-title">《测字解密》</span>
            <span class="book-author">蔡大成 主编</span>
            <p class="book-desc">中华神秘文化测字术，古今测字一千六百例，现代测字研究集大成之作。</p>
          </div>
        </div>
      </section>

      <!-- 开源信息 -->
      <section class="about-section">
        <h2 class="section-title">开源地址</h2>
        <a
          class="github-link"
          href="https://github.com/CHN-DST/yizixinjie"
          target="_blank"
          rel="noopener"
        >
          <span>GitHub</span>
          <span>CHN-DST/yizixinjie</span>
          <span class="link-arrow">↗</span>
        </a>
      </section>

      <!-- 声明 -->
      <p class="about-disclaimer">
        测字分析仅供娱乐参考，不构成专业心理咨询建议。
        如有心理困扰，请寻求专业帮助。
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-page {
  /* transparent — app-container bg shows through */
}

/* 头部 */
.about-header {
  text-align: center;
  padding: var(--space-16) 0 var(--space-10);
}

.about-char {
  font-family: var(--font-kai);
  font-size: 64px;
  color: var(--color-ink-900);
  line-height: 1;
  margin-bottom: var(--space-4);
}

.about-name {
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-ink-900);
  letter-spacing: 0.08em;
}

.about-tagline {
  font-size: var(--text-base);
  color: var(--color-ink-500);
  margin-top: var(--space-2);
  letter-spacing: 0.06em;
}

/* 内容区 */
.about-section {
  margin-bottom: var(--space-10);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink-800);
  letter-spacing: 0.06em;
  margin-bottom: var(--space-4);
  padding-left: var(--space-2);
  border-left: 2px solid var(--color-primary);
}

.section-text {
  font-size: var(--text-base);
  color: var(--color-ink-600);
  line-height: 2;
}

/* 技术列表 */
.tech-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tech-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-ink-150);
  font-size: var(--text-sm);
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-label {
  flex-shrink: 0;
  min-width: 52px;
  color: var(--color-ink-400);
  font-weight: 500;
}

.tech-value {
  color: var(--color-ink-700);
}

/* 书籍列表 */
.book-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.book-item {
  padding: var(--space-4);
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-ink-150);
}

.book-title {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-ink-900);
  font-family: var(--font-serif);
}

.book-author {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  margin-left: var(--space-2);
}

.book-desc {
  font-size: var(--text-sm);
  color: var(--color-ink-500);
  margin-top: var(--space-2);
  line-height: 1.7;
}

/* GitHub */
.github-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: #fff;
  border: 1px solid var(--color-ink-150);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--color-ink-800);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.github-link:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.link-arrow {
  margin-left: auto;
  color: var(--color-ink-400);
}

/* 声明 */
.about-disclaimer {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  line-height: 1.8;
  text-align: center;
  padding: var(--space-4);
  background: var(--color-ink-100);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-16);
}
</style>
