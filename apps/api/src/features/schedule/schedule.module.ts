import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../../prisma.service';

/**
 * Timetable Module
 * Handles timetables for students and teachers
 */
@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService],
  exports: [ScheduleService],
})
export class TimetableModule {}
