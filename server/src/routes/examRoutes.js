import express from 'express';
import {
  getExams,
  getExam,
  createExam,
  deleteExam,
  seedExam,
} from '../controllers/examController.js';

const router = express.Router();

router.route('/')
  .get(getExams)
  .post(createExam);

router.post('/seed', seedExam);

router.route('/:id')
  .get(getExam)
  .delete(deleteExam);

export default router;
