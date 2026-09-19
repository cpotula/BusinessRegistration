import { createContext, useContext, useState, ReactNode } from 'react'
import { api, getUser, User } from '../api/client'

interface AuthCtx {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (fields: { name: string; email: string; phone: string; password: string; userType?: string }) => Promise<void>
  logout: () => void
}

const AuthCtx = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUser())

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const register = async (fields: { name: string; email: string; phone: string; password: string; userType?: string }) => {
    const { data } = await api.post('/auth/register', fields)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
