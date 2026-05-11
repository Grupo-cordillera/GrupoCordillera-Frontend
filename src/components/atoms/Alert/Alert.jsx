import React from 'react'
import '../../../styles/components/atoms.css'

export const Alert = ({ type, message, onClose }) => {
  return (
    <div className={`alert alert--${type}`}>
      <div className="alert-content">
        <span className="alert-icon">
          {type === 'error' && '✕'}
          {type === 'success' && '✓'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>✕</button>
      )}
    </div>
  )
}
