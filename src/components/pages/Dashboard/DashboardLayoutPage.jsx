import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../atoms/Button/Button.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import '../../../styles/pages/dashboard.css'

export const DashboardLayoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Determinar si el usuario es admin
  const isAdmin = React.useMemo(() => {
    const role = user?.rol?.toLowerCase() ?? ''
    return role.includes('admin') || role.includes('rol 1') || role === '1'
  }, [user?.rol])

  return (
    <div className="dashboard-page">
      {/* HEADER */}
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
              onClick={() => navigate('/dashboard/profile')}
            >
              Mi Perfil
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT + SIDEBAR */}
      <div className="dashboard-content">
        {/* NAVIGATION SIDEBAR */}
        <div className="dashboard-nav">
          <div className="dashboard-nav-buttons">
            <Button
              variant={location.pathname === '/dashboard' ? 'primary' : 'secondary'}
              onClick={() => navigate('/dashboard')}
            >
              Inicio
            </Button>
            {isAdmin && (
              <Button
                variant={location.pathname.includes('/admin') ? 'primary' : 'secondary'}
                onClick={() => navigate('/dashboard/admin')}
              >
                Administración
              </Button>
            )}
            <Button
              variant={location.pathname.includes('/profile') ? 'primary' : 'secondary'}
              onClick={() => navigate('/dashboard/profile')}
            >
              Mi Perfil
            </Button>
          </div>
          
          <div className="dashboard-nav-logout">
            <Button 
              variant="danger" 
              onClick={handleLogout}
              style={{ width: '100%', padding: '0.75rem 1.5rem', margin: '0' }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <Outlet />
      </div>
    </div>
  )
}

