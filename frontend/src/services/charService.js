import api from './api';

/**
 * 汉字分析服务
 */

/**
 * 分析汉字（支持图片或直接输入）
 * @param {object} params
 * @param {string} [params.imageBase64] - 图片的 Base64 编码
 * @param {string} [params.character] - 直接输入的汉字
 * @param {string} [params.question] - 用户自定义问题
 * @returns {Promise<object>} 分析结果
 */
export async function analyzeCharacter({ imageBase64, character, question }) {
  const response = await api.post('/analyze', {
    imageBase64,
    character,
    question,
  });
  return response.data;
}

/**
 * 通过已上传的图片 ID 分析汉字
 * @param {string} imageId - 上传后的图片 ID
 * @param {string} [question] - 用户自定义问题
 * @returns {Promise<object>} 分析结果
 */
export async function analyzeCharacterById(imageId, question = '') {
  const response = await api.post('/analyze', {
    imageId,
    question,
  });
  return response.data;
}
