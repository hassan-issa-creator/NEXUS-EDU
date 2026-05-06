import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MillionSimpleService } from './million-simple.service';

@Controller('million')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class MillionSimpleController {
  constructor(private readonly millionService: MillionSimpleService) {}

  /**
   * Get student score and rank
   * GET /api/million/score/:userId
   */
  @Get('score/:userId')
  async getScore(@Param('userId') userId: string) {
    const profile = await this.millionService.getProfile(userId);
    const rank = await this.millionService.getRank(userId);
    const total = await this.millionService.getTotalStudents();
    const recentScores = await this.millionService.getRecentScores(userId, 7);

    return {
      success: true,
      data: {
        profile,
        rank,
        total,
        recentScores,
      },
    };
  }

  /**
   * Get leaderboard
   * GET /api/million/leaderboard?limit=10
   */
  @Get('leaderboard')
  async getLeaderboard(@Param('limit') limit: string = '10') {
    const leaderboard = await this.millionService.getLeaderboard(
      parseInt(limit),
    );

    return {
      success: true,
      data: leaderboard,
    };
  }

  /**
   * Add score for student
   * POST /api/million/score
   */
  @Post('score')
  async addScore(
    @Body()
    dto: {
      userId: string;
      attendance?: number;
      assignments?: number;
      exams?: number;
      participation?: number;
    },
  ) {
    const score = await this.millionService.addScore(dto);

    return {
      success: true,
      message: 'Score added successfully',
      data: score,
    };
  }

  /**
   * Recalculate total points for a student
   * POST /api/million/recalculate/:userId
   */
  @Post('recalculate/:userId')
  async recalculate(@Param('userId') userId: string) {
    const profile = await this.millionService.recalculateTotalPoints(userId);

    return {
      success: true,
      message: 'Points recalculated',
      data: profile,
    };
  }
}
