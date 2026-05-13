import { describe, it, expect, vi, beforeEach } from 'vitest'

const { apiClient, requestInterceptors, responseInterceptors } = vi.hoisted(() => {
  const requestInterceptors = []
  const responseInterceptors = []

  const apiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn((handler) => {
          requestInterceptors.push(handler)
          return 0
        }),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseInterceptors.push({ onFulfilled, onRejected })
          return 0
        }),
      },
    },
  }

  return { apiClient, requestInterceptors, responseInterceptors }
})

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiClient),
  },
}))

import { authService, setUnauthorizedCallback } from './authService.js'

beforeEach(() => {
  localStorage.clear()
  apiClient.get.mockReset()
  apiClient.post.mockReset()
  apiClient.put.mockReset()
  apiClient.patch.mockReset()
  apiClient.delete.mockReset()
})

describe('authService', () => {
  it('adds auth token to request headers', () => {
    localStorage.setItem('authToken', 'token-123')
    const handler = requestInterceptors[0]
    const config = handler({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer token-123')
  })

  it('does not add auth header when no token', () => {
    localStorage.removeItem('authToken')
    const handler = requestInterceptors[0]
    const config = handler({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('normalizes role from object payloads on login', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { jwt: 't', rol: { nombre_rol: 'Admin' } },
    })

    const data = await authService.login({ username: 'demo', password: '123' })

    expect(apiClient.post).toHaveBeenCalledWith('/api/bff/auth/login', {
      username: 'demo',
      password: '123',
    })
    expect(data.rol).toBe('Admin')
  })

  it('normalizes role from numeric payloads on login', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { jwt: 't', rol: { numero_rol: 2 } },
    })

    const data = await authService.login({ username: 'demo', password: '123' })

    expect(data.rol).toBe('ROL 2')
  })

  it('normalizes role from string payloads on login', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { jwt: 't', rol: 'Manager' },
    })

    const data = await authService.login({ username: 'demo', password: '123' })

    expect(data.rol).toBe('Manager')
  })

  it('falls back to default role label when missing', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { jwt: 't', rol: null },
    })

    const data = await authService.login({ username: 'demo', password: '123' })

    expect(data.rol).toBe('USUARIO')
  })

  it('clears storage and calls callback on 401', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedCallback(onUnauthorized)
    localStorage.setItem('authToken', 'token-123')
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    const handler = responseInterceptors[0].onRejected
    const error = { response: { status: 401 } }

    await expect(handler(error)).rejects.toBe(error)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('authToken')).toBe(null)
    expect(localStorage.getItem('user')).toBe(null)
  })

  it('clears storage on 403 without callback', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem('authToken', 'token-123')
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    const handler = responseInterceptors[0].onRejected
    const error = { response: { status: 403 } }

    await expect(handler(error)).rejects.toBe(error)
    expect(localStorage.getItem('authToken')).toBe(null)
    expect(localStorage.getItem('user')).toBe(null)

    warnSpy.mockRestore()
  })

  it('calls profile and admin endpoints', async () => {
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    apiClient.post.mockResolvedValueOnce({ data: { ok: true } })
    apiClient.get
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: { id: 1 } })
      .mockResolvedValueOnce({ data: ['roles'] })
    apiClient.put.mockResolvedValue({})
    apiClient.patch.mockResolvedValue({})
    apiClient.delete.mockResolvedValue({})

    await authService.register({ nombre: 'Ana' })
    await authService.getUsers()
    await authService.getCurrentUser()
    await authService.getRoles()

    localStorage.removeItem('authToken')
    await authService.updateUser(1, { nombre: 'Ana' })

    localStorage.setItem('authToken', 'short-token')
    await authService.updateCurrentUser(5, { nombre: 'Ana' })

    localStorage.setItem('authToken', 'token-with-long-length-123456789')
    await authService.updateUser(2, { nombre: 'Luis' })

    await authService.changeUserPassword(2, { newPassword: '123' })
    await authService.changeCurrentUserPassword(5, { newPassword: '123' })
    await authService.deleteUser(2)

    expect(apiClient.put).toHaveBeenCalledWith('/api/bff/auth/usuarios/1', {
      nombre: 'Ana',
    })
    expect(apiClient.put).toHaveBeenCalledWith('/api/bff/auth/usuarios/5', { nombre: 'Ana' })
    expect(apiClient.delete).toHaveBeenCalledWith('/api/bff/auth/usuarios/2')

    groupSpy.mockRestore()
    logSpy.mockRestore()
    groupEndSpy.mockRestore()
  })
})
