/**
 * Verification Service — Multi-layer answer verification pipeline.
 * Orchestrates primary analysis, independent verification, and subject validation.
 */
import { analyzeQuestion, verifyAnswer, validateBySubject } from './geminiService.js';

/**
 * Run the full multi-layer verification pipeline for a question.
 * 
 * Pipeline steps:
 * 1. Get primary answer from Gemini
 * 2. Run independent verification (elimination method)
 * 3. Run subject-specific validation
 * 4. Check option consistency (no contradictions)
 * 5. Calculate final confidence score
 * 
 * @param {Object} questionData - The question data object.
 * @returns {Promise<Object>} Comprehensive verification result.
 */
export async function runFullVerification(questionData) {
  const startTime = Date.now();
  const logs = [];

  const log = (type, message) => {
    logs.push({ timestamp: new Date(), type, message });
    console.log(`[Verify] [${type.toUpperCase()}] ${message}`);
  };

  // Step 1: Primary analysis
  log('info', `Analyzing question #${questionData.questionNumber}: ${questionData.questionText.substring(0, 80)}...`);
  let primaryAnswer;
  try {
    primaryAnswer = await analyzeQuestion(questionData);
    log('success', `Primary answer: ${primaryAnswer.answer.join(', ')} (confidence: ${primaryAnswer.confidence}%)`);
  } catch (error) {
    log('error', `Primary analysis failed: ${error.message}`);
    return createFallbackResult(questionData, error, logs, startTime);
  }

  // Step 2: Independent verification
  log('info', 'Running independent verification (elimination method)...');
  let verificationResult;
  try {
    verificationResult = await verifyAnswer(questionData, primaryAnswer);
    if (verificationResult.verified && verificationResult.agreesWithPrimary) {
      log('success', 'Verification CONFIRMED — independent analysis agrees.');
    } else if (!verificationResult.agreesWithPrimary) {
      log('warning', `Verification DISAGREED — verifier suggests: ${verificationResult.verifiedAnswer?.join(', ') || 'unknown'}`);
    } else {
      log('info', `Verification result: ${verificationResult.notes}`);
    }
  } catch (error) {
    log('warning', `Verification step failed: ${error.message}`);
    verificationResult = { verified: false, method: 'elimination', notes: error.message };
  }

  // Step 3: Subject-specific validation
  const subject = questionData.subject || questionData.topic || 'General';
  log('info', `Running subject validation for: ${subject}`);
  let subjectValidation;
  try {
    subjectValidation = await validateBySubject(questionData, primaryAnswer, subject);
    if (subjectValidation.validated) {
      log('success', `Subject validation PASSED for ${subject}.`);
    } else {
      log('warning', `Subject validation flagged issues: ${subjectValidation.notes}`);
    }
  } catch (error) {
    log('warning', `Subject validation failed: ${error.message}`);
    subjectValidation = { validated: false, subject, notes: error.message };
  }

  // Step 4: Check option consistency
  const consistencyCheck = checkOptionConsistency(primaryAnswer, verificationResult);
  if (!consistencyCheck.consistent) {
    log('warning', `Option inconsistency detected: ${consistencyCheck.notes}`);
  }

  // Step 5: Calculate final confidence
  const finalConfidence = calculateFinalConfidence(
    primaryAnswer.confidence,
    verificationResult,
    subjectValidation,
    consistencyCheck
  );

  const isUncertain = finalConfidence < 60;
  if (isUncertain) {
    log('warning', `Low confidence (${finalConfidence}%) — answer marked as UNCERTAIN.`);
  }

  const processingTime = Date.now() - startTime;
  log('info', `Verification pipeline completed in ${processingTime}ms. Final confidence: ${finalConfidence}%`);

  // Determine final answer (prefer primary unless verification strongly disagrees)
  let finalAnswer = primaryAnswer.answer;
  if (
    !verificationResult.agreesWithPrimary &&
    verificationResult.verifiedAnswer?.length > 0 &&
    primaryAnswer.confidence < 70
  ) {
    // If primary confidence is low and verifier disagrees, use verifier's answer
    finalAnswer = verificationResult.verifiedAnswer;
    log('info', 'Using verification answer due to low primary confidence.');
  }

  return {
    answer: finalAnswer,
    explanation: primaryAnswer.explanation,
    optionAnalysis: primaryAnswer.optionAnalysis,
    confidence: finalConfidence,
    verificationResult: {
      verified: verificationResult.verified && verificationResult.agreesWithPrimary,
      method: verificationResult.method || 'elimination',
      notes: verificationResult.notes || '',
    },
    subjectValidation: {
      validated: subjectValidation.validated || false,
      subject: subjectValidation.subject || subject,
      notes: subjectValidation.notes || '',
    },
    isUncertain,
    processingTime,
    logs,
  };
}

/**
 * Check consistency between primary answer and verification answer.
 */
function checkOptionConsistency(primaryAnswer, verificationResult) {
  if (!verificationResult || !verificationResult.verifiedAnswer) {
    return { consistent: true, notes: 'No verification answer to compare.' };
  }

  const primarySet = new Set(primaryAnswer.answer || []);
  const verifiedSet = new Set(verificationResult.verifiedAnswer || []);

  // Check if both answers match
  if (primarySet.size === verifiedSet.size && [...primarySet].every((a) => verifiedSet.has(a))) {
    return { consistent: true, notes: 'Primary and verification answers match.' };
  }

  return {
    consistent: false,
    notes: `Primary answer [${[...primarySet].join(', ')}] differs from verification answer [${[...verifiedSet].join(', ')}].`,
  };
}

/**
 * Calculate final confidence score based on all verification layers.
 */
function calculateFinalConfidence(primaryConfidence, verificationResult, subjectValidation, consistencyCheck) {
  if (primaryConfidence < 50) {
    // If primary confidence is low or question incomplete, keep low
    return Math.min(primaryConfidence, 45);
  }

  let score = primaryConfidence;

  // Verification boost/penalty
  if (verificationResult?.agreesWithPrimary) {
    score = Math.min(score + 10, 98); // Boost for agreement, max 98
  } else if (verificationResult?.verifiedAnswer?.length > 0) {
    score = Math.max(score - 15, 10); // Penalty for disagreement
  }

  // Subject validation boost/penalty
  if (subjectValidation?.validated) {
    score = Math.min(score + 5, 98); // Small boost
  } else if (subjectValidation?.issues?.length > 0) {
    score = Math.max(score - 10, 10); // Penalty for issues
  }

  // Consistency check
  if (!consistencyCheck?.consistent) {
    score = Math.max(score - 10, 10); // Penalty for inconsistency
  }

  return Math.round(Math.min(Math.max(score, 0), 98));
}

/**
 * Create a fallback result when the primary analysis fails.
 */
function createFallbackResult(questionData, error, logs, startTime) {
  return {
    answer: [],
    explanation: `Analysis failed: ${error.message}. Unable to determine the answer.`,
    optionAnalysis: (questionData.options || []).map((o) => ({
      optionId: o.id,
      optionText: o.text,
      isCorrect: false,
      reasoning: 'Unable to analyze due to processing error.',
    })),
    confidence: 0,
    verificationResult: { verified: false, method: 'none', notes: 'Primary analysis failed.' },
    subjectValidation: { validated: false, subject: questionData.subject || 'Unknown', notes: 'Skipped — primary analysis failed.' },
    isUncertain: true,
    processingTime: Date.now() - startTime,
    logs,
  };
}

export default { runFullVerification };
