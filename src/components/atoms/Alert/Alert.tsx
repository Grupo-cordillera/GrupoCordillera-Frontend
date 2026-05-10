import React from 'react';
import '../../../styles/components/atoms.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
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
  );
};
