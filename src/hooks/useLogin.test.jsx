import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuthLogin = vi.hoisted(() => vi.fn())
const mockServiceLogin = vi.hoisted(() => vi.fn())

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: mockAuthLogin }),
}))

vi.mock('../services/authService.js', () => ({
  authService: { login: mockServiceLogin },
}))

import { useLogin } from './useLogin.js'

beforeEach(() => {
  mockAuthLogin.mockReset()
  mockServiceLogin.mockReset()
})

describe('useLogin', () => {
  it('logs in and updates auth context', async () => {
    mockServiceLogin.mockResolvedValueOnce({ id: 1 })

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.login({ username: 'demo', password: '123' })
    })

    expect(mockServiceLogin).toHaveBeenCalledWith({ username: 'demo', password: '123' })
    expect(mockAuthLogin).toHaveBeenCalledWith({ id: 1 })
    expect(result.current.error).toBe(null)
  })

  it('sets error on failure', async () => {
    const error = new Error('Boom')
    mockServiceLogin.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useLogin())

    let caughtError = null
    await act(async () => {
      try {
        await result.current.login({ username: 'demo', password: '123' })
      } catch (err) {
        caughtError = err
      }
    })

    expect(caughtError).toBe(error)

    await waitFor(() => expect(result.current.error).toBe('Boom'))
  })
})
