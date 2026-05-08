import { Module } from '@nestjs/common';
import { TeacherAutomationController } from './teacher-automation.controller';
import { TeacherAutomationService } from './teacher-automation.service';
import { PrismaService } from '../../prisma.service';

/**
 * Teacher Automation Module
 * Handles automated rules and workflows for teachers
 */
@Module({
  controllers: [TeacherAutomationController],
  providers: [TeacherAutomationService, PrismaService],
  exports: [TeacherAutomationService],
})
export class TeacherAutomationModule {}
