import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Search, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Prediction {
  collegeName: string
  courseName: string
  category: string
  minRank: number
  maxRank: number
  probability: 'Safe' | 'Medium' | 'Reach'
  location?: string
  fees?: number
}

export function RankPredictor() {
  const [cetRank, setCetRank] = useState('')
  const [category, setCategory] = useState('')
  const [predictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const categories = ['OPEN', 'OBC', 'SC', 'ST', 'EWS', 'SEBC', 'NT-A', 'NT-B', 'NT-C', 'NT-D']

  const handlePredict = async () => {
    if (!cetRank || !category) {
      toast({
        title: 'Error',
        description: 'Please enter your CET rank and select a category',
        variant: 'destructive'
      })
      return
    }

    const rank = parseInt(cetRank)
    if (isNaN(rank) || rank <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid rank',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // TODO: Implement actual prediction logic when database tables are created
      toast({
        title: 'Setup Required',
        description: 'Please use the Admin Dashboard to add cutoff data first for predictions to work.'
      })
    } catch (error) {
      console.error('Prediction error:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate predictions. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'Safe': return 'bg-green-100 text-green-800 border-green-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Reach': return 'bg-red-100 text-red-800 border-red-300'
      default: return ''
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
          <TrendingUp className="mr-2 h-8 w-8 text-primary" />
          CET Rank Predictor
        </h1>
        <p className="text-muted-foreground text-lg">
          Predict your college admissions based on CET rank and historical cutoff data
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>Provide your CET rank and category to get predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rank">CET Rank</Label>
              <Input
                id="rank"
                type="number"
                placeholder="Enter your rank"
                value={cetRank}
                onChange={(e) => setCetRank(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handlePredict} disabled={loading} className="w-full">
                {loading ? 'Predicting...' : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Predict Colleges
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Predictions ({predictions.length})</h2>
            <div className="flex gap-2 text-sm">
              <Badge className="bg-green-100 text-green-800 border-green-300">Safe</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>
              <Badge className="bg-red-100 text-red-800 border-red-300">Reach</Badge>
            </div>
          </div>

          {predictions.map((prediction, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Badge className={getProbabilityColor(prediction.probability)}>
                        {prediction.probability}
                      </Badge>
                      <div>
                        <h3 className="text-lg font-semibold">{prediction.collegeName}</h3>
                        <p className="text-sm text-muted-foreground">{prediction.courseName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min Rank:</span>
                        <p className="font-medium">{prediction.minRank}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Rank:</span>
                        <p className="font-medium">{prediction.maxRank}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {predictions.length === 0 && !loading && (
        <Card className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            Enter your CET rank and category to see college predictions
          </p>
          <p className="text-sm text-muted-foreground">
            Note: Admin must add cutoff data first for predictions to work
          </p>
        </Card>
      )}
    </div>
  )
}
