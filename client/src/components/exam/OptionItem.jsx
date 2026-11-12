import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

export default function OptionItem({
  option,
  isSelected,
  onSelect,
  isMultiple,
  disabled,
  aiAnalysis,
}) {
  const isCorrect = aiAnalysis?.isCorrect;
  const hasAnalysis = aiAnalysis !== undefined;

  let borderColor = 'var(--border-primary)';
  let bgColor = 'var(--bg-secondary)';

  if (isSelected) {
    borderColor = 'var(--bg-accent)';
    bgColor = 'rgba(99, 102, 241, 0.08)';
  }

  if (hasAnalysis) {
    if (isCorrect) {
      borderColor = 'var(--bg-success)';
      bgColor = 'rgba(16, 185, 129, 0.08)';
    } else if (isSelected && !isCorrect) {
      borderColor = 'var(--bg-error)';
      bgColor = 'rgba(239, 68, 68, 0.08)';
    }
  }

  return (
    <div
      onClick={() => !disabled && onSelect(option.id)}
      style={{
        border: `1.5px solid ${borderColor}`,
        backgroundColor: bgColor,
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
      }}
    >
      {/* Option Identifier Badge */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: isMultiple ? '6px' : '50%',
          backgroundColor: isSelected ? 'var(--bg-accent)' : 'var(--bg-tertiary)',
          color: isSelected ? '#fff' : 'var(--text-secondary)',
          border: `1px solid ${isSelected ? 'var(--bg-accent)' : 'var(--border-primary)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8125rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {isSelected ? <Check size={14} /> : option.id}
      </div>

      {/* Option Text and AI Evaluation */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {option.text}
        </p>

        {hasAnalysis && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '0.75rem',
              color: isCorrect ? 'var(--bg-success)' : 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isCorrect ? (
              <span style={{ fontWeight: 600 }}>✓ AI Validated: {aiAnalysis.reasoning}</span>
            ) : (
              <span>• {aiAnalysis.reasoning}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
