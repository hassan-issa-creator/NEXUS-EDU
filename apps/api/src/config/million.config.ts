/**
 * Million Dialogue Configuration
 * Global settings for the multiplayer quiz system
 */

export const millionConfig = {
  // Game Settings
  game: {
    /**
     * Default number of questions per round
     * Can be overridden per room
     */
    questionCountDefault: 10,

    /**
     * Time limit per question in seconds
     */
    timeLimitDefault: 15,

    /**
     * Maximum number of players per room
     */
    maxPlayers: 10,

    /**
     * Delay between rounds in milliseconds
     */
    roundDelay: 3000,

    /**
     * Delay between questions in milliseconds
     */
    questionDelay: 2000,
  },

  // Scoring Formula
  scoring: {
    /**
     * Base points multiplier per difficulty level
     * Formula: difficulty * baseMultiplier = base points
     */
    difficultyMultiplier: 100,

    /**
     * Time bonus points per second saved
     * Formula: (timeLimit - timeTaken) * timeMultiplier = time bonus
     */
    timeMultiplier: 5,

    /**
     * Minimum points awarded (even for wrong answer)
     */
    minimumPoints: 0,

    /**
     * Maximum time bonus (prevents gaming the system)
     */
    maxTimeBonus: 200,

    /**
     * Bonus for first correct answer in the room
     */
    firstAnswerBonus: 50,

    /**
     * Streak bonus (consecutive correct answers)
     */
    streakBonus: {
      enabled: true,
      perStreak: 25, // Extra points per consecutive correct answer
      maxStreak: 10, // Maximum streak bonus cap
    },
  },

  // Question Selection
  questions: {
    /**
     * Difficulty distribution for 'mixed' mode
     */
    mixedDifficultyDistribution: {
      easy: 0.3, // 30% easy
      medium: 0.5, // 50% medium
      hard: 0.2, // 20% hard
    },

    /**
     * Minimum difficulty level
     */
    minDifficulty: 1,

    /**
     * Maximum difficulty level
     */
    maxDifficulty: 5,

    /**
     * Allow repeated questions in same room
     */
    allowRepeats: false,
  },

  // Room Settings
  room: {
    /**
     * Auto-close room after inactivity (minutes)
     */
    autoCloseAfter: 30,

    /**
     * Minimum players to start a round
     */
    minPlayers: 1,

    /**
     * Auto-start round when room is full
     */
    autoStartWhenFull: false,

    /**
     * Allow spectators in private rooms
     */
    allowSpectators: true,
  },

  // WebSocket Settings
  websocket: {
    /**
     * Socket.IO path
     */
    path: '/socket.io',

    /**
     * Connection timeout (ms)
     */
    timeout: 10000,

    /**
     * Ping interval (ms)
     */
    pingInterval: 25000,

    /**
     * Ping timeout (ms)
     */
    pingTimeout: 60000,

    /**
     * Max event listeners per socket
     */
    maxListeners: 20,
  },

  // Anti-Cheat Settings
  antiCheat: {
    /**
     * Prevent answer submissions after time limit
     */
    enforceTimeLimit: true,

    /**
     * Allow tolerance in milliseconds for network lag
     */
    timeTolerance: 1000,

    /**
     * Detect multiple submissions
     */
    preventDuplicateSubmissions: true,

    /**
     * Maximum allowed submissions per question
     */
    maxSubmissionsPerQuestion: 1,

    /**
     * Flag suspicious activity (too fast answers)
     */
    minimumAnswerTime: 500, // Must take at least 0.5s to answer

    /**
     * IP-based rate limiting
     */
    ipRateLimiting: true,
  },

  // Leaderboard Settings
  leaderboard: {
    /**
     * Number of top players to display
     */
    topPlayersCount: 10,

    /**
     * Update frequency (ms)
     */
    updateInterval: 1000,

    /**
     * Include player statistics
     */
    includeStats: true,
  },

  // Rewards & Achievements
  rewards: {
    /**
     * Enable rewards system
     */
    enabled: false,

    /**
     * Points thresholds for badges
     */
    badges: {
      bronze: 1000,
      silver: 5000,
      gold: 10000,
      platinum: 50000,
    },
  },
};

// Helper functions

/**
 * Calculate points for an answer
 */
export function calculatePoints(
  difficulty: number,
  timeTaken: number,
  timeLimit: number,
  isCorrect: boolean,
  isFirstCorrect: boolean = false,
  currentStreak: number = 0,
): number {
  if (!isCorrect) {
    return millionConfig.scoring.minimumPoints;
  }

  // Base points
  const basePoints = difficulty * millionConfig.scoring.difficultyMultiplier;

  // Time bonus
  const timeSaved = Math.max(0, timeLimit - timeTaken);
  let timeBonus = Math.floor(timeSaved * millionConfig.scoring.timeMultiplier);
  timeBonus = Math.min(timeBonus, millionConfig.scoring.maxTimeBonus);

  // First answer bonus
  const firstBonus = isFirstCorrect
    ? millionConfig.scoring.firstAnswerBonus
    : 0;

  // Streak bonus
  let streakBonus = 0;
  if (millionConfig.scoring.streakBonus.enabled && currentStreak > 0) {
    const effectiveStreak = Math.min(
      currentStreak,
      millionConfig.scoring.streakBonus.maxStreak,
    );
    streakBonus = effectiveStreak * millionConfig.scoring.streakBonus.perStreak;
  }

  return basePoints + timeBonus + firstBonus + streakBonus;
}

/**
 * Validate room settings
 */
export function validateRoomSettings(settings: any): boolean {
  if (
    settings.maxPlayers &&
    (settings.maxPlayers < 1 ||
      settings.maxPlayers > millionConfig.game.maxPlayers)
  ) {
    return false;
  }

  if (
    settings.questionCount &&
    (settings.questionCount < 1 || settings.questionCount > 50)
  ) {
    return false;
  }

  if (
    settings.timeLimit &&
    (settings.timeLimit < 5 || settings.timeLimit > 120)
  ) {
    return false;
  }

  return true;
}

/**
 * Get difficulty distribution for mixed mode
 */
export function getMixedDifficultyDistribution(totalQuestions: number) {
  const dist = millionConfig.questions.mixedDifficultyDistribution;

  return {
    easy: Math.floor(totalQuestions * dist.easy),
    medium: Math.floor(totalQuestions * dist.medium),
    hard: Math.floor(totalQuestions * dist.hard),
  };
}

export default millionConfig;
