const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const { Admin, User, College, Course, CutoffData, ExamSchedule, ChatHistory } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const generateToken = require('../utils/generateToken')

const sanitizeAdmin = (admin) => {
  const data = admin.get({ plain: true })
  delete data.password
  return data
}

exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  if (!process.env.ADMIN_REGISTRATION_KEY) {
    return res.status(500).json({ success: false, message: 'Admin registration key not configured on server' })
  }

  const { username, password, registrationKey, role = 'admin' } = req.body

  if (registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid registration key' })
  }

  const existing = await Admin.scope('withPassword').findOne({ where: { username } })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Username already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const admin = await Admin.create({ username, password: hashedPassword, role })

  const token = generateToken({ id: admin.adminId, role: 'admin', scope: role })

  res.status(201).json({
    success: true,
    token,
    admin: sanitizeAdmin(admin)
  })
})

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  const { username, password } = req.body

  const admin = await Admin.scope('withPassword').findOne({ where: { username } })
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, admin.password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = generateToken({ id: admin.adminId, role: 'admin', scope: admin.role })

  res.json({
    success: true,
    token,
    admin: sanitizeAdmin(admin)
  })
})

exports.getDashboardStats = asyncHandler(async (_req, res) => {
  const [users, colleges, courses, cutoffs, exams, chats] = await Promise.all([
    User.count(),
    College.count(),
    Course.count(),
    CutoffData.count(),
    ExamSchedule.count(),
    ChatHistory.count()
  ])

  res.json({
    success: true,
    stats: {
      totals: { users, colleges, courses, cutoffs, exams, chats }
    }
  })
})

