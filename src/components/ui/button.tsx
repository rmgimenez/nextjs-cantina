import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClassMap = {
    small: 'btn-sm',
    medium: '',
    large: 'btn-lg',
  };

  const variantClassMap: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    outline: 'btn-outline-secondary',
  };

  const btnClass = clsx(
    'btn',
    variantClassMap[variant] || 'btn-primary',
    sizeClassMap[size],
    className
  );

  return (
    <button className={btnClass} disabled={disabled || loading} {...props}>
      {loading && (
        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true' />
      )}

      {icon && iconPosition === 'left' && !loading && (
        <span className='me-2 d-inline-flex align-items-center'>{icon}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && !loading && (
        <span className='ms-2 d-inline-flex align-items-center'>{icon}</span>
      )}
    </button>
  );
}
