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

module.exports = {
  generateRankPredictions,
  determineBand
}

