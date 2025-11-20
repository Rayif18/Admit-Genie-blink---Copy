import { useState, useEffect, useCallback } from 'react'
import { CollegeCard } from '@/components/CollegeCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Loader2, GraduationCap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'

interface College {
  id: string
  name: string
  location?: string
  ranking?: number
  description?: string
  accreditation?: string
}

export function Colleges() {
  const [colleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const { toast } = useToast()

  const fetchColleges = useCallback(() => {
    setLoading(true)
    // TODO: Fetch from database when tables are created
    toast({
      title: 'Setup Required',
      description: 'Please use the Admin Dashboard to add college data first.'
    })
    setLoading(false)
  }, [toast])

  const filterColleges = useCallback(() => {
    let filtered = colleges

    if (searchTerm) {
      filtered = filtered.filter((college) =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter((college) =>
        college.location?.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredColleges(filtered)
  }, [colleges, searchTerm, locationFilter])

  useEffect(() => {
    fetchColleges()
  }, [fetchColleges])

  useEffect(() => {
    filterColleges()
  }, [filterColleges])

  const handleViewDetails = (_id: string) => {
    toast({ title: 'Feature Coming Soon', description: 'College details will be available after database setup.' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explore Colleges</h1>
        <p className="text-muted-foreground text-lg">
          Browse through our comprehensive database of colleges
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search colleges by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <CollegeCard
              key={college.id}
              {...college}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No colleges in database yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Use the Admin Dashboard to add colleges and course information
          </p>
          <Button variant="outline" onClick={fetchColleges}>
            Refresh
          </Button>
        </Card>
      )}
    </div>
  )
}
