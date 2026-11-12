import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { inMemoryStore } from '../utils/inMemoryStore.js';
import { sampleExam, sampleQuestions } from '../utils/sampleData.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all exams
// @route   GET /api/exams
export const getExams = asyncHandler(async (req, res) => {
  if (isMongoConnected()) {
    const exams = await Exam.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: exams.length, data: exams });
  }

  const exams = inMemoryStore.getAllExams();
  res.json({ success: true, count: exams.length, data: exams });
});

// @desc    Get single exam with questions
// @route   GET /api/exams/:id
export const getExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const exam = await Exam.findById(id).populate('questions');
    if (!exam) {
      throw new ApiError(`Exam not found with id ${id}`, 404);
    }
    return res.json({ success: true, data: exam });
  }

  const exam = inMemoryStore.getExamById(id);
  if (!exam) {
    throw new ApiError(`Exam not found with id ${id}`, 404);
  }
  res.json({ success: true, data: exam });
});

// @desc    Create exam
// @route   POST /api/exams
export const createExam = asyncHandler(async (req, res) => {
  const { title, description, subject, timeLimit, questions = [] } = req.body;

  if (!title) {
    throw new ApiError('Exam title is required', 400);
  }

  if (isMongoConnected()) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const createdQuestions = await Question.insertMany(
        questions.map((q, idx) => ({
          ...q,
          questionNumber: q.questionNumber || idx + 1,
        })),
        { session }
      );

      const exam = await Exam.create(
        [
          {
            title,
            description,
            subject,
            timeLimit,
            totalQuestions: createdQuestions.length,
            questions: createdQuestions.map((q) => q._id),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const populatedExam = await Exam.findById(exam[0]._id).populate('questions');
      return res.status(201).json({ success: true, data: populatedExam });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  const exam = inMemoryStore.createExam({
    title,
    description,
    subject,
    timeLimit,
    questions,
  });

  res.status(201).json({ success: true, data: exam });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
export const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const exam = await Exam.findById(id);
    if (!exam) {
      throw new ApiError(`Exam not found with id ${id}`, 404);
    }
    await Question.deleteMany({ _id: { $in: exam.questions } });
    await Exam.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Exam deleted successfully' });
  }

  const deleted = inMemoryStore.deleteExam(id);
  if (!deleted) {
    throw new ApiError(`Exam not found with id ${id}`, 404);
  }
  res.json({ success: true, message: 'Exam deleted successfully' });
});

// @desc    Seed exam with realistic sample questions
// @route   POST /api/exams/seed
export const seedExam = asyncHandler(async (req, res) => {
  if (isMongoConnected()) {
    const existing = await Exam.findOne({ title: sampleExam.title });
    if (existing) {
      const populated = await Exam.findById(existing._id).populate('questions');
      return res.json({ success: true, message: 'Sample exam already exists', data: populated });
    }

    const createdQuestions = await Question.insertMany(sampleQuestions);
    const exam = await Exam.create({
      ...sampleExam,
      questions: createdQuestions.map((q) => q._id),
    });

    const populated = await Exam.findById(exam._id).populate('questions');
    return res.status(201).json({ success: true, message: 'Sample exam seeded successfully', data: populated });
  }

  // Check if default already seeded in inMemoryStore
  const existing = inMemoryStore.getExamById('exam_sample_default');
  if (existing) {
    return res.json({ success: true, message: 'Sample exam retrieved', data: existing });
  }

  const created = inMemoryStore.createExam({
    ...sampleExam,
    questions: sampleQuestions,
  });

  res.status(201).json({ success: true, message: 'Sample exam created', data: created });
});
