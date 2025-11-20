const axios = require('axios')

const generateLLMResponse = async ({ messages, maxTokens = 300 }) => {
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_API_BASE_URL
  const model = process.env.LLM_MODEL

  if (!apiKey || !baseUrl || !model) {
    return null
  }

  try {
    const response = await axios.post(
      baseUrl,
      {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15_000
      }
    )

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

module.exports = {
  generateLLMResponse
}

