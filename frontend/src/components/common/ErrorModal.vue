<template>
  <van-dialog
    v-model:show="showDialog"
    :title="title"
    :message="message"
    :show-cancel-button="showCancel"
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '提示' },
  message: { type: String, default: '' },
  showCancel: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const showDialog = ref(false);

watch(
  () => props.visible,
  (val) => {
    showDialog.value = val;
  }
);

watch(showDialog, (val) => {
  if (!val) emit('update:visible', false);
});

function handleConfirm() {
  emit('confirm');
  showDialog.value = false;
}

function handleCancel() {
  emit('cancel');
  showDialog.value = false;
}
</script>
