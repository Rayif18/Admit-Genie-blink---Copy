const axios = require('axios')

class LLMClient {
  constructor() {
    // Support both old and new environment variable names for backward compatibility
    this.apiKey = process.env.COMET_API_KEY || process.env.LLM_API_KEY
    this.baseURL = process.env.COMET_API_BASE_URL || process.env.LLM_API_BASE_URL || 'https://api.cometapi.com/v1'
    this.defaultModel = process.env.COMET_MODEL || process.env.LLM_MODEL || 'gpt-3.5-turbo'

    if (!this.apiKey) {
      console.warn('⚠️  COMET_API_KEY or LLM_API_KEY not configured. LLM functionality will use fallback responses.')
      this.fallbackMode = true
    } else {
      this.fallbackMode = false
    }
  }

  async generateLLMResponse({ messages, maxTokens = 300 }) {
    if (this.fallbackMode) {
      return null
    }

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.defaultModel,
        messages,
        max_tokens: maxTokens,
        temperature: 0.4
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      const choice = response.data?.choices?.[0]
      const content = choice?.message?.content

      if (!content) {
        return null
      }

      return Array.isArray(content) ? content.map((part) => part.text).join('\n') : content
    } catch (error) {
      console.error('LLM request failed:', error.response?.data || error.message)
      return null
    }
  }

  async generateResponse(prompt, options = {}) {
    const messages = this.buildMessages(prompt, options)
    const response = await this.generateLLMResponse({
      messages,
      maxTokens: options.maxTokens || 500
    })

    if (!response) {
      return this.getFallbackResponse(prompt, options)
    }

    return response
  }

  buildMessages(prompt, options) {
    const systemPrompt = this.getSystemPrompt(options.context, options)

    return [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  }

  getSystemPrompt(context, options) {
    let basePrompt = `You are Admit Genie, an AI-powered college admission assistant chatbot for Indian engineering colleges. Your goal is to help students navigate the complex college admission process in India.

Key Information:
- Help students with college information, courses, fees, eligibility, and cutoff predictions
- Provide information about entrance exams like JEE-Main, JEE-Advanced, MHT-CET, KCET, etc.
- Assist with rank-based college predictions
- Guide students through the admission process
- Always be helpful, accurate, and encouraging

Guidelines:
- Keep responses concise and focused on the student's query
- Provide specific, actionable information when possible
- If you don't know something, admit it and suggest alternative resources
- Be encouraging and supportive of students' educational goals
- Use simple language that students can easily understand`

    if (options.userRank && options.userCategory) {
      basePrompt += `\n\nStudent Context:
- Rank: ${options.userRank}
- Category: ${options.userCategory}
Use this context to provide personalized college recommendations when relevant.`
    }

    if (context === 'college_admission_assistant') {
      basePrompt += `\n\nSpecific Focus: College admission guidance for Indian engineering colleges including IITs, NITs, IIITs, and top private colleges.`
    }

    return basePrompt
  }

  getFallbackResponse(prompt, options) {
    // Rule-based fallback responses for when LLM API is not available
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      return 'Hello! I\'m Admit Genie, your AI-powered college admission assistant. How can I help you today? You can ask me about colleges, courses, cutoff predictions, exam schedules, or any admission-related queries!'
    }

    if (lowerPrompt.includes('college') && (lowerPrompt.includes('best') || lowerPrompt.includes('top'))) {
      return 'The top engineering colleges in India include the IITs (Bombay, Delhi, Madras, Kanpur), NITs (Trichy, Surathkal, Warangal), and top private institutions like BITS Pilani and VIT. To give you personalized recommendations, I\'d need to know your rank and category!'
    }

    if (lowerPrompt.includes('jee') && (lowerPrompt.includes('rank') || lowerPrompt.includes('cutoff'))) {
      return 'For JEE rank predictions and college recommendations, please provide your rank and category (General/OBC/SC/ST/EWS). I can then suggest colleges based on historical cutoff data from 2019-2024.'
    }

    if (lowerPrompt.includes('exam') && lowerPrompt.includes('date')) {
      return 'Major engineering entrance exams for 2025:\n• JEE-Main Session 1: January 24, 2025\n• JEE-Advanced: May 25, 2025\n• MHT-CET: April 16, 2025\n• KCET: April 18, 2025\nCheck exam websites for exact dates and updates.'
    }

    if (lowerPrompt.includes('course') && lowerPrompt.includes('fees')) {
      return 'Engineering course fees vary by college type:\n• IITs/NITs: ₹2-10 lakh for 4 years\n• Top private colleges: ₹8-20 lakh for 4 years\n• State colleges: ₹1-5 lakh for 4 years\nFees vary by specialization - Computer Science and AI courses are generally more expensive.'
    }

    if (lowerPrompt.includes('admission') && lowerPrompt.includes('process')) {
      return 'The general engineering admission process:\n1. Clear entrance exams (JEE-Main/Advanced, CETs)\n2. Register for counseling (JoSAA, state authorities)\n3. Fill college preferences based on rank\n4. Seat allocation rounds\n5. Document verification and fee payment\nI can help with specific details for any exam or college!'
    }

    if (lowerPrompt.includes('help') || lowerPrompt.includes('what can you do')) {
      return 'I can help you with:\n• College information and rankings\n• Course details and fees\n• Rank-based college predictions\n• Exam schedules and preparation\n• Admission process guidance\n• Eligibility criteria\n• Historical cutoff trends\n• Scholarship information\nJust ask me anything about engineering admissions!'
    }

    if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
      return 'You\'re welcome! Remember, I\'m here to help with any questions about college admissions. Feel free to ask anything else!'
    }

    // Default fallback response
    return 'I\'m here to help with college admissions! You can ask me about colleges, courses, cutoff predictions, exam schedules, or admission processes. What would you like to know?'
  }

  async isHealthy() {
    if (this.fallbackMode) {
      return false
    }

    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

// Create singleton instance
const llmClient = new LLMClient()

// Export both the instance and backward-compatible function
module.exports = {
  generateLLMResponse: llmClient.generateLLMResponse.bind(llmClient),
  generateResponse: llmClient.generateResponse.bind(llmClient),
  isHealthy: llmClient.isHealthy.bind(llmClient),
  llmClient
}

