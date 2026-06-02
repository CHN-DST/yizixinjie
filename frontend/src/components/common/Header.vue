<template>
  <van-nav-bar
    :title="title"
    :left-text="leftText"
    :left-arrow="showBack"
    @click-left="handleBack"
    fixed
    placeholder
  >
    <template #right>
      <slot name="right"></slot>
    </template>
  </van-nav-bar>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({
  title: { type: String, default: '一字心解' },
  leftText: { type: String, default: '返回' },
  showBack: { type: Boolean, default: true },
});

const router = useRouter();

function handleBack() {
  router.back();
}
</script>
