import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { Button } from '../../atoms/Button/Button.jsx'
import { authService } from '../../../services/authService.js'
import { useRoles } from '../../../hooks/useRoles.js'
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

const defaultProfileForm = {
  nombre: '',
  apellido: '',
  correo: '',
  direccion: '',
  telefono: '',
  contrasena: '',
}

const getRoleNumber = (user) => {
  if (typeof user.rol.numero_rol === 'number') return user.rol.numero_rol
  if (typeof user.rol.numeroRol === 'number') return user.rol.numeroRol
  return 2
}

const getRoleLabel = (user) => {
  if (typeof user.rol.nombre_rol === 'string' && user.rol.nombre_rol.trim()) {
    return user.rol.nombre_rol
  }
  if (typeof user.rol.nombre === 'string' && user.rol.nombre.trim()) {
    return user.rol.nombre
  }

  const roleNumber = getRoleNumber(user)
  return `Rol ${roleNumber}`
}

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser, updateToken } = useAuth()
  const { roles } = useRoles()
  const [activeSection, setActiveSection] = useState('overview')
  const [users, setUsers] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState(null)
  const [adminMessage, setAdminMessage] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [formState, setFormState] = useState(defaultAdminForm)
  const [passwordByUser, setPasswordByUser] = useState({})
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileMessage, setProfileMessage] = useState(null)

  const isAdmin = useMemo(() => {
    const role = user?.rol?.toLowerCase() ?? ''
    return role.includes('admin') || role.includes('rol 1') || role === '1'
  }, [user?.rol])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
    if (activeSection !== 'profile') return
    setProfileForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      correo: user?.correo || '',
      direccion: user?.direccion || '',
      telefono: user?.telefono || '',
      contrasena: '',
    })
  }, [activeSection, user])

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

  const handleChangePassword = async (id) => {
    const newPassword = passwordByUser[id]?.trim()
    if (!newPassword) {
      setAdminError('Debes ingresar una contraseña nueva para actualizar.')
      return
    }

    setAdminLoading(true)
    setAdminError(null)
    setAdminMessage(null)

    try {
      await authService.changeUserPassword(id, { newPassword })
      setPasswordByUser((previous) => ({
        ...previous,
        [id]: '',
      }))
      setAdminMessage('Contraseña actualizada correctamente.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.'
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
        const isEditingCurrentUser = editingUserId === user?.id
        
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

        // Si el usuario actual fue editado, actualizar sus datos en el contexto
        if (isEditingCurrentUser) {
          const updatedUser = await authService.getCurrentUser()
          const roleLabel = updatedUser.rol?.nombre || updatedUser.rol?.nombre_rol || `Rol ${updatedUser.rol?.numeroRol || updatedUser.rol?.numero_rol}`
          
          const oldRole = String(user?.rol).toLowerCase()
          const newRole = String(roleLabel).toLowerCase()
          
          updateUser({
            id: user?.id,
            nombre: updatedUser.nombre,
            apellido: updatedUser.apellido,
            correo: updatedUser.correo,
            direccion: updatedUser.direccion,
            telefono: updatedUser.telefono,
            rol: roleLabel,
          })

          // Si el rol cambió, recarga la página para que se refleje en la UI
          if (oldRole !== newRole) {
            setAdminMessage('Tu rol ha sido actualizado. Recargando...')
            setTimeout(() => {
              window.location.reload()
            }, 1000)
            return
          }
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

  const handleProfileInputChange = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileError(null)
    setProfileMessage(null)

    try {
      const correoChanged = profileForm.correo !== user.correo

      await authService.updateCurrentUser({
        nombre: profileForm.nombre,
        apellido: profileForm.apellido,
        correo: profileForm.correo,
        direccion: profileForm.direccion,
        telefono: profileForm.telefono,
      })

      if (profileForm.contrasena.trim()) {
        await authService.changeCurrentUserPassword({
          newPassword: profileForm.contrasena.trim(),
        })
      }

      // Actualizar datos del usuario en contexto
      updateUser({
        nombre: profileForm.nombre,
        apellido: profileForm.apellido,
        correo: profileForm.correo,
        direccion: profileForm.direccion,
        telefono: profileForm.telefono,
        rol: user.rol,
      })

      setProfileMessage('Perfil actualizado correctamente.')

      if (correoChanged) {
        setProfileMessage('Perfil actualizado. Tu correo ha cambiado, por favor vuelve a iniciar sesión.')
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el perfil.'
      setProfileError(message)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <div className="dashboard-header-right">
          <div className="user-profile-card">
            <div className="user-profile-card__info">
              <div className="user-profile-card__name">{user?.nombre}</div>
              <div className="user-profile-card__role">{user?.rol}</div>
            </div>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => setActiveSection('profile')}
            >
              Mi Perfil
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-nav">
          <Button
            variant={activeSection === 'overview' ? 'primary' : 'secondary'}
            onClick={() => setActiveSection('overview')}
          >
             Inicio
          </Button>
          {isAdmin && (
            <Button
              variant={activeSection === 'admin' ? 'primary' : 'secondary'}
              onClick={() => setActiveSection('admin')}
            >
               Administración
            </Button>
          )}
          
        </div>

        <div className="dashboard-panels">
          {activeSection === 'overview' && (
            <div className="welcome-section active">
              <h2>Resumen de sesión</h2>
              <p>Acceso validado correctamente. Desde aquí puedes gestionar el sistema según tu rol.</p>

              <div className="user-details">
                <h3>Datos del usuario</h3>
                <p><strong>Nombre:</strong> {user?.nombre}</p>
                <p><strong>Correo:</strong> {user?.correo}</p>
                <p><strong>Telefono:</strong> {user?.telefono}</p>
                <p><strong>Direccion:</strong> {user?.direccion}</p>
                <p><strong>Rol:</strong> {user?.rol}</p>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <section className="profile-panel active">
              <div className="profile-panel__head">
                <h2>Editar mi perfil</h2>
                <p>Actualiza tu información personal y contraseña.</p>
              </div>

              {profileError && <div className="admin-feedback admin-feedback--error">{profileError}</div>}
              {profileMessage && <div className="admin-feedback admin-feedback--success">{profileMessage}</div>}

              <form className="admin-form" onSubmit={handleSaveProfile}>
                <h3>Mis datos</h3>
                <div className="admin-form__grid">
                  <label>
                    Nombre
                    <input
                      value={profileForm.nombre}
                      onChange={(event) => handleProfileInputChange('nombre', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Apellido
                    <input
                      value={profileForm.apellido}
                      onChange={(event) => handleProfileInputChange('apellido', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Correo
                    <input
                      type="email"
                      value={profileForm.correo}
                      onChange={(event) => handleProfileInputChange('correo', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Direccion
                    <input
                      value={profileForm.direccion}
                      onChange={(event) => handleProfileInputChange('direccion', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Telefono
                    <input
                      value={profileForm.telefono}
                      onChange={(event) => handleProfileInputChange('telefono', event.target.value)}
                      required
                    />
                  </label>
                  <label className="admin-form__password">
                    Nueva contraseña (opcional)
                    <input
                      type="password"
                      value={profileForm.contrasena}
                      onChange={(event) => handleProfileInputChange('contrasena', event.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-form__actions">
                  <Button type="submit" isLoading={profileLoading}>
                    Guardar cambios
                  </Button>
                </div>
              </form>
            </section>
          )}

        {isAdmin && activeSection === 'admin' && (
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
        )}

        {!isAdmin && activeSection === 'admin' && (
          <div className="welcome-section active">
            <h2>Acceso restringido</h2>
            <p>Solo los administradores pueden acceder a la gestion de usuarios.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
