import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Exam {
  id: string
  examName: string
  registrationStart?: string
  registrationEnd?: string
  examDate?: string
  resultDate?: string
}

export function Exams() {
  const [exams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchExams = useCallback(() => {
    setLoading(true)
    // TODO: Fetch from database when tables are created
    toast({
      title: 'Setup Required',
      description: 'Please use the Admin Dashboard to add exam schedules first.'
    })
    setLoading(false)
  }, [toast])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <Calendar className="mr-2 h-8 w-8 text-primary" />
          Exam Schedules
        </h1>
        <p className="text-muted-foreground text-lg">
          Stay updated with important exam dates and registration deadlines
        </p>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{exam.examName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Exam information will be displayed here</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No exam schedules available yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Use the Admin Dashboard to add exam schedules and dates
          </p>
          <Button variant="outline" onClick={fetchExams}>
            Refresh
          </Button>
        </Card>
      )}
    </div>
  )
}
