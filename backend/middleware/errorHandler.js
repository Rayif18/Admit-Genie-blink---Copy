const { validationResult } = require('express-validator')

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    })
  }
  next()
}

// Enhanced error handler with comprehensive error types
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errorType = 'InternalServerError'
  let details = null

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    errorType = 'ValidationError'
    message = 'Invalid input provided'
    details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }))
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400
    errorType = 'DatabaseValidationError'
    message = 'Data validation failed'
    details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }))
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409
    errorType = 'DuplicateEntryError'
    message = 'Data already exists'
    details = err.errors.map(error => ({
      field: error.path,
      message: `${error.path} already exists`,
      value: error.value
    }))
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400
    errorType = 'ForeignKeyConstraintError'
    message = 'Invalid reference to related data'
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500
    errorType = 'DatabaseError'
    message = 'Database operation failed'
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    errorType = 'AuthenticationError'
    message = 'Invalid authentication token'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    errorType = 'AuthenticationError'
    message = 'Authentication token has expired'
  } else if (err.name === 'CastError') {
    statusCode = 400
    errorType = 'InvalidFormatError'
    message = 'Invalid data format provided'
  } else if (err.code === 'ENOENT') {
    statusCode = 404
    errorType = 'FileNotFoundError'
    message = 'Requested resource not found'
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503
    errorType = 'ServiceUnavailableError'
    message = 'External service unavailable'
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 504
    errorType = 'TimeoutError'
    message = 'Request timed out'
  } else if (err.statusCode) {
    // Custom error with specific status code
    errorType = err.constructor.name || 'CustomError'
  }

  // Log error details for debugging
  console.error(`[${new Date().toISOString()}] ${errorType}: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  })

  // Prepare response payload
  const payload = {
    success: false,
    error: errorType,
    message: message
  }

  // Include details in development mode
  if (process.env.NODE_ENV === 'development') {
    if (details) payload.details = details
    if (err.stack) payload.stack = err.stack
  } else if (process.env.NODE_ENV === 'test') {
    // Minimal info in test mode
    payload.message = message
  }

  // Include request ID if available
  if (req.requestId) {
    payload.requestId = req.requestId
  }

  res.status(statusCode).json(payload)
}

// Async error wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    hint: 'Check the URL and HTTP method'
  })
}

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'RateLimitExceeded',
    message: 'Too many requests, please try again later',
    retryAfter: Math.round(res.get('Retry-After')) || 60
  })
}

// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode = 500, errorType = null) {
    super(message)
    this.statusCode = statusCode
    this.errorType = errorType || this.constructor.name
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'ValidationError')
    this.details = details
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NotFoundError')
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AuthenticationError')
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AuthorizationError')
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'ConflictError')
  }
}

module.exports = {
  errorHandler,
  handleValidationErrors,
  asyncHandler,
  notFoundHandler,
  rateLimitHandler,
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError
}

