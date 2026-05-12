import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../atoms/Button/Button.jsx'
import { inventarioService } from '../../../services/inventarioService.js'
import '../../../styles/pages/dashboard.css'

const defaultMetricsForm = {
  sku: '',
  precioVenta: '',
  costoOperativo: '',
}

const parseNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return Number(value).toFixed(2)
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export const DashboardMetricsPage = () => {
  const [productos, setProductos] = useState([])
  const [metricsHistory, setMetricsHistory] = useState([])
  const [lastMetric, setLastMetric] = useState(null)
  const [metricsForm, setMetricsForm] = useState(defaultMetricsForm)
  const [activeModal, setActiveModal] = useState(null)
  const [skuPickerOpen, setSkuPickerOpen] = useState(false)
  const [historyRequested, setHistoryRequested] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const skuOptions = useMemo(() => {
    const skus = productos.map((producto) => producto.sku).filter(Boolean)
    return Array.from(new Set(skus))
  }, [productos])

  const selectedProduct = useMemo(() => {
    if (!metricsForm.sku) return null
    return productos.find((producto) => producto.sku === metricsForm.sku) || null
  }, [metricsForm.sku, productos])

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message })
  }, [])

  const openModal = (modalType) => {
    setFeedback(null)
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const loadProductos = useCallback(async () => {
    setListLoading(true)
    try {
      const data = await inventarioService.listarProductos()
      setProductos(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el listado de productos.'
      showFeedback('error', message)
    } finally {
      setListLoading(false)
    }
  }, [showFeedback])

  useEffect(() => {
    void loadProductos()
  }, [loadProductos])

  useEffect(() => {
    if (!metricsForm.sku && skuOptions.length > 0) {
      setMetricsForm((current) => ({
        ...current,
        sku: skuOptions[0],
      }))
    }
  }, [metricsForm.sku, skuOptions])

  const loadMetricas = async (sku) => {
    if (!sku) {
      showFeedback('error', 'Selecciona un SKU para consultar el historial.')
      return false
    }

    setHistoryLoading(true)
    try {
      const data = await inventarioService.obtenerMetricas(sku)
      setMetricsHistory(data)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el historial de metricas.'
      showFeedback('error', message)
      return false
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleMetricsInputChange = (field, value) => {
    setMetricsForm((current) => ({
      ...current,
      [field]: value,
    }))

    if (field === 'sku') {
      setMetricsHistory([])
      setLastMetric(null)
      setHistoryRequested(false)
    }
  }

  const toggleSkuPicker = () => {
    setSkuPickerOpen((current) => !current)
  }

  const handleSelectSku = (sku) => {
    handleMetricsInputChange('sku', sku)
    setSkuPickerOpen(false)
  }

  const handleCalculateMetrics = async (event) => {
    event.preventDefault()
    setCalcLoading(true)
    setFeedback(null)

    try {
      const sku = metricsForm.sku.trim()
      if (!sku) {
        showFeedback('error', 'Debes indicar el SKU para calcular las metricas.')
        return
      }

      const payload = {
        precioVenta: parseNumber(metricsForm.precioVenta),
        costoOperativo: parseNumber(metricsForm.costoOperativo),
      }

      const latest = await inventarioService.calcularMetricas(sku, payload)
      setLastMetric(latest)
      showFeedback('success', 'Metricas calculadas correctamente.')
      await loadMetricas(sku)
      setHistoryRequested(true)
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron calcular las metricas.'
      showFeedback('error', message)
    } finally {
      setCalcLoading(false)
    }
  }

  const handleRefreshHistory = async () => {
    setFeedback(null)
    const sku = metricsForm.sku.trim()
    if (!sku) {
      showFeedback('error', 'Debes seleccionar un SKU para cargar el historial.')
      return
    }

    setHistoryRequested(true)
    await loadMetricas(sku)
  }

  const handleClearHistory = () => {
    setMetricsHistory([])
    setHistoryRequested(false)
  }

  const latestMetric = useMemo(() => {
    if (lastMetric) return lastMetric
    if (metricsHistory.length === 0) return null
    return metricsHistory[0]
  }, [lastMetric, metricsHistory])

  return (
    <div className="dashboard-panels">
      <section className="metrics-panel active">
        <div className="metrics-panel__head">
          <div>
            <h2>Metricas y estadisticas</h2>
            <p>Calcula rentabilidad y revisa el historial por producto.</p>
          </div>
          <div className="metrics-panel__actions">
            <Button variant="secondary" onClick={loadProductos} isLoading={listLoading}>
              Recargar productos
            </Button>
          </div>
        </div>

        {feedback?.message && (
          <div className={`admin-feedback admin-feedback--${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="metrics-hero">
          <div className="metrics-hero__intro">
            <span className="metrics-hero__eyebrow">Panel de rentabilidad</span>
            <h3>Analisis por producto</h3>
            <p>Define un SKU, calcula indicadores y consulta el historial cuando lo necesites.</p>
            <div className="metrics-hero__meta">
              <span className="metrics-tag">SKU: {metricsForm.sku || 'Sin seleccionar'}</span>
              {selectedProduct && (
                <span className="metrics-tag metrics-tag--soft">{selectedProduct.nombre}</span>
              )}
            </div>
            <div className={`metrics-sku-bar ${skuPickerOpen ? 'metrics-sku-bar--open' : ''}`}>
              <button type="button" className="metrics-sku-bar__header" onClick={toggleSkuPicker}>
                <span className="metrics-sku-bar__label">SKU activo</span>
                <span className="metrics-sku-bar__value">
                  {metricsForm.sku || 'Selecciona un SKU'}
                </span>
                <span className="metrics-sku-bar__chevron">{skuPickerOpen ? '▲' : '▼'}</span>
              </button>
              <div className="metrics-sku-bar__list">
                {skuOptions.length > 0 ? (
                  skuOptions.map((sku) => (
                    <button
                      key={sku}
                      type="button"
                      className={`metrics-sku-bar__item ${metricsForm.sku === sku ? 'is-active' : ''}`}
                      onClick={() => handleSelectSku(sku)}
                    >
                      {sku}
                    </button>
                  ))
                ) : (
                  <div className="metrics-sku-bar__empty">No hay SKUs disponibles.</div>
                )}
              </div>
            </div>
          </div>
          <div className="metrics-hero__actions">
            <Button onClick={() => openModal('calculate')}>Calcular rentabilidad</Button>
          </div>
        </div>

        <div className="metrics-kpis">
          <div className="metrics-kpi-card">
            <div className="metrics-kpi-card__label">Margen de ganancia</div>
            <div className="metrics-kpi-card__value">
              {formatNumber(latestMetric?.margenGanancia)}
            </div>
          </div>
          <div className="metrics-kpi-card">
            <div className="metrics-kpi-card__label">ROI</div>
            <div className="metrics-kpi-card__value">
              {formatNumber(latestMetric?.roi)}
            </div>
          </div>
          <div className="metrics-kpi-card">
            <div className="metrics-kpi-card__label">Costo operativo</div>
            <div className="metrics-kpi-card__value">
              {formatNumber(latestMetric?.costoOperativo)}
            </div>
          </div>
          <div className="metrics-kpi-card">
            <div className="metrics-kpi-card__label">Fecha de calculo</div>
            <div className="metrics-kpi-card__value">
              {formatDate(latestMetric?.fechaCalculo)}
            </div>
          </div>
        </div>

        {!latestMetric && (
          <div className="metrics-hint">
            Ejecuta un calculo para ver las estadisticas principales.
          </div>
        )}

        <div className="metrics-history">
          <div className="metrics-history__head">
            <div>
              <h3>Historial de calculos</h3>
              <p>
                {metricsForm.sku
                  ? `SKU actual: ${metricsForm.sku}`
                  : 'Selecciona un SKU para cargar resultados.'}
              </p>
            </div>
            <div className="metrics-history__actions">
              <Button variant="secondary" onClick={handleRefreshHistory} isLoading={historyLoading}>
                Actualizar historial
              </Button>
              <Button
                variant="secondary"
                onClick={handleClearHistory}
                disabled={!historyRequested && metricsHistory.length === 0}
              >
                Limpiar historial
              </Button>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Margen</th>
                  <th>Costo</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {metricsHistory.map((metric) => (
                  <tr key={metric.id}>
                    <td>{formatDate(metric.fechaCalculo)}</td>
                    <td>{metric.producto?.nombre || metric.producto?.sku || metricsForm.sku}</td>
                    <td>{formatNumber(metric.margenGanancia)}</td>
                    <td>{formatNumber(metric.costoOperativo)}</td>
                    <td>{formatNumber(metric.roi)}</td>
                  </tr>
                ))}
                {!historyLoading && metricsHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      {historyRequested
                        ? 'No hay metricas para mostrar.'
                        : 'Selecciona un SKU y actualiza el historial.'}
                    </td>
                  </tr>
                )}
                {historyLoading && (
                  <tr>
                    <td colSpan={5} className="admin-empty">Cargando metricas...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {activeModal === 'calculate' && (
          <Modal title="Calcular rentabilidad" onClose={closeModal}>
            <form className="modal-form" onSubmit={handleCalculateMetrics}>
              <div className="inventory-selected">SKU: {metricsForm.sku || 'Sin seleccionar'}</div>
              <div className="admin-form__grid">
                <label>
                  Precio de venta
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={metricsForm.precioVenta}
                    onChange={(event) => handleMetricsInputChange('precioVenta', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Costo operativo
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={metricsForm.costoOperativo}
                    onChange={(event) => handleMetricsInputChange('costoOperativo', event.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <Button type="submit" isLoading={calcLoading}>
                  Calcular metricas
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </section>
    </div>
  )
}
