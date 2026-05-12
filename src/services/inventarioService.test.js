import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./authService.js', () => ({
  default: apiClient,
}))

import { inventarioService } from './inventarioService.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('inventarioService', () => {
  it('calls inventory endpoints', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: ['list'] })
      .mockResolvedValueOnce({ data: { stock: 10 } })
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: [{ id: 2 }] })
    apiClient.post
      .mockResolvedValueOnce({ data: { sku: 'SKU-1' } })
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: { ok: true } })
    apiClient.delete.mockResolvedValueOnce({})

    await expect(inventarioService.listarProductos()).resolves.toEqual(['list'])
    await expect(inventarioService.crearProducto({ nombre: 'Mouse' })).resolves.toEqual({
      sku: 'SKU-1',
    })
    await expect(inventarioService.registrarEntrada({ sku: 'SKU-1' })).resolves.toEqual({
      ok: true,
    })
    await expect(inventarioService.registrarSalida({ sku: 'SKU-1' })).resolves.toEqual({
      ok: true,
    })
    await expect(
      inventarioService.calcularMetricas('SKU-1', { precioVenta: 10 })
    ).resolves.toEqual({ ok: true })
    await expect(inventarioService.consultarStock('SKU-1')).resolves.toEqual({
      stock: 10,
    })
    await expect(inventarioService.historialMovimientos('SKU-1')).resolves.toEqual([
      { id: 1 },
    ])
    await expect(inventarioService.obtenerMetricas('SKU-1')).resolves.toEqual([{ id: 2 }])
    await expect(inventarioService.eliminarProducto('SKU-1')).resolves.toBeUndefined()

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/api/bff/inventario/productos')
    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/api/bff/inventario/productos', {
      nombre: 'Mouse',
    })
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/api/bff/inventario/stock/entrada', {
      sku: 'SKU-1',
    })
    expect(apiClient.post).toHaveBeenNthCalledWith(3, '/api/bff/inventario/stock/salida', {
      sku: 'SKU-1',
    })
    expect(apiClient.post).toHaveBeenNthCalledWith(4, '/api/bff/inventario/metricas/SKU-1', {
      precioVenta: 10,
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/api/bff/inventario/productos/SKU-1')
  })
})
