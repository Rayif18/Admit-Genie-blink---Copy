const express = require('express')
const { body, query } = require('express-validator')
const { College, Course, CutoffData } = require('../models')
const { Op } = require('sequelize')
const rankPrediction = require('../utils/rankPrediction')

const router = express.Router()

// Get college predictions based on rank and category
router.post('/colleges', [
  body('rank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Rank must be a positive integer'),
  body('category')
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  body('exam')
    .optional()
    .isIn(['JEE-Main', 'JEE-Advanced', 'MHT-CET', 'KCET', 'Other'])
    .withMessage('Invalid exam type'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters'),
  body('courseType')
    .optional()
    .isIn(['Engineering', 'Medical', 'Management', 'Science', 'Arts'])
    .withMessage('Invalid course type'),
  body('limit')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Limit must be between 5 and 50')
], async (req, res) => {
  try {
    const { rank, category, exam, state, courseType, limit = 20 } = req.body

    // Use the rank prediction utility
    const predictions = await rankPrediction.getPredictions(rank, category, {
      exam,
      state,
      courseType,
      limit
    })

    // Categorize predictions into Safe, Medium, Reach
    const categorizedPredictions = rankPrediction.categorizePredictions(predictions, rank, category)

    res.json({
      success: true,
      input: {
        rank,
        category,
        exam,
        state,
        courseType
      },
      predictions: categorizedPredictions,
      stats: {
        totalColleges: predictions.length,
        safeColleges: categorizedPredictions.safe.length,
        mediumColleges: categorizedPredictions.medium.length,
        reachColleges: categorizedPredictions.reach.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get detailed cutoff analysis for specific colleges
router.post('/analysis', [
  body('collegeIds')
    .isArray({ min: 1, max: 10 })
    .withMessage('Please provide 1-10 college IDs'),
  body('collegeIds.*')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  body('rank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Rank must be a positive integer'),
  body('category')
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const { collegeIds, rank, category } = req.body

    // Get cutoff data for specified colleges
    const cutoffs = await CutoffData.findAll({
      where: {
        collegeId: { [Op.in]: collegeIds },
        category
      },
      include: [
        {
          model: College,
          as: 'college',
          attributes: ['collegeId', 'name', 'location', 'ranking']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['courseId', 'courseName', 'duration', 'fees']
        }
      ],
      order: [['year', 'DESC']]
    })

    // Analyze cutoff trends and predict chances
    const analysis = rankPrediction.analyzeCutoffs(cutoffs, rank, category)

    res.json({
      success: true,
      rank,
      category,
      analysis
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Compare multiple colleges for a given rank
router.post('/compare', [
  body('comparisons')
    .isArray({ min: 2, max: 5 })
    .withMessage('Please provide 2-5 colleges to compare'),
  body('comparisons.*.collegeId')
    .isInt({ min: 1 })
    .withMessage('College ID must be a positive integer'),
  body('comparisons.*.courseId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  body('rank')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Rank must be a positive integer'),
  body('category')
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const { comparisons, rank, category } = req.body

    const comparisonResults = []

    for (const comparison of comparisons) {
      const { collegeId, courseId } = comparison

      const whereClause = {
        collegeId,
        category
      }

      if (courseId) {
        whereClause.courseId = courseId
      }

      const college = await College.findByPk(collegeId)
      if (!college) continue

      const cutoffs = await CutoffData.findAll({
        where: whereClause,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['courseId', 'courseName', 'duration', 'fees'],
            required: false
          }
        ],
        order: [['year', 'DESC']]
      })

      const analysis = rankPrediction.analyzeCollegeComparison(college, cutoffs, rank, category)
      comparisonResults.push(analysis)
    }

    // Sort by prediction probability
    comparisonResults.sort((a, b) => (b.probability || 0) - (a.probability || 0))

    res.json({
      success: true,
      rank,
      category,
      comparisons: comparisonResults
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get college trends and predictions
router.get('/trends/:collegeId', [
  query('courseId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  query('category')
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  query('years')
    .optional()
    .isInt({ min: 3, max: 6 })
    .withMessage('Years must be between 3 and 6')
], async (req, res) => {
  try {
    const { collegeId } = req.params
    const { courseId, category, years = 5 } = req.query

    const whereClause = {
      collegeId,
      category
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    const cutoffs = await CutoffData.findAll({
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
          attributes: ['courseId', 'courseName', 'duration', 'fees'],
          required: false
        }
      ],
      order: [['year', 'ASC']]
    })

    // Get data for the specified number of recent years
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - years + 1
    const recentCutoffs = cutoffs.filter(cutoff => cutoff.year >= startYear)

    const trends = rankPrediction.analyzeTrends(recentCutoffs, years)
    const predictions = rankPrediction.predictNextYearTrends(recentCutoffs)

    res.json({
      success: true,
      collegeId,
      categoryId: category,
      years: years,
      trends,
      predictions
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get recommended colleges for specific rank ranges
router.get('/recommendations/:rankRange', [
  query('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  query('courseType')
    .optional()
    .isIn(['Engineering', 'Medical', 'Management', 'Science', 'Arts'])
    .withMessage('Invalid course type')
], async (req, res) => {
  try {
    const { rankRange } = req.params
    const { category, courseType } = req.query

    // Parse rank range (e.g., "1-1000", "5000-10000")
    const [minRank, maxRank] = rankRange.split('-').map(rank => parseInt(rank))

    if (!minRank || !maxRank || minRank >= maxRank) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rank range format. Use format: minRank-maxRank (e.g., 1-1000)'
      })
    }

    const avgRank = Math.round((minRank + maxRank) / 2)
    const selectedCategory = category || 'General'

    const recommendations = await rankPrediction.getPredictions(avgRank, selectedCategory, {
      courseType,
      limit: 20
    })

    // Filter recommendations to fit within the rank range
    const filteredRecommendations = recommendations.filter(college => {
      const predictionRank = college.predictedRank || college.avgRank || 0
      return predictionRank >= minRank && predictionRank <= maxRank
    })

    res.json({
      success: true,
      rankRange: `${minRank}-${maxRank}`,
      category: selectedCategory,
      courseType,
      recommendations: filteredRecommendations,
      stats: {
        totalRecommendations: filteredRecommendations.length,
        avgRank,
        rangeWidth: maxRank - minRank
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router