import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';

export default function ActivityLog({ logs = [], onClear, maxHeight = '280px' }) {
  const [filter, setFilter] = useState('all');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={14} color="var(--bg-success)" />;
      case 'warning':
        return <AlertTriangle size={14} color="var(--bg-warning)" />;
      case 'error':
        return <AlertCircle size={14} color="var(--bg-error)" />;
      case 'info':
      default:
        return <Info size={14} color="var(--bg-info)" />;
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--bg-accent)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Real-Time AI Activity Log
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            {logs.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {['all', 'info', 'success', 'warning', 'error'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--bg-accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-tertiary)',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {f}
            </button>
          ))}
          {onClear && (
            <button
              onClick={onClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '3px 6px',
                marginLeft: '4px',
              }}
              title="Clear logs"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          maxHeight,
          overflowY: 'auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No activity logged yet. Start the autonomous examination agent to monitor real-time reasoning.
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString();
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: 'var(--text-tertiary)', flexShrink: 0, fontSize: '0.6875rem' }}>
                  {timeStr}
                </span>
                <span style={{ flexShrink: 0, marginTop: '2px' }}>{getLogIcon(log.type)}</span>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
