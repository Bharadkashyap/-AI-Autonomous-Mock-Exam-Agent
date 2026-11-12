import express from 'express';
import {
  startSession,
  getSession,
  processQuestion,
  nextQuestion,
  autoProcess,
  pauseSession,
  resumeSession,
  stopSession,
  submitSession,
  getSessionSummary,
  getSessionLogs,
} from '../controllers/sessionController.js';

const router = express.Router();

// Support both /start and / for session creation
router.post('/start', startSession);
router.post('/', startSession);

router.get('/:id', getSession);
router.post('/:id/process', processQuestion);
router.post('/:id/next', nextQuestion);
router.post('/:id/auto', autoProcess);
router.post('/:id/auto-process', autoProcess);
router.post('/:id/pause', pauseSession);
router.post('/:id/resume', resumeSession);
router.post('/:id/stop', stopSession);
router.post('/:id/submit', submitSession);
router.get('/:id/summary', getSessionSummary);
router.get('/:id/logs', getSessionLogs);

export default router;
