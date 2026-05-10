import React from 'react';
import '../../../styles/components/molecules.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ children, className, shadow = 'medium' }) => {
  return (
    <div className={`card card--${shadow} ${className || ''}`}>
      {children}
    </div>
  );
};
