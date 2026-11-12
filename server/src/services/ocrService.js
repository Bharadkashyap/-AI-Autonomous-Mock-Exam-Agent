/**
 * OCR Service — Extract text from question images using Tesseract.js
 */
import { createWorker } from 'tesseract.js';

/**
 * Process an image (base64 or URL) and extract text.
 * @param {string} imageSource - Base64 string (with or without data URI prefix) or a URL.
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function processImage(imageSource) {
  let worker;
  try {
    worker = await createWorker('eng');

    // Determine source format
    let source = imageSource;
    if (
      !imageSource.startsWith('http') &&
      !imageSource.startsWith('data:')
    ) {
      // Assume raw base64 — add data URI prefix
      source = `data:image/png;base64,${imageSource}`;
    }

    const { data } = await worker.recognize(source);
    const cleanedText = cleanOCROutput(data.text);

    return {
      text: cleanedText,
      confidence: Math.round(data.confidence),
      rawText: data.text,
    };
  } catch (error) {
    console.error(`[OCR] Error processing image: ${error.message}`);
    throw new Error(`OCR processing failed: ${error.message}`);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Clean up OCR output — remove artifacts, fix spacing, preserve math formatting.
 * @param {string} rawText - Raw OCR output text.
 * @returns {string} Cleaned text.
 */
function cleanOCROutput(rawText) {
  if (!rawText) return '';

  let text = rawText;

  // Remove common OCR artifacts
  text = text.replace(/[|]/g, 'I'); // Vertical bars often misread
  text = text.replace(/\s{3,}/g, '  '); // Collapse excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n'); // Collapse excessive newlines

  // Fix common OCR misreads
  text = text.replace(/\bl\b(?=[A-Z])/g, '1'); // lone 'l' before caps → '1'
  text = text.replace(/\bO\b(?=\d)/g, '0'); // 'O' before digit → '0'

  // Preserve mathematical expressions
  // Keep operators: +, -, *, /, =, <, >, ^
  // Keep parentheses and brackets

  // Remove leading/trailing whitespace from each line
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return text;
}

export default { processImage };
