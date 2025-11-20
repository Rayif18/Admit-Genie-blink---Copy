require('dotenv').config()
const { sequelize } = require('../config/db')
const { User, Admin, College, Course, Admission, CutoffData, ExamSchedule, ChatHistory } = require('../models')

const initDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    console.log('🔄 Creating database tables...')
    await sequelize.sync({ force: true })
    console.log('✅ Database tables created successfully')

    console.log('🔄 Creating indexes for better performance...')

    // Create custom indexes for better query performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_colleges_location ON colleges(location);
      CREATE INDEX IF NOT EXISTS idx_colleges_ranking ON colleges(ranking);
      CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
      CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(course_name);
      CREATE INDEX IF NOT EXISTS idx_cutoffs_college_course ON cutoff_data(college_id, course_id);
      CREATE INDEX IF NOT EXISTS idx_cutoffs_year_category ON cutoff_data(year, category);
      CREATE INDEX IF NOT EXISTS idx_cutoffs_ranks ON cutoff_data(min_rank, max_rank, avg_rank);
      CREATE INDEX IF NOT EXISTS idx_exams_date ON exam_schedules(exam_date);
      CREATE INDEX IF NOT EXISTS idx_exams_registration ON exam_schedules(registration_start, registration_end);
      CREATE INDEX IF NOT EXISTS idx_chat_user_timestamp ON chat_history(user_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_chat_intent ON chat_history(intent);
    `)

    console.log('✅ Database indexes created successfully')

    console.log('\n🎉 Database initialization completed successfully!')
    console.log('📊 Database schema is ready for seeding')

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('🔐 Database connection closed')
  }
}

// Run initialization if called directly
if (require.main === module) {
  initDatabase()
}

module.exports = initDatabase