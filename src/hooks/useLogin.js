import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { authService } from '../services/authService.js'

export const useLogin = () => {
  const { login: setAuthUser } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authService.login(credentials)
      setAuthUser(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión. Intenta de nuevo.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [setAuthUser])

  return { login, error, isLoading }
}
