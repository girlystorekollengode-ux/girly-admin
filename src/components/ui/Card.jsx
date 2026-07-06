import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', ...props }) => {
  return (
    <div
      className={`bg-white border border-primary-200 rounded-xl shadow-pink-sm ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
