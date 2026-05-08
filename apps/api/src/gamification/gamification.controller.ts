import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';

@Controller('gamification')
@UseGuards(AuthGuard('jwt'))
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  async getLeaderboard(
    @Query('scope') scope: 'national' | 'school' | 'classroom' = 'national',
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.gamificationService.getLeaderboard(scope, entityId, parsedLimit);
  }

  @Get('rank')
  async getUserRank(@Request() req: any) {
    return this.gamificationService.getUserRank(req.user.userId);
  }
}
