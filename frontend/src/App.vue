<template>
  <div id="app" class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// App 根组件 - 负责整体布局和路由视图
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--color-ink-50);
}

.page-enter-active {
  transition: all 0.3s var(--ease-out);
}

.page-leave-active {
  transition: all 0.2s var(--ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
