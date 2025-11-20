const express = require('express')
const { body } = require('express-validator')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const { authenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// User authentication routes
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('educationLevel')
    .optional()
    .isIn(['10th', '12th', 'Graduate', 'Post-Graduate'])
    .withMessage('Invalid education level'),
  body('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  body('cetRank')
    .optional()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('CET rank must be a positive integer'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object')
], userController.register)

router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], userController.login)

// Admin authentication routes
router.post('/admin/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('registrationKey')
    .notEmpty()
    .withMessage('Admin registration key is required'),
  body('role')
    .optional()
    .isIn(['admin', 'super-admin'])
    .withMessage('Invalid role')
], adminController.register)

router.post('/admin/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], adminController.login)

// Token refresh route
router.post('/refresh', authenticate, (req, res) => {
  res.json({
    success: true,
    token: req.auth.token,
    user: req.user || req.admin
  })
})

// Logout route (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

module.exports = router