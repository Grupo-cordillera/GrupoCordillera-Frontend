import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardHomePage } from './DashboardHomePage.jsx'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('DashboardHomePage', () => {
  it('renders user details', () => {
    mockUseAuth.mockReturnValue({
      user: {
        nombre: 'Ana',
        correo: 'ana@demo.com',
        telefono: '123',
        direccion: 'Main',
        rol: 'Admin',
      },
    })

    render(<DashboardHomePage />)

    const nameRow = screen.getByText(/nombre:/i).closest('p')
    const emailRow = screen.getByText(/correo:/i).closest('p')
    const roleRow = screen.getByText(/rol:/i).closest('p')

    expect(nameRow).toHaveTextContent('Ana')
    expect(emailRow).toHaveTextContent('ana@demo.com')
    expect(roleRow).toHaveTextContent('Admin')
  })
})
