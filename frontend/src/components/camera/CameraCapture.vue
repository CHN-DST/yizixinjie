<template>
  <div class="camera-capture">
    <!-- 摄像头视频流 -->
    <video
      v-if="streamActive"
      ref="videoRef"
      class="camera-video"
      autoplay
      playsinline
    ></video>

    <!-- 拍照按钮 -->
    <div class="camera-controls" v-if="streamActive">
      <button class="capture-btn" @click="capturePhoto">
        <div class="capture-inner"></div>
      </button>
    </div>

    <!-- 未激活时提示 -->
    <div v-if="!streamActive && !errorMsg" class="camera-placeholder" @click="startCamera">
      <van-icon name="photograph" size="48" color="#7f8c8d" />
      <p>点击启用摄像头</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="camera-error">
      <van-icon name="warning-o" size="32" color="#f5222d" />
      <p>{{ errorMsg }}</p>
      <van-button size="small" type="primary" @click="startCamera">重试</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

const emit = defineEmits(['captured']);

const videoRef = ref(null);
const streamActive = ref(false);
const errorMsg = ref('');
let stream = null;

/**
 * 启动摄像头
 */
async function startCamera() {
  errorMsg.value = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1080 },
        height: { ideal: 1080 },
      },
      audio: false,
    });

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      streamActive.value = true;
    }
  } catch (err) {
    errorMsg.value = '无法访问摄像头，请检查权限设置';
    console.error('摄像头启动失败:', err);
  }
}

/**
 * 拍照
 */
function capturePhoto() {
  if (!videoRef.value) return;

  const canvas = document.createElement('canvas');
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.value, 0, 0);

  const base64 = canvas.toDataURL('image/jpeg', 0.85);
  emit('captured', base64);

  stopCamera();
}

/**
 * 停止摄像头
 */
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  streamActive.value = false;
}

onUnmounted(() => {
  stopCamera();
});

// 暴露方法给父组件
defineExpose({ startCamera, stopCamera });
</script>

<style scoped>
.camera-capture {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  border-radius: var(--border-radius);
  overflow: hidden;
  position: relative;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  gap: var(--spacing-sm);
}

.camera-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff2f0;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  text-align: center;
  padding: var(--spacing-md);
}

/* 拍照按钮 */
.camera-controls {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.capture-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
}

.capture-inner {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: white;
}
</style>
