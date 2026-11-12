import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: 'General',
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 60,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
