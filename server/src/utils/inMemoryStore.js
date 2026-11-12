import { sampleExam, sampleQuestions } from './sampleData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory data store for standalone testing or when MongoDB is not connected.
 */
class InMemoryStore {
  constructor() {
    this.exams = new Map();
    this.questions = new Map();
    this.sessions = new Map();
    this.initDefaultData();
  }

  initDefaultData() {
    const examId = 'exam_sample_default';
    const questionIds = [];

    sampleQuestions.forEach((q, idx) => {
      const qId = `question_${idx + 1}`;
      questionIds.push(qId);
      this.questions.set(qId, {
        _id: qId,
        id: qId,
        examId,
        ...q,
      });
    });

    this.exams.set(examId, {
      _id: examId,
      id: examId,
      ...sampleExam,
      questions: questionIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[InMemoryStore] Initialized with 1 default exam and ${questionIds.length} questions.`);
  }

  // Exam operations
  getAllExams() {
    return Array.from(this.exams.values());
  }

  getExamById(id) {
    const exam = this.exams.get(id);
    if (!exam) return null;
    const populatedQuestions = (exam.questions || []).map((qId) => {
      if (typeof qId === 'object' && qId !== null) return qId;
      return this.questions.get(qId) || null;
    }).filter(Boolean);

    return { ...exam, questions: populatedQuestions };
  }

  createExam(data) {
    const id = `exam_${uuidv4().slice(0, 8)}`;
    const questionIds = [];

    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach((q, idx) => {
        const qId = `q_${uuidv4().slice(0, 8)}`;
        questionIds.push(qId);
        this.questions.set(qId, {
          _id: qId,
          id: qId,
          examId: id,
          questionNumber: q.questionNumber || idx + 1,
          ...q,
        });
      });
    }

    const exam = {
      _id: id,
      id,
      title: data.title || 'Untitled Exam',
      description: data.description || '',
      subject: data.subject || 'General',
      totalQuestions: questionIds.length || data.totalQuestions || 0,
      timeLimit: data.timeLimit || 60,
      questions: questionIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.exams.set(id, exam);
    return exam;
  }

  deleteExam(id) {
    const exam = this.exams.get(id);
    if (!exam) return false;
    if (exam.questions) {
      exam.questions.forEach((qId) => this.questions.delete(qId));
    }
    return this.exams.delete(id);
  }

  seedSampleExam(examId) {
    const exam = this.exams.get(examId);
    if (!exam) return null;

    const questionIds = [];
    sampleQuestions.forEach((q, idx) => {
      const qId = `question_${idx + 1}_${Date.now()}`;
      questionIds.push(qId);
      this.questions.set(qId, {
        _id: qId,
        id: qId,
        examId,
        ...q,
      });
    });

    exam.questions = questionIds;
    exam.totalQuestions = questionIds.length;
    exam.updatedAt = new Date();
    this.exams.set(examId, exam);
    return this.getExamById(examId);
  }

  // Question operations
  getQuestion(id) {
    return this.questions.get(id);
  }

  getQuestionsByExam(examId) {
    return Array.from(this.questions.values()).filter((q) => q.examId === examId);
  }

  // Session operations
  createSession(examId) {
    const exam = this.getExamById(examId);
    if (!exam) return null;

    const sessionId = `session_${uuidv4().slice(0, 8)}`;
    const session = {
      _id: sessionId,
      id: sessionId,
      examId,
      status: 'idle',
      currentQuestion: 1,
      totalQuestions: exam.questions.length,
      processedQuestions: 0,
      answeredQuestions: 0,
      uncertainAnswers: 0,
      startTime: new Date(),
      endTime: null,
      pausedAt: null,
      totalPausedTime: 0,
      answers: [],
      activityLog: [
        {
          timestamp: new Date(),
          type: 'info',
          message: `Session initialized for exam: "${exam.title}" (${exam.questions.length} questions).`,
        },
      ],
      estimatedTimeRemaining: exam.questions.length * 3, // ~3s per question
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id) || null;
  }

  updateSession(id, updates) {
    const session = this.sessions.get(id);
    if (!session) return null;
    const updated = { ...session, ...updates, updatedAt: new Date() };
    this.sessions.set(id, updated);
    return updated;
  }
}

export const inMemoryStore = new InMemoryStore();
