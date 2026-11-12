import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'accent', trend }) {
  const colorMap = {
    accent: {
      bg: 'rgba(99, 102, 241, 0.1)',
      text: 'var(--bg-accent)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: 'var(--bg-success)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: 'var(--bg-warning)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: 'var(--bg-info)',
      border: 'rgba(59, 130, 246, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.accent;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="stats-card"
    >
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </p>
        <h3
          style={{
            margin: '0.375rem 0 0.125rem 0',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
