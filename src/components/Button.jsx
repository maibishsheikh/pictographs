import React from 'react';

/**
 * Shared button component.
 * variant: 'primary' | 'green' | 'outline'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    green: 'btn-green',
    outline: 'btn-outline',
  }[variant] || 'btn-primary';

  const sizeClass = { sm: 'btn-sm', lg: 'btn-lg', md: '' }[size] || '';

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
