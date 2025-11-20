const express = require('express')
const { body } = require('express-validator')
const userController = require('../controllers/userController')
const { authenticate, authorizeUser } = require('../middleware/authMiddleware')

const router = express.Router()

// All user routes require authentication
router.use(authenticate)
router.use(authorizeUser)

// Get user profile
router.get('/profile', userController.getProfile)

// Update user profile
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
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
], userController.updateProfile)

// Save/update CET rank (specialized endpoint)
router.post('/rank', [
  body('cetRank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('CET rank must be a positive integer'),
  body('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  body('exam')
    .optional()
    .isIn(['JEE-Main', 'JEE-Advanced', 'MHT-CET', 'KCET', 'Other'])
    .withMessage('Invalid exam type')
], userController.updateProfile)

// Get saved predictions
router.get('/predictions', async (req, res) => {
  try {
    // This would integrate with a saved predictions model
    // For now, return empty array as placeholder
    res.json({
      success: true,
      predictions: [],
      message: 'No saved predictions found'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router