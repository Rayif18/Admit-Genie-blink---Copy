const express = require('express')
const { query, param } = require('express-validator')
const { College, Course } = require('../models')
const { Op } = require('sequelize')

const router = express.Router()

// Get all colleges with pagination and filters
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
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Location filter cannot be empty'),
  query('accreditation')
    .optional()
    .isIn(['A+', 'A', 'B+', 'B'])
    .withMessage('Invalid accreditation value')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { search, location, accreditation } = req.query

    const whereClause = {}

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }

    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` }
    }

    if (accreditation) {
      whereClause.accreditation = accreditation
    }

    const { count, rows: colleges } = await College.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['courseId', 'courseName', 'duration', 'fees']
        }
      ],
      limit,
      offset,
      order: [['ranking', 'ASC'], ['name', 'ASC']]
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get college by ID
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer')
], async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'courses',
          include: [
            {
              model: require('../models').Admission,
              as: 'admissions'
            }
          ]
        }
      ]
    })

    if (!college) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      })
    }

    res.json({
      success: true,
      data: college
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Search colleges (advanced search)
router.get('/search/advanced', [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long')
], async (req, res) => {
  try {
    const { q } = req.query

    const colleges = await College.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['courseId', 'courseName', 'duration']
        }
      ],
      limit: 50,
      order: [['ranking', 'ASC']]
    })

    res.json({
      success: true,
      data: colleges
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get courses offered by a specific college
router.get('/:id/courses', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer')
], async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id)
    if (!college) {
      return res.status(404).json({
        success: false,
        error: 'College not found'
      })
    }

    const courses = await Course.findAll({
      where: { collegeId: req.params.id },
      include: [
        {
          model: require('../models').Admission,
          as: 'admissions'
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