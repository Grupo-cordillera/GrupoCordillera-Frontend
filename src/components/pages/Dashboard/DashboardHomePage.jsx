import React from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'
import '../../../styles/pages/dashboard.css'

export const DashboardHomePage = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard-panels">
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
    </div>
  )
}
