import React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  CheckCircle,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AutomationControls({
  isRunning,
  isPaused,
  speed,
  onSpeedToggle,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
  onSubmit,
  isLastQuestion,
  allAnswered,
  currentQuestionNumber,
  totalQuestions,
  processing,
  estimatedTimeRemaining,
}) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Left: Status & Question Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isRunning
                ? isPaused
                  ? 'var(--bg-warning)'
                  : 'var(--bg-success)'
                : 'var(--text-tertiary)',
              display: 'inline-block',
              boxShadow: isRunning && !isPaused ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none',
            }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isRunning
                ? isPaused
                  ? 'Autonomous Agent Paused'
                  : `Agent Active — Solving Question ${currentQuestionNumber} of ${totalQuestions}`
                : `Question ${currentQuestionNumber} of ${totalQuestions}`}
            </div>
            {estimatedTimeRemaining > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                <span>Est. time remaining: ~{estimatedTimeRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Speed toggle pill */}
        <button
          onClick={onSpeedToggle}
          style={{
            background: speed === 'fast' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
            color: speed === 'fast' ? 'var(--bg-accent)' : 'var(--text-secondary)',
            border: `1px solid ${speed === 'fast' ? 'var(--bg-accent)' : 'var(--border-primary)'}`,
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Toggle execution speed"
        >
          <Zap size={12} />
          <span>{speed === 'fast' ? 'Turbo (600ms)' : 'Normal (1.2s)'}</span>
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={processing}
            style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Play size={16} fill="#fff" />
            <span>Start AI Automation</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={onResume}
            style={{
              background: 'var(--gradient-success)',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Play size={16} fill="#fff" />
            <span>Resume Agent</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--bg-warning)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Pause size={16} />
            <span>Pause Agent</span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={onStop}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--bg-error)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Square size={14} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}

        <button
          onClick={onSkip}
          disabled={isRunning && !isPaused}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: isRunning && !isPaused ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Next</span>
          <SkipForward size={14} />
        </button>

        <button
          onClick={onSubmit}
          style={{
            background: allAnswered ? 'var(--gradient-success)' : 'var(--bg-tertiary)',
            color: allAnswered ? '#fff' : 'var(--text-tertiary)',
            border: allAnswered ? 'none' : '1px solid var(--border-primary)',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: allAnswered ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
          }}
        >
          <CheckCircle size={16} />
          <span>Submit Exam</span>
        </button>
      </div>
    </div>
  );
}
