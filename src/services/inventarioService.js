import apiClient from './authService.js'

export const inventarioService = {
  listarProductos: async () => {
    const response = await apiClient.get('/api/bff/inventario/productos')
    return response.data
  },

  crearProducto: async (data) => {
    const response = await apiClient.post('/api/bff/inventario/productos', data)
    return response.data
  },

  eliminarProducto: async (sku) => {
    await apiClient.delete(`/api/bff/inventario/productos/${sku}`)
  },

  registrarEntrada: async (data) => {
    const response = await apiClient.post('/api/bff/inventario/stock/entrada', data)
    return response.data
  },

  registrarSalida: async (data) => {
    const response = await apiClient.post('/api/bff/inventario/stock/salida', data)
    return response.data
  },

  consultarStock: async (sku) => {
    const response = await apiClient.get(`/api/bff/inventario/stock/${sku}`)
    return response.data
  },

  historialMovimientos: async (sku) => {
    const response = await apiClient.get(`/api/bff/inventario/movimientos/${sku}`)
    return response.data
  },

  calcularMetricas: async (sku, data) => {
    const response = await apiClient.post(`/api/bff/inventario/metricas/${sku}`, data)
    return response.data
  },

  obtenerMetricas: async (sku) => {
    const response = await apiClient.get(`/api/bff/inventario/metricas/${sku}`)
    return response.data
  },
}
