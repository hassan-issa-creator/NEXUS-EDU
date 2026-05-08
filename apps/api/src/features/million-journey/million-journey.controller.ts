import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { MillionJourneyService } from './million-journey.service';
import { JwtAuthGuard } from '../../infrastructure/guards/auth.guard';

@Controller('student/million-journey')
@UseGuards(JwtAuthGuard)
export class MillionJourneyController {
  constructor(private readonly journeyService: MillionJourneyService) {}

  @Get('milestones')
  async getMilestones() {
    const data = await this.journeyService.getMilestones();
    return { success: true, data };
  }

  @Get('progress')
  async getMyProgress(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const data = await this.journeyService.getUserProgress(userId);
    return { success: true, data };
  }

  @Post('check-unlocks')
  async checkUnlocks(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const data = await this.journeyService.checkAndUnlockMilestones(userId);
    return { success: true, message: 'Checked for new milestones', newlyUnlocked: data };
  }
}
