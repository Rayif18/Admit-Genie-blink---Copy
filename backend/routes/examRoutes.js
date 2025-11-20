const express = require('express')
const { query, param } = require('express-validator')
const { ExamSchedule, College, Course, Admission } = require('../models')
const { Op } = require('sequelize')

const router = express.Router()

// Get all exam schedules with pagination and filters
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
  query('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed', 'all'])
    .withMessage('Invalid status'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2024, max: 2026 })
    .withMessage('Year must be between 2024 and 2026')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit
    const { search, status, month, year } = req.query

    const whereClause = {}
    const currentDate = new Date()

    // Filter by status
    if (status === 'upcoming') {
      whereClause.examDate = { [Op.gt]: currentDate }
    } else if (status === 'ongoing') {
      whereClause.registrationStart = { [Op.lte]: currentDate }
      whereClause.resultDate = { [Op.gte]: currentDate }
    } else if (status === 'completed') {
      whereClause.resultDate = { [Op.lt]: currentDate }
    }

    // Filter by month and year
    if (year) {
      whereClause[Op.and] = []
      if (month) {
        whereClause[Op.and].push(
          { examDate: { [Op.gte]: new Date(year, month - 1, 1) } },
          { examDate: { [Op.lt]: new Date(year, month, 1) } }
        )
      } else {
        whereClause[Op.and].push(
          { examDate: { [Op.gte]: new Date(year, 0, 1) } },
          { examDate: { [Op.lt]: new Date(year + 1, 0, 1) } }
        )
      }
    }

    // Search filter
    if (search) {
      whereClause.examName = { [Op.like]: `%${search}%` }
    }

    const { count, rows: exams } = await ExamSchedule.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['examDate', 'ASC']]
    })

    res.json({
      success: true,
      data: exams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalExams: count,
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

// Get exam by ID
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Exam ID must be a positive integer')
], async (req, res) => {
  try {
    const exam = await ExamSchedule.findByPk(req.params.id, {
      include: [
        {
          model: Admission,
          as: 'admissions',
          include: [
            {
              model: College,
              as: 'college',
              attributes: ['collegeId', 'name', 'location']
            },
            {
              model: Course,
              as: 'course',
              attributes: ['courseId', 'courseName', 'duration']
            }
          ]
        }
      ]
    })

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      })
    }

    res.json({
      success: true,
      data: exam
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get upcoming exams (next 30 days)
router.get('/upcoming/next30', async (req, res) => {
  try {
    const today = new Date()
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const exams = await ExamSchedule.findAll({
      where: {
        examDate: {
          [Op.between]: [today, thirtyDaysLater]
        }
      },
      order: [['examDate', 'ASC']],
      limit: 20
    })

    res.json({
      success: true,
      data: exams,
      count: exams.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get exams with registration open
router.get('/registration/open', async (req, res) => {
  try {
    const today = new Date()

    const exams = await ExamSchedule.findAll({
      where: {
        registrationStart: {
          [Op.lte]: today
        },
        registrationEnd: {
          [Op.gte]: today
        }
      },
      order: [['registrationEnd', 'ASC']],
      limit: 20
    })

    res.json({
      success: true,
      data: exams,
      count: exams.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get exam calendar (monthly view)
router.get('/calendar/:year/:month', [
  param('year')
    .isInt({ min: 2024, max: 2026 })
    .withMessage('Invalid year'),
  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid month')
], async (req, res) => {
  try {
    const { year, month } = req.params
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const exams = await ExamSchedule.findAll({
      where: {
        [Op.or]: [
          { examDate: { [Op.between]: [startDate, endDate] } },
          { registrationStart: { [Op.between]: [startDate, endDate] } },
          { registrationEnd: { [Op.between]: [startDate, endDate] } }
        ]
      },
      order: [['examDate', 'ASC']]
    })

    // Group exams by type and date
    const calendar = exams.reduce((acc, exam) => {
      const examDate = exam.examDate.toISOString().split('T')[0]
      const regStart = exam.registrationStart.toISOString().split('T')[0]
      const regEnd = exam.registrationEnd.toISOString().split('T')[0]

      if (!acc[examDate]) acc[examDate] = []
      if (!acc[regStart]) acc[regStart] = []
      if (!acc[regEnd]) acc[regEnd] = []

      acc[examDate].push({ ...exam.get({ plain: true }), type: 'exam' })
      acc[regStart].push({ ...exam.get({ plain: true }), type: 'registration_start' })
      acc[regEnd].push({ ...exam.get({ plain: true }), type: 'registration_end' })

      return acc
    }, {})

    res.json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      calendar
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router