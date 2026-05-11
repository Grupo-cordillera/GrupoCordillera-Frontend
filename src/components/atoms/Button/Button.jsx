import React from 'react'
import '../../../styles/components/atoms.css'

export const Button = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  disabled = false,
  ...props
}) => {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full-width',
    (disabled || isLoading) && 'button--disabled',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="button-loader"></span>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
