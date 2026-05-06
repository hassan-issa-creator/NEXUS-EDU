/**
 * Million Achiever Program - TypeScript Type Definitions
 * Complete type system for scoring, levels, badges, and leaderboards
 */

// =====================================================
// ENUMS
// =====================================================

export enum LevelName {
  BEGINNER = 'Beginner',
  ACTIVE_LEARNER = 'Active Learner',
  CONSISTENT_PERFORMER = 'Consistent Performer',
  ACHIEVER = 'Achiever',
  ELITE_STUDENT = 'Elite Student',
  TOP_1_PERCENT = 'Top 1% Performer',
  MILLION_FINALIST = 'Million Finalist',
}

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum FlagSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FlagStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INVESTIGATING = 'investigating',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  LEVEL_UP = 'level_up',
  BADGE_EARNED = 'badge_earned',
  POSITION_CHANGE = 'position_change',
  WEEKLY_SUMMARY = 'weekly_summary',
  MILESTONE = 'milestone',
  ENCOURAGEMENT = 'encouragement',
}

export enum FinalistTier {
  TOP50 = 'top50',
  TOP10 = 'top10',
  WINNER = 'winner',
}

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ScoringCategory {
  ATTENDANCE = 'attendance',
  BEHAVIOR = 'behavior',
  ASSIGNMENTS = 'assignments',
  EXAMS = 'exams',
  PARTICIPATION = 'participation',
  PROJECTS = 'projects',
  CONSISTENCY = 'consistency',
  CONTENT_PROGRESS = 'content_progress',
  EXTRA_ACTIVITIES = 'extra_activities',
}

// =====================================================
// CORE INTERFACES
// =====================================================

export interface MillionProfile {
  id: string;
  studentId: string;

  // Points
  totalPoints: number;
  currentLevel: LevelName;
  levelNumber: number;
  pointsToNextLevel: number;

  // Rankings
  classRank?: number;
  gradeRank?: number;
  schoolRank?: number;

  // Metrics
  progressIndex: number; // 0-100
  consistencyIndex: number; // 0-1
  winningProbability: number; // 0-100
  improvementRate: number; // percentage

  // Streaks
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate?: Date;

  // Status
  isFinalist: boolean;
  isActive: boolean;
  isFrozen: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface MillionScore {
  id: string;
  profileId: string;
  studentId: string;

  // Category Scores (0-100)
  attendanceScore: number;
  behaviorScore: number;
  assignmentsScore: number;
  examsScore: number;
  participationScore: number;
  projectsScore: number;
  consistencyScore: number;
  contentProgressScore: number;
  extraActivitiesScore: number;

  // Weighted Points
  attendancePoints: number;
  behaviorPoints: number;
  assignmentsPoints: number;
  examsPoints: number;
  participationPoints: number;
  projectsPoints: number;
  consistencyPoints: number;
  contentProgressPoints: number;
  extraActivitiesPoints: number;

  // Period
  periodType: PeriodType;
  periodStartDate: Date;
  periodEndDate?: Date;

  // Timestamps
  calculatedAt: Date;
  updatedAt: Date;
}

export interface MillionLevel {
  id: string;
  levelNumber: number;
  levelName: LevelName;

  // Requirements
  minPoints: number;
  maxPoints?: number;
  minConsistencyIndex: number;
  minBehaviorScore: number;
  minAttendancePercentage: number;

  // Rewards
  xpBoostMultiplier: number;
  specialBadge?: string;
  unlockFeatures?: string[];

  // UI
  colorHex: string;
  iconName: string;
  description: string;
  congratulationsMessage: string;

