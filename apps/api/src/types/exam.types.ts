/**
 * Exam System Types
 * Type definitions for the exam management system
 */

export type ExamType = 'quiz' | 'midterm' | 'final' | 'assignment' | 'practice';
export type ExamStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'closed'
  | 'archived';
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'fill_blank';
export type ExamSubmissionStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'graded'
  | 'late';

// ==================== EXAM TYPES ====================

export interface ExamSettings {
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
  requireFullScreen?: boolean;
  preventTabSwitch?: boolean;
  maxAttempts?: number;
  showTimer?: boolean;
  autoSubmit?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  subjectId: string;
  classId: string;
  createdBy: string;
  examType: ExamType;
  status: ExamStatus;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
  totalPoints: number;
  passingScore?: number;
  settings: ExamSettings;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== QUESTION TYPES ====================

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[]; // For MCQ/TF
  correctAnswer?: string; // For short answer/essay
  points: number;
  explanation?: string;
  attachmentUrls?: string[];
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SUBMISSION TYPES ====================

export interface SuspiciousActivity {
  type: string;
  timestamp: Date;
  details?: any;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  startedAt: Date;
  submittedAt?: Date;
  timeTakenMinutes?: number;
  status: ExamSubmissionStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeLetter?: string;
  overallFeedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  tabSwitches: number;
  copyAttempts: number;
  pasteAttempts: number;
  fullscreenExits: number;
  suspiciousActivity: SuspiciousActivity[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== ANSWER TYPES ====================

export interface ExamAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answerValue?: string;
  selectedOptionIndex?: number; // For MCQ
  isCorrect?: boolean;
  pointsAwarded: number;
  feedback?: string;
  answeredAt: Date;
  timeSpentSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface CreateExamRequest {
  title: string;
  description?: string;
  instructions?: string;
  subjectId: string;
  classId: string;
  examType: ExamType;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
  totalPoints: number;
  passingScore?: number;
  settings?: ExamSettings;
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {
  status?: ExamStatus;
  isPublished?: boolean;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
  attachmentUrls?: string[];
  orderIndex: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answerValue?: string;
  selectedOptionIndex?: number;
  timeSpentSeconds?: number;
}

export interface GradeAnswerRequest {
  answerId: string;
  pointsAwarded: number;
  feedback?: string;
}

export interface StartExamResponse {
  submission: ExamSubmission;
  questions: ExamQuestion[]; // Without correct answers
  timeRemaining: number;
}

export interface ExamResultsResponse {
  submission: ExamSubmission;
  answers: ExamAnswer[];
  questions: ExamQuestion[];
  canViewCorrectAnswers: boolean;
}

export interface ExamStatsResponse {
  exam: Exam;
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  submissionsByStatus: Record<ExamSubmissionStatus, number>;
}

// ==================== ERROR TYPES ====================

export class ExamError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ExamError';
  }
}

export const ExamErrorCodes = {
  EXAM_NOT_FOUND: 'EXAM_NOT_FOUND',
  EXAM_NOT_PUBLISHED: 'EXAM_NOT_PUBLISHED',
  EXAM_NOT_STARTED: 'EXAM_NOT_STARTED',
  EXAM_ENDED: 'EXAM_ENDED',
  ALREADY_SUBMITTED: 'ALREADY_SUBMITTED',
  NOT_ENROLLED: 'NOT_ENROLLED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_ANSWER: 'INVALID_ANSWER',
  TIME_EXPIRED: 'TIME_EXPIRED',
} as const;
