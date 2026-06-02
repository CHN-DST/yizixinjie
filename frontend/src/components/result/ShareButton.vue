<template>
  <div class="share-button-wrapper">
    <van-button
      type="primary"
      size="small"
      round
      icon="share-o"
      @click="handleShare"
    >
      {{ text }}
    </van-button>

    <!-- 分享面板 -->
    <van-share-sheet
      v-model:show="showShare"
      title="分享分析结果"
      :options="shareOptions"
      @select="onShareSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showToast } from 'vant';

defineProps({
  text: { type: String, default: '分享' },
  character: { type: String, default: '' },
  content: { type: String, default: '' },
});

const showShare = ref(false);

const shareOptions = [
  { name: '复制链接', icon: 'link' },
  { name: '保存图片', icon: 'photograph' },
  { name: '微信', icon: 'wechat' },
];

function handleShare() {
  showShare.value = true;
}

function onShareSelect(option) {
  if (option.name === '复制链接') {
    // 复制当前页面 URL
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showToast('链接已复制'))
      .catch(() => showToast('复制失败'));
  } else {
    showToast(`${option.name}功能即将上线`);
  }
  showShare.value = false;
}
</script>

<style scoped>
.share-button-wrapper {
  display: inline-block;
}
</style>
