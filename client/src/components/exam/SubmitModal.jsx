import React from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function SubmitModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  totalQuestions = 0,
  answeredQuestions = 0,
  uncertainAnswers = 0,
}) {
  const unansweredCount = totalQuestions - answeredQuestions;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Practice Examination">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Are you ready to submit your practice exam? The AI agent will finalize all answers and compile a performance breakdown.
        </p>

        {/* Stats Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalQuestions}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Total
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg-success)' }}>
              {answeredQuestions}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Answered
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg-warning)' }}>
              {uncertainAnswers}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Uncertain
            </div>
          </div>
        </div>

        {/* Warning if unanswered */}
        {unansweredCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--bg-warning)',
              fontSize: '0.8125rem',
            }}
          >
            <AlertTriangle size={16} flexShrink={0} />
            <span>
              You have <strong>{unansweredCount} unanswered</strong> question{unansweredCount === 1 ? '' : 's'}. Unanswered questions will be scored as 0.
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Review Questions
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              background: 'var(--gradient-success)',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{isSubmitting ? 'Submitting...' : 'Confirm Submission'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
