import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Brain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getSessionSummary } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

export default function CompletionSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    if (!id) return;
    getSessionSummary(id)
      .then((res) => {
        if (res.summary) setSummary(res.summary);
      })
      .catch((err) => {
        toast.error('Failed to load exam results');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Compiling Examination Results..." />;
  }

  if (!summary) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Results not found.
      </div>
    );
  }

  const {
    totalQuestions = 0,
    answeredQuestions = 0,
    correctCount = 0,
    accuracy = 0,
    uncertainCount = 0,
    durationSeconds = 0,
    questionResults = [],
  } = summary;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `exam-results-${id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exam results report downloaded!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Completion Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--gradient-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Trophy size={32} color="#fff" />
          </div>
          <div>
            <Badge variant="success">Autonomous Mock Exam Completed</Badge>
            <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Examination Results & Analysis
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Completed in {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s with autonomous verification.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExport}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
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
            <Download size={16} />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => navigate('/')}
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
              gap: '6px',
            }}
          >
            <RotateCcw size={16} />
            <span>New Examination</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Final Accuracy
          </span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 800, color: accuracy >= 75 ? 'var(--bg-success)' : 'var(--bg-warning)' }}>
            {accuracy}%
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {correctCount} of {totalQuestions} answered correctly
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Answered
          </span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {answeredQuestions} / {totalQuestions}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            100% completion rate achieved
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Uncertain Flagged
          </span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--bg-warning)' }}>
            {uncertainCount}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Confidence scored &lt; 60%
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Autonomous Time
          </span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--bg-accent)' }}>
            {durationSeconds}s
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Avg {(durationSeconds / (totalQuestions || 1)).toFixed(1)}s per question
          </p>
        </div>
      </div>

      {/* Per-Question Results Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Per-Question Verification Breakdown
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {questionResults.map((item, index) => {
            const isExpanded = expandedQ === index;
            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid var(--border-primary)',
                  backgroundColor: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
                }}
              >
                <div
                  onClick={() => setExpandedQ(isExpanded ? null : index)}
                  style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: item.isCorrect ? 'var(--bg-success)' : 'var(--bg-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Q#{item.questionNumber}
                        </span>
                        <Badge variant="default">{item.subject}</Badge>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.questionText}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Picked: [{item.selectedOptions.join(', ')}]
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Correct: [{item.correctAnswer.join(', ')}]
                      </div>
                    </div>

                    <Badge variant={item.confidence >= 80 ? 'success' : item.confidence >= 60 ? 'warning' : 'error'}>
                      {item.confidence}%
                    </Badge>

                    {isExpanded ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderTop: '1px solid var(--border-primary)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>AI Explanation:</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
