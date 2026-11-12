import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Bot, Zap, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/exams', label: 'Practice Exams', icon: FileText },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1rem',
      }}
    >
      <div>
        <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
            Navigation
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--bg-accent)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Zap size={16} color="var(--bg-accent)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Autonomous Engine
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
          Multi-layer verification with reasoning cross-check and subject validation.
        </p>
      </div>
    </aside>
  );
}
