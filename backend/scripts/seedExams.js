require('dotenv').config()
const { sequelize } = require('../config/db')
const { ExamSchedule } = require('../models')

// Sample exam schedule data for 2024-2025
const exams = [
  {
    examName: 'JEE-Main 2025 Session 1',
    registrationStart: new Date('2024-11-01'),
    registrationEnd: new Date('2024-12-15'),
    examDate: new Date('2025-01-24'),
    resultDate: new Date('2025-02-12'),
    description: 'Joint Entrance Examination (Main) Session 1 for admission to NITs, IIITs, and other engineering colleges.'
  },
  {
    examName: 'JEE-Main 2025 Session 2',
    registrationStart: new Date('2025-02-02'),
    registrationEnd: new Date('2025-03-22'),
    examDate: new Date('2025-04-04'),
    resultDate: new Date('2025-04-25'),
    description: 'Joint Entrance Examination (Main) Session 2 for admission to NITs, IIITs, and other engineering colleges.'
  },
  {
    examName: 'JEE-Advanced 2025',
    registrationStart: new Date('2025-04-28'),
    registrationEnd: new Date('2025-05-07'),
    examDate: new Date('2025-05-25'),
    resultDate: new Date('2025-06-18'),
    description: 'Joint Entrance Examination (Advanced) for admission to IITs.'
  },
  {
    examName: 'MHT-CET 2025',
    registrationStart: new Date('2025-01-15'),
    registrationEnd: new Date('2025-03-15'),
    examDate: new Date('2025-04-16'),
    resultDate: new Date('2025-06-10'),
    description: 'Maharashtra Common Entrance Test for admission to engineering and pharmacy colleges in Maharashtra.'
  },
  {
    examName: 'KCET 2025',
    registrationStart: new Date('2025-01-20'),
    registrationEnd: new Date('2025-02-28'),
    examDate: new Date('2025-04-18'),
    resultDate: new Date('2025-05-20'),
    description: 'Karnataka Common Entrance Test for admission to engineering, pharmacy, and other professional courses in Karnataka.'
  },
  {
    examName: 'WBJEE 2025',
    registrationStart: new Date('2024-12-24'),
    registrationEnd: new Date('2025-01-28'),
    examDate: new Date('2025-04-28'),
    resultDate: new Date('2025-06-03'),
    description: 'West Bengal Joint Entrance Examination for admission to engineering colleges in West Bengal.'
  },
  {
    examName: 'AP EAMCET 2025',
    registrationStart: new Date('2025-02-14'),
    registrationEnd: new Date('2025-03-15'),
    examDate: new Date('2025-05-19'),
    resultDate: new Date('2025-06-05'),
    description: 'Andhra Pradesh Engineering, Agriculture and Medical Common Entrance Test.'
  },
  {
    examName: 'TS EAMCET 2025',
    registrationStart: new Date('2025-02-21'),
    registrationEnd: new Date('2025-04-15'),
    examDate: new Date('2025-05-02'),
    resultDate: new Date('2025-05-28'),
    description: 'Telangana State Engineering, Agriculture and Medical Common Entrance Test.'
  },
  {
    examName: 'JEECUP 2025',
    registrationStart: new Date('2025-01-08'),
    registrationEnd: new Date('2025-02-20'),
    examDate: new Date('2025-03-16'),
    resultDate: new Date('2025-04-20'),
    description: 'Joint Entrance Examination Council Uttar Pradesh for admission to polytechnic colleges in UP.'
  },
  {
    examName: 'UPCET 2025',
    registrationStart: new Date('2025-01-15'),
    registrationEnd: new Date('2025-03-15'),
    examDate: new Date('2025-04-20'),
    resultDate: new Date('2025-05-25'),
    description: 'Uttar Pradesh Combined Entrance Test for admission to engineering colleges in UP.'
  },
  {
    examName: 'KEAM 2025',
    registrationStart: new Date('2025-02-01'),
    registrationEnd: new Date('2025-03-31'),
    examDate: new Date('2025-04-24'),
    resultDate: new Date('2025-06-15'),
    description: 'Kerala Engineering Architecture Medical Entrance Examination for admission to professional colleges in Kerala.'
  },
  {
    examName: 'GATE 2025',
    registrationStart: new Date('2024-08-24'),
    registrationEnd: new Date('2024-10-11'),
    examDate: new Date('2025-02-02'),
    resultDate: new Date('2025-03-16'),
    description: 'Graduate Aptitude Test in Engineering for admission to M.Tech and Ph.D. programs.'
  },
  {
    examName: 'BITSAT 2025 Session 1',
    registrationStart: new Date('2025-01-15'),
    registrationEnd: new Date('2025-04-15'),
    examDate: new Date('2025-05-20'),
    resultDate: new Date('2025-06-05'),
    description: 'BITS Admission Test Session 1 for admission to BITS Pilani, BITS Goa, and BITS Hyderabad.'
  },
  {
    examName: 'SRMJEEE 2025',
    registrationStart: new Date('2024-11-01'),
    registrationEnd: new Date('2025-03-15'),
    examDate: new Date('2025-04-17'),
    resultDate: new Date('2025-05-01'),
    description: 'SRM Joint Engineering Entrance Examination for admission to SRM Institute of Science and Technology.'
  },
  {
    examName: 'VITEEE 2025',
    registrationStart: new Date('2024-11-01'),
    registrationEnd: new Date('2025-03-31'),
    examDate: new Date('2025-04-30'),
    resultDate: new Date('2025-05-15'),
    description: 'VIT Engineering Entrance Examination for admission to VIT Vellore, VIT Chennai, and VIT Bhopal.'
  },
  {
    examName: 'COMEDK 2025',
    registrationStart: new Date('2025-02-01'),
    registrationEnd: new Date('2025-04-15'),
    examDate: new Date('2025-05-12'),
    resultDate: new Date('2025-05-28'),
    description: 'Consortium of Medical, Engineering and Dental Colleges of Karnataka for admission to engineering colleges in Karnataka.'
  },
  {
    examName: 'JEE-Main 2026 Session 1',
    registrationStart: new Date('2025-11-01'),
    registrationEnd: new Date('2025-12-15'),
    examDate: new Date('2026-01-24'),
    resultDate: new Date('2026-02-12'),
    description: 'Joint Entrance Examination (Main) Session 1 for admission to NITs, IIITs, and other engineering colleges.'
  },
  {
    examName: 'GATE 2026',
    registrationStart: new Date('2025-08-24'),
    registrationEnd: new Date('2025-10-11'),
    examDate: new Date('2026-02-01'),
    resultDate: new Date('2026-03-16'),
    description: 'Graduate Aptitude Test in Engineering for admission to M.Tech and Ph.D. programs.'
  }
]

