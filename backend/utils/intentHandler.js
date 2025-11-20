const CATEGORY_KEYWORDS = ['open', 'obc', 'sc', 'st', 'ews', 'sebc', 'nt-a', 'nt-b', 'nt-c', 'nt-d', 'vsp', 'vjnt']

const INTENT_KEYWORDS = [
  { intent: 'greeting', keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'] },
  { intent: 'college_info', keywords: ['college', 'institute', 'campus', 'location'] },
  { intent: 'course_info', keywords: ['course', 'program', 'branch', 'specialization'] },
  { intent: 'fees', keywords: ['fee', 'fees', 'tuition', 'cost'] },
  { intent: 'eligibility', keywords: ['eligibility', 'criteria', 'requirement', 'qualification'] },
  { intent: 'admission', keywords: ['admission', 'apply', 'application', 'deadline'] },
  { intent: 'cutoff', keywords: ['cutoff', 'rank', 'cet', 'closing', 'opening'] },
  { intent: 'exam', keywords: ['exam', 'test', 'schedule', 'date', 'registration'] },
  { intent: 'scholarship', keywords: ['scholarship', 'financial aid', 'scholarships'] },
  { intent: 'comparison', keywords: ['compare', 'comparison', 'vs'] },
  { intent: 'general', keywords: [] }
]

const detectIntent = (message) => {
  const normalized = message.toLowerCase()
  for (const record of INTENT_KEYWORDS) {
    if (record.keywords.some((keyword) => normalized.includes(keyword))) {
      return record.intent
    }
  }
  return 'general'
}

const extractRank = (message) => {
  const rankMatch = message.match(/rank\s*(?:is|=)?\s*(\d{1,6})/) || message.match(/(\d{1,6})\s*rank/)
  if (rankMatch) {
    return Number(rankMatch[1])
  }
  return null
}

const extractCategory = (message) => {
  const normalized = message.toLowerCase()
  for (const keyword of CATEGORY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return keyword.toUpperCase()
    }
  }
  return null
}

const extractCourseName = (message) => {
  const courseKeywords = ['engineering', 'computer science', 'it', 'mechanical', 'civil', 'electronics', 'entc', 'electrical', 'mba', 'pharmacy', 'architecture']
  const normalized = message.toLowerCase()
  for (const keyword of courseKeywords) {
    if (normalized.includes(keyword)) {
      return keyword
    }
  }
  return null
}

const extractCollegeName = (message) => {
  const matches = message.match(/(?:in|at)\s+([A-Za-z\s&]{3,})/)
  if (matches) {
    return matches[1].trim()
  }
  return null
}

const buildSearchFilters = (message) => {
  const filters = {}
  const normalized = message.toLowerCase()

  if (normalized.includes('mumbai')) filters.location = 'Mumbai'
  if (normalized.includes('pune')) filters.location = 'Pune'
  if (normalized.includes('bangalore')) filters.location = 'Bangalore'
  if (normalized.includes('hyderabad')) filters.location = 'Hyderabad'

  const feeMatch = message.match(/below\s*₹?\s*(\d{2,6})/i) || message.match(/less than\s*₹?\s*(\d{2,6})/i)
  if (feeMatch) {
    filters.maxFees = Number(feeMatch[1])
  }

  return filters
}

const extractEntities = async (message) => {
  const normalized = message.toLowerCase()

  return {
    rank: extractRank(message),
    category: extractCategory(message),
    courses: extractCourseName(message) ? [extractCourseName(message)] : [],
    colleges: extractCollegeName(message) ? [extractCollegeName(message)] : [],
    exams: extractExamNames(message),
    fees: extractFees(message)
  }
}

const extractExamNames = (message) => {
  const normalized = message.toLowerCase()
  const exams = []

  if (normalized.includes('jee')) exams.push('JEE')
  if (normalized.includes('mht-cet') || normalized.includes('mhtcet')) exams.push('MHT-CET')
  if (normalized.includes('kcet')) exams.push('KCET')
  if (normalized.includes('wbjee')) exams.push('WBJEE')

  return exams
}

const extractFees = (message) => {
  const feeMatch = message.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/)
  if (feeMatch) {
    return parseInt(feeMatch[1].replace(/,/g, ''))
  }
  return null
}

const formatCollegeResponse = (colleges, intent) => {
  if (!colleges || colleges.length === 0) {
    return "I couldn't find any colleges matching your query. Could you please be more specific?"
  }

  let response = `Found ${colleges.length} college(s):\n\n`
  colleges.forEach((college, index) => {
    response += `${index + 1}. **${college.name}**\n`
    response += `   📍 Location: ${college.location}\n`
    response += `   🏆 Ranking: ${college.ranking}\n`
    response += `   ⭐ Accreditation: ${college.accreditation}\n`

    if (college.courses && college.courses.length > 0) {
      response += `   📚 Courses: ${college.courses.slice(0, 3).map(c => c.courseName).join(', ')}\n`
    }
    response += '\n'
  })

  response += "Would you like more details about any of these colleges?"
  return response
}

const formatCourseResponse = (courses, intent) => {
  if (!courses || courses.length === 0) {
    return "I couldn't find any courses matching your query. Could you please be more specific?"
  }

  let response = `Found ${courses.length} course(s):\n\n`
  courses.forEach((course, index) => {
    response += `${index + 1}. **${course.courseName}**\n`
    response += `   🏛️ College: ${course.college.name}, ${course.college.location}\n`
    response += `   ⏱️ Duration: ${course.duration}\n`
    response += `   💰 Fees: ₹${course.fees.toLocaleString()}\n`
    response += '\n'
  })

  response += "Would you like more details about any of these courses?"
  return response
}

