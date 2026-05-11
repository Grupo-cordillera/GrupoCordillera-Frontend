import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../atoms/Logo/Logo.jsx'
import { Card } from '../../molecules/Card/Card.jsx'
import { LoginForm } from '../../molecules/LoginForm/LoginForm.jsx'
import { useLogin } from '../../../hooks/useLogin.js'
import '../../../styles/pages/login.css'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, error, isLoading } = useLogin()

  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Logo size="medium" />
          <h1>Panel de Control Retail</h1>
          <p>Accede a tu cuenta para gestionar el inventario</p>
        </div>

        <Card className="login-card" shadow="large">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        </Card>

        <div className="login-footer">
          <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
        </div>
      </div>

      <div className="login-background"></div>
    </div>
  )
}
