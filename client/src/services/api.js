import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Axios instance configured for the Exam Cracker API backend.
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Response interceptor for global error handling ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    // Don't toast on cancelled requests
    if (!axios.isCancel(error)) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// ── Exam endpoints ─────────────────────────────────────────────────────

/** Fetch all exams */
export const getExams = () => api.get('/exams').then((r) => r.data)

/** Fetch a single exam by ID */
export const getExam = (id) => api.get(`/exams/${id}`).then((r) => r.data)

/** Create a new exam */
export const createExam = (data) => api.post('/exams', data).then((r) => r.data)

/** Delete an exam by ID */
export const deleteExam = (id) => api.delete(`/exams/${id}`).then((r) => r.data)

/** Seed / generate sample questions for an exam */
export const seedExam = (id) => api.post(`/exams/${id}/seed`).then((r) => r.data)

// ── Session endpoints ──────────────────────────────────────────────────

/** Start a new session for an exam */
export const startSession = (examId) =>
  api.post('/sessions', { examId }).then((r) => r.data)

/** Get session details */
export const getSession = (id) => api.get(`/sessions/${id}`).then((r) => r.data)

/** Process the current question with AI */
export const processQuestion = (sessionId) =>
  api.post(`/sessions/${sessionId}/process`).then((r) => r.data)

/** Move to the next question */
export const nextQuestion = (sessionId) =>
  api.post(`/sessions/${sessionId}/next`).then((r) => r.data)

/** Pause a session */
export const pauseSession = (id) =>
  api.post(`/sessions/${id}/pause`).then((r) => r.data)

/** Resume a paused session */
export const resumeSession = (id) =>
  api.post(`/sessions/${id}/resume`).then((r) => r.data)

/** Stop a session */
export const stopSession = (id) =>
  api.post(`/sessions/${id}/stop`).then((r) => r.data)

/** Submit a completed session */
export const submitSession = (id) =>
  api.post(`/sessions/${id}/submit`).then((r) => r.data)

/** Get session summary / results */
export const getSessionSummary = (id) =>
  api.get(`/sessions/${id}/summary`).then((r) => r.data)

/** Get session activity logs */
export const getSessionLogs = (id) =>
  api.get(`/sessions/${id}/logs`).then((r) => r.data)

/** Auto-process: analyse + verify + advance in one call */
export const autoProcess = (sessionId) =>
  api.post(`/sessions/${sessionId}/auto-process`).then((r) => r.data)

// ── AI endpoints ───────────────────────────────────────────────────────

/** Analyze a question with AI */
export const analyzeQuestion = (data) =>
  api.post('/ai/analyze', data).then((r) => r.data)

/** Run OCR on an image */
export const processOCR = (data) =>
  api.post('/ai/ocr', data).then((r) => r.data)

/** Verify an AI-generated answer */
export const verifyAnswer = (data) =>
  api.post('/ai/verify', data).then((r) => r.data)

/** Get AI service health / status */
export const getAIStatus = () => api.get('/ai/status').then((r) => r.data)

export default api
