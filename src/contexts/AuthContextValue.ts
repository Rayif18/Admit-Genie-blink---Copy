import { createContext } from 'react'

export interface User {
  id: string
  email: string
  name: string
  educationLevel?: string
  cetRank?: number
  category?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
