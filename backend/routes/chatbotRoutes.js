const express = require('express')
const { body, query } = require('express-validator')
const { ChatHistory, User, College, Course, CutoffData, ExamSchedule } = require('../models')
const { Op } = require('sequelize')
const intentHandler = require('../utils/intentHandler')
const llmClient = require('../utils/llmClient')

const router = express.Router()

// Chat endpoint - main chatbot interaction
router.post('/chat', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
], async (req, res) => {
  try {
    const { message, userId } = req.body
    const timestamp = new Date()

    // Detect intent and extract entities
    const intent = await intentHandler.detectIntent(message)
    const entities = await intentHandler.extractEntities(message)

    let response = null
    let data = null

    // Handle intent-specific responses
    switch (intent.type) {
      case 'college_info':
        if (entities.colleges && entities.colleges.length > 0) {
          data = await College.findAll({
            where: {
              [Op.or]: entities.colleges.map(college => ({
                name: { [Op.like]: `%${college}%` }
              }))
            },
            include: [
              {
                model: Course,
                as: 'courses',
                attributes: ['courseId', 'courseName', 'duration', 'fees']
              }
            ],
            limit: 5
          })

          response = intentHandler.formatCollegeResponse(data, intent)
        } else {
          response = "I can help you with college information! Could you please specify which college you'd like to know about?"
        }
        break

      case 'course_info':
        if (entities.courses && entities.courses.length > 0) {
          data = await Course.findAll({
            where: {
              [Op.or]: entities.courses.map(course => ({
                courseName: { [Op.like]: `%${course}%` }
              }))
            },
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['collegeId', 'name', 'location', 'ranking']
              }
            ],
            limit: 5
          })

          response = intentHandler.formatCourseResponse(data, intent)
        } else {
          response = "I can help you with course information! Which course are you interested in learning about?"
        }
        break

      case 'cutoff_prediction':
        if (entities.rank && entities.category) {
          const rankPrediction = require('../utils/rankPrediction')
          const predictions = await rankPrediction.getPredictions(entities.rank, entities.category)

          data = predictions
          response = intentHandler.formatPredictionResponse(predictions, entities.rank, entities.category)
        } else {
          response = "To provide college predictions, I need your rank and category. Could you please provide both?"
        }
        break

      case 'exam_schedule':
        const exams = await ExamSchedule.findAll({
          where: {
            examName: {
              [Op.like]: entities.exams && entities.exams.length > 0
                ? `%${entities.exams[0]}%`
                : '%'
            }
          },
          order: [['examDate', 'ASC']],
          limit: 10
        })

        data = exams
        response = intentHandler.formatExamResponse(exams, intent)
        break

      case 'fees_info':
        if (entities.colleges && entities.colleges.length > 0) {
          data = await Course.findAll({
            include: [
              {
                model: College,
                as: 'college',
                where: {
                  [Op.or]: entities.colleges.map(college => ({
                    name: { [Op.like]: `%${college}%` }
                  }))
                },
                attributes: ['collegeId', 'name', 'location']
              }
            ],
            order: [['fees', 'ASC']],
            limit: 10
          })

          response = intentHandler.formatFeesResponse(data, intent)
        } else {
          response = "I can help you with fee information! Which college or course would you like to know the fees for?"
        }
        break

      case 'eligibility':
        if (entities.courses && entities.courses.length > 0) {
          data = await Course.findAll({
            where: {
              [Op.or]: entities.courses.map(course => ({
                courseName: { [Op.like]: `%${course}%` }
              }))
            },
            include: [
              {
                model: College,
                as: 'college',
                attributes: ['collegeId', 'name', 'location']
              }
            ],
            limit: 5
          })

          response = intentHandler.formatEligibilityResponse(data, intent)
        } else {
          response = "I can help you with eligibility information! Which course would you like to know the eligibility criteria for?"
        }
        break

      case 'general':
      default:
        // Use LLM for general queries
        try {
          const llmResponse = await llmClient.generateResponse(message, {
            context: 'college_admission_assistant',
            userRank: entities.rank,
            userCategory: entities.category
          })
          response = llmResponse
        } catch (llmError) {
          // Fallback to rule-based response
          response = intentHandler.getGeneralResponse(message, intent)
        }
        break
    }

    // Save chat history if user is authenticated
    if (userId) {
      await ChatHistory.create({
        userId,
        queryText: message,
        botResponse: response,
        timestamp,
        intent: intent.type,
        entities: JSON.stringify(entities)
      })
    }

    res.json({
      success: true,
      response,
      intent: intent.type,
      confidence: intent.confidence,
      data,
      entities
    })
  } catch (error) {
    console.error('Chatbot error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      message: 'Something went wrong. Please try again.'
    })
  }
})

// Get chat history for a user
router.get('/history', [
  query('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const userId = parseInt(req.query.userId)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows: chats } = await ChatHistory.findAndCountAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
      offset
    })

    res.json({
      success: true,
      data: chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalChats: count,
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

// Get chat analytics for a user
router.get('/analytics/:userId', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const days = parseInt(req.query.days) || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const chats = await ChatHistory.findAll({
      where: {
        userId,
        timestamp: { [Op.gte]: startDate }
      },
      attributes: ['intent', 'timestamp', 'entities']
    })

    // Analyze chat patterns
    const analytics = intentHandler.analyzeChatPatterns(chats)

    res.json({
      success: true,
      userId,
      period: `${days} days`,
      analytics
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Submit chat feedback
router.post('/feedback', [
  body('chatId')
    .isInt({ min: 1 })
    .withMessage('Chat ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters')
], async (req, res) => {
  try {
    const { chatId, rating, feedback } = req.body

    // In a real implementation, you'd save this to a feedback table
    // For now, just return success
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        chatId,
        rating,
        feedback,
        timestamp: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get suggested questions based on user context
router.get('/suggestions', [
  query('intent')
    .optional()
    .isIn(['college_info', 'course_info', 'cutoff_prediction', 'exam_schedule', 'fees_info', 'eligibility'])
    .withMessage('Invalid intent type'),
  query('category')
    .optional()
    .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
    .withMessage('Invalid category'),
  query('rank')
    .optional()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Rank must be a positive integer')
], async (req, res) => {
  try {
    const { intent, category, rank } = req.query

    const suggestions = await intentHandler.getSuggestedQuestions({
      intent,
      category,
      rank
    })

    res.json({
      success: true,
      suggestions
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router