import mongoose from 'mongoose';

const optionAnalysisSchema = new mongoose.Schema(
  {
    optionId: String,
    optionText: String,
    isCorrect: Boolean,
    reasoning: String,
  },
  { _id: false }
);

const verificationResultSchema = new mongoose.Schema(
  {
    verified: { type: Boolean, default: false },
    method: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const subjectValidationSchema = new mongoose.Schema(
  {
    validated: { type: Boolean, default: false },
    subject: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const aiResponseSchema = new mongoose.Schema(
  {
    answer: { type: [String], default: [] },
    explanation: { type: String, default: '' },
    optionAnalysis: { type: [optionAnalysisSchema], default: [] },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    verificationResult: { type: verificationResultSchema, default: () => ({}) },
    subjectValidation: { type: subjectValidationSchema, default: () => ({}) },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionNumber: Number,
    selectedOptions: { type: [String], default: [] },
    aiResponse: { type: aiResponseSchema, default: () => ({}) },
    isUncertain: { type: Boolean, default: false },
    processedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    message: { type: String, default: '' },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'paused', 'completed', 'error'],
      default: 'idle',
    },
    currentQuestion: { type: Number, default: 1 },
    totalQuestions: { type: Number, default: 0 },
    processedQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    uncertainAnswers: { type: Number, default: 0 },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    pausedAt: { type: Date, default: null },
    totalPausedTime: { type: Number, default: 0 }, // in ms
    answers: { type: [answerSchema], default: [] },
    activityLog: { type: [activityLogSchema], default: [] },
    estimatedTimeRemaining: { type: Number, default: 0 }, // in seconds
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
