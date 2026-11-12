import { analyzeQuestion, verifyAnswer, checkStatus } from '../services/geminiService.js';
import { runFullVerification } from '../services/verificationService.js';
import { processImage } from '../services/ocrService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Standalone question analysis
// @route   POST /api/ai/analyze
export const analyze = asyncHandler(async (req, res) => {
  const { questionText, options, questionType, subject, topic } = req.body;

  if (!questionText) {
    throw new ApiError('questionText is required', 400);
  }

  const result = await runFullVerification({
    questionText,
    options: options || [],
    questionType: questionType || 'mcq',
    subject: subject || 'General',
    topic: topic || '',
    questionNumber: 1,
  });

  res.json({ success: true, data: result });
});

// @desc    OCR image processing
// @route   POST /api/ai/ocr
export const ocr = asyncHandler(async (req, res) => {
  const { image } = req.body;

  if (!image) {
    throw new ApiError('Image data (base64 or URL) is required', 400);
  }

  try {
    const ocrResult = await processImage(image);
    res.json({ success: true, data: ocrResult });
  } catch (error) {
    throw new ApiError(`OCR processing failed: ${error.message}`, 500);
  }
});

// @desc    Standalone answer verification
// @route   POST /api/ai/verify
export const verify = asyncHandler(async (req, res) => {
  const { questionData, primaryAnswer } = req.body;

  if (!questionData || !primaryAnswer) {
    throw new ApiError('questionData and primaryAnswer are required', 400);
  }

  const verificationResult = await verifyAnswer(questionData, primaryAnswer);
  res.json({ success: true, data: verificationResult });
});

// @desc    Check AI service status
// @route   GET /api/ai/status
export const getStatus = asyncHandler(async (req, res) => {
  const status = await checkStatus();
  res.json({ success: true, data: status });
});
