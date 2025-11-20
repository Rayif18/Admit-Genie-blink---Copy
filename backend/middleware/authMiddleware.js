const jwt = require('jsonwebtoken')
const { User, Admin } = require('../models')
const asyncHandler = require('../utils/asyncHandler')

const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1]
  }
  if (req.cookies?.token) {
    return req.cookies.token
  }
  return null
}

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req)

  if (!token) {
    const error = new Error('Authentication token missing')
    error.statusCode = 401
    throw error
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = { token, ...decoded }

    if (decoded.role === 'admin') {
      const admin = await Admin.scope('withPassword').findByPk(decoded.id)
      if (!admin) {
        const error = new Error('Admin not found')
        error.statusCode = 401
        throw error
      }
      req.admin = admin
    } else {
      const user = await User.scope('withPassword').findByPk(decoded.id)
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 401
        throw error
      }
      req.user = user
    }

    next()
  } catch (error) {
    error.statusCode = 401
    error.message = 'Invalid or expired token'
    throw error
  }
})

const authorizeUser = (req, _res, next) => {
  if (!req.user) {
    const error = new Error('User authorization required')
    error.statusCode = 403
    throw error
  }
  next()
}

const authorizeAdmin = (req, _res, next) => {
  if (!req.admin) {
    const error = new Error('Admin authorization required')
    error.statusCode = 403
    throw error
  }
  next()
}

module.exports = {
  authenticate,
  authorizeUser,
  authorizeAdmin
}

