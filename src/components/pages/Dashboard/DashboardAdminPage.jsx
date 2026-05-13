import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { authService } from '../../../services/authService.js'
import { useRoles } from '../../../hooks/useRoles.js'
import { Button } from '../../atoms/Button/Button.jsx'
import '../../../styles/pages/dashboard.css'

const defaultAdminForm = {
  nombre: '',
  apellido: '',
  correo: '',
  direccion: '',
  telefono: '',
  numero_rol: 0,
  contrasena: '',
}

const getRoleNumber = (user) => {
  if (typeof user.rol === 'object' && user.rol !== null) {
    if (typeof user.rol.numeroRol === 'number') return user.rol.numeroRol
    if (typeof user.rol.numero_rol === 'number') return user.rol.numero_rol
  }
  return 2
}

const getRoleLabel = (user) => {
  if (typeof user.rol === 'object' && user.rol !== null) {
    if (typeof user.rol.nombre === 'string' && user.rol.nombre.trim()) {
      return user.rol.nombre
    }
    if (typeof user.rol.nombre_rol === 'string' && user.rol.nombre_rol.trim()) {
      return user.rol.nombre_rol
    }
  }

  const roleNumber = getRoleNumber(user)
  return `Rol ${roleNumber}`
}

export const DashboardAdminPage = () => {
  const { user } = useAuth()
  const { roles } = useRoles()
  const [users, setUsers] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState(null)
  const [adminMessage, setAdminMessage] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [formState, setFormState] = useState(defaultAdminForm)
  const [passwordByUser, setPasswordByUser] = useState({})

  const isAdmin = React.useMemo(() => {
    const role = user?.rol?.toLowerCase() ?? ''
    return role.includes('admin') || role.includes('rol 1') || role === '1'
  }, [user?.rol])

  const loadUsers = useCallback(async () => {
    setAdminLoading(true)
    setAdminError(null)

    try {
      const response = await authService.getUsers()
      setUsers(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar la lista de usuarios.'
      setAdminError(message)
    } finally {
      setAdminLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    void loadUsers()
  }, [isAdmin, loadUsers])

  useEffect(() => {
    if (roles.length > 0 && formState.numero_rol === 0) {
      setFormState((current) => ({
        ...current,
        numero_rol: roles[0].numeroRol || roles[0].id,
      }))
    }
  }, [roles, formState.numero_rol])

  const resetForm = () => {
    setEditingUserId(null)
    setShowAdminForm(false)
    setFormState(defaultAdminForm)
  }

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'numero_rol':
        setFormState((current) => ({
          ...current,
          numero_rol: Number(value),
        }))
        break
      case 'nombre':
      case 'apellido':
      case 'correo':
      case 'direccion':
      case 'telefono':
      case 'contrasena':
        setFormState((current) => ({
          ...current,
          [field]: value,
        }))
        break
      default:
        break
    }
  }

  const handleEdit = (selectedUser) => {
    setEditingUserId(selectedUser.id)
    setShowAdminForm(true)
    setFormState({
      nombre: selectedUser.nombre,
      apellido: selectedUser.apellido,
      correo: selectedUser.correo,
      direccion: selectedUser.direccion,
      telefono: selectedUser.telefono,
      numero_rol: getRoleNumber(selectedUser),
      contrasena: '',
    })
    setAdminMessage(null)
    setAdminError(null)
  }

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este usuario?')
    if (!shouldDelete) return

    setAdminLoading(true)
    setAdminError(null)
    setAdminMessage(null)

    try {
      await authService.deleteUser(id)
      await loadUsers()
      setAdminMessage('Usuario eliminado correctamente.')
      if (editingUserId === id) {
        resetForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario.'
      setAdminError(message)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleSaveUser = async (event) => {
    event.preventDefault()
    setAdminLoading(true)
    setAdminError(null)
    setAdminMessage(null)

    try {
      if (editingUserId) {
        await authService.updateUser(editingUserId, {
          nombre: formState.nombre,
          apellido: formState.apellido,
          correo: formState.correo,
          direccion: formState.direccion,
          telefono: formState.telefono,
          numero_rol: formState.numero_rol,
        })

        if (formState.contrasena.trim()) {
          await authService.changeUserPassword(editingUserId, {
            newPassword: formState.contrasena.trim(),
          })
        }

        setAdminMessage('Usuario actualizado correctamente.')
      } else {
        await authService.register({
          nombre: formState.nombre,
          apellido: formState.apellido,
          correo: formState.correo,
          direccion: formState.direccion,
          telefono: formState.telefono,
          numero_rol: formState.numero_rol,
          contrasena: formState.contrasena,
        })
        setAdminMessage('Usuario creado correctamente.')
      }

      await loadUsers()
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron guardar los cambios.'
      setAdminError(message)
    } finally {
      setAdminLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="dashboard-panels">
        <div className="welcome-section active">
          <h2>Acceso restringido</h2>
          <p>Solo los administradores pueden acceder a la gestion de usuarios.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-panels">
      <section className="admin-panel active">
        <div className="admin-panel__head">
          <div className="admin-panel__head-content">
            <div>
              <h2>Gestion de usuarios</h2>
              <p>Crea, edita, elimina usuarios y actualiza sus contraseñas.</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => {
                setEditingUserId(null);
                setFormState(defaultAdminForm);
                setShowAdminForm(true);
              }}
            >
              + Crear Usuario
            </Button>
          </div>
        </div>

        {adminError && <div className="admin-feedback admin-feedback--error">{adminError}</div>}
        {adminMessage && <div className="admin-feedback admin-feedback--success">{adminMessage}</div>}

        {showAdminForm && (
          <form className="admin-form" onSubmit={handleSaveUser}>
            <div className="admin-form__header">
              <h3>{editingUserId ? 'Editar usuario' : 'Crear usuario'}</h3>
              <Button 
                type="button"
                variant="secondary"
                size="small"
                onClick={() => {
                  setShowAdminForm(false);
                  setEditingUserId(null);
                  setFormState(defaultAdminForm);
                }}
              >
                Cerrar
              </Button>
            </div>
            <div className="admin-form__grid">
              <label>
                Nombre
                <input
                  value={formState.nombre}
                  onChange={(event) => handleInputChange('nombre', event.target.value)}
                  required
                />
              </label>
              <label>
                Apellido
                <input
                  value={formState.apellido}
                  onChange={(event) => handleInputChange('apellido', event.target.value)}
                  required
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  value={formState.correo}
                  onChange={(event) => handleInputChange('correo', event.target.value)}
                  required
                />
              </label>
              <label>
                Direccion
                <input
                  value={formState.direccion}
                  onChange={(event) => handleInputChange('direccion', event.target.value)}
                  required
                />
              </label>
              <label>
                Telefono
                <input
                  value={formState.telefono}
                  onChange={(event) => handleInputChange('telefono', event.target.value)}
                  required
                />
              </label>
              <label>
                Rol
                <select
                  value={formState.numero_rol}
                  onChange={(event) => handleInputChange('numero_rol', event.target.value)}
                >
                  {roles.length === 0 ? (
                    <option value="">Cargando roles...</option>
                  ) : (
                    roles.map((role) => (
                      <option key={role.id} value={role.numeroRol || role.id}>
                        {role.nombre}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="admin-form__password">
                {editingUserId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                <input
                  type="password"
                  value={formState.contrasena}
                  onChange={(event) => handleInputChange('contrasena', event.target.value)}
                  required={!editingUserId}
                />
              </label>
            </div>

            <div className="admin-form__actions">
              <Button type="submit" isLoading={adminLoading}>
                {editingUserId ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
              {editingUserId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar edicion
                </Button>
              )}
            </div>
          </form>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((listedUser) => (
                <tr key={listedUser.id}>
                  <td>{listedUser.id}</td>
                  <td>{listedUser.nombre} {listedUser.apellido}</td>
                  <td>{listedUser.correo}</td>
                  <td>{getRoleLabel(listedUser)}</td>
                  <td className="admin-actions">
                    <Button type="button" size="small" onClick={() => handleEdit(listedUser)}>
                      Editar
                    </Button>
                    <Button type="button" size="small" variant="danger" onClick={() => handleDelete(listedUser.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {!adminLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">No hay usuarios para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
