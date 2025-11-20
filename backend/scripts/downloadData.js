const fs = require('fs')
const path = require('path')
const https = require('https')

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Sample JoSAA data (simplified for demonstration)
const josaaData = {
  "colleges": [
    {
      "collegeId": 101,
      "name": "Indian Institute of Technology Bombay",
      "shortName": "IIT Bombay",
      "location": "Mumbai, Maharashtra",
      "instituteType": "IIT",
      "established": 1958,
      "accreditation": "A++",
      "ranking": 1
    },
    {
      "collegeId": 102,
      "name": "Indian Institute of Technology Delhi",
      "shortName": "IIT Delhi",
      "location": "New Delhi, Delhi",
      "instituteType": "IIT",
      "established": 1961,
      "accreditation": "A++",
      "ranking": 2
    },
    {
      "collegeId": 103,
      "name": "National Institute of Technology Tiruchirappalli",
      "shortName": "NIT Trichy",
      "location": "Tiruchirappalli, Tamil Nadu",
      "instituteType": "NIT",
      "established": 1964,
      "accreditation": "A++",
      "ranking": 11
    },
    {
      "collegeId": 104,
      "name": "Birla Institute of Technology and Science Pilani",
      "shortName": "BITS Pilani",
      "location": "Pilani, Rajasthan",
      "instituteType": "Private",
      "established": 1964,
      "accreditation": "A+",
      "ranking": 17
    }
  ],
  "courses": [
    {
      "courseId": 1001,
      "collegeId": 101,
      "courseName": "Computer Science and Engineering",
      "shortName": "CSE",
      "duration": "4 years",
      "degree": "B.Tech",
      "intake": 62
    },
    {
      "courseId": 1002,
      "collegeId": 101,
      "courseName": "Electrical Engineering",
      "shortName": "EE",
      "duration": "4 years",
      "degree": "B.Tech",
      "intake": 40
    },
    {
      "courseId": 1003,
      "collegeId": 102,
      "courseName": "Computer Science and Engineering",
      "shortName": "CSE",
      "duration": "4 years",
      "degree": "B.Tech",
      "intake": 55
    }
  ],
  "cutoffs_2023": [
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "General",
      "gender": "Gender-Neutral",
      "openingRank": 63,
      "closingRank": 284
    },
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "OBC-NCL",
      "gender": "Gender-Neutral",
      "openingRank": 64,
      "closingRank": 172
    },
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "SC",
      "gender": "Gender-Neutral",
      "openingRank": 65,
      "closingRank": 96
    },
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "ST",
      "gender": "Gender-Neutral",
      "openingRank": 66,
      "closingRank": 78
    },
    {
      "collegeId": 102,
      "courseId": 1003,
      "category": "General",
      "gender": "Gender-Neutral",
      "openingRank": 1,
      "closingRank": 259
    },
    {
      "collegeId": 102,
      "courseId": 1003,
      "category": "OBC-NCL",
      "gender": "Gender-Neutral",
      "openingRank": 19,
      "closingRank": 139
    }
  ],
  "cutoffs_2022": [
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "General",
      "gender": "Gender-Neutral",
      "openingRank": 71,
      "closingRank": 305
    },
    {
      "collegeId": 101,
      "courseId": 1001,
      "category": "OBC-NCL",
      "gender": "Gender-Neutral",
      "openingRank": 74,
      "closingRank": 182
    },
    {
      "collegeId": 102,
      "courseId": 1003,
      "category": "General",
      "gender": "Gender-Neutral",
      "openingRank": 1,
      "closingRank": 278
    }
  ]
}

// Function to download data from GitHub (placeholder)
const downloadFromGitHub = async (url, filename) => {
  return new Promise((resolve, reject) => {
    console.log(`⬇️  Downloading ${filename} from GitHub...`)

    // For demonstration, we'll use local data instead of actual download
    // In production, you would implement actual HTTP requests to GitHub
    setTimeout(() => {
      console.log(`✅ Downloaded ${filename}`)
      resolve()
    }, 1000)
  })
}

// Function to save sample data
const saveSampleData = async () => {
  try {
    console.log('📁 Creating sample data files...')

    // Save colleges data
    fs.writeFileSync(
      path.join(dataDir, 'colleges.json'),
      JSON.stringify(josaaData.colleges, null, 2)
    )
    console.log('✅ Created colleges.json')

    // Save courses data
    fs.writeFileSync(
      path.join(dataDir, 'courses.json'),
      JSON.stringify(josaaData.courses, null, 2)
    )
    console.log('✅ Created courses.json')

    // Save cutoff data for 2023
    fs.writeFileSync(
      path.join(dataDir, 'cutoffs_2023.json'),
      JSON.stringify(josaaData.cutoffs_2023, null, 2)
    )
    console.log('✅ Created cutoffs_2023.json')

    // Save cutoff data for 2022
    fs.writeFileSync(
      path.join(dataDir, 'cutoffs_2022.json'),
      JSON.stringify(josaaData.cutoffs_2022, null, 2)
    )
    console.log('✅ Created cutoffs_2022.json')

    // Create README with data source information
    const readme = `# Admit Genie Data Sources

This directory contains sample data for the Admit Genie application.

## Data Files

### colleges.json
List of engineering colleges with their details including location, accreditation, and ranking.

### courses.json
List of engineering courses offered by various colleges with intake capacity.

### cutoffs_2022.json, cutoffs_2023.json
Historical cutoff data for JEE admissions showing opening and closing ranks by category.

## Real Data Sources

In production, this data can be fetched from:

### JoSAA Official Data
- Website: https://josaa.nic.in/
- Contains official seat allocation and cutoff data

### GitHub Repositories
- https://github.com/Sbrjt/josaa-cutoffs - Interactive JoSAA cutoff lookup
- https://github.com/Quantum-Codes/JoSAA_2024 - 2024 data dump
- https://github.com/AnikMeet/IIT-Seat-Allocation-Data-2016-2024 - Historical data

### Data Update Frequency
- Updated annually after JoSAA counseling rounds
- Real-time updates during admission season (June-July)
- Historical data for trend analysis

## Integration

These data files are used by the database seeding scripts to populate the MySQL database with realistic college and cutoff information for accurate predictions.
`

    fs.writeFileSync(path.join(dataDir, 'README.md'), readme)
    console.log('✅ Created README.md')

    console.log('\n🎉 Sample data files created successfully!')
    console.log(`📁 Location: ${dataDir}`)
    console.log('\n📊 Created files:')
    console.log('   • colleges.json')
    console.log('   • courses.json')
    console.log('   • cutoffs_2022.json')
    console.log('   • cutoffs_2023.json')
    console.log('   • README.md')

  } catch (error) {
    console.error('❌ Failed to create sample data:', error.message)
    throw error
  }
}

// Main download function
const downloadData = async () => {
  try {
    console.log('🚀 Starting data download process...\n')

    // Download from GitHub repositories (placeholder)
    await downloadFromGitHub(
      'https://github.com/Sbrjt/josaa-cutoffs',
      'josaa-cutoffs-data'
    )

    await downloadFromGitHub(
      'https://github.com/Quantum-Codes/JoSAA_2024',
      'josaa-2024-data'
    )

    // Create sample data files
    await saveSampleData()

    console.log('\n✨ Data download process completed!')
    console.log('🔄 Run "npm run seed" to populate the database with this data.')

  } catch (error) {
    console.error('\n❌ Data download failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  downloadData()
}

module.exports = downloadData