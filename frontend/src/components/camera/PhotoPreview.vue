<template>
  <div class="photo-preview">
    <div class="preview-container" v-if="src">
      <img :src="src" alt="预览照片" class="preview-image" />
      <!-- 裁剪引导提示 -->
      <div class="crop-guide" v-if="showGuide">
        <div class="guide-text">请确保汉字居中清晰可见</div>
      </div>
    </div>
    <div v-else class="no-photo">
      <van-icon name="photo-o" size="48" color="#bdc3c7" />
      <p>暂无照片</p>
    </div>

    <!-- 操作按钮 -->
    <div class="preview-actions" v-if="src">
      <slot name="actions">
        <van-button size="small" plain @click="$emit('retake')">重拍</van-button>
        <van-button size="small" type="primary" @click="$emit('confirm')">使用此照片</van-button>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: { type: String, default: '' },
  showGuide: { type: Boolean, default: true },
});

defineEmits(['retake', 'confirm']);
</script>

<style scoped>
.photo-preview {
  width: 100%;
}

.preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--border-radius);
  background: #f0f0f0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.crop-guide {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-xs);
  text-align: center;
}

.guide-text {
  color: white;
  font-size: var(--font-size-xs);
}

.no-photo {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  color: var(--text-light);
  font-size: var(--font-size-sm);
  gap: var(--spacing-sm);
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}
</style>
