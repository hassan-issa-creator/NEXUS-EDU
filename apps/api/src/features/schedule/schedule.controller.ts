import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../../infrastructure/guards/auth.guard';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('my')
  async getMySchedule(@Req() req: any) {
    const user = req.user;
    const userId = user.sub || user.id;
    let data;

    if (user.role === 'TEACHER') {
      data = await this.scheduleService.getTeacherSchedule(userId);
    } else {
      data = await this.scheduleService.getStudentSchedule(userId);
    }

    return { success: true, data };
  }
}
