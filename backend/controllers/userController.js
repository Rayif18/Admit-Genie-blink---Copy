const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const { User } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const generateToken = require('../utils/generateToken')

const sanitizeUser = (user) => {
  const data = user.get({ plain: true })
  delete data.password
  return data
}

exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  const { name, email, password, educationLevel, preferences, cetRank, category } = req.body

  const existing = await User.scope('withPassword').findOne({ where: { email } })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    educationLevel,
    preferences,
    cetRank,
    category
  })

  const token = generateToken({ id: user.userId, role: 'user' })

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(user)
  })
})

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  const { email, password } = req.body

  const user = await User.scope('withPassword').findOne({ where: { email } })
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = generateToken({ id: user.userId, role: 'user' })

  res.json({
    success: true,
    token,
    user: sanitizeUser(user)
  })
})

exports.getProfile = asyncHandler(async (req, res) => {
  const refreshed = await User.findByPk(req.user.userId)
  res.json({ success: true, user: sanitizeUser(refreshed) })
})

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'educationLevel', 'preferences', 'cetRank', 'category']
  const updates = {}

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  })

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' })
  }

  await req.user.update(updates)
  res.json({ success: true, user: sanitizeUser(req.user) })
})