  // Meta
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MillionBadge {
  id: string;
  badgeCode: string;
  badgeName: string;
  badgeNameAr: string;

  // Criteria
  criteria: BadgeCriteria;

  // Visual
  iconUrl?: string;
  colorHex: string;
  rarity: BadgeRarity;

  // Reward
  pointsReward: number;

  // Status
  isActive: boolean;
  isAutoAward: boolean;

  // Description
  description: string;
  descriptionAr: string;

  // Meta
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeAward {
  id: string;
  profileId: string;
  studentId: string;
  badgeId: string;

  // Award
  awardedAt: Date;
  progressPercentage: number;

  // Evidence
  criteriaMet: Record<string, any>;
  evidenceData: Record<string, any>;

  // Status
  isClaimed: boolean;
  claimedAt?: Date;
}

export interface HistoryLog {
  id: string;
  profileId: string;
  studentId: string;

  // Change
  actionType: string;
  category?: ScoringCategory;

  // Values
  pointsBefore?: number;
  pointsAfter?: number;
  pointsChange?: number;

  // Context
  reason: string;
  metadata?: Record<string, any>;

  // Source
  triggeredBy: 'system' | 'admin' | 'student';
  adminId?: string;

  // Time
  createdAt: Date;
}

export interface LeaderboardCache {
  id: string;
  scopeType: 'class' | 'grade' | 'school' | 'top50';
  scopeId?: string;

  // Rankings
  rankings: LeaderboardEntry[];

  // Meta
  totalParticipants: number;
  lastUpdated: Date;
  isStale: boolean;

  // Filters
  gender?: string;
  section?: string;
}

export interface LeaderboardEntry {
  studentId: string;
  rank: number;
  totalPoints: number;
  level: LevelName;
  levelNumber: number;
  studentName: string;
  avatar?: string;
  badges: number;
  consistencyIndex: number;
  improvementRate: number;
}

export interface MillionFinalist {
  id: string;
  profileId: string;
  studentId: string;

  // Tier
  tier: FinalistTier;
  rank: number;

  // Qualification Scores
  totalPoints: number;
  consistencyIndex: number;
  behaviorScore: number;
  improvementRate: number;
  teacherEvaluationScore?: number;
  leadershipScore?: number;

  // Final Score
  finalWeightedScore: number;

  // Selection
  selectionCriteria: Record<string, any>;
  qualifiedAt: Date;

  // Admin Review
  adminApproved: boolean;
  adminApprovedBy?: string;
  adminApprovedAt?: Date;
  adminNotes?: string;

  // Snapshot
  profileSnapshot: Record<string, any>;

  // Meta
  createdAt: Date;
  updatedAt: Date;
}

export interface MillionFlag {
  id: string;
  profileId: string;
  studentId: string;

  // Flag
  flagType: string;
  severity: FlagSeverity;

  // Detection
  detectedValue: Record<string, any>;
  expectedRange: Record<string, any>;
  deviationPercentage: number;

  // Evidence
  evidence: Record<string, any>;
  detectionAlgorithm: string;

  // Status
  status: FlagStatus;

  // Review
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  actionTaken?: string;

  // Impact
  pointsAffected: number;
  isResolved: boolean;

  // Meta
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSettings {
  id: string;
  settingKey: string;
  settingValue: Record<string, any>;
  settingType: 'weights' | 'thresholds' | 'rules' | 'dates';

  // Meta
  description: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MillionNotification {
  id: string;
  studentId: string;
  profileId?: string;

  // Content
  notificationType: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;

  // Template
  templateCode?: string;
  templateVariables?: Record<string, any>;

  // Priority
  priority: NotificationPriority;

  // Status
  isRead: boolean;
  readAt?: Date;
  isSent: boolean;
  sentAt?: Date;

  // Channels
  sentViaApp: boolean;
  sentViaEmail: boolean;
  sentViaPush: boolean;

  // Meta
  createdAt: Date;
  expiresAt?: Date;
}

// =====================================================
// CRITERIA TYPES
// =====================================================

export interface BadgeCriteria {
  type:
    | 'streak'
    | 'average_grade'
    | 'creative_projects'
    | 'lesson_speed'
    | 'help_peers'
    | 'weekly_challenge'
    | 'grade_rank'
    | 'attendance';
  threshold?: number;
  count?: number;
  multiplier?: number;
  days?: number;
  percentage?: number;
  period?: string;
  comparison?: '>' | '<' | '>=' | '<=' | '=';
}

// =====================================================
// DTO TYPES (Data Transfer Objects)
// =====================================================

export interface CalculateScoreDto {
  studentId: string;
  categories?: Partial<Record<ScoringCategory, number>>;
  periodType?: PeriodType;
  periodStartDate?: Date;
}

export interface UpdateWeightsDto {
  weights: Record<ScoringCategory, number>;
}

export interface CreateNotificationDto {
  studentId: string;
  notificationType: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  priority?: NotificationPriority;
  templateVariables?: Record<string, any>;
}

export interface ReviewFlagDto {
  flagId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string;
  actionTaken?: string;
  pointsAdjustment?: number;
}

export interface CalculateFinalistsDto {
  tier: FinalistTier;
  count?: number;
  forceRecalculate?: boolean;
}

export interface AwardBadgeDto {
  studentId: string;
  badgeCode: string;
  manualAward?: boolean;
  evidenceData?: Record<string, any>;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface ScoreCalculationResult {
  profile: MillionProfile;
  score: MillionScore;
  levelChanged: boolean;
  previousLevel?: LevelName;
  newBadges: BadgeAward[];
  pointsAdded: number;
  breakdown: Record<
    ScoringCategory,
    {
      score: number;
      points: number;
      weight: number;
    }
  >;
}

export interface LeaderboardResponse {
  scopeType: string;
  scopeId?: string;
  rankings: LeaderboardEntry[];
  totalParticipants: number;
  currentPage: number;
  totalPages: number;
  lastUpdated: Date;
  userPosition?: {
    rank: number;
    student: LeaderboardEntry;
  };
}

export interface StudentJourneyData {
  profile: MillionProfile;
  currentScore: MillionScore;
  level: MillionLevel;
  badges: (BadgeAward & { badge: MillionBadge })[];
  positions: {
    classRank: number;
    gradeRank: number;
    schoolRank: number;
  };
  goals: {
    weekly: {
      target: number;
      current: number;
      percentage: number;
    };
    monthly: {
      target: number;
      current: number;
      percentage: number;
    };
  };
  comparison: {
    lastWeek: number;
    lastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
  nextBadges: {
    badge: MillionBadge;
    progress: number;
  }[];
}

export interface FinalistProfile {
  finalist: MillionFinalist;
  student: {
    id: string;
    name: string;
    avatar?: string;
    grade: string;
    section: string;
  };
  profile: MillionProfile;
  analytics: {
    categoryBreakdown: Record<ScoringCategory, number>;
    monthlyProgress: Array<{ month: string; points: number }>;
    badgesEarned: number;
    streakRecord: number;
  };
}

export interface AntiCheatReport {
  totalFlags: number;
  flagsBySeverity: Record<FlagSeverity, number>;
  flagsByType: Record<string, number>;
  pendingReviews: number;
  recentFlags: MillionFlag[];
  riskStudents: Array<{
    studentId: string;
    studentName: string;
    flagCount: number;
    highestSeverity: FlagSeverity;
  }>;
}

// =====================================================
// WEBSOCKET EVENTS
// =====================================================

export interface WebSocketEvents {
  'million:leaderboard:updated': LeaderboardResponse;
  'million:position:changed': {
    studentId: string;
    oldRank: number;
    newRank: number;
    scope: string;
  };
  'million:level:up': {
    studentId: string;
    newLevel: LevelName;
    levelNumber: number;
  };
  'million:badge:earned': {
    studentId: string;
    badge: MillionBadge;
  };
  'million:notification:new': MillionNotification;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type ScoringWeights = Record<ScoringCategory, number>;

export type CategoryScores = Record<ScoringCategory, number>;

export type CategoryPoints = Record<ScoringCategory, number>;

export interface ScoringConfig {
  weights: ScoringWeights;
  maxPoints: Record<ScoringCategory, number>;
  thresholds: Record<string, number>;
}

export interface CompetitionConfig {
  startDate: Date;
  endDate: Date;
  finalistAnnouncementDate: Date;
  isActive: boolean;
  currentPhase: 'registration' | 'active' | 'finalist_selection' | 'completed';
}

export interface AntiCheatConfig {
  scoreJump24h: number;
  scoreJump7d: number;
  deviationStdev: number;
  attendancePatternSimilarity: number;
  enableAutoFreeze: boolean;
  enableAutoFlag: boolean;
}
