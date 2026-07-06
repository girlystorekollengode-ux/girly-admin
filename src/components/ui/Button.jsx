import React from 'react';
import Spinner from './Spinner.jsx';

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-primary-light text-white hover:brightness-105 shadow-pink-sm',
    outline: 'border border-primary text-primary bg-transparent hover:bg-primary-50',
    ghost: 'bg-primary-50 text-primary hover:bg-primary-100',
    danger: 'bg-gradient-to-r from-red-600 to-red-400 text-white hover:brightness-105 shadow-md',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${widthStyle}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="mr-2">
          <Spinner
            size="sm"
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
          />
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
