import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(Role.STUDENT, Role.PARENT)
  async getAttendance(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.attendanceService.getMyAttendance(userId);
  }
}
