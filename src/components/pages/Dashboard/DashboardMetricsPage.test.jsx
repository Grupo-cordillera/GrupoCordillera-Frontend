import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardMetricsPage } from './DashboardMetricsPage.jsx'

const mockInventarioService = vi.hoisted(() => ({
  listarProductos: vi.fn(),
  calcularMetricas: vi.fn(),
  obtenerMetricas: vi.fn(),
}))

vi.mock('../../../services/inventarioService.js', () => ({
  inventarioService: mockInventarioService,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockInventarioService.listarProductos.mockResolvedValue([
    { sku: 'SKU-1', nombre: 'Mouse' },
  ])
  mockInventarioService.calcularMetricas.mockResolvedValue({
    id: 1,
    margenGanancia: 20,
    roi: 5,
    costoOperativo: 10,
    fechaCalculo: '2024-01-01',
  })
  mockInventarioService.obtenerMetricas.mockResolvedValue([
    {
      id: 2,
      margenGanancia: 20,
      roi: 5,
      costoOperativo: 10,
      fechaCalculo: '2024-01-01',
      producto: { nombre: 'Mouse' },
    },
  ])
})

describe('DashboardMetricsPage', () => {
  it('calculates metrics and loads history', async () => {
    render(<DashboardMetricsPage />)

    await screen.findByText(/analisis por producto/i)

    fireEvent.click(screen.getByRole('button', { name: /calcular rentabilidad/i }))

    fireEvent.change(screen.getByLabelText(/precio de venta/i), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText(/costo operativo/i), {
      target: { value: '50' },
    })

    fireEvent.click(screen.getByRole('button', { name: /calcular metricas/i }))

    await waitFor(() =>
      expect(mockInventarioService.calcularMetricas).toHaveBeenCalledWith('SKU-1', {
        precioVenta: 100,
        costoOperativo: 50,
      })
    )
    await waitFor(() =>
      expect(mockInventarioService.obtenerMetricas).toHaveBeenCalledWith('SKU-1')
    )

    expect(await screen.findByText(/metricas calculadas/i)).toBeInTheDocument()

    const historyTable = screen.getByRole('table')
    expect(within(historyTable).getByText(/mouse/i)).toBeInTheDocument()
  })

  it('shows error when refreshing history without SKU', async () => {
    mockInventarioService.listarProductos.mockResolvedValueOnce([])

    render(<DashboardMetricsPage />)

    fireEvent.click(screen.getByRole('button', { name: /actualizar historial/i }))

    expect(await screen.findByText(/debes seleccionar un sku/i)).toBeInTheDocument()
  })

  it('clears history and shows hint message', async () => {
    render(<DashboardMetricsPage />)

    fireEvent.click(screen.getByRole('button', { name: /actualizar historial/i }))

    expect(await screen.findByText(/mouse/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /limpiar historial/i }))

    expect(
      await screen.findByText(/selecciona un sku y actualiza el historial/i)
    ).toBeInTheDocument()
  })
})
