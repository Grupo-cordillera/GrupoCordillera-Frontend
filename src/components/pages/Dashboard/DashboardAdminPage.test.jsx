import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardAdminPage } from './DashboardAdminPage.jsx'

const mockUseAuth = vi.hoisted(() => vi.fn())
const mockUseRoles = vi.hoisted(() => vi.fn())
const mockGetUsers = vi.hoisted(() => vi.fn())
const mockUpdateUser = vi.hoisted(() => vi.fn())
const mockChangeUserPassword = vi.hoisted(() => vi.fn())
const mockRegister = vi.hoisted(() => vi.fn())
const mockDeleteUser = vi.hoisted(() => vi.fn())

vi.mock('../../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../../../hooks/useRoles.js', () => ({
  useRoles: () => mockUseRoles(),
}))

vi.mock('../../../services/authService.js', () => ({
  authService: {
    getUsers: mockGetUsers,
    updateUser: mockUpdateUser,
    changeUserPassword: mockChangeUserPassword,
    register: mockRegister,
    deleteUser: mockDeleteUser,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardAdminPage', () => {
  it('shows restricted message for non admins', () => {
    mockUseAuth.mockReturnValue({ user: { rol: 'Usuario' } })
    mockUseRoles.mockReturnValue({ roles: [] })

    render(<DashboardAdminPage />)

    expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument()
  })

  it('loads users and opens create form for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { rol: 'Admin' } })
    mockUseRoles.mockReturnValue({
      roles: [{ id: 1, nombre: 'Admin', numeroRol: 1 }],
    })
    mockGetUsers.mockResolvedValue([
      {
        id: 1,
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        rol: { nombre: 'Admin', numero_rol: 1 },
      },
    ])

    render(<DashboardAdminPage />)

    expect(await screen.findByText(/ana@demo.com/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  })

  it('creates a new user', async () => {
    mockUseAuth.mockReturnValue({ user: { rol: 'Admin' } })
    mockUseRoles.mockReturnValue({
      roles: [{ id: 1, nombre: 'Admin', numeroRol: 1 }],
    })
    mockGetUsers.mockResolvedValue([])
    mockRegister.mockResolvedValueOnce({})

    render(<DashboardAdminPage />)

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }))

    const createForm = screen.getByRole('heading', { name: /crear usuario/i }).closest('form')

    createForm.noValidate = true

    fireEvent.change(within(createForm).getByLabelText(/nombre/i), {
      target: { value: 'Ana' },
    })
    fireEvent.change(within(createForm).getByLabelText(/apellido/i), {
      target: { value: 'Lopez' },
    })
    fireEvent.change(within(createForm).getByLabelText(/correo/i), {
      target: { value: 'ana@demo.com' },
    })
    fireEvent.change(within(createForm).getByLabelText(/direccion/i), {
      target: { value: 'Main' },
    })
    fireEvent.change(within(createForm).getByLabelText(/telefono/i), {
      target: { value: '123' },
    })
    fireEvent.change(within(createForm).getByLabelText(/rol/i), {
      target: { value: '1' },
    })
    fireEvent.change(within(createForm).getByLabelText(/contrase(?:ña|na)/i), {
      target: { value: 'secret123' },
    })

    fireEvent.submit(createForm)

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/usuario creado correctamente/i)).toBeInTheDocument()
    expect(mockRegister).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'Lopez',
      correo: 'ana@demo.com',
      direccion: 'Main',
      telefono: '123',
      numero_rol: 1,
      contrasena: 'secret123',
    })
  })

  it('edits user and updates password', async () => {
    mockUseAuth.mockReturnValue({ user: { rol: 'Admin' } })
    mockUseRoles.mockReturnValue({
      roles: [{ id: 1, nombre: 'Admin', numeroRol: 1 }],
    })
    mockGetUsers.mockResolvedValue([
      {
        id: 1,
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        direccion: 'Main',
        telefono: '123',
        rol: { numero_rol: 1 },
      },
    ])
    mockUpdateUser.mockResolvedValueOnce({})
    mockChangeUserPassword.mockResolvedValueOnce({})

    render(<DashboardAdminPage />)

    expect(await screen.findByText(/ana@demo.com/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /editar/i }))

    const editForm = screen.getByRole('heading', { name: /editar usuario/i }).closest('form')

    fireEvent.change(screen.getByLabelText(/telefono/i), {
      target: { value: '999' },
    })
    fireEvent.change(within(editForm).getByLabelText(/nueva contrase(?:ña|na)/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(await screen.findByText(/usuario actualizado correctamente/i)).toBeInTheDocument()
    expect(mockUpdateUser).toHaveBeenCalledWith(1, {
      nombre: 'Ana',
      apellido: 'Lopez',
      correo: 'ana@demo.com',
      direccion: 'Main',
      telefono: '999',
      numero_rol: 1,
    })
    expect(mockChangeUserPassword).toHaveBeenCalledWith(1, {
      newPassword: 'secret123',
    })
  })

  it('deletes a user after confirmation', async () => {
    mockUseAuth.mockReturnValue({ user: { rol: 'Admin' } })
    mockUseRoles.mockReturnValue({ roles: [] })
    mockGetUsers.mockResolvedValue([
      {
        id: 1,
        nombre: 'Ana',
        apellido: 'Lopez',
        correo: 'ana@demo.com',
        rol: { nombre_rol: 'Admin' },
      },
    ])
    mockDeleteUser.mockResolvedValueOnce({})
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<DashboardAdminPage />)

    expect(await screen.findByText(/ana@demo.com/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(mockDeleteUser).toHaveBeenCalledWith(1)

    confirmSpy.mockRestore()
  })
})
