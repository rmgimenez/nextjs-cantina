import clsx from 'clsx';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ children, className, padding = 'medium', shadow = 'small' }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200',
        {
          'p-0': padding === 'none',
          'p-3': padding === 'small',
          'p-6': padding === 'medium',
          'p-8': padding === 'large',
          'shadow-none': shadow === 'none',
          'shadow-sm': shadow === 'small',
          'shadow-md': shadow === 'medium',
          'shadow-lg': shadow === 'large',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx('', className)}>{children}</div>;
}