const seedExams = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    console.log('🔄 Clearing existing exam schedules...')
    await ExamSchedule.destroy({ where: {} })

    console.log('🔄 Seeding exam schedules...')
    const createdExams = await ExamSchedule.bulkCreate(exams)
    console.log(`✅ Created ${createdExams.length} exam schedules`)

    // Categorize exams by status
    const currentDate = new Date()
    let upcomingCount = 0
    let ongoingCount = 0
    let completedCount = 0

    createdExams.forEach(exam => {
      if (exam.examDate > currentDate) {
        upcomingCount++
      } else if (exam.resultDate > currentDate) {
        ongoingCount++
      } else {
        completedCount++
      }
    })

    console.log('\n🎉 Exam schedule seeding completed successfully!')
    console.log(`📊 Total Exams: ${createdExams.length}`)
    console.log(`📅 Upcoming Exams: ${upcomingCount}`)
    console.log(`🔄 Ongoing Exams: ${ongoingCount}`)
    console.log(`✅ Completed Exams: ${completedCount}`)

    // Show next few upcoming exams
    const upcomingExams = createdExams
      .filter(exam => exam.examDate > currentDate)
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
      .slice(0, 5)

    console.log('\n📋 Next 5 Upcoming Exams:')
    upcomingExams.forEach((exam, index) => {
      console.log(`   ${index + 1}. ${exam.examName} - ${exam.examDate.toLocaleDateString()}`)
    })

  } catch (error) {
    console.error('❌ Exam seeding failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('🔐 Database connection closed')
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedExams()
}

module.exports = seedExams