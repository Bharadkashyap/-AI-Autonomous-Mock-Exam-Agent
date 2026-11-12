import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      index: true,
    },
    questionNumber: {
      type: Number,
      required: [true, 'Question number is required'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
    },
    questionImage: {
      type: String, // base64 or URL
      default: null,
    },
    questionType: {
      type: String,
      enum: ['mcq', 'multiple-select', 'true-false'],
      default: 'mcq',
    },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        isSelected: { type: Boolean, default: false },
      },
    ],
    correctAnswer: {
      type: [String], // array to support multiple-select
      default: [],
    },
    subject: {
      type: String,
      default: '',
    },
    topic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    hasImage: { type: Boolean, default: false },
    hasCode: { type: Boolean, default: false },
    hasMath: { type: Boolean, default: false },
    hasTable: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup
questionSchema.index({ examId: 1, questionNumber: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
