import React from 'react';
import '../../../styles/components/atoms.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  return (
    <div className={`logo logo--${size}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="currentColor" />
          <path
            d="M12 28V12H20C23.314 12 26 14.686 26 18C26 21.314 23.314 24 20 24H16V28H12Z"
            fill="white"
          />
          <circle cx="20" cy="18" r="4" fill="white" />
        </svg>
      </div>
      <span className="logo-text">GrupoCordillera</span>
    </div>
  );
};
