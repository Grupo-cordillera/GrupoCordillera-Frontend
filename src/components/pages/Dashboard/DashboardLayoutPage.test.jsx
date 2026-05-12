import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { DashboardLayoutPage } from './DashboardLayoutPage.jsx'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayoutPage />}>
          <Route index element={<div>Dashboard Child</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )

describe('DashboardLayoutPage', () => {
  it('shows admin navigation for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { nombre: 'Ana', rol: 'Admin' },
      logout: vi.fn(),
    })

    renderLayout()

    expect(screen.getByText(/ana/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
  })

  it('logs out and navigates to login', () => {
    const logout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: { nombre: 'Ana', rol: 'Admin' },
      logout,
    })

    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(logout).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('hides admin navigation for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { nombre: 'Ana', rol: 'Usuario' },
      logout: vi.fn(),
    })

    renderLayout()

    expect(screen.queryByRole('button', { name: /admin/i })).toBeNull()
  })
})
