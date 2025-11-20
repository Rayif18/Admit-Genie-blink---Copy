require('dotenv').config()
const { sequelize } = require('../config/db')
const { College, Course } = require('../models')

// Sample college data with realistic information
const colleges = [
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai, Maharashtra',
    accreditation: 'A+',
    ranking: 1,
    description: 'Premier engineering institute offering undergraduate, postgraduate, and doctoral programs in engineering, sciences, and management.'
  },
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, Delhi',
    accreditation: 'A+',
    ranking: 2,
    description: 'Leading engineering institution known for excellence in technical education, research, and innovation.'
  },
  {
    name: 'Indian Institute of Technology Madras',
    location: 'Chennai, Tamil Nadu',
    accreditation: 'A+',
    ranking: 3,
    description: 'Top engineering college offering world-class education and research opportunities in various engineering disciplines.'
  },
  {
    name: 'Indian Institute of Technology Kanpur',
    location: 'Kanpur, Uttar Pradesh',
    accreditation: 'A+',
    ranking: 4,
    description: 'Renowned engineering institute with strong focus on research and development in science and engineering.'
  },
  {
    name: 'Indian Institute of Technology Kharagpur',
    location: 'Kharagpur, West Bengal',
    accreditation: 'A+',
    ranking: 5,
    description: 'First IIT established in India, offering comprehensive engineering education with excellent research facilities.'
  },
  {
    name: 'Indian Institute of Technology Roorkee',
    location: 'Roorkee, Uttarakhand',
    accreditation: 'A+',
    ranking: 6,
    description: 'Historic engineering institute with strong legacy in civil engineering and infrastructure development.'
  },
  {
    name: 'Indian Institute of Technology Guwahati',
    location: 'Guwahati, Assam',
    accreditation: 'A+',
    ranking: 7,
    description: 'Premier engineering institute in Northeast India known for quality education and research.'
  },
  {
    name: 'Indian Institute of Technology Hyderabad',
    location: 'Hyderabad, Telangana',
    accreditation: 'A+',
    ranking: 8,
    description: 'Modern IIT with focus on interdisciplinary research and innovation in engineering.'
  },
  {
    name: 'Indian Institute of Technology Indore',
    location: 'Indore, Madhya Pradesh',
    accreditation: 'A+',
    ranking: 9,
    description: 'Emerging IIT with strong emphasis on research and industry collaboration.'
  },
  {
    name: 'Indian Institute of Technology (BHU) Varanasi',
    location: 'Varanasi, Uttar Pradesh',
    accreditation: 'A+',
    ranking: 10,
    description: 'Premier engineering institute with rich heritage and strong academic programs.'
  },
  {
    name: 'National Institute of Technology Tiruchirappalli',
    location: 'Tiruchirappalli, Tamil Nadu',
    accreditation: 'A+',
    ranking: 11,
    description: 'Top NIT known for excellent engineering education and research facilities.'
  },
  {
    name: 'National Institute of Technology Surathkal',
    location: 'Mangalore, Karnataka',
    accreditation: 'A+',
    ranking: 12,
    description: 'Leading NIT with strong focus on engineering education and beach-side campus.'
  },
  {
    name: 'National Institute of Technology Warangal',
    location: 'Warangal, Telangana',
    accreditation: 'A+',
    ranking: 13,
    description: 'Premier NIT with excellent infrastructure and research facilities.'
  },
  {
    name: 'National Institute of Technology Calicut',
    location: 'Calicut, Kerala',
    accreditation: 'A+',
    ranking: 14,
    description: 'Top NIT known for quality engineering education and campus placements.'
  },
  {
    name: 'National Institute of Technology Karnataka',
    location: 'Surathkal, Karnataka',
    accreditation: 'A+',
    ranking: 15,
    description: 'Leading NIT with strong industry connections and research programs.'
  },
  {
    name: 'International Institute of Information Technology Hyderabad',
    location: 'Hyderabad, Telangana',
    accreditation: 'A+',
    ranking: 16,
    description: 'Premier institute focused on information technology and computer science education.'
  },
  {
    name: 'Birla Institute of Technology and Science Pilani',
    location: 'Pilani, Rajasthan',
    accreditation: 'A+',
    ranking: 17,
    description: 'Top private engineering institute with excellent faculty and research programs.'
  },
  {
    name: 'Vellore Institute of Technology',
    location: 'Vellore, Tamil Nadu',
    accreditation: 'A+',
    ranking: 18,
    description: 'Leading private university with diverse engineering programs and international collaborations.'
  },
  {
    name: 'Delhi Technological University',
    location: 'New Delhi, Delhi',
    accreditation: 'A',
    ranking: 19,
    description: 'Premier state engineering university with strong industry connections.'
  },
  {
    name: 'College of Engineering Pune',
    location: 'Pune, Maharashtra',
    accreditation: 'A+',
    ranking: 20,
    description: 'Autonomous engineering college with excellent academic reputation and research output.'
  },
  {
    name: 'Jadavpur University Faculty of Engineering',
    location: 'Kolkata, West Bengal',
    accreditation: 'A+',
    ranking: 21,
    description: 'Leading state university with strong engineering programs and research facilities.'
  },
  {
    name: 'Institute of Technology BHU',
    location: 'Varanasi, Uttar Pradesh',
    accreditation: 'A+',
    ranking: 22,
    description: 'Historic engineering institution with diverse engineering disciplines.'
  },
  {
    name: 'Punjab Engineering College',
    location: 'Chandigarh, Punjab',
    accreditation: 'A',
    ranking: 23,
    description: 'Premier engineering institution with strong alumni network and research programs.'
  },
  {
    name: 'Malaviya National Institute of Technology Jaipur',
    location: 'Jaipur, Rajasthan',
    accreditation: 'A+',
    ranking: 24,
    description: 'Leading NIT with excellent infrastructure and research facilities.'
  },
  {
    name: 'National Institute of Technology Rourkela',
    location: 'Rourkela, Odisha',
    accreditation: 'A+',
    ranking: 25,
    description: 'Premier NIT with strong focus on engineering education and research.'
  }
]

