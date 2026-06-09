<template>
  <teleport to="body">
    <div class="poster-overlay" v-if="visible" @click.self="close">
      <div class="poster-container">
        <div class="poster-card" ref="posterEl">
          <div class="poster-inner">
            <div class="poster-char">{{ result?.character || '字' }}</div>
            <div class="poster-question" v-if="questionText">"{{ questionText }}"</div>
            <div class="poster-pattern" v-if="result?.divination?.pattern">
              「{{ result.divination.pattern }}」
            </div>
            <div class="poster-gift" v-if="giftLine">{{ giftLine }}</div>
            <div class="poster-brand">
              <span class="poster-brand-name">一字心解</span>
              <span class="poster-brand-url">yizixinjie.pages.dev</span>
            </div>
          </div>
        </div>
        <div class="poster-actions">
          <button class="btn-secondary" @click="close">关闭</button>
          <button class="btn-primary" @click="saveImage">保存图片</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const visible = ref(false);
const result = ref(null);
const questionText = ref('');

const giftLine = computed(() => {
  const advices = result.value?.divination?.advice;
  if (advices && advices.length > 0) return advices[advices.length - 1];
  return '';
});

function show(data, question) {
  result.value = data;
  questionText.value = question || '';
  visible.value = true;
}

function close() {
  visible.value = false;
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let current = '';
  for (const ch of text) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function saveImage() {
  const W = 720;  // 2x scale, 360px logical
  const PAD = 64;
  const char = result.value?.character || '字';
  const question = questionText.value || '';
  const pattern = result.value?.divination?.pattern || '';
  const gift = giftLine.value || '';

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = W + 200; // enough room, will trim later
  const ctx = canvas.getContext('2d');

  // 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = 80;
  const cx = W / 2; // center X

  // 汉字
  ctx.fillStyle = '#1a1714';
  ctx.font = 'bold 140px "KaiTi","STKaiti","SimKai",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(char, cx, y);
  y += 160;

  // 问题
  if (question) {
    y += 24;
    ctx.fillStyle = '#8a8278';
    ctx.font = '30px "Noto Serif SC","SimSun",serif';
    const qLines = wrapText(ctx, '"' + question + '"', W - PAD * 2);
    for (const line of qLines) {
      ctx.fillText(line, cx, y);
      y += 46;
    }
  }

  // 判词
  if (pattern) {
    y += 24;
    ctx.fillStyle = '#3d5a4b';
    ctx.font = '38px "KaiTi","STKaiti","SimKai",serif';
    const pLines = wrapText(ctx, '「' + pattern + '」', W - PAD * 2);
    for (const line of pLines) {
      ctx.fillText(line, cx, y);
      y += 56;
    }
  }

  // 赠言
  if (gift) {
    y += 24;
    // 赠言背景
    const giftLines = wrapText(ctx, gift, W - PAD * 2 - 32);
    const giftH = giftLines.length * 52 + 40;
    ctx.fillStyle = '#f7f5f1';
    const bgX = PAD;
    const bgW = W - PAD * 2;
    ctx.beginPath();
    ctx.moveTo(bgX + 6, y - 20);
    ctx.lineTo(bgX + bgW - 6, y - 20);
    ctx.quadraticCurveTo(bgX + bgW, y - 20, bgX + bgW, y - 14);
    ctx.lineTo(bgX + bgW, y - 20 + giftH - 6);
    ctx.quadraticCurveTo(bgX + bgW, y - 20 + giftH, bgX + bgW - 6, y - 20 + giftH);
    ctx.lineTo(bgX + 6, y - 20 + giftH);
    ctx.quadraticCurveTo(bgX, y - 20 + giftH, bgX, y - 20 + giftH - 6);
    ctx.lineTo(bgX, y - 14);
    ctx.quadraticCurveTo(bgX, y - 20, bgX + 6, y - 20);
    ctx.fill();

    ctx.fillStyle = '#2d2a24';
    ctx.font = '34px "KaiTi","STKaiti","SimKai",serif';
    for (const line of giftLines) {
      ctx.fillText(line, cx, y);
      y += 52;
    }
    y += 20;
  }

  // 分割线 + 品牌
  y += 32;
  ctx.strokeStyle = '#e0dbd2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();

  y += 44;
  ctx.fillStyle = '#6b6358';
  ctx.font = '28px "Noto Serif SC","SimSun",serif';
  ctx.fillText('一字心解', cx, y);
  y += 36;
  ctx.fillStyle = '#a8a094';
  ctx.font = '20px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('yizixinjie.pages.dev', cx, y);

  // 裁剪到实际内容高度
  const finalH = y + 64;
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = W;
  finalCanvas.height = finalH;
  const fctx = finalCanvas.getContext('2d');
  fctx.drawImage(canvas, 0, 0, W, finalH, 0, 0, W, finalH);

  // 下载
  const link = document.createElement('a');
  link.download = '一字心解_' + char + '.png';
  link.href = finalCanvas.toDataURL('image/png');
  link.click();
}

defineExpose({ show, close });
</script>

<style scoped>
.poster-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.poster-container {
  max-width: 360px;
  width: 100%;
}

.poster-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  width: 100%;
}

.poster-inner {
  padding: 40px 32px;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.poster-char {
  font-family: var(--font-kai);
  font-size: 72px;
  color: var(--color-ink-900);
  line-height: 1;
}

.poster-question {
  font-size: 15px;
  color: var(--color-ink-500);
  font-family: var(--font-serif);
  line-height: 1.6;
  max-width: 280px;
  word-break: break-all;
}

.poster-pattern {
  font-family: var(--font-kai);
  font-size: 20px;
  color: var(--color-accent);
  line-height: 1.8;
}

.poster-gift {
  font-family: var(--font-kai);
  font-size: 17px;
  color: var(--color-ink-700);
  line-height: 1.8;
  padding: 16px;
  background: var(--color-ink-75);
  border-radius: var(--radius-sm);
  max-width: 280px;
}

.poster-brand {
  padding-top: 24px;
  border-top: 1px solid var(--color-ink-150);
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.poster-brand-name {
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-ink-600);
  letter-spacing: 0.06em;
}

.poster-brand-url {
  font-size: 10px;
  color: var(--color-ink-400);
}

.poster-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
  justify-content: center;
}
</style>
