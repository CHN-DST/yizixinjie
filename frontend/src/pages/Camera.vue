<template>
  <div class="page-container camera-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="开始分析"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="home-o" size="20" @click="$router.push('/')" style="margin-right: 16px;" />
        <van-icon name="clock-o" size="20" @click="$router.push('/history')" />
      </template>
    </van-nav-bar>

    <div class="content-container">
      <!-- 输入模式切换 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
        <van-tab title="📷 拍照上传" name="camera" />
        <van-tab title="✏️ 直接输入" name="text" />
      </van-tabs>

      <!-- ==================== 拍照上传模式 ==================== -->
      <div v-show="activeTab === 'camera'" class="tab-content">
        <div class="camera-preview" @click="showActionSheet = true">
          <div v-if="imagePreview" class="preview-image-container">
            <img :src="imagePreview" alt="预览" class="preview-image" />
            <van-icon name="replay" class="retake-btn" @click.stop="retake" />
          </div>
          <div v-else class="preview-placeholder">
            <van-icon name="photograph" size="48" color="#bdc3c7" />
            <p>点击此处拍照或选择图片</p>
          </div>
        </div>

        <div class="camera-tips" v-if="!imagePreview">
          <div class="tip-item">
            <van-icon name="checked" color="#52c41a" />
            <span>在白色或浅色纸上书写</span>
          </div>
          <div class="tip-item">
            <van-icon name="checked" color="#52c41a" />
            <span>光线充足，字迹清晰</span>
          </div>
          <div class="tip-item">
            <van-icon name="checked" color="#52c41a" />
            <span>汉字居中，避免倾斜</span>
          </div>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="file-input"
          @change="onFileSelected"
        />
      </div>

      <!-- ==================== 直接输入模式 ==================== -->
      <div v-show="activeTab === 'text'" class="tab-content">
        <div class="char-input-area">
          <input
            ref="charInputRef"
            v-model="typedChar"
            type="text"
            class="char-input"
            maxlength="1"
            placeholder="在此写一个汉字"
            @input="onCharInput"
            @focus="charError = ''"
          />
          <div v-if="charError" class="char-error">
            <van-icon name="warning-o" />
            {{ charError }}
          </div>
          <div v-else-if="typedChar && !charError" class="char-valid">
            <van-icon name="success" color="#52c41a" />
            有效的汉字
          </div>
        </div>

        <div class="char-tips">
          <van-icon name="info-o" />
          <span>输入一个你想了解的汉字，如：心、爱、道、家……</span>
        </div>
      </div>

      <!-- ==================== 共用：用户问题区 ==================== -->
      <div
        v-show="hasContent"
        class="question-section"
      >
        <div class="section-label">💬 你想问什么？（选填）</div>
        <van-field
          v-model="question"
          type="textarea"
          rows="3"
          autosize
          maxlength="200"
          show-word-limit
          placeholder='例如：我什么时候才能找到一份好工作？&#10;或者留空，让 AI 自由解读……'
          class="question-field"
        />
      </div>

      <!-- ==================== 提交按钮 ==================== -->
      <div v-show="hasContent" class="submit-section">
        <van-button
          type="primary"
          size="large"
          round
          block
          :loading="isAnalyzing"
          loading-text="AI正在分析..."
          @click="handleAnalyze"
        >
          开始分析
        </van-button>
      </div>
    </div>

    <!-- 拍照/选择操作面板 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="sheetActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSheetSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCharStore } from '@/stores/charStore';
import { fileToBase64, compressImage } from '@/utils/imageProcessor';
import { validateImageFile } from '@/utils/validators';
import { showError } from '@/utils/errorHandler';

const router = useRouter();
const charStore = useCharStore();

// ========= Tab 状态 =========
const activeTab = ref('camera');

// ========= 拍照模式状态 =========
const fileInputRef = ref(null);
const imagePreview = ref('');
const showActionSheet = ref(false);

const sheetActions = [
  { name: '拍照', value: 'camera' },
  { name: '从相册选择', value: 'album' },
];

// ========= 直接输入模式状态 =========
const charInputRef = ref(null);
const typedChar = ref('');
const charError = ref('');

// ========= 共用状态 =========
const question = ref('');
const isAnalyzing = ref(false);

