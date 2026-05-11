import { useEffect, useState } from 'react'
import { authService } from '../services/authService.js'

export const useRoles = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await authService.getRoles()
        setRoles(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar los roles'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void loadRoles()
  }, [])

  return { roles, loading, error }
}
