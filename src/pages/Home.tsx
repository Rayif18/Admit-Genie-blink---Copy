import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, TrendingUp, BookOpen, Calendar, Search, Shield } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chatbot Assistant',
      description: 'Get instant answers about courses, colleges, fees, and eligibility through our intelligent chatbot.'
    },
    {
      icon: TrendingUp,
      title: 'CET Rank Predictor',
      description: 'Predict your college admissions based on your CET rank and historical cutoff data.'
    },
    {
      icon: BookOpen,
      title: 'College Database',
      description: 'Explore comprehensive information about colleges, courses, and admission requirements.'
    },
    {
      icon: Calendar,
      title: 'Exam Schedules',
      description: 'Stay updated with exam dates, registration deadlines, and result announcements.'
    },
    {
      icon: Search,
      title: 'Smart Filters',
      description: 'Filter colleges by location, fees, courses, and rankings to find your perfect match.'
    },
    {
      icon: Shield,
      title: 'Verified Data',
      description: 'Access accurate and verified information from official sources and previous year records.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Welcome to <span className="text-primary">Admit Genie</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your AI-powered admission assistant for navigating the college admission process in India
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Button size="lg" onClick={() => navigate('/chat')} className="text-lg px-8">
                Start Chatting
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/rank-predictor')} className="text-lg px-8">
                Predict College
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Features That Help You Succeed</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to make informed decisions about your education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Find Your Dream College?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of students who are making informed decisions about their future
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')} className="text-lg px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/colleges')} className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Explore Colleges
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground text-lg">Colleges in Database</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground text-lg">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground text-lg">AI Assistant Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