const courses = [
  // Common engineering courses
  { courseName: 'Computer Science and Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 250000 },
  { courseName: 'Electronics and Communication Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 220000 },
  { courseName: 'Electrical Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 200000 },
  { courseName: 'Mechanical Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 210000 },
  { courseName: 'Civil Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 180000 },
  { courseName: 'Chemical Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 230000 },
  { courseName: 'Aerospace Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 280000 },
  { courseName: 'Information Technology', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 240000 },
  { courseName: 'Biotechnology Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 260000 },
  { courseName: 'Artificial Intelligence and Machine Learning', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 300000 },
  { courseName: 'Data Science and Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 290000 },
  { courseName: 'Internet of Things', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 270000 },
  { courseName: 'Cyber Security', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 285000 },
  { courseName: 'Robotics and Automation', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 275000 },
  { courseName: 'Environmental Engineering', duration: '4 years', eligibility: '10+2 with Physics, Chemistry, Mathematics', fees: 190000 }
]

const seedColleges = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    console.log('🔄 Clearing existing data...')
    await College.destroy({ where: {} })
    await Course.destroy({ where: {} })

    console.log('🔄 Seeding colleges...')
    const createdColleges = await College.bulkCreate(colleges)
    console.log(`✅ Created ${createdColleges.length} colleges`)

    console.log('🔄 Seeding courses for each college...')
    const coursesToCreate = []

    createdColleges.forEach(college => {
      // Assign 8-12 random courses to each college
      const numCourses = Math.floor(Math.random() * 5) + 8 // 8-12 courses
      const selectedCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, numCourses)

      selectedCourses.forEach(course => {
        coursesToCreate.push({
          ...course,
          collegeId: college.collegeId,
          // Vary fees slightly for different colleges (±20%)
          fees: Math.round(course.fees * (0.8 + Math.random() * 0.4)),
          intake: Math.floor(Math.random() * 80) + 20 // 20-100 students
        })
      })
    })

    const createdCourses = await Course.bulkCreate(coursesToCreate)
    console.log(`✅ Created ${createdCourses.length} courses across all colleges`)

    console.log('\n🎉 College and course seeding completed successfully!')
    console.log(`📊 Created ${createdColleges.length} colleges with ${createdCourses.length} total courses`)

  } catch (error) {
    console.error('❌ College seeding failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('🔐 Database connection closed')
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedColleges()
}

module.exports = seedColleges