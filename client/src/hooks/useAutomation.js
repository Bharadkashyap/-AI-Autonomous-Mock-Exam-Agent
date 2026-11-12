import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useAutomation({
  session,
  exam,
  processQuestion,
  nextQuestion,
  pauseSession,
  resumeSession,
  stopSession,
  submitSession,
  onComplete,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState('normal'); // 'normal' (1500ms) or 'fast' (600ms)
  const [currentStep, setCurrentStep] = useState('idle'); // 'reading', 'analyzing', 'verifying', 'selecting', 'advancing', 'idle'

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const startAutomation = useCallback(async () => {
    if (isRunningRef.current && !isPausedRef.current) return;

    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      await resumeSession();
      runAutomationLoop();
      return;
    }

    isRunningRef.current = true;
    isPausedRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    toast.success('🚀 AI Autonomous Agent started!', { id: 'agent-start' });

    runAutomationLoop();
  }, [session, exam, processQuestion, nextQuestion, submitSession, onComplete]);

  const pauseAutomation = useCallback(async () => {
    isPausedRef.current = true;
    setIsPaused(true);
    setCurrentStep('paused');
    await pauseSession();
  }, [pauseSession]);

  const resumeAutomation = useCallback(async () => {
    isPausedRef.current = false;
    setIsPaused(false);
    await resumeSession();
    runAutomationLoop();
  }, [resumeSession]);

  const stopAutomation = useCallback(async () => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep('idle');
    await stopSession();
  }, [stopSession]);

  const runAutomationLoop = async () => {
    while (isRunningRef.current && !isPausedRef.current) {
      const stepDelay = speedRef.current === 'fast' ? 500 : 1200;

      // 1. Reading question
      setCurrentStep('reading');
      await delay(stepDelay * 0.4);
      if (!isRunningRef.current || isPausedRef.current) break;

      // 2. Analyzing question & determining answer
      setCurrentStep('analyzing');
      await delay(stepDelay * 0.3);
      if (!isRunningRef.current || isPausedRef.current) break;

      // 3. Verifying reasoning & validating options
      setCurrentStep('verifying');
      let result;
      try {
        result = await processQuestion();
      } catch (err) {
        console.error('Error in autonomous processing:', err);
        toast.error('AI encounter an error. Retrying in 2 seconds...');
        await delay(2000);
        continue;
      }
      if (!isRunningRef.current || isPausedRef.current) break;

      // 4. Selecting answer
      setCurrentStep('selecting');
      await delay(stepDelay * 0.4);
      if (!isRunningRef.current || isPausedRef.current) break;

      // 5. Check if finished or advance
      const updatedSession = result?.data || session;
      const totalQ = updatedSession?.totalQuestions || exam?.questions?.length || 15;
      const currentQ = updatedSession?.currentQuestion || 1;

      if (currentQ >= totalQ) {
        // Last question completed!
        setCurrentStep('submitting');
        await delay(1000);
        toast.success('All questions answered! Submitting mock exam...', { id: 'auto-submit' });
        try {
          const summaryRes = await submitSession();
          isRunningRef.current = false;
          setIsRunning(false);
          setCurrentStep('completed');
          if (onComplete) onComplete(summaryRes);
        } catch (err) {
          console.error('Error submitting exam:', err);
        }
        break;
      }

      // Move to next question
      setCurrentStep('advancing');
      await nextQuestion();
      await delay(stepDelay * 0.5);
    }
  };

  useEffect(() => {
    return () => {
      isRunningRef.current = false;
    };
  }, []);

  return {
    isRunning,
    isPaused,
    speed,
    setSpeed,
    currentStep,
    startAutomation,
    pauseAutomation,
    resumeAutomation,
    stopAutomation,
  };
}

export default useAutomation;
