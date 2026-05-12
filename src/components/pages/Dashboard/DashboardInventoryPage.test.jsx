import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardInventoryPage } from './DashboardInventoryPage.jsx'

const mockInventarioService = vi.hoisted(() => ({
  listarProductos: vi.fn(),
  crearProducto: vi.fn(),
  registrarEntrada: vi.fn(),
  registrarSalida: vi.fn(),
  consultarStock: vi.fn(),
  historialMovimientos: vi.fn(),
  eliminarProducto: vi.fn(),
}))

vi.mock('../../../services/inventarioService.js', () => ({
  inventarioService: mockInventarioService,
}))

const products = [
  {
    sku: 'SKU-1',
    nombre: 'Mouse',
    descripcion: 'Wireless',
    stockTotalConsolidado: 10,
    estadoStock: 'OK',
    umbralMinimo: 2,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockInventarioService.listarProductos.mockResolvedValue(products)
  mockInventarioService.crearProducto.mockResolvedValue({ sku: 'SKU-2' })
  mockInventarioService.registrarEntrada.mockResolvedValue({})
  mockInventarioService.registrarSalida.mockResolvedValue({})
  mockInventarioService.consultarStock.mockResolvedValue({
    estado: 'OK',
    producto: { nombre: 'Mouse' },
    stockTotalConsolidado: 10,
    umbralMinimo: 2,
  })
  mockInventarioService.historialMovimientos.mockResolvedValue([])
  mockInventarioService.eliminarProducto.mockResolvedValue({})
})

describe('DashboardInventoryPage', () => {
  it('shows products after selecting products view', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))

    expect(await screen.findByText('SKU-1')).toBeInTheDocument()
  })

  it('creates a product from the modal', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))
    await screen.findByText('SKU-1')

    fireEvent.click(screen.getByRole('button', { name: /crear producto/i }))

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Teclado' },
    })
    fireEvent.change(screen.getByLabelText(/descripcion/i), {
      target: { value: 'Mecanico' },
    })
    fireEvent.change(screen.getByLabelText(/umbral/i), {
      target: { value: '3' },
    })

    const buttons = screen.getAllByRole('button', { name: /crear producto/i })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(mockInventarioService.crearProducto).toHaveBeenCalledWith({
        nombre: 'Teclado',
        descripcion: 'Mecanico',
        umbralMinimo: 3,
      })
    )
  })

  it('registers stock entry and refreshes data', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))
    await screen.findByText('SKU-1')

    fireEvent.click(screen.getByRole('button', { name: /entrada/i }))

    fireEvent.change(screen.getByLabelText(/origen/i), {
      target: { value: 'Proveedor' },
    })
    fireEvent.change(screen.getByLabelText(/cantidad/i), {
      target: { value: '2' },
    })

    fireEvent.click(screen.getByRole('button', { name: /registrar entrada/i }))

    await waitFor(() =>
      expect(mockInventarioService.registrarEntrada).toHaveBeenCalledWith({
        sku: 'SKU-1',
        origen: 'Proveedor',
        cantidad: 2,
      })
    )
    await waitFor(() =>
      expect(mockInventarioService.consultarStock).toHaveBeenCalledWith('SKU-1')
    )
    await waitFor(() =>
      expect(mockInventarioService.historialMovimientos).toHaveBeenCalledWith('SKU-1')
    )
  })

  it('deletes a product from the table', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))
    await screen.findByText('SKU-1')

    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    const buttons = screen.getAllByRole('button', { name: /eliminar/i })
    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() =>
      expect(mockInventarioService.eliminarProducto).toHaveBeenCalledWith('SKU-1')
    )
  })

  it('shows validation error when entry origin is missing', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))
    await screen.findByText('SKU-1')

    fireEvent.click(screen.getByRole('button', { name: /entrada/i }))

    const originInput = screen.getByLabelText(/origen/i)
    originInput.required = false

    fireEvent.change(screen.getByLabelText(/cantidad/i), {
      target: { value: '1' },
    })

    const dialog = screen.getByRole('dialog')
    const form = dialog.querySelector('form')
    form.noValidate = true
    fireEvent.submit(form)

    expect(
      await screen.findByText(/debes indicar el origen de la entrada/i)
    ).toBeInTheDocument()
  })

  it('shows validation error when salida quantity is zero', async () => {
    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver productos/i }))
    await screen.findByText('SKU-1')

    fireEvent.click(screen.getByRole('button', { name: /salida/i }))

    fireEvent.change(screen.getByLabelText(/destino/i), {
      target: { value: 'Cliente' },
    })
    fireEvent.change(screen.getByLabelText(/cantidad/i), {
      target: { value: '0' },
    })

    const dialog = screen.getByRole('dialog')
    const form = dialog.querySelector('form')
    form.noValidate = true
    fireEvent.submit(form)

    expect(await screen.findByText(/la cantidad debe ser mayor a 0/i)).toBeInTheDocument()
  })

  it('shows empty stock modal when no SKU is selected', async () => {
    mockInventarioService.listarProductos.mockResolvedValueOnce([])

    render(<DashboardInventoryPage />)

    fireEvent.click(screen.getByRole('button', { name: /ver movimientos/i }))

    fireEvent.click(screen.getByRole('button', { name: /consultar stock/i }))

    expect(await screen.findByText(/ingresa un sku para ver el stock/i)).toBeInTheDocument()
  })
})
