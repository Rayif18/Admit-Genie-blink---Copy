const express = require('express')
const { body, query, param } = require('express-validator')
const adminController = require('../controllers/adminController')
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware')
const { College, Course, CutoffData, ExamSchedule, User, ChatHistory } = require('../models')
const asyncHandler = require('../utils/asyncHandler')

const router = express.Router()

// All admin routes require authentication and admin authorization
router.use(authenticate)
router.use(authorizeAdmin)

// Get dashboard statistics
router.get('/dashboard', adminController.getDashboardStats)

// College Management
router.get('/colleges', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit

  const { count, rows: colleges } = await College.findAndCountAll({
    limit,
    offset,
    order: [['name', 'ASC']],
    include: [
      {
        model: Course,
        as: 'courses',
        attributes: ['courseId', 'courseName', 'duration']
      }
    ]
  })

  res.json({
    success: true,
    data: colleges,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalColleges: count,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1
    }
  })
}))

router.post('/colleges', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('College name must be between 2 and 200 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('accreditation')
    .optional()
    .isIn(['A+', 'A', 'B+', 'B'])
    .withMessage('Invalid accreditation rating'),
  body('ranking')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Ranking must be between 1 and 10000'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const college = await College.create(req.body)
  res.status(201).json({
    success: true,
    data: college
  })
}))

router.put('/colleges/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('College name must be between 2 and 200 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('accreditation')
    .optional()
    .isIn(['A+', 'A', 'B+', 'B'])
    .withMessage('Invalid accreditation rating'),
  body('ranking')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Ranking must be between 1 and 10000'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const college = await College.findByPk(req.params.id)
  if (!college) {
    return res.status(404).json({
      success: false,
      error: 'College not found'
    })
  }

  await college.update(req.body)
  res.json({
    success: true,
    data: college
  })
}))

router.delete('/colleges/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer')
], asyncHandler(async (req, res) => {
  const college = await College.findByPk(req.params.id)
  if (!college) {
    return res.status(404).json({
      success: false,
      error: 'College not found'
    })
  }

  await college.destroy()
  res.json({
    success: true,
    message: 'College deleted successfully'
  })
}))

// Course Management
router.get('/courses', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('collegeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer')
], asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  const { collegeId } = req.query

  const whereClause = {}
  if (collegeId) whereClause.collegeId = collegeId

  const { count, rows: courses } = await Course.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['collegeId', 'name', 'location']
      }
    ],
    limit,
    offset,
    order: [['courseName', 'ASC']]
  })

  res.json({
    success: true,
    data: courses,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCourses: count,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1
    }
  })
}))

router.post('/courses', [
  body('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  body('courseName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Course name must be between 2 and 200 characters'),
  body('duration')
    .isIn(['1 year', '2 years', '3 years', '4 years', '5 years'])
    .withMessage('Invalid duration'),
  body('eligibility')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Eligibility must be between 10 and 1000 characters'),
  body('fees')
    .isInt({ min: 0, max: 10000000 })
    .withMessage('Fees must be between 0 and 10,000,000'),
  body('intake')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Intake must be between 1 and 1000')
], asyncHandler(async (req, res) => {
  const course = await Course.create(req.body)
  res.status(201).json({
    success: true,
    data: course
  })
}))

// Cutoff Data Management
router.get('/cutoffs', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('collegeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  query('year')
    .optional()
    .isInt({ min: 2019, max: 2024 })
    .withMessage('Year must be between 2019 and 2024')
], asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  const { collegeId, year } = req.query

  const whereClause = {}
  if (collegeId) whereClause.collegeId = collegeId
  if (year) whereClause.year = year

  const { count, rows: cutoffs } = await CutoffData.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['collegeId', 'name', 'location']
      },
      {
        model: Course,
        as: 'course',
        attributes: ['courseId', 'courseName']
      }
    ],
    limit,
    offset,
    order: [['year', 'DESC'], [['college', 'name', 'ASC']]]
  })

  res.json({
    success: true,
    data: cutoffs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1
    }
  })
}))

router.post('/cutoffs', [
  body('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  body('category')
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  body('year')
    .isInt({ min: 2019, max: 2024 })
    .withMessage('Year must be between 2019 and 2024'),
  body('minRank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Minimum rank must be between 1 and 1,000,000'),
  body('maxRank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Maximum rank must be between 1 and 1,000,000'),
  body('avgRank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Average rank must be between 1 and 1,000,000')
], asyncHandler(async (req, res) => {
  const cutoff = await CutoffData.create(req.body)
  res.status(201).json({
    success: true,
    data: cutoff
  })
}))

// User Analytics
router.get('/analytics/users', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
], asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    totalUsers,
    newUsers,
    usersWithRank,
    categoryDistribution,
    educationLevelDistribution
  ] = await Promise.all([
    User.count(),
    User.count({
      where: { createdAt: { [require('sequelize').Op.gte]: startDate } }
    }),
    User.count({
      where: { cetRank: { [require('sequelize').Op.not]: null } }
    }),
    User.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('userId')), 'count']
      ],
      group: ['category']
    }),
    User.findAll({
      attributes: [
        'educationLevel',
        [require('sequelize').fn('COUNT', require('sequelize').col('userId')), 'count']
      ],
      group: ['educationLevel']
    })
  ])

  res.json({
    success: true,
    period: `${days} days`,
    analytics: {
      totalUsers,
      newUsers,
      usersWithRank,
      categoryDistribution,
      educationLevelDistribution
    }
  })
}))

// Chat Analytics
router.get('/analytics/chats', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
], asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    totalChats,
    averageResponseTime,
    intentDistribution,
    dailyChatVolume
  ] = await Promise.all([
    ChatHistory.count({
      where: { timestamp: { [require('sequelize').Op.gte]: startDate } }
    }),
    // This would need proper implementation of response time tracking
    ChatHistory.findAll({
      attributes: [
        'intent',
        [require('sequelize').fn('COUNT', require('sequelize').col('chatId')), 'count']
      ],
      where: { timestamp: { [require('sequelize').Op.gte]: startDate } },
      group: ['intent']
    })
  ])

  res.json({
    success: true,
    period: `${days} days`,
    analytics: {
      totalChats,
      averageResponseTime: 'N/A', // Would need implementation
      intentDistribution,
      dailyChatVolume: 'N/A' // Would need implementation
    }
  })
}))

module.exports = router