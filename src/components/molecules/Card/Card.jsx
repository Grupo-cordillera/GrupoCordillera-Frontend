import React from 'react'
import '../../../styles/components/molecules.css'

export const Card = ({ children, className, shadow = 'medium' }) => {
  return (
    <div className={`card card--${shadow} ${className || ''}`}>
      {children}
    </div>
  )
}
