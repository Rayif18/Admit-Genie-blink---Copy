require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { sequelize } = require('./config/db')

// Import routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const collegeRoutes = require('./routes/collegeRoutes')
const courseRoutes = require('./routes/courseRoutes')
const cutoffRoutes = require('./routes/cutoffRoutes')
const examRoutes = require('./routes/examRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const predictionRoutes = require('./routes/predictionRoutes')
const adminRoutes = require('./routes/adminRoutes')

// Import middleware
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cometapi.com"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/colleges', collegeRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/cutoffs', cutoffRoutes)
app.use('/api/exams', examRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.use('/api/predict', predictionRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`)

  server.close(() => {
    console.log('✅ HTTP server closed')

    sequelize.close().then(() => {
      console.log('✅ Database connection closed')
      process.exit(0)
    }).catch((error) => {
      console.error('❌ Error closing database connection:', error.message)
      process.exit(1)
    })
  })
}

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    // Sync database models (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('✅ Database models synchronized')
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📡 Health check: http://localhost:${PORT}/health`)
      console.log(`📚 API docs: http://localhost:${PORT}/api`)
    })

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    return server

  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message)
  console.error(error.stack)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  console.error(reason.stack || reason)
  process.exit(1)
})

// Start the server
if (require.main === module) {
  startServer()
}

module.exports = app