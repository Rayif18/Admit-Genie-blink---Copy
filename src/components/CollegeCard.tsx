import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, ExternalLink } from 'lucide-react'

interface CollegeCardProps {
  id: string
  name: string
  location?: string
  ranking?: number
  description?: string
  accreditation?: string
  onViewDetails: (id: string) => void
}

export function CollegeCard({ 
  id, 
  name, 
  location, 
  ranking, 
  description, 
  accreditation,
  onViewDetails 
}: CollegeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{name}</CardTitle>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {location}
              </div>
            )}
          </div>
          {ranking && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Rank #{ranking}</span>
            </Badge>
          )}
        </div>
        {accreditation && (
          <Badge variant="outline" className="w-fit mt-2">
            {accreditation}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">
          {description || 'A premier institution offering quality education and excellent placement opportunities.'}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(id)}>
          View Details
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
