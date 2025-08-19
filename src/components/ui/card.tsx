import clsx from 'clsx';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ children, className, padding = 'medium', shadow = 'small' }: CardProps) {
  const paddingMap: Record<string, string> = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4',
  };

  const shadowMap: Record<string, string> = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow',
    large: 'shadow-lg',
  };

  return (
    <div
      className={clsx(
        'card border-0 rounded-3 bg-white',
        paddingMap[padding],
        shadowMap[shadow],
        className
      )}
    >
      <div className='card-body p-0'>{children}</div>
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx('border-bottom pb-2 mb-3', className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h5 className={clsx('card-title mb-0', className)}>{children}</h5>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx('', className)}>{children}</div>;
}
