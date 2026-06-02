<template>
  <footer class="app-footer">
    <p>一字心解 &copy; {{ year }}</p>
    <p class="footer-note">手写汉字 · AI 解读 · 探索内心</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-md);
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.footer-note {
  margin-top: 4px;
  opacity: 0.6;
}
</style>
