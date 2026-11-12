import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSession,
  processQuestion,
  nextQuestion,
  pauseSession,
  resumeSession,
  stopSession,
  submitSession,
  autoProcess,
} from '../services/api';
import toast from 'react-hot-toast';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await getSession(sessionId);
      setSession(res.data);
      if (res.exam) setExam(res.exam);
      if (res.currentQuestionData) setCurrentQuestionData(res.currentQuestionData);
    } catch (err) {
      setError(err.message || 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleProcessQuestion = async () => {
    if (!sessionId || processing) return null;
    try {
      setProcessing(true);
      const res = await processQuestion(sessionId);
      setSession(res.data);
      return res;
    } catch (err) {
      toast.error('Failed to process question');
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!sessionId) return null;
    try {
      const res = await nextQuestion(sessionId);
      setSession(res.data);
      // Update current question
      if (exam && exam.questions) {
        const nextIdx = res.data.currentQuestion - 1;
        setCurrentQuestionData(exam.questions[nextIdx] || null);
      }
      return res;
    } catch (err) {
      toast.error('Failed to move to next question');
      throw err;
    }
  };

  const handleAutoProcess = async () => {
    if (!sessionId || processing) return null;
    try {
      setProcessing(true);
      const res = await autoProcess(sessionId);
      setSession(res.data);
      if (exam && exam.questions) {
        const nextIdx = res.data.currentQuestion - 1;
        setCurrentQuestionData(exam.questions[nextIdx] || null);
      }
      return res;
    } catch (err) {
      toast.error('Error during autonomous step');
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;
    try {
      const res = await pauseSession(sessionId);
      setSession(res.data);
      toast('Agent paused', { icon: '⏸️' });
    } catch (err) {
      toast.error('Failed to pause session');
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;
    try {
      const res = await resumeSession(sessionId);
      setSession(res.data);
      toast('Agent resumed', { icon: '▶️' });
    } catch (err) {
      toast.error('Failed to resume session');
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;
    try {
      const res = await stopSession(sessionId);
      setSession(res.data);
      toast('Agent stopped', { icon: '⏹️' });
    } catch (err) {
      toast.error('Failed to stop session');
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return null;
    try {
      setLoading(true);
      const res = await submitSession(sessionId);
      setSession(res.data);
      toast.success('Practice exam submitted successfully!');
      return res;
    } catch (err) {
      toast.error('Failed to submit exam');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    exam,
    currentQuestionData,
    loading,
    processing,
    error,
    refreshSession: fetchSession,
    processQuestion: handleProcessQuestion,
    nextQuestion: handleNextQuestion,
    autoProcess: handleAutoProcess,
    pauseSession: handlePause,
    resumeSession: handleResume,
    stopSession: handleStop,
    submitSession: handleSubmit,
  };
}

export default useSession;
