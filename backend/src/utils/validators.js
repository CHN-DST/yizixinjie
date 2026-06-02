/**
 * 数据验证工具
 */

/**
 * 验证是否为有效的中文字符
 */
function isValidChineseChar(char) {
  return (
    typeof char === 'string' && char.length === 1 && /^[一-鿿]$/.test(char)
  );
}

/**
 * 验证请求中是否包含必要参数
 */
function validateRequired(params, requiredFields) {
  const missing = requiredFields.filter((field) => !params[field]);
  if (missing.length > 0) {
    throw Object.assign(new Error(`缺少必要参数: ${missing.join(', ')}`), {
      statusCode: 400,
    });
  }
}

/**
 * 验证字符串长度
 */
function validateLength(value, fieldName, min = 1, max = 500) {
  if (typeof value !== 'string') {
    throw Object.assign(new Error(`${fieldName} 必须是字符串类型`), {
      statusCode: 400,
    });
  }
  if (value.length < min || value.length > max) {
    throw Object.assign(
      new Error(`${fieldName} 长度应在 ${min}-${max} 之间`),
      { statusCode: 400 }
    );
  }
  return true;
}

module.exports = { isValidChineseChar, validateRequired, validateLength };