const formatPredictionResponse = (predictions, rank, category) => {
  if (!predictions || predictions.length === 0) {
    return `I couldn't find any college predictions for rank ${rank} in ${category} category. Please check your inputs.`
  }

  let response = `🎯 College Predictions for Rank ${rank} (${category} Category):\n\n`

  if (predictions.safe && predictions.safe.length > 0) {
    response += `✅ **Safe Colleges** (High chance):\n`
    predictions.safe.forEach((college, index) => {
      response += `${index + 1}. ${college.name} - ${college.location}\n`
    })
    response += '\n'
  }

  if (predictions.medium && predictions.medium.length > 0) {
    response += `⚠️ **Medium Chance Colleges**:\n`
    predictions.medium.slice(0, 3).forEach((college, index) => {
      response += `${index + 1}. ${college.name} - ${college.location}\n`
    })
    response += '\n'
  }

  if (predictions.reach && predictions.reach.length > 0) {
    response += `🎯 **Reach Colleges** (Try your luck):\n`
    predictions.reach.slice(0, 2).forEach((college, index) => {
      response += `${index + 1}. ${college.name} - ${college.location}\n`
    })
  }

  response += '\n💡 *Predictions based on historical cutoff data. Actual results may vary.*'
  return response
}

const formatExamResponse = (exams, intent) => {
  if (!exams || exams.length === 0) {
    return "I couldn't find any upcoming exam schedules. Please check back later."
  }

  let response = `📅 Exam Schedule Information:\n\n`
  exams.slice(0, 5).forEach((exam, index) => {
    response += `${index + 1}. **${exam.examName}**\n`
    response += `   🗓️ Exam Date: ${exam.examDate.toLocaleDateString()}\n`
    response += `   📝 Registration: ${exam.registrationStart.toLocaleDateString()} - ${exam.registrationEnd.toLocaleDateString()}\n`
    response += `   📊 Result Date: ${exam.resultDate.toLocaleDateString()}\n\n`
  })

  return response
}

const formatFeesResponse = (courses, intent) => {
  if (!courses || courses.length === 0) {
    return "I couldn't find fee information. Could you please specify the college or course?"
  }

  let response = `💰 Fee Information:\n\n`
  courses.slice(0, 5).forEach((course, index) => {
    response += `${index + 1}. **${course.courseName}** at ${course.college.name}\n`
    response += `   💵 Total Fees: ₹${course.fees.toLocaleString()} (4 years)\n`
    response += `   📅 Per Year: ₹${Math.round(course.fees/4).toLocaleString()}\n\n`
  })

  return response
}

const formatEligibilityResponse = (courses, intent) => {
  if (!courses || courses.length === 0) {
    return "I couldn't find eligibility information. Could you please specify the course?"
  }

  let response = `📋 Eligibility Information:\n\n`
  courses.forEach((course, index) => {
    response += `${index + 1}. **${course.courseName}** at ${course.college.name}\n`
    response += `   📚 Eligibility: ${course.eligibility}\n`
    response += `   ⏱️ Duration: ${course.duration}\n\n`
  })

  return response
}

const getGeneralResponse = (message, intent) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('help')) {
    return `🤖 **I'm Admit Genie!** I can help you with:

📚 **College Information** - Details about engineering colleges
🔍 **Course Information** - Learn about different engineering branches
📊 **Rank Predictions** - Get college suggestions based on your JEE rank
📅 **Exam Schedules** - Dates for upcoming entrance exams
💰 **Fee Information** - Course and college fee details
📋 **Eligibility Criteria** - Admission requirements
🎯 **Admission Process** - Step-by-step guidance

Just ask me anything about college admissions! For example:
- "What colleges can I get with rank 5000?"
- "Tell me about Computer Engineering colleges"
- "When is JEE Main 2025 exam?"`
  }

  if (lowerMessage.includes('thank')) {
    return "You're welcome! 😊 I'm here to help with your college admission journey. Feel free to ask any questions!"
  }

  return "I'm here to help with college admissions! You can ask me about colleges, courses, cutoff predictions, exam schedules, or admission processes. What would you like to know?"
}

const analyzeChatPatterns = (chats) => {
  const intentCount = {}
  const dailyCount = {}

  chats.forEach(chat => {
    intentCount[chat.intent] = (intentCount[chat.intent] || 0) + 1

    const date = chat.timestamp.toISOString().split('T')[0]
    dailyCount[date] = (dailyCount[date] || 0) + 1
  })

  return {
    totalChats: chats.length,
    intentDistribution: intentCount,
    dailyChatVolume: dailyCount,
    mostCommonIntent: Object.keys(intentCount).reduce((a, b) => intentCount[a] > intentCount[b] ? a : b)
  }
}

const getSuggestedQuestions = async (options = {}) => {
  const questions = [
    "What are the top engineering colleges in India?",
    "What colleges can I get with my JEE rank?",
    "When is the next JEE Main exam?",
    "Tell me about Computer Science Engineering",
    "What is the admission process for IITs?",
    "What are the eligibility criteria for engineering?",
    "How much do engineering courses cost?",
    "What is the difference between IIT and NIT?"
  ]

  // Shuffle and return a few questions
  return questions.sort(() => 0.5 - Math.random()).slice(0, 5)
}

module.exports = {
  detectIntent,
  extractEntities,
  extractRank,
  extractCategory,
  extractCourseName,
  extractCollegeName,
  buildSearchFilters,
  formatCollegeResponse,
  formatCourseResponse,
  formatPredictionResponse,
  formatExamResponse,
  formatFeesResponse,
  formatEligibilityResponse,
  getGeneralResponse,
  analyzeChatPatterns,
  getSuggestedQuestions
}

