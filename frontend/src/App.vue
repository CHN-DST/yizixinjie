<template>
  <div id="app" class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
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
  background-color: var(--bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
