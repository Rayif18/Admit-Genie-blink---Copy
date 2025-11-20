const express = require('express')
const { query, param } = require('express-validator')
const { CutoffData, College, Course } = require('../models')
const { Op } = require('sequelize')

const router = express.Router()

// Get cutoff data with pagination and filters
router.get('/', [
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
  query('courseId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  query('year')
    .optional()
    .isInt({ min: 2019, max: 2024 })
    .withMessage('Year must be between 2019 and 2024'),
  query('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { collegeId, courseId, year, category } = req.query

    const whereClause = {}
    if (collegeId) whereClause.collegeId = collegeId
    if (courseId) whereClause.courseId = courseId
    if (year) whereClause.year = year
    if (category) whereClause.category = category

    const { count, rows: cutoffs } = await CutoffData.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['collegeId', 'name', 'location', 'ranking']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['courseId', 'courseName', 'duration']
        }
      ],
      limit,
      offset,
      order: [['year', 'DESC'], [['college', 'ranking', 'ASC']]]
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get cutoffs for specific college and course combination
router.get('/:collegeId/:courseId', [
  param('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
], async (req, res) => {
  try {
    const { collegeId, courseId } = req.params
    const { category, startYear, endYear } = req.query

    const whereClause = { collegeId, courseId }
    if (category) whereClause.category = category
    if (startYear && endYear) {
      whereClause.year = { [Op.between]: [startYear, endYear] }
    } else if (startYear) {
      whereClause.year = { [Op.gte]: startYear }
    } else if (endYear) {
      whereClause.year = { [Op.lte]: endYear }
    }

    const cutoffs = await CutoffData.findAll({
      where: whereClause,
      order: [['year', 'DESC'], ['category', 'ASC']]
    })

    res.json({
      success: true,
      data: cutoffs
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get historical cutoff trends
router.get('/trends/:collegeId/:courseId', [
  param('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  query('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const { collegeId, courseId } = req.params
    const { category } = req.query

    const whereClause = { collegeId, courseId }
    if (category) whereClause.category = category

    const cutoffs = await CutoffData.findAll({
      where: whereClause,
      order: [['year', 'ASC'], ['category', 'ASC']]
    })

    // Calculate trends
    const trends = cutoffs.reduce((acc, cutoff) => {
      const year = cutoff.year
      const category = cutoff.category

      if (!acc[category]) {
        acc[category] = []
      }

      acc[category].push({
        year,
        minRank: cutoff.minRank,
        maxRank: cutoff.maxRank,
        avgRank: cutoff.avgRank
      })

      return acc
    }, {})

    res.json({
      success: true,
      data: trends
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get latest cutoffs for all categories
router.get('/latest/:collegeId/:courseId', [
  param('collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
], async (req, res) => {
  try {
    const { collegeId, courseId } = req.params

    // Get the most recent year available
    const latestYear = await CutoffData.max('year', {
      where: { collegeId, courseId }
    })

    if (!latestYear) {
      return res.status(404).json({
        success: false,
        error: 'No cutoff data found for this college and course combination'
      })
    }

    const cutoffs = await CutoffData.findAll({
      where: {
        collegeId,
        courseId,
        year: latestYear
      },
      order: [['category', 'ASC']]
    })

    res.json({
      success: true,
      year: latestYear,
      data: cutoffs
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router