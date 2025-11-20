import { useState, useEffect, ReactNode } from 'react'
import { blink } from '@/lib/blink'
import { AuthContext } from './AuthContextValue'

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        setUser({
          id: state.user.id,
          email: state.user.email || '',
          name: state.user.displayName || '',
        })
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    await blink.auth.signInWithEmail(email, password)
  }

  const register = async (_name: string, email: string, password: string) => {
    await blink.auth.signUp({
      email,
      password,
      metadata: { name: _name }
    })
  }

  const logout = () => {
    blink.auth.logout()
    setUser(null)
  }

  const updateProfile = async (_data: Partial<any>) => {
    if (!user) return
    setUser({ ...user, ..._data })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider