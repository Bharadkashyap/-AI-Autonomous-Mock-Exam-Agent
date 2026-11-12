import mongoose from 'mongoose';
import Session from '../models/Session.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';
import { runFullVerification } from '../services/verificationService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper to calculate estimated time remaining (in seconds)
const calculateRemainingTime = (session, totalQuestions) => {
  const answeredCount = session.answers ? session.answers.length : 0;
  const remaining = totalQuestions - answeredCount;
  if (remaining <= 0) return 0;
  return remaining * 3; // ~3 seconds per question
};

// @desc    Start an examination session
// @route   POST /api/sessions/start
export const startSession = asyncHandler(async (req, res) => {
  const { examId } = req.body;
  if (!examId) {
    throw new ApiError('examId is required to start a session', 400);
  }

  let exam;
  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(examId)) {
    exam = await Exam.findById(examId).populate('questions');
  } else {
    exam = inMemoryStore.getExamById(examId);
  }

  if (!exam) {
    throw new ApiError(`Exam not found with id ${examId}`, 404);
  }

  const totalQuestions = exam.questions ? exam.questions.length : 0;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(examId)) {
    const session = await Session.create({
      examId,
      status: 'running',
      currentQuestion: 1,
      totalQuestions,
      processedQuestions: 0,
      answeredQuestions: 0,
      uncertainAnswers: 0,
      startTime: new Date(),
      activityLog: [
        {
          timestamp: new Date(),
          type: 'info',
          message: `AI Agent started practice exam: "${exam.title}" (${totalQuestions} total questions).`,
        },
      ],
      estimatedTimeRemaining: totalQuestions * 3,
    });

    return res.status(201).json({
      success: true,
      data: session,
      exam,
      currentQuestionData: exam.questions[0] || null,
    });
  }

  // Fallback in-memory
  const session = inMemoryStore.createSession(examId);
  session.status = 'running';
  session.estimatedTimeRemaining = totalQuestions * 3;

  res.status(201).json({
    success: true,
    data: session,
    exam,
    currentQuestionData: exam.questions[0] || null,
  });
});

// @desc    Get session details
// @route   GET /api/sessions/:id
export const getSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  let exam;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = await Exam.findById(session.examId).populate('questions');
  } else {
    session = inMemoryStore.getSession(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = inMemoryStore.getExamById(session.examId);
  }

  const currentIndex = Math.max(session.currentQuestion - 1, 0);
  const currentQuestionData = exam && exam.questions ? exam.questions[currentIndex] || null : null;

  res.json({
    success: true,
    data: session,
    exam,
    currentQuestionData,
  });
});

// @desc    Process current question (AI analysis + verification)
// @route   POST /api/sessions/:id/process
export const processQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  let exam;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = await Exam.findById(session.examId).populate('questions');
  } else {
    session = inMemoryStore.getSession(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = inMemoryStore.getExamById(session.examId);
  }

  const currentIndex = session.currentQuestion - 1;
  const question = exam.questions[currentIndex];

  if (!question) {
    throw new ApiError('Question index out of bounds', 400);
  }

  // Check if question was already processed to prevent duplicate processing
  const alreadyProcessed = (session.answers || []).some(
    (a) => a.questionNumber === session.currentQuestion
  );

  // Run full AI verification pipeline
  const aiResult = await runFullVerification(question);

  const answerRecord = {
    questionId: question._id || question.id,
    questionNumber: session.currentQuestion,
    selectedOptions: aiResult.answer,
    aiResponse: {
      answer: aiResult.answer,
      explanation: aiResult.explanation,
      optionAnalysis: aiResult.optionAnalysis,
      confidence: aiResult.confidence,
      verificationResult: aiResult.verificationResult,
      subjectValidation: aiResult.subjectValidation,
    },
    isUncertain: aiResult.isUncertain,
    processedAt: new Date(),
  };

  const newLog = {
    timestamp: new Date(),
    type: aiResult.isUncertain ? 'warning' : 'success',
    message: `Question #${session.currentQuestion} processed. AI selected [${aiResult.answer.join(', ')}] with ${aiResult.confidence}% confidence.`,
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    // If already processed, replace it, else push
    if (alreadyProcessed) {
      await Session.updateOne(
        { _id: id, 'answers.questionNumber': session.currentQuestion },
        {
          $set: {
            'answers.$': answerRecord,
            updatedAt: new Date(),
          },
          $push: { activityLog: newLog },
        }
      );
    } else {
      await Session.updateOne(
        { _id: id },
        {
          $push: { answers: answerRecord, activityLog: newLog },
          $inc: {
            processedQuestions: 1,
            answeredQuestions: 1,
            uncertainAnswers: aiResult.isUncertain ? 1 : 0,
          },
          $set: {
            estimatedTimeRemaining: calculateRemainingTime(session, session.totalQuestions),
            updatedAt: new Date(),
          },
        }
      );
    }

    const updated = await Session.findById(id);
    return res.json({
      success: true,
      data: updated,
      answer: answerRecord,
      aiResult,
    });
  }

  // In-memory update
  if (alreadyProcessed) {
    session.answers = session.answers.map((a) =>
      a.questionNumber === session.currentQuestion ? answerRecord : a
    );
  } else {
    session.answers.push(answerRecord);
    session.processedQuestions += 1;
    session.answeredQuestions += 1;
    if (aiResult.isUncertain) session.uncertainAnswers += 1;
  }
  session.activityLog.push(newLog);
  session.estimatedTimeRemaining = calculateRemainingTime(session, session.totalQuestions);
  inMemoryStore.updateSession(id, session);

  res.json({
    success: true,
    data: session,
    answer: answerRecord,
    aiResult,
  });
});

// @desc    Move to next question
// @route   POST /api/sessions/:id/next
export const nextQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
  } else {
    session = inMemoryStore.getSession(id);
  }

  if (!session) throw new ApiError('Session not found', 404);

  const isLastQuestion = session.currentQuestion >= session.totalQuestions;

  if (isLastQuestion) {
    const log = {
      timestamp: new Date(),
      type: 'info',
      message: 'Reached the final question of the mock examination.',
    };

    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      session = await Session.findByIdAndUpdate(
        id,
        { $push: { activityLog: log } },
        { new: true }
      );
    } else {
      session.activityLog.push(log);
      inMemoryStore.updateSession(id, session);
    }

    return res.json({
      success: true,
      isLastQuestion: true,
      data: session,
      message: 'All questions have been navigated.',
    });
  }

  const nextQ = session.currentQuestion + 1;
  const log = {
    timestamp: new Date(),
    type: 'info',
    message: `Navigated to question #${nextQ} of ${session.totalQuestions}.`,
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findByIdAndUpdate(
      id,
      {
        $set: { currentQuestion: nextQ },
        $push: { activityLog: log },
      },
      { new: true }
    );
  } else {
    session.currentQuestion = nextQ;
    session.activityLog.push(log);
    inMemoryStore.updateSession(id, session);
  }

  res.json({
    success: true,
    isLastQuestion: session.currentQuestion >= session.totalQuestions,
    data: session,
  });
});

// @desc    Atomic auto process: process current question + auto advance
// @route   POST /api/sessions/:id/auto
export const autoProcess = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  let exam;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = await Exam.findById(session.examId).populate('questions');
  } else {
    session = inMemoryStore.getSession(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = inMemoryStore.getExamById(session.examId);
  }

  const currentQNum = session.currentQuestion;
  const question = exam.questions[currentQNum - 1];

  if (!question) {
    return res.json({
      success: true,
      isCompleted: true,
      data: session,
      message: 'No further questions to process.',
    });
  }

  // Execute verification pipeline
  const aiResult = await runFullVerification(question);

  const answerRecord = {
    questionId: question._id || question.id,
    questionNumber: currentQNum,
    selectedOptions: aiResult.answer,
    aiResponse: {
      answer: aiResult.answer,
      explanation: aiResult.explanation,
      optionAnalysis: aiResult.optionAnalysis,
      confidence: aiResult.confidence,
      verificationResult: aiResult.verificationResult,
      subjectValidation: aiResult.subjectValidation,
    },
    isUncertain: aiResult.isUncertain,
    processedAt: new Date(),
  };

  const isLastQuestion = currentQNum >= session.totalQuestions;
  const nextQ = isLastQuestion ? currentQNum : currentQNum + 1;

  const logsToAdd = [
    {
      timestamp: new Date(),
      type: aiResult.isUncertain ? 'warning' : 'success',
      message: `[AI Solved] Q#${currentQNum} -> Selected [${aiResult.answer.join(', ')}] (${aiResult.confidence}% confidence).`,
    },
  ];

  if (isLastQuestion) {
    logsToAdd.push({
      timestamp: new Date(),
      type: 'info',
      message: 'All questions processed! Examination is ready for review and submission.',
    });
  }

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    await Session.updateOne(
      { _id: id },
      {
        $push: { answers: answerRecord, activityLog: { $each: logsToAdd } },
        $inc: {
          processedQuestions: 1,
          answeredQuestions: 1,
          uncertainAnswers: aiResult.isUncertain ? 1 : 0,
        },
        $set: {
          currentQuestion: nextQ,
          status: isLastQuestion ? 'completed' : 'running',
          estimatedTimeRemaining: isLastQuestion ? 0 : calculateRemainingTime(session, session.totalQuestions),
          updatedAt: new Date(),
        },
      }
    );

    const updated = await Session.findById(id);
    return res.json({
      success: true,
      data: updated,
      answer: answerRecord,
      aiResult,
      isLastQuestion,
    });
  }

  session.answers.push(answerRecord);
  session.processedQuestions += 1;
  session.answeredQuestions += 1;
  if (aiResult.isUncertain) session.uncertainAnswers += 1;
  session.activityLog.push(...logsToAdd);
  session.currentQuestion = nextQ;
  if (isLastQuestion) session.status = 'completed';
  session.estimatedTimeRemaining = isLastQuestion ? 0 : calculateRemainingTime(session, session.totalQuestions);
  inMemoryStore.updateSession(id, session);

  res.json({
    success: true,
    data: session,
    answer: answerRecord,
    aiResult,
    isLastQuestion,
  });
});

// @desc    Pause exam session
// @route   POST /api/sessions/:id/pause
export const pauseSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = {
    timestamp: new Date(),
    type: 'warning',
    message: 'Examination automation paused by user.',
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const session = await Session.findByIdAndUpdate(
      id,
      {
        $set: { status: 'paused', pausedAt: new Date() },
        $push: { activityLog: log },
      },
      { new: true }
    );
    return res.json({ success: true, data: session });
  }

  const session = inMemoryStore.getSession(id);
  if (!session) throw new ApiError('Session not found', 404);
  session.status = 'paused';
  session.pausedAt = new Date();
  session.activityLog.push(log);
  inMemoryStore.updateSession(id, session);
  res.json({ success: true, data: session });
});

// @desc    Resume exam session
// @route   POST /api/sessions/:id/resume
export const resumeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = {
    timestamp: new Date(),
    type: 'info',
    message: 'Examination automation resumed.',
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const current = await Session.findById(id);
    let extraPausedTime = 0;
    if (current && current.pausedAt) {
      extraPausedTime = Date.now() - new Date(current.pausedAt).getTime();
    }

    const session = await Session.findByIdAndUpdate(
      id,
      {
        $set: { status: 'running', pausedAt: null },
        $inc: { totalPausedTime: extraPausedTime },
        $push: { activityLog: log },
      },
      { new: true }
    );
    return res.json({ success: true, data: session });
  }

  const session = inMemoryStore.getSession(id);
  if (!session) throw new ApiError('Session not found', 404);
  if (session.pausedAt) {
    session.totalPausedTime += Date.now() - new Date(session.pausedAt).getTime();
    session.pausedAt = null;
  }
  session.status = 'running';
  session.activityLog.push(log);
  inMemoryStore.updateSession(id, session);
  res.json({ success: true, data: session });
});

// @desc    Stop exam session
// @route   POST /api/sessions/:id/stop
export const stopSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = {
    timestamp: new Date(),
    type: 'error',
    message: 'Examination automation stopped.',
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const session = await Session.findByIdAndUpdate(
      id,
      {
        $set: { status: 'idle', endTime: new Date() },
        $push: { activityLog: log },
      },
      { new: true }
    );
    return res.json({ success: true, data: session });
  }

  const session = inMemoryStore.getSession(id);
  if (!session) throw new ApiError('Session not found', 404);
  session.status = 'idle';
  session.endTime = new Date();
  session.activityLog.push(log);
  inMemoryStore.updateSession(id, session);
  res.json({ success: true, data: session });
});

// @desc    Submit mock examination
// @route   POST /api/sessions/:id/submit
export const submitSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  let exam;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = await Exam.findById(session.examId).populate('questions');
  } else {
    session = inMemoryStore.getSession(id);
    if (!session) throw new ApiError('Session not found', 404);
    exam = inMemoryStore.getExamById(session.examId);
  }

  // Calculate grading and accuracy
  let totalScore = 0;
  const questionResults = [];

  (exam.questions || []).forEach((q) => {
    const ans = (session.answers || []).find((a) => a.questionNumber === q.questionNumber);
    const selected = ans ? ans.selectedOptions : [];
    const correct = q.correctAnswer || [];

    // Compare arrays
    const isCorrect =
      selected.length === correct.length &&
      selected.every((s) => correct.includes(s));

    if (isCorrect) totalScore += 1;

    questionResults.push({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      subject: q.subject,
      difficulty: q.difficulty,
      selectedOptions: selected,
      correctAnswer: correct,
      isCorrect,
      confidence: ans ? ans.aiResponse.confidence : 0,
      explanation: ans ? ans.aiResponse.explanation : 'Unanswered',
    });
  });

  const accuracy = exam.questions.length > 0
    ? Math.round((totalScore / exam.questions.length) * 100)
    : 0;

  const log = {
    timestamp: new Date(),
    type: 'success',
    message: `Examination officially submitted! Final score: ${totalScore}/${exam.questions.length} (${accuracy}% accuracy).`,
  };

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findByIdAndUpdate(
      id,
      {
        $set: { status: 'completed', endTime: new Date() },
        $push: { activityLog: log },
      },
      { new: true }
    );
  } else {
    session.status = 'completed';
    session.endTime = new Date();
    session.activityLog.push(log);
    inMemoryStore.updateSession(id, session);
  }

  res.json({
    success: true,
    data: session,
    summary: {
      totalQuestions: exam.questions.length,
      answeredQuestions: session.answeredQuestions,
      correctCount: totalScore,
      accuracy,
      uncertainCount: session.uncertainAnswers,
      durationSeconds: Math.round(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
      ),
      questionResults,
    },
  });
});

// @desc    Get session summary
// @route   GET /api/sessions/:id/summary
export const getSessionSummary = asyncHandler(async (req, res) => {
  return submitSession(req, res);
});

// @desc    Get session activity logs
// @route   GET /api/sessions/:id/logs
export const getSessionLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let session;
  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    session = await Session.findById(id);
  } else {
    session = inMemoryStore.getSession(id);
  }

  if (!session) throw new ApiError('Session not found', 404);
  res.json({ success: true, count: session.activityLog.length, data: session.activityLog });
});
