import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../atoms/Button/Button';
import '../../../styles/pages/dashboard.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Bienvenido al Panel de Control</h1>
        <div className="dashboard-user-info">
          <span>Hola, {user?.nombre}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>¡Bienvenido de vuelta!</h2>
          <p>Tu autenticación fue exitosa. Aquí se mostrarán:</p>
          <ul>
            <li>Panel de Inventario</li>
            <li>Estadísticas de Ventas</li>
            <li>Gestión de Productos</li>
            <li>Perfil del Usuario</li>
          </ul>

          <div className="user-details">
            <h3>Información del Usuario:</h3>
            <p><strong>Nombre:</strong> {user?.nombre}</p>
            <p><strong>Correo:</strong> {user?.correo}</p>
            <p><strong>Teléfono:</strong> {user?.telefono}</p>
            <p><strong>Dirección:</strong> {user?.direccion}</p>
            <p><strong>Rol:</strong> {user?.rol}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
