import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute.jsx'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>Private Area</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, token: null })

    renderRoute()

    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, token: 'token-1' })

    renderRoute()

    expect(screen.getByText(/private area/i)).toBeInTheDocument()
  })
})
