import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { authService } from '../../../services/authService.js'
import { Button } from '../../atoms/Button/Button.jsx'
import '../../../styles/pages/dashboard.css'

const defaultProfileForm = {
  nombre: '',
  apellido: '',
  correo: '',
  direccion: '',
  telefono: '',
  contrasena: '',
}

export const DashboardProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileMessage, setProfileMessage] = useState(null)

  useEffect(() => {
    setProfileForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      correo: user?.correo || '',
      direccion: user?.direccion || '',
      telefono: user?.telefono || '',
      contrasena: '',
    })
  }, [user])

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
    <div className="dashboard-panels">
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
    </div>
  )
}
