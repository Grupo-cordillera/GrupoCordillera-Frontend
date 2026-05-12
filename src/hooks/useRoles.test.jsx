import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetRoles = vi.hoisted(() => vi.fn())

vi.mock('../services/authService.js', () => ({
  authService: { getRoles: mockGetRoles },
}))

import { useRoles } from './useRoles.js'

beforeEach(() => {
  mockGetRoles.mockReset()
})

describe('useRoles', () => {
  it('loads roles', async () => {
    mockGetRoles.mockResolvedValueOnce([{ id: 1, nombre: 'Admin' }])

    const { result } = renderHook(() => useRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.roles).toHaveLength(1)
    expect(result.current.error).toBe(null)
  })

  it('handles errors', async () => {
    mockGetRoles.mockRejectedValueOnce(new Error('Failed'))

    const { result } = renderHook(() => useRoles())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed')
  })
})
