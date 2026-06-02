/**
 * 统一错误处理中间件
 */
function errorHandler(err, _req, res, _next) {
  console.error('[Error]', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? '服务器内部错误，请稍后再试' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * 404 路由处理
 */
function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: '请求的接口不存在',
  });
}

module.exports = { errorHandler, notFoundHandler };
