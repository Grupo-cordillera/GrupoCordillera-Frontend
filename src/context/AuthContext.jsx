import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { setUnauthorizedCallback } from '../services/authService.js'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) return null

    try {
      return JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [token, setToken] = useState(() =>
    localStorage.getItem('authToken')
  )
  const [loading, setLoading] = useState(false)

  const login = useCallback((response) => {
    const userData = {
      id: response.id,
      nombre: response.nombre,
      apellido: response.apellido,
      correo: response.correo,
      direccion: response.direccion,
      telefono: response.telefono,
      rol: response.rol,
    }

    setUser(userData)
    setToken(response.jwt)
    localStorage.setItem('authToken', response.jwt)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const updateToken = useCallback((newToken) => {
    setToken(newToken)
    localStorage.setItem('authToken', newToken)
  }, [])

  // Registrar callback para auto-logout cuando el token expire
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      window.location.href = '/login'
    }
    
    setUnauthorizedCallback(handleUnauthorized)
  }, [logout])

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser,
    updateToken,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
