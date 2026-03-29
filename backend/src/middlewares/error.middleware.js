function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]:', err.message);
  console.error(err.stack);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Data Validation Error',
      errors: Object.values(err.errors).map(val => val.message)
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyValue)
    });
  }

  // Default fallback
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
