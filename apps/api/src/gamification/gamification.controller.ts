import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard', description: 'جلب لوحة الشرف' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of entries',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
  })
  async getLeaderboard(
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
  ) {
    return this.gamificationService.getLeaderboard(limit || 10, classId);
  }

  @Get('badges')
  @ApiOperation({
    summary: 'Get all badges',
    description: 'جلب جميع الشارات المتاحة',
  })
  @ApiResponse({ status: 200, description: 'Badges retrieved successfully' })
  getBadges() {
    return this.gamificationService.getBadges();
  }

  @Get('user/:userId/rank')
  @ApiOperation({ summary: 'Get user rank', description: 'جلب ترتيب المستخدم' })
  @ApiResponse({ status: 200, description: 'User rank retrieved successfully' })
  async getUserRank(@Param('userId') userId: string) {
    return this.gamificationService.getUserRank(userId);
  }
}
