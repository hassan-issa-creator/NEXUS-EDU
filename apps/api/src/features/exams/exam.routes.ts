import { Router } from 'express';
import { examController } from './exam.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// ==================== VALIDATION SCHEMAS ====================

const createExamSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  instructions: z.string().optional(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  examType: z.enum(['quiz', 'midterm', 'final', 'assignment', 'practice']),
  durationMinutes: z.number().int().min(1).max(480), // Max 8 hours
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  totalPoints: z.number().min(0),
  passingScore: z.number().min(0).optional(),
  settings: z
    .object({
      randomizeQuestions: z.boolean().optional(),
      randomizeOptions: z.boolean().optional(),
      showResults: z.boolean().optional(),
      showCorrectAnswers: z.boolean().optional(),
      allowReview: z.boolean().optional(),
      requireFullScreen: z.boolean().optional(),
      preventTabSwitch: z.boolean().optional(),
      maxAttempts: z.number().int().min(1).optional(),
      showTimer: z.boolean().optional(),
      autoSubmit: z.boolean().optional(),
    })
    .optional(),
});

const updateExamSchema = createExamSchema.partial();

const addQuestionSchema = z.object({
  questionText: z.string().min(3),
  questionType: z.enum([
    'multiple_choice',
    'true_false',
    'short_answer',
    'essay',
    'fill_blank',
  ]),
  options: z
    .array(
      z.object({
        text: z.string(),
        isCorrect: z.boolean(),
      }),
    )
    .optional(),
  correctAnswer: z.string().optional(),
  points: z.number().min(0),
  explanation: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
  orderIndex: z.number().int().min(0),
});

const submitAnswerSchema = z.object({
  submissionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerValue: z.string().optional(),
  selectedOptionIndex: z.number().int().min(0).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

const finishExamSchema = z.object({
  submissionId: z.string().uuid(),
});

// ==================== ROUTES ====================

// Exam Management (Teacher)
router.post(
  '/',
  authenticateToken,
  validateRequest(createExamSchema),
  examController.createExam.bind(examController),
);

router.get(
  '/',
  authenticateToken,
  examController.listExams.bind(examController),
);

router.get(
  '/:id',
  authenticateToken,
  examController.getExam.bind(examController),
);

router.put(
  '/:id',
  authenticateToken,
  validateRequest(updateExamSchema),
  examController.updateExam.bind(examController),
);

router.delete(
  '/:id',
  authenticateToken,
  examController.deleteExam.bind(examController),
);

// Questions
router.post(
  '/:id/questions',
  authenticateToken,
  validateRequest(addQuestionSchema),
  examController.addQuestion.bind(examController),
);

router.get(
  '/:id/questions',
  authenticateToken,
  examController.getQuestions.bind(examController),
);

// Student Exam Flow
router.post(
  '/:id/start',
  authenticateToken,
  examController.startExam.bind(examController),
);

router.post(
  '/:id/submit-answer',
  authenticateToken,
  validateRequest(submitAnswerSchema),
  examController.submitAnswer.bind(examController),
);

router.post(
  '/:id/finish',
  authenticateToken,
  validateRequest(finishExamSchema),
  examController.finishExam.bind(examController),
);

router.get(
  '/:id/results',
  authenticateToken,
  examController.getResults.bind(examController),
);

// Statistics (Teacher)
router.get(
  '/:id/stats',
  authenticateToken,
  examController.getStats.bind(examController),
);

export default router;
