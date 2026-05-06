/**
 * Games System Types
 * Type definitions for educational games
 */

export type GameType =
  | 'quiz'
  | 'memory_match'
  | 'word_puzzle'
  | 'drag_drop'
  | 'flashcards'
  | 'trivia';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameSessionStatus = 'in_progress' | 'completed' | 'abandoned';

// ==================== GAME TYPES ====================

export interface GameSettings {
  timeLimit?: number;
  maxAttempts?: number;
  showHints?: boolean;
  randomizeQuestions?: boolean;
  passingScore?: number;
}

export interface Game {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  gameType: GameType;
  difficulty: GameDifficulty;
  subjectId?: string;
  classId?: string;
  category?: string;
  tags: string[];
  settings: GameSettings;
  thumbnailUrl?: string;
  icon?: string;
  color: string;
  totalQuestions: number;
  maxScore: number;
  avgCompletionTime?: number;
  isPublished: boolean;
  isFeatured: boolean;
  playsCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameQuestion {
  id: string;
  gameId: string;
  questionText: string;
  questionType: string;
  options?: any; // JSONB
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  points: number;
  timeLimitSeconds?: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  status: GameSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  score: number;
  maxScore: number;
  percentage: number;
  questionsAttempted: number;
  questionsCorrect: number;
  questionsTotal: number;
  currentStreak: number;
  maxStreak: number;
  bonusPoints: number;
  avgResponseTime?: number;
  accuracyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  userAnswer?: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
  answeredAt: Date;
  pointsEarned: number;
  hintsUsed: number;
  createdAt: Date;
}

export interface GameAchievement {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
  color: string;
  criteria: any; // JSONB
  points: number;
  badgeUrl?: string;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  gameSessionId?: string;
  createdAt: Date;
  achievement?: GameAchievement;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  bestScore: number;
  bestTimeSeconds?: number;
  totalPlays: number;
  lastPlayedAt: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateGameRequest {
  title: string;
  titleAr?: string;
  description?: string;
  gameType: GameType;
  difficulty?: GameDifficulty;
  subjectId?: string;
  classId?: string;
  category?: string;
  tags?: string[];
  settings?: GameSettings;
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface CreateGameQuestionRequest {
  questionText: string;
  questionType?: string;
  options?: any;
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
  points?: number;
  timeLimitSeconds?: number;
  orderIndex?: number;
}

export interface StartGameResponse {
  session: GameSession;
  questions: GameQuestion[];
  timeLimit?: number;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  timeTakenSeconds?: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer?: string;
  explanation?: string;
  currentScore: number;
  currentStreak: number;
}

export interface FinishGameResponse {
  session: GameSession;
  achievements?: UserAchievement[];
  rank?: number;
}

// ==================== ERROR TYPES ====================

export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export const GameErrorCodes = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  ALREADY_COMPLETED: 'ALREADY_COMPLETED',
  INVALID_ANSWER: 'INVALID_ANSWER',
  TIME_EXPIRED: 'TIME_EXPIRED',
} as const;
