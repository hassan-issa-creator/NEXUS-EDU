import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Class Sessions')
@Controller('classes/:classId/sessions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClassSessionAttendanceController {
  constructor(private readonly sessionService: ClassSessionService) {}

  @Post(':sessionId/attendance')
  @ApiOperation({ summary: 'Mark student attendance for session' })
  async markAttendance(
    @Param('classId') classId: string,
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    return this.sessionService.markAttendance(sessionId, req.user.id);
  }
}
