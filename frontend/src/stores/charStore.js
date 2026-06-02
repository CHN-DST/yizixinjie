import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyzeCharacter } from '@/services/charService';

/**
 * 汉字分析数据状态管理
 */
export const useCharStore = defineStore('char', () => {
  // ========= 状态 =========
  const currentImageBase64 = ref('');     // 当前图片 Base64
  const currentChar = ref('');            // 直接输入的汉字
  const currentQuestion = ref('');        // 用户自定义问题
  const inputMode = ref('camera');        // 'camera' | 'text'
  const currentResult = ref(null);        // 当前分析结果
  const isAnalyzing = ref(false);         // 是否正在分析
  const error = ref(null);                // 错误信息
  const history = ref([]);                // 历史记录

  // ========= 计算属性 =========
  const hasResult = computed(() => currentResult.value !== null);
  const historyCount = computed(() => history.value.length);
  const hasInput = computed(() => {
    if (inputMode.value === 'camera') return !!currentImageBase64.value;
    return !!currentChar.value;
  });

  // ========= 方法 =========

  /**
   * 设置模式
   */
  function setMode(mode) {
    inputMode.value = mode;
    error.value = null;
  }

  /**
   * 设置当前图片
   */
  function setImage(base64) {
    currentImageBase64.value = base64;
    currentChar.value = ''; // 互斥
    error.value = null;
  }

  /**
   * 设置直接输入的汉字
   */
  function setCharacter(char) {
    currentChar.value = char;
    currentImageBase64.value = ''; // 互斥
    error.value = null;
  }

  /**
   * 设置用户问题
   */
  function setQuestion(q) {
    currentQuestion.value = q;
  }

  /**
   * 开始分析
   */
  async function analyze() {
    // 验证输入
    if (inputMode.value === 'camera' && !currentImageBase64.value) {
      error.value = '请先拍照或选择图片';
      return null;
    }
    if (inputMode.value === 'text' && !currentChar.value) {
      error.value = '请输入一个汉字';
      return null;
    }

    isAnalyzing.value = true;
    error.value = null;

    try {
      const payload = {
        question: currentQuestion.value || '',
      };

      if (inputMode.value === 'camera') {
        payload.imageBase64 = currentImageBase64.value;
      } else {
        payload.character = currentChar.value;
      }

      const result = await analyzeCharacter(payload);
      currentResult.value = result;
      addToHistory(result);
      return result;
    } catch (err) {
      error.value = err.message || '分析失败，请稍后再试';
      return null;
    } finally {
      isAnalyzing.value = false;
    }
  }

  /**
   * 添加到历史记录
   */
  function addToHistory(result) {
    const record = {
      id: Date.now().toString(),
      ...result,
      question: currentQuestion.value,
      createdAt: new Date().toISOString(),
    };
    history.value.unshift(record);
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50);
    }
    saveHistory();
  }

  /**
   * 清除当前结果
   */
  function clearResult() {
    currentResult.value = null;
    currentImageBase64.value = '';
    currentChar.value = '';
    currentQuestion.value = '';
    error.value = null;
  }

  /**
   * 清除历史记录
   */
  function clearHistory() {
    history.value = [];
    localStorage.removeItem('char_history');
  }

  /**
   * 从 localStorage 加载历史记录
   */
  function loadHistory() {
    try {
      const stored = localStorage.getItem('char_history');
      if (stored) {
        history.value = JSON.parse(stored);
      }
    } catch {
      history.value = [];
    }
  }

  /**
   * 保存历史记录到 localStorage
   */
  function saveHistory() {
    try {
      localStorage.setItem('char_history', JSON.stringify(history.value));
    } catch {
      // localStorage 可能已满
    }
  }

  loadHistory();

  return {
    // state
    currentImageBase64,
    currentChar,
    currentQuestion,
    inputMode,
    currentResult,
    isAnalyzing,
    error,
    history,
    // computed
    hasResult,
    historyCount,
    hasInput,
    // methods
    setMode,
    setImage,
    setCharacter,
    setQuestion,
    analyze,
    clearResult,
    clearHistory,
    loadHistory,
  };
});
