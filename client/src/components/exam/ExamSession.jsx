import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { useAutomation } from '../../hooks/useAutomation';
import QuestionCard from './QuestionCard';
import AIAnalysisPanel from './AIAnalysisPanel';
import AutomationControls from './AutomationControls';
import SubmitModal from './SubmitModal';
import ActivityLog from '../log/ActivityLog';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import { Layers, Clock, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    session,
    exam,
    currentQuestionData,
    loading,
    processing,
    processQuestion,
    nextQuestion,
    pauseSession,
    resumeSession,
    stopSession,
    submitSession,
    refreshSession,
  } = useSession(id);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Sync selected index when session updates
  useEffect(() => {
    if (session && session.currentQuestion) {
      setSelectedQuestionIndex(session.currentQuestion - 1);
    }
  }, [session?.currentQuestion]);

  const automation = useAutomation({
    session,
    exam,
    processQuestion,
    nextQuestion,
    pauseSession,
    resumeSession,
    stopSession,
    submitSession,
    onComplete: (summaryRes) => {
      navigate(`/results/${id}`);
    },
  });

  if (loading || !session) {
    return <LoadingSpinner size="lg" text="Initializing Autonomous Examination Session..." />;
  }

  const questions = exam?.questions || [];
  const currentQuestion = questions[selectedQuestionIndex] || currentQuestionData;
  const currentQNum = selectedQuestionIndex + 1;

  // Find existing answer for currently viewed question
  const existingAnswerRecord = (session.answers || []).find(
    (a) => a.questionNumber === currentQNum
  );

  const selectedOptions = existingAnswerRecord ? existingAnswerRecord.selectedOptions : [];
  const aiResponse = existingAnswerRecord ? existingAnswerRecord.aiResponse : null;

  const handleSelectOption = (optId) => {
    // If agent is actively running, manual interaction is locked
    if (automation.isRunning && !automation.isPaused) {
      toast('Agent is autonomously managing choices. Pause agent to modify manually.', { icon: 'ℹ️' });
      return;
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await submitSession();
      setIsSubmitModalOpen(false);
      navigate(`/results/${id}`);
    } catch (err) {
      // handled
    }
  };

  const isLastQuestion = session.currentQuestion >= (exam?.questions?.length || session.totalQuestions);
  const allAnswered = session.answeredQuestions >= (exam?.questions?.length || session.totalQuestions);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
      {/* Top Session Status Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {exam?.title || 'Mock Examination'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {exam?.subject || 'General'} • {questions.length} Total Questions
            </p>
          </div>
          <Badge variant={session.status === 'running' ? 'success' : session.status === 'paused' ? 'warning' : 'default'}>
            Status: {session.status.toUpperCase()}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              Progress
            </span>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {session.answeredQuestions || 0} / {questions.length || session.totalQuestions} Answered
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 340px',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column (25%) — Question Navigation Grid */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Questions Grid
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {questions.length} Total
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}
          >
            {questions.map((q, idx) => {
              const qNum = idx + 1;
              const ans = (session.answers || []).find((a) => a.questionNumber === qNum);
              const isCurrent = idx === selectedQuestionIndex;
              const isAnswered = Boolean(ans && ans.selectedOptions && ans.selectedOptions.length > 0);
              const isUncertain = ans ? ans.isUncertain : false;

              let btnBg = 'var(--bg-tertiary)';
              let btnColor = 'var(--text-secondary)';
              let btnBorder = '1px solid var(--border-primary)';

              if (isCurrent) {
                btnBg = 'var(--bg-accent)';
                btnColor = '#fff';
                btnBorder = '1px solid var(--bg-accent)';
              } else if (isUncertain) {
                btnBg = 'rgba(245, 158, 11, 0.2)';
                btnColor = 'var(--bg-warning)';
                btnBorder = '1px solid var(--bg-warning)';
              } else if (isAnswered) {
                btnBg = 'rgba(16, 185, 129, 0.2)';
                btnColor = 'var(--bg-success)';
                btnBorder = '1px solid var(--bg-success)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  disabled={automation.isRunning && !automation.isPaused}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    background: btnBg,
                    color: btnColor,
                    border: btnBorder,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: automation.isRunning && !automation.isPaused ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {qNum}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              borderTop: '1px solid var(--border-primary)',
              paddingTop: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              fontSize: '0.6875rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-accent)' }} />
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-success)' }} />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-warning)' }} />
              <span>Uncertain</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }} />
              <span>Unvisited</span>
            </div>
          </div>
        </div>

        {/* Center Column (50%) — Question Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <QuestionCard
            question={currentQuestion}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
            aiResponse={aiResponse}
            disabled={automation.isRunning && !automation.isPaused}
          />
        </div>

        {/* Right Column (25%) — AI Analysis Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AIAnalysisPanel
            aiResponse={aiResponse}
            isProcessing={processing || (automation.isRunning && !automation.isPaused)}
            currentStep={automation.currentStep}
            onReanalyze={() => processQuestion()}
          />
        </div>
      </div>

      {/* Bottom Bar — Automation Controls */}
      <AutomationControls
        isRunning={automation.isRunning}
        isPaused={automation.isPaused}
        speed={automation.speed}
        onSpeedToggle={() =>
          automation.setSpeed(automation.speed === 'fast' ? 'normal' : 'fast')
        }
        onStart={automation.startAutomation}
        onPause={automation.pauseAutomation}
        onResume={automation.resumeAutomation}
        onStop={automation.stopAutomation}
        onSkip={() => {
          if (selectedQuestionIndex < questions.length - 1) {
            setSelectedQuestionIndex(selectedQuestionIndex + 1);
          }
        }}
        onSubmit={() => setIsSubmitModalOpen(true)}
        isLastQuestion={isLastQuestion}
        allAnswered={allAnswered}
        currentQuestionNumber={currentQNum}
        totalQuestions={questions.length}
        processing={processing}
        estimatedTimeRemaining={session.estimatedTimeRemaining || 0}
      />

      {/* Real-time Activity Log Panel at Bottom */}
      <ActivityLog logs={session.activityLog || []} maxHeight="180px" />

      {/* Submit Confirmation Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={loading}
        totalQuestions={questions.length}
        answeredQuestions={session.answeredQuestions || 0}
        uncertainAnswers={session.uncertainAnswers || 0}
      />
    </div>
  );
}
