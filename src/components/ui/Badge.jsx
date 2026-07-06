import React from 'react';

const Badge = ({ variant = 'primary', children }) => {
  const styles = {
    primary: 'bg-primary-50 text-primary border border-primary-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        styles[variant] || styles.primary
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
