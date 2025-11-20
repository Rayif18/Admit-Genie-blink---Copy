const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error'
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.stack = err.stack
  }

  res.status(statusCode).json(payload)
}

module.exports = errorHandler

