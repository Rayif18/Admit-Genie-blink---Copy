const formatCollegeCard = (college) => {
  const parts = [
    `🏫 *${college.name}*`,
    college.location ? `📍 Location: ${college.location}` : null,
    college.accreditation ? `✅ Accreditation: ${college.accreditation}` : null,
    college.ranking ? `🏆 Ranking: ${college.ranking}` : null,
    college.description ? `ℹ️ About: ${college.description}` : null
  ].filter(Boolean)

  if (college.courses?.length) {
    const courseLines = college.courses.slice(0, 3).map((course) => `   • ${course.courseName}${course.fees ? ` – ₹${Number(course.fees).toLocaleString('en-IN')}` : ''}`)
    parts.push('🎓 Popular Courses:\n' + courseLines.join('\n'))
  }

  return parts.join('\n')
}

const formatCollegesResponse = (colleges = []) => {
  if (!colleges.length) {
    return 'I could not find any colleges matching your filters. Try adjusting the location, course, or fees.'
  }

  const header = `Here ${colleges.length === 1 ? 'is' : 'are'} ${colleges.length === 1 ? 'a college' : `${colleges.length} colleges`} that match your request:\n`
  const body = colleges.slice(0, 5).map(formatCollegeCard).join('\n\n')
  return `${header}${body}`
}

const formatCoursesResponse = (courses = []) => {
  if (!courses.length) {
    return 'I could not locate courses for your filters. Please try using a different course name or college.'
  }

  const items = courses.slice(0, 5).map((course) => {
    const lines = [
      `🎓 *${course.courseName}* (${course.college?.name || 'College'})`,
      course.duration ? `⌛ Duration: ${course.duration}` : null,
      course.eligibility ? `✅ Eligibility: ${course.eligibility}` : null,
      course.fees ? `💰 Fees: ₹${Number(course.fees).toLocaleString('en-IN')}` : null,
      course.intake ? `👥 Intake: ${course.intake}` : null
    ].filter(Boolean)
    return lines.join('\n')
  })

  return `Here ${items.length === 1 ? 'is' : 'are'} the course detail${items.length > 1 ? 's' : ''}:\n\n${items.join('\n\n')}`
}

const formatPredictionsResponse = (groups) => {
  const toLines = (label, list) => {
    if (!list.length) return null
    const header = `*${label} Options*`
    const body = list.slice(0, 5).map((item) => {
      const lines = [
        `• ${item.collegeName} – ${item.courseName}`,
        `   Probability: ${item.probability}`,
        `   Latest cutoff (${item.latestCutoff.year}): ${item.latestCutoff.minRank} - ${item.latestCutoff.maxRank}`
      ]
      if (item.fees) {
        lines.push(`   Fees: ₹${Number(item.fees).toLocaleString('en-IN')}`)
      }
      return lines.join('\n')
    })
    return `${header}\n${body.join('\n')}`
  }

  const sections = [
    toLines('Safe', groups.safe),
    toLines('Medium', groups.medium),
    toLines('Reach', groups.reach),
    toLines('Stretch', groups.stretch)
  ].filter(Boolean)

  if (!sections.length) {
    return 'I could not generate predictions with the provided rank. Please verify your rank and category or add more cutoff records.'
  }

  return `Here are the colleges that match your CET rank analysis:\n\n${sections.join('\n\n')}\n\nYou can save these recommendations in the dashboard for future reference.`
}

const formatExamScheduleResponse = (exams = []) => {
  if (!exams.length) {
    return 'I did not find any upcoming exams in the database. Please ask the admin to add exam schedules.'
  }

  const body = exams.slice(0, 5).map((exam) => {
    const lines = [
      `📝 *${exam.examName}*`,
      exam.registrationStart ? `   Registration: ${exam.registrationStart} - ${exam.registrationEnd || 'TBA'}` : null,
      exam.examDate ? `   Exam: ${exam.examDate}` : null,
      exam.resultDate ? `   Result: ${exam.resultDate}` : null
    ].filter(Boolean)
    return lines.join('\n')
  })

  return `Upcoming exam schedules:\n\n${body.join('\n\n')}`
}

const formatGeneralResponse = () => (
  'I am Admit Genie, your virtual admission assistant. You can ask me about colleges, courses, fees, eligibility, admission deadlines, exam schedules, or request CET rank-based college predictions.'
)

module.exports = {
  formatCollegesResponse,
  formatCoursesResponse,
  formatPredictionsResponse,
  formatExamScheduleResponse,
  formatGeneralResponse
}

