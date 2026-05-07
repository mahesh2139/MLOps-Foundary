import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <img
      src="logo.png"
      alt="Logo"
      className={`${sizes[size]} object-contain rounded-lg shadow-lg`}
    />
  );
};

export default Logo;


