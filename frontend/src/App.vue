<template>
  <SplashScreen v-if="showSplash" @done="handleSplashDone" />
  <div id="app" class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SplashScreen from './components/common/SplashScreen.vue'

const SPLASH_KEY = 'yizixinjie_splash_seen'
const showSplash = ref(false)

function getSeen() {
  try { return localStorage.getItem(SPLASH_KEY) } catch { return null }
}
function setSeen() {
  try { localStorage.setItem(SPLASH_KEY, '1') } catch { /* noop */ }
}

onMounted(() => {
  if (!getSeen()) {
    showSplash.value = true
  }
})

function handleSplashDone() {
  setSeen()
  showSplash.value = false
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  /* transparent — body bg (color + texture) shows through */
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
