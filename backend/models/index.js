const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const User = require('./User')(sequelize, DataTypes)
const Admin = require('./Admin')(sequelize, DataTypes)
const College = require('./College')(sequelize, DataTypes)
const Course = require('./Course')(sequelize, DataTypes)
const Admission = require('./Admission')(sequelize, DataTypes)
const CutoffData = require('./CutoffData')(sequelize, DataTypes)
const ExamSchedule = require('./ExamSchedule')(sequelize, DataTypes)
const ChatHistory = require('./ChatHistory')(sequelize, DataTypes)

// Associations
College.hasMany(Course, { foreignKey: 'collegeId', as: 'courses' })
Course.belongsTo(College, { foreignKey: 'collegeId', as: 'college' })

College.hasMany(Admission, { foreignKey: 'collegeId', as: 'admissions' })
Admission.belongsTo(College, { foreignKey: 'collegeId', as: 'college' })
Course.hasMany(Admission, { foreignKey: 'courseId', as: 'admissions' })
Admission.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })

College.hasMany(CutoffData, { foreignKey: 'collegeId', as: 'cutoffs' })
CutoffData.belongsTo(College, { foreignKey: 'collegeId', as: 'college' })
Course.hasMany(CutoffData, { foreignKey: 'courseId', as: 'cutoffs' })
CutoffData.belongsTo(Course, { foreignKey: 'courseId', as: 'course' })

User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chats' })
ChatHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' })

module.exports = {
  sequelize,
  User,
  Admin,
  College,
  Course,
  Admission,
  CutoffData,
  ExamSchedule,
  ChatHistory
}

