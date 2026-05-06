import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MillionSimpleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create profile for user
   */
  async getProfile(userId: string) {
    let profile = await this.prisma.millionProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if doesn't exist
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      profile = await this.prisma.millionProfile.create({
        data: {
          userId,
          displayName: user?.firstName || `User-${userId.substring(0, 8)}`,
          totalPoints: 0,
          currentLevel: 'Beginner',
        },
      });
    }

    return profile;
  }

  /**
   * Get student rank
   */
  async getRank(userId: string): Promise<number> {
    const profile = await this.getProfile(userId);

    // Count profiles with higher points
    const higher = await this.prisma.millionProfile.count({
      where: {
        totalPoints: { gt: profile.totalPoints },
      },
    });

    return higher + 1;
  }

  /**
   * Get total number of students
   */
  async getTotalStudents(): Promise<number> {
    return await this.prisma.millionProfile.count();
  }

  /**
   * Get recent scores for student
   */
  async getRecentScores(userId: string, limit: number = 7) {
    const profile = await this.getProfile(userId);

    return await this.prisma.millionScore.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  /**
   * Add score for student
   */
  async addScore(dto: {
    userId: string;
    attendance?: number;
    assignments?: number;
    exams?: number;
    participation?: number;
  }) {
    const profile = await this.getProfile(dto.userId);

    const attendance = dto.attendance || 0;
    const assignments = dto.assignments || 0;
    const exams = dto.exams || 0;
    const participation = dto.participation || 0;
    const total = attendance + assignments + exams + participation;

    const score = await this.prisma.millionScore.create({
      data: {
        profileId: profile.id,
        attendance,
        assignments,
        exams,
        participation,
        total,
      },
    });

    // Recalculate total points
    await this.recalculateTotalPoints(dto.userId);

    return score;
  }

  /**
   * Recalculate total points for student
   */
  async recalculateTotalPoints(userId: string) {
    const profile = await this.getProfile(userId);

    // Sum all scores
    const sum = await this.prisma.millionScore.aggregate({
      where: { profileId: profile.id },
      _sum: { total: true },
    });

    const totalPoints = sum._sum.total || 0;

    // Determine level based on points
    let currentLevel = 'Beginner';
    if (totalPoints >= 10000) currentLevel = 'Expert';
    else if (totalPoints >= 5000) currentLevel = 'Advanced';
    else if (totalPoints >= 2000) currentLevel = 'Intermediate';
    else if (totalPoints >= 500) currentLevel = 'Learner';

    return await this.prisma.millionProfile.update({
      where: { id: profile.id },
      data: {
        totalPoints,
        currentLevel,
      },
    });
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10) {
    return await this.prisma.millionProfile.findMany({
      orderBy: { totalPoints: 'desc' },
      take: limit,
    });
  }
}
