import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { QrAttendanceService } from './qr-attendance.service';
import { JwtAuthGuard } from '../../infrastructure/guards/auth.guard';

@Controller('attendance/qr')
@UseGuards(JwtAuthGuard)
export class QrAttendanceController {
  constructor(private readonly qrService: QrAttendanceService) {}

  @Get('sessions')
  async getMySessions(@Req() req: any) {
    const teacherId = req.user.sub || req.user.id;
    const data = await this.qrService.getTeacherSessions(teacherId);
    return { success: true, data };
  }

  @Post('sessions')
  async createSession(@Req() req: any, @Body() body: { classId: string; durationMinutes?: number }) {
    const teacherId = req.user.sub || req.user.id;
    const data = await this.qrService.createSession(teacherId, body.classId, body.durationMinutes);
    return { success: true, message: 'QR Session created', data };
  }

  @Get('sessions/:id')
  async getSessionDetails(@Req() req: any, @Param('id') id: string) {
    const teacherId = req.user.sub || req.user.id;
    const data = await this.qrService.getSessionDetails(id, teacherId);
    return { success: true, data };
  }

  @Put('sessions/:id/deactivate')
  async deactivateSession(@Req() req: any, @Param('id') id: string) {
    const teacherId = req.user.sub || req.user.id;
    const data = await this.qrService.deactivateSession(id, teacherId);
    return { success: true, message: 'Session deactivated', data };
  }

  @Post('scan')
  async scanQrCode(@Req() req: any, @Body() body: { qrCode: string }) {
    const studentId = req.user.sub || req.user.id;
    const data = await this.qrService.scanQrCode(studentId, body.qrCode);
    return { success: true, ...data };
  }
}
