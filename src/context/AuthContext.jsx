import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
      nombre: response.nombre,
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
