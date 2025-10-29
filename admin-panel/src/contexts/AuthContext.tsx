import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminAPI } from '../services/api'

interface Admin {
  id: string
  username: string
  email: string
  role: 'founder' | 'developer' | 'admin'
  fullName: string
}

interface AuthContextType {
  admin: Admin | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const data = await adminAPI.verifyCookie()
      if (data.success) {
        setAdmin(data.admin)
      }
    } catch (error) {
      // Not authenticated
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const data = await adminAPI.login(username, password)
    setAdmin(data.admin)
  }

  const logout = async () => {
    try {
      await adminAPI.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      setAdmin(null)
    }
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

