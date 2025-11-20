import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/useAuth'
import { blink } from '@/lib/blink'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I\'m Admit Genie, your AI admission assistant. I can help you with information about colleges, courses, fees, eligibility, exam schedules, and predict your college admissions based on CET rank. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeIntent = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('college') || lowerQuery.includes('institution')) return 'college_info'
    if (lowerQuery.includes('course') || lowerQuery.includes('program')) return 'course_info'
    if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('tuition')) return 'fees'
    if (lowerQuery.includes('eligibility') || lowerQuery.includes('criteria')) return 'eligibility'
    if (lowerQuery.includes('cutoff') || lowerQuery.includes('rank') || lowerQuery.includes('cet')) return 'cutoff'
    if (lowerQuery.includes('admission') || lowerQuery.includes('apply')) return 'admission'
    if (lowerQuery.includes('exam') || lowerQuery.includes('test') || lowerQuery.includes('date')) return 'exam'
    if (lowerQuery.includes('scholarship')) return 'scholarship'
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) return 'greeting'
    
    return 'general'
  }

  const generateResponse = async (query: string, intent: string): Promise<string> => {
    try {
      // Use Blink AI to generate contextual response
      const { text } = await blink.ai.generateText({
        prompt: `You are Admit Genie, an AI admission assistant for Indian college admissions. 
        
User Query: "${query}"
Intent: ${intent}

Provide a helpful, concise, and friendly response. Since the database is still being set up, guide the user to use specific features like the Rank Predictor, College Database, and Admin Dashboard to add their data.`,
        maxTokens: 300
      })

      return text
    } catch (error) {
      console.error('AI Error:', error)
      return 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question or use our Rank Predictor and College Database features for specific information.'
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const intent = analyzeIntent(userMessage.content)
      const response = await generateResponse(userMessage.content, intent)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

      // TODO: Save chat history when database table is created
      console.log('Chat saved for user:', user?.id)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            Chat with Admit Genie
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask me anything about colleges, courses, admissions, and more!
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary' : 'bg-accent'}`}>
                  {message.role === 'user' ? (
                    <UserIcon className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Bot className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="rounded-lg p-3 bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
