import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  keyPrefix: string;
}

export default registerAs(
  'redis',
  (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    keyPrefix: 'million:',
  }),
);

// Cache TTL configurations for different data types
export const CacheTTL = {
  // Short-lived data (1 minute)
  SHORT: 60,

  // Medium-lived data (5 minutes)
  MEDIUM: 300,

  // Long-lived data (30 minutes)
  LONG: 1800,

  // Static data (1 hour)
  STATIC: 3600,

  // Session data (24 hours)
  SESSION: 86400,
} as const;

// Cache keys for different entities
export const CacheKeys = {
  // User related
  USER: (id: string) => `user:${id}`,
  USER_PROFILE: (id: string) => `user:profile:${id}`,

  // Class related
  CLASS: (id: string) => `class:${id}`,
  CLASS_STUDENTS: (classId: string) => `class:students:${classId}`,

  // Conversation related
  CONVERSATION: (id: string) => `conversation:${id}`,
  USER_CONVERSATIONS: (userId: string) => `user:conversations:${userId}`,

  // Messages
  MESSAGES: (conversationId: string, page: number) =>
    `messages:${conversationId}:page:${page}`,

  // Analytics
  DASHBOARD_STATS: (userId: string) => `analytics:dashboard:${userId}`,
  LEADERBOARD: (type: string) => `leaderboard:${type}`,

  // Million Profile
  MILLION_PROFILE: (userId: string) => `million:profile:${userId}`,
  MILLION_LEADERBOARD: () => `million:leaderboard`,

  // Attendance
  ATTENDANCE: (classId: string, date: string) =>
    `attendance:${classId}:${date}`,

  // Assignments
  ASSIGNMENT: (id: string) => `assignment:${id}`,
  CLASS_ASSIGNMENTS: (classId: string) => `class:assignments:${classId}`,
} as const;
