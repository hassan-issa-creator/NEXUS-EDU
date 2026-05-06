/**
 * Million Dialogue TypeScript Types
 * Type definitions for the multiplayer quiz system
 */

// ========== Database Types ==========

export interface MillionRoom {
  id: string;
  title: string;
  host_id: string;
  status: RoomStatus;
  type: RoomType;
  settings: RoomSettings;
  created_at: Date;
  updated_at: Date;
}

export type RoomStatus = 'waiting' | 'in_progress' | 'finished' | 'cancelled';
export type RoomType = 'public' | 'private';

export interface RoomSettings {
  maxPlayers?: number;
  questionCount?: number;
  timeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface MillionRound {
  id: string;
  room_id: string;
  round_number: number;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
}

export interface MillionQuestion {
  id: number;
  text_ar: string;
  options: string[];
  correct_index: number;
  difficulty: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface MillionRoundQuestion {
  id: string;
  round_id: string;
  question_id: number;
  order_index: number;
  created_at: Date;
}

export interface MillionAnswer {
  id: string;
  round_id: string;
  question_id: number;
  user_id: string;
  chosen_index: number;
  time_taken: number;
  points_awarded: number;
  is_correct: boolean;
  created_at: Date;
}

export interface MillionScore {
  id: string;
  room_id: string;
  user_id: string;
  total_points: number;
  questions_answered: number;
  correct_answers: number;
  created_at: Date;
  updated_at: Date;
}

export interface MillionRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: Date;
  left_at: Date | null;
  is_active: boolean;
}

// ========== API Request/Response Types ==========

export interface CreateRoomRequest {
  title: string;
  type: RoomType;
  settings?: RoomSettings;
}

export interface CreateRoomResponse {
  success: boolean;
  room: MillionRoom;
}

export interface JoinRoomRequest {
  roomId: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room: MillionRoom;
  participants: Player[];
}

export interface SubmitAnswerRequest {
  roomId: string;
  questionId: number;
  chosenIndex: number;
  timeTaken: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect: boolean;
  pointsAwarded: number;
  correctIndex: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  correctAnswers: number;
  questionsAnswered: number;
  rank: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
}

// ========== WebSocket Event Types ==========

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isActive: boolean;
  joinedAt: Date;
}

export interface RoomCreatedEvent {
  roomId: string;
  room: MillionRoom;
}

export interface RoomJoinedEvent {
  roomId: string;
  player: Player;
  participantCount: number;
}

export interface RoundStartedEvent {
  roomId: string;
  roundId: string;
  roundNumber: number;
  questionCount: number;
  startedAt: Date;
}

export interface QuestionSentEvent {
  roomId: string;
  roundId: string;
  question: {
    id: number;
    text_ar: string;
    options: string[];
    // Note: correct_index NOT sent to prevent cheating
  };
  timeLimit: number;
  orderIndex: number;
  totalQuestions: number;
}

export interface AnswerReceivedEvent {
  userId: string;
  acknowledged: boolean;
}

export interface QuestionResultEvent {
  questionId: number;
  correctIndex: number;
  scores: Array<{
    userId: string;
    points: number;
    timeTaken: number;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

export interface LeaderboardUpdatedEvent {
  roomId: string;
  leaderboard: LeaderboardEntry[];
}

export interface RoundFinishedEvent {
  roomId: string;
  roundId: string;
  roundNumber: number;
  finalLeaderboard: LeaderboardEntry[];
  winner: LeaderboardEntry;
  finishedAt: Date;
}

export interface RoomLeftEvent {
  roomId: string;
  playerId: string;
  participantCount: number;
}

export interface ErrorEvent {
  code: string;
  message: string;
  details?: any;
}

// WebSocket Client → Server Events

export interface CreateRoomData {
  title: string;
  type: RoomType;
  settings?: RoomSettings;
}

export interface JoinRoomData {
  roomId: string;
}

export interface StartRoundData {
  roomId: string;
}

export interface SubmitAnswerData {
  roomId: string;
  roundId: string;
  questionId: number;
  chosenIndex: number;
  timeTaken: number;
}

// ========== Sidebar Types ==========

export interface Assignment {
  id: string;
  student_id: string;
  teacher_id?: string;
  class_id?: string;
  title: string;
  description?: string;
  content?: string;
  due_date: Date;
  status: AssignmentStatus;
  submission_date?: Date;
  grade?: number;
  max_grade?: number;
  feedback?: string;
  attachments?: Attachment[];
  created_at: Date;
  updated_at: Date;
}

export type AssignmentStatus =
  | 'pending'
  | 'submitted'
  | 'graded'
  | 'late'
  | 'missing';

export interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Grade {
  id: string;
  student_id: string;
  class_id?: string;
  subject: string;
  assignment_id?: string;
  score: number;
  max_score: number;
  percentage: number;
  grade_letter?: string;
  exam_type?: string;
  date: Date;
  teacher_id?: string;
  comments?: string;
  created_at: Date;
}

export interface GradeSummary {
  gpa: number;
  overallPercentage: number;
  totalGrades: number;
  averageScore: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id?: string;
  date: Date;
  status: AttendanceStatus;
  check_in_time?: Date;
  check_out_time?: Date;
  notes?: string;
  marked_by?: string;
  created_at: Date;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSummary {
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  read_at?: Date;
  action_url?: string;
  metadata?: any;
  expires_at?: Date;
  created_at: Date;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'assignment'
  | 'grade'
  | 'attendance'
  | 'announcement';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  timezone: string;
  preferences: any;
  created_at: Date;
  updated_at: Date;
}

// ========== API Response Wrappers ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== Error Types ==========

export class MillionError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = 'MillionError';
  }
}

export const ErrorCodes = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  ALREADY_IN_ROOM: 'ALREADY_IN_ROOM',
  NOT_HOST: 'NOT_HOST',
  ROUND_NOT_ACTIVE: 'ROUND_NOT_ACTIVE',
  INVALID_ANSWER: 'INVALID_ANSWER',
  DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',
  TIMEOUT_EXCEEDED: 'TIMEOUT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
