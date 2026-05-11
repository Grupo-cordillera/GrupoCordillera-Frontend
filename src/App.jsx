import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'
import { LoginPage } from './components/pages/Login/LoginPage.jsx'
import { DashboardLayoutPage } from './components/pages/Dashboard/DashboardLayoutPage.jsx'
import { DashboardHomePage } from './components/pages/Dashboard/DashboardHomePage.jsx'
import { DashboardProfilePage } from './components/pages/Dashboard/DashboardProfilePage.jsx'
import { DashboardAdminPage } from './components/pages/Dashboard/DashboardAdminPage.jsx'
import './styles/global.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayoutPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="profile" element={<DashboardProfilePage />} />
            <Route path="admin" element={<DashboardAdminPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
