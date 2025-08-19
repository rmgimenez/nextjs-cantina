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
    <div className='mb-3'>
      {label && (
        <label htmlFor={inputId} className='form-label'>
          {label}
        </label>
      )}

      <div className='input-group'>
        {icon && iconPosition === 'left' && <span className='input-group-text'>{icon}</span>}

        <input
          id={inputId}
          className={clsx('form-control', { 'is-invalid': error }, className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...props}
        />

        {icon && iconPosition === 'right' && <span className='input-group-text'>{icon}</span>}
      </div>

      {error && (
        <div id={`${inputId}-error`} className='invalid-feedback d-block'>
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={`${inputId}-help`} className='form-text'>
          {helperText}
        </div>
      )}
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
