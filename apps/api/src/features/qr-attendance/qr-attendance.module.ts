import { Module } from '@nestjs/common';
import { QrAttendanceController } from './qr-attendance.controller';
import { QrAttendanceService } from './qr-attendance.service';
import { PrismaService } from '../../prisma.service';

/**
 * QR Attendance Module
 *  Handles QR code-based attendance tracking
 */
@Module({
  controllers: [QrAttendanceController],
  providers: [QrAttendanceService, PrismaService],
  exports: [QrAttendanceService],
})
export class QRAttendanceModule {}
