import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetUnauthorizedCallback = vi.hoisted(() => vi.fn())

vi.mock('../services/authService.js', () => ({
  setUnauthorizedCallback: mockSetUnauthorizedCallback,
}))

import { AuthProvider, useAuth } from './AuthContext.jsx'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

beforeEach(() => {
  localStorage.clear()
  mockSetUnauthorizedCallback.mockClear()
})

describe('AuthContext', () => {
  it('starts unauthenticated when storage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(mockSetUnauthorizedCallback).toHaveBeenCalledTimes(1)
  })

  it('stores user and token on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login({
        id: 1,
        nombre: 'Ana',
        correo: 'ana@demo.com',
        direccion: 'Main',
        telefono: '123',
        rol: 'ADMIN',
        jwt: 'token-1',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.nombre).toBe('Ana')
    expect(localStorage.getItem('authToken')).toBe('token-1')
  })

  it('clears state on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login({
        id: 1,
        nombre: 'Ana',
        correo: 'ana@demo.com',
        direccion: 'Main',
        telefono: '123',
        rol: 'ADMIN',
        jwt: 'token-1',
      })
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBe(null)
    expect(localStorage.getItem('authToken')).toBe(null)
  })

  it('updates user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.updateUser({ nombre: 'Luis', correo: 'luis@demo.com' })
      result.current.updateToken('token-2')
    })

    expect(result.current.user?.nombre).toBe('Luis')
    expect(localStorage.getItem('authToken')).toBe('token-2')
  })
})
