import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '../../atoms/Input/Input.jsx'
import { Button } from '../../atoms/Button/Button.jsx'
import { Alert } from '../../atoms/Alert/Alert.jsx'
import '../../../styles/components/molecules.css'

export const LoginForm = ({ onSubmit, isLoading, error: externalError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const [localError, setLocalError] = useState(null)

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setLocalError(null)
      await onSubmit(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setLocalError(message)
    }
  })

  const displayError = externalError || localError

  return (
    <form onSubmit={handleFormSubmit} className="login-form">
      {displayError && (
        <Alert
          type="error"
          message={displayError}
          onClose={() => setLocalError(null)}
        />
      )}

      <Input
        {...register('username', {
          required: 'El usuario es requerido',
          minLength: {
            value: 3,
            message: 'El usuario debe tener al menos 3 caracteres',
          },
        })}
        id="username"
        type="text"
        placeholder="Usuario"
        label="Usuario o Correo"
        error={errors.username?.message}
        disabled={isLoading}
      />

      <Input
        {...register('password', {
          required: 'La contraseña es requerida',
          minLength: {
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres',
          },
        })}
        id="password"
        type="password"
        placeholder="Contraseña"
        label="Contraseña"
        error={errors.password?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        isLoading={isLoading}
      >
        Inicia Sesión
      </Button>
    </form>
  )
}
