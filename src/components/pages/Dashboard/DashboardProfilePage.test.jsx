import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardProfilePage } from './DashboardProfilePage.jsx'

const mockUpdateCurrentUser = vi.hoisted(() => vi.fn())
const mockChangePassword = vi.hoisted(() => vi.fn())
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../services/authService.js', () => ({
  authService: {
    updateCurrentUser: mockUpdateCurrentUser,
    changeCurrentUserPassword: mockChangePassword,
  },
}))

vi.mock('../../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

const renderProfile = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/profile']}>
      <Routes>
        <Route path="/dashboard/profile" element={<DashboardProfilePage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardProfilePage', () => {
  it('saves profile updates without password change', async () => {
    const updateUser = vi.fn()
    mockUseAuth.mockReturnValue({
      user: {
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        direccion: 'Old',
        telefono: '123',
        rol: 'Admin',
      },
      logout: vi.fn(),
      updateUser,
    })
    mockUpdateCurrentUser.mockResolvedValueOnce()
    mockChangePassword.mockResolvedValueOnce()

    renderProfile()

    expect(screen.getByLabelText(/correo/i)).toHaveValue('ana@demo.com')

    fireEvent.change(screen.getByLabelText(/direccion/i), {
      target: { value: 'New St' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() =>
      expect(mockUpdateCurrentUser).toHaveBeenCalledWith({
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        direccion: 'New St',
        telefono: '123',
      })
    )

    expect(mockChangePassword).not.toHaveBeenCalled()
    expect(updateUser).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'Lopez',
      correo: 'ana@demo.com',
      direccion: 'New St',
      telefono: '123',
      rol: 'Admin',
    })
    expect(screen.getByText(/perfil actualizado correctamente/i)).toBeInTheDocument()
  })

  it('logs out when email changes', async () => {
    const logout = vi.fn()
    const updateUser = vi.fn()

    mockUseAuth.mockReturnValue({
      user: {
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        direccion: 'Old',
        telefono: '123',
        rol: 'Admin',
      },
      logout,
      updateUser,
    })
    mockUpdateCurrentUser.mockResolvedValueOnce()
    mockChangePassword.mockResolvedValueOnce()

    renderProfile()

    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { value: 'new@demo.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => expect(mockUpdateCurrentUser).toHaveBeenCalledTimes(1))

    expect(await screen.findByText(/correo ha cambiado/i)).toBeInTheDocument()

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1), { timeout: 3000 })
    await waitFor(() => expect(screen.getByText(/login page/i)).toBeInTheDocument(), {
      timeout: 3000,
    })
  }, 7000)

  it('updates password when provided', async () => {
    const updateUser = vi.fn()
    mockUseAuth.mockReturnValue({
      user: {
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        direccion: 'Old',
        telefono: '123',
        rol: 'Admin',
      },
      logout: vi.fn(),
      updateUser,
    })
    mockUpdateCurrentUser.mockResolvedValueOnce()
    mockChangePassword.mockResolvedValueOnce()

    renderProfile()

    fireEvent.change(screen.getByLabelText(/nueva contrase/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() =>
      expect(mockChangePassword).toHaveBeenCalledWith({ newPassword: 'secret123' })
    )

    expect(screen.getByText(/perfil actualizado correctamente/i)).toBeInTheDocument()
  })
})
