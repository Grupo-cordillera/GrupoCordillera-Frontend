import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../atoms/Button/Button.jsx'
import { inventarioService } from '../../../services/inventarioService.js'
import '../../../styles/pages/dashboard.css'

const defaultCreateForm = {
  nombre: '',
  descripcion: '',
  umbralMinimo: '',
}

const defaultEntradaForm = {
  sku: '',
  origen: '',
  cantidad: '',
}

const defaultSalidaForm = {
  sku: '',
  destino: '',
  cantidad: '',
}

const parseNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
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

export const DashboardInventoryPage = () => {
  const [productos, setProductos] = useState([])
  const [activeView, setActiveView] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [entradaLoading, setEntradaLoading] = useState(false)
  const [salidaLoading, setSalidaLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [deleteSku, setDeleteSku] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [createForm, setCreateForm] = useState(defaultCreateForm)
  const [entradaForm, setEntradaForm] = useState(defaultEntradaForm)
  const [salidaForm, setSalidaForm] = useState(defaultSalidaForm)
  const [selectedSku, setSelectedSku] = useState('')
  const [stockInfo, setStockInfo] = useState(null)
  const [movements, setMovements] = useState([])

  const skuOptions = useMemo(() => {
    const skus = productos.map((producto) => producto.sku).filter(Boolean)
    return Array.from(new Set(skus))
  }, [productos])

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message })
  }, [])

  const openModal = (modalType) => {
    setFeedback(null)
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
    setDeleteCandidate(null)
  }

  const handleSelectView = (view) => {
    setActiveView(view)
    setFeedback(null)
    setActiveModal(null)
  }

  const handleResetView = () => {
    setActiveView(null)
    closeModal()
  }

  const loadProductos = useCallback(async () => {
    setListLoading(true)
    try {
      const data = await inventarioService.listarProductos()
      setProductos(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el inventario.'
      showFeedback('error', message)
    } finally {
      setListLoading(false)
    }
  }, [showFeedback])

  useEffect(() => {
    void loadProductos()
  }, [loadProductos])

  useEffect(() => {
    if (!selectedSku && skuOptions.length > 0) {
      const nextSku = skuOptions[0]
      setSelectedSku(nextSku)
      setEntradaForm((current) => ({
        ...current,
        sku: nextSku,
      }))
      setSalidaForm((current) => ({
        ...current,
        sku: nextSku,
      }))
    }
  }, [selectedSku, skuOptions])

  const handleSkuChange = (value) => {
    setSelectedSku(value)
    setEntradaForm((current) => ({
      ...current,
      sku: value,
    }))
    setSalidaForm((current) => ({
      ...current,
      sku: value,
    }))
  }

  const openEntradaModalForSku = (sku) => {
    if (sku) {
      handleSkuChange(sku)
    }
    openModal('entrada')
  }

  const openSalidaModalForSku = (sku) => {
    if (sku) {
      handleSkuChange(sku)
    }
    openModal('salida')
  }

  const openStockModalForSku = (sku) => {
    if (sku) {
      handleSkuChange(sku)
    }
    setActiveView('movimientos')
    openModal('stock')
    if (sku) {
      void fetchStock(sku)
    }
  }

  const openMovementsModalForSku = (sku) => {
    if (sku) {
      handleSkuChange(sku)
    }
    setActiveView('movimientos')
    openModal('movements')
    if (sku) {
      void fetchMovements(sku)
    }
  }

  const fetchStock = async (sku) => {
    if (!sku) {
      showFeedback('error', 'Selecciona un SKU para consultar el stock.')
      return false
    }

    setStockLoading(true)
    try {
      const data = await inventarioService.consultarStock(sku)
      setStockInfo(data)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo consultar el stock.'
      showFeedback('error', message)
      return false
    } finally {
      setStockLoading(false)
    }
  }

  const fetchMovements = async (sku) => {
    if (!sku) {
      showFeedback('error', 'Selecciona un SKU para ver los movimientos.')
      return false
    }

    setMovementsLoading(true)
    try {
      const data = await inventarioService.historialMovimientos(sku)
      setMovements(data)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el historial de movimientos.'
      showFeedback('error', message)
      return false
    } finally {
      setMovementsLoading(false)
    }
  }

  const handleCreateInputChange = (field, value) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleEntradaInputChange = (field, value) => {
    setEntradaForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSalidaInputChange = (field, value) => {
    setSalidaForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setCreateLoading(true)
    setFeedback(null)

    try {
      const payload = {
        nombre: createForm.nombre.trim(),
        descripcion: createForm.descripcion.trim(),
        umbralMinimo: parseNumber(createForm.umbralMinimo),
      }

      await inventarioService.crearProducto(payload)
      showFeedback('success', 'Producto creado correctamente.')
      setCreateForm(defaultCreateForm)
      await loadProductos()
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el producto.'
      showFeedback('error', message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEntradaStock = async (event) => {
    event.preventDefault()
    setEntradaLoading(true)
    setFeedback(null)

    try {
      const payload = {
        sku: entradaForm.sku.trim(),
        origen: entradaForm.origen.trim(),
        cantidad: parseNumber(entradaForm.cantidad),
      }

      if (!payload.sku) {
        showFeedback('error', 'Debes indicar el SKU para registrar la entrada.')
        return
      }

      if (!payload.origen) {
        showFeedback('error', 'Debes indicar el origen de la entrada.')
        return
      }

      if (payload.cantidad <= 0) {
        showFeedback('error', 'La cantidad debe ser mayor a 0.')
        return
      }

      await inventarioService.registrarEntrada(payload)
      showFeedback('success', 'Entrada registrada correctamente.')
      setEntradaForm((current) => ({
        ...defaultEntradaForm,
        sku: payload.sku,
      }))
      await loadProductos()

      if (selectedSku === payload.sku) {
        await fetchStock(payload.sku)
        await fetchMovements(payload.sku)
      }

      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar la entrada.'
      showFeedback('error', message)
    } finally {
      setEntradaLoading(false)
    }
  }

  const handleSalidaStock = async (event) => {
    event.preventDefault()
    setSalidaLoading(true)
    setFeedback(null)

    try {
      const payload = {
        sku: salidaForm.sku.trim(),
        destino: salidaForm.destino.trim(),
        cantidad: parseNumber(salidaForm.cantidad),
      }

      if (!payload.sku) {
        showFeedback('error', 'Debes indicar el SKU para registrar la salida.')
        return
      }

      if (!payload.destino) {
        showFeedback('error', 'Debes indicar el destino de la salida.')
        return
      }

      if (payload.cantidad <= 0) {
        showFeedback('error', 'La cantidad debe ser mayor a 0.')
        return
      }

      await inventarioService.registrarSalida(payload)
      showFeedback('success', 'Salida registrada correctamente.')
      setSalidaForm((current) => ({
        ...defaultSalidaForm,
        sku: payload.sku,
      }))
      await loadProductos()

      if (selectedSku === payload.sku) {
        await fetchStock(payload.sku)
        await fetchMovements(payload.sku)
      }

      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar la salida.'
      showFeedback('error', message)
    } finally {
      setSalidaLoading(false)
    }
  }

  const handleDeleteProduct = (sku) => {
    setDeleteCandidate(sku)
    openModal('delete')
  }

  const confirmDeleteProduct = async () => {
    if (!deleteCandidate) return

    setDeleteSku(deleteCandidate)
    setFeedback(null)

    try {
      await inventarioService.eliminarProducto(deleteCandidate)
      showFeedback('success', 'Producto eliminado correctamente.')
      if (selectedSku === deleteCandidate) {
        setSelectedSku('')
        setStockInfo(null)
        setMovements([])
      }
      await loadProductos()
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el producto.'
      showFeedback('error', message)
    } finally {
      setDeleteSku(null)
    }
  }

  const handleFocusProduct = (sku) => {
    openMovementsModalForSku(sku)
  }

  const handleOpenCreateModal = () => {
    setCreateForm(defaultCreateForm)
    openModal('create')
  }


  return (
    <div className="dashboard-panels">
      <section className="inventory-panel active">
        <div className="inventory-panel__head">
          <div>
            <h2>Inventario general</h2>
            <p>Administra productos, entradas y salidas de stock.</p>
          </div>
          <div className="inventory-panel__actions">
            {activeView && (
              <Button variant="secondary" onClick={handleResetView}>
                Cambiar vista
              </Button>
            )}
            <Button variant="secondary" onClick={loadProductos} isLoading={listLoading}>
              Recargar
            </Button>
          </div>
        </div>

        {feedback?.message && (
          <div className={`admin-feedback admin-feedback--${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <datalist id="inventory-skus">
          {skuOptions.map((sku) => (
            <option key={sku} value={sku} />
          ))}
        </datalist>

        {!activeView && (
          <div className="inventory-choice">
            <div className="inventory-choice__card">
              <h3>Productos</h3>
              <p>Gestiona el catalogo y el stock consolidado.</p>
              <Button onClick={() => handleSelectView('productos')}>Ver productos</Button>
            </div>
            <div className="inventory-choice__card">
              <h3>Movimientos</h3>
              <p>Consulta stock y movimientos por producto.</p>
              <Button variant="secondary" onClick={() => handleSelectView('movimientos')}>
                Ver movimientos
              </Button>
            </div>
          </div>
        )}

        {activeView === 'productos' && (
          <>
            <div className="inventory-actions">
              <Button onClick={handleOpenCreateModal}>Crear producto</Button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Stock total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.sku}>
                      <td>{producto.sku}</td>
                      <td>{producto.nombre}</td>
                      <td>{formatValue(producto.descripcion)}</td>
                      <td>{formatValue(producto.stockTotalConsolidado)}</td>
                      <td>{formatValue(producto.estadoStock)}</td>
                      <td className="admin-actions">
                        <Button
                          type="button"
                          size="small"
                          variant="secondary"
                          onClick={() => openEntradaModalForSku(producto.sku)}
                        >
                          Entrada
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          variant="secondary"
                          onClick={() => openSalidaModalForSku(producto.sku)}
                        >
                          Salida
                        </Button>
                        <Button type="button" size="small" onClick={() => handleFocusProduct(producto.sku)}>
                          Movimientos
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          variant="danger"
                          isLoading={deleteSku === producto.sku}
                          onClick={() => handleDeleteProduct(producto.sku)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!listLoading && productos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-empty">No hay productos para mostrar.</td>
                    </tr>
                  )}
                  {listLoading && (
                    <tr>
                      <td colSpan={6} className="admin-empty">Cargando inventario...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeView === 'movimientos' && (
          <>
            <div className="inventory-detail inventory-detail--single">
              <div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Origen / Destino</th>
                        <th>Cantidad</th>
                        <th>Ultima actualizacion</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => {
                        const movementSku = movement.producto?.sku || selectedSku

                        return (
                          <tr key={movement.id}>
                            <td>{movement.id}</td>
                            <td>{movement.producto?.nombre || movement.producto?.sku || selectedSku}</td>
                            <td>{formatValue(movement.origen || movement.destino)}</td>
                            <td>{movement.cantidad}</td>
                            <td>{formatDateTime(movement.ultimaActualizacion)}</td>
                            <td className="admin-actions">
                              <Button
                                type="button"
                                size="small"
                                variant="secondary"
                                onClick={() => openStockModalForSku(movementSku)}
                                disabled={!movementSku}
                              >
                                Stock
                              </Button>
                              <Button
                                type="button"
                                size="small"
                                onClick={() => openMovementsModalForSku(movementSku)}
                                disabled={!movementSku}
                              >
                                Movimientos
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                      {movementsLoading && (
                        <tr>
                          <td colSpan={6} className="admin-empty">Cargando movimientos...</td>
                        </tr>
                      )}
                      {!movementsLoading && movements.length === 0 && (
                        <tr>
                          <td colSpan={6} className="admin-empty">
                            No hay movimientos para mostrar.
                            <div className="table-action-row">
                              <Button type="button" size="small" onClick={() => openStockModalForSku(selectedSku)}>
                                Consultar stock
                              </Button>
                              <Button
                                type="button"
                                size="small"
                                variant="secondary"
                                onClick={() => openMovementsModalForSku(selectedSku)}
                              >
                                Ver movimientos
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeModal === 'create' && (
          <Modal title="Crear producto" onClose={closeModal}>
            <form className="modal-form" onSubmit={handleCreateProduct}>
              <div className="admin-form__grid">
                <label>
                  Nombre
                  <input
                    value={createForm.nombre}
                    onChange={(event) => handleCreateInputChange('nombre', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Descripcion
                  <input
                    value={createForm.descripcion}
                    onChange={(event) => handleCreateInputChange('descripcion', event.target.value)}
                  />
                </label>
                <label>
                  Umbral minimo
                  <input
                    type="number"
                    min="0"
                    value={createForm.umbralMinimo}
                    onChange={(event) => handleCreateInputChange('umbralMinimo', event.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <Button type="submit" isLoading={createLoading}>
                  Crear producto
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {activeModal === 'entrada' && (
          <Modal title="Entrada de stock" onClose={closeModal}>
            <form className="modal-form" onSubmit={handleEntradaStock}>
              <div className="admin-form__grid">
                <label>
                  SKU
                  <input
                    list="inventory-skus"
                    value={entradaForm.sku}
                    onChange={(event) => handleEntradaInputChange('sku', event.target.value)}
                    placeholder="SKU del producto"
                    required
                  />
                </label>
                <label>
                  Origen
                  <input
                    value={entradaForm.origen}
                    onChange={(event) => handleEntradaInputChange('origen', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={entradaForm.cantidad}
                    onChange={(event) => handleEntradaInputChange('cantidad', event.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <Button type="submit" isLoading={entradaLoading}>
                  Registrar entrada
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {activeModal === 'salida' && (
          <Modal title="Salida de stock" onClose={closeModal}>
            <form className="modal-form" onSubmit={handleSalidaStock}>
              <div className="admin-form__grid">
                <label>
                  SKU
                  <input
                    list="inventory-skus"
                    value={salidaForm.sku}
                    onChange={(event) => handleSalidaInputChange('sku', event.target.value)}
                    placeholder="SKU del producto"
                    required
                  />
                </label>
                <label>
                  Destino
                  <input
                    value={salidaForm.destino}
                    onChange={(event) => handleSalidaInputChange('destino', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={salidaForm.cantidad}
                    onChange={(event) => handleSalidaInputChange('cantidad', event.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <Button type="submit" isLoading={salidaLoading}>
                  Registrar salida
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {activeModal === 'stock' && (
          <Modal title="Consultar stock" onClose={closeModal}>
            <div className="modal-section">
              <div className="inventory-selected">SKU: {selectedSku || 'Sin seleccionar'}</div>
              {stockLoading && <p className="inventory-empty">Cargando stock...</p>}
              {!stockLoading && stockInfo && (
                <>
                  <div className="inventory-kpi">
                    <div className="inventory-kpi__header">
                      <span className="inventory-kpi__label">Estado</span>
                      <span className="inventory-kpi__value">{formatValue(stockInfo.estado)}</span>
                    </div>
                    <div className="inventory-kpi__meta">
                      <div>
                        <span className="inventory-kpi__meta-label">Producto</span>
                        <strong>{formatValue(stockInfo.producto?.nombre || selectedSku)}</strong>
                      </div>
                      <div>
                        <span className="inventory-kpi__meta-label">Stock total</span>
                        <strong>{formatValue(stockInfo.stockTotalConsolidado)}</strong>
                      </div>
                      <div>
                        <span className="inventory-kpi__meta-label">Umbral minimo</span>
                        <strong>{formatValue(stockInfo.umbralMinimo)}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {!stockLoading && !stockInfo && (
                <p className="inventory-empty">Ingresa un SKU para ver el stock.</p>
              )}
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cerrar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'movements' && (
          <Modal title="Ver movimientos" onClose={closeModal}>
            <div className="modal-section">
              <div className="inventory-selected">SKU: {selectedSku || 'Sin seleccionar'}</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Origen / Destino</th>
                      <th>Cantidad</th>
                      <th>Ultima actualizacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td>{movement.id}</td>
                        <td>{movement.producto?.nombre || movement.producto?.sku || selectedSku}</td>
                        <td>{formatValue(movement.origen || movement.destino)}</td>
                        <td>{movement.cantidad}</td>
                        <td>{formatDateTime(movement.ultimaActualizacion)}</td>
                      </tr>
                    ))}
                    {movementsLoading && (
                      <tr>
                        <td colSpan={5} className="admin-empty">Cargando movimientos...</td>
                      </tr>
                    )}
                    {!movementsLoading && movements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-empty">
                          No hay movimientos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cerrar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'delete' && (
          <Modal title="Eliminar producto" onClose={closeModal}>
            <div className="modal-message">
              Seguro que quieres eliminar el producto {deleteCandidate}?
            </div>
            <div className="modal-actions">
              <Button
                type="button"
                variant="danger"
                isLoading={deleteSku === deleteCandidate}
                onClick={confirmDeleteProduct}
              >
                Eliminar
              </Button>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
            </div>
          </Modal>
        )}
      </section>
    </div>
  )
}
