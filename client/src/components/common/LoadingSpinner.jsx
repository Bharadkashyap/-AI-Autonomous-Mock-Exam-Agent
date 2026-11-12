import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  return (
    <div className="flex-center" style={{ flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <Loader2
        size={sizeMap[size] || 24}
        className="animate-spin text-accent"
        style={{ color: 'var(--bg-accent)' }}
      />
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</span>}
    </div>
  );
}
