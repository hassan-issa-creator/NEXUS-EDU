import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  requirement: string;
  points: number;
}

const BADGES: Badge[] = [
  {
    id: 'first_quiz',
    name: 'First Steps',
    nameAr: 'الخطوات الأولى',
    description: 'Complete your first quiz',
    descriptionAr: 'أكمل أول اختبار',
    icon: '🎯',
    requirement: 'quiz_count >= 1',
    points: 10,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    nameAr: 'العلامة الكاملة',
    description: 'Get 100% on any quiz',
    descriptionAr: 'احصل على 100% في أي اختبار',
    icon: '💯',
    requirement: 'perfect_score_count >= 1',
    points: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    nameAr: 'محارب الأسبوع',
    description: 'Login 7 days in a row',
    descriptionAr: 'سجل دخول 7 أيام متتالية',
    icon: '🔥',
    requirement: 'streak >= 7',
    points: 30,
  },
  {
    id: 'top_10',
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    description: 'Reach top 10 on leaderboard',
    descriptionAr: 'وصول لأفضل 10 في لوحة الشرف',
    icon: '⭐',
    requirement: 'rank <= 10',
    points: 100,
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    nameAr: 'سيد الاختبارات',
    description: 'Complete 50 quizzes',
    descriptionAr: 'أكمل 50 اختبار',
    icon: '🏆',
    requirement: 'quiz_count >= 50',
    points: 200,
  },
];

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Get available badges
   */
  getBadges(): Badge[] {
    return BADGES;
  }

  /**
   * Get leaderboard (top N students by points)
   */
  async getLeaderboard(
    limit: number = 10,
    _classId?: string,
  ): Promise<LeaderboardEntry[]> {
    try {
      // In a real implementation with _classId, we would filter by enrollments
      const profiles = await this.prisma.millionProfile.findMany({
        orderBy: { totalPoints: 'desc' },
        take: limit,
        include: {
          user: {
            select: { name: true, avatar: true },
          },
        },
      });

      // Fetch badges for these users
      const userIds = profiles.map(p => p.userId);
      const userAchievements = await this.prisma.userAchievement.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
        include: {
          achievement: {
            select: {
              key: true,
            },
          },
        },
      });

      return profiles.map((p, index) => {
        const badges = userAchievements
          .filter((ub: any) => ub.userId === p.userId)
          .map((ub: any) => ub.achievement.key);

        return {
          rank: index + 1,
          userId: p.userId,
          name: p.user.name || 'طالب', // Fallback for null name
          avatar: p.user.avatar || undefined,
          points: p.totalPoints,
          badges,
        };
      });
    } catch (error) {
      this.logger.error('Failed to get leaderboard', error);
      throw error;
    }
  }

  /**
   * Get user's rank and points
   */
  async getUserRank(
    userId: string,
  ): Promise<{ rank: number; points: number; badges: Badge[] }> {
    const profile = await this.prisma.millionProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { rank: 0, points: 0, badges: [] };
    }

    const rank = await this.prisma.millionProfile.count({
      where: { totalPoints: { gt: profile.totalPoints } },
    }) + 1;

    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            key: true,
          },
        },
      },
    });

    const earnedBadges = BADGES.filter(b =>
      userAchievements.some((ua: any) => ua.achievement.key === b.id)
    );

    return {
      rank,
      points: profile.totalPoints,
      badges: earnedBadges,
    };
  }

  /**
   * Award points to user
   */
  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    this.logger.log(`Awarded ${points} points to user ${userId}: ${reason}`);

    await this.prisma.millionProfile.upsert({
      where: { userId },
      update: { totalPoints: { increment: points } },
      create: {
        userId,
        displayName: 'Student', // Default or fetch user name
        totalPoints: points,
      },
    });
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeId: string): Promise<Badge | null> {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return null;

    try {
      const achievement = await this.prisma.achievement.upsert({
        where: { key: badge.id },
        update: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          xpReward: badge.points,
          category: 'gamification',
        },
        create: {
          key: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          xpReward: badge.points,
          category: 'gamification',
        },
      });

      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        update: {},
        create: {
          userId,
          achievementId: achievement.id,
        },
      });

      this.logger.log(`Awarded badge ${badgeId} to user ${userId}`);
      return badge;
    } catch (error) {
      this.logger.error(`Failed to award badge ${badgeId} to user ${userId}`, error);
      return null;
    }
  }

  /**
   * Check and award eligible badges
   */
  async checkBadges(
    userId: string,
    stats: Record<string, number>,
  ): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];

    for (const badge of BADGES) {
      const earned = this.checkBadgeRequirement(badge.requirement, stats);
      if (earned) {
        const awarded = await this.awardBadge(userId, badge.id);
        if (awarded) earnedBadges.push(awarded);
      }
    }

    return earnedBadges;
  }

  private checkBadgeRequirement(
    requirement: string,
    stats: Record<string, number>,
  ): boolean {
    // Simple requirement parser
    const match = requirement.match(/(\w+)\s*(>=|<=|>|<|==)\s*(\d+)/);
    if (!match) return false;

    const [, field, operator, valueStr] = match;
    const statValue = stats[field] || 0;
    const requiredValue = parseInt(valueStr);

    switch (operator) {
      case '>=':
        return statValue >= requiredValue;
      case '<=':
        return statValue <= requiredValue;
      case '>':
        return statValue > requiredValue;
      case '<':
        return statValue < requiredValue;
      case '==':
        return statValue === requiredValue;
      default:
        return false;
    }
  }
}