// ========= 计算属性 =========
const hasContent = computed(() => {
  if (activeTab.value === 'camera') return !!imagePreview.value;
  return !!typedChar.value && !charError.value;
});

// ========= Tab 切换 =========
function onTabChange(name) {
  charStore.setMode(name);
  // 切换 tab 时清除之前的输入
  if (name === 'camera') {
    typedChar.value = '';
    charError.value = '';
  } else {
    imagePreview.value = '';
  }
}

// ========= 拍照模式方法 =========
function triggerInput() {
  fileInputRef.value?.click();
}

function onSheetSelect(action) {
  if (action.value === 'camera') {
    fileInputRef.value?.setAttribute('capture', 'environment');
    triggerInput();
    fileInputRef.value?.removeAttribute('capture');
  } else {
    triggerInput();
  }
}

async function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  event.target.value = '';

  const err = validateImageFile(file);
  if (err) {
    showError(err);
    return;
  }

  try {
    let base64 = await fileToBase64(file);
    base64 = await compressImage(base64);
    imagePreview.value = base64;
    charStore.setImage(base64);
  } catch {
    showError('图片处理失败，请重试');
  }
}

function retake() {
  imagePreview.value = '';
  charStore.setImage('');
}

// ========= 直接输入方法 =========
function onCharInput(e) {
  // 只保留汉字
  const val = e.target.value;
  const chineseOnly = val.replace(/[^一-鿿]/g, '');
  if (chineseOnly !== val) {
    typedChar.value = chineseOnly;
  }

  // 验证
  if (!typedChar.value) {
    charError.value = '';
  } else if (!/^[一-鿿]$/.test(typedChar.value)) {
    charError.value = '请输入一个有效的汉字';
  } else {
    charError.value = '';
    charStore.setCharacter(typedChar.value);
  }
}

// ========= 提交 =========
async function handleAnalyze() {
  // 最终校验
  if (activeTab.value === 'camera' && !imagePreview.value) {
    showError('请先拍照或选择图片');
    return;
  }
  if (activeTab.value === 'text') {
    if (!typedChar.value) {
      showError('请输入一个汉字');
      return;
    }
    if (!/^[一-鿿]$/.test(typedChar.value)) {
      showError('请输入一个有效的汉字');
      return;
    }
  }

  charStore.setQuestion(question.value.trim());

  if (activeTab.value === 'camera') {
    charStore.setImage(imagePreview.value);
  } else {
    charStore.setCharacter(typedChar.value);
  }

  isAnalyzing.value = true;
  const result = await charStore.analyze();
  isAnalyzing.value = false;

  if (result) {
    router.push('/result');
  } else {
    showError(charStore.error || '分析失败，请稍后再试');
  }
}
</script>

<style scoped>
.camera-page {
  background: var(--bg-primary);
}

/* Tab 内容 */
.tab-content {
  padding-top: var(--spacing-md);
  min-height: 60px;
}

/* ========= 拍照预览区 ========= */
.camera-preview {
  width: 100%;
  aspect-ratio: 1;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.retake-btn {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  padding: 6px;
  font-size: 20px;
  cursor: pointer;
}

.preview-placeholder {
  text-align: center;
  color: var(--text-light);
}

.preview-placeholder p {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.camera-tips {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--border-radius);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 4px 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.file-input {
  display: none;
}

/* ========= 汉字输入区 ========= */
.char-input-area {
  margin-top: var(--spacing-md);
}

.char-input {
  width: 100%;
  height: 120px;
  font-size: 64px;
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  text-align: center;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-card);
  color: var(--text-title);
  outline: none;
  caret-color: var(--color-primary);
  transition: border-color 0.3s;
}

.char-input:focus {
  border-color: var(--color-primary);
  border-style: solid;
}

.char-input::placeholder {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  font-family: var(--font-family);
}

.char-error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-valid {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-tips {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f0f7ff;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* ========= 问题区 ========= */
.question-section {
  margin-top: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: var(--spacing-xs);
}

.question-field {
  border-radius: var(--border-radius);
  background: var(--bg-card);
}

/* ========= 提交区 ========= */
.submit-section {
  margin-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}
</style>
