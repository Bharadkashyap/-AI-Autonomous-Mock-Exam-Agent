import express from 'express';
import { analyze, ocr, verify, getStatus } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', analyze);
router.post('/ocr', ocr);
router.post('/verify', verify);
router.get('/status', getStatus);

export default router;
