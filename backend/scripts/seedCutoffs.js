require('dotenv').config()
const { sequelize } = require('../config/db')
const { College, Course, CutoffData } = require('../models')

// Generate realistic cutoff data based on college rankings
const generateCutoffData = async () => {
  const colleges = await College.findAll({
    include: [
      {
        model: Course,
        as: 'courses',
        attributes: ['courseId', 'courseName']
      }
    ]
  })

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS']
  const years = [2019, 2020, 2021, 2022, 2023, 2024]
  const cutoffs = []

  colleges.forEach(college => {
    college.courses.forEach(course => {
      years.forEach(year => {
        categories.forEach(category => {
          // Generate realistic cutoff ranges based on college ranking and course demand
          let baseRank = college.ranking * 1000

          // Adjust based on course demand
          if (course.courseName.includes('Computer Science') ||
              course.courseName.includes('Artificial Intelligence') ||
              course.courseName.includes('Data Science')) {
            baseRank *= 0.3 // High demand courses have lower rank requirements
          } else if (course.courseName.includes('Electronics') ||
                     course.courseName.includes('Information Technology')) {
            baseRank *= 0.5
          } else if (course.courseName.includes('Mechanical') ||
                     course.courseName.includes('Electrical') ||
                     course.courseName.includes('Chemical')) {
            baseRank *= 0.7
          } else if (course.courseName.includes('Civil')) {
            baseRank *= 1.2 // Lower demand courses have higher rank requirements
          }

          // Add some randomness and year-to-year variation
          const yearVariation = 1 + (Math.random() - 0.5) * 0.2 // ±10% variation

          // Category multipliers (General has highest cutoff, SC/ST have lower)
          const categoryMultiplier = {
            'General': 1.0,
            'OBC': 1.5,
            'EWS': 1.8,
            'SC': 2.5,
            'ST': 3.5
          }[category]

          const adjustedRank = Math.round(baseRank * categoryMultiplier * yearVariation)

          // Generate min, max, and avg ranks with some variation
          const variation = 0.15 // 15% variation
          const minRank = Math.round(adjustedRank * (1 - variation))
          const maxRank = Math.round(adjustedRank * (1 + variation))
          const avgRank = adjustedRank

          // Ensure ranks are positive and reasonable
          const finalMinRank = Math.max(1, Math.min(minRank, 1000000))
          const finalMaxRank = Math.max(finalMinRank, Math.min(maxRank, 1000000))
          const finalAvgRank = Math.max(finalMinRank, Math.min(avgRank, 1000000))

          cutoffs.push({
            collegeId: college.collegeId,
            courseId: course.courseId,
            category,
            year,
            minRank: finalMinRank,
            maxRank: finalMaxRank,
            avgRank: finalAvgRank
          })
        })
      })
    })
  })

  return cutoffs
}

const seedCutoffs = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    console.log('🔄 Clearing existing cutoff data...')
    await CutoffData.destroy({ where: {} })

    console.log('🔄 Generating realistic cutoff data...')
    const cutoffsData = await generateCutoffData()
    console.log(`✅ Generated ${cutoffsData.length} cutoff records`)

    console.log('🔄 Seeding cutoff data to database...')
    const chunkSize = 1000
    let totalInserted = 0

    for (let i = 0; i < cutoffsData.length; i += chunkSize) {
      const chunk = cutoffsData.slice(i, i + chunkSize)
      await CutoffData.bulkCreate(chunk, { logging: false })
      totalInserted += chunk.length

      if ((i + chunkSize) % 5000 === 0 || i + chunkSize >= cutoffsData.length) {
        console.log(`📊 Inserted ${totalInserted}/${cutoffsData.length} records...`)
      }
    }

    console.log('\n🎉 Cutoff data seeding completed successfully!')
    console.log(`📊 Created ${totalInserted} cutoff records`)

    // Show some statistics
    const stats = await CutoffData.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('cutoffId')), 'totalRecords'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('collegeId'))), 'totalColleges'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('courseId'))), 'totalCourses'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('year'))), 'totalYears']
      ],
      raw: true
    })

    console.log('\n📈 Database Statistics:')
    console.log(`   Total Cutoff Records: ${stats[0].totalRecords}`)
    console.log(`   Colleges with Cutoffs: ${stats[0].totalColleges}`)
    console.log(`   Courses with Cutoffs: ${stats[0].totalCourses}`)
    console.log(`   Years Covered: ${stats[0].totalYears}`)

  } catch (error) {
    console.error('❌ Cutoff seeding failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('🔐 Database connection closed')
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedCutoffs()
}

module.exports = seedCutoffs