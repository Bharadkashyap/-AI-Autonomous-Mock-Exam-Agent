import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Target,
  Play,
  PlusCircle,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useExams } from '../../hooks/useExams';
import { startSession } from '../../services/api';
import StatsCard from './StatsCard';
import ProgressRing from './ProgressRing';
import ActivityLog from '../log/ActivityLog';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { exams, loading, seedExam } = useExams();
  const [startingExamId, setStartingExamId] = useState(null);

  // Global aggregate stats
  const totalExams = exams.length;
  const sampleExam = exams.find((e) => e._id === 'exam_sample_default' || e.title.includes('Comprehensive')) || exams[0];
  const totalQuestions = exams.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

  const handleStartExam = async (examId) => {
    try {
      setStartingExamId(examId);
      const res = await startSession(examId);
      toast.success('Practice exam session launched!');
      navigate(`/session/${res.data._id || res.data.id}`);
    } catch (err) {
      toast.error('Failed to start exam session');
    } finally {
      setStartingExamId(null);
    }
  };

  const handleSeed = async () => {
    try {
      await seedExam();
    } catch (err) {
      // handled in hook
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Exam Dashboard..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="accent" icon={Sparkles}>
              Autonomous Mock Examination Platform
            </Badge>
          </div>
          <h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            AI Automated Examination Agent
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              lineHeight: 1.5,
            }}
          >
            Launch the autonomous agent to complete practice exams end-to-end with one click.
            Powered by Google Gemini 2.0 with multi-layer reasoning verification and subject validation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {sampleExam && (
            <button
              onClick={() => handleStartExam(sampleExam._id || sampleExam.id)}
              disabled={startingExamId !== null}
              style={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Play size={16} fill="#fff" />
              <span>Start Autonomous Mock Exam</span>
            </button>
          )}

          <button
            onClick={() => navigate('/exams')}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlusCircle size={16} />
            <span>Manage Exams</span>
          </button>
        </div>
      </div>

      {/* Row 1 — 4 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatsCard
          title="Available Questions"
          value={totalQuestions}
          subtitle={`Across ${totalExams} mock examination${totalExams === 1 ? '' : 's'}`}
          icon={Brain}
          color="accent"
        />
        <StatsCard
          title="AI Engine Status"
          value="Operational"
          subtitle="Google Gemini 2.0 Flash active"
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Verification Layers"
          value="5 Layers"
          subtitle="Primary, Elimination, Subject, Logic, Confidence"
          icon={ShieldCheck}
          color="info"
        />
        <StatsCard
          title="Avg Confidence Target"
          value="92-96%"
          subtitle="Strict non-100% calibration rule"
          icon={Target}
          color="warning"
        />
      </div>

      {/* Row 2 — 2 Columns (Recent Exams & Verification Architecture) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column — Practice Exams List */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--bg-accent)" />
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Available Practice Examinations
              </h3>
            </div>
            <button
              onClick={handleSeed}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Reload Sample Exam
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exams.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No exams found. Click "Reload Sample Exam" above to load standard practice questions.
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam._id || exam.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {exam.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {exam.subject} • {exam.totalQuestions || 0} questions • {exam.timeLimit || 45} mins
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartExam(exam._id || exam.id)}
                    disabled={startingExamId === (exam._id || exam.id)}
                    style={{
                      background: 'var(--bg-accent)',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <span>{startingExamId === (exam._id || exam.id) ? 'Launching...' : 'Launch Agent'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column — 5-Layer AI Verification Pipeline */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--bg-success)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Autonomous 5-Layer Verification Engine
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              {
                step: '1',
                title: 'Gemini Primary Analysis',
                desc: 'Generates structured JSON with step-by-step reasoning and evaluates every option.',
              },
              {
                step: '2',
                title: 'Elimination Method Verification',
                desc: 'Independent prompt systematically disqualifies distractors to cross-check the primary pick.',
              },
              {
                step: '3',
                title: 'Subject-Specific Domain Validation',
                desc: 'Programming trace, mathematical step-solver, or SQL clause parser according to subject.',
              },
              {
                step: '4',
                title: 'Option Consistency Checking',
                desc: 'Ensures no logical contradiction between primary and verification answer sets.',
              },
              {
                step: '5',
                title: 'Calibrated Confidence Scoring',
                desc: 'Weights all layers; marks answers as uncertain when confidence dips below 60%.',
              },
            ].map((layer) => (
              <div
                key={layer.step}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--bg-accent)',
                    flexShrink: 0,
                  }}
                >
                  {layer.step}
                </div>
                <div>
                  <h5 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {layer.title}
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                    {layer.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 — Real-Time Activity Log */}
      <ActivityLog
        logs={[
          {
            timestamp: new Date(),
            type: 'info',
            message: 'AI Autonomous Mock Exam Agent ready. System standing by for user activation.',
          },
        ]}
      />
    </div>
  );
}
