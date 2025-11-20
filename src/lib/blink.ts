import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'admit-genie-admission-assistant-chatbot-q72fnt6d',
  authRequired: false,
  auth: {
    mode: 'headless'
  }
})
