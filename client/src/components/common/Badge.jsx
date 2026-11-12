import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm', icon: Icon }) {
  const variantStyles = {
    default: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-primary)',
    },
    success: {
      background: 'rgba(16, 185, 129, 0.15)',
      color: 'var(--bg-success)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.15)',
      color: 'var(--bg-warning)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: 'var(--bg-error)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    accent: {
      background: 'rgba(99, 102, 241, 0.15)',
      color: 'var(--bg-accent)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
    },
    info: {
      background: 'rgba(59, 130, 246, 0.15)',
      color: 'var(--bg-info)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
    },
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '6px' },
    md: { padding: '4px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '8px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
}
