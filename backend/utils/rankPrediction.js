const NORMALIZED_BONUS = {
  safe: 1,
  medium: 0.7,
  reach: 0.4,
  stretch: 0.1
}

const determineBand = (studentRank, minRank, maxRank) => {
  if (studentRank <= minRank) return 'safe'
  if (studentRank <= maxRank) return 'medium'

  const overshoot = studentRank - maxRank
  if (overshoot <= 2000) return 'reach'
  if (overshoot <= 5000) return 'stretch'
  return 'out'
}

const computeScore = (studentRank, minRank, maxRank, latestYear, currentYear) => {
  const band = determineBand(studentRank, minRank, maxRank)
  if (band === 'out') return { score: 0, probability: 'Low', band }

  const range = Math.max(maxRank - minRank, 1)
  const position = Math.min(Math.max((studentRank - minRank) / range, 0), 1)
  const baseScore = 1 - position

  const recencyWeight = latestYear && currentYear
    ? 1 - Math.min((currentYear - latestYear) * 0.05, 0.3)
    : 1

  const score = Math.max(0, baseScore * recencyWeight * NORMALIZED_BONUS[band])

  let probabilityText = 'Low'
  if (band === 'safe') probabilityText = 'Safe'
  else if (band === 'medium') probabilityText = 'Medium'
  else if (band === 'reach') probabilityText = 'Reach'
  else if (band === 'stretch') probabilityText = 'Stretch'

  return {
    score: Number(score.toFixed(3)),
    probability: probabilityText,
    band
  }
}

const aggregatePredictions = (rows, studentRank, studentCategory, currentYear) => {
  const grouped = rows.reduce((acc, row) => {
    const key = `${row.collegeId}-${row.courseId}`
    if (!acc[key]) {
      acc[key] = {
        collegeId: row.collegeId,
        collegeName: row.collegeName,
        courseId: row.courseId,
        courseName: row.courseName,
        location: row.location,
        fees: row.fees,
        accreditation: row.accreditation,
        ranking: row.ranking,
        admissions: row.admissions || [],
        cutoffs: []
      }
    }
    acc[key].cutoffs.push({
      year: row.year,
      category: row.category,
      minRank: row.minRank,
      maxRank: row.maxRank,
      avgRank: row.avgRank
    })
    return acc
  }, {})

  return Object.values(grouped).map((entry) => {
    const categoryMatches = entry.cutoffs.filter(
      (cutoff) => cutoff.category.toLowerCase() === studentCategory.toLowerCase()
    )

    const relevantCutoffs = categoryMatches.length > 0 ? categoryMatches : entry.cutoffs
    const latest = relevantCutoffs.reduce((prev, curr) => (curr.year > prev.year ? curr : prev), relevantCutoffs[0])

    const { score, probability, band } = computeScore(
      studentRank,
      latest.minRank,
      latest.maxRank,
      latest.year,
      currentYear
    )

    return {
      collegeId: entry.collegeId,
      collegeName: entry.collegeName,
      courseId: entry.courseId,
      courseName: entry.courseName,
      location: entry.location,
      fees: entry.fees,
      accreditation: entry.accreditation,
      ranking: entry.ranking,
      probability,
      score,
      band,
      latestCutoff: latest,
      allCutoffs: relevantCutoffs.sort((a, b) => b.year - a.year)
    }
  })
}

const generateRankPredictions = ({ rows, studentRank, category, currentYear = new Date().getFullYear(), limit = 50 }) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const predictions = aggregatePredictions(rows, studentRank, category, currentYear)
    .filter((prediction) => prediction.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const safe = []
  const medium = []
  const reach = []
  const stretch = []

  predictions.forEach((prediction) => {
    switch (prediction.band) {
      case 'safe':
        safe.push(prediction)
        break
      case 'medium':
        medium.push(prediction)
        break
      case 'reach':
        reach.push(prediction)
        break
      case 'stretch':
        stretch.push(prediction)
        break
      default:
        break
    }
  })

  return {
    safe,
    medium,
    reach,
    stretch,
    all: predictions
  }
}

const getPredictions = async (rank, category, options = {}) => {
  const { College, Course, CutoffData } = require('../models')
  const { limit = 20, state, courseType } = options

  // Get cutoff data with college and course information
  const cutoffs = await CutoffData.findAll({
    where: {
      category: category
    },
    include: [
      {
        model: College,
        as: 'college',
        attributes: ['collegeId', 'name', 'location', 'ranking', 'accreditation']
      },
      {
        model: Course,
        as: 'course',
        attributes: ['courseId', 'courseName', 'duration', 'fees']
      }
    ],
    order: [['year', 'DESC']],
    limit: 1000
  })

  // Convert to format expected by generateRankPredictions
  const rows = cutoffs.map(cutoff => ({
    collegeId: cutoff.collegeId,
    collegeName: cutoff.college.name,
    courseId: cutoff.courseId,
    courseName: cutoff.course.courseName,
    location: cutoff.college.location,
    fees: cutoff.course.fees,
    accreditation: cutoff.college.accreditation,
    ranking: cutoff.college.ranking,
    year: cutoff.year,
    category: cutoff.category,
    minRank: cutoff.minRank,
    maxRank: cutoff.maxRank,
    avgRank: cutoff.avgRank
  }))

  return generateRankPredictions({
    rows,
    studentRank: rank,
    category: category,
    limit
  })
}

