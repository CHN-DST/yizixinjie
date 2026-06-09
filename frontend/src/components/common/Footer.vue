<template>
  <footer class="app-footer">
    <p class="footer-text">一字心解 &copy; {{ year }}</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.footer-text {
  font-size: var(--text-xs);
  color: var(--color-ink-400);
  letter-spacing: 0.04em;
}
</style>
