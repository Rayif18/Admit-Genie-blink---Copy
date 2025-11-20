require('dotenv').config()

const initDatabase = require('./initDatabase')
const seedColleges = require('./seedColleges')
const seedCutoffs = require('./seedCutoffs')
const seedExams = require('./seedExams')

const seedAllData = async () => {
  try {
    console.log('🚀 Starting complete database seeding process...\n')

    // Step 1: Initialize database schema
    console.log('📋 Step 1/4: Initializing database schema')
    await initDatabase()
    console.log('✅ Database schema initialized\n')

    // Step 2: Seed colleges and courses
    console.log('🏛️ Step 2/4: Seeding colleges and courses')
    await seedColleges()
    console.log('✅ Colleges and courses seeded\n')

    // Step 3: Seed cutoff data
    console.log('📊 Step 3/4: Seeding cutoff data')
    await seedCutoffs()
    console.log('✅ Cutoff data seeded\n')

    // Step 4: Seed exam schedules
    console.log('📅 Step 4/4: Seeding exam schedules')
    await seedExams()
    console.log('✅ Exam schedules seeded\n')

    console.log('🎉 Complete database seeding process finished successfully!')
    console.log('📊 Your Admit Genie database is now ready with:')
    console.log('   • 25+ top engineering colleges')
    console.log('   • 15 different engineering courses')
    console.log('   • Historical cutoff data (2019-2024)')
    console.log('   • Upcoming exam schedules (2024-2026)')
    console.log('\n🚀 You can now start the server with: npm run dev')

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedAllData()
}

module.exports = seedAllData