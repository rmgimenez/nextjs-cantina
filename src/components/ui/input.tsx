'use client';

import clsx from 'clsx';
import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const safeGeneratedId = generatedId.replace(/[:]/g, '');
  const inputId = id || `input-${safeGeneratedId}`;

  return (
    <div className='space-y-1'>
      {label && (
        <label htmlFor={inputId} className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <div className='relative'>
        {icon && iconPosition === 'left' && (
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <span className='text-gray-400'>{icon}</span>
          </div>
        )}

        <input
          id={inputId}
          className={clsx(
            'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 transition-all',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
            {
              'pl-10': icon && iconPosition === 'left',
              'pr-10': icon && iconPosition === 'right',
              'border-red-300 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
            <span className='text-gray-400'>{icon}</span>
          </div>
        )}
      </div>

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {helperText && !error && <p className='text-sm text-gray-500'>{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const safeGeneratedId = generatedId.replace(/[:]/g, '');
  const inputId = id || `textarea-${safeGeneratedId}`;

  return (
    <div className='space-y-1'>
      {label && (
        <label htmlFor={inputId} className='block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        className={clsx(
          'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 transition-all',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
          {
            'border-red-300 focus:border-red-500 focus:ring-red-500': error,
          },
          className
        )}
        {...props}
      />

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {helperText && !error && <p className='text-sm text-gray-500'>{helperText}</p>}
    </div>
  );
}