const categorizePredictions = (predictions, rank, category) => {
  if (!predictions.all || predictions.all.length === 0) {
    return {
      safe: [],
      medium: [],
      reach: [],
      all: []
    }
  }

  return {
    safe: predictions.safe || [],
    medium: predictions.medium || [],
    reach: predictions.reach || [],
    all: predictions.all || []
  }
}

const analyzeCutoffs = (cutoffs, rank, category) => {
  const categoryCutoffs = cutoffs.filter(c => c.category === category)

  if (categoryCutoffs.length === 0) {
    return {
      analysis: 'No cutoff data available for this category',
      trend: 'insufficient_data',
      prediction: 'unable_to_predict'
    }
  }

  const latestCutoff = categoryCutoffs.reduce((latest, current) =>
    current.year > latest.year ? current : latest, categoryCutoffs[0])

  const avgRank = latestCutoff.avgRank
  let chance = 'low'

  if (rank <= latestCutoff.minRank) {
    chance = 'high'
  } else if (rank <= avgRank) {
    chance = 'medium'
  } else if (rank <= latestCutoff.maxRank) {
    chance = 'possible'
  }

  return {
    latestCutoff,
    chance,
    gap: Math.max(0, rank - latestCutoff.maxRank),
    analysis: `Your rank ${rank} vs required rank ${latestCutoff.minRank}-${latestCutoff.maxRank} gives you a ${chance} chance`
  }
}

const analyzeCollegeComparison = (college, cutoffs, rank, category) => {
  const collegeCutoffs = cutoffs.filter(c => c.category === category)

  if (collegeCutoffs.length === 0) {
    return {
      collegeName: college.name,
      probability: 0,
      chance: 'no_data',
      analysis: 'No cutoff data available'
    }
  }

  const latestCutoff = collegeCutoffs.reduce((latest, current) =>
    current.year > latest.year ? current : latest, collegeCutoffs[0])

  let probability = 0
  let chance = 'low'

  if (rank <= latestCutoff.minRank) {
    probability = 0.9
    chance = 'high'
  } else if (rank <= latestCutoff.avgRank) {
    probability = 0.6
    chance = 'medium'
  } else if (rank <= latestCutoff.maxRank) {
    probability = 0.3
    chance = 'possible'
  } else {
    const overshoot = rank - latestCutoff.maxRank
    probability = Math.max(0, 0.1 - (overshoot / 10000))
    chance = 'very_low'
  }

  return {
    collegeName: college.name,
    probability,
    chance,
    analysis: `Rank requirement: ${latestCutoff.minRank}-${latestCutoff.maxRank} (${category})`,
    gap: Math.max(0, rank - latestCutoff.maxRank)
  }
}

const analyzeTrends = (cutoffs, years = 5) => {
  if (cutoffs.length === 0) {
    return {
      trend: 'no_data',
      direction: 'stable',
      changePercent: 0
    }
  }

  const sortedByYear = cutoffs.sort((a, b) => a.year - b.year)
  const recent = sortedByYear.slice(-years)

  if (recent.length < 2) {
    return {
      trend: 'insufficient_data',
      direction: 'stable',
      changePercent: 0
    }
  }

  const firstYear = recent[0]
  const lastYear = recent[recent.length - 1]

  const change = lastYear.avgRank - firstYear.avgRank
  const changePercent = (change / firstYear.avgRank) * 100

  let direction = 'stable'
  if (Math.abs(changePercent) > 10) {
    direction = changePercent > 0 ? 'increasing' : 'decreasing'
  }

  return {
    trend: direction,
    changePercent: Math.round(changePercent * 10) / 10,
    startYear: firstYear.year,
    endYear: lastYear.year,
    startRank: firstYear.avgRank,
    endRank: lastYear.avgRank
  }
}

const predictNextYearTrends = (cutoffs) => {
  if (cutoffs.length < 2) {
    return {
      prediction: 'insufficient_data',
      nextYearRank: null,
      confidence: 'low'
    }
  }

  const sortedByYear = cutoffs.sort((a, b) => a.year - b.year)
  const recent = sortedByYear.slice(-3) // Use last 3 years

  if (recent.length < 2) {
    return {
      prediction: 'insufficient_data',
      nextYearRank: null,
      confidence: 'low'
    }
  }

  // Calculate trend
  const changes = []
  for (let i = 1; i < recent.length; i++) {
    const change = recent[i].avgRank - recent[i-1].avgRank
    changes.push(change)
  }

  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length
  const lastYear = recent[recent.length - 1]
  const nextYearRank = Math.round(lastYear.avgRank + avgChange)

  // Calculate confidence based on consistency of changes
  const variance = changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length
  const standardDeviation = Math.sqrt(variance)
  let confidence = 'medium'

  if (standardDeviation < 50) {
    confidence = 'high'
  } else if (standardDeviation > 200) {
    confidence = 'low'
  }

  return {
    prediction: avgChange > 0 ? 'increasing' : avgChange < 0 ? 'decreasing' : 'stable',
    nextYearRank,
    avgChange: Math.round(avgChange),
    confidence,
    dataPoints: recent.length
  }
}

module.exports = {
  generateRankPredictions,
  determineBand,
  getPredictions,
  categorizePredictions,
  analyzeCutoffs,
  analyzeCollegeComparison,
  analyzeTrends,
  predictNextYearTrends
}

