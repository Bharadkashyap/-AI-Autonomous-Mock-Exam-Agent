import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Badge from '../common/Badge';

export default function AIAnalysisPanel({
  aiResponse,
  isProcessing,
  currentStep,
  onReanalyze,
}) {
  const [showFullExplanation, setShowFullExplanation] = useState(true);

  if (isProcessing) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          minHeight: '380px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <Brain size={28} color="#fff" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
            AI Agent at Work
          </h4>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {currentStep === 'reading' && 'Reading question & options...'}
            {currentStep === 'analyzing' && 'Gemini primary reasoning...'}
            {currentStep === 'verifying' && 'Independent verification layer...'}
            {currentStep === 'selecting' && 'Selecting validated option...'}
            {currentStep === 'advancing' && 'Preparing next question...'}
            {!['reading', 'analyzing', 'verifying', 'selecting', 'advancing'].includes(currentStep) &&
              'Synthesizing answer...'}
          </p>
        </div>
      </div>
    );
  }

  if (!aiResponse || !aiResponse.answer) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          minHeight: '380px',
        }}
      >
        <Sparkles size={36} color="var(--text-tertiary)" />
        <h4 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
          Awaiting AI Processing
        </h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
          Click "Start Automation" or process this question manually to view AI reasoning.
        </p>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            style={{
              marginTop: '0.5rem',
              background: 'var(--gradient-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Brain size={14} />
            <span>Analyze Question</span>
          </button>
        )}
      </div>
    );
  }

  const confidence = aiResponse.confidence || 0;
  const isUncertain = confidence < 60;
  let gaugeColor = 'var(--bg-success)';
  if (confidence < 60) gaugeColor = 'var(--bg-error)';
  else if (confidence < 80) gaugeColor = 'var(--bg-warning)';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--bg-accent)" />
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Answer Engine
          </h4>
        </div>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
            }}
            title="Re-analyze this question"
          >
            <RefreshCw size={12} />
            <span>Re-run</span>
          </button>
        )}
      </div>

      {/* Answer & Confidence Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            Selected Answer
          </span>
          <h3
            style={{
              margin: '2px 0 0 0',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--bg-accent)',
            }}
          >
            {aiResponse.answer.join(', ')}
          </h3>
        </div>

        <div style={{ width: '54px', height: '54px' }}>
          <CircularProgressbar
            value={confidence}
            text={`${confidence}%`}
            styles={buildStyles({
              textSize: '24px',
              pathColor: gaugeColor,
              textColor: 'var(--text-primary)',
              trailColor: 'var(--bg-tertiary)',
            })}
          />
        </div>
      </div>

      {/* Verification Status Badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {aiResponse.verificationResult?.verified ? (
          <Badge variant="success" icon={ShieldCheck}>
            Verified via Elimination
          </Badge>
        ) : (
          <Badge variant="warning" icon={ShieldAlert}>
            Uncertain Verification
          </Badge>
        )}

        {aiResponse.subjectValidation?.validated && (
          <Badge variant="info">
            {aiResponse.subjectValidation.subject || 'Domain'} Checked
          </Badge>
        )}

        {isUncertain && (
          <Badge variant="error" icon={ShieldAlert}>
            Flagged Low Confidence
          </Badge>
        )}
      </div>

      {/* Explanation Box */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => setShowFullExplanation(!showFullExplanation)}
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            AI Reasoning & Explanation
          </span>
          {showFullExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {showFullExplanation && (
          <div style={{ padding: '10px 12px', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {aiResponse.explanation}
          </div>
        )}
      </div>

      {/* Verification Notes */}
      {aiResponse.verificationResult?.notes && (
        <div
          style={{
            fontSize: '0.75rem',
            padding: '8px 10px',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            borderLeft: '3px solid var(--bg-accent)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          <strong>Cross-Check:</strong> {aiResponse.verificationResult.notes}
        </div>
      )}
    </div>
  );
}
