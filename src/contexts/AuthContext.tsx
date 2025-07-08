import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: number
  email: string
}

interface AuthContextType {
  user: User | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_URL = 'http://localhost:3001/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data }
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error' } }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data }
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      return { error: null }
    } catch (error) {
      return { error: { message: 'Network error' } }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    session: user ? { user } : null,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}