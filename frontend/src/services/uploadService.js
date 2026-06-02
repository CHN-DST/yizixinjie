import api from './api';

/**
 * 图片上传服务
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000,
  });

  return response.data;
}

/**
 * 获取图片预览地址
 */
export function getImagePreviewUrl(imageId) {
  return `${import.meta.env.VITE_API_BASE_URL || ''}/uploads/${imageId}`;
}
