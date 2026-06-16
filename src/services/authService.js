import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const maskToken = (token) => {
  if (!token) return '(sin token)'
  if (token.length <= 16) return token
  return `${token.slice(0, 8)}...${token.slice(-8)}`
}

const resolveRoleLabel = (role) => {
  if (typeof role === 'string') {
    return role
  }

  if (role && typeof role === 'object') {
    const roleName = role.nombre_rol ?? role.nombre
    if (typeof roleName === 'string' && roleName.trim()) {
      return roleName
    }

    const roleNumber = role.numero_rol ?? role.numeroRol
    if (typeof roleNumber === 'number') {
      return `ROL ${roleNumber}`
    }
  }

  return 'USUARIO'
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Callback para manejar logout automático
let onUnauthorized = null

export const setUnauthorizedCallback = (callback) => {
  onUnauthorized = callback
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('[authService] Token expirado o no autorizado. Cierre de sesión automático.')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      if (onUnauthorized) {
        onUnauthorized()
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/bff/auth/login', credentials)
    return {
      ...response.data,
      rol: resolveRoleLabel(response.data.rol),
    }
  },

  register: async (data) => {
    const response = await apiClient.post('/api/bff/auth/register', data)
    return response.data
  },

  getUsers: async () => {
    const response = await apiClient.get('/api/bff/auth/usuarios')
    return response.data
  },

  updateUser: async (id, data) => {
    const token = localStorage.getItem('authToken')
    const endpoint = `/api/bff/auth/usuarios/${id}`

    console.group('[authService.updateUser] Request debug')
    console.log('Endpoint:', `${API_BASE_URL}${endpoint}`)
    console.log('Payload JSON:', JSON.stringify(data, null, 2))
    console.log('Payload object:', data)
    console.log('Token presente:', Boolean(token))
    console.log('Token (enmascarado):', maskToken(token))
    console.groupEnd()

    await apiClient.put(`/api/bff/auth/usuarios/${id}`, data)
  },

  changeUserPassword: async (id, data) => {
    await apiClient.patch(`/api/bff/auth/usuarios/${id}/change-password`, data)
  },

  deleteUser: async (id) => {
    await apiClient.delete(`/api/bff/auth/usuarios/${id}`)
  },

  getCurrentUser: async (id) => {
    const response = await apiClient.get(`/api/bff/auth/usuarios/${id}`)
    return response.data
  },

  updateCurrentUser: async (userId, data) => {
    const token = localStorage.getItem('authToken')
    const endpoint = `/api/bff/auth/usuarios/${userId}`

    console.group('[authService.updateCurrentUser] Request debug')
    console.log('Endpoint:', `${API_BASE_URL}${endpoint}`)
    console.log('Payload JSON:', JSON.stringify(data, null, 2))
    console.log('Token presente:', Boolean(token))
    console.log('Token (enmascarado):', maskToken(token))
    console.groupEnd()

    await apiClient.put(endpoint, data)
  },

  changeCurrentUserPassword: async (userId, data) => {
    const endpoint = `/api/bff/auth/usuarios/${userId}/change-password`

    console.group('[authService.changeCurrentUserPassword] Request debug')
    console.log('Endpoint:', `${API_BASE_URL}${endpoint}`)
    console.log('Payload JSON:', JSON.stringify(data, null, 2))
    console.groupEnd()

    await apiClient.patch(endpoint, data)
  },

  getRoles: async () => {
    const response = await apiClient.get('/api/bff/auth/roles')
    return response.data
  },
}

export default apiClient
