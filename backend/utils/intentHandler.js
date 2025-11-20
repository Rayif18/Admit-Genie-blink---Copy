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

module.exports = {
  detectIntent,
  extractRank,
  extractCategory,
  extractCourseName,
  extractCollegeName,
  buildSearchFilters
}

