import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Sparkles, Brain, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getAIStatus } from '../../services/api';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [aiStatus, setAiStatus] = useState({ available: true, message: 'AI Agent Ready' });

  useEffect(() => {
    getAIStatus()
      .then((res) => {
        if (res.data) setAiStatus(res.data);
      })
      .catch(() => {
        setAiStatus({ available: false, message: 'AI Agent Standby' });
      });
  }, []);

  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Exam Cracker
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--bg-accent)',
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: '6px',
                textTransform: 'uppercase',
              }}
            >
              AI Agent
            </span>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? 'var(--text-accent)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: location.pathname === '/' ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/exams"
            style={{
              color: location.pathname.startsWith('/exam') ? 'var(--text-accent)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: location.pathname.startsWith('/exam') ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            Practice Exams
          </Link>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* AI Agent Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: aiStatus.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${aiStatus.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: aiStatus.available ? 'var(--bg-success)' : 'var(--bg-warning)',
          }}
          title={aiStatus.message}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: aiStatus.available ? 'var(--bg-success)' : 'var(--bg-warning)',
              display: 'inline-block',
              boxShadow: aiStatus.available ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
            }}
          />
          <span>{aiStatus.available ? 'Gemini 2.0 Active' : 'Intelligent Engine Active'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
