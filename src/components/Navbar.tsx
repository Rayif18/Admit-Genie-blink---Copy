import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { GraduationCap, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Admit Genie</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/colleges" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Colleges
          </Link>
          <Link to="/rank-predictor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Rank Predictor
          </Link>
          <Link to="/chat" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Chatbot
          </Link>
          <Link to="/exams" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Exams
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
