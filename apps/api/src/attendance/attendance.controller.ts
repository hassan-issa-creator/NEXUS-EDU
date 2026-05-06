import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendanceController {
  @Get()
  @Roles(Role.STUDENT, Role.PARENT)
  async getAttendance(@Request() req: any) {
    const userId = req.user.sub || req.user.id;

    // Mock data
    return {
      summary: {
        present: 42,
        absent: 3,
        late: 2,
        totalDays: 47,
        attendanceRate: 89.3,
      },
      weeklyOverview: [
        { day: 'Mon', status: 'Present', date: '2024-12-02' },
        { day: 'Tue', status: 'Present', date: '2024-12-03' },
        { day: 'Wed', status: 'Late', date: '2024-12-04' },
        { day: 'Thu', status: 'Present', date: '2024-12-05' },
        { day: 'Fri', status: 'Absent', date: '2024-12-06' },
      ],
      history: [
        { date: '2024-12-01', status: 'Present', subject: 'Math' },
        { date: '2024-12-01', status: 'Present', subject: 'Physics' },
        { date: '2024-11-30', status: 'Absent', subject: 'Chemistry' },
      ],
    };
  }
}
