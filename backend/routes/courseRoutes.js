const express = require('express')
const { query, param } = require('express-validator')
const { Course, College, CutoffData } = require('../models')
const { Op } = require('sequelize')

const router = express.Router()

// Get all courses with pagination and filters
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  query('duration')
    .optional()
    .isIn(['1 year', '2 years', '3 years', '4 years', '5 years'])
    .withMessage('Invalid duration'),
  query('feesMax')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum fees must be a positive number')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { search, duration, feesMax } = req.query

    const whereClause = {}
    const collegeInclude = { model: College, as: 'college' }

    if (search) {
      whereClause[Op.or] = [
        { courseName: { [Op.like]: `%${search}%` } },
        { eligibility: { [Op.like]: `%${search}%` } }
      ]
      collegeInclude.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    if (duration) {
      whereClause.duration = duration
    }

    if (feesMax) {
      whereClause.fees = { [Op.lte]: feesMax }
    }

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['collegeId', 'name', 'location', 'ranking', 'accreditation']
        }
      ],
      limit,
      offset,
      order: [['courseName', 'ASC'], [['college', 'ranking', 'ASC']]]
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get course by ID
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
], async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['collegeId', 'name', 'location', 'ranking', 'accreditation', 'description']
        },
        {
          model: require('../models').Admission,
          as: 'admissions'
        },
        {
          model: CutoffData,
          as: 'cutoffs',
          order: [['year', 'DESC']]
        }
      ]
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      })
    }

    res.json({
      success: true,
      data: course
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Search courses
router.get('/search/:query', [
  param('query')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
], async (req, res) => {
  try {
    const { query } = req.params

    const courses = await Course.findAll({
      where: {
        [Op.or]: [
          { courseName: { [Op.like]: `%${query}%` } },
          { eligibility: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['collegeId', 'name', 'location', 'ranking']
        }
      ],
      limit: 50,
      order: [['courseName', 'ASC']]
    })

    res.json({
      success: true,
      data: courses
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get courses by college ID
router.get('/college/:collegeId', [
  param('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer')
], async (req, res) => {
  try {
    const college = await College.findByPk(req.params.collegeId)
    if (!college) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      })
    }

    const courses = await Course.findAll({
      where: { collegeId: req.params.collegeId },
      include: [
        {
          model: CutoffData,
          as: 'cutoffs',
          order: [['year', 'DESC']],
          limit: 5
        }
      ],
      order: [['courseName', 'ASC']]
    })

    res.json({
      success: true,
      college: college.name,
      data: courses
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router