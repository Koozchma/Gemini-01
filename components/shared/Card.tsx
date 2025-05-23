
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  // Add style prop to allow passing inline styles
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, titleIcon, style }) => {
  return (
    // Apply the style prop here
    <div className={`bg-space-mid shadow-xl rounded-lg p-4 md:p-6 ${className}`} style={style}>
      {title && (
        <h3 className="text-xl font-display text-star-yellow mb-3 flex items-center gap-2">
          {titleIcon && <span>{titleIcon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
