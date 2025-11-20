import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Building, BookOpen, TrendingDown, Calendar } from 'lucide-react'

export function AdminDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // College form state
  const [collegeName, setCollegeName] = useState('')
  const [collegeLocation, setCollegeLocation] = useState('')
  const [collegeDescription, setCollegeDescription] = useState('')
  const [collegeRanking, setCollegeRanking] = useState('')
  const [collegeAccreditation, setCollegeAccreditation] = useState('')

  // Course form state
  const [courseCollegeId, setCourseCollegeId] = useState('')
  const [courseName, setCourseName] = useState('')
  const [courseDuration, setCourseDuration] = useState('')
  const [courseEligibility, setCourseEligibility] = useState('')
  const [courseFees, setCourseFees] = useState('')
  const [courseIntake, setCourseIntake] = useState('')

  // Cutoff form state
  const [cutoffCollegeId, setCutoffCollegeId] = useState('')
  const [cutoffCourseId, setCutoffCourseId] = useState('')
  const [cutoffCategory, setCutoffCategory] = useState('')
  const [cutoffYear, setCutoffYear] = useState('')
  const [cutoffMinRank, setCutoffMinRank] = useState('')
  const [cutoffMaxRank, setCutoffMaxRank] = useState('')
  const [cutoffAvgRank, setCutoffAvgRank] = useState('')

  // Exam form state
  const [examName, setExamName] = useState('')
  const [examRegStart, setExamRegStart] = useState('')
  const [examRegEnd, setExamRegEnd] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examResultDate, setExamResultDate] = useState('')

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement database integration when tables are created
      toast({ title: 'Demo Mode', description: 'Database integration pending. Please set up tables in the Database tab.' })
      
      // Reset form
      setCollegeName('')
      setCollegeLocation('')
      setCollegeDescription('')
      setCollegeRanking('')
      setCollegeAccreditation('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add college', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement database integration when tables are created
      toast({ title: 'Demo Mode', description: 'Database integration pending. Please set up tables in the Database tab.' })
      
      // Reset form
      setCourseCollegeId('')
      setCourseName('')
      setCourseDuration('')
      setCourseEligibility('')
      setCourseFees('')
      setCourseIntake('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add course', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCutoff = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement database integration when tables are created
      toast({ title: 'Demo Mode', description: 'Database integration pending. Please set up tables in the Database tab.' })
      
      // Reset form
      setCutoffCollegeId('')
      setCutoffCourseId('')
      setCutoffCategory('')
      setCutoffYear('')
      setCutoffMinRank('')
      setCutoffMaxRank('')
      setCutoffAvgRank('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add cutoff data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement database integration when tables are created
      toast({ title: 'Demo Mode', description: 'Database integration pending. Please set up tables in the Database tab.' })
      
      // Reset form
      setExamName('')
      setExamRegStart('')
      setExamRegEnd('')
      setExamDate('')
      setExamResultDate('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add exam schedule', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage colleges, courses, cutoffs, and exam schedules
        </p>
      </div>

      <Tabs defaultValue="colleges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colleges">
            <Building className="h-4 w-4 mr-2" />
            Colleges
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="cutoffs">
            <TrendingDown className="h-4 w-4 mr-2" />
            Cutoffs
          </TabsTrigger>
          <TabsTrigger value="exams">
            <Calendar className="h-4 w-4 mr-2" />
            Exams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colleges">
          <Card>
            <CardHeader>
              <CardTitle>Add New College</CardTitle>
              <CardDescription>Enter college details to add to the database</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCollege} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name *</Label>
                  <Input id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={collegeLocation} onChange={(e) => setCollegeLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={collegeDescription} onChange={(e) => setCollegeDescription(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ranking">Ranking</Label>
                    <Input id="ranking" type="number" value={collegeRanking} onChange={(e) => setCollegeRanking(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation</Label>
                    <Input id="accreditation" value={collegeAccreditation} onChange={(e) => setCollegeAccreditation(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add College'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
              <CardDescription>Enter course details (note: you need the College ID)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCollegeId">College ID *</Label>
                  <Input id="courseCollegeId" value={courseCollegeId} onChange={(e) => setCourseCollegeId(e.target.value)} required placeholder="Get from colleges list" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="4 years" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fees">Fees (₹)</Label>
                    <Input id="fees" type="number" value={courseFees} onChange={(e) => setCourseFees(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intake">Intake</Label>
                    <Input id="intake" type="number" value={courseIntake} onChange={(e) => setCourseIntake(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility</Label>
                  <Textarea id="eligibility" value={courseEligibility} onChange={(e) => setCourseEligibility(e.target.value)} rows={2} />
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Course'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cutoffs">
          <Card>
            <CardHeader>
              <CardTitle>Add Cutoff Data</CardTitle>
              <CardDescription>Enter historical cutoff data for predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCutoff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cutoffCollegeId">College ID *</Label>
                    <Input id="cutoffCollegeId" value={cutoffCollegeId} onChange={(e) => setCutoffCollegeId(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cutoffCourseId">Course ID *</Label>
                    <Input id="cutoffCourseId" value={cutoffCourseId} onChange={(e) => setCutoffCourseId(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" value={cutoffCategory} onChange={(e) => setCutoffCategory(e.target.value)} required placeholder="OPEN, OBC, SC, ST, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input id="year" type="number" value={cutoffYear} onChange={(e) => setCutoffYear(e.target.value)} required placeholder="2024" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minRank">Min Rank *</Label>
                    <Input id="minRank" type="number" value={cutoffMinRank} onChange={(e) => setCutoffMinRank(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRank">Max Rank *</Label>
                    <Input id="maxRank" type="number" value={cutoffMaxRank} onChange={(e) => setCutoffMaxRank(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgRank">Avg Rank *</Label>
                    <Input id="avgRank" type="number" value={cutoffAvgRank} onChange={(e) => setCutoffAvgRank(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Cutoff'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Add Exam Schedule</CardTitle>
              <CardDescription>Enter exam dates and registration information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="examName">Exam Name *</Label>
                  <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} required placeholder="e.g., MHT CET 2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regStart">Registration Start</Label>
                    <Input id="regStart" type="date" value={examRegStart} onChange={(e) => setExamRegStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regEnd">Registration End</Label>
                    <Input id="regEnd" type="date" value={examRegEnd} onChange={(e) => setExamRegEnd(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam Date</Label>
                    <Input id="examDate" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resultDate">Result Date</Label>
                    <Input id="resultDate" type="date" value={examResultDate} onChange={(e) => setExamResultDate(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Exam Schedule'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
